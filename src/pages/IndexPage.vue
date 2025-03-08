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
        :loading="loadingInn"
        emit-value
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <!-- Селект сессий -->
      <q-select
        dense clearable filled
        v-model="modelCs"
        use-input input-debounce="0"
        label="Котировочная сессия"
        :options="optionsCs"
        @filter="filterCsFn"
        style="width: 250px"
        :loading="loadingCs"
        emit-value
        option-label="label"
        option-value="value"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <!-- Селект заказчиков -->
      <q-select
        dense clearable filled
        v-model="modelCustomers"
        use-input input-debounce="0"
        label="Заказчик"
        :options="optionsCustomers"
        @filter="filterCustomersFn"
        style="width: 250px"
        :loading="loadingCustomers"
        emit-value
        option-label="label"
        option-value="value"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <!-- Дата начала -->
      <q-input
        clearable
        filled dense
        v-model="startDate"
        label="Дата начала"
        style="width: 250px"
        mask="####-##-##"
        :rules="[validateDate]"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="startDate" minimal @input="formatStartDate" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <!-- Дата окончания -->
      <q-input
        clearable
        filled dense
        v-model="endDate"
        label="Дата окончания"
        style="width: 250px"
        mask="####-##-##"
        :rules="[validateDate]"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="endDate" minimal @input="formatEndDate" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-select
        dense clearable filled
        v-model="modelKpgz"
        use-input input-debounce="0"
        label="КПГЗ"
        :options="optionsKpgz"
        @filter="filterKpgzFn"
        style="width: 250px"
        :loading="loadingKpgz"
        emit-value
        option-label="label"
        option-value="value"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>

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
        emit-value
        option-label="label"
        option-value="value"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <!-- Победа в сессии -->
      <q-select
        dense clearable filled
        v-model="modelWin"
        use-input input-debounce="0"
        label="Победа в сессии"
        :options="optionsWin"
        style="width: 250px"
        emit-value
        option-label="label"
        option-value="value"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <!-- Кнопка -->
      <q-btn label="Получить данные" color="primary" @click="collectData" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

// Типы данных
interface InnItem {
  inn: string;
  org: string;
}

interface SessionItem {
  "Id КС": number;
  "Наименование заказчика": string;
}

interface CustomerItem {
  "ИНН заказчика": number;
  "Наименование заказчика": string;
}

interface KpgzItem {
  "Код КПГЗ": string;
  "Наименование КПГЗ": string;
}

// Опции выбора
const originalOptionsInn = ref<{ label: string; value: string }[]>([]); // Исходный список ИНН
const optionsInn = ref<{ label: string; value: string }[]>([]); // Отфильтрованный список ИНН

const originalOptionsCs = ref<{ label: string; value: number }[]>([]); // Исходный список сессий
const optionsCs = ref<{ label: string; value: number }[]>([]); // Отфильтрованный список сессий

const originalOptionsCustomers = ref<{ label: string; value: number }[]>([]); // Исходный список заказчиков
const optionsCustomers = ref<{ label: string; value: number }[]>([]); // Отфильтрованный список заказчиков

const originalOptionsKpgz = ref<{ label: string; value: string }[]>([]); // Исходный список КПГЗ
const optionsKpgz = ref<{ label: string; value: string }[]>([]); // Отфильтрованный список КПГЗ
const loadingKpgz = ref(false); // Состояние загрузки для КПГЗ

const optionsCity = ref(["Москва", "Санкт-Петербург"]);
const optionsMe = ref([
  { label: "Участвовал", value: true },
  { label: "Не участвовал", value: false },
]);

const optionsWin = ref([
  { label: "Да", value: true },
  { label: "Нет", value: false },
]);

// Переменные модели
const modelInn = ref<string | null>(null);
const modelCs = ref<number | null>(null); // Id КС
const modelCustomers = ref<number | null>(null); // ИНН заказчика
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
const modelKpgz = ref<string | null>(null);
const modelStartSum = ref<string | null>(null);
const modelEndSum = ref<string | null>(null);
const modelCity = ref<string | null>(null);
const modelMe = ref<boolean | null>(null); // Может быть true, false или null
const modelWin = ref<boolean | null>(null); // Может быть true, false или null

// Состояние загрузки
const loadingInn = ref(false);
const loadingCs = ref(false);
const loadingCustomers = ref(false);

// Фильтрация поиска в select
const filterFn = (val: string, update: (callback: () => void) => void, options: string[]) => {
  update(() => {
    if (val != "") {
      const needle = val.toLowerCase();
      options = options.filter(v => v.toLowerCase().includes(needle));
    }
  });
};

// Фильтрация поиска в select для ИНН
const filterFnInn = (val: string, update: (callback: () => void) => void) => {
  update(() => {
    if (val === "") {
      optionsInn.value = originalOptionsInn.value;
    } else {
      const needle = val.toLowerCase();
      optionsInn.value = originalOptionsInn.value.filter(v => v.label.toLowerCase().includes(needle));
    }
  });
};

// Фильтрация поиска в select для сессий
const filterFnCs = (val: string, update: (callback: () => void) => void) => {
  update(() => {
    if (val === "") {
      optionsCs.value = originalOptionsCs.value;
    } else {
      const needle = val.toLowerCase();
      optionsCs.value = originalOptionsCs.value.filter(v => v.label.toLowerCase().includes(needle));
    }
  });
};

// Фильтрация поиска в select для заказчиков
const filterFnCustomers = (val: string, update: (callback: () => void) => void) => {
  update(() => {
    if (val === "") {
      optionsCustomers.value = originalOptionsCustomers.value;
    } else {
      const needle = val.toLowerCase();
      optionsCustomers.value = originalOptionsCustomers.value.filter(v => v.label.toLowerCase().includes(needle));
    }
  });
};

const filterInnFn = (val: string, update: (callback: () => void) => void) => filterFnInn(val, update);
const filterCsFn = (val: string, update: (callback: () => void) => void) => filterFnCs(val, update);
const filterCustomersFn = (val: string, update: (callback: () => void) => void) => filterFnCustomers(val, update);
const filterKpgzFn = (val: string, update: (callback: () => void) => void) => {
  update(() => {
    if (val === "") {
      optionsKpgz.value = originalOptionsKpgz.value;
    } else {
      const needle = val.toLowerCase();
      optionsKpgz.value = originalOptionsKpgz.value.filter(v => v.label.toLowerCase().includes(needle));
    }
  });
};
const filterCityFn = (val: string, update: (callback: () => void) => void) => filterFn(val, update, optionsCity.value);

const loadKpgzList = async () => {
  loadingKpgz.value = true;

  try {
    const response = await axios.get("https://moscow-portal.ru.tuna.am/kpgz");

    if (Array.isArray(response.data.data)) {
      // Сохраняем КПГЗ в виде объектов
      originalOptionsKpgz.value = response.data.data.map((item: KpgzItem) => ({
        label: `${item["Код КПГЗ"]} - ${item["Наименование КПГЗ"]}`, // Отображаемое значение
        value: item["Код КПГЗ"], // Сохраняемое значение (Код КПГЗ)
      }));
      optionsKpgz.value = originalOptionsKpgz.value; // Инициализируем отфильтрованный список
      console.log("КПГЗ загружены:", optionsKpgz.value);
    } else {
      console.error("Ошибка: API вернул неожиданный формат!", response.data);
    }
  } catch (error) {
    console.error("Ошибка при загрузке КПГЗ", error);
  } finally {
    loadingKpgz.value = false;
  }
};

// Загрузка ИНН
const loadInnList = async () => {
  loadingInn.value = true;

  try {
    const response = await axios.get("https://moscow-portal.ru.tuna.am/provider");

    if (Array.isArray(response.data.data)) {
      // Сохраняем ИНН и название в виде объектов
      originalOptionsInn.value = response.data.data.map((item: InnItem) => ({
        label: `${item.inn} - ${item.org}`, // Отображаемое значение
        value: item.inn, // Сохраняемое значение (только ИНН)
      }));
      optionsInn.value = originalOptionsInn.value; // Инициализируем отфильтрованный список
      console.log("ИНН загружены:", optionsInn.value);
    } else {
      console.error("Ошибка: API вернул неожиданный формат!", response.data);
    }
  } catch (error) {
    console.error("Ошибка при загрузке ИНН", error);
  } finally {
    loadingInn.value = false;
  }
};

// Загрузка сессий
const loadCsList = async () => {
  loadingCs.value = true;

  try {
    const response = await axios.get("https://moscow-portal.ru.tuna.am/sessions");

    if (Array.isArray(response.data.data)) {
      // Сохраняем сессии в виде объектов
      originalOptionsCs.value = response.data.data.map((item: SessionItem) => ({
        label: `${item["Id КС"]} - ${item["Наименование заказчика"]}`, // Отображаемое значение
        value: item["Id КС"], // Сохраняемое значение (Id КС)
      }));
      optionsCs.value = originalOptionsCs.value; // Инициализируем отфильтрованный список
      console.log("Сессии загружены:", optionsCs.value);
    } else {
      console.error("Ошибка: API вернул неожиданный формат!", response.data);
    }
  } catch (error) {
    console.error("Ошибка при загрузке сессий", error);
  } finally {
    loadingCs.value = false;
  }
};

// Загрузка заказчиков
const loadCustomersList = async () => {
  loadingCustomers.value = true;

  try {
    const response = await axios.get("https://moscow-portal.ru.tuna.am/customers");

    if (Array.isArray(response.data.data)) {
      // Сохраняем заказчиков в виде объектов
      originalOptionsCustomers.value = response.data.data.map((item: CustomerItem) => ({
        label: `${item["ИНН заказчика"]} - ${item["Наименование заказчика"]}`, // Отображаемое значение
        value: item["ИНН заказчика"], // Сохраняемое значение (ИНН заказчика)
      }));
      optionsCustomers.value = originalOptionsCustomers.value; // Инициализируем отфильтрованный список
      console.log("Заказчики загружены:", optionsCustomers.value);
    } else {
      console.error("Ошибка: API вернул неожиданный формат!", response.data);
    }
  } catch (error) {
    console.error("Ошибка при загрузке заказчиков", error);
  } finally {
    loadingCustomers.value = false;
  }
};

// Преобразование даты из формата дд/мм/гггг в гггг-мм-дд
const formatDate = (date: string | null): string | null => {
  if (!date) return null;
  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
};

// Обработчик для даты начала
const formatStartDate = (date: string) => {
  startDate.value = formatDate(date);
};

// Обработчик для даты окончания
const formatEndDate = (date: string) => {
  endDate.value = formatDate(date);
};

// Валидация даты
const validateDate = (value: string): boolean | string => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(value) && value !== null) return "Дата должна быть в формате гггг-мм-дд";
  return true;
};

// Загрузка данных при монтировании компонента
onMounted(async () => {
  await loadInnList();
  await loadCsList();
  await loadCustomersList();
  await loadKpgzList();
});

// Функция для GET-запроса
const collectData = async () => {
  const allData = {
    kpgz_code: modelKpgz.value,
    winner_region: modelCity.value,
    start_date: startDate.value,
    end_date: endDate.value,
    inn: modelInn.value,
    do: modelMe.value, // Булево значение (true/false)
    min_price: modelStartSum.value,
    max_price: modelEndSum.value,
    customers: modelCustomers.value,
    win: modelWin.value, // Булево значение (true/false)
    cs: modelCs.value, // Добавляем Id КС
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
