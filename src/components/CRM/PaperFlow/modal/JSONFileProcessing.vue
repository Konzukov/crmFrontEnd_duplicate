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
                <span>Ошибка обработки файла</span>
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
            <v-card-text v-if="!uploadProcess.errors.hasError">
              <v-data-table
                  v-if="templateType === 'post' && processedData.length > 0"
                  dense :items="processedData"
                  :headers="postHeaders"
                  :item-class="(item) => rowClass(item)"
              >
                <template v-slot:item.actions="{ item }">
                  <v-menu offset-y>
                    <template v-slot:activator="{attrs, on}">
                      <v-icon size="18" v-bind="attrs"
                              v-on="on">mdi-dots-vertical
                      </v-icon>
                    </template>
                    <v-list dense style="font-size: 14px">
                      <v-list-item link @click="selectFile(item)">
                        Добавить файл
                      </v-list-item>
                      <v-list-item link @click="editPost(item)">
                        Редактировать отправление
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-data-table>
              <v-data-table
                  v-else-if="templateType === 'bank_account' && processedData.length > 0"
                  dense
                  :items="processedData"
                  :headers="bankAccountHeaders"
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
              <div v-else-if="processedData.length === 0 && !uploadProcess.uploading">
                Данные будут отображены после обработки файла
              </div>
            </v-card-text>

            <!-- Блок для отображения ошибок валидации -->
            <v-card-text v-if="uploadProcess.errors.hasError">
              <v-alert
                  type="error"
                  dense
                  outlined
                  class="mb-4"
              >
                <strong>{{ uploadProcess.errors.message }}</strong>
                <div v-if="uploadProcess.errors.details" class="mt-2">
                  <div v-if="Array.isArray(uploadProcess.errors.details)">
                    <v-list dense class="py-0">
                      <v-list-item
                          v-for="(detail, index) in uploadProcess.errors.details"
                          :key="index"
                          class="py-1"
                      >
                        <v-list-item-content class="py-0">
                          <v-list-item-title class="text-caption">
                            • {{ detail }}
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </div>
                  <div v-else>
                    {{ uploadProcess.errors.details }}
                  </div>
                </div>
              </v-alert>
            </v-card-text>

            <v-card-actions>
              <v-row justify="end">
                <v-col md="auto" sm="auto">
                  <v-btn color="error" @click.native.stop="removeFile">
                    Удалить
                  </v-btn>
                </v-col>
                <v-col md="auto" sm="auto">
                  <v-btn
                    color="success"
                    @click.native.stop="processJsonPost"
                    :disabled="uploadProcess.uploading"
                  >
                    Обработать
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-container>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <postEdit v-if="templateType === 'post'" @postUpdated="updatePost"></postEdit>
    <ChooseDocument v-if="templateType === 'post'" @chooseDocs="chooseDocs"></ChooseDocument>
    <BankAccountCreateModal v-if="templateType === 'bank_account'"
                            @updateAccount="updateAccountList"></BankAccountCreateModal>
  </v-container>
</template>

<script>
import {eventBus} from "@/bus";
import postEdit from "@/components/CRM/PaperFlow/Post/modal/PostEdit.vue";
import ChooseDocument from "@/components/CRM/PaperFlow/modal/ChooseDocument.vue";
import BankAccountCreateModal from "@/components/referenceBook/Bank/BankAccountCreateModal.vue";

export default {
  props: {
    uploadFile: File,
    templateType: {
      type: String,
      required: true,
      validator: value => ['post', 'bank_account'].includes(value)
    }
  },
  name: "JSONFileProcessing",
  data: () => ({
    processedData: [],
    postHeaders: [
      {text: 'РПО', value: 'rpo'},
      {text: 'Дата отправки', value: 'departure_date'},
      {text: 'Получатель', value: 'from_who.fullName'},
      {text: 'Проект', value: 'project'},
      {text: 'Действия', value: 'actions'},
    ],
    bankAccountHeaders: [
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
        details: null, // Может быть строкой или массивом
        hasError: false
      }
    },
    templateError: false,
    errorMessage: '',
    currentItem: null,
  }),
  methods: {
    editBankAccount(item) {
      if (item.hasOwnProperty('created')) {
        this.$emit('addBankAccount', item)
      } else {
        this.$emit('editBankAccount', item)
      }
    },
    updateAccountList(item) {
      this.processedData = this.processedData.map(obj => {
        if (obj.account === item.account) {
          return item;
        }
        return obj;
      });
    },
    updatePost() {
      this.$store.dispatch('getPostDetail', this.currentItem?.pk).then(updatedData => {
        const index = this.processedData.findIndex(item => item.pk === updatedData?.pk);

        if (index !== -1) {
          this.$set(this.processedData, index, {
            ...this.processedData[index],
            ...updatedData,
            project: this.formatProjectNames(updatedData.project || this.processedData[index].project)
          });

          this.currentItem = this.processedData[index];
        }
        console.log('Обновленные данные:', updatedData);
      });

      this.currentItem = null;
    },
    async chooseDocs(data) {
      for (let doc of data.chooseDocs) {
        let formData = new FormData()
        formData.append('post', this.currentItem?.pk)
        formData.append('doc', doc.id)
        await this.$store.dispatch('addDocToPost', formData).then(() => {
          this.update()
        })
      }
    },
    formatProjectNames(projects) {
      if (!projects) return '';
      if (typeof projects === 'string') return projects;
      if (Array.isArray(projects)) {
        return projects.map(proj => proj.name || '').join(', ');
      }

      return '';
    },
    editPost(item) {
      this.$emit('editPost', item.pk)
      console.log(item)
    },
    selectFile(item) {
      this.currentItem = item;
      let args = {departure_date: this.currentItem.departure_date}
      if (this.currentItem.from_who?.type) {
        args['from_who'] = {
          type: this.currentItem.from_who.type,
          uuid: this.currentItem.from_who.uuid
        }
      }
      this.$emit('chooseDocs', args)
    },
    removeFile() {
      this.$destroy();
      this.$el.parentNode.removeChild(this.$el);
      this.uploadProcess.uploaded = true
    },
    async processJsonPost() {
      // Сброс ошибок перед новой обработкой
      this.uploadProcess.errors = {
        message: '',
        details: null,
        hasError: false
      };

      this.uploadProcess.uploading = true;
      let formData = new FormData();
      formData.set('file', this.uploadFile);
      formData.set('processingType', 'json');

      try {
        let data;
        if (this.templateType === 'post') {
          formData.set('processingContent', 'post');
          data = await this.$store.dispatch('jsonPostProcessing', {
            formData,
            'file': this.uploadFile,
            'processingContent': 'post'
          });
        } else if (this.templateType === 'bank_account') {
          formData.set('processingContent', 'bank_account');
          data = await this.$store.dispatch('jsonPostProcessing', {
            formData,
            'file': this.uploadFile,
            'processingContent': 'bank_account'
          });
        }

        this.uploadProcess.uploading = false;
        this.uploadProcess.uploaded = true;
        this.processedData = [...data];

      } catch (err) {
        console.error('Ошибка обработки JSON:', err);

        this.uploadProcess.uploading = false;
        this.uploadProcess.uploaded = false;
        this.uploadProcess.errors.hasError = true;

        // Обработка различных форматов ошибок от бэкенда
        if (err.response && err.response.data) {
          const errorData = err.response.data;

          // Формат 1: { error: 'message', details: [...] }
          if (errorData.error && errorData.details) {
            this.uploadProcess.errors.message = errorData.error;
            this.uploadProcess.errors.details = errorData.details;
          }
          // Формат 2: { errors: { error: 'message', details: '...' } }
          else if (errorData.errors) {
            this.uploadProcess.errors.message = errorData.errors.error || 'Неизвестная ошибка';
            this.uploadProcess.errors.details = errorData.errors.details || errorData.errors;
          }
          // Формат 3: { error: 'message' }
          else if (errorData.error) {
            this.uploadProcess.errors.message = errorData.error;
            this.uploadProcess.errors.details = errorData.details || null;
          }
          // Формат 4: строка или другой формат
          else {
            this.uploadProcess.errors.message = 'Ошибка обработки файла';
            this.uploadProcess.errors.details = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
          }
        } else {
          this.uploadProcess.errors.message = 'Ошибка соединения с сервером';
          this.uploadProcess.errors.details = err.message || 'Неизвестная ошибка';
        }
      }
    },
    rowClass(item) {
      if (item.hasOwnProperty('created')) {
        return 'created-false'
      }
    }
  },
  mounted() {
    eventBus.$on('updateProgress', ({progress, file}) => {
      this.uploadProcess.progress = progress
    })
  },
  components: {
    ChooseDocument,
    postEdit,
    BankAccountCreateModal
  }
}
</script>

<style scoped>
>>> .created-false {
  background-color: #c1020226;
}

.error-message {
  font-size: 0.875rem;
  max-width: 300px;
  word-break: break-word;
}

.v-alert {
  margin-bottom: 16px;
}

.v-list-item__title {
  font-size: 0.75rem !important;
  line-height: 1.2 !important;
}
</style>