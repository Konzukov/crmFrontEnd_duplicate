<template>
  <v-form ref="form" v-model="valid">
    <v-row>
      <!-- Категория -->
      <v-col cols="12" md="5">
        <v-autocomplete
            hide-details
            outlined dense
            v-model="editedAsset.category"
            :items="assetCategories"
            label="Категория*"
            :rules="requiredRules"
            :disabled="disabled"
        />
      </v-col>

      <!-- Тип имущества -->
      <v-col cols="12" md="5">
        <v-autocomplete
            hide-details
            outlined dense
            v-model="editedAsset.asset_type"
            :items="assetTypes"
            label="Тип*"
            :rules="requiredRules"
            :disabled="disabled"
            @change="onAssetTypeChange"
        />
      </v-col>

      <!-- Дата приобретения -->
      <v-col cols="12" md="4">
        <DatePicker
            hide-details
            v-model="editedAsset.acquisition_date"
            value-type="format"
            format="DD.MM.YYYY"
            placeholder="Дата приобретения"
            :clearable="false"
            :disabled="disabled"
        />
      </v-col>

      <!-- Дата выбытия -->
      <v-col cols="12" md="4">
        <DatePicker
            hide-details
            v-model="editedAsset.disposal_date"
            value-type="format"
            format="DD.MM.YYYY"
            placeholder="Дата выбытия"
            :clearable="false"
            :disabled="disabled"
        />
      </v-col>

      <!-- Статус -->
      <v-col cols="12" md="4">
        <v-autocomplete
            hide-details
            outlined dense
            v-model="editedAsset.status"
            :items="assetStatuses"
            label="Статус*"
            :rules="requiredRules"
            :disabled="disabled"
        />
      </v-col>
    </v-row>

    <!-- ДИНАМИЧЕСКИЕ ПОЛЯ ПО JSON СХЕМЕ -->
    <v-divider class="my-4" v-if="editedAsset.asset_type && getSchemaFields()"></v-divider>
    <strong v-if="editedAsset.asset_type && getSchemaFields()">Характеристики</strong>

    <v-row class="mt-2" v-if="editedAsset.asset_type && getSchemaFields()">
      <v-col cols="12" :md="field.type === 'boolean' ? 12 : 6"
             v-for="(field, key) in getSchemaFields()" :key="key">
        <component
            :is="resolveFieldComponent(field)"
            v-model="editedAsset.details[key]"
            :label="field.label"
            :rules="getFieldRules(field)"
            v-bind="getFieldAttrs(field, key)"
            :disabled="disabled"
            outlined dense
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import {AssetSchemas} from '@/const/dataTypes'
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'

// Импорт компонентов Vuetify локально
import {
  VForm,
  VTextField,
  VAutocomplete,
  VCheckbox,
  VSelect,
  VTextarea
} from 'vuetify/lib'

export default {
  name: "AssetForm",
  components: {
    DatePicker,
    VForm,
    VTextField,
    VAutocomplete,
    VCheckbox,
    VSelect,
    VTextarea
  },
  props: {
    asset: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      valid: false,
      editedAsset: {},
      requiredRules: [v => !!v || 'Обязательное поле'],
      assetCategories: [
        "Недвижимое имущество",
        "Движимое имущество",
        "Денежные средства",
        "Дебиторская задолженность",
        "Ценные бумаги",
        "Акции и участие",
        "Иное имущество"
      ],
      assetTypes: Object.keys(AssetSchemas),
      assetStatuses: [
        {value: "active", text: "Активный"},
        {value: "inactive", text: "Неактивный"},
        {value: "disputed", text: "Оспаривается"},
        {value: "leased", text: "В аренде"},
        {value: "under repair", text: "На ремонте"},
        {value: "outstanding", text: "Просрочен"}
      ],
    }
  },
  computed: {},
  watch: {
    asset: {
      immediate: true,
      handler(newVal) {
        this.editedAsset = JSON.parse(JSON.stringify(newVal));
        this.initAssetDetails();
      }
    }
  },
  methods: {
    validate() {
      return this.$refs.form.validate();
    },
    getAssetData() {
      return this.editedAsset;
    },
    onAssetTypeChange() {
      if (!this.disabled) {
        // Очищаем существующие детали
        this.editedAsset.details = {};

        // Получаем схему для выбранного типа
        const schema = AssetSchemas[this.editedAsset.asset_type];
        if (schema && schema.properties) {
          // Инициализируем каждое поле значением по умолчанию
          Object.keys(schema.properties).forEach(key => {
            const field = schema.properties[key];

            if (field.type === 'boolean') {
              this.editedAsset.details[key] = field.default !== undefined ? field.default : false;
            } else if (field.type === 'number' || field.type === 'integer') {
              this.editedAsset.details[key] = field.default !== undefined ? field.default : 0;
            } else if (field.type === 'string') {
              this.editedAsset.details[key] = field.default !== undefined ? field.default : '';
            } else {
              this.editedAsset.details[key] = null;
            }
          });
        }
      }
    },
    getSchemaFields() {
      if (!this.editedAsset.asset_type || !AssetSchemas[this.editedAsset.asset_type]) {
        return {};
      }
      const schema = AssetSchemas[this.editedAsset.asset_type];
      return schema?.properties || {};
    },
    resolveFieldComponent(field) {
      switch (field.type) {
        case "boolean":
          return "v-checkbox";
        case "date":
          return "DatePicker";
        case "string":
          if (field.enum && field.enum.length > 0) {
            return "v-autocomplete";
          }
          return "v-text-field";
        case "integer":
        case "number":
          return "v-text-field";
        default:
          return "v-text-field";
      }
    },
    getFieldRules(field) {
      const rules = [];

      // Обязательное поле
      if (field.required) {
        rules.push(v => !!v || 'Обязательное поле');
      }

      // Валидация для строковых полей
      if (field.type === 'string') {
        // Проверка минимальной длины
        if (field.minLength !== undefined) {
          rules.push(v => !v || v.length >= field.minLength ||
              `Минимальная длина: ${field.minLength} символов`);
        }

        // Проверка максимальной длины
        if (field.maxLength !== undefined) {
          rules.push(v => !v || v.length <= field.maxLength ||
              `Максимальная длина: ${field.maxLength} символов`);
        }
      }

      // Валидация для числовых полей
      if (field.type === 'number' || field.type === 'integer') {
        // Минимальное значение
        if (field.minimum !== undefined) {
          rules.push(v => v === '' || v === null || v >= field.minimum ||
              `Минимальное значение: ${field.minimum}`);
        }

        // Максимальное значение
        if (field.maximum !== undefined) {
          rules.push(v => v === '' || v === null || v <= field.maximum ||
              `Максимальное значение: ${field.maximum}`);
        }

        // Проверка на целое число для integer
        if (field.type === 'integer') {
          rules.push(v => v === '' || v === null || Number.isInteger(Number(v)) ||
              'Должно быть целое число');
        }
      }

      return rules;
    },
    getFieldAttrs(field, fieldKey) {
      const attrs = {};

      // Плейсхолдер
      if (field.placeholder) {
        attrs.placeholder = field.placeholder;
      }

      // Для текстовых полей
      if (field.type === 'string') {
        if (field.maxLength !== undefined) {
          attrs.counter = field.maxLength;
        }

        // Маска для VIN номера
        if (fieldKey === 'vin') {
          attrs.mask = 'XXXXXXXXXXXXXXXXX';
          attrs.hint = 'Введите 17-значный VIN номер';
          attrs.persistentHint = true;
        }
      }

      // Для числовых полей
      if (field.type === 'number' || field.type === 'integer') {
        attrs.type = 'number';

        // Атрибуты min/max для HTML5 валидации
        if (field.minimum !== undefined) {
          attrs.min = field.minimum;
        }
        if (field.maximum !== undefined) {
          attrs.max = field.maximum;
        }

        // Шаг для числовых полей
        if (field.type === 'integer') {
          attrs.step = 1;
        }
      }

      // Для полей с перечислением
      if (field.enum && field.enum.length > 0) {
        attrs.items = field.enum;
      }

      // Для булевых полей
      if (field.type === 'boolean') {
        attrs.dense = true;
      }

      // Для полей с форматом даты
      if (field.format === 'date' || field.type === 'date') {
        attrs.valueType = 'format';
        attrs.format = 'DD.MM.YYYY';
      }
      return attrs;
    },
    initAssetDetails() {
      // Создаем объект details, если его нет
      if (!this.editedAsset.details) {
        this.editedAsset.details = {};
      }

      // Если тип уже выбран, инициализируем поля из схемы
      if (this.editedAsset.asset_type && AssetSchemas[this.editedAsset.asset_type]) {
        const schema = AssetSchemas[this.editedAsset.asset_type];

        if (schema.properties) {
          Object.keys(schema.properties).forEach(key => {
            // Инициализируем только если поле еще не существует
            if (this.editedAsset.details[key] === undefined) {
              const field = schema.properties[key];

              if (field.type === 'boolean') {
                this.editedAsset.details[key] = field.default !== undefined ? field.default : false;
              } else if (field.type === 'number' || field.type === 'integer') {
                this.editedAsset.details[key] = field.default !== undefined ? field.default : 0;
              } else if (field.type === 'string') {
                this.editedAsset.details[key] = field.default !== undefined ? field.default : '';
              }
            }
          });
        }
      }
    }
  }
}
</script>