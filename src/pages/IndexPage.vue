<template>
  <q-page class="q-pa-md">
    <div class="q-gutter-md row">
      <!-- ИНН -->
      <q-select
        dense clearable filled
        v-model="modelInn"
        use-input input-debounce="0"
        label="Введите ваш ИНН"
        :options="optionsInn"
        @filter="filterInnFn"
        style="width: 250px"
      />

      <!-- Котировочная сессия -->
      <q-select
        dense clearable filled
        v-model="modelCs"
        use-input input-debounce="0"
        label="Котировочная сессия"
        :options="optionsCs"
        @filter="filterCsFn"
        style="width: 250px"
      />

      <!-- Заказчик -->
      <q-select
        dense clearable filled
        v-model="modelCustomers"
        use-input input-debounce="0"
        label="Заказчик"
        :options="optionsCustomers"
        @filter="filterCustomersFn"
        style="width: 250px"
      />

      <!-- Дата начала -->
      <q-input filled dense v-model="startDate" label="Дата начала" style="width: 250px" readonly>
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="startDate" minimal />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <!-- Дата окончания -->
      <q-input filled dense v-model="endDate" label="Дата окончания" style="width: 250px" readonly>
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="endDate" minimal />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <!-- КПГЗ -->
      <q-select
        dense clearable filled
        v-model="modelKpgz"
        use-input input-debounce="0"
        label="КПГЗ"
        :options="optionsKpgz"
        @filter="filterKpgzFn"
        style="width: 250px"
      />

      <!-- Сумма от -->
      <q-input filled dense v-model="modelStartSum" label="Сумма от:" style="width: 250px" />

      <!-- Сумма до -->
      <q-input filled dense v-model="modelEndSum" label="Сумма до:" style="width: 250px" />

      <!-- Город -->
      <q-select
        dense clearable filled
        v-model="modelCity"
        use-input input-debounce="0"
        label="Город"
        :options="optionsCity"
        @filter="filterCityFn"
        style="width: 250px"
      />

      <!-- Моё участие -->
      <q-select
        dense clearable filled
        v-model="modelMe"
        use-input input-debounce="0"
        label="Моё участие"
        :options="optionsMe"
        style="width: 250px"
      />

      <!-- Победа в сессии -->
      <q-select
        dense clearable filled
        v-model="modelWin"
        use-input input-debounce="0"
        label="Победа в сессии"
        :options="optionsWin"
        style="width: 250px"
      />

      <!-- Кнопка -->
      <q-btn label="Получить данные" color="primary" @click="collectData" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";

// Опции выбора
const optionsInn = ref(["502712783616", "7721663977"]);
const optionsCs = ref(["11.03.02", "12.03.02"]);
const optionsCustomers = ref(["Google", "Facebook"]);
const optionsKpgz = ref(["01.01.01.01.01", "01.01.01.01.03"]);
const optionsCity = ref(["Москва", "Санкт-Петербург"]);
const optionsMe = ref(["Участвовал", "Не участвовал"]);
const optionsWin = ref(["Да", "Нет"]);

// Переменные модели
const modelInn = ref<string | null>(null);
const modelCs = ref<string | null>(null);
const modelCustomers = ref<string | null>(null);
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
const modelKpgz = ref<string | null>(null);
const modelStartSum = ref<string | null>(null);
const modelEndSum = ref<string | null>(null);
const modelCity = ref<string | null>(null);
const modelMe = ref<string | null>(null);
const modelWin = ref<string | null>(null);

// Фильтрация поиска в select
const filterFn = (val: string, update: (callback: () => void) => void, options: string[]) => {
  update(() => {
    const needle = val.toLowerCase();
    optionsInn.value = options.filter(v => v.toLowerCase().includes(needle));
  });
};

const filterInnFn = (val: string, update: (callback: () => void) => void) => filterFn(val, update, optionsInn.value);
const filterCsFn = (val: string, update: (callback: () => void) => void) => filterFn(val, update, optionsCs.value);
const filterCustomersFn = (val: string, update: (callback: () => void) => void) => filterFn(val, update, optionsCustomers.value);
const filterKpgzFn = (val: string, update: (callback: () => void) => void) => filterFn(val, update, optionsKpgz.value);
const filterCityFn = (val: string, update: (callback: () => void) => void) => filterFn(val, update, optionsCity.value);

// Функция для GET-запроса
const collectData = async () => {
  const allData = {
    kpgz_code: modelKpgz.value,
    winner_region: modelCity.value,
    start_date: startDate.value,
    end_date: endDate.value,
    inn: modelInn.value,
    do: modelMe.value,
    min_price: modelStartSum.value,
    max_price: modelEndSum.value,
    customers: modelCustomers.value,
    win: modelWin.value,
  };

  // Удаление null/undefined значений
  const params = new URLSearchParams();
  Object.entries(allData).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.append(key, value.toString());
    }
  });

  const url = `https://moscow-portal.ru.tuna.am/customers/config/?${params.toString()}`;

  console.log("Запрос:", url);

  try {
    const response = await axios.get(url);
    console.log("Ответ сервера:", response.data);
  } catch (error) {
    console.error("Ошибка запроса:", error);
  }
};
</script>
