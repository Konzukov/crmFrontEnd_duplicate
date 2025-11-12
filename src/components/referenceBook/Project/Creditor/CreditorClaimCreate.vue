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
      <v-row>
        <v-col col="3">
          <v-text-field dense outlined label="Сумма требования" v-model="form.claim_amount"
                        @keypress="isNumber($event)"></v-text-field>
        </v-col>
        <v-col col="3">
          <v-text-field dense outlined label="Сумма удовлетворенных требований"
                        v-model="form.satisfied_claim_amount" @keypress="isNumber($event)"></v-text-field>
        </v-col>
        <v-col col="3">
          <v-text-field dense outlined label="Процент удовлетворенных требований"
                        v-model="form.percent_claim_amount" @keypress="isNumber($event)"></v-text-field>
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
    form: {
      id: '',
      legal_creditor: '',
      physical_creditor: '',
      repayment_queue: '',
      third_stage_type: '',
      project: '',
      claim_amount: '',
      satisfied_claim_amount: '',
      percent_claim_amount: '',
      date_satisfaction: ''
    },
    repaymentOrderType: [
      {'text': 'Очередь не определена', value: 'ES'},
      {'text': 'Первая очередь', value: 'FS'},
      {'text': 'Вторая очередь', value: 'SS'},
      {'text': 'Третья очередь', value: 'TS'},
      {'text': 'За реестром', value: 'BR'},
    ],
    thirdStageType: [
      {'text': 'Не указано', value: 'empty'},
      {'text': 'Требования, не обеспеченные залогом', value: 'UC'},
      {'text': 'Требования, обеспеченные залогом', value: 'SC'},
      {'text': 'Штрафы, пени', value: 'FP'},
      {'text': 'Проценты', value: 'PT'},
      {'text': 'Другое', value: 'OR'},
    ]

  }),
  computed: {
    ...mapGetters({
      allRefList: 'allRefData',
    })
  },
  watch: {
    'form.claim_amount'(val) {
      if (val) {
        this.form.claim_amount = val.replaceAll(',', '.').replaceAll('-', '.').replaceAll('=', '.')
      }

    },
    'form.satisfied_claim_amount'(val) {
      if (val) {
        this.form.satisfied_claim_amount = val.replaceAll(',', '.').replaceAll('-', '.').replaceAll('=', '.')
      }
    },
    'form.percent_claim_amount'(val) {
      if (val) {
        this.form.percent_claim_amount = val.replaceAll(',', '.').replaceAll('-', '.').replaceAll('=', '.')
      }
    },
  },
  methods: {
    setCreditor(item) {
      if (item['type'] === "LegalEntity") {
        this.form.legal_creditor = item.id
      } else {
        this.form.physical_creditor = item.id
      }
    },
    isNumber: function (evt) {
      evt = (evt) ? evt : window.event;
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46 && charCode !== 44) {
        evt.preventDefault()
      } else {
        return true;
      }
    },
    reset() {
      this.$emit('resetForm')
      this.$emit('close')
      Object.assign(this.$data, this.$options.data())
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
          Object.assign(this.$data, this.$options.data())

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
          Object.assign(this.$data, this.$options.data())
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
    this.form.project = this.project
    if (this.creditorClaimData) {
      Object.keys(this.creditorClaimData).forEach(key => {
        if (key === 'physical_creditor' && this.creditorClaimData[key]) {
          this.form.physical_creditor = this.creditorClaimData[key]['id']
          this.creditor = this.creditorClaimData[key]
        } else if (key === 'legal_creditor' && this.creditorClaimData[key]) {
          this.form.legal_creditor = this.creditorClaimData[key]['id']
          this.creditor = this.creditorClaimData[key]
        } else {
          this.form[key] = this.creditorClaimData[key]
        }
      })
    }
  }
}

</script>

<style scoped>

</style>