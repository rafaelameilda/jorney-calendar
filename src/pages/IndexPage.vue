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

    <div style="display: flex; justify-content: center">
      <div class="q-ma-md" style="font-size: 2em">{{ formattedMonth }}</div>
    </div>

    <q-card-section style="display: flex; width: 100%">
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
        @click-date="onClickDate"
      >
        <template #day="{ scope: { timestamp } }">
          <template v-for="event in eventsMap[timestamp.date]" :key="event.id">
            <q-chip
              @click="
                handleClickEvent({ ...event, weekday: timestamp.weekday })
              "
              outline
              clickable
              class="my-event"
              :color="event.bgColor"
              :icon="event?.icon || 'event'"
            >
              <div class="q-calendar__ellipsis">
                {{ event.title }}
                <q-tooltip>{{ event.details + ": " + event.hours }} </q-tooltip>
              </div>
            </q-chip>
          </template>
        </template>
      </q-calendar-month>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-table
        :rows="groupedEventsList"
        :columns="[
          { name: 'title', label: 'Nome', field: 'title', align: 'left' },
          {
            name: 'totalWeek',
            label: 'Total Semana',
            field: 'totalWeek',
            align: 'center',
          },
          {
            name: 'totalSaturday',
            label: 'Total Sábado',
            field: 'totalSaturday',
            align: 'center',
          },
          {
            name: 'totalSunday',
            label: 'Total Domingo',
            field: 'totalSunday',
            align: 'center',
          },
          {
            name: 'totalGeneral',
            label: 'Total Geral',
            field: 'totalGeneral',
            align: 'center',
          },
        ]"
        row-key="title"
      />
    </q-card-section>
  </q-card>

  <q-dialog v-model="isModalOpen">
    <q-card>
      <q-card-section class="bg-primary">
        <div class="text-h6 text-white">Lançar Evento</div>
        <div class="text-h8 text-white">
          Para lançar o evento/plantão informe o nome do funcionário e os
          detalhes
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form class="row q-col-gutter-xs q-pa-xs" ref="formFieldsRefModal">
          <q-input
            class="col-12 col-sm-6 col-md-12"
            v-model="newEvent.title"
            label="Nome Funcionário"
            outlined
            dense
            color="primary"
          />
          <q-input
            class="col-12 col-sm-6 col-md-12"
            v-model="newEvent.details"
            label="Detalhes do plantão"
            outlined
            dense
            color="primary"
          />
          <q-input
            class="col-12 col-sm-6 col-md-12"
            v-model.number="newEvent.days"
            label="Dias"
            outlined
            dense
            color="primary"
          />
          <q-select
            v-model="newEvent.bgColor"
            label="Cor da legenda"
            color="primary"
            outlined
            emit-value
            map-options
            dense
            class="col-12 col-sm-6 col-md-12"
            :options="[
              { label: 'Azul', value: 'blue' },
              { label: 'Ciano', value: 'cyan' },
              { label: 'Verde', value: 'green' },
              { label: 'Lima', value: 'lime' },
              { label: 'Laranja', value: 'orange' },
              { label: 'Âmbar', value: 'amber' },
              { label: 'Vermelho', value: 'red' },
              { label: 'Roxo', value: 'purple' },
              { label: 'Rosa', value: 'pink' },
              { label: 'Marrom', value: 'brown' },
              { label: 'Cinza', value: 'grey' },
              { label: 'Preto', value: 'black' },
              { label: 'Teal', value: 'teal' },
              { label: 'Indigo', value: 'indigo' },
              { label: 'Deep Orange', value: 'deep-orange' },
            ]"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon name="circle" :style="{ color: scope.opt.value }" />
                </q-item-section>
                <q-item-section>
                  {{ scope.opt.label }}
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-form>
      </q-card-section>
      <q-card-actions>
        <q-btn
          outline
          icon="far fa-window-close"
          color="negative"
          label="Cancelar"
          @click="handleCloseModal"
        />
        <q-btn
          outline
          icon="fas fa-plus-square"
          color="primary"
          label="Salvar"
          @click="addEvent"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
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
  id: string;
  title: string;
  details: string;
  date: string;
  hours: number;
  duration?: number;
  bgColor?: string;
  icon?: string;
  days?: number;
}

interface GroupedEvent {
  title: string;
  totalWeek: number;
  totalSaturday: number;
  totalSunday: number;
  totalGeneral: number;
}

const WEEKDAY: { [key: number]: string } = {
  0: "DOMINGO",
  1: "SEGUNDA",
  2: "TERCA",
  3: "QUARTA",
  4: "QUINTA",
  5: "SEXTA",
  6: "SABADO",
};

const HOURS_VALUE: { [key: string]: number } = {
  DOMINGO: 14,
  SABADO: 12,
  SEGUNDA: 8,
  TERCA: 8,
  QUARTA: 8,
  QUINTA: 8,
  SEXTA: 8,
} as const;

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
import { useQuasar, uid } from "quasar";

const calendar = ref<QCalendarMonth>();
const selectedDate = ref(DateTime.now().toISODate()); // ISO Date format YYYY-MM-DD
const selectedMonth = reactive<Timestamp[]>([]);
const country = ref("BR"); // start with Brazil
const $q = useQuasar();
const locale = computed(() => $q.lang.isoName);
const isModalOpen = ref(false);
const events = reactive<Event[]>([]);
const groupedEventsList = ref<GroupedEvent[]>([]);
const newEvent = reactive<Event>({
  title: "",
  details: "",
  date: "",
  hours: 0,
  id: "",
  days: 1,
});

// Função para obter os eventos normais
const getEvents = (): Event[] => events;

const onToday = () => calendar.value?.moveToToday();
const onPrev = () => calendar.value?.prev();
const onNext = () => calendar.value?.next();

const handleClickEvent = (event: Event & { weekday: number }) => {
  console.log("Event clicked:", event);
};

const formattedMonth = computed(() => {
  if (!locale.value) return "";

  return DateTime.fromISO(selectedDate.value)
    .setLocale(locale.value)
    .toFormat("MMMM yyyy")
    .replace(/^./, (match) => match.toLocaleUpperCase());
});

const holidaysMap = computed<Holiday[]>(() => {
  // get previous, current and next year so in dec/jan
  // you can see holidays from different years
  const holidays = new Holidays(country.value);
  const currentYear = DateTime.now().setLocale(locale.value).year;

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

const addEvent = () => {
  events.push({
    ...newEvent,
    id: uid(),
    bgColor: newEvent.bgColor || "blue",
  });

  isModalOpen.value = false;

  Object.assign(newEvent, {
    title: "",
    details: "",
    date: "",
    hours: 0,
    id: "",
    bgColor: "",
    days: 1,
  });

  updateGroupedEvents();
};

const updateGroupedEvents = () => {
  groupedEventsList.value = Object.values(
    events.reduce<Record<string, GroupedEvent>>(
      (acc, { title, date, hours, days }) => {
        const weekday = DateTime.fromISO(date).weekday; // 1 = segunda, 7 = domingo
        const entry = (acc[title] ??= {
          title,
          totalWeek: 0,
          totalSaturday: 0,
          totalSunday: 0,
          totalGeneral: 0,
        });

        const totalEventsHours = hours * (days || 1);

        if (weekday >= 1 && weekday <= 5) {
          entry.totalWeek += totalEventsHours;
        } else if (weekday === 6) {
          entry.totalSaturday += totalEventsHours;
        } else {
          entry.totalSunday += totalEventsHours;
        }

        entry.totalGeneral =
          entry.totalWeek + entry.totalSaturday + entry.totalSunday;

        return acc;
      },
      {}
    )
  );
};

const onClickDate = ({ scope }: { scope: { timestamp: Timestamp } }) => {
  const { timestamp } = scope;

  const weekdayName = WEEKDAY[timestamp.weekday] as string;
  const hours = HOURS_VALUE[weekdayName] as number;

  newEvent.hours = hours;
  newEvent.date = timestamp.date;

  isModalOpen.value = true;
};

// Função para obter feriados formatados como eventos
const getHolidays = (): Event[] => {
  if (selectedMonth.length === 0) return [];

  const start = selectedMonth[0];
  const end = selectedMonth[selectedMonth.length - 1];
  const hoursDefault = HOURS_VALUE["DOMINGO"] as number;

  return holidaysMap.value
    .filter((item) => {
      const timestamp = parseTimestamp(PARSE_DATE.exec(item.date)![0]);

      return isBetweenDates(timestamp!, start!, end!);
    })
    .map((item, index) => ({
      id: index.toString(),
      title: item.name,
      details: item.type,
      date: PARSE_DATE.exec(item.date)![0],
      bgColor: getColor(item),
      days: 1,
      hours: hoursDefault,
    }));
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

const onChange = (data: {
  start: Timestamp;
  end: Timestamp;
  days: Timestamp[];
}) => {
  // get year of 1st of the month
  selectedMonth.splice(0, selectedMonth.length, ...data.days);
};

const handleCloseModal = () => {
  isModalOpen.value = false;

  Object.assign(newEvent, {
    title: "",
    details: "",
    date: "",
    hours: 0,
    id: "",
    bgColor: "",
  });
};
</script>

<style lang="scss" scoped>
.my-event {
  position: relative;
  font-size: 12px;
  width: 100%;
  max-width: 100%;
  margin: 3px 0 0 0;
}
</style>
