<template>
  <v-container>
    <v-card>
      <v-card-title class="justify-center">Генерация документа</v-card-title>
      <v-card-text>
        <v-row justify="start">
          <v-col cols="4" class="mt-5">
            <v-autocomplete dense
                            outlined
                            label="Выберете проект"
                            v-model="project"
                            :items="projectList"
                            item-text="name"
                            item-value="id"
                            @change="getProjectDetail"
            >
            </v-autocomplete>
            <v-radio-group row dense v-model="docType">
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
            <v-row class="mt-4">
              <v-col v-if='template.name === "Публикация \"Коммерсант\""'>
                <v-btn color="success" :disabled="!verify || template.id !== 1" @click="sendMailKommersant">Отправить в
                  коммерсант
                </v-btn>
              </v-col>
              <v-col cols="12">
                <v-checkbox :disabled="!project" dense label="Данные сформированы правильно"
                            v-model="verify"></v-checkbox>
              </v-col>
<!--              <v-col>-->
<!--                <v-btn color="success" :disabled="!verify" @click="saveDoc">Сохранить документ в базу</v-btn>-->
<!--              </v-col>-->
              <v-col>
                <v-btn color="success" :disabled="!verify || !!!sendEmailAddress" @click="sendEmail">Отправить на email
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="3">
                <v-btn color="success" :disabled="!verify" @click="sendPostMail">Создать почтовое
                  отправление
                </v-btn>
              </v-col>
            </v-row>
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
      <v-dialog v-model="overlay" width="25vw" scrollable>
        <v-card width="25vw" height="25vh">
          <v-card-text v-if="loading" style="display:flex;">
            <v-row justify="center" align="center">
              Формирование и отправка данных. Ожидайте...
              <v-progress-circular
                  indeterminate
                  size="64"
              ></v-progress-circular>
            </v-row>
          </v-card-text>
          <v-card-text v-else style="display:flex;">
            <v-row justify="center" align="center">
              <v-icon v-if="!error" color="success" size="64">mdi-check</v-icon>
              <v-icon v-else color="error" size="64">mdi-alert-circle</v-icon>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>

    </v-card>
    <CreatePostMail></CreatePostMail>
    <ContractorCreateModal></ContractorCreateModal>
    <LegalEntityCreateModal></LegalEntityCreateModal>
    <v-dialog v-model="confirmSave" width="500">
      <v-card height="30vh">
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
  </v-container>

</template>

<script>
import {mapGetters} from 'vuex'
import {compareFields} from './functions'
import customConst from "@/const/customConst";
import {saveAs} from 'file-saver';
import CreatePostMail from "@/components/PostMail/CreatePostMail";
import ContractorCreateModal from "@/components/referenceBook/ContractorCreateModal";
import LegalEntityCreateModal from "@/components/referenceBook/LegalEntity/LegalEntityCreateModal.vue";


let vueStore = {
  valid: false
}

export default {
  name: "DocumentGenerator",
  props: {
    template: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    project: null,
    confirmSave: false,
    projectData: null,
    docType: 'docx',
    verify: false,
    loading: false,
    overlay: false,
    error: false,
    region: null,
    loadDataFromTable: false,
    dataFile: null,
    vueStore: vueStore,
    templateFields: {},
    fileName: null,
    contract: null,
    creditor: null,
    bank: null,
    docId: null,
    legalContractor: null,
    sendEmailAddress: '',
    bankAccountList: null,
    bankAccount: null,
    contractList: null,
    rules: {
      required: [v => !!v || 'Не удалось сапоставить значение']
    },
    monthList: [
      {value: '1', text: 'Январь'},
      {value: '2', text: 'Февраль'},
      {value: '3', text: 'Март'},
      {value: '4', text: 'Апрель'},
      {value: '5', text: 'Май'},
      {value: '6', text: 'Июнь'},
      {value: '7', text: 'Июль'},
      {value: '8', text: 'Август'},
      {value: '9', text: 'Сентябрь'},
      {value: '10', text: 'Октябрь'},
      {value: '11', text: 'Ноябрь'},
      {value: '12', text: 'Декабрь'},
    ]
  }),
  computed: {
    ...mapGetters({
      projectList: 'projectListData',
      regionList: 'regionListData',
      participantDetail: 'participantFullDetail',
      currentUser: 'authUserData',
      allRefList: 'allRefData',
      legalList: 'legalEntityData'
    }),
    bailiffsList: function () {
      let bailiffs = this.$store.getters.bailiffsListData
      // if (this.region) {
      //   return bailiffs.filter(obj => obj.region.id === this.region)
      // }
      return bailiffs
    },
  },
  watch: {
    template() {
      this.$forceUpdate();
    },
    templateFields(val) {
      if ('CREDITOR_NOTICE' in val) {
        this.getNoticeDocs()
      }
      if ('POST_TOTAL_PRICE' in val) {
        this.getPostPrice()
      }
      if ('DOC_TOTAL_PRICE' in val) {
        this.getDocPrice()
      }
    }
  },
  methods: {
    getProjectDetail(item) {
      this.$store.dispatch('getProjectDetail', item).then(data => {
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
        this.contractList = data.contract
        this.fileName = data['name'].split(' ')[0]
        this.$store.dispatch('getProjectAct', data['id']).then(res => {
          let act = res.data.data.data
          data['act'] = act
          compareFields(this.template.fields, data).then(async (data) => {
            this.templateFields = data
            // for (let [key, val] of Object.entries(await data)) {
            //   this.templateFields[key] = val
            // }
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
        console.log(this.bank)
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
      return formData
    },
    generateDocument() {
      console.log(this.template.name)
      this.overlay = true
      this.loading = true
      let formData = this.setFormData()
      console.log(this.currentUser)
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
        if (this.template.name === 'ходатайтсво об ознакомлении с материалами дела'){
          fileName += '_1л'
        }
        saveAs(res.data, fileName)
        this.overlay = false
        this.loading = false
      }).then(() => {
        this.confirmSave = true
      }).catch(err => {
        this.overlay = false
        this.loading = false
        this.error = true
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
            resolve()
          }, 1000)
        }).catch(err => {
          this.loading = false
          setTimeout(() => {
            this.error = true
            this.overlay = false
          }, 1000)
        })
      })
    },
    sendMailKommersant() {
      this.overlay = true
      this.loading = true
      let formData = this.setFormData()
      formData.append('project', this.project)
      this.$http({
        method: "POST",
        url: customConst.GENERATOR + 'document-template/send_mail_to_kommersant/',
        data: formData,
      }).then(res => {
        this.loading = false
        setTimeout(() => {
          this.error = false
          this.overlay = false
        }, 1000)
      }).catch(err => {
        this.loading = false
        setTimeout(() => {
          this.error = true
          this.overlay = false
        }, 1000)
      })
    },
    sendEmail() {
      this.overlay = true
      this.loading = true
      let formData = this.setFormData()
      formData.append('project', this.project)
      this.$http({
        method: "POST",
        url: customConst.GENERATOR + 'document-template/send_mail/',
        data: formData,
      }).then(res => {
        this.loading = false
        setTimeout(() => {
          this.error = false
          this.overlay = false
        }, 1000)
      }).catch(err => {
        this.loading = false
        setTimeout(() => {
          this.error = true
          this.overlay = false
        }, 1000)
      })
    },
    async runSelenium() {
      let formData = this.setFormData()
      this.$http({
        method: "POST",
        url: customConst.GENERATOR + 'document-template/fill-fssp/',
        data: formData,
      })
    },
    async sendPostMail() {
      await this.saveDoc()
      this.$emit('createPostMail', {
        legalData: this.legalContractor,
        project: this.projectData,
        number: this.templateFields['NUMBER'],
        doc: this.docId
      })
    },
    save(name, field) {
      console.log(name, field)
    },
    getNoticeDocs() {
      return new Promise(resolve => {
        this.$http({
          method: 'GET',
          url: customConst.PAPERFLOW_API + 'get-notice-docs',
          params: {
            project: this.project
          }
        }).then(res => {
          console.log(res.data.data.data)
          this.templateFields['CREDITOR_NOTICE'] = res.data.data.data
          resolve()
        })
      })
    },
    getPostPrice() {
      return new Promise(resolve => {
        this.$http({
          method: 'GET',
          url: customConst.PAPERFLOW_API + 'get-post-price',
          params: {
            project: this.project
          }
        }).then(res => {
          console.log(res.data.data.data)
          this.templateFields['POST_TOTAL_PRICE'] = res.data.data.data
          resolve()
        })
      })
    },
    getDocPrice() {
      return new Promise(resolve => {
        this.$http({
          method: 'GET',
          url: customConst.PAPERFLOW_API + 'get-doc-price',
          params: {
            project: this.project
          }
        }).then(res => {
          console.log(res.data.data.data)
          this.templateFields['DOC_TOTAL_PRICE'] = res.data.data.data
          resolve()
        })
      })
    },
    editContractor(item) {
      if (item) {
        if (item.type === "LegalEntity") {
          this.$emit('legalEntityModal', item)
        } else {
          this.$emit('showModals')
        }
      } else {
        this.$emit('addContractor')
      }

    },
  },
  async created() {
    // let participant = this.$store.getters.participantFullDetail
    await this.$store.dispatch('getParticipator')
    await this.$store.dispatch('getProjectList')
    await this.$store.dispatch('getRegion')
    await this.$store.dispatch('getBailiffs')
    await this.$store.dispatch('getContractList')
    await this.$store.dispatch('getLegalEntity')
    await this.$store.dispatch('getPhysicalPerson')
  },
  components: {
    CreatePostMail,
    ContractorCreateModal,
    LegalEntityCreateModal
  }


};
</script>

<style scoped>
>>> .v-list {
  padding: 0 !important;
}

>>> .v-card__text {
  max-height: 80vh;
  overflow-y: scroll;
}

>>> .mdi-content-save {
  color: green;
}
</style>