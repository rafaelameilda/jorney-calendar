<template>
  <div class="subcontent">
    <div class="row justify-center">
      <q-btn label="Hoje" @click="goToToday" />
      <q-btn label="Voltar" @click="prevMonth" />
      <q-btn label="Avançar" @click="nextMonth" />
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

    <div class="row justify-center">
      <span class="text-h6">{{ formattedMonth() }}</span>
    </div>

    <div class="row justify-center">
      <q-calendar
        v-model="currentDate"
        :view="calendarView"
        :mode="calendarMode"
        @click-date="onDayClick"
        locale="pt-BR"
        :hoverable="hoverable"
        :focusable="focusable"
        :focus-type="focusType"
        month-label-size="md"
      />
    </div>

    <q-dialog v-model="showModal">
      <q-card>
        <q-card-section>
          <div class="text-h6">Data Selecionada</div>
          <div>{{ selectedDate }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Fechar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { DateTime } from "luxon";

export default defineComponent({
  setup() {
    const currentDate = ref(DateTime.now().toISODate());
    const calendarMode = ref("month"); // Opções: 'day', 'month', 'agenda'
    const calendarView = ref("month"); // Opções: 'day', 'week', 'month'
    const selectedDate = ref(null);
    const showModal = ref(false);

    const hoverable = ref(true);
    const focusable = ref(true);
    const focusType = ref(["day", "weekday", "date"]);

    const formattedMonth = () => {
      return DateTime.fromISO(currentDate.value)
        .setLocale("pt-BR")
        .toFormat("MMMM yyyy");
    };

    const onDayClick = (day) => {
      selectedDate.value = day;
      showModal.value = true;
    };

    const nextMonth = () => {
      currentDate.value = DateTime.fromISO(currentDate.value)
        .plus({ months: 1 })
        .toISODate();
    };

    const prevMonth = () => {
      currentDate.value = DateTime.fromISO(currentDate.value)
        .minus({ months: 1 })
        .toISODate();
    };

    const goToToday = () => {
      currentDate.value = DateTime.now().toISODate();
    };

    return {
      currentDate,
      focusType,
      focusable,
      hoverable,
      calendarMode,
      calendarView,
      formattedMonth,
      onDayClick,
      showModal,
      selectedDate,
      nextMonth,
      prevMonth,
      goToToday,
    };
  },
});
</script>
