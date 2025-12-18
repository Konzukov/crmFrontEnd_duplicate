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
                                <div v-if="asset.duplicateInfo.duplicate_id" class="mt-1" style="font-size: 0.875rem;">
                                  <strong>ID существующего актива:</strong> {{ asset.duplicateInfo.duplicate_id }}
                                </div>
                              </v-alert>

                              <!-- Форма только для не-дубликатов -->
                              <template v-if="!asset.isDuplicate">
                                <v-row>
                                  <v-col cols="12" md="5">
                                    <v-autocomplete
                                        hide-details
                                        outlined dense
                                        v-model="asset.category"
                                        :items="assetCategories"
                                        label="Категория*"
                                        :rules="requiredRules"
                                    />
                                  </v-col>

                                  <v-col cols="12" md="5">
                                    <v-autocomplete
                                        hide-details
                                        outlined dense
                                        v-model="asset.asset_type"
                                        :items="assetTypes"
                                        label="Тип*"
                                        :rules="requiredRules"
                                        @change="onAssetTypeChange(asset)"
                                    />
                                  </v-col>

                                  <v-col cols="12" md="4">
                                    <DatePicker
                                        hide-details
                                        v-model="asset.acquisition_date"
                                        value-type="format"
                                        format="DD.MM.YYYY"
                                        placeholder="Дата приобретения"
                                        :clearable="false"
                                    />
                                  </v-col>

                                  <v-col cols="12" md="4">
                                    <DatePicker
                                        hide-details
                                        v-model="asset.disposal_date"
                                        value-type="format"
                                        format="DD.MM.YYYY"
                                        placeholder="Дата выбытия"
                                        :clearable="false"
                                    />
                                  </v-col>

                                  <v-col cols="12" md="4">
                                    <v-autocomplete
                                        hide-details
                                        outlined dense
                                        v-model="asset.status"
                                        :items="assetStatuses"
                                        label="Статус*"
                                        :rules="requiredRules"
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

                      <v-row class="mt-4" justify="center">
                        <v-col cols="auto">
                          <v-btn color="success" @click="saveAssets"
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

    // Данные для обработки имущества физ.лиц
    ownerData: null,
    selectedPersonId: null,
    loadingPersons: false,
    showPersonFormModal: false,
    expandedAssetPanels: [],
    autoMatchedPersons: [],
    personSearchInProgress: false,

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
    // Основные методы
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

    // Методы для обработки JSON
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

    // Методы для чтения JSON файла
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

    // Обработка JSON с имуществом физ.лиц
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

    // Трансформация JSON актива в формат компонента
    transformJsonAsset(jsonAsset) {
      const categoryMapping = {
        'движимое имущество': 'Движимое имущество',
        'недвижимое имущество': 'Недвижимое имущество',
        'денежные средства': 'Денежные средства',
        'иное имущество': 'Иное имущество',
        'дебиторская задолженность': 'Дебиторская задолженность',
        'ценные бумаги': 'Ценные бумаги',
        'акции и участие': 'Акции и участие'
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
        category: categoryMapping[jsonAsset.category] || jsonAsset.category,
        asset_type: assetType,
        acquisition_date: formatDate(jsonAsset.acquisition_date),
        disposal_date: formatDate(jsonAsset.disposal_date),
        status: statusMapping[jsonAsset.status] || jsonAsset.status || 'active',
        details: {}
      };

      if (jsonAsset.details) {
        const schema = AssetSchemas[assetType];
        Object.keys(jsonAsset.details).forEach(key => {
          const value = jsonAsset.details[key];
          if (schema.properties && schema.properties[key]) {
            const fieldSchema = schema.properties[key];
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
        });
      }

      this.initAssetDetails(asset);
      return asset;
    },

    initAssetDetails(asset) {
      if (!asset.details) {
        asset.details = {};
      }

      if (asset.asset_type && AssetSchemas[asset.asset_type]) {
        const schema = AssetSchemas[asset.asset_type];
        if (schema.properties) {
          Object.keys(schema.properties).forEach(key => {
            if (asset.details[key] === undefined) {
              const field = schema.properties[key];
              if (field.type === 'boolean') {
                asset.details[key] = field.default !== undefined ? field.default : false;
              } else if (field.type === 'number' || field.type === 'integer') {
                asset.details[key] = field.default !== undefined ? field.default : 0;
              } else if (field.type === 'string') {
                asset.details[key] = field.default !== undefined ? field.default : '';
              }
            }
          });
        }
      }
    },

    // Методы для работы с физ.лицами
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

    // Автоматический подбор физ.лица
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
      if (!dateString) return '';
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

    addAsset() {
      const newAsset = {
        id: null,
        category: "",
        asset_type: "",
        acquisition_date: null,
        disposal_date: null,
        status: "active",
        details: {},
      };
      this.initAssetDetails(newAsset);
      this.processedData.push(newAsset);
      this.expandedAssetPanels.push(this.processedData.length - 1);
      this.uploadProcess.uploaded = false;
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
    },

    onAssetTypeChange(asset) {
      asset.details = {};
      this.initAssetDetails(asset);
      this.uploadProcess.errors.hasError = false;
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
      if (fieldKey === 'vin') {
        rules.push(v => !v || v.length === 17 ||
            'VIN номер должен содержать ровно 17 символов');
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

    formatDateForCompare(dateStr) {
      if (!dateStr) return null;
      try {
        return moment(dateStr, 'DD.MM.YYYY').format('YYYY-MM-DD');
      } catch (e) {
        return dateStr;
      }
    },

    // Сохранение имущества
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

    // Сбрасываем флаги дубликатов перед сохранением
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

    // Обрабатываем сохраненные активы (должны быть зелеными)
    if (result.saved_assets && Array.isArray(result.saved_assets)) {
      result.saved_assets.forEach(savedAsset => {
        // Находим соответствующий актив в processedData
        const index = this.processedData.findIndex(asset => {
          // Сравниваем по уникальным идентификаторам
          if (savedAsset.details) {
            // Для недвижимости - кадастровый номер
            if (savedAsset.details.cadastre_number &&
                asset.details?.cadastre_number === savedAsset.details.cadastre_number) {
              return true;
            }
            // Для автомобилей - VIN или регистрационный номер
            if (savedAsset.details.vin &&
                asset.details?.vin === savedAsset.details.vin) {
              return true;
            }
            if (savedAsset.details.registration_number &&
                asset.details?.registration_number === savedAsset.details.registration_number) {
              return true;
            }
          }

          // Fallback: сравниваем по основным полям
          return asset.category === savedAsset.category &&
                 asset.asset_type === savedAsset.asset_type &&
                 this.formatDateForCompare(asset.acquisition_date) ===
                 this.formatDateForCompare(savedAsset.acquisition_date) &&
                 asset.details?.address === savedAsset.details?.address;
        });

        if (index !== -1) {
          // Обновляем ID сохраненного актива
          this.$set(this.processedData[index], 'id', savedAsset.id);
          this.$set(this.processedData[index], 'isDuplicate', false);
          this.$set(this.processedData[index], 'duplicateInfo', null);

          // Принудительно обновляем классы, развернув панель
          if (!this.expandedAssetPanels.includes(index)) {
            this.expandedAssetPanels.push(index);
          }
        }
      });
    }

    // Обрабатываем дубликаты (должны быть синими)
    if (result.duplicates && Array.isArray(result.duplicates)) {
      console.log('Найдены дубликаты:', result.duplicates);
      this.processDuplicates(result.duplicates);
    }

    this.uploadProcess.uploading = false;

    // Проверяем статус всех активов
    console.log('Статус активов после сохранения:', this.processedData.map(a => ({
      category: a.category,
      id: a.id,
      isDuplicate: a.isDuplicate,
      hasId: !!a.id
    })));

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

  } catch (error) {
    console.error('Ошибка сохранения имущества:', error);
    this.uploadProcess.uploading = false;
    this.uploadProcess.uploaded = false;

    if (error.response && error.response.data) {
      const errorData = error.response.data;
      console.log('Данные ошибки:', errorData);

      // Проверяем наличие дубликатов в ответе
      let duplicates = [];

      if (errorData.data && errorData.data.duplicates) {
        duplicates = errorData.data.duplicates;
      } else if (errorData.duplicates) {
        duplicates = errorData.duplicates;
      }

      if (duplicates.length > 0) {
        console.log('Найдены дубликаты в ошибке:', duplicates);
        this.processDuplicates(duplicates);

        // Проверяем, есть ли сохраненные активы
        if (errorData.data && errorData.data.saved_assets &&
            errorData.data.saved_assets.length > 0) {
          // Обновляем сохраненные активы из ошибки
          errorData.data.saved_assets.forEach(savedAsset => {
            const index = this.processedData.findIndex(asset => {
              if (savedAsset.details) {
                if (savedAsset.details.cadastre_number &&
                    asset.details?.cadastre_number === savedAsset.details.cadastre_number) {
                  return true;
                }
                if (savedAsset.details.vin &&
                    asset.details?.vin === savedAsset.details.vin) {
                  return true;
                }
              }
              return false;
            });

            if (index !== -1) {
              this.$set(this.processedData[index], 'id', savedAsset.id);
              this.$set(this.processedData[index], 'isDuplicate', false);
            }
          });
        }
      }

      // Показываем ошибку, только если нет сохраненных активов
      const hasSavedAssets = this.processedData.some(asset => asset.id);
      if (!hasSavedAssets) {
        this.uploadProcess.errors.hasError = true;
        this.uploadProcess.errors.message = errorData.errors?.error || 'Ошибка сохранения имущества';
        this.uploadProcess.errors.details = errorData.errors?.details || null;
      }
    } else {
      this.uploadProcess.errors.hasError = true;
      this.uploadProcess.errors.message = error.message || 'Ошибка соединения с сервером';
    }
  }
},

    processDuplicates(duplicates) {
  console.log('Обработка дубликатов:', duplicates);

  // Сначала сбрасываем все дубликаты
  this.processedData.forEach(asset => {
    this.$set(asset, 'isDuplicate', false);
    this.$set(asset, 'duplicateInfo', null);
  });

  // Для каждого дубликата из ответа сервера
  duplicates.forEach(duplicate => {
    const duplicateData = duplicate.data || {};

    // Ищем соответствующий актив в processedData
    const assetIndex = this.processedData.findIndex(asset => {
      // Сравниваем основные поля
      if (asset.category !== duplicateData.category) return false;
      if (asset.asset_type !== duplicateData.asset_type) return false;

      // Сравниваем поля из details
      if (duplicate.fields && Array.isArray(duplicate.fields)) {
        return duplicate.fields.every(field => {
          const assetValue = asset.details?.[field.field];
          const duplicateValue = field.value;

          // Приводим к строке для сравнения
          return String(assetValue) === String(duplicateValue);
        });
      }

      // Fallback: сравниваем по уникальным полям
      const uniqueFields = ['cadastre_number', 'vin', 'registration_number', 'serial_number'];
      for (const field of uniqueFields) {
        if (duplicateData.details && duplicateData.details[field]) {
          if (asset.details?.[field] === duplicateData.details[field]) {
            return true;
          }
        }
      }

      return false;
    });

    if (assetIndex !== -1) {
      const asset = this.processedData[assetIndex];
      console.log('Найден дубликат актива:', asset);

      this.$set(asset, 'isDuplicate', true);
      this.$set(asset, 'duplicateInfo', duplicate);
      this.$set(asset, 'id', null); // Убеждаемся, что у дубликата нет ID

      // Раскрываем панель с дубликатом
      if (!this.expandedAssetPanels.includes(assetIndex)) {
        this.expandedAssetPanels.push(assetIndex);
      }
    } else {
      console.warn('Не найден соответствующий актив для дубликата:', duplicate);

      // Альтернативный поиск
      if (duplicate.fields && Array.isArray(duplicate.fields)) {
        const fallbackIndex = this.processedData.findIndex(asset => {
          return duplicate.fields.some(field => {
            const assetValue = asset.details?.[field.field];
            const duplicateValue = field.value;
            return String(assetValue) === String(duplicateValue);
          });
        });

        if (fallbackIndex !== -1) {
          const asset = this.processedData[fallbackIndex];
          console.log('Найден дубликат актива (альтернативный поиск):', asset);

          this.$set(asset, 'isDuplicate', true);
          this.$set(asset, 'duplicateInfo', duplicate);
          this.$set(asset, 'id', null);

          if (!this.expandedAssetPanels.includes(fallbackIndex)) {
            this.expandedAssetPanels.push(fallbackIndex);
          }
        }
      }
    }
  });

  console.log('Итоговый processedData:', this.processedData);
},

    extractDuplicatesFromDetails(details) {
      const duplicates = [];

      if (!Array.isArray(details)) return duplicates;

      details.forEach(detail => {
        if (detail.errors && Array.isArray(detail.errors)) {
          detail.errors.forEach(error => {
            if (error.duplicate || error.type === 'duplicate') {
              duplicates.push(error);
            }
          });
        }
      });

      return duplicates;
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
  background-color: rgba(33, 150, 243, 0.08) !important; /* Светло-синий фон */
  border-left: 4px solid #2196F3 !important; /* Синяя левая граница */
  margin-bottom: 8px;
}

.duplicate-panel .v-expansion-panel-header {
  background-color: rgba(33, 150, 243, 0.05) !important;
}

/* Стили для успешно созданных активов */
.success-panel {
  background-color: rgba(76, 175, 80, 0.08) !important; /* Светло-зеленый фон */
  border-left: 4px solid #4CAF50 !important; /* Зеленая левая граница */
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