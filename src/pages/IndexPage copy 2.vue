<template>
  <div class="subcontent">
    <!-- <navigation-bar @today="onToday" @prev="onPrev" @next="onNext" /> -->
    <div class="row justify-center">
      <q-btn label="Hoje" @click="onToday" />
      <q-btn label="Voltar" @click="onPrev" />
      <q-btn label="Avançar" @click="onNext" />
    </div>

    <div class="q-ma-sm row justify-center q-gutter-sm">
      <q-select
        v-model="calendarMode"
        label="Calendar Mode"
        outlined
        dense
        options-dense
        :options="['day', 'month', 'agenda']"
        style="min-width: 180px"
      />
      <q-select
        v-model="calendarView"
        label="Calendar View"
        outlined
        dense
        options-dense
        :options="['day', 'week', 'month']"
        style="min-width: 180px"
      />
    </div>

    <div class="q-ma-sm row justify-center q-gutter-sm">
      <q-select
        v-model="country"
        label="Pick a Country"
        outlined
        dense
        options-dense
        map-options
        emit-value
        :options="countriesList"
        style="min-width: 320px"
        :view="calendarView"
        :mode="calendarMode"
      />
    </div>

    <div
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: nowrap;
      "
    >
      <div class="q-ma-md" style="font-size: 2em">{{ formattedMonth }}</div>
    </div>

    <div class="row justify-center">
      <div style="display: flex; width: 100%">
        <q-calendar-month
          ref="calendar"
          v-model="selectedDate"
          animated
          bordered
          focusable
          :focus-type="focusType"
          hoverable
          :day-min-height="60"
          :day-height="0"
          :locale="locale"
          @change="onChange"
          @moved="onMoved"
          @click-date="onClickDate"
          @click-day="onClickDay"
          @click-workweek="onClickWorkweek"
          @click-head-workweek="onClickHeadWorkweek"
          @click-head-day="onClickHeadDay"
        >
          <template #day="{ scope: { timestamp } }">
            <template
              v-for="event in eventsMap[timestamp.date]"
              :key="event.id"
            >
              <div
                :class="badgeClasses(event, 'day')"
                :style="badgeStyles(event, 'day')"
                class="my-event"
              >
                <div class="title q-calendar__ellipsis">
                  {{ event.title + (event.time ? " - " + event.time : "") }}
                  <q-tooltip>{{
                    event.details +
                    ": " +
                    event.title +
                    (event.time ? " - " + event.time : "")
                  }}</q-tooltip>
                </div>
              </div>
            </template>
          </template>
        </q-calendar-month>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  QCalendarMonth,
  /// @ts-expect-error ignore for now
  PARSE_DATE, // regex for parsing out date
  addToDate,
  parseTimestamp,
  today,
  isBetweenDates,
  Timestamp,
} from "@quasar/quasar-ui-qcalendar";
import "@quasar/quasar-ui-qcalendar/index.css";

import { ref, reactive, computed } from "vue";
// import NavigationBar from "components/NavigationBar.vue";
import Holidays from "date-holidays";

interface Holiday {
  date: string;
  start: Date;
  end: Date;
  name: string;
  type: string;
  rule: string;
  substitute?: boolean;
}

interface Event {
  id: number;
  title: string;
  details: string;
  date: string;
  time?: string;
  bgColor: string;
  days?: number;
}

const calendar = ref<QCalendarMonth>(),
  hd = new Holidays(),
  countries = hd.getCountries(),
  selectedDate = ref(today()),
  selectedMonth = reactive<Timestamp[]>([]),
  year = ref(new Date().getFullYear()),
  country = ref("BR"), // start with Canada
  // map the holiday contry codes to actual ISO 639-1 locale codes
  // so the calendar can show the correct language
  countryCodes: Record<string, string> = {
    AD: "ca", // 'Andorra', Catalan
    AE: "ar", // 'دولة الإمارات العربية المتحدة', Arabic
    AG: "en", // 'Antigua & Barbuda', English
    BR: "pt-BR", // 'Brasil', Portuguese (Brazil)
  };

const calendarMode = ref("month"); // Opções: 'day', 'month', 'agenda'
const calendarView = ref("month"); // Opções: 'day', 'week', 'month'
const focusType = ref(["day", "weekday", "date"]);

const countriesList = computed(() => {
  return Object.keys(countries).map((key) => {
    return { label: countries[key], value: key };
  });
});

// console.info(countriesList.value)

const locale = computed(() => {
  if (country.value) {
    return countryCodes[country.value];
  }
  return "pt-BR";
});

const formattedMonth = computed(() => {
  const date = new Date(selectedDate.value);
  const formatter = monthFormatter();
  return formatter ? formatter.format(date) + " " + date.getFullYear() : "";
});

function monthFormatter() {
  try {
    return new Intl.DateTimeFormat(locale.value || undefined, {
      month: "long",
      timeZone: "UTC",
    });
  } catch {
    //
  }
}

const holidaysMap = computed<Holiday[]>(() => {
  // get previous, current and next year so in dec/jan
  // you can see holidays from different years
  return [
    ...new Holidays(country.value).getHolidays(year.value - 1),
    ...new Holidays(country.value).getHolidays(year.value),
    ...new Holidays(country.value).getHolidays(year.value + 1),
  ];
});

function getColor(item: { type: string }) {
  switch (item.type) {
    case "public":
      return "blue";
    case "observance":
      return "green";
    case "optional":
      return "red";
    default: // bank|school
      return "orange";
  }
}

/// where the magic happens...
const eventsMap = computed(() => {
  const map: Record<string, Event[]> = {};
  if (selectedMonth.length > 0) {
    const start = selectedMonth[0];
    const end = selectedMonth[selectedMonth.length - 1];
    holidaysMap.value
      .filter((item) => {
        const timestamp = parseTimestamp(PARSE_DATE.exec(item.date)![0]);
        return isBetweenDates(timestamp!, start!, end!);
      })
      .map((item, index) => ({
        id: index,
        title: item.name,
        details: /*item.type + */ `teste`,
        date: PARSE_DATE.exec(item.date)![0],
        bgColor: getColor(item),
        days: 1,
      }))
      .forEach((event) => {
        (map[event.date] = map[event.date] || []).push(event);
        if (event.days !== undefined) {
          let timestamp = parseTimestamp(event.date);
          let days = event.days;
          // add a new event for each day, skip the first one which is already added
          while (--days > 0) {
            timestamp = addToDate(timestamp!, { day: 1 });
            if (!map[timestamp.date]) {
              map[timestamp.date] = [];
            }
            map[timestamp.date]!.push(event);
          }
        }
      });
  }
  return map;
});

function badgeClasses(event: Event, _type: string) {
  return {
    [`text-white bg-${event.bgColor}`]: true,
    "rounded-border": true,
  };
}

function badgeStyles(_event: Event, _type: string) {
  const s = {};
  // s.left = day.weekday === 0 ? 0 : (day.weekday * parsedCellWidth) + '%'
  // s.top = 0
  // s.bottom = 0
  // s.width = (event.days * parsedCellWidth) + '%'
  return s;
}

function onToday() {
  if (calendar.value) {
    calendar.value.moveToToday();
  }
}
function onPrev() {
  if (calendar.value) {
    calendar.value.prev();
  }
}
function onNext() {
  if (calendar.value) {
    calendar.value.next();
  }
}
function onMoved(data: Timestamp) {
  console.info("onMoved", data);
}
function onChange(data: {
  start: Timestamp;
  end: Timestamp;
  days: Timestamp[];
}) {
  console.info("onChange", data);
  selectedMonth.splice(0, selectedMonth.length, ...data.days);
  // get year of 1st of the month
  for (let index = 0; index < selectedMonth.length; ++index) {
    if (selectedMonth[index]!.day === 1) {
      year.value = selectedMonth[index]!.year;
      break;
    }
  }
}
function onClickDate(data: Timestamp) {
  console.info("onClickDate", data);
}
function onClickDay(data: Timestamp) {
  console.info("onClickDay", data);
}
function onClickWorkweek(data: Timestamp) {
  console.info("onClickWorkweek", data);
}
function onClickHeadDay(data: Timestamp) {
  console.info("onClickHeadDay", data);
}
function onClickHeadWorkweek(data: Timestamp) {
  console.info("onClickHeadWorkweek", data);
}
</script>

<style lang="scss" scoped>
.my-event {
  position: relative;
  font-size: 12px;
  width: 100%;
  margin: 1px 0 0 0;
  justify-content: center;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
}

.my-event .title {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  max-width: 100%;
  width: 100%;
}

.text-white {
  color: white;
}

.bg-blue {
  background: blue;
}

.bg-green {
  background: green;
}

.bg-orange {
  background: orange;
}

.bg-red {
  background: red;
}

.bg-teal {
  background: teal;
}

.bg-grey {
  background: grey;
}

.bg-purple {
  background: purple;
}

.rounded-border {
  border-radius: 2px;
}
</style>
