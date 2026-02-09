<template>
  <div>
    <!-- Раздел оспаривания сделки -->
    <v-divider class="my-4"></v-divider>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-2">
          <h4 class="text-h6">Оспаривание сделки</h4>
          <v-btn
              color="primary"
              small
              @click="$emit('open-dialog')"
              :disabled="disabled || !hasDisposalDate"
          >
            <v-icon left small>mdi-gavel</v-icon>
            {{ dispute ? 'Редактировать' : 'Добавить' }}
          </v-btn>
        </div>

        <!-- Карточка существующего оспаривания -->
        <v-card v-if="dispute" class="mb-4">
          <v-card-title class="py-2 text-h8">
            <v-icon left small>mdi-gavel</v-icon>
            Оспариваемая сделка
          </v-card-title>
          <v-card-text class="pt-0">
            <v-list dense>
              <v-list-item class="mb-2">
                <v-list-item-content>
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <strong>{{ getDispositionReasonText(dispute.disposition_reason) }}</strong>
                      <v-chip x-small :color="getDisputeStatusColor(dispute.dispute_status)" class="ml-2">
                        {{ getDisputeStatusText(dispute.dispute_status) }}
                      </v-chip>
                      <v-chip x-small :color="dispute.is_active ? 'warning' : 'grey'" class="ml-2">
                        {{ dispute.is_active ? 'Активно' : 'Неактивно' }}
                      </v-chip>
                    </div>
                    <div>
                      <v-btn icon small @click="$emit('edit-dispute')">
                        <v-icon small>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon small @click="$emit('remove-dispute')" color="error">
                        <v-icon small>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>

                  <div v-if="dispute.disposition_contract" class="text-caption mt-1">
                    <strong>Договор:</strong> {{ dispute.disposition_contract.substring(0, 100) }}
                    {{ dispute.disposition_contract.length > 100 ? '...' : '' }}
                  </div>

                  <div v-if="dispute.contract_value" class="text-caption mt-1">
                    <strong>Стоимость по договору:</strong> {{ formatCurrency(dispute.contract_value) }}
                  </div>

                  <div v-if="dispute.bankruptcy_application_date" class="text-caption mt-1">
                    <strong>Дата заявления о банкротстве:</strong> {{ formatDate(dispute.bankruptcy_application_date) }}
                  </div>

                  <div v-if="dispute.transaction_period" class="text-caption mt-1">
                    <strong>Период сделки:</strong> {{ getTransactionPeriodText(dispute.transaction_period) }}
                  </div>

                  <div v-if="counterpartyName" class="text-caption mt-1">
                    <strong>Контрагент:</strong> {{ counterpartyName }}
                  </div>

                  <div v-if="dispute.counterparty_interest_type" class="text-caption mt-1">
                    <strong>Тип заинтересованности:</strong>
                    {{ getCounterpartyInterestText(dispute.counterparty_interest_type) }}
                  </div>

                  <div v-if="hasCreditors" class="text-caption mt-1">
                    <strong>Кредиторы:</strong> {{ dispute.creditor_relations ? dispute.creditor_relations.length : 0 }}
                  </div>

                  <div v-if="dispute.legal_justification" class="text-caption text--secondary mt-1">
                    <strong>Обоснование:</strong> {{ dispute.legal_justification.substring(0, 150) }}
                    {{ dispute.legal_justification.length > 150 ? '...' : '' }}
                  </div>

                  <div v-if="dispute.analysis_summary" class="text-caption text--secondary mt-1">
                    <strong>Анализ:</strong> {{ dispute.analysis_summary }}
                  </div>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <v-alert v-else-if="!hasDisposalDate" type="warning" outlined dense>
          Для добавления оспаривания требуется указать дату выбытия имущества
        </v-alert>
        <v-alert v-else type="info" outlined dense>
          Оспариваемая сделка не добавлена
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "DisputeTransactionsList",
  props: {
    dispute: {
      type: Object,
      default: () => null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    disposalDate: {
      type: [String, Date],
      default: null
    },
    allRefData: {
      type: Array,
      default: () => []
    },
    legalEntities: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    hasDisposalDate() {
      return !!this.disposalDate
    },
    hasCreditors() {
      return this.dispute &&
          this.dispute.creditor_relations &&
          Array.isArray(this.dispute.creditor_relations) &&
          this.dispute.creditor_relations.length > 0
    },
    counterpartyName() {
      if (!this.dispute) return ''

      if (this.dispute.counterparty_person) {
        const person = this.allRefData.find(p => p.id === this.dispute.counterparty_person && p.type === 'PhysicalPerson')
        return person ? person.fullName : 'Неизвестное физ. лицо'
      } else if (this.dispute.counterparty_legal) {
        const legal = this.legalEntities.find(l => l.id === this.dispute.counterparty_legal)
        return legal ? legal.name : 'Неизвестное юр. лицо'
      }
      return ''
    }
  },
  methods: {
    getDisputeStatusText(status) {
      const statusMap = {
        'analysis': 'Анализ',
        'disputed': 'Оспаривается',
        'not_disputed': 'Не оспаривается',
        'completed': 'Завершено',
        'court_decision': 'Судебное решение вынесено',
        'settled': 'Урегулировано'
      }
      return statusMap[status] || status
    },
    getDisputeStatusColor(status) {
      const colorMap = {
        'analysis': 'info',
        'disputed': 'error',
        'not_disputed': 'success',
        'completed': 'success',
        'court_decision': 'warning',
        'settled': 'success'
      }
      return colorMap[status] || 'grey'
    },
    getDispositionReasonText(reason) {
      const reasonMap = {
        'sale': 'Договор купли-продажи',
        'gift': 'Договор дарения',
        'settlement': 'Соглашение об отступном',
        'amicable': 'Мировое соглашение',
        'other': 'Иное'
      }
      return reasonMap[reason] || reason
    },
    getTransactionPeriodText(period) {
      const periodMap = {
        'after': 'После принятия заявления о банкротстве',
        '1_year': 'За 1 год до принятия (п. 1 ст. 61.2 ЗоБ)',
        '3_years': 'За 3 года до принятия (п. 1, п. 2 ст. 61.2 ЗоБ)',
        'over_3': 'Свыше 3 лет, но в период 10 лет (ст. 10, 168 ГК РФ)',
        '6_months': 'За 6 месяцев до принятия (ст. 61.3 ЗоБ)'
      }
      return periodMap[period] || period
    },
    getCounterpartyInterestText(interestType) {
      const interestMap = {
        'relative': 'Родственные связи',
        'awareness': 'Осведомленность о неплатежеспособности',
        'affiliate': 'Аффилированность',
        'controlled': 'Контролируемое лицо',
        'employee': 'Сотрудник',
        'partner': 'Партнер по бизнесу',
        'other': 'Иное'
      }
      return interestMap[interestType] || interestType
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
    }
  },
  emits: ['open-dialog', 'edit-dispute', 'remove-dispute']
}
</script>

<style scoped>
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
</style>