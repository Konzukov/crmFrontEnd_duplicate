<template>
  <v-container>
    <v-card style="max-height: 80vh; overflow-x: scroll">
      <v-card-title>Добавление организации</v-card-title>
      <v-card-text>
        <v-form lazy-validation ref="legalEntity" v-model="valid">
          <v-row justify="start">
            <v-col cols="4">
              <v-select dense outlined label="Тип организаци"
                        :items="organizationType" item-text="text" item-value="val"
                        v-model="formData.legal_type"
              ></v-select>
            </v-col>
            <v-col cols="8">
              <v-text-field :rules="formRules" outlined dense label="Название организации" v-model="formData.name"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="auto">
              <v-text-field dense outlined label="ИНН" v-model="formData.inn"></v-text-field>
            </v-col>
            <v-col cols="auto">
              <v-text-field dense outlined label="КПП" v-model="formData.kpp"></v-text-field>
            </v-col>
            <v-col cols="auto">
              <v-text-field dense outlined label="ОРГН" v-model="formData.ogrn"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="12">
              <v-textarea rows="2" dense outlined label="Юридический адрес"
                          v-model="formData.legal_address"></v-textarea>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="12">
              <v-textarea rows="2" dense outlined label="Почтовый адрес" v-model="formData.postal_address"></v-textarea>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="4">
              <v-text-field dense outlined label="Email" v-model="formData.contact_email" :rules="emailRules"></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-header>Банковские счет</v-expansion-panel-header>
          <v-expansion-panel-content>
            <template v-for="item in this.formData.bankAccount">
              <BankAccountCreate :ref="item.ref"
                                 :key="item.index"
                                 :bank-data="item"
              ></BankAccountCreate>
            </template>
            <v-btn color="success" @click="addBackAccount">Добавить счет</v-btn>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>Контакты</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-list-item-group>
              <v-list v-for="(contactInfo, index) in formData.contact_info"
                      :key="index">
                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-title>{{ contactInfo.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-row>
                        <v-col cols="6" lg="6" md="12">
                          <v-icon>mdi-phone</v-icon>
                          <a :href="'tel:'+contactInfo.phone">{{ contactInfo.phone }}</a>
                        </v-col>
                        <v-col cols="6" lg="6" md="12">
                          <v-icon>mdi-email</v-icon>
                          <a :href="'mailto:'+ contactInfo.email">{{ contactInfo.email }}</a>
                        </v-col>
                      </v-row>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon @click="editContactInfo(contactInfo)">
                      <v-icon color="green lighten-1">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon
                           @click="removeContactInfo(contactInfo, legalEntityDetail.pk)">
                      <v-icon color="error">mdi-minus-circle</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-list-item-group>
            <v-btn class="ma-2"
                   @click="addContactInfo(legalEntityDetail)"
                   tile
                   outlined
                   color="success">
              <v-icon left>mdi-plus</v-icon>
              Добавить
            </v-btn>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-card-actions v-if="showActionButton">
        <v-spacer></v-spacer>
        <v-btn color="error darken-1"
               class="mr-4"
               @click="close"
        >Отмена
        </v-btn>
        <v-btn
            color="success darken-1"
            :disabled="!valid" class="mr-4"
            @click="addLegalEntity()"
        >Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
    <BankAccountCreateModal></BankAccountCreateModal>
    <ContactInfoEdit></ContactInfoEdit>
    <SystemMessage :state.sync="state"/>
  </v-container>

</template>

<script>
import func from "../../../assets/functions/func";
import BankAccountCreate from "@/components/referenceBook/Bank/BankAccountCreate";

import {mapGetters} from 'vuex'
import BankAccountCreateModal from "@/components/referenceBook/Bank/BankAccountCreateModal";
import ContactInfoEdit from "@/components/modalWindows/ContactInfoEdit";
import SystemMessage from "@/components/UI/SystemMessage.vue";

export default {
  name: "LegalEntityCreate",
  props: {
    legalData: Object,
    rectifiedLegalEntity: Object,
    showActionButton: {
      type: Boolean,
      default: true
    },
    callSave: Boolean
  },
  // ['subsystem', 'legalData', 'rectifiedLegalEntity'],
  data() {
    return {
      dialog: false,
      valid: true,
      organizationType: [
        {val: 'EMPTY', text: 'Юридическое лицо'},
        {val: 'BANK', text: 'Банк'},
        {val: 'FSSP', text: 'Федеральная служба судебных приставов'},
        {val: 'FNS', text: 'Федеральная налоговая служба'},
        {val: 'PFR', text: 'Пенсионный фонд'},
        {val: 'GIBDD', text: 'ГИБДД'},
        {val: 'GIMS', text: 'Государственная инспекция по маломерным судам'},
        {val: 'TECHN', text: 'Технадзор'},
        {val: 'ADDRD', text: 'Адресный стол'},
        {val: 'MVD', text: 'Министерство внутренних дел'},
        {val: 'BTI', text: 'Бюро технической инвентаризации'},
        {val: 'KIO', text: 'Комитет имущественных отношений'},
        {val: 'DIZO', text: 'Департамент имущественно-земельных отношений'},
        {val: 'OSFR', text: 'Пенсионный и социальный фонды'},
        {val: 'GIT', text: 'Государственная инспекция по труду'},
        {val: 'UFSVN', text: 'Управление Федеральной службы войск национальной гвардии'},
        {val: 'EMPLS', text: 'Служба занятости'},
        {val: 'ZAGS', text: 'ЗАГС'},
        {val: 'ARBCR', text: 'Арбитражный суд'},
        {val: 'GEJRD', text: 'Суд общей юрисдикции'},
        {val: 'MGSCR', text: 'Мировой суд'},
        {val: 'MOSC', text: 'Военный и другие специализированные суды'},
      ],
      state: '',
      formData: {
        pk: '',
        legal_type: 'EMPTY',
        name: '',
        full_name: '',
        inn: '',
        kpp: '',
        ogrn: '',
        country: '',
        legal_address: '',
        postal_address: '',
        contact_email: '',
        bankAccount: [],
        contact_info: [],
      },
      country: [],
      formRules: [
        v => !!v || 'Данное поля обязатольно'
      ],
      emailRules: [
        v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail введен некорректно'
      ]
    }
  },
  watch: {
    legalData(val) {
      if (val) {
        this.updateData(val)
      }
    },
    rectifiedLegalEntity(val) {
      if (val) {
        this.updateData(val)
      }
    },
    callSave(val) {
      if (val) {
        this.addLegalEntity()
      }
    }
  },
  computed: {
    ...mapGetters({
      bankList: 'bankListData'
    })
  },
  methods: {
    close(){
      this.$refs.legalEntity.reset()
    },
    addLegalEntity() {
      if (this.$refs.legalEntity.validate()) {
        let data = func.createFormData(this.formData)
        if (this.formData.pk) {
          this.$store.dispatch('editLegalEntity', {data, legalEntityDetail: this.formData}).then(res=>{
            console.log(res)
            this.$emit('closeModal', res.data.data.data)
            this.state = 'success'
            this.$emit('showSystemMessage', {response: res, state: this.state, send: false})
          })
        } else {
          this.$store.dispatch('createLegalEntity', data).then(res=>{
            this.$emit('closeModal', res.data.data.data)
            this.state = 'success'
            this.$emit('showSystemMessage', {response: res, state: this.state, send: false})
            this.close()
          })
        }
      }

    },
    addBackAccount() {
      this.$emit('addBankAccount', this.formData)
    },
    updateData(val) {
      this.formData.bankAccount = []
      console.log(val)
      Object.keys(val).filter(key => {
        if (val[key] !== 'null') {
          if (key === 'fullName') {
            this.formData.full_name = val[key]
          } else if (key === 'bank_account') {
            this.formData.bankAccount = val['bank_account']
          } else {
            this.formData[key] = val[key]
          }
        } else {
          this.formData[key] = ''
        }
      })
    }
  },
  components: {
    SystemMessage,
    BankAccountCreate,
    BankAccountCreateModal,
    ContactInfoEdit
  },
  created() {
    if (this.rectifiedLegalEntity) {
      this.updateData(this.rectifiedLegalEntity)
    }else{
      Object.assign(this.$data, this.$options.data())
    }
    this.$store.dispatch('getBankList')
  }
}
</script>

<style scoped>
form .row .col {
  padding-bottom: 0;
  padding-top: 0;
}
</style>