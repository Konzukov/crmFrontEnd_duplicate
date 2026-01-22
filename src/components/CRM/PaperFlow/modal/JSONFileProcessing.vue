<template>
  <v-container>
    <v-expansion-panel :class="[templateError? 'has-error': '', 'pr-3 pl-3']">
      <v-expansion-panel-header>
        <v-row justify="start" align="center">
          <v-col cols="auto">{{ uploadFile.name }}</v-col>
          <v-col cols="auto">
            <v-btn icon v-if="!uploadProcess.uploading">
              <v-icon v-if="uploadProcess.uploaded" color="success">
                mdi-check
              </v-icon>
              <v-tooltip bottom v-if="uploadProcess.errors.hasError && templateType !== 'physical_person_assets'">
                <template v-slot:activator="{ on, attrs }">
                  <v-icon color="error"
                          v-bind="attrs"
                          v-on="on"
                  >
                    mdi-alert-circle-outline
                  </v-icon>
                </template>
                <span>Ошибка обработки файла</span>
              </v-tooltip>
            </v-btn>
            <v-progress-circular
                v-if="uploadProcess.uploading"
                :rotate="-90"
                :size="40"
                :width="7"
                :value="uploadProcess.progress"
                color="primary"
            >
              {{ uploadProcess.progress }}
            </v-progress-circular>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto" class="error--text error-message" v-if="templateType !== 'physical_person_assets'">
            {{ errorMessage }}
          </v-col>
          <v-col cols="auto" class="info--text" v-else-if="duplicateAssetsCount > 0">
            Дубликатов: {{ duplicateAssetsCount }}
          </v-col>
        </v-row>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-container>
          <v-card>
            <!-- Блок для отображения ошибок валидации - только для НЕ имущества -->
            <v-card-text v-if="uploadProcess.errors.hasError && templateType !== 'physical_person_assets'">
              <v-alert
                  type="error"
                  dense
                  outlined
                  class="mb-4"
              >
                <strong>{{ uploadProcess.errors.message }}</strong>
                <div v-if="uploadProcess.errors.details" class="mt-2">
                  <div v-if="Array.isArray(uploadProcess.errors.details)">
                    <v-list dense class="py-0">
                      <v-list-item
                          v-for="(detail, index) in uploadProcess.errors.details"
                          :key="index"
                          class="py-1"
                      >
                        <v-list-item-content class="py-0">
                          <v-list-item-title class="text-caption">
                            • {{ detail }}
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </div>
                  <div v-else>
                    {{ uploadProcess.errors.details }}
                  </div>
                </div>
              </v-alert>
            </v-card-text>

            <v-card-text>
              <!-- Обработка почтовых отправлений -->
              <v-data-table
                  v-if="templateType === 'post' && processedData.length > 0"
                  dense :items="processedData"
                  :headers="postHeaders"
                  :item-class="(item) => rowClass(item)"
              >
                <template v-slot:item.actions="{ item }">
                  <v-menu offset-y>
                    <template v-slot:activator="{attrs, on}">
                      <v-icon size="18" v-bind="attrs"
                              v-on="on">mdi-dots-vertical
                      </v-icon>
                    </template>
                    <v-list dense style="font-size: 14px">
                      <v-list-item link @click="selectFile(item)">
                        Добавить файл
                      </v-list-item>
                      <v-list-item link @click="editPost(item)">
                        Редактировать отправление
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-data-table>

              <!-- Обработка банковских счетов -->
              <v-data-table
                  v-else-if="templateType === 'bank_account' && processedData.length > 0"
                  dense
                  :items="processedData"
                  :headers="bankAccountHeaders"
                  :item-class="(item) => rowClass(item)"
              >
                <template v-slot:item.actions="{ item }">
                  <v-btn icon small color="primary"
                         @click="editBankAccount(item)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
              </v-data-table>

              <!-- Обработка имущества физ.лиц -->
              <v-container v-else-if="templateType === 'physical_person_assets'">
                <!-- Показываем форму даже если есть ошибки, но скрываем если данные еще не загружены -->
                <template v-if="processedData.length > 0 || uploadProcess.errors.hasError">
                  <v-card class="mb-6">
                    <v-card-title>
                      <v-icon left>mdi-account</v-icon>
                      Информация о владельце из JSON
                    </v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" md="4">
                          <v-text-field
                              dense
                              outlined
                              label="ФИО из файла"
                              :value="getOwnerFullName()"
                              readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-autocomplete
                              dense
                              outlined
                              label="Выберите физ. лицо"
                              :items="physicalPersonListWithEmpty"
                              item-text="fullName"
                              item-value="id"
                              v-model="selectedPersonId"
                              return-object
                              @change="onPersonSelected"
                              :loading="loadingPersons"
                              :error="!selectedPersonId && !personSearchInProgress && !!processedData.length"
                              :error-messages="!selectedPersonId && !personSearchInProgress && !!processedData.length ? 'Выберите физ. лицо' : ''"
                          >
                            <template v-slot:prepend-item>
                              <v-list-item>
                                <v-list-item-content>
                                  <v-list-item-title class="text-caption">
                                    Найдено: {{ autoMatchedPersons.length }} совпадений
                                  </v-list-item-title>
                                </v-list-item-content>
                              </v-list-item>
                              <v-divider class="mt-2"></v-divider>
                            </template>

                            <template v-slot:append-outer>
                              <v-btn
                                  icon
                                  @click="createNewPerson"
                                  color="primary"
                              >
                                <v-icon>mdi-plus</v-icon>
                              </v-btn>
                            </template>

                            <template v-slot:item="data">
                              <v-list-item-content>
                                <v-list-item-title>{{ data.item.fullName }}</v-list-item-title>
                                <v-list-item-subtitle v-if="data.item.birthday">
                                  Дата рождения: {{ formatDate(data.item.birthday) }}
                                </v-list-item-subtitle>
                                <v-list-item-subtitle v-if="data.item.identifiers && data.item.identifiers.length > 0">
                                  Идентификаторы: {{ getIdentifiersText(data.item) }}
                                </v-list-item-subtitle>
                              </v-list-item-content>
                              <v-list-item-action v-if="data.item.isAutoMatch">
                                <v-chip x-small color="primary">Авто-выбор</v-chip>
                              </v-list-item-action>
                            </template>
                          </v-autocomplete>
                        </v-col>
                        <v-col cols="12" md="4" v-if="autoMatchedPersons.length > 1">
                          <v-alert type="warning" dense outlined>
                            Найдено несколько совпадений. Выберите подходящее физ.лицо.
                          </v-alert>
                        </v-col>
                      </v-row>

                      <v-row v-if="autoMatchedPersons.length === 0 && ownerData && physicalPersonList.length > 0">
                        <v-col cols="12">
                          <v-alert type="info" dense outlined>
                            Совпадений не найдено. Создайте новое физ.лицо или выберите существующее.
                          </v-alert>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <v-card>
                    <v-card-title>
                      <v-icon left>mdi-home</v-icon>
                      Имущество ({{ processedData.length }} объектов)
                      <v-chip v-if="duplicateAssetsCount > 0" small color="info" class="ml-2">
                        {{ duplicateAssetsCount }} дубликатов
                      </v-chip>
                    </v-card-title>
                    <v-card-text>
                      <!-- Основная форма для валидации всех активов -->
                      <v-form ref="assetsForm" v-model="valid" lazy-validation>
                        <v-expansion-panels multiple v-model="expandedAssetPanels" flat class="identifier-panel">
                          <v-expansion-panel
                              v-for="(asset, index) in processedData"
                              :key="index"
                              :class="{
                                    'duplicate-panel': asset.isDuplicate,
                                    'success-panel': asset.id && !asset.isDuplicate
                              }"
                          >
                            <v-expansion-panel-header disable-icon-rotate>
                              <div class="d-flex align-center flex-grow-1">
                                <div class="d-flex align-center">
                                  <!-- Для дубликатов (уже созданных активов) -->
                                  <v-tooltip bottom v-if="asset.isDuplicate">
                                    <template v-slot:activator="{ on, attrs }">
                                      <v-icon
                                          color="info"
                                          v-bind="attrs"
                                          v-on="on"
                                          class="mr-2"
                                          @click.stop="showDuplicateDetails(asset)"
                                      >
                                        mdi-information
                                      </v-icon>
                                    </template>
                                    <span>Актив уже существует в системе</span>
                                  </v-tooltip>
                                  <!-- Для успешно созданных активов -->
                                  <v-icon v-else-if="asset.id" color="success" class="mr-2">
                                    mdi-check-circle-outline
                                  </v-icon>
                                  <!-- Для новых активов -->
                                  <v-icon v-else color="grey lighten-1" class="mr-2">
                                    mdi-circle-outline
                                  </v-icon>
                                </div>

                                <div class="d-flex flex-column">
                <span
                    :class="{'info--text': asset.isDuplicate, 'success--text': asset.id && !asset.isDuplicate, 'grey--text': !asset.id && !asset.isDuplicate}">
                    {{ getAssetTitle(asset) }}
                    <span v-if="asset.isDuplicate" class="caption ml-2 info--text">(уже существует)</span>
                </span>
                                  <div class="caption mt-1 d-flex align-center">
                                    <v-chip
                                        x-small
                                        :color="asset.isDuplicate ? 'info' : (asset.id ? 'success' : 'grey lighten-1')"
                                        class="mr-1"
                                    >
                                      {{ asset.category || 'Без категории' }}
                                    </v-chip>
                                    <span v-if="asset.acquisition_date" class="ml-1 grey--text">
                        Приобретено: {{ formatDate(asset.acquisition_date) }}
                    </span>
                                    <span
                                        v-if="asset.status"
                                        class="ml-2"
                                        :class="getStatusClass(asset.status)"
                                    >
                        {{ getStatusText(asset.status) }}
                    </span>
                                  </div>
                                </div>
                              </div>

                              <template v-slot:actions>
                                <v-tooltip bottom v-if="asset.isDuplicate">
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-icon
                                        v-bind="attrs"
                                        v-on="on"
                                        color="info"
                                        class="mr-2"
                                        @click.stop="showDuplicateDetails(asset)"
                                    >
                                      mdi-information
                                    </v-icon>
                                  </template>
                                  <span>Информация о дубликате</span>
                                </v-tooltip>
                                <v-btn
                                    icon
                                    small
                                    color="error"
                                    @click.stop="removeAsset(index)"
                                    class="mr-1"
                                >
                                  <v-icon>mdi-delete</v-icon>
                                </v-btn>
                                <v-icon>mdi-chevron-down</v-icon>
                              </template>
                            </v-expansion-panel-header>

                            <v-expansion-panel-content>
                              <v-container>
                                <!-- Информация о дубликате (только для дубликатов) -->
                                <v-alert v-if="asset.isDuplicate && asset.duplicateInfo"
                                         type="info"
                                         dense
                                         outlined
                                         class="mb-4"
                                         icon="mdi-information">
                                  <strong>Этот актив уже существует в системе</strong>
                                  <div v-if="asset.duplicateInfo.fields" class="mt-2">
                                    Совпадения по полям:
                                    <ul class="mt-1 pl-3" style="font-size: 0.875rem;">
                                      <li v-for="(field, idx) in asset.duplicateInfo.fields" :key="idx">
                                        <strong>{{ field.field }}:</strong> "{{ field.value }}"
                                        <span v-if="field.duplicate_value"
                                              class="caption"> (в существующем: {{ field.duplicate_value }})</span>
                                      </li>
                                    </ul>
                                  </div>
                                  <div v-if="asset.duplicateInfo.duplicate_id" class="mt-1"
                                       style="font-size: 0.875rem;">
                                    <strong>ID существующего актива:</strong> {{ asset.duplicateInfo.duplicate_id }}
                                  </div>
                                </v-alert>

                                <!-- Форма только для не-дубликатов -->
                                <template v-if="!asset.isDuplicate">
                                  <v-row>
                                    <v-col cols="12" md="5">
                                      <v-autocomplete
                                          outlined dense
                                          v-model="asset.category"
                                          :items="assetCategories"
                                          label="Категория*"
                                          :rules="requiredRules"
                                          :error="hasFieldError(asset, 'category')"
                                          :error-messages="getFieldError(asset, 'category')"
                                          @input="clearFieldError(asset, 'category')"
                                      />
                                    </v-col>

                                    <v-col cols="12" md="5">
                                      <v-autocomplete
                                          outlined dense
                                          v-model="asset.asset_type"
                                          :items="assetTypes"
                                          label="Тип*"
                                          :rules="requiredRules"
                                          @change="onAssetTypeChange(asset)"
                                          :error="hasFieldError(asset, 'asset_type')"
                                          :error-messages="getFieldError(asset, 'asset_type')"
                                          @input="clearFieldError(asset, 'asset_type')"
                                      />
                                    </v-col>

                                    <v-col cols="12" md="4">
                                      <DatePicker
                                          v-model="asset.acquisition_date"
                                          value-type="format"
                                          format="DD.MM.YYYY"
                                          placeholder="Дата приобретения"
                                          :clearable="false"
                                          :error="hasFieldError(asset, 'acquisition_date')"
                                          :error-messages="getFieldError(asset, 'acquisition_date')"
                                          @input="clearFieldError(asset, 'acquisition_date')"
                                      />
                                    </v-col>

                                    <v-col cols="12" md="4">
                                      <DatePicker
                                          v-model="asset.disposal_date"
                                          value-type="format"
                                          format="DD.MM.YYYY"
                                          placeholder="Дата выбытия"
                                          :clearable="false"
                                          :error="hasFieldError(asset, 'disposal_date')"
                                          :error-messages="getFieldError(asset, 'disposal_date')"
                                          @input="clearFieldError(asset, 'disposal_date')"
                                      />
                                    </v-col>

                                    <v-col cols="12" md="4">
                                      <v-autocomplete
                                          outlined dense
                                          v-model="asset.status"
                                          :items="assetStatuses"
                                          label="Статус*"
                                          :rules="requiredRules"
                                          :error="hasFieldError(asset, 'status')"
                                          :error-messages="getFieldError(asset, 'status')"
                                          @input="clearFieldError(asset, 'status')"
                                      />
                                    </v-col>
                                    <v-col cols="12" md="4">
                                      <v-text-field
                                          type="number"
                                          step="0.1"
                                          outlined dense
                                          v-model="asset.carrying_cost"
                                          label="Балансовая стоимость*"
                                          :error="hasFieldError(asset, 'carrying_cost')"
                                          :error-messages="getFieldError(asset, 'carrying_cost')"
                                          @input="clearFieldError(asset, 'carrying_cost')"
                                      />
                                    </v-col>
                                    <v-col cols="12" md="4">
                                      <v-text-field
                                          type="number"
                                          step="0.1"
                                          outlined dense
                                          v-model="asset.market_cost"
                                          label="Рыночная стоимость*"
                                          :error="hasFieldError(asset, 'market_cost')"
                                          :error-messages="getFieldError(asset, 'market_cost')"
                                          @input="clearFieldError(asset, 'market_cost')"
                                      />
                                    </v-col>
                                  </v-row>

                                  <!-- ДИНАМИЧЕСКИЕ ПОЛЯ ПО JSON СХЕМЕ -->
                                  <v-divider class="my-4" v-if="asset.asset_type && getSchemaFields(asset)"></v-divider>
                                  <div v-if="asset.asset_type && getSchemaFields(asset)" class="d-flex align-center">
                                    <strong>Характеристики</strong>
                                  </div>

                                  <v-row class="mt-2" v-if="asset.asset_type && getSchemaFields(asset)">
                                    <v-col cols="12" :md="field.type === 'boolean' ? 12 : 6"
                                           v-for="(field, key) in getSchemaFields(asset)" :key="key">
                                      <component
                                          :is="resolveFieldComponent(field, key)"
                                          v-model="asset.details[key]"
                                          :label="field.label"
                                          :rules="getFieldRules(field, key)"
                                          v-bind="getFieldAttrs(field, key)"
                                          outlined dense
                                          :error="hasDetailFieldError(asset, key)"
                                          :error-messages="getDetailFieldError(asset, key)"
                                          @input="clearDetailFieldError(asset, key)"
                                      />
                                    </v-col>
                                  </v-row>
                                </template>

                                <!-- Для дубликатов показываем только информацию -->
                                <div v-else class="text-center py-4">
                                  <v-icon color="info" size="48" class="mb-3">mdi-information</v-icon>
                                  <p class="mb-0">Этот актив уже существует в системе</p>
                                  <p class="caption grey--text">Для редактирования используйте существующую запись</p>
                                </div>
                              </v-container>
                            </v-expansion-panel-content>
                          </v-expansion-panel>
                        </v-expansion-panels>
                      </v-form>

                      <v-row class="mt-4" justify="center">
                        <v-col cols="auto">
                          <v-btn color="success" @click="validateAndSaveAssets"
                                 :disabled="!selectedPersonId || uploadProcess.uploading || allAssetsSaved">
                            {{
                              uploadProcess.uploading ? 'Сохранение...' : allAssetsSaved ? 'Сохранено' : 'Сохранить имущество'
                            }}
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </template>

                <!-- Сообщение когда данных еще нет и нет ошибок -->
                <div v-else-if="!uploadProcess.errors.hasError && processedData.length === 0" class="text-center py-4">
                  <p>Нажмите "Обработать" для загрузки данных из JSON файла</p>
                </div>
              </v-container>

              <div v-else-if="processedData.length === 0 && !uploadProcess.uploading && !uploadProcess.errors.hasError">
                Данные будут отображены после обработки файла
              </div>
            </v-card-text>

            <v-card-actions>
              <v-row justify="end">
                <v-col md="auto" sm="auto">
                  <v-btn color="error" @click.native.stop="removeFile">
                    Удалить
                  </v-btn>
                </v-col>
                <v-col md="auto" sm="auto">
                  <v-btn
                      color="success"
                      @click.native.stop="processJson"
                      :disabled="uploadProcess.uploading"
                      v-if="templateType !== 'physical_person_assets' || processedData.length === 0"
                  >
                    {{ uploadProcess.uploading ? 'Обработка...' : 'Обработать' }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-container>
      </v-expansion-panel-content>
    </v-expansion-panel>

    <!-- Модальные окна -->
    <postEdit v-if="templateType === 'post'" @postUpdated="updatePost"></postEdit>
    <ChooseDocument v-if="templateType === 'post'" @chooseDocs="chooseDocs"></ChooseDocument>
    <BankAccountCreateModal v-if="templateType === 'bank_account'"
                            @updateAccount="updateAccountList"></BankAccountCreateModal>
    <PhysicalPersonForm
        v-if="showPersonFormModal"
        :showActionButton="true"
        @save="onPersonCreated"
        @closeModal="onPersonFormCloseModal"
    ></PhysicalPersonForm>
    <v-snackbar
        v-if="showSnackbar"
        v-model="showNotification"
        :timeout="notificationTimeout"
        :color="notificationType"
        tile
        multi-line
    >
      <v-icon left>
        {{ notificationType === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
      </v-icon>
      <div v-html="notificationMessage"></div>
      <template v-slot:action="{ attrs }">
        <v-btn
            text
            v-bind="attrs"
            @click="showNotification = false"
        >
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import {eventBus} from "@/bus";
import postEdit from "@/components/CRM/PaperFlow/Post/modal/PostEdit.vue";
import ChooseDocument from "@/components/CRM/PaperFlow/modal/ChooseDocument.vue";
import BankAccountCreateModal from "@/components/referenceBook/Bank/BankAccountCreateModal.vue";
import PhysicalPersonForm from "@/components/referenceBook/PhysicalPersonV2/PhysicalPersonForm.vue";
import {AssetSchemas} from '@/const/dataTypes'
import moment from 'moment';

export default {
  props: {
    uploadFile: File,
    templateType: {
      type: String,
      required: true,
      validator: value => ['post', 'bank_account', 'physical_person_assets'].includes(value)
    }
  },
  name: "JSONFileProcessing",
  data: () => ({
    processedData: [],
    postHeaders: [
      {text: 'РПО', value: 'rpo'},
      {text: 'Дата отправки', value: 'departure_date'},
      {text: 'Получатель', value: 'from_who.fullName'},
      {text: 'Проект', value: 'project'},
      {text: 'Действия', value: 'actions'},
    ],
    bankAccountHeaders: [
      {text: 'Номер счета', value: 'account'},
      {text: 'Банк', value: 'bank.name'},
      {text: 'Действия', value: 'actions'},
    ],
    uploadProcess: {
      uploaded: false,
      uploading: false,
      progress: '0',
      errors: {
        message: '',
        details: null,
        hasError: false
      }
    },
    templateError: false,
    errorMessage: '',
    showSnackbar: false,
    showNotification: false,
    valid: false,
    notificationMessage: '',
    notificationType: 'success',
    notificationTimeout: 2000,
    ownerData: null,
    selectedPersonId: null,
    loadingPersons: false,
    showPersonFormModal: false,
    expandedAssetPanels: [],
    autoMatchedPersons: [],
    personSearchInProgress: false,
    validationErrors: {},
    tempIdCounter: 0, // Добавляем счетчик для временных ID

    // Данные для формы имущества
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
    requiredRules: [v => !!v || 'Обязательное поле'],
  }),
  computed: {
    physicalPersonList() {
      return this.$store.getters.physicalPersonListDataV2 || [];
    },

    physicalPersonListWithEmpty() {
      return [...this.physicalPersonList];
    },

    allAssetsSaved() {
      // Фильтруем только не-дубликаты для проверки сохранения
      const nonDuplicateAssets = this.processedData.filter(asset => !asset.isDuplicate);

      return nonDuplicateAssets.length > 0 &&
          nonDuplicateAssets.every(asset => asset.id) &&
          !this.uploadProcess.errors.hasError;
    },

    duplicateAssetsCount() {
      return this.processedData.filter(asset => asset.isDuplicate).length;
    }
  },
  watch: {
    physicalPersonList: {
      handler(newList) {
        if (newList.length > 0 && this.ownerData) {
          this.autoMatchPerson();
        }
      },
      immediate: true
    },

    ownerData: {
      handler(newOwnerData) {
        if (newOwnerData && this.physicalPersonList.length > 0) {
          this.autoMatchPerson();
        }
      },
      immediate: true
    }
  },
  methods: {
    // Генерация временного ID
    generateTempId() {
      this.tempIdCounter++;
      return `temp_${Date.now()}_${this.tempIdCounter}`;
    },

    // Проверка валидности актива
    validateAsset(asset) {
      const errors = {};

      // Проверка основных полей
      const mainFields = ['category', 'asset_type', 'status', 'carrying_cost', 'market_cost'];
      mainFields.forEach(field => {
        if (!asset[field] && asset[field] !== 0) {
          errors[field] = 'Обязательное поле';
        }
      });

      // Проверка числовых полей
      if (asset.carrying_cost && isNaN(parseFloat(asset.carrying_cost))) {
        errors.carrying_cost = 'Должно быть числом';
      }
      if (asset.market_cost && isNaN(parseFloat(asset.market_cost))) {
        errors.market_cost = 'Должно быть числом';
      }

      // Проверка динамических полей
      if (asset.asset_type && AssetSchemas[asset.asset_type]) {
        const schemaFields = this.getSchemaFields(asset);
        Object.keys(schemaFields).forEach(key => {
          const fieldSchema = schemaFields[key];
          const value = asset.details[key];
          const rules = this.getFieldRules(fieldSchema, key);

          rules.forEach(rule => {
            const result = rule(value);
            if (typeof result === 'string') {
              if (!errors.details) errors.details = {};
              errors.details[key] = result;
            }
          });
        });
      }

      return Object.keys(errors).length > 0 ? errors : null;
    },

    // Валидация всех активов
    validateAllAssets() {
      const allErrors = {};
      let hasErrors = false;

      this.processedData.forEach((asset, index) => {
        if (asset.isDuplicate) return;

        const assetErrors = this.validateAsset(asset);
        if (assetErrors) {
          allErrors[index] = assetErrors;
          hasErrors = true;

          // Разворачиваем панель с ошибкой
          if (!this.expandedAssetPanels.includes(index)) {
            this.expandedAssetPanels.push(index);
          }
        }
      });

      return hasErrors ? allErrors : null;
    },

    // Проверка наличия ошибки для поля
    hasFieldError(asset, field) {
      const assetIndex = this.processedData.indexOf(asset);
      return !!(this.validationErrors[assetIndex] && this.validationErrors[assetIndex][field]);
    },

    // Получение текста ошибки для поля
    getFieldError(asset, field) {
      const assetIndex = this.processedData.indexOf(asset);
      return (this.validationErrors[assetIndex] && this.validationErrors[assetIndex][field]) || '';
    },

    // Очистка ошибки для поля при изменении
    clearFieldError(asset, field) {
      const assetIndex = this.processedData.indexOf(asset);
      if (this.validationErrors[assetIndex] && this.validationErrors[assetIndex][field]) {
        this.$delete(this.validationErrors[assetIndex], field);

        // Если больше нет ошибок для этого актива, удаляем запись
        if (Object.keys(this.validationErrors[assetIndex]).length === 0) {
          this.$delete(this.validationErrors, assetIndex);
        }
      }
    },

    // Проверка наличия ошибки для детального поля
    hasDetailFieldError(asset, field) {
      const assetIndex = this.processedData.indexOf(asset);
      return !!(
          this.validationErrors[assetIndex] &&
          this.validationErrors[assetIndex].details &&
          this.validationErrors[assetIndex].details[field]
      );
    },

    // Получение текста ошибки для детального поля
    getDetailFieldError(asset, field) {
      const assetIndex = this.processedData.indexOf(asset);
      return (
          this.validationErrors[assetIndex] &&
          this.validationErrors[assetIndex].details &&
          this.validationErrors[assetIndex].details[field]
      ) || '';
    },

    // Очистка ошибки для детального поля при изменении
    clearDetailFieldError(asset, field) {
      const assetIndex = this.processedData.indexOf(asset);
      if (this.validationErrors[assetIndex] &&
          this.validationErrors[assetIndex].details &&
          this.validationErrors[assetIndex].details[field]) {
        this.$delete(this.validationErrors[assetIndex].details, field);

        // Если в details больше нет ошибок, удаляем объект details
        if (Object.keys(this.validationErrors[assetIndex].details).length === 0) {
          this.$delete(this.validationErrors[assetIndex], 'details');
        }

        // Если больше нет ошибок для этого актива, удаляем запись
        if (Object.keys(this.validationErrors[assetIndex]).length === 0) {
          this.$delete(this.validationErrors, assetIndex);
        }
      }
    },

    // Метод сохранения с предварительной валидацией
    async validateAndSaveAssets() {
      // Сначала валидация формы Vuetify
      if (this.$refs.assetsForm && !this.$refs.assetsForm.validate()) {
        this.showNotificationMessage('Форма не валидна. Проверьте обязательные поля.', 'error');
        return;
      }

      // Затем кастомная валидация всех активов
      this.validationErrors = this.validateAllAssets() || {};

      if (Object.keys(this.validationErrors).length > 0) {
        // Формируем сообщение об ошибках
        const errorMessages = [];
        Object.keys(this.validationErrors).forEach(assetIndex => {
          const asset = this.processedData[assetIndex];
          const errors = this.validationErrors[assetIndex];

          errorMessages.push(`Актив "${this.getAssetTitle(asset)}":`);

          Object.keys(errors).forEach(field => {
            if (field === 'details') {
              Object.keys(errors.details).forEach(detailField => {
                errorMessages.push(`  - ${detailField}: ${errors.details[detailField]}`);
              });
            } else {
              errorMessages.push(`  - ${field}: ${errors[field]}`);
            }
          });
        });

        this.showNotificationMessage(
            `Обнаружены ошибки валидации:<br>${errorMessages.join('<br>')}`,
            'error'
        );
        return;
      }

      // Если валидация прошла успешно, сохраняем
      await this.saveAssets();
    },

    getErrorMessage(error) {
      const fieldLabels = {
        'ogrnip': 'ОГРНИП',
        'opening_date': 'Дата открытия',
        'last_name': 'Фамилия',
        'first_name': 'Имя',
        'birthday': 'Дата рождения',
        "special_statuses": 'Ошибка спец статуса',
        "assets": 'Имущество'
      };

      if (error.isValidationError) {
        return error.message;
      }
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const messages = [];

        const processErrors = (errorObj, prefix = '') => {
          if (Array.isArray(errorObj)) {
            errorObj.forEach((item, index) => {
              if (typeof item === 'string') {
                messages.push(`<b>${prefix}</b>: ${item}`);
              } else if (typeof item === 'object' && item !== null) {
                processErrors(item, `${prefix}[${index}]`);
              }
            });
          } else if (typeof errorObj === 'object' && errorObj !== null) {
            for (const [field, errorsList] of Object.entries(errorObj)) {
              const fieldName = fieldLabels[field] || field;
              const fullPath = prefix ? `${prefix}.${fieldName}` : fieldName;

              if (Array.isArray(errorsList)) {
                errorsList.forEach(errorMsg => {
                  if (typeof errorMsg === 'string') {
                    messages.push(`<b>${fullPath}</b>: ${errorMsg}`);
                  } else if (typeof errorMsg === 'object' && errorMsg !== null) {
                    processErrors(errorMsg, fullPath);
                  }
                });
              } else if (typeof errorsList === 'string') {
                messages.push(`<b>${fullPath}</b>: ${errorsList}`);
              }
            }
          }
        };

        processErrors(errors);

        if (messages.length === 0) {
          return 'Произошла ошибка при сохранении';
        }

        return `Обнаружены ошибки в форме:<br>${messages.join('<br>')}`;
      }
      if (error.response?.data?.message) {
        return error.response.data.message;
      }
      return 'Произошла ошибка при сохранении';
    },

    showNotificationMessage(message, type = 'success') {
      this.notificationMessage = message;
      this.notificationType = type;
      this.showNotification = true;

      // Для ошибок не auto-close, только по кнопке
      this.notificationTimeout = type === 'error' ? -1 : 6000;
    },

    editBankAccount(item) {
      if (item.hasOwnProperty('created')) {
        this.$emit('addBankAccount', item)
      } else {
        this.$emit('editBankAccount', item)
      }
    },

    updateAccountList(item) {
      this.processedData = this.processedData.map(obj => {
        if (obj.account === item.account) {
          return item;
        }
        return obj;
      });
    },

    updatePost() {
      this.$store.dispatch('getPostDetail', this.currentItem?.pk).then(updatedData => {
        const index = this.processedData.findIndex(item => item.pk === updatedData?.pk);
        if (index !== -1) {
          this.$set(this.processedData, index, {
            ...this.processedData[index],
            ...updatedData,
            project: this.formatProjectNames(updatedData.project || this.processedData[index].project)
          });
          this.currentItem = this.processedData[index];
        }
      });
      this.currentItem = null;
    },

    async chooseDocs(data) {
      for (let doc of data.chooseDocs) {
        let formData = new FormData()
        formData.append('post', this.currentItem?.pk)
        formData.append('doc', doc.id)
        await this.$store.dispatch('addDocToPost', formData).then(() => {
          this.update()
        })
      }
    },

    formatProjectNames(projects) {
      if (!projects) return '';
      if (typeof projects === 'string') return projects;
      if (Array.isArray(projects)) {
        return projects.map(proj => proj.name || '').join(', ');
      }
      return '';
    },

    editPost(item) {
      this.$emit('editPost', item.pk)
    },

    selectFile(item) {
      this.currentItem = item;
      let args = {departure_date: this.currentItem.departure_date}
      if (this.currentItem.from_who?.type) {
        args['from_who'] = {
          type: this.currentItem.from_who.type,
          uuid: this.currentItem.from_who.uuid
        }
      }
      this.$emit('chooseDocs', args)
    },

    removeFile() {
      this.$destroy();
      this.$el.parentNode.removeChild(this.$el);
      this.uploadProcess.uploaded = true
    },

    async processJson() {
      if (this.templateType === 'physical_person_assets' && this.processedData.length > 0) {
        await this.saveAssets();
        return;
      }

      this.uploadProcess.errors = {
        message: '',
        details: null,
        hasError: false
      };

      this.uploadProcess.uploading = true;

      try {
        if (this.templateType === 'post') {
          await this.processJsonPost();
        } else if (this.templateType === 'bank_account') {
          await this.processJsonBankAccount();
        } else if (this.templateType === 'physical_person_assets') {
          await this.processPhysicalPersonAssets();
        }

        this.uploadProcess.uploading = false;

        // Загружаем список физ.лиц для выбора
        if (this.templateType === 'physical_person_assets') {
          await this.loadPhysicalPersons();
        }

      } catch (err) {
        console.error('Ошибка обработки JSON:', err);
        this.uploadProcess.uploading = false;
        this.uploadProcess.errors.hasError = true;

        if (err.response && err.response.data) {
          const errorData = err.response.data;
          if (errorData.error && errorData.details) {
            this.uploadProcess.errors.message = errorData.error;
            this.uploadProcess.errors.details = errorData.details;
          } else if (errorData.errors) {
            this.uploadProcess.errors.message = errorData.errors.error || 'Неизвестная ошибка';
            this.uploadProcess.errors.details = errorData.errors.details || errorData.errors;
          } else if (errorData.error) {
            this.uploadProcess.errors.message = errorData.error;
            this.uploadProcess.errors.details = errorData.details || null;
          } else {
            this.uploadProcess.errors.message = 'Ошибка обработки файла';
            this.uploadProcess.errors.details = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
          }
        } else {
          this.uploadProcess.errors.message = 'Ошибка соединения с сервером';
          this.uploadProcess.errors.details = err.message || 'Неизвестная ошибка';
        }
      }
    },

    async processJsonPost() {
      let formData = new FormData();
      formData.set('file', this.uploadFile);
      formData.set('processingType', 'json');
      formData.set('processingContent', 'post');

      const data = await this.$store.dispatch('jsonPostProcessing', {
        formData,
        'file': this.uploadFile,
        'processingContent': 'post'
      });
      this.processedData = [...data];
    },

    async processJsonBankAccount() {
      let formData = new FormData();
      formData.set('file', this.uploadFile);
      formData.set('processingType', 'json');
      formData.set('processingContent', 'bank_account');

      const data = await this.$store.dispatch('jsonPostProcessing', {
        formData,
        'file': this.uploadFile,
        'processingContent': 'bank_account'
      });
      this.processedData = [...data];
    },

    readJsonFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target.result);
            resolve(jsonData);
          } catch (error) {
            reject(new Error('Неверный формат JSON файла'));
          }
        };
        reader.onerror = () => {
          reject(new Error('Ошибка чтения файла'));
        };
        reader.readAsText(file);
      });
    },

    async processPhysicalPersonAssets() {
      try {
        const jsonData = await this.readJsonFile(this.uploadFile);
        this.ownerData = jsonData.owner || {};

        if (!jsonData.assets || !Array.isArray(jsonData.assets)) {
          throw new Error('В JSON отсутствует массив assets');
        }

        const processedAssets = jsonData.assets.map((jsonAsset, index) => {
          return this.transformJsonAsset(jsonAsset);
        });

        this.processedData = processedAssets;

        if (processedAssets.length > 0) {
          this.expandedAssetPanels = [0];
        }
      } catch (error) {
        console.error('Ошибка обработки JSON:', error);
        throw error;
      }
    },

    transformJsonAsset(jsonAsset) {
      const categoryMapping = {
        'движимое имущество': 'Движимое имущество',
        'недвижимое имущество': 'Недвижимое имущество',
        'денежные средства': 'Денежные средства',
        'иное имущество': 'Иное имущество',
        'дебиторская задолженность': 'Дебиторская задолженность',
        'ценные бумаги': 'Ценные бумаги',
        'акции и участие': 'Акции и участие',
      };

      const statusMapping = {
        'active': 'active',
        'inactive': 'inactive',
        'leased': 'leased',
        'disputed': 'disputed'
      };

      let assetType = jsonAsset.type;
      if (!AssetSchemas[assetType]) {
        const similarType = Object.keys(AssetSchemas).find(key =>
            key.toLowerCase() === assetType.toLowerCase()
        );
        if (similarType) {
          assetType = similarType;
        } else {
          throw new Error(`Неизвестный тип имущества: ${assetType}`);
        }
      }

      const formatDate = (dateString) => {
        if (!dateString) return null;
        try {
          return moment(dateString, 'YYYY-MM-DD').format('DD.MM.YYYY');
        } catch (error) {
          return dateString;
        }
      };

      const asset = {
        id: null,
        category: categoryMapping[jsonAsset.category] || jsonAsset.category || '',
        asset_type: assetType,
        acquisition_date: formatDate(jsonAsset.acquisition_date),
        disposal_date: formatDate(jsonAsset.disposal_date),
        status: statusMapping[jsonAsset.status] || jsonAsset.status || 'active',
        carrying_cost: 0,
        market_cost: 0,
        details: {}
      };

      // Обработка details с учетом схемы
      if (jsonAsset.details) {
        const schema = AssetSchemas[assetType];
        Object.keys(jsonAsset.details).forEach(key => {
          let value = jsonAsset.details[key];

          // Получаем схему поля
          const fieldSchema = schema?.properties?.[key];

          // Преобразование единиц измерения для unit
          if (key === 'unit' && typeof value === 'string') {
            value = this.normalizeUnit(value);
          }

          // Если значение пустое
          if (value === null || value === undefined || value === '') {
            // Для полей с minLength: 1 (как vin) - не добавляем вообще
            if (fieldSchema && fieldSchema.type === 'string' && fieldSchema.minLength === 1) {
              return; // Пропускаем это поле
            }

            // Обработка по типу данных
            if (fieldSchema) {
              switch (fieldSchema.type) {
                case 'boolean':
                  asset.details[key] = false;
                  break;
                case 'number':
                case 'integer':
                  asset.details[key] = 0;
                  break;
                case 'string':
                default:
                  asset.details[key] = '';
                  break;
              }
            } else {
              asset.details[key] = '';
            }
          } else {
            // Если значение не пустое
            if (fieldSchema) {
              switch (fieldSchema.type) {
                case 'boolean':
                  asset.details[key] = Boolean(value);
                  break;
                case 'number':
                case 'integer':
                  asset.details[key] = Number(value) || 0;
                  break;
                case 'string':
                  asset.details[key] = String(value);
                  break;
                default:
                  asset.details[key] = value;
              }
            } else {
              asset.details[key] = value;
            }
          }
        });
      }

      this.initAssetDetails(asset);
      return asset;
    },

    normalizeUnit(unit) {
      if (!unit) return '';

      // Приводим к нижнему регистру и убираем пробелы
      const normalized = unit.toLowerCase().trim();

      // Маппинг альтернативных вариантов к стандартным
      const unitMapping = {
        'м2': 'кв. м',
        'м²': 'кв. м',
        'м.кв.': 'кв. м',
        'м кв': 'кв. м',
        'кв.м': 'кв. м',
        'кв м': 'кв. м',
        'sq.m': 'кв. м',
        'sq m': 'кв. м',
        'm²': 'кв. м',
        'm2': 'кв. м',
        'л/с': 'л.с.',
        'л.с': 'л.с.',
        'hp': 'л.с.',
        'лс': 'л.с.'
      };

      // Проверяем, есть ли маппинг для этой единицы
      return unitMapping[normalized] || unit;
    },

    initAssetDetails(asset) {
      if (!asset.details) {
        asset.details = {};
      }

      if (asset.asset_type && AssetSchemas[asset.asset_type]) {
        const schema = AssetSchemas[asset.asset_type];
        if (schema.properties) {
          Object.keys(schema.properties).forEach(key => {
            // Если поле уже есть, но оно null или undefined
            if (asset.details[key] === null || asset.details[key] === undefined) {
              const field = schema.properties[key];

              // Устанавливаем значение по умолчанию из схемы
              if (field.default !== undefined) {
                asset.details[key] = field.default;
              } else {
                // Для полей с minLength: 1 не устанавливаем значение по умолчанию
                if (field.type === 'boolean') {
                  asset.details[key] = false;
                } else if (field.type === 'number' || field.type === 'integer') {
                  asset.details[key] = 0;
                } else if (field.type === 'string') {
                  // Только для строк без minLength: 1 устанавливаем пустую строку
                  if (field.minLength !== 1) {
                    asset.details[key] = '';
                  }
                }
              }
            } else if (key === 'unit' && asset.details[key]) {
              // Нормализуем единицу измерения, если она уже есть
              asset.details[key] = this.normalizeUnit(asset.details[key]);
            }
          });
        }
      }
    },

    async loadPhysicalPersons() {
      this.loadingPersons = true;
      try {
        await this.$store.dispatch('fetchPhysicalPersons');
      } catch (error) {
        console.error('Ошибка загрузки физ.лиц:', error);
      } finally {
        this.loadingPersons = false;
      }
    },

    getOwnerFullName() {
      if (!this.ownerData) return 'Не указано';
      const {last_name, first_name, patronymic} = this.ownerData;
      return `${last_name || ''} ${first_name || ''} ${patronymic || ''}`.trim();
    },

    autoMatchPerson() {
      if (!this.ownerData || !this.physicalPersonList.length) {
        return;
      }

      this.personSearchInProgress = true;
      const {last_name, first_name, patronymic} = this.ownerData;

      if (!last_name || !first_name) {
        this.personSearchInProgress = false;
        return;
      }

      const matchedPersons = this.physicalPersonList.filter(person => {
        if (!person.last_name || !person.first_name) return false;

        const lastNameMatch = this.normalizeString(person.last_name) === this.normalizeString(last_name);
        const firstNameMatch = this.normalizeString(person.first_name) === this.normalizeString(first_name);

        if (!lastNameMatch || !firstNameMatch) return false;

        if (patronymic) {
          const patronymicMatch = person.middle_name &&
              this.normalizeString(person.middle_name) === this.normalizeString(patronymic);
          if (!person.middle_name) return false;
          return patronymicMatch;
        }

        return true;
      });

      this.autoMatchedPersons = matchedPersons.map(person => ({
        ...person,
        isAutoMatch: true
      }));

      if (this.autoMatchedPersons.length === 1 && !this.selectedPersonId) {
        this.selectedPersonId = this.autoMatchedPersons[0].id;
      }

      this.personSearchInProgress = false;
    },

    normalizeString(str) {
      if (!str) return '';
      return str.toString().toLowerCase().trim();
    },

    onPersonSelected(person) {
      this.selectedPersonId = person ? person.id : null;
      this.uploadProcess.errors.hasError = false;
    },

    createNewPerson() {
      this.showPersonFormModal = true;
    },

    onPersonCreated(person) {
      this.selectedPersonId = person.id;
      this.showPersonFormModal = false;
      this.loadPhysicalPersons();
      this.uploadProcess.errors.hasError = false;
    },

    onPersonFormCloseModal() {
      this.showPersonFormModal = false;
    },

    getIdentifiersText(person) {
      if (!person.identifiers || !Array.isArray(person.identifiers)) return '';

      const identifiers = person.identifiers
          .map(id => id.identifier)
          .filter(Boolean)
          .filter(Array.isArray)
          .map(arr => arr
              .map(item => item.type && item.value ? `${item.type}: ${item.value}` : '')
              .filter(Boolean)
              .join(', ')
          )
          .filter(Boolean);

      return identifiers.join('; ');
    },

    getAssetTitle(asset) {
      if (!asset) return "Имущество";
      const category = asset.category ? `${asset.category}` : "Без категории";
      const type = asset.asset_type ? `${asset.asset_type}` : "Без типа";
      return `${category} - ${type}`;
    },

    formatDate(dateString) {
      if (!dateString || dateString === 'отсутствует информация' || dateString === 'null') return '';
      if (dateString.includes('-')) {
        return moment(dateString, 'YYYY-MM-DD').format('DD.MM.YYYY');
      } else if (dateString.includes('.')) {
        return dateString;
      }
      return dateString;
    },

    getStatusText(statusValue) {
      const statusMap = {
        'active': 'Активный',
        'inactive': 'Неактивный',
        'disputed': 'Оспаривается',
        'leased': 'В аренде',
        'under repair': 'На ремонте',
        'outstanding': 'Просрочен'
      };
      return statusMap[statusValue] || statusValue;
    },

    getStatusClass(status) {
      const statusClasses = {
        'active': 'success--text',
        'inactive': 'grey--text',
        'disputed': 'error--text',
        'leased': 'warning--text',
        'under repair': 'info--text',
        'outstanding': 'error--text'
      };
      return statusClasses[status] || '';
    },

    showDuplicateDetails(asset) {
      if (!asset.isDuplicate || !asset.duplicateInfo) return;

      const duplicates = asset.duplicateInfo.allDuplicates || [asset.duplicateInfo];
      const duplicateIds = duplicates.map(d => d.duplicate_id).join(', ');

      this.$store.dispatch('showDialog', {
        title: 'Информация о дубликате',
        text: `
            <div>
                <p><strong>Актив:</strong> ${this.getAssetTitle(asset)}</p>
                <p><strong>ID существующих активов:</strong> ${duplicateIds}</p>
                <div class="mt-2">
                    <strong>Совпадения по полям:</strong>
                    <ul style="margin-top: 4px; padding-left: 20px;">
                        ${duplicates.map(dup => {
          if (dup.fields && Array.isArray(dup.fields)) {
            const fieldsText = dup.fields.map(f =>
                `<li>${f.field}: "${f.value}"</li>`
            ).join('');
            return fieldsText;
          }
          return `<li>Дубликат ID: ${dup.duplicate_id}</li>`;
        }).join('')}
                    </ul>
                </div>
                <div class="mt-3 text-caption">
                    Этот актив уже существует в системе. Для редактирования используйте существующую запись.
                </div>
            </div>
        `,
        type: 'info',
        buttons: [
          {text: 'Понятно', color: 'primary'}
        ]
      });
    },

    removeAsset(index) {
      this.processedData.splice(index, 1);
      this.expandedAssetPanels = this.expandedAssetPanels
          .map(i => i > index ? i - 1 : i)
          .filter(i => i !== index);
      this.uploadProcess.uploaded = false;

      // Удаляем ошибки валидации для удаленного актива
      if (this.validationErrors[index]) {
        delete this.validationErrors[index];
        // Перенумеровываем ошибки
        const newErrors = {};
        Object.keys(this.validationErrors).forEach(key => {
          const newKey = key > index ? key - 1 : key;
          newErrors[newKey] = this.validationErrors[key];
        });
        this.validationErrors = newErrors;
      }
    },

    onAssetTypeChange(asset) {
      asset.details = {};
      this.initAssetDetails(asset);
      this.uploadProcess.errors.hasError = false;

      // Удаляем ошибки валидации для этого актива при смене типа
      const assetIndex = this.processedData.indexOf(asset);
      if (this.validationErrors[assetIndex]) {
        delete this.validationErrors[assetIndex];
      }
    },

    getSchemaFields(asset) {
      if (!asset.asset_type || !AssetSchemas[asset.asset_type]) {
        return {};
      }
      const schema = AssetSchemas[asset.asset_type];
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

    getFieldRules(field, fieldKey) {
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
        if (field.pattern) {
          const regex = new RegExp(field.pattern);
          rules.push(v => !v || regex.test(v) ||
              `Неверный формат. Пример: ${field.patternDescription || field.pattern}`);
        }
        if (fieldKey === 'unit' && field.enum && field.enum.length > 0) {
          rules.push(v => !v || field.enum.includes(v) ||
              `Допустимые значения: ${field.enum.join(', ')}`);
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
      if (field.enum && field.enum.length > 0) {
        attrs.items = field.enum;
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

    async saveAssets() {
      if (!this.selectedPersonId) {
        this.uploadProcess.errors = {
          message: 'Выберите физ. лицо для привязки имущества',
          hasError: true,
          details: null
        };
        return;
      }

      try {
        this.uploadProcess.uploading = true;
        this.uploadProcess.errors.hasError = false;
        this.uploadProcess.errors.message = '';
        this.uploadProcess.errors.details = null;

        // Сбрасываем флаги дубликатов
        this.processedData.forEach(asset => {
          this.$set(asset, 'isDuplicate', false);
          this.$set(asset, 'duplicateInfo', null);
        });

        const assetsToSave = this.processedData.map(asset => ({
          ...asset,
          owner: this.selectedPersonId
        }));

        const result = await this.$store.dispatch('savePersonAssets', assetsToSave);

        console.log('Результат сохранения:', result);

        // Обрабатываем сохраненные активы
        if (result.saved_assets && Array.isArray(result.saved_assets)) {
          console.log('Сохраненные активы:', result.saved_assets.length);

          // Сопоставляем сохраненные активы по порядку и деталям
          result.saved_assets.forEach(savedAsset => {
            // Ищем соответствующий актив в processedData
            const index = this.findMatchingAsset(savedAsset);

            if (index !== -1) {
              console.log(`Найден сохраненный актив на позиции ${index}:`, savedAsset.id);

              // Обновляем данные актива
              this.$set(this.processedData[index], 'id', savedAsset.id);
              this.$set(this.processedData[index], 'isDuplicate', false);
              this.$set(this.processedData[index], 'duplicateInfo', null);

              // Обновляем основные поля
              const fieldsToUpdate = ['category', 'asset_type', 'acquisition_date',
                'disposal_date', 'status', 'carrying_cost',
                'market_cost', 'details'];
              fieldsToUpdate.forEach(field => {
                if (savedAsset[field] !== undefined) {
                  this.$set(this.processedData[index], field, savedAsset[field]);
                }
              });
            } else {
              console.warn('Не найден актив для сохраненного:', savedAsset);
            }
          });
        }

        // Обрабатываем дубликаты
        if (result.duplicates && Array.isArray(result.duplicates)) {
          console.log('Обработка дубликатов:', result.duplicates.length);

          result.duplicates.forEach(duplicate => {
            // Ищем актив по данным из duplicate.data
            const index = this.findMatchingAsset(duplicate.data || duplicate);

            if (index !== -1) {
              console.log(`Найден дубликат на позиции ${index}`);

              const duplicateInfo = {
                duplicate_id: duplicate.duplicate_id || null,
                fields: duplicate.fields || [],
                message: duplicate.message || 'Дубликат актива',
                data: duplicate.data || duplicate,
                count: duplicate.count || 1
              };

              // Помечаем как дубликат
              this.$set(this.processedData[index], 'isDuplicate', true);
              this.$set(this.processedData[index], 'duplicateInfo', duplicateInfo);
              // Для дубликатов ID не устанавливаем
              this.$set(this.processedData[index], 'id', null);
            }
          });
        }

        this.uploadProcess.uploading = false;

        console.log('После сохранения:', JSON.stringify(this.processedData, null, 2));

        // Проверяем, все ли активы обработаны
        const allProcessed = this.processedData.every(asset =>
            asset.id || asset.isDuplicate
        );

        if (allProcessed) {
          this.uploadProcess.uploaded = true;
          this.$emit('assetsSaved', {
            personId: this.selectedPersonId,
            savedCount: result.saved_assets ? result.saved_assets.length : 0,
            duplicateCount: result.duplicates ? result.duplicates.length : 0,
            fileName: this.uploadFile.name
          });
        }

        // Принудительная перерисовка
        this.$nextTick(() => {
          this.forcePanelUpdate();
        });

      } catch (error) {
        console.error('Ошибка сохранения имущества:', error);
        console.error('Детали ошибки:', error.response?.data || error.message);

        this.uploadProcess.uploading = false;
        this.uploadProcess.uploaded = false;

        const errorMsg = this.getErrorMessage(error);
        this.showNotificationMessage(errorMsg, 'error');
      }
    },

// Новый метод для поиска соответствующего актива
    findMatchingAsset(serverAsset) {
      return this.processedData.findIndex(localAsset => {
        // 1. Проверяем по основным полям
        const mainFieldsMatch =
            localAsset.category === serverAsset.category &&
            localAsset.asset_type === serverAsset.asset_type &&
            this.formatDateForCompare(localAsset.acquisition_date) ===
            this.formatDateForCompare(serverAsset.acquisition_date);

        if (!mainFieldsMatch) return false;

        // 2. Проверяем по деталям
        const localDetails = localAsset.details || {};
        const serverDetails = serverAsset.details || {};

        // Для недвижимости - кадастровый номер
        if (localDetails.cadastre_number && serverDetails.cadastre_number) {
          return localDetails.cadastre_number === serverDetails.cadastre_number;
        }

        // Для автомобилей - VIN
        if (localDetails.vin && serverDetails.vin) {
          return localDetails.vin === serverDetails.vin;
        }

        // Для автомобилей - регистрационный номер
        if (localDetails.registration_number && serverDetails.registration_number) {
          return localDetails.registration_number === serverDetails.registration_number;
        }

        // Для адреса
        if (localDetails.address && serverDetails.address) {
          return localDetails.address === serverDetails.address;
        }

        // Если нет уникальных полей, проверяем все поля
        return this.compareObjects(localDetails, serverDetails);
      });
    },

// Метод для сравнения объектов
    compareObjects(obj1, obj2) {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);

      if (keys1.length !== keys2.length) return false;

      for (let key of keys1) {
        if (String(obj1[key]) !== String(obj2[key])) {
          return false;
        }
      }

      return true;
    },

    formatDateForCompare(dateStr) {
      if (!dateStr) return null;
      try {
        // Конвертируем дату в единый формат для сравнения
        if (dateStr.includes('.')) {
          const [day, month, year] = dateStr.split('.');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else if (dateStr.includes('-')) {
          return dateStr;
        }
        return dateStr;
      } catch (e) {
        console.error('Ошибка форматирования даты:', e, dateStr);
        return dateStr;
      }
    },

    forcePanelUpdate() {
      // Принудительная перерисовка панелей
      const temp = [...this.expandedAssetPanels];
      this.expandedAssetPanels = [];
      this.$nextTick(() => {
        this.expandedAssetPanels = temp;
      });
    },

    rowClass(item) {
      if (item.hasOwnProperty('created')) {
        return 'created-false'
      }
    }
  },
  mounted() {
    eventBus.$on('updateProgress', ({progress, file}) => {
      this.uploadProcess.progress = progress
    })
  },
  components: {
    ChooseDocument,
    postEdit,
    BankAccountCreateModal,
    PhysicalPersonForm
  }
}
</script>

<style scoped>
>>> .created-false {
  background-color: #c1020226;
}

.error-message {
  font-size: 0.875rem;
  max-width: 300px;
  word-break: break-word;
}

.v-alert {
  margin-bottom: 16px;
}

.v-list-item__title {
  font-size: 0.75rem !important;
  line-height: 1.2 !important;
}

.identifier-panel {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

/* Стили для дубликатов (существующих активов) */
.duplicate-panel {
  background-color: rgba(33, 150, 243, 0.08) !important;
  border-left: 4px solid #2196F3 !important;
  margin-bottom: 8px;
}

.duplicate-panel .v-expansion-panel-header {
  background-color: rgba(33, 150, 243, 0.05) !important;
}

/* Стили для успешно созданных активов */
.success-panel {
  background-color: rgba(76, 175, 80, 0.08) !important;
  border-left: 4px solid #4CAF50 !important;
  margin-bottom: 8px;
}

.success-panel .v-expansion-panel-header {
  background-color: rgba(76, 175, 80, 0.05) !important;
}

/* Цвета текста */
.info--text {
  color: #2196F3 !important;
  font-weight: 500;
}

.success--text {
  color: #4CAF50 !important;
  font-weight: 500;
}

.error--text {
  color: #F44336 !important;
  font-weight: 500;
}

.warning--text {
  color: #FF9800 !important;
  font-weight: 500;
}

.grey--text {
  color: #9E9E9E !important;
}

/* Стили для тултипов */
.v-tooltip__content {
  font-size: 12px !important;
  max-width: 300px;
  white-space: normal;
  line-height: 1.4;
}

/* Эффекты при наведении */
>>> .duplicate-panel:hover {
  background-color: rgba(33, 150, 243, 0.12) !important;
  transition: background-color 0.2s;
}

>>> .success-panel:hover {
  background-color: rgba(76, 175, 80, 0.12) !important;
  transition: background-color 0.2s;
}

/* Отключенные поля в дубликатах */
.duplicate-panel .v-input--is-disabled .v-input__slot {
  background-color: rgba(0, 0, 0, 0.02) !important;
}

/* Иконки в заголовке */
>>> .v-expansion-panel-header__icon .v-icon {
  transition: transform 0.3s !important;
}

>>> .v-expansion-panel-header--active .v-expansion-panel-header__icon .v-icon {
  transform: rotate(180deg) !important;
}

/* Кастомные стили для чипов */
.v-chip--x-small {
  height: 20px !important;
  font-size: 10px !important;
}

/* Стили для заголовков панелей */
.v-expansion-panel-header {
  min-height: 56px !important;
}

/* Стили для иконок в заголовке */
.v-expansion-panel-header__icon i {
  font-size: 24px !important;
}

/* Улучшенные отступы */
.v-expansion-panel-content__wrap {
  padding: 16px 24px !important;
}

/* Анимация раскрытия панели */
.v-expansion-panel-content {
  transition: all 0.3s ease !important;
}
</style>