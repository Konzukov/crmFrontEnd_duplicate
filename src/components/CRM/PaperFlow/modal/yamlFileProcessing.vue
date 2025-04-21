<template>
  <v-container>
    <v-expansion-panel :class="[templateError? 'has-error': '', 'pr-3 pl-3']">
      <v-expansion-panel-header>
        <v-row justify="start" align="center">
          <v-col cols="auto">{{ uploadFile.name }}</v-col>
          <v-col cols="auto">
            <v-btn icon v-if="!uploadProcess.uploading">
              <v-icon v-if="uploadProcess.uploaded" color="success">
                mdi-check
              </v-icon>
              <v-tooltip bottom v-if="uploadProcess.errors.hasError">
                <template v-slot:activator="{ on, attrs }">
                  <v-icon color="error"
                          v-bind="attrs"
                          v-on="on"
                  >
                    mdi-alert-circle-outline
                  </v-icon>
                </template>
                <span>{{ uploadProcess.errors.message }}</span>
              </v-tooltip>
            </v-btn>
            <v-progress-circular
                v-if="uploadProcess.uploading"
                :rotate="-90"
                :size="40"
                :width="7"
                :value="uploadProcess.progress"
                color="primary"
            >
              {{ uploadProcess.progress }}
            </v-progress-circular>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto" class="error--text error-message">
            {{ errorMessage }}
          </v-col>
        </v-row>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-container>
          <v-card>
            <v-card-text v-if="processedBankAccount.length === 0">
              Данные будут отображены после обработки файла
            </v-card-text>
            <v-card-text v-else>
              <v-data-table dense :items="processedBankAccount"
                            :headers="headers"
                            :item-class="(item) => rowClass(item)"
              >
                <template v-slot:item.actions="{ item }">
                  <v-btn icon small color="primary"
                         @click="editBankAccount(item)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card-text>
            <v-card-actions>
              <v-row justify="end">
                <v-col md="auto" sm="auto">
                  <v-btn color="error" @click.native.stop="removeFile">
                    Удалить
                  </v-btn>
                </v-col>
                <v-col md="auto" sm="auto">
                  <v-btn color="success" @click.native.stop="processYaml">
                    Обработать
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-container>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <BankAccountCreateModal @updateAccount="updateAccountList"></BankAccountCreateModal>
  </v-container>
</template>


<script>

import BankAccountCreateModal from "@/components/referenceBook/Bank/BankAccountCreateModal.vue";
import {eventBus} from "@/bus";


export default {
  components: {BankAccountCreateModal},
  props: ['uploadFile'],
  name: "yamlFileProcessing",
  data: () => ({
    processedBankAccount: [],
    headers: [
      {text: 'Номер счета', value: 'account'},
      {text: 'Банк', value: 'bank.name'},
      {text: 'Действия', value: 'actions'},
    ],
    uploadProcess: {
      uploaded: false,
      uploading: false,
      progress: '0',
      errors: {
        message: '',
        hasError: false
      }
    },

    templateError: false,
    errorMessage: '',
  }),
  methods: {
    updateAccountList(item) {
      this.processedBankAccount = this.processedBankAccount.map(obj => {
        if (obj.account === item.account) {
          return item;
        }
        return obj;
      });
    },
    editBankAccount(item) {
      if (item.hasOwnProperty('created')) {
        this.$emit('addBankAccount', item)
      } else {
        this.$emit('editBankAccount', item)
      }
    },
    removeFile() {
      this.$destroy();
      this.$el.parentNode.removeChild(this.$el);
      this.uploadProcess.uploaded = true
    },
    processYaml() {
      this.uploadProcess.uploading = true
      let formData = new FormData()
      formData.set('file', this.uploadFile)
      formData.set('processingType', 'yaml')
      this.$store.dispatch('yamlProcessing', {formData, 'file': this.uploadFile}).then(res => {
        this.uploadProcess.uploading = false
        this.uploadProcess.uploaded = true
        this.processedBankAccount = [...res]
        for (let item of this.processedBankAccount) {
          console.log(item)
        }
      }).catch(err => {
        console.log(err.response)
        this.uploadProcess.errors.hasError = true
        this.uploadProcess.errors.message = err.response.data.errors.error
        this.uploadProcess.uploading = false
        this.uploadProcess.uploaded = false
      })
    },
    rowClass(item) {
      if (item.hasOwnProperty('created')) {
        return 'created-false'
      }
      console.log(item)
    }
  },
  mounted() {
    eventBus.$on('updateProgress', ({progress, file}) => {
      this.uploadProcess.progress = progress
    })
  },
}
</script>


<style scoped>
>>> .created-false {
  background-color: #c1020226;
}
</style>