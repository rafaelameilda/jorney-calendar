<template>
  <q-card>
    <div class="row justify-center q-pa-sm">
      <q-btn-group>
        <q-btn
          outline
          label="Voltar"
          icon="chevron_left"
          @click="onPrev"
          color="primary"
        />
        <q-btn
          outline
          label="Hoje"
          icon="event"
          @click="onToday"
          color="primary"
        />
        <q-btn
          outline
          label="Avançar"
          icon-right="chevron_right"
          @click="onNext"
          color="primary"
        />
      </q-btn-group>
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
          :locale="locale"
          @change="onChange"
          date-align="center"
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
              <q-chip
                outline
                class="my-event"
                :color="event.bgColor"
                :icon="event?.icon || 'event'"
              >
                <div class="q-calendar__ellipsis">
                  {{ event.title + (event.time ? " - " + event.time : "") }}
                  <q-tooltip
                    >{{ event.details + ": " + event.title }}
                  </q-tooltip>
                </div>
              </q-chip>
            </template>
          </template>
        </q-calendar-month>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
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

import {
  QCalendarMonth,
  /// @ts-expect-error ignore for now
  PARSE_DATE, // regex for parsing out date
  addToDate,
  parseTimestamp,
  isBetweenDates,
  Timestamp,
} from "@quasar/quasar-ui-qcalendar";
import "@quasar/quasar-ui-qcalendar/index.css";
import { ref, reactive, computed } from "vue";
import Holidays from "date-holidays";
import { DateTime } from "luxon";

const calendar = ref<QCalendarMonth>();
const selectedDate = ref(DateTime.now().toISODate()!); // ISO Date format YYYY-MM-DD
const selectedMonth = reactive<Timestamp[]>([]);
const country = ref("BR"); // start with Brazil
const countryCodes: Record<string, string> = { BR: "pt-BR" }; // 'Brasil', Portuguese (Brazil)
const locale = computed(() => countryCodes[country.value]);

const formattedMonth = computed(() => {
  return locale.value
    ? DateTime.fromISO(selectedDate.value)
        .setLocale(locale.value)
        .toFormat("MMMM yyyy")
        .replace(/^./, (match) => match.toLocaleUpperCase())
    : "";
});

const holidaysMap = computed<Holiday[]>(() => {
  // get previous, current and next year so in dec/jan
  // you can see holidays from different years
  const holidays = new Holidays(country.value);
  const currentYear = DateTime.now().year;

  return [
    ...holidays.getHolidays(currentYear - 1),
    ...holidays.getHolidays(currentYear),
    ...holidays.getHolidays(currentYear + 1),
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

const getCurrentDay = (day: number): string => {
  return DateTime.now().set({ day }).toFormat("yyyy-MM-dd");
};

const events = reactive<Event[]>([
  {
    id: 1,
    title: "Rafael Almeida",
    details: "Esta de plantão na rota XYZ",
    date: getCurrentDay(1),
    bgColor: "orange",
    icon: "bookmark",
  },
  {
    id: 2,
    title: "Rafael Almeida",
    details: "Esta de plantão na rota XYZ",
    date: getCurrentDay(4),
    bgColor: "orange",
    icon: "star",
  },
  {
    id: 3,
    title: "Rafael Almeida",
    details: "Esta de plantão na rota XYZ",
    date: getCurrentDay(10),
    time: "10:00",
    duration: 120,
    bgColor: "orange",
    icon: "alarm",
  },
  {
    id: 4,
    title: "Lunch",
    details: "Company is paying!",
    date: getCurrentDay(10),
    time: "11:30",
    duration: 90,
    bgColor: "teal",
    icon: "directions",
  },
  {
    id: 5,
    title: "Visit mom",
    details: "Always a nice chat with mom",
    date: getCurrentDay(20),
    time: "17:00",
    duration: 90,
    bgColor: "grey",
    icon: "directions",
  },
  {
    id: 6,
    title: "Conference",
    details: "Teaching Javascript 101",
    date: getCurrentDay(22),
    time: "08:00",
    duration: 540,
    bgColor: "blue",
    icon: "directions",
  },
  {
    id: 7,
    title: "Girlfriend",
    details: "Meet GF for dinner at Swanky Restaurant",
    date: getCurrentDay(4),
    time: "19:00",
    duration: 180,
    bgColor: "teal",
    icon: "directions",
  },
  {
    id: 8,
    title: "Rowing",
    details: "Stay in shape!",
    date: getCurrentDay(4),
    bgColor: "purple",
    icon: "directions",
    days: 2,
  },
  {
    id: 9,
    title: "Fishing",
    details: "Time for some weekend R&R",
    date: getCurrentDay(4),
    bgColor: "purple",
    icon: "directions",
    days: 200,
  },
  {
    id: 10,
    title: "Vacation - Rafael",
    details:
      "Trails and hikes, going camping! Don't forget to bring bear spray!",
    date: getCurrentDay(1),
    bgColor: "purple",
    icon: "directions",
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
const getEvents = (): Event[] => events;

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

const onToday = () => calendar.value?.moveToToday();

const navigationButton = ref(onToday);

const handleNavigationButton = () => {
  navigationButton.value();
};

const onPrev = () => calendar.value?.prev();
const onNext = () => calendar.value?.next();
const onMoved = (data: Timestamp) => console.log("onMoved", data);
const onClickDate = (data: Timestamp) => console.log("onClickDate", data);
const onClickDay = (data: Timestamp) => console.log("onClickDay", data);
const onClickHeadDay = (data: Timestamp) => console.log("ClickHeadDay", data);
const onClickWorkweek = (data: Timestamp) => console.log("onWorkweek", data);
const onClickHeadWorkweek = (data: Timestamp) => console.log("onHeadWorkweek");

const onChange = (data: {
  start: Timestamp;
  end: Timestamp;
  days: Timestamp[];
}) => {
  console.info("onChange", data);
  // get year of 1st of the month
  selectedMonth.splice(0, selectedMonth.length, ...data.days);
};
</script>

<style lang="scss" scoped>
.my-event {
  position: relative;
  font-size: 12px;
  width: 100%;
  max-width: 100%;
  margin: 3px 0 0 0;
  cursor: pointer;
}

.my-custom-toggle {
  border: 1px solid #027be3;
}
</style>
