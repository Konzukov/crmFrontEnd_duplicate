<template>
  <v-container>
    <v-form lazy-validation class="pt-4">
      <v-row>
        <v-col cols="7">
          <v-text-field dense outlined label="Номер карты" v-model="form.card_number" counter="20" :rules="rules">
          </v-text-field>
        </v-col>
        <v-col cols="5">
          <v-autocomplete dense outlined label="Платежная система" v-model="form.card_type" :items="cardType"
                          item-value="val"
                          item-text="text">
            <template v-slot:append>
              <v-img max-width="40" max-height="55" :src="bankInfo.brandLogo"></v-img>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="8">
          <v-autocomplete dense label="Банк" outlined v-model="form.bank" append-outer-icon="mdi-plus"

                          @click:append-outer="addBank" :items="bankList" item-text="name" item-value="id">
          </v-autocomplete>
        </v-col>

        <v-col cols="4">
          <v-text-field return-masked-value
                        outlined dense label="Срок действия карты" v-model="form.validity"
                        v-mask="'##/##'"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field dense outlined label="Дата передачи карты" v-model="form.transfer_date"
                        type="date"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
      </v-row>
      <v-row justify="start" class="ml-1 mr-1">

        <v-textarea dense outlined label="Комментарий" v-model="form.comment">

        </v-textarea>
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
    <BankCreate></BankCreate>

  </v-container>
</template>


<script>
import BankCreate from "@/components/referenceBook/Bank/BankCreate.vue";
import {mapGetters} from "vuex";
import {isEmpty} from "lodash";
import {CardInfo} from 'card-info'
import moment from "moment";

export default {
  props: ['bankCardData', 'project'],
  name: "BankCardCreate",
  data: () => ({
    cardType: [
      {val: 'VISA', text: 'VISA'},
      {val: 'MASTERCARD', text: 'MasterCard'},
      {val: 'MIR', text: 'Мир'},
    ],
    rules: [v => (v.length < 21 || v.length > 15) || 'Номер счета должен состоять из 20 цифр'],
    form: {
      id: '',
      legal: '',
      physical: '',
      bank: '',
      card_number: '',
      card_type: '',
      validity: '',
      transfer_date: '',
      comment: ''
    },
    bankInfo: {
      bankLogo: null,
      brandLogo: null,
      backgroundColor: null
    }
  }),
  computed: {
    ...mapGetters({
      bankList: 'bankListData'
    })
  },
  watch: {
    'form.card_number'(val) {
      if (val.length > 5) {
        let card = new CardInfo(val, {
          banksLogosPath: '/media/bank/banks-logos/',
          brandsLogosPath: '/media/bank/brands-logos/',
          brandLogoPolicy: 'colored'
        })
        console.log(card)
        if (card.brandName === "Maestro") {
          this.form.card_type = "MASTERCARD"
        } else if (card.brandName === "Visa") {
          this.form.card_type = "VISA"
        }
        this.bankInfo.bankLogo = card.bankLogo
        this.bankInfo.brandLogo = card.brandLogo
        this.bankInfo.backgroundColor = card.backgroundColor
        if (card.bankName) {
          this.bankList.filter(obj => {
            if (obj['name'].toString().toLowerCase().indexOf(card.bankName.toLowerCase()) !== -1) {
              this.form.bank = obj['id']
            }
          })
        }
      }
    }
  },
  methods: {
    async syncData() {
      console.log(this.project)
      if (!isEmpty(this.bankCardData)) {
        this.form.id = this.bankCardData.id
        this.form.legal = this.bankCardData.legal
        this.form.physical = this.bankCardData.physical
        this.form.bank = this.bankCardData.bank.id
        this.form.card_number = this.bankCardData.card_number
        this.form.validity = this.bankCardData.validity
        this.form.comment = this.bankCardData.comment
        this.account_statement = this.bankCardData.account_statement
      } else {
        await this.$store.dispatch('getProjectDetail', this.project).then(res => {
          if (!isEmpty(res.legal_contractor)) {
            this.form.legal = res.legal_contractor.id
          } else {
            this.form.physical = res.physical_contractor.id
          }
        })
      }
    },
    addBank() {
      this.$emit('addBank')
    },
    reset() {
      this.$emit('resetForm')
    },
    save() {
      let formData = new FormData()
      Object.keys(this.form).forEach(key => {
        if (key === 'validity') {
          console.log(this.form.validity)
          let date = moment(this.form.validity, 'MM/YY').format('YYYY-MM-DD')
          console.log(date)
          formData.append(key, date)
        } else {
          formData.append(key, this.form[key])
        }
      })
      if (this.form.id) {
        this.$store.dispatch('editBankCard', {id: this.form.id, formData}).then(data => {
          this.$emit('updateBankCardList')
        })
      } else {
        this.$store.dispatch('createBankCard', formData).then(data => {
          console.log(data)
          this.$emit('updateBankCardList')
        })
      }

    }
  },
  async created() {
    await this.$store.dispatch('getBankList')
    await this.syncData()
  },
  components: {
    BankCreate,
  }
}
</script>

<style scoped>
#input-151 {
  max-height: 35px !important;
}
</style>