<template>
  <v-dialog :value="value" @input="$emit('input', $event)" max-width="1000" persistent>
    <v-card>
      <v-card-title>
        {{ isEditing ? 'Редактирование оспаривания' : 'Новое оспаривание' }}
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-tabs v-model="tab" grow class="mb-4">
            <v-tab>Основное</v-tab>
            <v-tab>Кредиторы</v-tab>
            <v-tab>Анализ стоимости</v-tab>
          </v-tabs>

          <v-tabs-items v-model="tab" class="pt-1">
            <!-- Вкладка 1: Основное -->
            <v-tab-item>
              <v-row>
                <!-- Проект -->
                <v-col cols="12" md="6">
                  <v-autocomplete
                      v-model="disputeData.project"
                      :items="projects"
                      item-text="name"
                      item-value="id"
                      label="Проект (банкротство)*"
                      :rules="rules.project"
                      outlined dense
                      @change="setActDate"
                      return-object
                  />
                </v-col>

                <!-- Основание для отчуждения -->
                <v-col cols="12" md="6">
                  <v-autocomplete
                      v-model="disputeData.disposition_reason"
                      :items="dispositionReasons"
                      item-text="text"
                      item-value="value"
                      label="Основание для отчуждения*"
                      :rules="rules.disposition_reason"
                      outlined dense
                  />
                </v-col>

                <!-- Основание (договор) -->
                <v-col cols="12" md="6">
                  <v-text-field
                      v-model="disputeData.disposition_contract"
                      label="Основание (договор)*"
                      :rules="rules.disposition_contract"
                      outlined dense
                      placeholder="Пример: Договор купли-продажи от дд.мм.гггг"
                  />
                </v-col>

                <!-- Стоимость по договору -->
                <v-col cols="12" md="6">
                  <v-text-field
                      v-model="disputeData.contract_value"
                      label="Стоимость по договору отчуждения"
                      type="number"
                      step="0.01"
                      prefix="₽"
                      outlined dense
                  />
                </v-col>

                <!-- Дата принятия заявления о банкротстве -->
                <v-col cols="12" md="6">
                  <DatePicker
                      style="width: 100%;"
                      v-model="disputeData.bankruptcy_application_date"
                      value-type="format"
                      format="DD.MM.YYYY"
                      placeholder="Дата принятия заявления о банкротстве*"
                      :clearable="false"
                      :rules="rules.bankruptcy_application_date"
                      outlined
                  />
                </v-col>

                <!-- Период совершения сделки -->
                <v-col cols="12" md="6">
                  <v-autocomplete
                      v-model="disputeData.transaction_period"
                      :items="transactionPeriods"
                      item-text="text"
                      item-value="value"
                      label="Период совершения сделки"
                      outlined dense
                  />
                </v-col>

                <!-- Основная дата неплатежеспособности -->
                <v-col cols="12" md="6">
                  <DatePicker
                      style="width: 100%;"
                      v-model="disputeData.main_insolvency_date"
                      value-type="format"
                      format="DD.MM.YYYY"
                      placeholder="Основная дата неплатежеспособности"
                      :clearable="true"
                      outlined
                  />
                </v-col>

                <!-- Статус оспаривания -->
                <v-col cols="12" md="6">
                  <v-autocomplete
                      v-model="disputeData.dispute_status"
                      :items="disputeStatuses"
                      item-text="text"
                      item-value="value"
                      label="Статус оспаривания*"
                      :rules="rules.dispute_status"
                      outlined dense
                  />
                </v-col>

                <!-- Контрагент -->
                <v-col cols="12">
                  <v-card outlined class="mb-4">
                    <v-card-title class="py-2 text-h8">
                      <v-icon left small>mdi-account</v-icon>
                      Контрагент сделки
                    </v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12">
                          <v-radio-group v-model="counterpartyType" row class="mb-0">
                            <v-radio label="Физическое лицо" value="physical"/>
                            <v-radio label="Юридическое лицо" value="legal"/>
                          </v-radio-group>
                        </v-col>

                        <v-col cols="12" md="6" v-if="counterpartyType === 'physical'">
                          <v-autocomplete
                              v-model="disputeData.counterparty_person"
                              :items="physicalPersons"
                              item-text="fullName"
                              item-value="id"
                              label="Контрагент (физ. лицо)"
                              outlined dense
                              clearable
                          />
                        </v-col>

                        <v-col cols="12" md="6" v-if="counterpartyType === 'legal'">
                          <v-autocomplete
                              v-model="disputeData.counterparty_legal"
                              :items="legalEntities"
                              item-text="name"
                              item-value="id"
                              label="Контрагент (юр. лицо)"
                              outlined dense
                              clearable
                          />
                        </v-col>

                        <v-col cols="12" md="6">
                          <v-autocomplete
                              v-model="disputeData.counterparty_interest_type"
                              :items="counterpartyInterestTypes"
                              item-text="text"
                              item-value="value"
                              label="Тип заинтересованности контрагента"
                              outlined dense
                              clearable
                          />
                        </v-col>

                        <v-col cols="12">
                          <v-textarea
                              v-model="disputeData.counterparty_interest_details"
                              label="Подробности заинтересованности контрагента"
                              outlined dense
                              rows="3"
                          />
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Правовое обоснование -->
                <v-col cols="12">
                  <v-textarea
                      v-model="disputeData.legal_justification"
                      label="Правовое обоснование оспаривания"
                      outlined dense
                      rows="3"
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                      v-model="disputeData.notes"
                      label="Примечания"
                      outlined dense
                      rows="2"
                  />
                </v-col>
              </v-row>
            </v-tab-item>

            <!-- Вкладка 2: Кредиторы -->
            <v-tab-item>
              <v-row>
                <v-col cols="12">
                  <v-card outlined class="mb-4">
                    <v-card-title class="py-2 text-h8">
                      <v-icon left small>mdi-account-multiple</v-icon>
                      Кредиторы сделки
                      <v-spacer/>
                      <v-btn small @click="addCreditor" color="primary">
                        <v-icon left small>mdi-plus</v-icon>
                        Добавить кредитора
                      </v-btn>
                    </v-card-title>

                    <v-card-text>
                      <!-- Список кредиторов -->
                      <v-list dense v-if="creditors.length > 0" class="mb-4">
                        <v-list-item
                            v-for="(creditor, index) in creditors"
                            :key="index"
                            class="mb-2"
                        >
                          <v-list-item-content>
                            <div class="d-flex justify-space-between align-center">
                              <div>
                                <strong>{{ getCreditorName(creditor) }}</strong>
                                <v-chip x-small :color="creditor.is_included ? 'success' : 'error'" class="ml-2">
                                  {{ creditor.is_included ? 'Включен в реестр' : 'Не включен' }}
                                </v-chip>
                              </div>
                              <div>
                                <v-btn icon small @click="editCreditor(index)">
                                  <v-icon small>mdi-pencil</v-icon>
                                </v-btn>
                                <v-btn icon small @click="removeCreditor(index)" color="error">
                                  <v-icon small>mdi-delete</v-icon>
                                </v-btn>
                              </div>
                            </div>

                            <div v-if="creditor.insolvency_date" class="text-caption mt-1">
                              <strong>Дата неплатежеспособности:</strong> {{ formatDate(creditor.insolvency_date) }}
                            </div>

                            <div v-if="creditor.notes" class="text-caption text--secondary mt-1">
                              {{ creditor.notes }}
                            </div>
                          </v-list-item-content>
                        </v-list-item>
                      </v-list>

                      <v-alert v-else type="info" outlined dense>
                        Нет добавленных кредиторов
                      </v-alert>

                      <!-- Форма добавления/редактирования кредитора -->
                      <v-card v-if="showCreditorForm" outlined class="mt-4">
                        <v-card-title class="py-2 text-h8">
                          <v-icon left small>mdi-account</v-icon>
                          {{ isEditingCreditor ? 'Редактирование кредитора' : 'Новый кредитор' }}
                        </v-card-title>

                        <v-card-text>
                          <v-row>
                            <v-col cols="12" md="6">
                              <v-autocomplete
                                  v-model="currentCreditor.creditorId"
                                  :items="availableCreditors"
                                  item-text="name"
                                  item-value="id"
                                  label="Кредитор*"
                                  :rules="creditorRules.creditor"
                                  outlined dense
                              />
                            </v-col>

                            <v-col cols="12" md="6">
                              <DatePicker
                                  v-model="currentCreditor.insolvency_date"
                                  value-type="format"
                                  format="DD.MM.YYYY"
                                  placeholder="Дата неплатежеспособности"
                                  :clearable="true"
                                  outlined
                              />
                            </v-col>

                            <v-col cols="12">
                              <v-switch
                                  v-model="currentCreditor.is_included"
                                  label="Включен в реестр требований"
                                  hide-details
                              />
                            </v-col>

                            <v-col cols="12">
                              <v-textarea
                                  v-model="currentCreditor.notes"
                                  label="Примечания"
                                  outlined dense
                                  rows="2"
                              />
                            </v-col>

                            <v-col cols="12" class="d-flex justify-end">
                              <v-btn text @click="cancelCreditorEdit">Отмена</v-btn>
                              <v-btn color="primary" @click="saveCreditor">
                                {{ isEditingCreditor ? 'Сохранить' : 'Добавить' }}
                              </v-btn>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-tab-item>

            <!-- Вкладка 3: Анализ стоимости -->
            <v-tab-item>
              <v-row>
                <!-- Статистическая стоимость -->
                <v-col cols="12" md="6">
                  <v-text-field
                      v-model="disputeData.statistical_value"
                      label="Статистическая стоимость"
                      type="number"
                      step="0.01"
                      prefix="₽"
                      outlined dense
                  />
                </v-col>

                <!-- Статьи закона для оспаривания -->
                <v-col cols="12">
                  <v-card outlined class="mb-4">
                    <v-card-title class="py-2 text-h8">
                      <v-icon left small>mdi-scale-balance</v-icon>
                      Статьи закона для оспаривания
                    </v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12">
                          <v-select
                              v-model="disputeData.disputing_articles"
                              :items="lawArticles"
                              item-text="text"
                              item-value="value"
                              label="Статьи закона"
                              multiple
                              outlined dense
                              chips
                              deletable-chips
                          />
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Источники рыночной стоимости -->
                <v-col cols="12">
                  <v-card outlined class="mb-4">
                    <v-card-title class="py-2 text-h8">
                      <v-icon left small>mdi-source-branch</v-icon>
                      Источники рыночной стоимости
                    </v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" md="4">
                          <v-text-field
                              v-model="newMarketValueSource.source"
                              label="Источник"
                              outlined dense
                              placeholder="Авито, ЦИАН и т.д."
                          />
                        </v-col>
                        <v-col cols="12" md="3">
                          <v-text-field
                              v-model="newMarketValueSource.price"
                              label="Цена"
                              type="number"
                              step="0.01"
                              outlined dense
                          />
                        </v-col>
                        <v-col cols="12" md="2">
                          <v-text-field
                              v-model="newMarketValueSource.currency"
                              label="Валюта"
                              value="руб."
                              outlined dense
                          />
                        </v-col>
                        <v-col cols="12" md="3">
                          <v-text-field
                              v-model="newMarketValueSource.url"
                              label="URL"
                              outlined dense
                              placeholder="Ссылка на источник"
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-btn small @click="addMarketValueSource" color="primary">
                            <v-icon left small>mdi-plus</v-icon>
                            Добавить источник
                          </v-btn>
                        </v-col>
                      </v-row>

                      <!-- Список добавленных источников -->
                      <v-list dense v-if="disputeData.market_value_sources.length > 0" class="mt-4">
                        <v-list-item
                            v-for="(source, index) in disputeData.market_value_sources"
                            :key="index"
                            class="mb-2"
                        >
                          <v-list-item-content>
                            <div class="d-flex justify-space-between">
                              <div>
                                <strong>{{ source.source || 'Неизвестный источник' }}</strong>
                                <span v-if="source.price" class="ml-2">
                                  {{ formatCurrency(source.price) }} {{ source.currency || 'руб.' }}
                                </span>
                              </div>
                              <div>
                                <v-btn icon small @click="removeMarketValueSource(index)" color="error">
                                  <v-icon small>mdi-delete</v-icon>
                                </v-btn>
                              </div>
                            </div>
                            <div v-if="source.url" class="text-caption text--secondary">
                              <a :href="source.url" target="_blank" style="color: #666; text-decoration: none;">
                                {{ source.url }}
                              </a>
                            </div>
                          </v-list-item-content>
                        </v-list-item>
                      </v-list>
                      <v-alert v-else type="info" outlined dense class="mt-4">
                        Нет добавленных источников
                      </v-alert>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-tab-item>
          </v-tabs-items>

          <!-- Примечания (всегда внизу) -->
          <v-row class="mt-4">
            <v-col cols="12">
              <v-switch
                  v-model="disputeData.is_active"
                  label="Активная запись"
                  hide-details
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="cancel">Отмена</v-btn>
        <v-btn color="primary" @click="save" :disabled="!valid">
          {{ isEditing ? 'Сохранить' : 'Добавить' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'

export default {
  name: "DisputeDialog",
  components: {
    DatePicker,
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    dispute: {
      type: Object,
      default: () => ({
        project: null,
        disposition_reason: '',
        disposition_contract: '',
        contract_value: null,
        bankruptcy_application_date: null,
        transaction_period: null,
        main_insolvency_date: null,
        statistical_value: null,
        market_value_sources: [],
        counterparty_person: null,
        counterparty_legal: null,
        counterparty_interest_type: null,
        counterparty_interest_details: '',
        disputing_articles: [],
        legal_justification: '',
        dispute_status: 'analysis',
        notes: '',
        is_active: true
      })
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    projects: {
      type: Array,
      default: () => []
    },
    physicalPersons: {
      type: Array,
      default: () => []
    },
    legalEntities: {
      type: Array,
      default: () => []
    },
    creditorsList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      valid: false,
      tab: 0,
      counterpartyType: 'physical',
      // Данные для оспаривания
      disputeData: {...this.dispute},
      // Кредиторы
      creditors: [],
      showCreditorForm: false,
      isEditingCreditor: false,
      editingCreditorIndex: -1,
      currentCreditor: {
        creditor: null,
        insolvency_date: null,
        is_included: true,
        notes: ''
      },
      creditorRules: {
        creditor: [v => !!v || 'Кредитор обязателен']
      },
      // Источники рыночной стоимости
      newMarketValueSource: {
        source: '',
        price: null,
        currency: 'руб.',
        url: ''
      },
      // Списки для выбора
      disputeStatuses: [
        {value: 'analysis', text: 'Анализ'},
        {value: 'disputed', text: 'Оспаривается'},
        {value: 'not_disputed', text: 'Не оспаривается'},
        {value: 'completed', text: 'Завершено'},
        {value: 'court_decision', text: 'Судебное решение вынесено'},
        {value: 'settled', text: 'Урегулировано'}
      ],
      dispositionReasons: [
        {value: 'sale', text: 'Договор купли-продажи'},
        {value: 'gift', text: 'Договор дарения'},
        {value: 'settlement', text: 'Соглашение об отступном'},
        {value: 'amicable', text: 'Мировое соглашение'},
        {value: 'other', text: 'Иное'}
      ],
      transactionPeriods: [
        {value: 'after', text: 'После принятия заявления о банкротстве'},
        {value: '1_year', text: 'За 1 год до принятия (п. 1 ст. 61.2 ЗоБ)'},
        {value: '3_years', text: 'За 3 года до принятия (п. 1, п. 2 ст. 61.2 ЗоБ)'},
        {value: 'over_3', text: 'Свыше 3 лет, но в период 10 лет (ст. 10, 168 ГК РФ)'},
        {value: '6_months', text: 'За 6 месяцев до принятия (ст. 61.3 ЗоБ)'}
      ],
      counterpartyInterestTypes: [
        {value: 'relative', text: 'Родственные связи'},
        {value: 'awareness', text: 'Осведомленность о неплатежеспособности'},
        {value: 'affiliate', text: 'Аффилированность'},
        {value: 'controlled', text: 'Контролируемое лицо'},
        {value: 'employee', text: 'Сотрудник'},
        {value: 'partner', text: 'Партнер по бизнесу'},
        {value: 'other', text: 'Иное'}
      ],
      lawArticles: [
        {value: 'п. 1 ст. 61.2 ЗоБ', text: 'п. 1 ст. 61.2 ЗоБ'},
        {value: 'п. 2 ст. 61.2 ЗоБ', text: 'п. 2 ст. 61.2 ЗоБ'},
        {value: 'ст. 61.3 ЗоБ', text: 'ст. 61.3 ЗоБ'},
        {value: 'ст. 10 ГК РФ', text: 'ст. 10 ГК РФ'},
        {value: 'ст. 168 ГК РФ', text: 'ст. 168 ГК РФ'}
      ],
      rules: {
        project: [v => !!v || 'Проект обязателен'],
        disposition_reason: [v => !!v || 'Основание отчуждения обязательно'],
        disposition_contract: [v => true],
        bankruptcy_application_date: [v => true],
        dispute_status: [v => true]
      }
    }
  },
  computed: {
    availableCreditors() {
      return this.creditorsList || []
    },
    hasSingleProject() {
      return this.projects && this.projects.length === 1
    }
  },
  watch: {
    value(newVal) {
      if (newVal) {
        // Сброс формы при открытии
        this.disputeData = JSON.parse(JSON.stringify(this.dispute))

        if (!this.isEditing && this.hasSingleProject && !this.disputeData.project) {
          const singleProject = this.projects[0]
          this.disputeData.project = singleProject.id
          console.log('Автоматически установлен единственный проект:', singleProject.name)
        }

        // Определяем тип контрагента
        if (this.disputeData.counterparty_person) {
          this.counterpartyType = 'physical'
        } else if (this.disputeData.counterparty_legal) {
          this.counterpartyType = 'legal'
        } else {
          this.counterpartyType = 'physical'
        }

        // Сброс кредиторов (в реальном приложении здесь будет загрузка кредиторов с сервера)
        this.creditors = this.disputeData.creditor_relations || []

        // Сброс нового источника
        this.newMarketValueSource = {
          source: '',
          price: null,
          currency: 'руб.',
          url: ''
        }

        // Сброс формы кредитора
        this.cancelCreditorEdit()
      }
    }
  },
  methods: {
    cancel() {
      this.$emit('cancel')
    },
    save() {
      if (this.$refs.form.validate()) {
        // Просто передаем кредиторов как есть - они уже в правильном формате
        const disputeData = {
          ...this.disputeData,
          bankruptcy_application_date: this.disputeData.bankruptcy_application_date,
          main_insolvency_date: this.disputeData.main_insolvency_date,
          contract_value: this.disputeData.contract_value ? parseFloat(this.disputeData.contract_value) : null,
          statistical_value: this.disputeData.statistical_value ? parseFloat(this.disputeData.statistical_value) : null,
          counterparty_person: this.counterpartyType === 'physical' ? this.disputeData.counterparty_person : null,
          counterparty_legal: this.counterpartyType === 'legal' ? this.disputeData.counterparty_legal : null,
          creditor_relations: [...this.creditors],
          dispute_status: this.disputeData.dispute_status || 'analysis'
        };
        this.$emit('save', disputeData);
      }
    },
    addCreditor() {
      this.showCreditorForm = true
      this.isEditingCreditor = false
      this.editingCreditorIndex = -1
      this.currentCreditor = {
        creditor: null,
        insolvency_date: null,
        is_included: true,
        notes: ''
      }
    },
    editCreditor(index) {
      this.showCreditorForm = true;
      this.isEditingCreditor = true;
      this.editingCreditorIndex = index;
      const creditor = this.creditors[index];

      console.log('Editing creditor:', creditor);

      // Находим ID кредитора
      const creditorId = creditor.legal_creditor || creditor.physical_creditor;

      this.currentCreditor = {
        creditorId: creditorId, // сохраняем ID
        creditor: null, // оставляем null, так как не используем объект
        insolvency_date: creditor.insolvency_date,
        is_included: creditor.is_included,
        notes: creditor.notes
      };

      console.log('Current creditor after edit:', this.currentCreditor);
    },
    cancelCreditorEdit() {
      this.showCreditorForm = false
      this.isEditingCreditor = false
      this.editingCreditorIndex = -1
      this.currentCreditor = {
        creditor: null,
        insolvency_date: null,
        is_included: true,
        notes: ''
      }
    },
    saveCreditor() {
      console.log('Saving creditor with data:', this.currentCreditor);

      if (!this.currentCreditor.creditorId) {
        console.error('Кредитор не выбран');
        return;
      }

      const selectedCreditor = this.availableCreditors.find(c => c.id === this.currentCreditor.creditorId);
      if (!selectedCreditor) {
        console.error('Выбранный кредитор не найден в availableCreditors');
        return;
      }

      // Создаем объект кредитора с правильными полями
      const creditorData = {
        insolvency_date: this.currentCreditor.insolvency_date,
        is_included: this.currentCreditor.is_included,
        notes: this.currentCreditor.notes
      };

      // В зависимости от типа кредитора устанавливаем соответствующее поле
      if (selectedCreditor.type === 'LegalEntity') {
        creditorData.legal_creditor = selectedCreditor.id;
        creditorData.physical_creditor = null;
      } else if (selectedCreditor.type === 'PhysicalPerson') {
        creditorData.physical_creditor = selectedCreditor.id;
        creditorData.legal_creditor = null;
      }

      console.log('Creditor data to save:', creditorData);

      if (this.isEditingCreditor) {
        const newCreditors = [...this.creditors];
        newCreditors[this.editingCreditorIndex] = creditorData;
        this.creditors = newCreditors;
      } else {
        this.creditors = [...this.creditors, creditorData];
      }

      console.log('Creditors after save:', this.creditors);

      this.cancelCreditorEdit();
    },
    removeCreditor(index) {
      if (confirm('Вы уверены, что хотите удалить этого кредитора?')) {
        this.creditors = this.creditors.filter((_, i) => i !== index)
      }
    },
    getCreditorName(creditor) {
      // Если creditor - это объект с полями legal_creditor/physical_creditor
      if (creditor && typeof creditor === 'object') {
        const creditorId = creditor.legal_creditor || creditor.physical_creditor;

        if (!creditorId) {
          // Если у объекта есть поле creditor (для отладки)
          if (creditor.creditor) {
            const foundCreditor = this.availableCreditors.find(c => c.id === creditor.creditor);
            return foundCreditor ? foundCreditor.name : 'Неизвестный кредитор';
          }
          return 'Неизвестный кредитор';
        }

        const foundCreditor = this.availableCreditors.find(c => c.id === creditorId);
        return foundCreditor ? foundCreditor.name : `Кредитор ID: ${creditorId}`;
      }

      // Если это просто ID (число или строка)
      if (typeof creditor === 'string' || typeof creditor === 'number') {
        const foundCreditor = this.availableCreditors.find(c => c.id === creditor);
        return foundCreditor ? foundCreditor.name : `Кредитор ID: ${creditor}`;
      }

      return 'Неизвестный кредитор';
    },
    addMarketValueSource() {
      if (!this.newMarketValueSource.source) {
        return
      }

      const newSource = {
        ...this.newMarketValueSource,
        price: this.newMarketValueSource.price ? parseFloat(this.newMarketValueSource.price) : null
      }

      this.disputeData.market_value_sources = [
        ...this.disputeData.market_value_sources,
        newSource
      ]

      // Сброс формы
      this.newMarketValueSource = {
        source: '',
        price: null,
        currency: 'руб.',
        url: ''
      }
    },
    removeMarketValueSource(index) {
      this.disputeData.market_value_sources = this.disputeData.market_value_sources.filter((_, i) => i !== index)
    },
    formatCurrency(amount) {
      if (!amount) return '0 ₽'
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(amount)
    },
    formatDate(date) {
      if (!date) return '—'
      if (typeof date === 'string') return date
      return date
    },
    setActDate(item) {
      console.log(item)
    }
  }
}
</script>

<style scoped>
.v-tab {
  min-width: 100px;
}

.v-list-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.v-list-item:hover {
  background-color: #f5f5f5;
}

.text-h8 {
  font-size: 1rem;
  font-weight: 500;
}

a {
  color: #666;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
  color: #1976d2;
}

@media (max-width: 960px) {
  .v-dialog {
    width: 95%;
    max-width: 95%;
  }

  .v-tab {
    min-width: 80px;
    font-size: 0.8rem;
  }
}
</style>