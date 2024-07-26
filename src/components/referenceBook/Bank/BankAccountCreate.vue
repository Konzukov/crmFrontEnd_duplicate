<template>
  <v-container>
    <v-form lazy-validation class="pt-4">
      <v-row>
        <v-col cols="6">
          <v-autocomplete label="Тип счета" outlined dense
                          :items="bankAccountType"
                          item-text="text"
                          item-value="value"
                          v-model="form.account_type"
          ></v-autocomplete>
        </v-col>
        <v-col cols="6">
          <v-autocomplete dense label="Банк" outlined v-model="form.bank" append-outer-icon="mdi-plus"
                          @click:append-outer="addBank" :items="bankList" item-text="name" item-value="id">

          </v-autocomplete>
        </v-col>
        <v-col cols="8">
          <v-text-field dense outlined label="Расчетный счет" v-model="form.account" counter="20" :rules="rules"
                        append-outer-icon="mdi-file-document"
                        class="account_statement"
                        :error-messages="errorMessage.account"
          >
            <template v-slot:append-outer>
              <v-menu
                  open-on-hover
                  top
                  offset-y
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                      class="mt-0"
                      :color="account_statement.length > 0? 'primary': 'grey darken-1 '"
                      dark
                      icon
                      v-bind="attrs"
                      v-on="on"
                      @click="addBankStatement"
                  >
                    <svg-icon type="mdi" :path="fileIcon"></svg-icon>
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item
                      @click="editStatement(item)"
                      v-for="(item, index) in account_statement"
                      :key="index"
                      link
                  >

                    <v-list-item-subtitle>{{ item.date_from }} - {{ item.date_to }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="4">
          <v-text-field outlined dense label="Остаток на счете" v-model="form.balance"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <v-text-field dense outlined label="Дата открытия" type="date" v-model="form.opening_date"
                        append-outer-icon="mdi-file-document" :value.sync="form.opening_date">

          </v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field dense outlined label="Дата закрытия" type="date" v-model="form.closing_date"
                        append-outer-icon="mdi-file-document">
          </v-text-field>
        </v-col>
      </v-row>
      <v-row class="ml-1 mb-2">
        <v-chip small class="mr-2" @click="addToComment">Направлен запрос в банк</v-chip>
        <v-chip small class="mr-2" @click="addToComment">Получен ответ от банка</v-chip>
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
    <AccountStatementModal></AccountStatementModal>
  </v-container>

</template>

<script>
import {mapGetters} from "vuex";
import BankCreate from "./BankCreate";
import AccountStatementModal from "@/components/referenceBook/Bank/AccountStatementModal.vue";
import {isEmpty} from 'lodash'
import SvgIcon from '@jamescoyle/vue-icon';
import {mdilFilePlus} from '@mdi/light-js'
import moment from "moment";

// import customConst from "@/const/customConst";

export default {
  props: ['bankData', 'project'],
  name: "BankAccountCreate",
  data: () => ({
    fileIcon: mdilFilePlus,
    errorMessage: {
      account: '',
    },
    bankAccountType: [
      {text: 'Не указан', value: 'EMP'},
      {text: 'Основной счет', value: 'MA'},
      {text: 'Специальный счет', value: 'SA'},

    ],
    rules: [v => !!v || 'Номер счета не может быть пустым'],
    form: {
      id: '',
      legal: '',
      physical: '',
      bank: '',
      account: '',
      account_type: '',
      opening_date: '',
      closing_date: '',
      balance: '',
      comment: ''
    },
    account_statement: []
  }),
  computed: {
    ...mapGetters({
      bankList: 'bankListData'
    })
  },
  methods: {
    async syncData() {
      if (!isEmpty(this.bankData)) {
        this.form.id = this.bankData.id
        this.form.legal = this.bankData.legal
        this.form.physical = this.bankData.physical
        this.form.bank = this.bankData.bank.id
        this.form.account = this.bankData.account
        this.form.account_type = this.bankData.account_type
        if (this.bankData.opening_date) {
          this.form.opening_date = moment(this.bankData.opening_date, 'DD.MM.yyyy').format('yyyy-MM-DD')
        } else {
          this.form.opening_date = null
        }
        if (this.bankData.closing_date) {
          this.form.closing_date = moment(this.bankData.closing_date, 'DD.MM.yyyy').format('yyyy-MM-DD')
        } else {
          this.form.closing_date = null
        }
        this.form.balance = this.bankData.balance
        this.form.comment = this.bankData.comment
        this.account_statement = this.bankData.account_statement
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
    editStatement(item) {
      this.$emit('editAccountStatement', {'statement': item, 'project': this.$route.params['pk']})
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
        this.$store.dispatch('editBankAccount', {formData, id: this.form.id}).then(() => {
          this.$emit('updateAccountList')
        }).catch(err => {
          let errors = err.response.data.errors
          Object.keys(errors).forEach(key => {
            this.errorMessage[key] = errors[key].toString()
          })
        })
      } else {
        this.$store.dispatch('createBankAccount', formData).then((res) => {
          this.form.id = res.id
          this.$emit('updateAccountList')
        }).catch(err => {
          let errors = err.response.data.errors
          Object.keys(errors).forEach(key => {
            this.errorMessage[key] = errors[key].toString()
          })
        })
      }

    },
    addBankStatement() {
      this.$emit('addAccountStatement', {account: this.form.id, project: this.project})
    },
    addBank() {
      this.$emit('addBank')
    },
    reset() {
      this.$emit('resetForm')
    },
    addToComment(event) {
      this.form.comment += '\n ' + event.srcElement.innerHTML
      console.log(event.srcElement.innerHTML)
    }
  },
  async created() {
    await this.$store.dispatch('getBankList')
    await this.syncData()
  },
  components: {
    BankCreate,
    AccountStatementModal,
    SvgIcon
  }
}
</script>

<style scoped>
.account_statement >>> .v-input__append-outer {
  margin-top: 0px !important;
}

.v-list-item {
  font-size: 12px;
  min-height: 30px;
}
</style>