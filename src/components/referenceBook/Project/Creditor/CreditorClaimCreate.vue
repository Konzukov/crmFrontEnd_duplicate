<template>
  <v-container>
    <v-form lazy-validation class="pt-4">
      <v-row>
        <v-col cols="7">
          <v-autocomplete dense outlined label="Кредитор" :items="allRefList" item-value="uuid" item-text="fullName"
                          v-model="creditor" @change="setCreditor" return-object></v-autocomplete>
        </v-col>
        <v-col cols="5">
          <v-autocomplete dense outlined label="Очередь погашения" :items="repaymentOrderType" item-text="text"
                          item-value="value" v-model="form.repayment_queue"></v-autocomplete>
        </v-col>
      </v-row>
      <v-row v-if="form.repayment_queue === 'TS'">
        <v-col cols="12">
          <v-autocomplete dense outlined label="Категория выплат" :items="thirdStageType" item-text="text"
                          item-value="value" v-model="form.third_stage_type"></v-autocomplete>
        </v-col>
      </v-row>
      <v-row v-else-if="form.repayment_queue === 'BR'">
        <v-col cols="12">
          <v-autocomplete dense outlined label="Категория за реестровых выплат" :items="behindRegisterType" item-text="text"
                          item-value="value" v-model="form.behind_register_type"></v-autocomplete>
        </v-col>
      </v-row>
      <v-row>
        <v-col col="3">
          <v-text-field dense outlined label="Сумма требования" v-model="form.claim_amount"
                        type="number"
                        step="0.01"
          ></v-text-field>
        </v-col>
        <v-col col="3">
          <v-text-field dense outlined label="Сумма удовлетворенных требований"
                        type="number"
                        step="0.01"
                        v-model="form.satisfied_claim_amount"></v-text-field>
        </v-col>
        <v-col col="3">
          <v-text-field dense outlined label="Процент удовлетворенных требований"
                        type="number"
                        step="0.01"
                        v-model="form.percent_claim_amount"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field dense label="Дата удовлетворения" type="date" outlined
                        v-model="form.date_satisfaction"></v-text-field>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="auto">
          <v-btn @click="reset" color="error">Отмена</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="save" color="success">Сохранить</v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>

import {mapGetters} from "vuex";

export default {
  name: "CreditorClaimCreate",
  props: ['project', 'creditorClaimData'],
  data: () => ({
    creditor: null,
    errorMessage: {
      repayment_queue: '',
      third_stage_type: '',
      claim_amount: '',
      satisfied_claim_amount: '',
      percent_claim_amount: '',
      date_satisfaction: '',
    },
    form: null,
    repaymentOrderType: [
      {'text': 'Очередь не определена', value: 'ES'},
      {'text': 'Первая очередь', value: 'FS'},
      {'text': 'Вторая очередь', value: 'SS'},
      {'text': 'Третья очередь', value: 'TS'},
      {'text': 'За реестром', value: 'BR'},
    ],
    thirdStageType: [
      {'text': 'Не указано', value: 'empty'},
      {'text': 'Основной долг', value: 'PD'},
      {'text': 'Требования, не обеспеченные залогом', value: 'UC'},
      {'text': 'Требования, обеспеченные залогом', value: 'SC'},
      {'text': 'Штрафы, пени', value: 'FP'},
      {'text': 'Проценты', value: 'PT'},
      {'text': 'Другое', value: 'OR'},
    ],
    behindRegisterType: [
      {'text': 'Не указано', value: 'empty'},
      {'text': 'Основной долг', value: 'PD'},
      {'text': 'Требования, не обеспеченные залогом', value: 'UC'},
      {'text': 'Требования, обеспеченные залогом', value: 'SC'},
      {'text': 'Штрафы, пени', value: 'FP'},
      {'text': 'Проценты', value: 'PT'},
      {'text': 'Госпошлина', value: 'ST'},
      {'text': 'Другое', value: 'OR'},
    ]


  }),
  computed: {
    ...mapGetters({
      allRefList: 'allRefData',
    })
  },
  watch: {
    project: {
      immediate: true,
      handler(newProject) {
        // При изменении project обновляем его в форме
        if (newProject && this.form) {
          this.form.project = newProject;
        }
      }
    },
    'form.claim_amount'(val) {
      this.form.claim_amount = this.cleanNumberInput(val);
    },
    'form.satisfied_claim_amount'(val) {
      this.form.satisfied_claim_amount = this.cleanNumberInput(val);
    },
    'form.percent_claim_amount'(val) {
      this.form.percent_claim_amount = this.cleanNumberInput(val);
    }
  },
  methods: {
    initForm() {
      this.form = {
        id: '',
        legal_creditor: '',
        physical_creditor: '',
        repayment_queue: '',
        third_stage_type: '',
        behind_register_type: '',
        project: this.project,
        claim_amount: '',
        satisfied_claim_amount: '',
        percent_claim_amount: '',
        date_satisfaction: ''
      };
      this.creditor = null;

      // Сбрасываем ошибки
      for (let prop in this.errorMessage) {
        this.errorMessage[prop] = '';
      }
    },
    cleanNumberInput(val) {
      if (val && typeof val === 'string') {
        // Удаляем все пробелы, заменяем запятые на точки
        let cleaned = val.replace(/\s+/g, '').replace(/,/g, '.');

        // Удаляем все символы, кроме цифр, точки и минуса
        cleaned = cleaned.replace(/[^\d.-]/g, '');

        // Оставляем только первую точку (для десятичных)
        const parts = cleaned.split('.');
        if (parts.length > 2) {
          cleaned = parts[0] + '.' + parts.slice(1).join('');
        }

        return cleaned;
      }
      return val;
    },
    setCreditor(item) {
      if (item['type'] === "LegalEntity") {
        this.form.legal_creditor = item.id
      } else {
        this.form.physical_creditor = item.id
      }
    },
    reset() {
      this.$emit('resetForm')
      this.$emit('close')
      this.initForm()
    },
    save() {
      for (let prop in this.errorMessage) {
        this.errorMessage[prop] = ''
      }
      let formData = new FormData()
      Object.keys(this.form).forEach(key => {
        if (this.form[key]) {
          formData.set(key, this.form[key])
        }
      })
      if (this.form.id) {
        this.$store.dispatch('editCreditorClaim', {formData, id: this.form.id}).then(() => {
          this.$emit('updateCreditorClaimList')
          this.initForm()

        }).catch(err => {
          let errors = err.response.data.errors
          Object.keys(errors).forEach(key => {
            this.errorMessage[key] = errors[key].toString()
          })
        })
      } else {
        this.$store.dispatch('saveCreditorClaim', formData).then((res) => {
          this.form.id = res.id
          this.$emit('updateCreditorClaimList')
          this.initForm()
        }).catch(err => {
          let errors = err.response.data.errors
          Object.keys(errors).forEach(key => {
            this.errorMessage[key] = errors[key].toString()
          })
        })
      }
    }
  },
  created() {
    // Инициализируем форму
    this.initForm();

    if (this.creditorClaimData) {
      Object.keys(this.creditorClaimData).forEach(key => {
        if (key === 'physical_creditor' && this.creditorClaimData[key]) {
          this.form.physical_creditor = this.creditorClaimData[key]['id'];
          this.creditor = this.creditorClaimData[key];
        } else if (key === 'legal_creditor' && this.creditorClaimData[key]) {
          this.form.legal_creditor = this.creditorClaimData[key]['id'];
          this.creditor = this.creditorClaimData[key];
        } else {
          this.form[key] = this.creditorClaimData[key];
        }
      });
    }
  }
}

</script>

<style scoped>

</style>