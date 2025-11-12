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
              <v-row justify="start" no-gutters>
                <v-col cols="12">
                  {{ item | postNumber }}
                </v-col>
                <v-col cols="12" v-if="item.page_count" style="font-size: 12px; color: #00a6ee">
                  {{ item.page_count }} стр. | {{ item.document.size }}
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="1">
              <template v-if="item.document.fromWho['main_communication']">
                <template v-if="item.document.fromWho['main_communication']['communication_type'] ==='ElectronicMail'">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on">mdi-email-outline</v-icon>
                    </template>
                    <span>Электронное письмо (ЭЗП)</span>
                  </v-tooltip>
                </template>
                <template v-else-if="item.document.fromWho['main_communication']['communication_type'] ==='PaperMail'">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on">mdi-email-open-outline</v-icon>
                    </template>
                    <span>Бумажное письмо</span>
                  </v-tooltip>
                </template>
                <template v-else-if="item.document.fromWho['main_communication']['communication_type'] ==='Email'">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on">mdi-gmail</v-icon>
                    </template>
                    <span>Электронная почта</span>
                  </v-tooltip>
                </template>
              </template>
            </v-col>
            <v-col cols="3">
              <v-row justify="start">
                <v-col cols="12" class="pb-0">{{ item.document.project | getProjectName }}</v-col>
                <v-col cols="12" style="font-size: 12px; color: #00a6ee">
                  {{ item.document.project[0] | getProcedure }}
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="3">
              <v-row justify="start">
                <v-col cols="12" class="pb-0">{{ item.document.fromWho.fullName }}</v-col>
                <v-col cols="12" style="font-size: 12px; color: #00a6ee"
                       v-if="item.document.fromWho['main_communication']">
                  {{ item.document.fromWho['main_communication']['value'] }}
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="2">
              <v-row justify="start">
                <v-col cols="12" v-if="item.document.correspondence_type">
                  {{ item.document.correspondence_type.name }}
                </v-col>
                <v-col cols="12" v-else style="color: #ee0000">Не указан тип корреспонденции</v-col>
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
      <v-card height="50vh">
        <v-toolbar dense class="mb-3">
          <v-toolbar-title>Подготовка к отправке</v-toolbar-title>
        </v-toolbar>
        <v-card-text style="height: 70%;">
          <v-form v-if="selectedDocument.length > 0">
            <v-row justify="start"
                   align="center" class="mb-0 mt-1">
              <v-col cols="12" class="pa-0">
                <v-checkbox label="Добавить судебный акт к документам" v-model="enableAct"></v-checkbox>
              </v-col>
            </v-row>
            <v-row
                v-if="selectedDocument[0].document.fromWho['main_communication']['communication_type'] === 'PaperMail'"
                justify="start"
                align="center" class="mt-0">
              <v-col cols="12" class="pa-0">
                <v-checkbox v-model="enableEnvelope"
                            label="Сформировать конверт"></v-checkbox>
              </v-col>
            </v-row>
            <v-row justify="start" v-if="enableEnvelope">
              <v-col cols="12">
                <v-select :items="envelopeType" item-value="value" item-text="text" v-model="envelope" outlined
                          label="Выбрать конверт">
                </v-select>
              </v-col>
            </v-row>
            <v-row
                v-if="['Email', 'ElectronicMail'].includes(selectedDocument[0].document.fromWho.main_communication.communication_type)"
                justify="start"
                align="center" class="mt-0">
              <v-col cols="12" class="pa-0">
                <v-checkbox v-model="enableCert"
                            label="Подписать с помощью ЭЦП (будет добавлен p7s)"></v-checkbox>
              </v-col>
            </v-row>
            <v-row justify="start" v-if="enableCert">
              <v-col cols="12">
                <v-select :items="certList" return-object item-value="index" v-model="cert" outlined
                          label="Выбрать сертификат">
                  <template v-slot:selection="data">
                    <v-list-item-content>
                      <v-list-item-title>{{ data.item.name }}</v-list-item-title>
                      <v-list-item-subtitle style="font-size: 10px; color: #00a6ee">
                        {{ data.item.publisher | publisher }} |
                        Действителен до: {{ data.item.validTo }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </template>
                  <template v-slot:item="data">
                    <v-list-item-content>
                      <v-list-item-title>{{ data.item.name }}</v-list-item-title>
                      <v-list-item-subtitle style="font-size: 12px; color: #00a6ee">
                        {{ data.item.publisher | publisher }} |
                        Действителен до: {{ data.item.validTo }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </template>
                </v-select>
                <!--                <v-btn small color="primary" :disabled="!enableCert" @click="choiceCert">Выбрать сертификат</v-btn>-->
              </v-col>
            </v-row>
            <v-row
                v-if="selectedDocument[0].document.fromWho['main_communication']['communication_type'] === 'Email'"
                justify="start"
                align="center">
              <v-select dense outlined label="Укажите почту для отправки" :items="emailConf"
                        item-value="id" item-text="username"
                        :rules="rules.required"
                        clearable
                        v-model="emailSetting"
              >
              </v-select>
            </v-row>
            <v-row
                v-if="selectedDocument[0].document.fromWho['main_communication']['communication_type'] !== 'Email'">
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
                <v-btn
                    :loading="loading"
                    v-if="selectedDocument[0].document.fromWho['main_communication']['communication_type'] === 'Email'"
                    color="success" @click="send" :disabled="(enableCert && cert===null) || !emailSetting">Отправить
                </v-btn>
                <v-btn v-else
                       :loading="loading"
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
    loading: false,
    sortItem: [
      {text: 'По умолчанию', value: null},
      {text: 'Проект', value: 'project'},
      {text: 'Категория', value: 'category'},
      {text: 'Получатель', value: 'recipient'},
    ],
    envelopeType: [
      {'value': 'C5', text: 'Конверт С5 - средний'},
      {'value': 'DL', text: 'Конверт DL - узкий'},
    ],
    enableCert: false,
    enableEnvelope: false,
    envelope: null,
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
      return item['main_communication']?.value ? 'font-size: 12px; color: #00a6ee' : 'font-size: 12px; color: #cb1313'
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
          if (this.certList.length === 0) {
            this.$store.dispatch('getCert')
          }

        })
      })
    },
    changeCommunication(item) {
      this.$emit('selectCommunication', item)
    },
    prepareToSend() {
      this.prepareModal = true
    },
    getCommAddress(fromWho) {
      if (fromWho.type === 'LegalEntity') {
        if (typeof fromWho['main_communication'] === 'object') {
          return fromWho['main_communication'].value || fromWho.legal_address;
        }
        return fromWho.legal_address;
      } else {
        return fromWho.communication_email || fromWho.email || fromWho.legal_address;
      }
    },
    getCommIcon(comm) {
      if (typeof comm === 'object') {
        comm = comm.communication_type;
      }

      switch (comm) {
        case 'Email':
          return 'mdi-gmail';
        case 'ElectronicMail':
          return 'mdi-email-outline';
        case 'PaperMail':
          return 'mdi-email-open-outline';
        default:
          return 'mdi-email-outline';
      }
    },
    send() {
      this.loading = true
      let formData = new FormData()
      const sendMethod = this.selectedDocument[0].document.fromWho['main_communication']
      let sendMethodValue = null
      if (isObject(sendMethod)) {
        sendMethodValue = sendMethod['communication_type']
        formData.append('sendMethod', sendMethod['communication_type'])
      } else {
        sendMethodValue = sendMethod
      }
      if (['Email', 'ElectronicMail'].includes(sendMethodValue)) {
        if (sendMethodValue === 'Email') {
          formData.append('emailConf', this.emailSetting)
        }
        if (this.enableCert) {
          formData.append('cert', this.cert.index)
          formData.append('enableCert', this.enableCert)
        }
      }
      if (sendMethodValue === 'PaperMail') {
        formData.append('envelope', this.envelope)
      }
      formData.append('sendMethod', sendMethodValue)
      formData.append('pageCount', this.pageCount)
      formData.append('enableAct', this.enableAct)
      this.selectedDocument.forEach(obj => {
        formData.append('sendItem', obj.id)
      })
      this.$store.dispatch('sendDocumentQueue', {formData: formData, sendMethod: sendMethodValue}).then((res) => {
        this.loading = false
        this.update()
        if (sendMethodValue === "Email") {
          this.state = 'success'
          this.$emit('showSystemMessage', {response: res, state: this.state, send: true})
        }
      }).catch(err => {
        this.loading = false
        this.state = 'error'
        this.$emit('showSystemMessage', {response: err, state: this.state, send: false})
      })
    },
    disableListItem(item) {
      if (!item.document?.fromWho) return true;

      const fromWho = item.document.fromWho;
      const comm = fromWho.main_communication;

      // 1. Проверка наличия основного способа коммуникации
      if (!comm) return true;

      // 2. Проверка наличия значения для отправки
      if (!comm.value) return true;

      // 3. Специальная проверка для Email
      if (comm.communication_type === 'Email' &&
          !comm.value.includes('@')) {
        return true;
      }

      // Если нет выбранных документов - элемент доступен
      if (this.selectedDocument.length === 0) return false;

      // Получаем способ отправки первого выбранного элемента
      const firstComm = this.selectedDocument[0].document.fromWho.main_communication;

      // Блокируем только если способы отправки РАЗНЫЕ
      return comm.communication_type !== firstComm.communication_type;
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
              console.log(a.document.fromWho, b.document.fromWho)
              return a.document.fromWho.fullName.localeCompare(b.document.fromWho.fullName)
            }
            return a.document.fromWho ? -1 : 1
          default:
            return 0
        }
      })
      return sorted
    },
    certList() {
      return this.$store.getters.certListData
    }
  },
  filters: {
    publisher(publisher) {
      const cnMatch = publisher.match(/CN=([^,]+)/);
      if (!cnMatch) return '';
      return cnMatch[1]
          .replace(/^"(.*)"$/, '$1')
          .replace(/""/g, '"');
    },
    postNumber(item) {
      console.log(item);
      return item.document.project
          .map(project => `${project.code}-${item.document.out_number}`)
          .join('_');
    },
    getProjectName(item) {
      if (item && item.length > 0) {
        return item.map(obj => obj.name).join(', ')
      }
    },
    getProcedure(item) {
      let legal = ProcedureType.Legal
      let physical = ProcedureType.Physical
      if (item) {
        let physicalVal = physical.find(obj => {
          if (obj.value === item?.procedure) {
            return obj
          }
        })
        let legalVal = legal.find(obj => {
          if (obj.value === item?.procedure) {
            return obj
          }
        })
        if (physicalVal) {
          return physicalVal.text
        } else if (legalVal) {
          return legalVal.text
        }
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