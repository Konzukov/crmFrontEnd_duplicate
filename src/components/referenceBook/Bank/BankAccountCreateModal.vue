<template>
  <v-container fluid>
    <v-dialog v-model="dialog" width="70vw" persistent>
      <v-card>
        <v-card-text>
          <v-form lazy-validation class="pt-4">
            <v-row justify="start">
              <v-col cols="4">
                <v-autocomplete label="Тип счета" outlined dense
                                :items="bankAccountType"
                                item-text="text"
                                item-value="value"
                                v-model="form.account_type"
                ></v-autocomplete>
              </v-col>
              <v-col cols="4">
                <v-autocomplete dense label="Банк" outlined v-model="form.bank" append-outer-icon="mdi-plus"
                                @click:append-outer="addBank" :items="bankList" item-text="name" item-value="id">

                </v-autocomplete>
              </v-col>
            </v-row>
            <v-row justify="start">
              <v-col cols="4">
                <v-text-field dense outlined label="Расчетный счет" v-model="form.account" counter="20" :rules="rules"
                              append-outer-icon="mdi-file-document"
                              persistent-hint
                              :hint="bank? bank.name: ''"
                >
                  <template v-slot:append-outer>
                    <v-menu
                        open-on-hover
                        top
                        offset-y
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            :color="account_statement.length > 0? 'primary': 'grey darken-1 '"
                            dark
                            icon
                            v-bind="attrs"
                            v-on="on"
                            @click="addBankStatement"
                        >
                          <v-icon>mdi-file-document-outline</v-icon>
                        </v-btn>
                      </template>

                      <v-list>
                        <v-list-item
                            v-for="(item, index) in account_statement"
                            :key="index"
                            link
                        >

                          <v-list-item-subtitle>Выписка {{ item.date_from }} - {{ item.date_to }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field dense outlined label="Дата открытия" type="date" v-model="form.opening_date"
                              append-outer-icon="mdi-file-document">

                </v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field dense outlined label="Дата закрытия" type="date" v-model="form.closing_date"
                              append-outer-icon="mdi-file-document">
                </v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-row justify="center"  class="mb-0">
            <v-col cols="auto">
              <v-btn color="error" @click="close">Отмена</v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn @click="save" color="success">Сохранить</v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <AccountStatementModal></AccountStatementModal>
    <SystemMessage :state.sync="state"></SystemMessage>
  </v-container>
</template>

<script>
import {mapGetters} from 'vuex'
import AccountStatementModal from "@/components/referenceBook/Bank/AccountStatementModal.vue";
import moment from "moment";
import {eventBus} from "@/bus";
import SystemMessage from "@/components/UI/SystemMessage.vue";

export default {
  props: ['bankData', 'project'],
  name: "BankAccountCreate",
  data: () => ({
    dialog: false,
    bankAccountType: [
      {text: 'Не указан', value: 'EMP'},
      {text: 'Основной счет', value: 'MA'},
      {text: 'Специальный счет', value: 'SA'},
      {text: 'Предпринимательский счет', value: 'EA'},

    ],
    rules: [v => v.length === 20 || 'Номер счета должен состоять из 20 цифр'],
    bank: null,
    form: {
      id: '',
      legal: '',
      physical: '',
      bank: '',
      account: '',
      account_type: '',
      opening_date: '',
      closing_date: '',
    },
    state: '',
    account_statement: []
  }),
  computed: {
    ...mapGetters({
      bankList: 'bankListData'
    })
  },
  methods: {
    save() {
      let formData = new FormData()
      Object.keys(this.form).forEach(key => {
        if (this.form[key]) {
          formData.set(key, this.form[key])
        }
      })
      if (this.form.id) {
        this.$store.dispatch('editBankAccount', {formData, id: this.form.id}).then((item)=>{
          this.$emit('updateAccount', item)
          this.close()
        }).catch(err=>{
          this.$emit('showSystemMessage', {response: err, state: this.state})
        })
      } else {
        this.$store.dispatch('createBankAccount', formData).then((item)=>{
          this.$emit('updateAccount', item)
          this.close()
        }).catch(err=>{
          this.$emit('showSystemMessage', {response: err, state: this.state})
        })
      }

    },
    addBankStatement() {
      this.$emit('addAccountStatement', {account: this.form.id, project: this.project})
    },
    addBank() {
      eventBus.$emit('createLegalEntity', this.bank)
      // this.$emit('createLegalEntity', this.bank)
    },
    close() {
      Object.assign(this.$data, this.$options.data())
      this.dialog = false
    }
  },
  mounted() {
    this.$store.dispatch('getBankList')
    this.$parent.$on('editBankAccount', item => {
      this.form.id = item.id
      this.form.account = item.account
      this.form.bank = item.bank.id
      this.form.account_type = item.account_type
      this.form.opening_date = moment(item.opening_date, 'DD.MM.YYYY').format('YYYY-MM-DD')
      if (item.closing_date){
        this.form.closing_date = moment(item.closing_date, 'DD.MM.YYYY').format('YYYY-MM-DD')
      }
      this.dialog = true
    })
    this.$parent.$on('addBankAccount', (instance) => {
      console.log(instance)
      if (instance.hasOwnProperty('bank')){
        this.bank = instance.bank
        this.bank['type'] = 'bank'
      }
      Object.keys(this.form).forEach(key=>{
        console.log(key)
        if (instance.hasOwnProperty(key)){
          console.log(key, instance[key])
          if (key==='physical'){
            this.form[key] = instance[key].id
          }else {
            this.form[key] = instance[key]
          }
        }
      })
      if (instance.physical_contractor) {
        this.form.physical = instance.physical_contractor.id
      } else if (instance.legal_contractor) {
        this.form.legal = instance.legal_contractor.id
      }
      this.dialog = true
    })

  },
  components: {
    SystemMessage,
    AccountStatementModal,
    }
}
</script>

<style scoped>
>>>.v-card {
  height: fit-content;
}
</style>