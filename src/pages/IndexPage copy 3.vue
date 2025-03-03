<template>
  <div class="subcontent">
    <div class="row justify-center">
      <q-btn label="Hoje" @click="onToday" />
      <q-btn label="Voltar" @click="onPrev" />
      <q-btn label="Avançar" @click="onNext" />
    </div>

    <div class="row justify-center">
      <div style="display: flex; width: 100%">
        <q-calendar-month
          ref="calendar"
          v-model="selectedDate"
          month-label-size="md"
          date-align="right"
          bordered
          focusable
          hoverable
          :focus-type="['day', 'weekday', 'date']"
          :day-min-height="60"
          animated
          locale="BR"
          @change="onChange"
          @moved="onMoved"
          @click-date="onClickDate"
          @click-day="onClickDay"
          @click-workweek="onClickWorkweek"
          @click-head-workweek="onClickHeadWorkweek"
          @click-head-day="onClickHeadDay"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QCalendarMonth, today, Timestamp } from "@quasar/quasar-ui-qcalendar";
import "@quasar/quasar-ui-qcalendar/index.css";

import { ref } from "vue";

const calendar = ref<QCalendarMonth>(),
  selectedDate = ref(today());

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
