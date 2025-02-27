<template>
  <q-page>
    <q-btn-toggle
      v-model="selectedInterval"
      :options="intervalOptions"
      color="primary"
      @update:model-value="updateChartData"
    />
    <VueApexCharts width="400px" :options="chartOptions" :series="series" type="bar" height="350" />
    <VueApexCharts width="400px" :options="chartOptions2" :series="series2" type="donut" height="350" />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

const selectedInterval = ref('month');
const intervalOptions = [
  { label: 'День', value: 'day' },
  { label: 'Неделя', value: 'week' },
  { label: 'Месяц', value: 'month' }
];

const series = ref([{ name: 'Продажи', data: [100, 200, 300, 400, 500] }]);
const series2 = ref([100, 200, 300, 400, 500]);

const chartOptions = ref({
  chart: { type: 'bar' },
  plotOptions: { bar: { horizontal: true } },
  xaxis: { categories: ['Янв', 'Фев', 'Март', 'Апр', 'Май'] }
});

const chartOptions2 = ref({
  chart: { type: 'donut' },
  labels: ['max', 'min', 'leo', 'nac', 'xuz']
});

const updateChartData = () => {
  if (selectedInterval.value === 'day') {
    series.value = [{ name: 'Продажи', data: [10, 20, 15, 30, 25] }];
    chartOptions.value.xaxis.categories = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
  } else if (selectedInterval.value === 'week') {
    series.value = [{ name: 'Продажи', data: [300, 450, 600, 750, 900] }];
    chartOptions.value.xaxis.categories = ['1-я', '2-я', '3-я', '4-я', '5-я'];
  } else {
    series.value = [{ name: 'Продажи', data: [100, 200, 300, 400, 500] }];
    chartOptions.value.xaxis.categories = ['Янв', 'Фев', 'Март', 'Апр', 'Май'];
  }
};
</script>
