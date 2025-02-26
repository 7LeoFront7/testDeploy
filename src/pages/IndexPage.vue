<template>
  <q-page>
    <VueApexCharts width="400px" :options="chartOptions" :series="series" type="bar" height="350" />
    <VueApexCharts width="400px" :options="chartOptions2" :series="series2" type="donut" height="350" />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const series = ref([
  { name: 'Продажи', data: [100, 200, 300, 400, 500] }
])

const series2 = ref([100, 200, 300, 400, 500])

const chartOptions = ref({
  chart: { type: 'bar' },
  plotOptions: {
    bar: {
      horizontal: true
    }
  },
  xaxis: { categories: ['Янв', 'Фев', 'Март', 'Апр', 'Май'] }
})

const chartOptions2 = ref({
  chart: { type: 'donut' },
  labels: ['max', 'min', 'leo', 'nac', 'xuz'],
})
</script>
