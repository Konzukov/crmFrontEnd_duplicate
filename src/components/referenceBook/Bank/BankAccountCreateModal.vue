<template>
  <v-container fluid>
    <v-dialog v-model="dialog" width="60vw" persistent>
      <v-card>
        <v-card-text>
          <v-form lazy-validation class="pt-4">
        <v-row>
          <v-col cols="2">
            <v-autocomplete label="Тип счета" outlined dense
                            :items="bankAccountType"
                            item-text="text"
                            item-value="value"
                            v-model="form.account_type"
            ></v-autocomplete>
          </v-col>
          <v-col cols="2">
            <v-autocomplete dense label="Банк" outlined v-model="form.bank" append-outer-icon="mdi-plus"
                            @click:append-outer="addBank" :items="bankList" item-text="name" item-value="id">

            </v-autocomplete>
          </v-col>
          <v-col cols="4">
            <v-text-field dense outlined label="Расчетный счет" v-model="form.account" counter="20" :rules="rules"
                          append-outer-icon="mdi-file-document"


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
          <v-col cols="2">
            <v-text-field dense outlined label="Дата открытия" type="date" v-model="form.opening_date"
                          append-outer-icon="mdi-file-document">

            </v-text-field>
          </v-col>
          <v-col cols="2">
            <v-text-field dense outlined label="Дата закрытия" type="date" v-model="form.closing_date"
                          append-outer-icon="mdi-file-document">
            </v-text-field>
          </v-col>
        </v-row>

      </v-form>
        </v-card-text>
        <v-card-actions>
          <v-row justify="center">
            <v-col cols="auto"><v-btn color="error" @click="close"></v-btn></v-col>
            <v-col cols="auto"><v-btn @click="save" color="success">Сохранить</v-btn></v-col>
          </v-row>
        </v-card-actions>
      </v-card>

    </v-dialog>
    <BankCreate></BankCreate>
    <AccountStatementModal></AccountStatementModal>
  </v-container>
</template>

<script>
import BankCreate from "./BankCreate";
import {mapGetters} from 'vuex'
import AccountStatementModal from "@/components/referenceBook/Bank/AccountStatementModal.vue";

export default {
  props: ['bankData', 'project'],
  name: "BankAccountCreate",
  data: () => ({
    dialog: false,
    bankAccountType: [
      {text: 'Не указан', value: 'EMP'},
      {text: 'Основной счет', value: 'MA'},
      {text: 'Специальный счет', value: 'SA'},

    ],
    rules: [v => v.length === 20 || 'Номер счета должен состоять из 20 цифр'],
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
        this.$store.dispatch('editBankAccount', {formData, id: this.form.id})
      } else {
        this.$store.dispatch('createBankAccount', formData)
      }

    },
    addBankStatement() {
      this.$emit('addAccountStatement', {account: this.form.id, project: this.project})
    },
    addBank() {
      this.$emit('addBank')
    },
    close(){
      Object.assign(this.$data, this.$options.data())
      this.dialog = false
    }
  },
  mounted() {
    this.$parent.$on('addBankAccount', (instance) => {
      if (instance.physical_contractor) {
        this.form.physical = instance.physical_contractor.id
      } else if (instance.legal_contractor) {
        this.form.legal = instance.legal_contractor.id
      }
      this.$store.dispatch('getBankList')
      this.dialog = true
    })
  },
  components: {
    AccountStatementModal,
    BankCreate
  }
}
</script>

<style scoped>

</style>