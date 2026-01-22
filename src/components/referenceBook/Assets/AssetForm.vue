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
      <v-col cols="12" md="4">
        <v-text-field
            type="number"
            step="0.1"
            hide-details
            outlined dense
            v-model="editedAsset.carrying_cost"
            label="Балансовая стоимость"
            :rules="requiredRules"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
            type="number"
            step="0.1"
            hide-details
            outlined dense
            v-model="editedAsset.market_cost"
            label="Рыночная стоимость"
            :rules="requiredRules"
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

    <!-- Раздел залогов и арестов -->
    <v-divider class="my-4"></v-divider>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-2">
          <h4 class="text-h6">Залоги и аресты</h4>
          <v-btn
              color="primary"
              small
              @click="openPledgeArrestDialog"
              :disabled="disabled"
          >
            <v-icon left small>mdi-plus</v-icon>
            Добавить
          </v-btn>
        </div>

        <!-- Карточки существующих залогов -->
        <v-card v-if="hasPledges" class="mb-4"
                :key="'pledges-' + (editedAsset.pledges ? editedAsset.pledges.length : 0)">
          <v-card-title class="py-2 text-h8">
            <v-icon left small>mdi-handshake</v-icon>
            Залоги ({{ editedAsset.pledges.length }})
          </v-card-title>
          <v-card-text class="pt-0">
            <v-list dense>
              <v-list-item
                  v-for="(pledge, index) in editedAsset.pledges"
                  :key="`pledge-${index}-${pledge.pledge_number || ''}-${pledge.pledge_date || ''}`"
                  class="mb-2"
              >
                <v-list-item-content>
                  <div class="d-flex justify-space-between">
                    <div>
                      <strong>{{ getPledgeeName(pledge) }}</strong> •
                      {{ getPledgeTypeText(pledge.pledge_type) }}
                      <v-chip x-small :color="pledge.is_active ? 'warning' : 'success'" class="ml-2">
                        {{ pledge.is_active ? 'Активен' : 'Завершен' }}
                      </v-chip>
                    </div>
                    <div>
                      <v-btn icon small @click="editPledge(index)">
                        <v-icon small>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon small @click="removePledge(index)" color="error">
                        <v-icon small>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>
                  <div v-if="pledge.amount" class="text-caption mt-1">
                    Сумма: {{ formatCurrency(pledge.amount) }}
                  </div>
                  <div v-if="pledge.description" class="text-caption text--secondary mt-1">
                    {{ pledge.description.substring(0, 100) }}...
                  </div>
                  <div class="text-caption mt-1">
                    Период: {{ formatDate(pledge.start_date) }} - {{ formatDate(pledge.end_date) || 'н/д' }}
                  </div>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
        <!-- Карточки существующих арестов -->
        <v-card v-if="hasArrests" :key="'arrests-' + (editedAsset.arrests ? editedAsset.arrests.length : 0)">
          <v-card-title class="py-2">
            <v-icon left small>mdi-gavel</v-icon>
            Аресты ({{ editedAsset.arrests.length }})
          </v-card-title>
          <v-card-text class="pt-0">
            <v-list dense>
              <v-list-item
                  v-for="(arrest, index) in editedAsset.arrests"
                  :key="`arrest-${index}-${arrest.arrest_date || ''}-${arrest.arresting_organization || ''}`"
                  class="mb-2"
              >
                <v-list-item-content>
                  <div class="d-flex justify-space-between">
                    <div>
                      <strong>{{ getArrestingOrganization(arrest) }}</strong> •
                      {{ formatDate(arrest.arrest_date) }}
                      <v-chip x-small :color="arrest.is_active ? 'error' : 'success'" class="ml-2">
                        {{ arrest.is_active ? 'Активен' : 'Снят' }}
                      </v-chip>
                    </div>
                    <div>
                      <v-btn icon small @click="editArrest(index)">
                        <v-icon small>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon small @click="removeArrest(index)" color="error">
                        <v-icon small>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>
                  <div v-if="arrest.reason" class="text-caption text--secondary">
                    {{ arrest.reason.substring(0, 100) }}...
                  </div>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <v-alert v-if="!hasPledges && !hasArrests"
                 type="info" outlined dense>
          Нет добавленных залогов или арестов
        </v-alert>
      </v-col>
    </v-row>

    <!-- Модальное окно для добавления/редактирования залогов и арестов -->
    <v-dialog v-model="pledgeArrestDialog" max-width="800" persistent>
      <v-card>
        <v-card-title>
          <v-tabs v-model="dialogTab" grow>
            <v-tab>Залог</v-tab>
            <v-tab>Арест</v-tab>
          </v-tabs>
        </v-card-title>

        <v-card-text>
          <v-tabs-items v-model="dialogTab">
            <v-tab-item>
              <v-form ref="pledgeForm" v-model="pledgeValid">
                <v-row class="mt-0">
                  <v-col cols="12" md="6">
                    <v-autocomplete
                        v-model="currentPledge.pledge_type"
                        :items="pledgeTypes"
                        label="Тип залога*"
                        :rules="requiredRules"
                        outlined dense
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                        v-model="currentPledge.amount"
                        label="Сумма залога"
                        type="number"
                        :rules="pledgeRules.amount"
                        outlined dense
                        prefix="₽"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-autocomplete
                        v-model="pledgeePledgor"
                        @change="setPledgee"
                        :items="allRefData"
                        return-object
                        item-text="name"
                        item-value="id"
                        label="Залогодержатель*"
                        :rules="requiredRules"
                        outlined dense
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                        v-model="currentPledge.pledge_number"
                        label="Номер договора*"
                        outlined dense
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <DatePicker
                        v-model="currentPledge.pledge_date"
                        value-type="format"
                        format="DD.MM.YYYY"
                        placeholder="Дата договора*"
                        :clearable="false"
                        outlined
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <DatePicker
                        v-model="currentPledge.start_date"
                        value-type="format"
                        format="DD.MM.YYYY"
                        placeholder="Дата начала залога*"
                        :clearable="false"
                        outlined
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <DatePicker
                        v-model="currentPledge.end_date"
                        value-type="format"
                        format="DD.MM.YYYY"
                        placeholder="Дата окончания залога"
                        :clearable="true"
                        outlined
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                        v-model="currentPledge.description"
                        label="Описание условий залога"
                        outlined dense
                        rows="3"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-switch
                        v-model="currentPledge.is_active"
                        label="Активный залог"
                        hide-details
                    />
                  </v-col>
                </v-row>
              </v-form>
            </v-tab-item>

            <!-- Форма ареста -->
            <v-tab-item>
              <v-form ref="arrestForm" v-model="arrestValid">
                <v-row class="mt-0">
                  <v-col cols="12" md="6">
                    <v-autocomplete
                        v-model="currentArrest.arresting_organization"
                        :items="legalEntities"
                        item-text="name"
                        item-value="id"
                        label="Организация*"
                        :rules="arrestRules.arresting_organization"
                        outlined dense
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <DatePicker
                        v-model="currentArrest.arrest_date"
                        value-type="format"
                        format="DD.MM.YYYY"
                        placeholder="Дата наложения ареста*"
                        :clearable="false"
                        :rules="arrestRules.arrest_date"
                        outlined
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                        v-model="currentArrest.reason"
                        label="Основание для ареста*"
                        :rules="arrestRules.reason"
                        outlined dense
                        rows="3"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-switch
                        v-model="currentArrest.is_active"
                        label="Активный арест"
                        hide-details
                        @change="toggleArrestDates"
                    />
                  </v-col>

                  <v-col cols="12" md="6" v-if="!currentArrest.is_active">
                    <DatePicker
                        v-model="currentArrest.lifting_date"
                        value-type="format"
                        format="DD.MM.YYYY"
                        placeholder="Дата снятия ареста"
                        :clearable="true"
                        outlined
                    />
                  </v-col>

                  <v-col cols="12" v-if="!currentArrest.is_active">
                    <v-textarea
                        v-model="currentArrest.lifting_reason"
                        label="Причина снятия ареста"
                        outlined dense
                        rows="2"
                    />
                  </v-col>
                </v-row>
              </v-form>
            </v-tab-item>
          </v-tabs-items>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closePledgeArrestDialog">Отмена</v-btn>
          <v-btn
              color="primary"
              @click="savePledgeOrArrest"
              :disabled="dialogTab === 0 ? !pledgeValid : !arrestValid"
          >
            {{ isEditingPledgeOrArrest ? 'Сохранить' : 'Добавить' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-form>
</template>

<script>
import {AssetSchemas} from '@/const/dataTypes'
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'
import {
  VAlert,
  VAutocomplete,
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VCheckbox,
  VChip,
  VDialog,
  VForm,
  VIcon,
  VList,
  VListItem,
  VListItemContent,
  VSelect,
  VSwitch,
  VTab,
  VTabItem,
  VTabs,
  VTabsItems,
  VTextarea,
  VTextField
} from 'vuetify/lib'
import {mapGetters} from "vuex";

export default {
  name: "AssetForm",
  components: {
    DatePicker,
    VForm,
    VTextField,
    VAutocomplete,
    VCheckbox,
    VSelect,
    VTextarea,
    VBtn,
    VIcon,
    VCard,
    VCardTitle,
    VCardText,
    VList,
    VListItem,
    VListItemContent,
    VAlert,
    VDialog,
    VCardActions,
    VTab,
    VTabs,
    VTabItem,
    VTabsItems,
    VSwitch,
    VChip
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
      pledgeePledgor: null,
      valid: false,
      editedAsset: {
        details: {},
        pledges: [],
        arrests: [],
        category: '',
        asset_type: '',
        acquisition_date: null,
        disposal_date: null,
        status: '',
        carrying_cost: '',
        market_cost: ''
      },
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
        {value: "outstanding", text: "Просрочен"},
        {value: "pledged", text: "В залоге"},
        {value: "arrested", text: "Арестован"},
        {value: "pledged_arrested", text: "В залоге и арестован"}
      ],

      // Диалог залогов/арестов
      pledgeArrestDialog: false,
      dialogTab: 0,
      pledgeValid: false,
      arrestValid: false,
      isEditingPledgeOrArrest: false,
      editingIndex: -1,
      editingType: '', // 'pledge' или 'arrest'
      currentPledge: {
        id: null,
        legal_pledgee: null,
        physical_pledgee: null,
        pledge_type: 'mortgage',
        pledge_date: null,
        pledge_number: '',
        amount: '',
        start_date: null,
        end_date: null,
        description: '',
        is_active: true
      },

      currentArrest: {
        id: null,
        arresting_organization: null,
        arrest_date: null,
        reason: '',
        is_active: true,
        lifting_date: null,
        lifting_reason: ''
      },

      // Списки для выбора
      pledgeTypes: [
        {value: 'mortgage', text: 'Ипотека'},
        {value: 'pawn', text: 'Залог движимого имущества'},
        {value: 'pledge_of_rights', text: 'Залог прав'},
        {value: 'other', text: 'Другой вид залога'}
      ],

      loadingLegalEntities: false,
      loadingPhysicalPersons: false,
      pledgeRules: {
        pledge_number: [v => !!v || 'Номер договора обязателен'],
        pledge_date: [v => !!v || 'Дата договора обязательна'],
        start_date: [v => !!v || 'Дата начала обязательна'],
        amount: [v => !v || !isNaN(parseFloat(v)) || 'Сумма должна быть числом']
      },

      arrestRules: {
        arresting_organization: [v => !!v || 'Организация обязательна'],
        arrest_date: [v => !!v || 'Дата ареста обязательна'],
        reason: [v => !!v || 'Основание для ареста обязательно']
      },
    }
  },
  computed: {
    ...mapGetters({allRefData: "allRefData", legalEntities: 'legalEntityData'}),
    hasPledges() {
      return Array.isArray(this.editedAsset.pledges) &&
          this.editedAsset.pledges.length > 0;
    },
    hasArrests() {
      return Array.isArray(this.editedAsset.arrests) &&
          this.editedAsset.arrests.length > 0;
    }
  },
  watch: {
    'editedAsset.details': {
      deep: true,
      handler() {
        this.emitAssetChange();
      }
    },
    asset: {
      immediate: true,
      handler(newVal) {
        if (!newVal) return
        if (this.editedAsset && this.editedAsset.id === newVal.id) {
          return
        }

        this.editedAsset = JSON.parse(JSON.stringify({
          ...newVal,
          pledges: newVal.pledges || [],
          arrests: newVal.arrests || []
        }))
      }
    }
  },
  mounted() {
    this.$store.dispatch('fetchPhysicalPersons')
    this.$store.dispatch('getLegalEntity')

  },
  methods: {
    setPledgee(item) {
      console.log('Setting pledgee:', item);

      if (!item) {
        this.currentPledge.legal_pledgee = null;
        this.currentPledge.physical_pledgee = null;
        return;
      }

      if (item.type === "LegalEntity") {
        this.currentPledge.legal_pledgee = item.id;
        this.currentPledge.physical_pledgee = null;
        this.currentPledge.pledgor_type = 'legal';
      } else if (item.type === "PhysicalPerson") {
        this.currentPledge.physical_pledgee = item.id;
        this.currentPledge.legal_pledgee = null;
        this.currentPledge.pledgor_type = 'physical';
      }
    },
    getPledgeeName(pledge) {
      if (pledge.legal_pledgee) {
        // Ищем юридическое лицо
        const legalEntity = this.legalEntities.find(le => le.id === pledge.legal_pledgee);
        return legalEntity ? legalEntity.name : 'Неизвестное юр. лицо';
      } else if (pledge.physical_pledgee) {
        // Ищем физическое лицо в allRefData
        const physicalPerson = this.allRefData.find(p =>
            p.id === pledge.physical_pledgee && p.type === "PhysicalPerson"
        );
        return physicalPerson ? physicalPerson.fullName || 'Неизвестное физ. лицо' : 'Неизвестное физ. лицо';
      }
      return 'Не указан';
    },
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    emitAssetChange() {
      // Используем debounce для предотвращения множественных вызовов
      if (!this.debouncedEmit) {
        this.debouncedEmit = this.debounce(() => {
          console.log('Emitting asset change with details:', this.editedAsset.details);

          // Убедимся, что details есть и это объект
          const assetData = JSON.parse(JSON.stringify({
            ...this.editedAsset,
            details: this.editedAsset.details || {},
            pledges: this.editedAsset.pledges || [],
            arrests: this.editedAsset.arrests || []
          }));

          this.$emit('asset-change', assetData);
        }, 100);
      }
      this.debouncedEmit();
    },
    validate() {
      return this.$refs.form.validate();
    },
    getAssetData() {
      return this.editedAsset;
    },
    onAssetTypeChange() {
      if (!this.disabled) {
        // Очищаем details через Vue.set для реактивности
        this.$set(this.editedAsset, 'details', {});
        const schema = AssetSchemas[this.editedAsset.asset_type];
        if (schema && schema.properties) {
          Object.keys(schema.properties).forEach(key => {
            const field = schema.properties[key];
            let defaultValue;
            if (field.type === 'boolean') {
              defaultValue = field.default !== undefined ? field.default : false;
            } else if (field.type === 'number' || field.type === 'integer') {
              defaultValue = field.default !== undefined ? field.default : 0;
            } else if (field.type === 'string') {
              defaultValue = field.default !== undefined ? field.default : '';
            } else {
              defaultValue = null;
            }
            // Используем Vue.set для реактивности
            this.$set(this.editedAsset.details, key, defaultValue);
          });
        }
      }

      // Обновляем родительский компонент
      this.$nextTick(() => {
        this.emitAssetChange();
      });
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
          if ((field.enum && field.enum.length > 0) || typeof field.enum === 'string') {
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
      if (field.required) {
        rules.push(v => !!v || 'Обязательное поле');
      }
      if (field.type === 'string') {
        if (field.minLength !== undefined) {
          rules.push(v => !v || v.length >= field.minLength ||
              `Минимальная длина: ${field.minLength} символов`);
        }
        if (field.maxLength !== undefined) {
          rules.push(v => !v || v.length <= field.maxLength ||
              `Максимальная длина: ${field.maxLength} символов`);
        }
      }
      if (field.type === 'number' || field.type === 'integer') {
        if (field.minimum !== undefined) {
          rules.push(v => v === '' || v === null || v >= field.minimum ||
              `Минимальное значение: ${field.minimum}`);
        }
        if (field.maximum !== undefined) {
          rules.push(v => v === '' || v === null || v <= field.maximum ||
              `Максимальное значение: ${field.maximum}`);
        }
        if (field.type === 'integer') {
          rules.push(v => v === '' || v === null || Number.isInteger(Number(v)) ||
              'Должно быть целое число');
        }
      }
      return rules;
    },
    getFieldAttrs(field, fieldKey) {
      const attrs = {};
      if (field.placeholder) {
        attrs.placeholder = field.placeholder;
      }
      if (field.type === 'string') {
        if (field.maxLength !== undefined) {
          attrs.counter = field.maxLength;
        }
        if (fieldKey === 'vin') {
          attrs.mask = 'XXXXXXXXXXXXXXXXX';
          attrs.hint = 'Введите 17-значный VIN номер';
          attrs.persistentHint = true;
        }
      }
      if (field.type === 'number' || field.type === 'integer') {
        attrs.type = 'number';
        if (field.minimum !== undefined) {
          attrs.min = field.minimum;
        }
        if (field.maximum !== undefined) {
          attrs.max = field.maximum;
        }
        if (field.type === 'integer') {
          attrs.step = 1;
        }
      }
      if (field.enum) {
        if (Array.isArray(field.enum) && field.enum.length > 0) {
          // Если enum - статический массив
          attrs.items = field.enum;
        } else if (typeof field.enum === 'string') {
          // Если enum - строка (ключ для computed свойства)
          switch (field.enum) {
            case 'legalEntities':
              attrs.items = this.legalEntities;
              attrs['item-text'] = 'name';
              attrs['item-value'] = 'id';
              break;
              // Можно добавить другие источники данных здесь
            default:
              // Если это computed свойство существует
              if (this[field.enum]) {
                attrs.items = this[field.enum];
              }
          }
        }
      }
      if (field.type === 'boolean') {
        attrs.dense = true;
      }
      if (field.format === 'date' || field.type === 'date') {
        attrs.valueType = 'format';
        attrs.format = 'DD.MM.YYYY';
      }
      return attrs;
    },
    openPledgeArrestDialog(type = 'pledge', index = -1) {
      console.log('Opening dialog for', type, 'at index:', index);

      this.pledgeArrestDialog = true;
      this.isEditingPledgeOrArrest = index !== -1;
      this.editingIndex = index;
      this.editingType = type;

      // Сбрасываем валидацию форм
      if (this.$refs.pledgeForm) {
        this.$refs.pledgeForm.resetValidation();
      }
      if (this.$refs.arrestForm) {
        this.$refs.arrestForm.resetValidation();
      }

      if (type === 'pledge') {
        this.dialogTab = 0;
        if (index !== -1) {
          // Редактирование существующего залога
          const pledge = this.editedAsset.pledges[index];
          console.log('Editing existing pledge:', pledge);

          // Создаем копию залога
          this.currentPledge = {
            ...pledge,
            // Определяем тип залогодержателя
            pledgor_type: pledge.legal_pledgee ? 'legal' : 'physical'
          };

          // Устанавливаем pledgeePledgor в зависимости от типа
          if (pledge.legal_pledgee) {
            // Ищем юридическое лицо
            const legalEntity = this.legalEntities.find(le => le.id === pledge.legal_pledgee);
            this.pledgeePledgor = legalEntity || null;
          } else if (pledge.physical_pledgee) {
            // Ищем физическое лицо
            const physicalPerson = this.allRefData.find(p =>
                p.id === pledge.physical_pledgee && p.type === "PhysicalPerson"
            );
            this.pledgeePledgor = physicalPerson || null;
          } else {
            this.pledgeePledgor = null;
          }

          console.log('Current pledge after setup:', this.currentPledge);
          console.log('Pledgee/Pledgor after setup:', this.pledgeePledgor);
        } else {
          // Новый залог
          this.currentPledge = {
            pledgor_type: 'legal',
            legal_pledgee: null,
            physical_pledgee: null,
            pledge_type: 'mortgage',
            pledge_date: null,
            pledge_number: '',
            amount: '',
            start_date: null,
            end_date: null,
            description: '',
            is_active: true
          };
          this.pledgeePledgor = null;
        }
      } else {
        this.dialogTab = 1;
        if (index !== -1) {
          // Редактирование существующего ареста
          const arrest = this.editedAsset.arrests[index];
          console.log('Editing existing arrest:', arrest);

          this.currentArrest = {...arrest};

          // Если arresting_organization это объект, берем только id
          if (this.currentArrest.arresting_organization &&
              typeof this.currentArrest.arresting_organization === 'object') {
            this.currentArrest.arresting_organization = this.currentArrest.arresting_organization.id;
          }
        } else {
          // Новый арест
          this.currentArrest = {
            arresting_organization: null,
            arrest_date: null,
            reason: '',
            is_active: true,
            lifting_date: null,
            lifting_reason: ''
          };
        }
      }
    },
    closePledgeArrestDialog() {
      this.pledgeArrestDialog = false;
      this.isEditingPledgeOrArrest = false;
      this.editingIndex = -1;
      this.editingType = '';
      this.resetPledgeArrestForms();

      // Сбрасываем валидацию
      if (this.$refs.pledgeForm) {
        this.$refs.pledgeForm.resetValidation();
      }
      if (this.$refs.arrestForm) {
        this.$refs.arrestForm.resetValidation();
      }
    },
    resetPledgeArrestForms() {
      this.currentPledge = {
        pledgor_type: 'legal',
        legal_pledgee: null,
        physical_pledgee: null,
        pledge_type: 'mortgage',
        pledge_date: null,
        pledge_number: '',
        amount: '',
        start_date: null,
        end_date: null,
        description: '',
        is_active: true
      };

      this.currentArrest = {
        arresting_organization: null,
        arrest_date: null,
        reason: '',
        is_active: true,
        lifting_date: null,
        lifting_reason: ''
      };
    },
    toggleArrestDates() {
      if (this.currentArrest.is_active) {
        this.currentArrest.lifting_date = null;
        this.currentArrest.lifting_reason = '';
      }
    },
    async savePledgeOrArrest() {
      try {
        if (this.dialogTab === 0) {
          console.log('Saving pledge, current data:', this.currentPledge);

          // Валидация формы залога
          const pledgeFormValid = await this.$refs.pledgeForm.validate();
          if (!pledgeFormValid) {
            console.log('Форма залога не валидна');
            return;
          }

          // Преобразуем данные залога
          const pledgeData = {
            ...this.currentPledge,
            pledge_date: this.currentPledge.pledge_date,
            start_date: this.currentPledge.start_date,
            end_date: this.currentPledge.end_date || null,
            amount: this.currentPledge.amount ? parseFloat(this.currentPledge.amount) : null
          };

          // Убираем лишние поля
          delete pledgeData.pledgor_type;

          console.log('Processed pledge data:', pledgeData);

          // Создаем новый массив залогов
          let newPledges;
          if (this.isEditingPledgeOrArrest && this.editingType === 'pledge') {
            newPledges = [...this.editedAsset.pledges];
            newPledges[this.editingIndex] = pledgeData;
          } else {
            newPledges = [...this.editedAsset.pledges, pledgeData];
          }

          // Используем Vue.set для реактивного обновления
          this.$set(this.editedAsset, 'pledges', newPledges);
        } else {
          console.log('Saving arrest, current data:', this.currentArrest);

          // Валидация формы ареста
          const arrestFormValid = await this.$refs.arrestForm.validate();
          if (!arrestFormValid) {
            console.log('Форма ареста не валидна');
            return;
          }

          // Преобразуем данные ареста
          const arrestData = {
            ...this.currentArrest,
            arrest_date: this.currentArrest.arrest_date,
            lifting_date: this.currentArrest.lifting_date || null
          };

          console.log('Processed arrest data:', arrestData);

          // Создаем новый массив арестов
          let newArrests;
          if (this.isEditingPledgeOrArrest && this.editingType === 'arrest') {
            newArrests = [...this.editedAsset.arrests];
            newArrests[this.editingIndex] = arrestData;
          } else {
            newArrests = [...this.editedAsset.arrests, arrestData];
          }

          // Используем Vue.set для реактивного обновления
          this.$set(this.editedAsset, 'arrests', newArrests);
        }

        // Закрываем диалог
        this.closePledgeArrestDialog();

        // Обновляем computed свойства
        this.$nextTick(() => {
          console.log('Обновляю список залогов/арестов');
          this.emitAssetChange();
        });

        console.log('Залог/арест успешно сохранен');
        console.log('Текущие залоги:', this.editedAsset.pledges);
        console.log('Текущие аресты:', this.editedAsset.arrests);
      } catch (error) {
        console.error('Ошибка при сохранении залога/ареста:', error);
      }
    },
    editPledge(index) {
      console.log('Editing pledge at index:', index);
      this.openPledgeArrestDialog('pledge', index);
    },
    editArrest(index) {
      console.log('Editing arrest at index:', index);
      this.openPledgeArrestDialog('arrest', index);
    },
    removePledge(index) {
      if (confirm('Вы уверены, что хотите удалить этот залог?')) {
        // Создаем новый массив без удаленного элемента
        const newPledges = this.editedAsset.pledges.filter((_, i) => i !== index);
        this.$set(this.editedAsset, 'pledges', newPledges);

        this.$nextTick(() => {
          this.emitAssetChange();
        });
      }
    },
    removeArrest(index) {
      if (confirm('Вы уверены, что хотите удалить этот арест?')) {
        // Создаем новый массив без удаленного элемента
        const newArrests = this.editedAsset.arrests.filter((_, i) => i !== index);
        this.$set(this.editedAsset, 'arrests', newArrests);

        this.$nextTick(() => {
          this.emitAssetChange();
        });
      }
    },
    getPledgeTypeText(type) {
      const typeMap = {
        'mortgage': 'Ипотека',
        'pawn': 'Залог движимого имущества',
        'pledge_of_rights': 'Залог прав',
        'other': 'Другой вид залога'
      };
      return typeMap[type] || type;
    },
    getArrestingOrganization(arrest) {
      const org = this.legalEntities.find(e => e.id === arrest.arresting_organization);
      return org ? org.name : 'Неизвестная организация';
    },
    formatDate(date) {
      if (!date) return '—';
      if (typeof date === 'string') return date;
      return date;
    },
    formatCurrency(amount) {
      if (!amount) return '0 ₽';
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(amount);
    }
  }
}
</script>

<style scoped>
.v-list-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.v-list-item:hover {
  background-color: #f5f5f5;
}

.v-tab {
  min-width: 120px;
}

.text-caption {
  font-size: 12px;
  line-height: 1.2;
}

.v-chip--x-small {
  height: 16px;
  font-size: 10px;
}
</style>