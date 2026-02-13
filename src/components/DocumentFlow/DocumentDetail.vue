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
                    :color="getStateColor(document.current_state)"
                    dark
                    class="ml-2"
                  >
                    {{ document.current_state || 'Не указано' }}
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
                  <strong>Тип:</strong> {{ document.document_type || '-' }}
                </div>
                <div class="mb-2">
                  <strong>Направление:</strong>
                  <v-chip small :color="getDirectionColor(document.direction)">
                    {{ getDirectionText(document.direction) }}
                  </v-chip>
                </div>
                <div class="mb-2">
                  <strong>Исполнитель:</strong> {{ document.executor || '-' }}
                </div>
                <div class="mb-2" v-if="document.issuer_legal">
                  <strong>Издатель (юр. лицо):</strong> {{ document.issuer_legal }}
                </div>
                <div class="mb-2" v-if="document.issuer_physical">
                  <strong>Издатель (физ. лицо):</strong> {{ document.issuer_physical }}
                </div>
                <div class="mb-2" v-if="document.owner_legal">
                  <strong>Владелец (юр. лицо):</strong> {{ document.owner_legal }}
                </div>
                <div class="mb-2" v-if="document.owner_physical">
                  <strong>Владелец (физ. лицо):</strong> {{ document.owner_physical }}
                </div>
                <div class="mb-2" v-if="document.project">
                  <strong>Проект:</strong> {{ document.project }}
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
            <v-list dense v-if="fileLinks && fileLinks.length">
              <v-list-item
                v-for="link in fileLinks"
                :key="link.id"
                @click="selectFileLink(link)"
                :class="{ 'primary--text': selectedFileLinkId === link.id }"
              >
                <v-list-item-icon>
                  <v-icon>{{ getFileIcon(link.file_mime_type) }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ link.file_name || 'Файл' }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ link.location_type_display || 'Весь файл' }}
                    <span v-if="link.location_value"> ({{ link.location_value }})</span>
                  </v-list-item-subtitle>
                  <v-list-item-subtitle v-if="link.description">
                    {{ link.description }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon small :href="link.file_url" target="_blank" v-if="link.file_url">
                    <v-icon small>mdi-download</v-icon>
                  </v-btn>
                </v-list-item-action>
                <v-list-item-action>
                  <v-btn icon small @click.stop="removeFileLink(link)">
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
            <v-list dense v-if="signatories && signatories.length">
              <v-list-item v-for="signatory in signatories" :key="signatory.id">
                <v-list-item-content>
                  <v-list-item-title>{{ signatory.signatory_name || signatory.signatory || '-' }}</v-list-item-title>
                  <v-list-item-subtitle v-if="signatory.signed_at">
                    {{ formatDate(signatory.signed_at) }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle v-if="signatory.comment">
                    {{ signatory.comment }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon small @click="confirmRemoveSignatory(signatory)">
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
            <v-timeline dense v-if="workflowHistory && workflowHistory.length">
              <v-timeline-item
                v-for="(history, index) in workflowHistory"
                :key="index"
                :color="getHistoryStateColor(history)"
                small
              >
                <template v-slot:opposite>
                  <span class="caption">{{ formatDate(history.timestamp) }}</span>
                </template>
                <v-card flat>
                  <v-card-title class="subtitle-2">
                    {{ history.state_name || history.state || 'Изменение' }}
                  </v-card-title>
                  <v-card-text>
                    <div v-if="history.actor_name || history.actor">
                      <strong>Кто:</strong> {{ history.actor_name || history.actor }}
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
      selectedFileLinkId: null
    }
  },
  computed: {
    ...mapGetters('documentFlow', ['getCurrentDocument']),
    document() {
      return this.getCurrentDocument
    },
    fileLinks() {
      return this.document && Array.isArray(this.document.files) ? this.document.files : []
    },
    signatories() {
      return this.document && Array.isArray(this.document.signatories) ? this.document.signatories : []
    },
    workflowHistory() {
      return this.document && Array.isArray(this.document.workflow_history) ? this.document.workflow_history : []
    },
    selectedFilePdfUrl() {
      if (!this.fileLinks || !this.fileLinks.length) {
        return null
      }
      const link = this.selectedFileLinkId
        ? this.fileLinks.find(f => f.id === this.selectedFileLinkId)
        : this.fileLinks[0]
      return link && link.file_mime_type === 'application/pdf' ? link.file_url : null
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
        if (this.fileLinks && this.fileLinks.length) {
          this.selectedFileLinkId = this.fileLinks[0].id
        }
      } catch (error) {
        console.error('Error loading document:', error)
        this.$store.commit('snackbar/showSnackbar', {
          message: 'Ошибка при загрузке документа',
          color: 'error'
        })
      }
    },
    selectFileLink(link) {
      this.selectedFileLinkId = link.id
    },
    async removeFileLink(link) {
      if (confirm('Удалить этот файл из документа?')) {
        try {
          await this.removeFilesFromDocument({
            documentId: this.document.id,
            fileIds: [link.file_id || link.id]
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
    async confirmRemoveSignatory(signatory) {
      if (confirm('Удалить этого подписанта?')) {
        try {
          await this.removeSignatory({
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
    getStateColor(stateName) {
      if (!stateName) return 'grey'
      const stateStr = String(stateName).toLowerCase()
      if (stateStr.includes('черновик')) return 'grey'
      if (stateStr.includes('рассмотрении')) return 'orange'
      if (stateStr.includes('подписан')) return 'green'
      if (stateStr.includes('отправлен')) return 'blue'
      if (stateStr.includes('завершён') || stateStr.includes('завершен')) return 'teal'
      if (stateStr.includes('архив')) return 'brown'
      return 'primary'
    },
    getHistoryStateColor(history) {
      const stateName = history.state_name || history.state
      return this.getStateColor(stateName)
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
