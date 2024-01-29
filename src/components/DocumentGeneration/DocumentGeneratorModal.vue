<template>
  <v-container>
    <v-dialog v-model="display" width="700" persistent>
      <v-card height="70vh" style="overflow-y: scroll" v-if="template">
        <v-toolbar dense>
          <v-toolbar-title v-if="template">{{ template.name }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text >
          <v-row justify="start">
            <v-col cols="4" class="mt-5">
              <v-radio-group row dense v-model="docType" v-if="template">
                <v-radio
                    label="DOCX"
                    value="docx"
                ></v-radio>
                <v-radio
                    :disabled="!!!template['template_f']"
                    label="PDF"
                    value="pdf"
                ></v-radio>
                <v-radio
                    :disabled="!!!template['template_wf']"
                    label="PDF без факсимиле"
                    value="pdff"
                ></v-radio>
              </v-radio-group>
              <v-btn :disabled="!vueStore.valid" @click="generateDocument">Сформировать</v-btn>
            </v-col>
            <v-col cols="7">
              <h5>Список полей в шаблоне</h5>
              <v-list class="field__list" v-for="field in template.fields" :key="field.id">
                <v-form v-model="vueStore.valid" ref="generator">
                  <template v-if="field['selected']">
                    <v-row v-if="field.value ==='BAILIFFS'" justify="start">
                      <v-col cols="4">
                        <v-autocomplete outlined dense label="Регион" :items="regionList" item-value="id"
                                        v-model="region"
                                        item-text="name"></v-autocomplete>
                      </v-col>
                      <v-col cols="8">
                        <v-autocomplete outlined dense :label="field.name"
                                        :items="bailiffsList"
                                        item-text="name"
                                        item-value="id"
                                        :rules="rules.required"
                                        v-model="templateFields[field.value]"></v-autocomplete>
                      </v-col>
                    </v-row>
                    <v-row v-if="field.value ==='FROM_MONTH'" justify="start" class="mr-1 ml-1">
                      <v-autocomplete outlined dense :label="field.name" :items="monthList" item-value="text"
                                      item-text="text" v-model="templateFields[field.value]"></v-autocomplete>
                    </v-row>
                    <v-row v-if="field.value ==='CONTRACT'" justify="start" class="mr-1 ml-1">
                      <v-autocomplete outlined dense :label="field.name" :items="contractList" item-value="id"
                                      item-text="name" return-object v-model="contract"></v-autocomplete>
                    </v-row>
                    <v-row v-if="field.value ==='BANK'" justify="start" class="mr-1 ml-1">
                      <v-autocomplete outlined dense :label="field.name" :items="legalList" item-value="id"
                                      :append-outer-icon="!bank? 'mdi-plus': 'mdi-pencil'"
                                      :error-messages="bank && (!bank.inn || !bank.legal_address)? 'Необходимо заполнить данные': ''"
                                      @click:append-outer="editContractor(bank)"
                                      item-text="name" return-object v-model="bank"></v-autocomplete>
                    </v-row>
                    <v-row v-if="field.value ==='CREDITOR'" justify="start" class="mr-1 ml-1">
                      <v-autocomplete outlined dense :label="field.name" :items="allRefList" item-value="id"
                                      :append-outer-icon="!creditor? 'mdi-plus': 'mdi-pencil'"
                                      @click:append-outer="editContractor(creditor)"
                                      :error-messages="!creditor || (!creditor.inn || !creditor.legal_address)? 'Необходимо заполнить данные': ''"
                                      item-text="name" return-object v-model="creditor"></v-autocomplete>
                    </v-row>
                    <v-row v-if="field.value ==='BANK_ACCOUNT'" justify="start">
                      <v-autocomplete outlined dense :label="field.name" :items="bankAccountList" item-value="id"

                                      return-object v-model="bankAccount">
                        <template v-slot:selection="data">
                          <span style="font-size: 13px">{{ data.item.bank.name }} - {{ data.item.account }}</span>
                        </template>
                        <template v-slot:item="data">
                          <span style="font-size: 13px">{{ data.item.bank.name }} - {{ data.item.account }}</span>
                        </template>
                      </v-autocomplete>
                    </v-row>
                    <v-row v-if="field.value ==='BANK_CARD'" justify="start">
                      <v-autocomplete outlined dense :label="field.name" :items="bankCardList" item-value="id"
                                      multiple
                                      v-model="bankCard">
                        <template v-slot:selection="data">
                          <span style="font-size: 13px">{{ data.item.bank.name }} - {{ data.item.card_number }} </span>
                        </template>
                        <template v-slot:item="data">
                          <span style="font-size: 13px">{{ data.item.bank.name }} - {{ data.item.card_number }}</span>
                        </template>
                      </v-autocomplete>
                    </v-row>
                  </template>
                  <template v-else-if="field['is_date']">
                    <v-text-field type="date" :rules="rules.required"
                                  dense outlined v-model="templateFields[field.value]" :label="field.name">
                    </v-text-field>
                  </template>
                  <template v-else-if="field['is_datetime']">
                    <v-text-field type="datetime-local" :rules="rules.required"
                                  dense outlined v-model="templateFields[field.value]" :label="field.name">
                    </v-text-field>
                  </template>
                  <template v-else-if="field['is_file']">
                    <v-file-input :rules="rules.required"
                                  dense outlined v-model="dataFile" :label="field.name"></v-file-input>
                  </template>
                  <v-text-field v-else-if="!field['auto_generated']" :rules="rules.required"
                                dense outlined v-model="templateFields[field.value]" :label="field.name"></v-text-field>
                </v-form>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmSave" width="500">
      <v-card height="30vh" v-if="template">
        <v-card-title>Подтверждение сохранения документа</v-card-title>
        <v-card-text>
          <p>
            Сохранить документ {{ template.name }}_{{ fileName }}_{{ templateFields['DOC_NUMBER'] }}
            в базу с иходящим номером {{ templateFields['DOC_NUMBER'] }}.
            Текущий документ можно будет заменить.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-row justify="center">
            <v-col cols="auto">
              <v-btn color="error" @click="confirmSave=!confirmSave">Отмена</v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn color="success" @click="saveDoc">Сохранить</v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <SystemMessage :state.sync="state"></SystemMessage>
  </v-container>
</template>


<script>
import {mapGetters} from "vuex";
import {compareFields} from "@/components/DocumentGeneration/functions";
import customConst from "@/const/customConst";
import {saveAs} from 'file-saver';
import SystemMessage from "@/components/UI/SystemMessage.vue";

let vueStore = {
  valid: false
}
export default {
  props: ['project'],
  name: "DocumentGeneratorModal",
  data: () => ({
    display: false,
    template: null,
    confirmSave: false,
    docType: 'docx',
    dataFile: null,
    fileName: null,
    state: null,
    verify: false,
    loading: false,
    overlay: false,
    error: false,
    vueStore: vueStore,
    templateFields: {},
    rules: {
      required: [v => !!v || 'Не удалось сапоставить значение']
    },
    projectData: null,
    bankAccountList: null,
    bankCardList: null,
    bankAccount: null,
    bankCard: [],
  }),
  computed: {
    ...mapGetters({
      documentTemplate: "docTemplateData",
      currentUser: 'authUserData',
    })
  },
  methods: {
    getProjectDetail(item) {
      console.log('getProjectDetail', item)
      this.$store.dispatch('getProjectDetail', item).then(data => {
        console.log(data)
        this.projectData = data
        if (data.legal_contractor) {
          this.legalContractor = data.legal_contractor
          this.sendEmailAddress = data.legal_contractor.contact_email
        } else {
          this.legalContractor = null
          this.sendEmailAddress = null
        }
        this.$store.dispatch('getOrganizationBankAccount', data.participant.participator.uuid).then(bankAccount => {
          this.bankAccountList = bankAccount
        })
        this.$store.dispatch('getBankCardList', data.id).then(cardList => {
          this.bankCardList = cardList
        })
        this.contractList = data.contract
        this.fileName = data['name'].split(' ')[0]
        this.$store.dispatch('getProjectAct', data['id']).then(res => {
          let act = res.data.data.data
          data['act'] = act
          compareFields(this.template.fields, data).then(async (data) => {
            this.templateFields = data
          })
        })
      })
    },
    setFormData() {
      let formData = new FormData()
      formData.append('template', this.template.id)
      formData.append('project', this.project)
      formData.append('docType', this.docType)
      formData.append('sendMailAddress', this.sendEmailAddress)
      formData.append('filename', `${this.template.name}_${this.fileName}_${this.currentUser.id}`)
      if (this.contract) {
        formData.append('contract', this.contract.pk)
      }
      if (this.bankAccount) {
        formData.append('BANK_NAME', this.bankAccount.bank.name)
        formData.append('BANK_BIK', this.bankAccount.bank.bik)
        formData.append('BANK_COR_ACCOUNT', this.bankAccount.bank.correspondent_account)
        formData.append('BANK_ACCOUNT', this.bankAccount.account)
      }
      if (this.creditor) {
        formData.append('CREDITOR', this.creditor.name)
        formData.append('CREDITOR_INN', this.creditor?.inn)
        formData.append('CREDITOR_ADDRESS', this.creditor?.legal_address)
      }
      if (this.bank) {
        formData.append('BANK', this.bank.name)
        formData.append('BANK_ID', this.bank.id)
        formData.append('BANK_ADDRESS', this.bank?.legal_address)
      }

      Object.keys(this.templateFields).forEach(key => {
        formData.append(key, this.templateFields[key])
      })
      if (this.dataFile) {
        formData.append('dataFile', this.dataFile)
      }
      if (this.bankCard) {
        this.bankCard.forEach(item => formData.append('BANK_CARD', item))
        // formData.append('BANK_CARD', this.bankCard)
      }
      return formData
    },
    generateDocument() {
      console.log(this.template.name)
      this.overlay = true
      this.loading = true
      let formData = this.setFormData()
      this.$http({
        method: "POST",
        url: customConst.GENERATOR + 'document-template/generate/',
        data: formData,
        responseType: 'blob'
      }).then(res => {
        let fileName;
        if (this.templateFields['OUT_NUMBER']) {
          fileName = `${this.fileName}_${this.template.name.replaceAll(' ', '_')}_${this.templateFields['OUT_NUMBER']}`
        } else {
          fileName = `${this.fileName}_${this.template.name.replaceAll(' ', '_')}_${this.templateFields['NUMBER']}`
        }
        if (this.template.name === 'ходатайтсво об ознакомлении с материалами дела') {
          fileName += '_1л'
        }
        saveAs(res.data, fileName)
        this.overlay = false
        this.loading = false
      }).then(() => {
        this.confirmSave = true
      }).catch(async (err) => {

        this.overlay = false
        this.loading = false
        this.state = 'error'
        this.$emit('showSystemMessage', {response: err, state: this.state})
      })
    },
    async saveDoc() {
      this.overlay = true
      this.loading = true
      let formData = this.setFormData()
      formData.append('project', this.project)
      formData.append('docType', this.docType)
      return new Promise((resolve, reject) => {
        this.$http({
          method: "POST",
          url: customConst.GENERATOR + 'document-template/save-doc/',
          data: formData,
        }).then((res) => {
          this.loading = false
          setTimeout(() => {
            this.error = false
            this.overlay = false
            this.confirmSave = false
            this.docId = res.data.data.data
            this.overlay = false
            this.loading = false
            this.state = 'success'
            this.$emit('showSystemMessage', {response: res, state: this.state})
            resolve()

          }, 1000)
        }).catch(err => {
          this.overlay = false
          this.loading = false
          this.state = 'error'
          this.$emit('showSystemMessage', {response: err, state: this.state})
        })
      })
    },
    close() {
      Object.assign(this.$data, this.$options.data())
      this.display = false
    }
  },
  created() {
    this.$parent.$on('generateDocument', (templateId) => {
      this.$store.dispatch('getDocTemplate')
      this.template = this.documentTemplate.filter(item => {
        return item.id === templateId
      })[0]
      this.getProjectDetail(this.project)
      this.display = true
    })
  },
  components: {
    SystemMessage
  }
}
</script>

<style scoped>

</style>