<template>
  <v-container fluid v-if="document">
    <v-row>
      <!-- Left column: PDF Viewer -->
      <v-col cols="12" md="7">
        <v-card height="800px">
          <document-pdf-viewer
            :pdf-url="selectedFilePdfUrl"
          ></document-pdf-viewer>
        </v-card>
      </v-col>

      <!-- Right column: Document metadata -->
      <v-col cols="12" md="5">
        <v-card class="mb-4">
          <v-card-title class="primary white--text">
            <v-icon left color="white">mdi-file-document</v-icon>
            {{ document.title }}
            <v-spacer></v-spacer>
            <v-btn icon color="white" @click="$router.back()">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12">
                <div class="mb-2">
                  <strong>Исходящий номер:</strong> {{ document.out_number || '-' }}
                </div>
                <div class="mb-2">
                  <strong>Состояние:</strong>
                  <v-chip
                    small
                    :color="document.current_state ? document.current_state.color : 'grey'"
                    dark
                    class="ml-2"
                  >
                    {{ document.current_state ? document.current_state.name : 'Не указано' }}
                  </v-chip>
                  <v-btn
                    small
                    text
                    color="primary"
                    @click="showStateChangeDialog = true"
                    class="ml-2"
                  >
                    Изменить
                  </v-btn>
                </div>
                <div class="mb-2">
                  <strong>Тип:</strong> {{ document.document_type ? document.document_type.name : '-' }}
                </div>
                <div class="mb-2">
                  <strong>Направление:</strong>
                  <v-chip small :color="getDirectionColor(document.direction)">
                    {{ getDirectionText(document.direction) }}
                  </v-chip>
                </div>
                <div class="mb-2">
                  <strong>Исполнитель:</strong> {{ document.executor ? document.executor.name : '-' }}
                </div>
                <div class="mb-2" v-if="document.issuer_legal">
                  <strong>Издатель (юр. лицо):</strong> {{ document.issuer_legal.name }}
                </div>
                <div class="mb-2" v-if="document.issuer_physical">
                  <strong>Издатель (физ. лицо):</strong> {{ document.issuer_physical.name }}
                </div>
                <div class="mb-2" v-if="document.owner_legal">
                  <strong>Владелец (юр. лицо):</strong> {{ document.owner_legal.name }}
                </div>
                <div class="mb-2" v-if="document.owner_physical">
                  <strong>Владелец (физ. лицо):</strong> {{ document.owner_physical.name }}
                </div>
                <div class="mb-2" v-if="document.project">
                  <strong>Проект:</strong> {{ document.project.name }}
                </div>
                <div class="mb-2" v-if="document.amount">
                  <strong>Сумма:</strong> {{ document.amount }} {{ document.currency || 'RUB' }}
                </div>
                <div class="mb-2" v-if="document.description">
                  <strong>Описание:</strong>
                  <div class="mt-1">{{ document.description }}</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Files Section -->
        <v-card class="mb-4">
          <v-card-title class="subtitle-1">
            <v-icon left>mdi-paperclip</v-icon>
            Файлы
            <v-spacer></v-spacer>
            <v-btn small color="primary" @click="showAddFileDialog = true">
              <v-icon small left>mdi-plus</v-icon>
              Добавить
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list dense v-if="document.files && document.files.length">
              <v-list-item
                v-for="file in document.files"
                :key="file.id"
                @click="selectFile(file)"
                :class="{ 'primary--text': selectedFileId === file.id }"
              >
                <v-list-item-icon>
                  <v-icon>{{ getFileIcon(file.mime_type) }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ file.original_name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatFileSize(file.file_size) }} • {{ formatDate(file.uploaded_at) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon small :href="file.file" target="_blank">
                    <v-icon small>mdi-download</v-icon>
                  </v-btn>
                </v-list-item-action>
                <v-list-item-action>
                  <v-btn icon small @click.stop="removeFile(file)">
                    <v-icon small>mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <div v-else class="text-center grey--text">
              Нет прикрепленных файлов
            </div>
          </v-card-text>
        </v-card>

        <!-- Signatories Section -->
        <v-card class="mb-4">
          <v-card-title class="subtitle-1">
            <v-icon left>mdi-account-check</v-icon>
            Подписанты
            <v-spacer></v-spacer>
            <v-btn small color="primary" @click="showAddSignatoryDialog = true">
              <v-icon small left>mdi-plus</v-icon>
              Добавить
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list dense v-if="document.signatories && document.signatories.length">
              <v-list-item v-for="signatory in document.signatories" :key="signatory.id">
                <v-list-item-content>
                  <v-list-item-title>{{ signatory.name }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon small @click="removeSignatory(signatory)">
                    <v-icon small>mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <div v-else class="text-center grey--text">
              Нет подписантов
            </div>
          </v-card-text>
        </v-card>

        <!-- Workflow History -->
        <v-card>
          <v-card-title class="subtitle-1">
            <v-icon left>mdi-timeline</v-icon>
            История изменений
          </v-card-title>
          <v-card-text>
            <v-timeline dense v-if="document.workflow_history && document.workflow_history.length">
              <v-timeline-item
                v-for="(history, index) in document.workflow_history"
                :key="index"
                :color="history.state ? history.state.color : 'grey'"
                small
              >
                <template v-slot:opposite>
                  <span class="caption">{{ formatDate(history.timestamp) }}</span>
                </template>
                <v-card flat>
                  <v-card-title class="subtitle-2">
                    {{ history.state ? history.state.name : 'Изменение' }}
                  </v-card-title>
                  <v-card-text>
                    <div v-if="history.actor">
                      <strong>Кто:</strong> {{ history.actor.name }}
                    </div>
                    <div v-if="history.comment">
                      <strong>Комментарий:</strong> {{ history.comment }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-timeline-item>
            </v-timeline>
            <div v-else class="text-center grey--text">
              Нет истории изменений
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- State Change Dialog -->
    <document-state-change-dialog
      v-model="showStateChangeDialog"
      :document="document"
      @state-changed="onStateChanged"
    ></document-state-change-dialog>

    <!-- Add File Dialog -->
    <v-dialog v-model="showAddFileDialog" max-width="500">
      <v-card>
        <v-card-title>Добавить файлы</v-card-title>
        <v-card-text>
          <p>Функция добавления файлов будет реализована</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showAddFileDialog = false">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Signatory Dialog -->
    <v-dialog v-model="showAddSignatoryDialog" max-width="500">
      <v-card>
        <v-card-title>Добавить подписанта</v-card-title>
        <v-card-text>
          <p>Функция добавления подписанта будет реализована</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showAddSignatoryDialog = false">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  <v-container v-else fluid class="text-center">
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import DocumentPdfViewer from './DocumentPdfViewer.vue'
import DocumentStateChangeDialog from './DocumentStateChangeDialog.vue'

export default {
  name: 'DocumentDetail',
  components: {
    DocumentPdfViewer,
    DocumentStateChangeDialog
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      showStateChangeDialog: false,
      showAddFileDialog: false,
      showAddSignatoryDialog: false,
      selectedFileId: null
    }
  },
  computed: {
    ...mapGetters('documentFlow', ['getCurrentDocument']),
    document() {
      return this.getCurrentDocument
    },
    selectedFilePdfUrl() {
      if (!this.document || !this.document.files || !this.document.files.length) {
        return null
      }
      const file = this.selectedFileId
        ? this.document.files.find(f => f.id === this.selectedFileId)
        : this.document.files[0]
      return file && file.mime_type === 'application/pdf' ? file.file : null
    }
  },
  async mounted() {
    await this.loadDocument()
  },
  methods: {
    ...mapActions('documentFlow', [
      'fetchDocument',
      'removeFilesFromDocument',
      'removeSignatory'
    ]),
    async loadDocument() {
      try {
        await this.fetchDocument(this.id)
        if (this.document && this.document.files && this.document.files.length) {
          this.selectedFileId = this.document.files[0].id
        }
      } catch (error) {
        console.error('Error loading document:', error)
        this.$store.commit('snackbar/showSnackbar', {
          message: 'Ошибка при загрузке документа',
          color: 'error'
        })
      }
    },
    selectFile(file) {
      this.selectedFileId = file.id
    },
    async removeFile(file) {
      if (confirm('Удалить этот файл?')) {
        try {
          await this.removeFilesFromDocument({
            documentId: this.document.id,
            fileIds: [file.id]
          })
          this.$store.commit('snackbar/showSnackbar', {
            message: 'Файл удален',
            color: 'success'
          })
        } catch (error) {
          console.error('Error removing file:', error)
          this.$store.commit('snackbar/showSnackbar', {
            message: 'Ошибка при удалении файла',
            color: 'error'
          })
        }
      }
    },
    async removeSignatory(signatory) {
      if (confirm('Удалить этого подписанта?')) {
        try {
          await this.$store.dispatch('documentFlow/removeSignatory', {
            documentId: this.document.id,
            signatoryId: signatory.id
          })
          this.$store.commit('snackbar/showSnackbar', {
            message: 'Подписант удален',
            color: 'success'
          })
        } catch (error) {
          console.error('Error removing signatory:', error)
          this.$store.commit('snackbar/showSnackbar', {
            message: 'Ошибка при удалении подписанта',
            color: 'error'
          })
        }
      }
    },
    onStateChanged() {
      this.loadDocument()
    },
    getDirectionColor(direction) {
      const colors = {
        incoming: 'blue',
        outgoing: 'green',
        internal: 'orange'
      }
      return colors[direction] || 'grey'
    },
    getDirectionText(direction) {
      const texts = {
        incoming: 'Входящий',
        outgoing: 'Исходящий',
        internal: 'Внутренний'
      }
      return texts[direction] || direction
    },
    getFileIcon(mimeType) {
      if (mimeType && mimeType.includes('pdf')) {
        return 'mdi-file-pdf-box'
      } else if (mimeType && mimeType.includes('image')) {
        return 'mdi-file-image'
      } else if (mimeType && mimeType.includes('word')) {
        return 'mdi-file-word'
      } else if (mimeType && mimeType.includes('excel')) {
        return 'mdi-file-excel'
      }
      return 'mdi-file'
    },
    formatFileSize(bytes) {
      if (!bytes) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    },
    formatDate(date) {
      return date ? moment(date).format('DD.MM.YYYY HH:mm') : '-'
    }
  }
}
</script>

<style scoped>
.v-card {
  overflow: auto;
}
</style>
