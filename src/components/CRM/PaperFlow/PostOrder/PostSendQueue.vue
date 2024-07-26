<template>
  <v-container fluid class="mt-2">
    <v-list flat two-line v-if="sendQueueList" dense class="list-item">
      <v-list-item-group multiple v-model="selected">
        <v-list-item v-for="(item, i) in sendQueueList" :key="i" :style="i%2!==0? 'background-color: #cfcfcf4d':''"
                     :disabled="disableListItem(item)" style="font-size: 14px">
          <v-row justify="start" class="pt-5 pb-5">
            <v-col cols="1">
              <v-checkbox dense class="ma-0 pa-0" v-model="selectedDocument" :value="item"
                          :input-value="item.id"></v-checkbox>
            </v-col>
            <v-col cols="1">
              {{ item | postNumber }}
            </v-col>
            <v-col cols="1">
              <template v-if="item.document.fromWho['communication'] ==='ElectronicMail'">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon v-bind="attrs" v-on="on">mdi-email-outline
                    </v-icon>
                  </template>
                  <span>Электронное письмо</span>
                </v-tooltip>
              </template>
              <template v-if="item.document.fromWho['communication'] ==='PaperMail'">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon v-bind="attrs" v-on="on">mdi-email-open-outline</v-icon>
                  </template>
                  <span>Бумажное письмо</span>
                </v-tooltip>
              </template>
              <template v-else-if="item.document.fromWho['communication'] ==='Email'">
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
                <v-col cols="12" style="font-size: 12px; color: #00a6ee">{{ item.document.fromWho.legal_address }}
                </v-col>
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
      <v-btn color="primary" @click="send">Отправить</v-btn>
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
    <ChangeFile></ChangeFile>
    <DeleteDocument></DeleteDocument>
    <editDocument></editDocument>
  </v-container>
</template>

<script>
import {mapGetters} from 'vuex'
import {ProcedureType} from "@/const/dataTypes";
import ChangeFile from "@/components/CRM/PaperFlow/modal/ChangeFile.vue";
import editDocument from "@/components/CRM/PaperFlow/modal/editDocument.vue";
import DeleteDocument from "@/components/CRM/PaperFlow/modal/deleteDocument";

export default {
  name: "PostSendQueue",
  data: () => ({
    selectedDocument: [],
    selected: [],
    show: false,
    deletedItem: null
  }),
  methods: {
    send() {
      let formData = new FormData()
      formData.append('sendMethod', this.selectedDocument[0].document.fromWho['communication'])
      this.selectedDocument.forEach(obj => {
        formData.append('sendItem', obj.id)

      })
      this.$store.dispatch('sendDocumentQueue', formData)
    },
    disableListItem(item) {
      console.log(item)
      return item.document.fromWho['communication'] !== 'ElectronicMail';
      // if (this.selectedDocument.length > 0) {
      //   let firstItem = this.selectedDocument[0]
      //   if (firstItem.document.fromWho['communication'] !== item.document.fromWho['communication']) {
      //     return true
      //   }
      // } else {
      //   return false
      // }

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
    ...mapGetters({
      sendQueueList: 'docQueueData'
    })
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

    }
  },

  created() {
    this.$store.dispatch('getDocumentSendQueue')
  },
  components: {
    editDocument,
    ChangeFile,
    DeleteDocument
  }
}

</script>

<style scoped>
.action >>> .v-list-item {
  min-height: 30px;
  overflow-y: scroll;
}
>>>.v-item-group {
  overflow: hidden;
}
.list-item {
  max-height: 75vh;
  min-height: 75vh;
  overflow-y: scroll;
}
</style>