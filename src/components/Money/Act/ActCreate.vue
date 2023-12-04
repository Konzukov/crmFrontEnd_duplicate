<template>
  <v-container fluid>
    <v-row justify="space-around">
      <v-col cols="7" class="create-form">
        <v-card>
          <v-toolbar>
            <v-btn icon @click="$router.go(-1)">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title>{{ act.id ? 'Редактирование акта' : 'Новый акт' }}</v-toolbar-title>
            <v-divider vertical class="ml-4"></v-divider>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card-text>
            <v-form lazy-validation v-model="valid">
              <v-row justify="start">
                <v-col cols="4">
                  <v-text-field v-model="act.date" type="datetime-local" label="Дата" outlined></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field v-model="act.formation_date" type="datetime-local" outlined label="Дата формирования"
                                disabled></v-text-field>
                </v-col>
              </v-row>
              <v-row justify="start">
                <v-col cols="3">
                  <v-text-field v-model="act.number" outlined label="Номер"></v-text-field>
                </v-col>
                <v-col cols>
                  <v-autocomplete outlined
                                  label="Контрагент"
                                  :items="legalList.data"
                                  v-model="act.contractor"
                                  item-value="uuid"
                                  item-text="fullName"></v-autocomplete>
                </v-col>
              </v-row>
              <v-row justify="start">
                <v-col cols>
                  <v-select v-model="act.contract" :items="contractorContractListData" item-value="pk"
                            item-text="name" outlined label="Основание(договор)"></v-select>
                </v-col>
                <v-col cols>
                  <v-select v-model="act.invoice" :items="invoiceList" item-text="name" item-value="id" outlined
                            label="Основание(счет)"></v-select>
                </v-col>
                <v-container class="invoice_item">
                  <v-data-table :headers="headers" :items="actPosition" hide-default-footer>
                    <template v-slot:item.index="{ item, i }" class="invoice__service">
                      {{ item.index }}
                    </template>
                    <template v-slot:item.service="{ item }" class="invoice__service">
                      <v-text-field class="position_item" v-model="item.service"></v-text-field>
                    </template>
                    <template v-slot:item.period="{ item }">
                      <v-text-field class="position_item" v-model="item.period"></v-text-field>
                    </template>
                    <template v-slot:item.count="{ item }">
                      <v-text-field class="position_item" v-model="item.count"
                                    @input="item.total = item.amount * item.count"></v-text-field>
                    </template>
                    <template v-slot:item.amount="{ item }">
                      <v-text-field class="position_item" v-model.number="item.amount"
                                    @input="item.total = item.amount * item.count"></v-text-field>
                    </template>
                    <template v-slot:item.total="{ item }">
                      <v-text-field class="position_item" v-model="item.total"></v-text-field>
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <v-btn icon color="error" @click="removeActItem(item)">
                        <v-icon size="12px">mdi-minus</v-icon>
                      </v-btn>
                    </template>
                  </v-data-table>
                  <v-row justify="end" class="mr-3">
                    <v-btn @click="addActItem" icon color="primary">
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </v-row>
                </v-container>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="saveAct" :disabled="!valid">{{ act.id ? 'Сохранить' : 'Сформировать акт' }}</v-btn>
            <v-btn @click="close">Закрыть</v-btn>
            <v-spacer></v-spacer>
            <v-menu offset-y top>
              <template v-slot:activator="{ attrs, on }">
                <v-btn
                    class="ma-5"
                    v-bind="attrs"
                    v-on="on"
                >
                  Акты
                </v-btn>
              </template>
              <v-list>
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon :color="actDoc.docx ? 'success': '' ">mdi-file-word</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-row justify="space-between">
                      <v-col cols>
                        <v-btn color="primary" @click="downloadFile(actDoc.docx)" :disabled="!!!actDoc.docx">
                          Скачать
                        </v-btn>
                      </v-col>
                      <v-divider vertical></v-divider>
                      <v-col cols>
                        <v-btn color="warning" @click="downloadFile(actDoc.docx)" :disabled="!!!actDoc.docx">
                          Заменить
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon :color="actDoc.pdf ? 'success': '' ">mdi-file-pdf-box</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-row justify="space-between">
                      <v-col cols>
                        <v-btn color="primary" @click="downloadFile(actDoc.pdf)" :disabled="!!!actDoc.pdf">
                          Скачать
                        </v-btn>
                      </v-col>
                      <v-divider vertical></v-divider>
                      <v-col cols>
                        <v-btn color="warning" @click="downloadFile(actDoc.pdf)" :disabled="!!!actDoc.pdf">
                          Заменить
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col></v-col>
    </v-row>
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
import {mapGetters} from 'vuex'
import moment from "moment";

export default {
  name: "InvoiceCreate",
  data: () => ({
    valid: false,
    type: 'create',
    loading: false,
    loadMessage: '',
    act: {
      id: null,
      date: '',
      formation_date: '',
      number: '',
      contractor: null,
      contract: null,
      invoice: null
    },
    actDoc: {
      docx: null,
      pdf: null
    },
    headers: [
      {text: '№', value: 'index'},
      {text: 'Услуга', value: 'service', width: "40%"},
      {text: 'Период', value: 'period'},
      {text: 'Кол-во', value: 'count'},
      {text: 'Сумма', value: 'amount'},
      {text: 'Итого', value: 'total', width: "15%"},
      {text: 'Действия', value: 'actions'},
    ],
    actPosition: [],
  }),
  methods: {
    addActItem() {
      let positionCount = this.actPosition.length
      const obj = {
        index: positionCount,
        id: '',
        service: '',
        period: '',
        count: '',
        amount: '',
        total: ''
      }
      this.actPosition.push(obj)
    },
    downloadFile(item) {
      this.$store.dispatch('downloadDocument', {'pk': item.pk, 'fileName': item.fileName})
    },
    removeActItem(item) {
      this.actPosition.splice(item.index, 1)
      this.actPosition.forEach((item, i) => {
        item.index = i
      })
    },
    createFormData() {
      let formData = new FormData()
      Object.keys(this.act).forEach(key => {
        if (this.act[key]) {
          if (typeof this.act[key] === 'object') {
            formData.set(key, this.act[key]['id'])
          } else {
            formData.set(key, this.act[key])
          }
        }
      })
      this.actPosition.forEach(obj => {
        formData.append('act_position', JSON.stringify(obj))
      })
      return formData
    },
    saveAct() {
      this.loading = true
      this.loadMessage = 'Сохранение данных....'
      let action;
      let formData = this.createFormData()
      if (this.type === 'edit') {
        action = this.$store.dispatch('editAct', {id: this.act.id, actData: formData})
      } else {
        action = this.$store.dispatch('createAct', formData)
      }
      action.then(res => {
        console.log(res)
        setTimeout(() => {
          this.loadMessage = 'Обновление данных'
        }, 2000)
        this.act.id = res.id
        this.actPosition = []
        res.position.forEach((pos, index) => {
          pos['index'] = index
          this.actPosition[index] = pos
        })
        Object.assign(this.actDoc, res['act_doc'])
        this.loading = false
      }).catch((err) => {
        console.log(err)
        this.loadMessage = 'Возникла ошибка при сохранении данныы'
        setTimeout(() => {
          this.loading = false
        }, 1500)
      })
    },
    close() {
      this.$router.go(-1)
    },
  },
  computed: {
    ...mapGetters({
      legalList: 'legalEntityData',
      invoiceList: 'invoiceListData',
      contractorContractListData: 'contractorContractListData'
    })
  },

  created() {
    this.$store.dispatch('getLastNumber').then(res => {
      this.act.number = res
    })
    // this.act.number = this.$store.getters.lastActNum
    const actID = this.$route.params.id
    const invoice = this.$route.params.invoice
    if (actID) {
      this.type = 'edit'
      this.$store.dispatch('getActDetail', actID).then(actData => {
        this.act.id = actData.id
        this.act.contractor = actData.invoice.contractor
        this.act.invoice = actData.invoice.id
        this.act.date = moment(actData.date).format('YYYY-MM-DDTHH:mm')
        this.act.formation_date = moment(actData.formation_date).format('YYYY-MM-DDTHH:mm')
        this.act.contract = actData.contract.pk
        if (this.invoiceList.length === 0) {
          this.$store.dispatch('getInvoiceList')
        }
        if (this.contractorContractListData.length === 0) {
          this.$store.dispatch('getContractorContract', this.act.contractor.uuid)
        }
        this.actDoc = actData['act_doc']
        actData.position.forEach((pos, index) => {
          pos['index'] = index
          this.actPosition.push(pos)
        })
      })
    } else if (invoice) {
      this.$store.dispatch('getInvoiceDetail', invoice).then(res => {
        this.act.contractor = res.contractor
        this.act.invoice = res.id
        this.act.contract = res.contract
        this.act.formation_date = moment(new Date()).format('YYYY-MM-DDTHH:mm')
        const date = new Date()
        this.act.date = moment(new Date(date.getFullYear(), date.getMonth(), 0, date.getHours(), date.getMinutes())).format('YYYY-MM-DDTHH:mm')
        res.position.forEach((item, index) => {
          item['index'] = index
          this.actPosition.push(item)
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import "src/scss/variables";

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
</style>