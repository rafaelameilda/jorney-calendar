<template>
  <div class="subcontent">
    <div class="row justify-center">
      <q-btn label="Hoje" @click="onToday" />
      <q-btn label="Voltar" @click="onPrev" />
      <q-btn label="Avançar" @click="onNext" />
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
          hoverable
          :focus-type="['day', 'weekday', 'date']"
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
                class="row justify-start items-center no-wrap my-event"
              >
                <q-icon v-if="event?.icon" :name="event.icon" class="q-mr-xs" />
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
  parseDate,
} from "@quasar/quasar-ui-qcalendar";
import "@quasar/quasar-ui-qcalendar/index.css";
import { ref, reactive, computed } from "vue";
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
  duration?: number;
  bgColor?: string;
  icon?: string;
  days?: number;
}

const calendar = ref<QCalendarMonth>();
const selectedDate = ref(today());
const selectedMonth = reactive<Timestamp[]>([]);
const year = ref(new Date().getFullYear());
const country = ref("BR"); // start with Brazil
const countryCodes: Record<string, string> = { BR: "pt-BR" }; // 'Brasil', Portuguese (Brazil)
const locale = computed(() => countryCodes[country.value]);

const formattedMonth = computed(() => {
  const date = new Date(selectedDate.value);
  const formatter = monthFormatter();
  return formatter ? formatter.format(date) + " " + date.getFullYear() : "";
});

const monthFormatter = () => {
  try {
    return new Intl.DateTimeFormat(locale?.value, {
      month: "long",
      timeZone: "UTC",
    });
  } catch {
    //
  }
};

const holidaysMap = computed<Holiday[]>(() => {
  // get previous, current and next year so in dec/jan
  // you can see holidays from different years
  return [
    ...new Holidays(country.value).getHolidays(year.value - 1),
    ...new Holidays(country.value).getHolidays(year.value),
    ...new Holidays(country.value).getHolidays(year.value + 1),
  ];
});

const getColor = (item: { type: string }) => {
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
};

const CURRENT_DAY = new Date();
function getCurrentDay(day: number) {
  const newDay = new Date(CURRENT_DAY);
  newDay.setDate(day);
  const tm = parseDate(newDay);
  return tm!.date;
}

const events = reactive<Event[]>([
  {
    id: 1,
    title: "Rafael Almeida",
    details: "Esta de plantão na rota XYZ",
    date: getCurrentDay(1),
    bgColor: "orange",
  },
  {
    id: 2,
    title: "Rafael Almeida",
    details: "Esta de plantão na rota XYZ",
    date: getCurrentDay(4),
    bgColor: "orange",
    icon: "fas fa-birthday-cake",
  },
  {
    id: 3,
    title: "Rafael Almeida",
    details: "Esta de plantão na rota XYZ",
    date: getCurrentDay(10),
    time: "10:00",
    duration: 120,
    bgColor: "orange",
    icon: "fas fa-handshake",
  },
  {
    id: 4,
    title: "Lunch",
    details: "Company is paying!",
    date: getCurrentDay(10),
    time: "11:30",
    duration: 90,
    bgColor: "teal",
    icon: "fas fa-hamburger",
  },
  {
    id: 5,
    title: "Visit mom",
    details: "Always a nice chat with mom",
    date: getCurrentDay(20),
    time: "17:00",
    duration: 90,
    bgColor: "grey",
    icon: "fas fa-car",
  },
  {
    id: 6,
    title: "Conference",
    details: "Teaching Javascript 101",
    date: getCurrentDay(22),
    time: "08:00",
    duration: 540,
    bgColor: "blue",
    icon: "fas fa-chalkboard-teacher",
  },
  {
    id: 7,
    title: "Girlfriend",
    details: "Meet GF for dinner at Swanky Restaurant",
    date: getCurrentDay(4),
    time: "19:00",
    duration: 180,
    bgColor: "teal",
    icon: "fas fa-utensils",
  },
  {
    id: 8,
    title: "Rowing",
    details: "Stay in shape!",
    date: getCurrentDay(4),
    bgColor: "purple",
    icon: "rowing",
    days: 2,
  },
  {
    id: 9,
    title: "Fishing",
    details: "Time for some weekend R&R",
    date: getCurrentDay(4),
    bgColor: "purple",
    icon: "fas fa-fish",
    days: 2,
  },
  {
    id: 10,
    title: "Vacation - Rafael",
    details:
      "Trails and hikes, going camping! Don't forget to bring bear spray!",
    date: getCurrentDay(1),
    bgColor: "purple",
    icon: "fas fa-plane",
    days: 5,
  },
]);

// Função para obter feriados formatados como eventos
const getHolidays = (): Event[] => {
  if (selectedMonth.length === 0) return [];

  const start = selectedMonth[0];
  const end = selectedMonth[selectedMonth.length - 1];

  return holidaysMap.value
    .filter((item) => {
      const timestamp = parseTimestamp(PARSE_DATE.exec(item.date)![0]);
      return isBetweenDates(timestamp!, start!, end!);
    })
    .map((item, index) => ({
      id: index,
      title: item.name,
      details: item.type,
      date: PARSE_DATE.exec(item.date)![0],
      bgColor: getColor(item),
      days: 1,
    }));
};

// Função para obter os eventos normais
const getEvents = (): Event[] => {
  return events;
};

const eventsMap = computed<Record<string, Event[]>>(() => {
  const map: Record<string, Event[]> = {};

  const allEvents = [...getEvents(), ...getHolidays()];

  allEvents.forEach((event) => {
    (map[event.date] = map[event.date] || []).push(event);

    if (event.days !== undefined) {
      let timestamp = parseTimestamp(event.date);
      let days = event.days;

      while (--days > 0) {
        timestamp = addToDate(timestamp!, { day: 1 });
        if (!map[timestamp.date]) {
          map[timestamp.date] = [];
        }
        map[timestamp.date]!.push(event);
      }
    }
  });

  return map;
});

const badgeClasses = (event: Event, _type: string) => {
  return {
    [`text-white bg-${event.bgColor}`]: true,
    "rounded-border": true,
  };
};

const onToday = () => calendar.value?.moveToToday();
const onPrev = () => calendar.value?.prev();
const onNext = () => calendar.value?.next();
const onMoved = (data: Timestamp) => console.log("onMoved", data);
const onClickDate = (data: Timestamp) => console.log("onClickDate", data);
const onClickDay = (data: Timestamp) => console.log("onClickDay", data);
const onClickHeadDay = (data: Timestamp) => console.log("ClickHeadDay", data);
const onClickWorkweek = (data: Timestamp) => console.log("onWorkweek", data);
const onClickHeadWorkweek = (data: Timestamp) =>
  console.log("headWorkweek", data);

function onChange(data: {
  start: Timestamp;
  end: Timestamp;
  days: Timestamp[];
}) {
  console.info("onChange", data);
  // get year of 1st of the month
  selectedMonth.splice(0, selectedMonth.length, ...data.days);
}
</script>

<style lang="scss" scoped>
.my-event {
  position: relative;
  font-size: 12px;
  width: 100%;
  max-width: 100%;
  margin: 1px 0 0 0;
  padding: 0 2px;
  justify-content: start;
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
}
</style>
