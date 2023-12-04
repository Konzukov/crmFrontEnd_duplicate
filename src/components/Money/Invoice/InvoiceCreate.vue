<template>
  <v-container fluid>
    <v-row justify="space-around">
      <v-col cols="7" class="create-form">
        <v-card class="overflow-visible">
          <v-toolbar>
            <v-btn icon :to="{name: 'invoice-list'}">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title>Формирование нового счета</v-toolbar-title>
            <v-divider vertical class="ml-4"></v-divider>
            <v-spacer></v-spacer>
            <template v-if="!actDoc.docx && !actDoc.pdf">
              <v-btn color="primary" @click="showModalAct" :disabled="!!!invoice.id">Сформировать акт</v-btn>
            </template>
            <template v-else>
              <v-menu offset-y bottom min-width="300">
                <template v-slot:activator="{ attrs, on }">
                  <v-btn
                      class="ma-5"
                      v-bind="attrs"
                      v-on="on"
                  >
                    Акты
                  </v-btn>
                </template>
                <v-list-item>
                  <v-list-item-content>
                    <v-row justify="start">
                      <v-col>
                        <v-btn icon color="success" @click="downloadFile(actDoc.docx)">
                          <v-icon>mdi-file-word</v-icon>
                        </v-btn>
                      </v-col>
                      <v-col>
                        <v-btn icon color="success" @click="downloadFile(actDoc.pdf)">
                          <v-icon>mdi-file-pdf-box</v-icon>
                        </v-btn>
                      </v-col>
                      <v-col>
                        <v-btn icon color="primary"
                               :to="{name: 'act-edit', params: {id: invoice.act}}">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-list-item-content>
                </v-list-item>
              </v-menu>
            </template>
          </v-toolbar>
          <v-card-text class="mt-2 overflow-visible">
            <v-form v-model="valid" ref="invoice-form">
              <v-row justify="start">
                <v-col cols="3">
                  <v-text-field outlined label="Номер" :rules="rules.require" v-model="invoice.number"></v-text-field>
                </v-col>
                <v-col cols="5">
                  <v-text-field class="datetime-piker" outlined label="Дата счета" type="datetime-local"
                                v-model="invoice.formation_date"></v-text-field>
                </v-col>
              </v-row>
              <v-row justify="space-around">
                <v-col cols="5">
                  <v-select label="Организация" outlined v-model="invoice.organization" disabled
                            :items="userData.profile.available_organization" item-text="name"
                            item-value="uuid"></v-select>
                </v-col>

                <v-col cols="7">
                  <v-select :items="organizationBankAccount" item-value="id" item-text="account"
                            label="Расчетный счет"
                            :rules="rules.require"
                            outlined v-model="invoice.organization_bank_account">
                  </v-select>
                </v-col>
              </v-row>
              <v-row justify="space-around">
                <v-col cols>
                  <v-autocomplete outlined label="Контрагент" :items="legalList.data" item-value="uuid"
                                  return-object v-model="invoice.contractor" @change="getContracts"
                                  item-text="fullName" @input="getContractorAccount"
                                  :rules="rules.require"
                  ></v-autocomplete>
                </v-col>
                <v-col cols>
                  <v-select outlined label="Расчетный счет" :items="contractorAccount" item-text="account"
                            append-outer-icon="mdi-plus"
                            item-value="id" v-model="invoice.contractor_bank_account"
                            :disabled="!!!invoice.contractor"></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-autocomplete outlined label="Договор" :items="contractorContractListData" item-value="pk"
                                  item-text="name" :disabled="!!!invoice.contractor"
                                  :loading="contractIsLoading" v-model="invoice.contract">
                    <template v-slot:no-data>
                      <div class="ml-4"><span>Добавить новый</span>
                        <v-btn icon @click="addContract">
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </div>
                    </template>
                  </v-autocomplete>
                </v-col>
              </v-row>
              <v-container class="invoice_item">
                <v-data-table :headers="headers" :items="invoicePosition" hide-default-footer>
                  <template v-slot:item.index="{ item, i }" class="invoice__service">
                    {{ item.index }}
                  </template>
                  <template v-slot:item.service="{ item }" class="invoice__service">
                    <v-text-field :rules="rules.require" class="position_item" v-model="item.service"></v-text-field>
                  </template>
                  <template v-slot:item.period="{ item }">
                    <v-text-field :rules="rules.require" class="position_item" v-model="item.period"></v-text-field>
                  </template>
                  <template v-slot:item.count="{ item }">
                    <v-text-field :rules="rules.require" class="position_item" v-model="item.count"
                                  @input="item.total = item.amount * item.count"></v-text-field>
                  </template>
                  <template v-slot:item.amount="{ item }">
                    <v-text-field :rules="rules.require" class="position_item" v-model.number="item.amount"
                                  @input="item.total = item.amount * item.count"></v-text-field>
                  </template>
                  <template v-slot:item.total="{ item }">
                    <v-text-field :rules="rules.require" class="position_item" v-model="item.total"></v-text-field>
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-btn icon color="error" @click="removeInvoiceItem(item)">
                      <v-icon size="12px">mdi-minus</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
                <v-row justify="end" class="mr-3">
                  <v-btn @click="addInvoiceItem" icon color="primary">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </v-row>

              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="saveInvoice" :disabled="!valid">{{ invoice.id ? 'Сохранить' : 'Сформировать счет' }}</v-btn>
            <v-btn @click="close">Закрыть</v-btn>
            <v-spacer></v-spacer>
            <v-menu offset-y top>
              <template v-slot:activator="{ attrs, on }">
                <v-btn
                    class="ma-5"
                    v-bind="attrs"
                    v-on="on"
                >
                  Счета
                </v-btn>
              </template>
              <v-list>
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon :color="invoiceDoc.docx ? 'success': '' ">mdi-file-word</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-row justify="space-between">
                      <v-col cols>
                        <v-btn color="primary" @click="downloadFile(invoiceDoc.docx)" :disabled="!!!invoiceDoc.docx">
                          Скачать
                        </v-btn>
                      </v-col>
                      <v-divider vertical></v-divider>
                      <v-col cols>
                        <v-btn color="warning" @click="downloadFile(invoiceDoc.docx)" :disabled="!!!invoiceDoc.docx">
                          Заменить
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon :color="invoiceDoc.pdf ? 'success': '' ">mdi-file-pdf-box</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-row justify="space-between">
                      <v-col cols>
                        <v-btn color="primary" @click="downloadFile(invoiceDoc.pdf)" :disabled="!!!invoiceDoc.pdf">
                          Скачать
                        </v-btn>
                      </v-col>
                      <v-divider vertical></v-divider>
                      <v-col cols>
                        <v-btn color="warning" @click="downloadFile(invoiceDoc.pdf)" :disabled="!!!invoiceDoc.pdf">
                          Заменить
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>
            <!--            <v-menu offset-y top>-->
            <!--              <template v-slot:activator="{ attrs, on }">-->
            <!--                <v-btn-->
            <!--                    class="ma-5"-->
            <!--                    v-bind="attrs"-->
            <!--                    v-on="on"-->
            <!--                >-->
            <!--                  Акты-->
            <!--                </v-btn>-->
            <!--              </template>-->
            <!--              <v-list>-->
            <!--                <v-list-item>-->
            <!--                  <v-list-item-icon>-->
            <!--                    <v-icon :color="actDoc.docx ? 'success': '' ">mdi-file-word</v-icon>-->
            <!--                  </v-list-item-icon>-->
            <!--                  <v-list-item-content>-->
            <!--                    <v-row justify="center" class="ml-1 mr-1">-->
            <!--                      <v-col cols>-->
            <!--                        <v-btn color="primary" @click="downloadFile(actDoc.docx)" :disabled="!!!actDoc.docx">-->
            <!--                          Скачать-->
            <!--                        </v-btn>-->
            <!--                      </v-col>-->
            <!--                      <v-divider vertical></v-divider>-->
            <!--                      <v-col cols>-->
            <!--                        <v-btn color="warning">-->
            <!--                          {{ actDoc.docx ? 'Заменить' : 'Сформировать' }}-->
            <!--                        </v-btn>-->
            <!--                      </v-col>-->
            <!--                    </v-row>-->
            <!--                  </v-list-item-content>-->
            <!--                </v-list-item>-->
            <!--                <v-list-item>-->
            <!--                  <v-list-item-icon>-->
            <!--                    <v-icon :color="actDoc.pdf ? 'success': '' ">mdi-file-pdf-box</v-icon>-->
            <!--                  </v-list-item-icon>-->
            <!--                  <v-list-item-content>-->
            <!--                    <v-row justify="center" class="ml-1 mr-1">-->
            <!--                      <v-col cols>-->
            <!--                        <v-btn color="primary" @click="downloadFile(actDoc.pdf)" :disabled="!!!actDoc.pdf">-->
            <!--                          Скачать-->
            <!--                        </v-btn>-->
            <!--                      </v-col>-->
            <!--                      <v-divider vertical></v-divider>-->
            <!--                      <v-col cols>-->
            <!--                        <v-btn color="warning">-->
            <!--                          {{ actDoc.pdf ? 'Заменить' : 'Сформировать' }}-->
            <!--                        </v-btn>-->
            <!--                      </v-col>-->
            <!--                    </v-row>-->
            <!--                  </v-list-item-content>-->
            <!--                </v-list-item>-->
            <!--              </v-list>-->
            <!--            </v-menu>-->
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="4" class="invoice-preview">
        <PDFDocument v-if="invoiceDoc.pdf" v-bind="{url: invoiceDoc.pdf, scale: pdf.scale}"></PDFDocument>
        <!--        <pdf-->
        <!--            src="https://cdn.filestackcontent.com/5qOCEpKzQldoRsVatUPS"-->
        <!--            @num-pages="pdf.pageCount = $event"-->
        <!--            @page-loaded="pdf.currentPage = $event"-->
        <!--            :page="pdf.currentPage"-->

        <!--        ></pdf>-->
        <!--        <v-row justify="center" class="mt-4">-->
        <!--          <div class="text-center">-->
        <!--            <v-pagination-->
        <!--                v-model="pdf.currentPage"-->
        <!--                :length="pdf.pageCount"-->
        <!--                prev-icon="mdi-menu-left"-->
        <!--                next-icon="mdi-menu-right"-->
        <!--            ></v-pagination>-->
        <!--          </div>-->
        <!--        </v-row>-->
      </v-col>
    </v-row>
    <v-dialog v-model="showActForm" persistent
              max-width="390">
      <v-card height="300">
        <v-card-title class="text-h5">
          Сохранить изменения и продолжить?
        </v-card-title>
        <v-card-text>При "Автоматическом" формировании акт будет в соответвии с текщими данными счета
          <v-switch v-model="autoAct"
                    label="Формировть автоматически"
                    color="success darken-3"

                    hide-details
          ></v-switch>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="error darken-1"
              text
              @click="showActForm = false"
          >
            Отмена
          </v-btn>
          <v-btn
              color="success darken-1"
              text
              @click="createAct"
          >
            Продолжить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <ContractCreate></ContractCreate>
    <v-overlay :value="loading">
      <v-progress-circular
          indeterminate
          size="64"
      ></v-progress-circular>
      {{ loadMessage }}
    </v-overlay>
  </v-container>
</template>

<script>
import ContractCreate from "../../modalWindows/crm/ContractCreate";
import {mapActions, mapGetters} from 'vuex'
import {range} from 'lodash'
import PDFDocument from "../../PDFViewer/PDFDocument";
import moment from "moment";
import customConst from "../../../const/customConst";


export default {
  name: "InvoiceCreate",
  data: () => ({
    type: 'create',
    valid: false,
    loading: false,
    showActForm: false,
    loadMessage: '',
    contractIsLoading: false,
    autoAct: true,
    rules: {
      require: [v => !!v || 'Данное поле обязательно'],
    },

    invoice: {
      id: null,
      number: null,
      formation_date: moment(new Date()).format('YYYY-MM-DDTHH:mm'),
      organization: null,
      organization_bank_account: null,
      contractor: null,
      contractor_bank_account: null,
      contract: null
    },
    contractor: null,
    organizationBankAccount: [],
    contractorAccount: [],
    headers: [
      {text: '№', value: 'index'},
      {text: 'Услуга', value: 'service', width: "40%"},
      {text: 'Период', value: 'period'},
      {text: 'Кол-во', value: 'count'},
      {text: 'Сумма', value: 'amount'},
      {text: 'Итого', value: 'total', width: "15%"},
      {text: 'Действия', value: 'actions'},
    ],
    invoicePosition: [],
    url: process.env.VUE_APP_PDF_URL,
    documentError: undefined,
    enableUploader: process.env.VUE_APP_UPLOAD_ENABLED === 'true',
    invoiceDoc: {
      docx: null,
      pdf: null,
    },
    actDoc: {
      docx: null,
      pdf: null
    },
    pdf: {
      url: 'https://cdn.filestackcontent.com/5qOCEpKzQldoRsVatUPS',
      numPages: '',
      currentPage: 1,
      pageCount: 0,
      scale: 2
    }
  }),
  methods: {
    ...mapActions({
      getOrganizationBankAccount: 'getOrganizationBankAccount',
      getContractorBankAccount: 'getContractorBankAccount',
      getContractorContract: 'getContractorContract'
    }),
    close() {
      this.$router.go(-1)
    },
    getContractorAccount(item) {
      this.getContractorBankAccount(item.uuid).then(account => {
        this.contractorAccount = account
      })
    },
    addInvoiceItem() {
      let invoiceLen = this.invoicePosition.length
      const obj = {
        index: invoiceLen,
        id: '',
        service: '',
        period: '',
        count: '',
        amount: '',
        total: ''
      }
      this.invoicePosition.push(obj)
    },
    removeInvoiceItem(item) {
      this.invoicePosition.splice(item.index, 1)
      this.invoicePosition.forEach((item, i) => {
        item.index = i
      })
    },
    createFormData() {
      let formData = new FormData()
      Object.keys(this.invoice).forEach(key => {
        if (this.invoice[key]) {
          if (typeof this.invoice[key] === 'object') {
            formData.set(key, this.invoice[key]['id'])
          } else {
            formData.set(key, this.invoice[key])
          }
        }
      })
      this.invoicePosition.forEach(obj => {
        formData.append('invoice_position', JSON.stringify(obj))
      })
      return formData
    },
    saveInvoice() {
      let action;
      let invoiceData = this.createFormData()
      this.loading = true
      this.loadMessage = 'Сохранение данных....'
      if (this.invoice.id || this.type === 'edit') {
        action = this.$store.dispatch('editInvoice', {id: this.invoice.id, invoiceData})
      } else {
        action = this.$store.dispatch('createInvoice', invoiceData)
      }
      action.then(res => {
        console.log(res)
        setTimeout(() => {
          this.loadMessage = 'Обновление данных'
        }, 2000)

        this.invoice.id = res.id
        this.invoicePosition = []
        res.position.forEach((pos, index) => {
          pos['index'] = index
          this.invoicePosition[index] = pos
        })
        Object.assign(this.invoiceDoc, res.document)
        this.loading = false
      }).catch((err) => {
        console.log(err)
        this.loadMessage = 'Возникла ошибка при сохранении данныы'
        setTimeout(() => {
          this.loading = false
        }, 1500)
      })
    },
    getContracts(obj) {
      this.contractIsLoading = true
      this.getContractorContract(obj.uuid).then(() => {
        this.contractIsLoading = false
      })
    },
    addContract() {
      this.$emit('addContract', ({contractor: this.invoice.contractor, participant: this.invoice.organization}))
    },
    generateDocx() {
      let invoiceData = this.createFormData()
      this.$http({
        method: "POST",
        url: customConst.MONEY + 'generate-docx',
        data: invoiceData
      }).then(res => {

      })
    },
    downloadFile(item) {
      this.$store.dispatch('downloadDocument', {'pk': item.pk, 'fileName': item.fileName})
    },
    showModalAct() {
      if (this.invoice.id) {
        this.showActForm = true
      }
    },
    createAct() {
      this.showActForm = false
      this.loading = true
      this.loadMessage = 'Сохранение данных....'
      if (this.autoAct) {
        let formData = new FormData
        this.invoicePosition.forEach(obj => {
          formData.append('act_position', JSON.stringify(obj))
        })
        this.$store.dispatch('getLastNumber').then(res => {
          formData.set('number', res)
        }).then(() => {
          formData.set('contractor', this.invoice.contractor)
          formData.set('contract', this.invoice.contract)
          formData.set('invoice', this.invoice.id)
          const date = new Date()
          formData.set('date', moment(new Date(date.getFullYear(), date.getMonth(), 0, date.getHours(), date.getMinutes())).format('YYYY-MM-DDTHH:mm'))
          formData.set('formation_date', this.invoice.formation_date)
          this.$store.dispatch('createAct', formData).then(res => {
            this.loadMessage = 'Обновление данных'
            this.invoice['act'] = res.id
            this.actDoc = res['act_doc']
          }).then(() => {
            setTimeout(() => {
              this.loading = false
            }, 2000)
          })


        })

      } else {
        this.$router.push({
          name: 'act-create',
          params: {
            invoice: this.invoice.id
          }
        })
      }
    }
  },
  computed: {
    ...mapGetters({
      userData: 'authUserData',
      legalList: 'legalEntityData',
      contractorContractListData: 'contractorContractListData'
    })
  },
  mounted() {
    // this.$refs["invoice-form"].validate()
    this.invoice.organization = this.userData.profile['active_organization'].uuid
    this.getOrganizationBankAccount(this.invoice.organization).then((data) => {
      this.organizationBankAccount = data
    })
  },
  created() {
    if (this.$route.name === 'invoice-edit') {
      this.type = 'edit'
      this.$store.dispatch('getInvoiceDetail', this.$route.params.id).then(data => {
        Object.assign(this.invoice, data)
        this.invoicePosition = data['position']
        this.getContracts(this.invoice.contractor)
        Object.assign(this.invoiceDoc, data['document'])
        Object.assign(this.actDoc, data['act_doc'])
        this.invoice.formation_date = moment(data['formation_date']).format('YYYY-MM-DDTHH:mm')
        range(0, this.invoicePosition.length).map(i => {
          this.invoicePosition[i]['index'] = i
        })
      })
    }
  },
  components: {
    // pdf,
    PDFDocument,
    ContractCreate
  }
}
</script>

<style scoped lang="scss">
@import "src/scss/variables";

.v-card {
  overflow: scroll !important;
  height: 79vh;
}

.invoice_item {
  min-height: 20vh;
  border: 1px solid black;

  * {
    font-size: 14px !important;
  }


  .invoice__service {
    width: 30%;

  }
}

.datetime-piker {
  input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    background: #00a6ee !important;
  }
}

$input-font-size: 12px !default;
> > > .v-overlay__content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>


