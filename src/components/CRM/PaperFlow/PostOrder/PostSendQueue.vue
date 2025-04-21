<template>
  <v-container fluid class="mt-2">
    <v-row justify="start">
      <v-select outlined dense label="Сортировка" :items="sortItem" v-model="sortProp" item-text="text"
                item-value="value"></v-select>
    </v-row>
    <v-list flat two-line v-if="sortedPostItem" dense class="list-item">
      <v-list-item-group>
        <v-list-item v-for="(item, i) in sortedPostItem" :key="item.id"
                     :style="i%2!==0? 'background-color: #cfcfcf4d':''"
                     style="font-size: 14px">
          <v-row justify="start" class="pt-5 pb-5">
            <v-col cols="1">
              <v-checkbox :disabled="disableListItem(item)" dense class="ma-0 pa-0" v-model="selectedDocument"
                          :value="item"
              ></v-checkbox>
            </v-col>
            <v-col cols="1">
              {{ item | postNumber }}
            </v-col>
            <v-col cols="1">
              <template v-if="item.document.fromWho['comm'] ==='ElectronicMail'">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon v-bind="attrs" v-on="on">mdi-email-outline
                    </v-icon>
                  </template>
                  <span>Электронное письмо</span>
                </v-tooltip>
              </template>
              <template v-if="item.document.fromWho['comm']['communication_type'] ==='ElectronicMail'">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon v-bind="attrs" v-on="on">mdi-email-outline</v-icon>
                  </template>
                  <span>Бумажное письмо</span>
                </v-tooltip>
              </template>
              <template v-else-if="item.document.fromWho['comm']['communication_type'] ==='PaperMail'">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon v-bind="attrs" v-on="on">mdi-email-open-outline</v-icon>
                  </template>
                  <span>Бумажное письмо</span>
                </v-tooltip>
              </template>
              <template v-else-if="item.document.fromWho['comm']['communication_type'] ==='Email'">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon v-bind="attrs" v-on="on">mdi-gmail</v-icon>
                  </template>
                  <span>Электронная почта</span>
                </v-tooltip>
              </template>
            </v-col>
            <v-col cols="3">
              <v-row justify="start">
                <v-col cols="12" class="pb-0">{{ item.document.project[0].name }}</v-col>
                <v-col cols="12" style="font-size: 12px; color: #00a6ee">
                  {{ item.document.project[0].procedure | getProcedure }}
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="3">
              <v-row justify="start">
                <v-col cols="12" class="pb-0">{{ item.document.fromWho.fullName }}</v-col>
                <template v-if="item.document.fromWho['comm'] ==='ElectronicMail'">
                  <v-col cols="12" style="font-size: 12px; color: #00a6ee">
                    {{ item.document.fromWho.legal_address }}
                  </v-col>
                </template>
                <template v-else>
                  <v-col cols="12" :style="fontColor(item.document.fromWho)">
                    {{ item.document.fromWho['comm']['value'] }}
                  </v-col>
                </template>
              </v-row>
            </v-col>
            <v-col cols="2">
              <v-row justify="start">
                <v-col cols="12">{{ item.document.correspondence_type.name }}</v-col>
                <v-col cols="12" class="pb-0" style="font-size: 10px;">Подготовил: {{ item.document.author.fullName }}
                </v-col>
              </v-row>

            </v-col>
            <v-col md="1">
              <v-row class="flex-column justify-space-between">
                <v-menu class="mb-10" bottom
                        left>
                  <template v-slot:activator="{attrs, on}">
                    <v-icon size="15" v-bind="attrs"
                            v-on="on">mdi-dots-vertical
                    </v-icon>
                  </template>
                  <v-list flat class="action">
                    <v-list-item link @click="changeCommunication(item.document.fromWho)">
                      <v-btn x-small text>Изменить способ отправки</v-btn>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item link @click="editItem(item.document)">
                      <v-btn x-small text>Посмотреть</v-btn>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item link @click="changeFile(item.document)">
                      <v-btn x-small text>Заменить</v-btn>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item link @click="showConfirm(item)">
                      <v-btn x-small text>Удалить</v-btn>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-row>
            </v-col>
          </v-row>
        </v-list-item>
      </v-list-item-group>
    </v-list>
    <v-row justify="end" class="mt-10">
      <v-btn color="primary" @click="prepareToSend" :disabled="selectedDocument.length === 0 ">Отправить</v-btn>
    </v-row>
    <v-dialog v-model="show" width="50vw">
      <v-card>
        <v-toolbar dense>
          <v-toolbar-title>Удаление с отправки</v-toolbar-title>
        </v-toolbar>
        <v-card-actions>
          <v-row justify="start" class="ma-0">
            <v-col cols="3">
              <v-btn color="error" @click="closeConfirm">Отмена</v-btn>
            </v-col>
            <v-col cols="3">
              <v-btn color="success" @click="deleteItem(false)">Удалить</v-btn>
            </v-col>
            <v-col cols="4">
              <v-btn color="primary" @click="deleteItem(true)">Удалить вместе с документом</v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="prepareModal" width="50vw">
      <v-card height="60vh">
        <v-toolbar dense class="mb-3">
          <v-toolbar-title>Подготовка к отправке</v-toolbar-title>
        </v-toolbar>
        <v-card-text style="height: 80%;">
          <v-form v-if="selectedDocument.length > 0">
            <v-row>
              <v-checkbox label="Добавить судебный акт к документам" v-model="enableAct"></v-checkbox>
            </v-row>
            <v-row v-if="selectedDocument[0].document.fromWho.comm['communication_type'] === 'Email'" justify="start"
                   align="center">
              <v-col cols="8">
                <v-checkbox v-model="enableCert"
                            label="Подписать документы с помощью ЭЦП (будет добавлен p7s)"></v-checkbox>
              </v-col>
              <v-col cols="4">
                <v-btn small color="primary" :disabled="!enableCert" @click="choiceCert">Выбрать сертификат</v-btn>
              </v-col>
            </v-row>
            <v-row v-if="selectedDocument[0].document.fromWho.comm['communication_type'] === 'Email'" justify="start"
                   align="center">
              <v-select dense outlined label="Укажите почту для отправки" :items="emailConf"
                        item-value="id" item-text="username"
                        :rules="rules.required"
                        clearable
                        v-model="emailSetting"
              >
              </v-select>
            </v-row>
            <v-row v-if="cert">
              <v-col cols="12" justify="start">Выбран сертификат: {{ cert.name }}</v-col>
              <v-col cols="12" justify="start">
                Издатель: {{ cert.publisher }}
              </v-col>
            </v-row>
            <v-row v-if="selectedDocument[0].document.fromWho.comm['communication_type'] !== 'Email'">
              <v-radio-group
                  v-model="pageCount"
                  row
              >
                <v-radio
                    label="По 4 страницы"
                    :value="5"
                ></v-radio>
                <v-radio
                    label="По 19 страниц"
                    :value="19"
                ></v-radio>
              </v-radio-group>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-row justify="center">
            <v-col cols="5">
              <v-btn color="error" @click="prepareModal = false">Закрыть</v-btn>
            </v-col>
            <v-col cols="5">
              <template v-if="selectedDocument.length > 0">
                <v-btn v-if="selectedDocument[0].document.fromWho.comm['communication_type'] === 'Email'"
                       color="success" @click="send" :disabled="(enableCert && cert===null) || !emailSetting">Отправить
                </v-btn>
                <v-btn v-else
                       color="success" @click="send">Отправить
                </v-btn>
              </template>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>

    </v-dialog>
    <ChangeCommunication @updateQueue="update"></ChangeCommunication>
    <ChangeFile @finished="update"></ChangeFile>
    <DeleteDocument></DeleteDocument>
    <editDocument></editDocument>
    <SystemMessage :state.sync="state"/>
    <SelectCommunication @updateQueue="update"></SelectCommunication>
    <SelectCertificate @certSelected="setCert"></SelectCertificate>
  </v-container>
</template>

<script>
// import {mapGetters} from 'vuex'
import {ProcedureType} from "@/const/dataTypes";
import ChangeFile from "@/components/CRM/PaperFlow/modal/ChangeFile.vue";
import editDocument from "@/components/CRM/PaperFlow/modal/editDocument.vue";
import DeleteDocument from "@/components/CRM/PaperFlow/modal/deleteDocument";
import ChangeCommunication from "@/components/CRM/PaperFlow/PostOrder/ChangeCommunication.vue";
import SystemMessage from "@/components/UI/SystemMessage.vue";
import SelectCommunication from "@/components/CRM/PaperFlow/PostOrder/SelectCommunication.vue";
import SelectCertificate from "@/components/Crypto/SelectCertificate.vue";
import {isObject} from "lodash";

export default {
  name: "PostSendQueue",
  data: () => ({
    sortItem: [
      {text: 'По умолчанию', value: null},
      {text: 'Проект', value: 'project'},
      {text: 'Категория', value: 'category'},
      {text: 'Получатель', value: 'recipient'},
    ],
    enableCert: false,
    cert: null,
    emailSetting: null,
    emailConf: [],
    sortProp: null,
    state: '',
    pageCount: 19,
    enableAct: false,
    selectedDocument: [],
    selected: [],
    show: false,
    deletedItem: null,
    prepareModal: false,
    sendMethod: null,
    rules: {
      required: [
        v => !!v || 'Данное поле обязательно',
      ],
    },
  }),
  methods: {
    choiceCert() {
      this.$emit('selectCert')
    },
    fontColor(item) {
      return item['comm']['value'] ? 'font-size: 12px; color: #00a6ee' : 'font-size: 12px; color: #cb1313'
      // if (item.type === "LegalEntity") {
      //   return item.contact_email ? 'font-size: 12px; color: #00a6ee' : 'font-size: 12px; color: #cb1313'
      // } else {
      //   console.log(item['comm']['value'])
      //   return item['comm']['value'] ? 'font-size: 12px; color: #00a6ee' : 'font-size: 12px; color: #cb1313'
      // }
    },
    setCert(item) {
      this.cert = item
    },
    update() {
      this.$store.dispatch('getDocumentSendQueue').then(() => {
        this.selected = []
        this.selectedDocument = []
        this.prepareModal = false
        this.enableAct = false
      }).then(() => {
        this.$store.dispatch('getEmailConf').then(res => {
          this.emailConf = [...res]
        })
      })
    },
    changeCommunication(item) {
      if (item.type === 'LegalEntity') {
        this.$emit('selectCommunication', item)
      } else {
        this.$emit('changeCommunication', item)
      }

    },
    prepareToSend() {
      this.prepareModal = true
    },
    send() {
      let formData = new FormData()
      const sendMethod = this.selectedDocument[0].document.fromWho['comm']
      let sendMethodValue = null
      if (isObject(sendMethod)) {
        sendMethodValue = sendMethod['communication_type']
        formData.append('sendMethod', sendMethod['communication_type'])
      } else {
        sendMethodValue = sendMethod
      }
      if (sendMethodValue === 'Email') {
        formData.append('emailConf', this.emailSetting)
      }
      formData.append('sendMethod', sendMethodValue)
      if (this.enableCert) {
        formData.append('cert', this.cert.index)
        formData.append('enableCert', this.enableCert)
      }

      formData.append('pageCount', this.pageCount)
      formData.append('enableAct', this.enableAct)
      this.selectedDocument.forEach(obj => {
        formData.append('sendItem', obj.id)
      })
      this.$store.dispatch('sendDocumentQueue', {formData: formData, sendMethod: sendMethodValue}).then((res) => {
        this.update()
        if (sendMethodValue === "Email") {
          this.state = 'success'
          this.$emit('showSystemMessage', {response: res, state: this.state, send: true})
        }
      }).catch(err => {
        this.state = 'error'
        this.$emit('showSystemMessage', {response: err, state: this.state, send: false})
      })
    },
    disableListItem(item) {
      if (item.document.fromWho['comm'] === 'Email') {
        if (item.document.fromWho.type === 'LegalEntity' && !item.document.fromWho.contact_email) {
          return true
        } else if (item.document.fromWho.type === 'PhysicalPerson' && !item.document.fromWho['communication_email']) {
          return true
        }
      }
      // return item.document.fromWho['communication'] !== 'ElectronicMail' || item.document.fromWho['communication'] !== 'Email';
      if (this.selectedDocument.length > 0) {
        let firstItem = this.selectedDocument[0]
        if (firstItem.document.fromWho['comm'] !== item.document.fromWho['comm']) {
          return true
        }
      } else {
        return false
      }

    },
    showConfirm(item) {
      this.deletedItem = item
      this.show = true
    },
    closeConfirm() {
      this.deletedItem = null
      this.show = false
    },
    changeFile(doc) {
      this.$emit('changeFile', doc)
    },
    editItem(item) {
      this.$emit('editDoc', item.pk)
    },
    deleteItem(withDocument) {
      let formData = new FormData()
      formData.append('withDocument', withDocument)
      this.$store.dispatch('deleteDocumentSendQueue', {id: this.deletedItem.id, formData}).then(() => {
        this.closeConfirm()
      })
    }
  },
  computed: {
    sortedPostItem() {
      const items = this.$store.getters.docQueueData
      const selectedSort = this.sortProp
      if (!selectedSort) {
        return items
      }
      const sorted = [...items].sort((a, b) => {
        switch (selectedSort) {
          case 'project':
            return a.document.project[0].name.localeCompare(b.document.project.name)
          case 'category':
            return a.document.correspondence_type.name.localeCompare(b.document.correspondence_type.name)
          case 'recipient':
            if (a.document.fromWho && b.document.fromWho) {
              return a.document.fromWho.name.localeCompare(b.document.fromWho.name)
            }
            return a.document.fromWho ? -1 : 1
          default:
            return 0
        }
      })
      return sorted
    }

  },
  filters: {
    postNumber(item) {
      let codeStr = ''
      for (let project of item.document.project) {
        codeStr += `${project.code}-${item.document.out_number}`
      }
      return codeStr
    },
    getProcedure(item) {
      let legal = ProcedureType.Legal
      let physical = ProcedureType.Physical
      let physicalVal = physical.filter(obj => {
        if (obj.value === item) {
          return obj
        }
      })[0]
      let legalVal = legal.filter(obj => {
        if (obj.value === item) {
          return obj
        }
      })[0]
      if (physicalVal) {
        return physicalVal.text
      } else if (legalVal) {
        return legalVal.text
      }
    },
    getEmail(item) {
      if (item.type === "LegalEntity") {
        return item?.contact_email || 'Не указан'
      } else {
        return item?.['communication_email'] || 'Не указан'
      }
    }
  },

  created() {
    this.update()

  },
  mounted() {
    this.selectedDocument = []
    this.selected = []
  },
  components: {
    SelectCertificate,
    SystemMessage,
    ChangeCommunication,
    editDocument,
    ChangeFile,
    DeleteDocument,
    SelectCommunication
  }
}

</script>

<style scoped>
.action >>> .v-list-item {
  min-height: 30px;
  overflow-y: scroll;
}

>>> .v-item-group {
  overflow: hidden;
}

.list-item {
  max-height: 73vh;
  min-height: 73vh;
  overflow-y: scroll;
}
</style>