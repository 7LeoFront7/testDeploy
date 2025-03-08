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

    <!-- Таблица -->
    <q-table
      style="height: 400px"
      flat bordered
      title="Данные"
      :rows="paginatedData"
    :columns="columns"
    row-key="id_ks"
    v-model:pagination="pagination"
    :rows-per-page-options="[10, 20, 50]"
    @request="onRequest"
    >
    <!-- Пагинация -->
    <template v-slot:pagination>
      <q-pagination
        v-model="pagination.page"
        :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
        :max-pages="10"
        direction-links
        boundary-links
      />
    </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from "vue";
import axios from "axios";

const columns = [
  { name: "id_ks", label: "ID КС", field: "id_ks", align: "left" as const, sortable: true },
  { name: "sum_end", label: "Сумма окончания", field: "sum_end", align: "left" as const, sortable: true },
  { name: "sum_start", label: "Сумма начала", field: "sum_start", align: "left" as const, sortable: true },
  { name: "link", label: "Ссылка", field: "link", align: "left" as const, sortable: true },
  { name: "provider_inn", label: "ИНН поставщика", field: "provider_inn", align: "left" as const, sortable: true },
  { name: "provider_org_name", label: "Название поставщика", field: "provider_org_name", align: "left" as const, sortable: true },
  { name: "provider_region", label: "Регион поставщика", field: "provider_region", align: "left" as const, sortable: true },
  { name: "start_date_ks", label: "Дата начала КС", field: "start_date_ks", align: "left" as const, sortable: true },
  { name: "end_date_ks", label: "Дата окончания КС", field: "end_date_ks", align: "left" as const, sortable: true },
  { name: "winner_inn", label: "ИНН победителя", field: "winner_inn", align: "left" as const, sortable: true },
  { name: "winner_org", label: "Организация победителя", field: "winner_org", align: "left" as const, sortable: true },
  { name: "winner_city", label: "Город победителя", field: "winner_city", align: "left" as const, sortable: true },
  { name: "members_providers", label: "Участники", field: "members_providers", align: "left" as const, sortable: true },
  { name: "kpgz_code", label: "Код КПГЗ", field: "kpgz_code", align: "left" as const, sortable: true },
  { name: "kpgz_name", label: "Название КПГЗ", field: "kpgz_name", align: "left" as const, sortable: true },
  { name: "do", label: "Моё участие", field: "do", align: "left" as const, sortable: true },
];

const pagination = ref({
  page: 1, // Текущая страница
  rowsPerPage: 10, // Количество строк на странице
  rowsNumber: 0, // Общее количество строк (для пагинации)
});

const onRequest = (props: any) => {
  const { page, rowsPerPage } = props.pagination;

  // Обновляем пагинацию
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;

  // Если данные подгружаются с сервера постранично, добавьте здесь логику для загрузки данных
  // Например:
  // loadData(page, rowsPerPage);
};

// Вычисляемое свойство для отображения данных на текущей странице
const paginatedData = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
  const end = start + pagination.value.rowsPerPage;
  return tableData.value.slice(start, end);
});

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

const tableData = ref<any[]>([]); // Данные для таблицы

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

    // Сохраняем данные в таблицу
    tableData.value = response.data.data;

    // Обновляем пагинацию
    pagination.value.rowsNumber = tableData.value.length;
  } catch (error) {
    console.error("Ошибка запроса:", error);
  }
};
</script>
