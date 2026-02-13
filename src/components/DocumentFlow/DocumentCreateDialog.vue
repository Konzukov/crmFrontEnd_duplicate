<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Создание документов</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn dark text @click="createAllDocuments" :loading="creating">
            <v-icon left>mdi-check</v-icon>
            Создать все документы ({{ documentQueue.length }})
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-container fluid class="fill-height pa-0">
        <v-row no-gutters class="fill-height">
          <!-- Column 1: File Pool (33%) -->
          <v-col cols="4" class="file-pool-column">
            <v-card flat class="fill-height d-flex flex-column">
              <v-card-title class="subtitle-1 py-2">
                <v-icon left small>mdi-file-multiple</v-icon>
                Пул файлов
              </v-card-title>
              
              <v-tabs v-model="fileTab" grow>
                <v-tab>Загружаемые</v-tab>
                <v-tab>Система</v-tab>
              </v-tabs>

              <v-card-text class="flex-grow-1 overflow-y-auto pa-2">
                <v-tabs-items v-model="fileTab" class="fill-height">
                  <!-- New Files Tab -->
                  <v-tab-item class="fill-height">
                    <v-file-input
                      v-model="newFiles"
                      label="Перетащите файлы сюда или выберите"
                      multiple
                      outlined
                      dense
                      prepend-icon="mdi-paperclip"
                      @change="onFilesSelected"
                      class="mb-2"
                    ></v-file-input>

                    <v-list dense>
                      <v-list-item
                        v-for="(file, index) in uploadedFiles"
                        :key="'new-' + index"
                        @click="addFileToDocument(file, 'new')"
                        :class="{'primary lighten-4': isFileInDocument(file, 'new')}"
                      >
                        <v-list-item-avatar>
                          <v-img
                            v-if="isImage(file)"
                            :src="getFilePreview(file)"
                            max-height="40"
                            max-width="40"
                          ></v-img>
                          <v-icon v-else>{{ getFileIcon(file.type) }}</v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>{{ file.name }}</v-list-item-title>
                          <v-list-item-subtitle>{{ formatFileSize(file.size) }}</v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-icon small @click.stop="removeNewFile(index)">mdi-delete</v-icon>
                        </v-list-item-action>
                      </v-list-item>
                    </v-list>
                  </v-tab-item>

                  <!-- System Files Tab -->
                  <v-tab-item class="fill-height">
                    <v-text-field
                      v-model="fileSearch"
                      label="Поиск файлов"
                      outlined
                      dense
                      prepend-inner-icon="mdi-magnify"
                      clearable
                      class="mb-2"
                    ></v-text-field>

                    <v-list dense>
                      <v-list-item
                        v-for="file in filteredSystemFiles"
                        :key="'sys-' + file.id"
                        @click="addFileToDocument(file, 'existing')"
                        :class="{'primary lighten-4': isFileInDocument(file, 'existing')}"
                      >
                        <v-list-item-avatar>
                          <v-icon>{{ getFileIcon(file.mime_type) }}</v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>{{ file.original_name }}</v-list-item-title>
                          <v-list-item-subtitle>{{ file.file_size_display || formatFileSize(file.file_size) }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-tab-item>
                </v-tabs-items>
              </v-card-text>
            </v-card>
          </v-col>

          <v-divider vertical></v-divider>

          <!-- Column 2: Document Form (33%) -->
          <v-col cols="4" class="document-form-column">
            <v-card flat class="fill-height d-flex flex-column">
              <v-card-title class="subtitle-1 py-2">
                <v-icon left small>mdi-file-document-edit</v-icon>
                Форма документа
              </v-card-title>

              <v-card-text class="flex-grow-1 overflow-y-auto pa-4">
                <v-form ref="documentForm" v-model="formValid">
                  <!-- Required Fields -->
                  <v-text-field
                    v-model="currentDocument.title"
                    label="Название *"
                    outlined
                    dense
                    :rules="[v => !!v || 'Обязательное поле']"
                  ></v-text-field>

                  <v-select
                    v-model="currentDocument.direction"
                    :items="directionOptions"
                    label="Направление *"
                    outlined
                    dense
                    :rules="[v => !!v || 'Обязательное поле']"
                  ></v-select>

                  <v-autocomplete
                    v-model="currentDocument.executor"
                    :items="executors"
                    item-text="name"
                    item-value="id"
                    label="Исполнитель *"
                    outlined
                    dense
                    :rules="[v => !!v || 'Обязательное поле']"
                  ></v-autocomplete>

                  <!-- Additional Fields Toggle -->
                  <v-btn
                    text
                    color="primary"
                    small
                    @click="showAdditionalFields = !showAdditionalFields"
                    class="mb-2"
                  >
                    <v-icon left small>{{ showAdditionalFields ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                    Дополнительные поля
                  </v-btn>

                  <div v-show="showAdditionalFields">
                    <v-select
                      v-model="currentDocument.document_type"
                      :items="documentTypes"
                      item-text="name"
                      item-value="id"
                      label="Тип документа"
                      outlined
                      dense
                      clearable
                    ></v-select>

                    <v-text-field
                      v-model="currentDocument.out_number"
                      label="Исходящий номер"
                      outlined
                      dense
                    ></v-text-field>

                    <v-textarea
                      v-model="currentDocument.description"
                      label="Описание"
                      outlined
                      dense
                      rows="3"
                    ></v-textarea>

                    <v-autocomplete
                      v-model="currentDocument.project"
                      :items="projects"
                      item-text="name"
                      item-value="id"
                      label="Проект"
                      outlined
                      dense
                      clearable
                    ></v-autocomplete>

                    <v-autocomplete
                      v-model="currentDocument.issuer_legal"
                      :items="legalEntities"
                      item-text="name"
                      item-value="id"
                      label="Издатель (юр. лицо)"
                      outlined
                      dense
                      clearable
                    ></v-autocomplete>

                    <v-autocomplete
                      v-model="currentDocument.issuer_physical"
                      :items="executors"
                      item-text="name"
                      item-value="id"
                      label="Издатель (физ. лицо)"
                      outlined
                      dense
                      clearable
                    ></v-autocomplete>

                    <v-autocomplete
                      v-model="currentDocument.owner_physical"
                      :items="executors"
                      item-text="name"
                      item-value="id"
                      label="Владелец (физ. лицо)"
                      outlined
                      dense
                      clearable
                    ></v-autocomplete>

                    <v-autocomplete
                      v-model="currentDocument.owner_legal"
                      :items="legalEntities"
                      item-text="name"
                      item-value="id"
                      label="Владелец (юр. лицо)"
                      outlined
                      dense
                      clearable
                    ></v-autocomplete>

                    <v-text-field
                      v-model.number="currentDocument.amount"
                      label="Сумма"
                      outlined
                      dense
                      type="number"
                    ></v-text-field>

                    <v-select
                      v-model="currentDocument.currency"
                      :items="currencyOptions"
                      label="Валюта"
                      outlined
                      dense
                    ></v-select>
                  </div>

                  <!-- Files in Document -->
                  <v-divider class="my-4"></v-divider>
                  <div class="subtitle-2 mb-2">Файлы в документе ({{ currentDocument.files.length }})</div>
                  
                  <v-list dense>
                    <v-list-item v-for="(fileItem, idx) in currentDocument.files" :key="'doc-file-' + idx">
                      <v-list-item-avatar size="32">
                        <v-icon small>mdi-file</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title>{{ getFileName(fileItem) }}</v-list-item-title>
                        <v-text-field
                          v-model="fileItem.description"
                          label="Описание файла"
                          dense
                          outlined
                          hide-details
                          class="mt-1"
                        ></v-text-field>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-btn icon small @click="removeFileFromDocument(idx)">
                          <v-icon small>mdi-delete</v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </v-list-item>
                  </v-list>

                  <v-btn
                    block
                    color="primary"
                    @click="addDocumentToQueue"
                    :disabled="!formValid"
                    class="mt-4"
                  >
                    <v-icon left>mdi-plus</v-icon>
                    Добавить документ
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>

          <v-divider vertical></v-divider>

          <!-- Column 3: Document Queue (33%) -->
          <v-col cols="4" class="document-queue-column">
            <v-card flat class="fill-height d-flex flex-column">
              <v-card-title class="subtitle-1 py-2">
                <v-icon left small>mdi-format-list-checks</v-icon>
                Документы для создания ({{ documentQueue.length }})
              </v-card-title>

              <v-card-text class="flex-grow-1 overflow-y-auto pa-2">
                <v-list dense>
                  <v-list-item
                    v-for="(doc, idx) in documentQueue"
                    :key="'queue-' + idx"
                    class="mb-2 elevation-1"
                  >
                    <v-list-item-content>
                      <v-list-item-title class="font-weight-bold">{{ doc.title }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip x-small :color="getDirectionColor(doc.direction)" class="mr-1">
                          {{ getDirectionText(doc.direction) }}
                        </v-chip>
                        <span class="caption">{{ getExecutorName(doc.executor) }}</span>
                      </v-list-item-subtitle>
                      <div class="mt-1">
                        <v-chip
                          x-small
                          v-for="(file, fidx) in doc.files.slice(0, 2)"
                          :key="'qf-' + fidx"
                          class="mr-1"
                        >
                          {{ getFileName(file) }}
                        </v-chip>
                        <span v-if="doc.files.length > 2" class="caption">+{{ doc.files.length - 2 }} ещё</span>
                      </div>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn icon small @click="editDocumentInQueue(idx)">
                        <v-icon small>mdi-pencil</v-icon>
                      </v-btn>
                    </v-list-item-action>
                    <v-list-item-action>
                      <v-btn icon small @click="removeDocumentFromQueue(idx)">
                        <v-icon small>mdi-delete</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>

                <div v-if="documentQueue.length === 0" class="text-center grey--text mt-4">
                  Нет документов в очереди
                </div>
              </v-card-text>

              <v-divider></v-divider>
              <v-card-text class="pa-2">
                <div class="subtitle-2">
                  Итого: {{ documentQueue.length }} документов, {{ totalFilesCount }} файлов
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Progress Dialog -->
      <v-dialog v-model="progressDialog" persistent max-width="400">
        <v-card>
          <v-card-title>Создание документов...</v-card-title>
          <v-card-text>
            <v-progress-linear
              :value="(createdCount / documentQueue.length) * 100"
              height="25"
              striped
            >
              {{ createdCount }} / {{ documentQueue.length }}
            </v-progress-linear>
            <div class="mt-2 text-center">{{ progressMessage }}</div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'DocumentCreateDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialog: false,
      fileTab: 0,
      formValid: false,
      showAdditionalFields: false,
      creating: false,
      progressDialog: false,
      createdCount: 0,
      progressMessage: '',
      
      // File management
      newFiles: [],
      uploadedFiles: [],
      fileSearch: '',
      
      // Current document being edited
      currentDocument: this.getEmptyDocument(),
      editingIndex: null,
      
      // Queue of documents to create
      documentQueue: [],
      
      // Options
      directionOptions: [
        { text: 'Внутренний', value: 'internal' },
        { text: 'Исходящий', value: 'outgoing' },
        { text: 'Входящий', value: 'incoming' }
      ],
      currencyOptions: ['RUB', 'USD', 'EUR']
    }
  },
  computed: {
    ...mapGetters('documentFlow', [
      'getFileList',
      'getCreateOptions'
    ]),
    systemFiles() {
      const files = this.getFileList
      return Array.isArray(files) ? files : []
    },
    filteredSystemFiles() {
      if (!this.fileSearch) return this.systemFiles
      const search = this.fileSearch.toLowerCase()
      return this.systemFiles.filter(f => 
        f.original_name && f.original_name.toLowerCase().includes(search)
      )
    },
    executors() {
      const opts = this.getCreateOptions
      return opts && Array.isArray(opts.executors) ? opts.executors : []
    },
    projects() {
      const opts = this.getCreateOptions
      return opts && Array.isArray(opts.projects) ? opts.projects : []
    },
    legalEntities() {
      const opts = this.getCreateOptions
      return opts && Array.isArray(opts.legal_entities) ? opts.legal_entities : []
    },
    documentTypes() {
      const opts = this.getCreateOptions
      return opts && Array.isArray(opts.document_types) ? opts.document_types : []
    },
    totalFilesCount() {
      return this.documentQueue.reduce((sum, doc) => sum + doc.files.length, 0)
    }
  },
  watch: {
    value(val) {
      this.dialog = val
      if (val) {
        this.initDialog()
      }
    },
    dialog(val) {
      this.$emit('input', val)
    }
  },
  methods: {
    ...mapActions('documentFlow', [
      'fetchFileList',
      'fetchCreateOptions',
      'uploadFile',
      'createDocument'
    ]),
    async initDialog() {
      try {
        await Promise.all([
          this.fetchFileList(),
          this.fetchCreateOptions()
        ])
        
        // Auto-fill executor with current user if available
        if (this.executors.length > 0 && !this.currentDocument.executor) {
          const currentUser = this.$store.state.user?.currentUser
          if (currentUser) {
            const matchingExecutor = this.executors.find(e => e.id === currentUser.id)
            if (matchingExecutor) {
              this.currentDocument.executor = matchingExecutor.id
            }
          }
        }
      } catch (error) {
        console.error('Error initializing dialog:', error)
      }
    },
    getEmptyDocument() {
      return {
        title: '',
        direction: 'internal',
        executor: null,
        document_type: null,
        out_number: '',
        description: '',
        project: null,
        issuer_legal: null,
        issuer_physical: null,
        owner_physical: null,
        owner_legal: null,
        amount: null,
        currency: 'RUB',
        files: []
      }
    },
    onFilesSelected(files) {
      if (files && files.length > 0) {
        this.uploadedFiles.push(...files)
      }
    },
    removeNewFile(index) {
      this.uploadedFiles.splice(index, 1)
    },
    addFileToDocument(file, type) {
      const fileItem = {
        file: file,
        type: type,
        description: ''
      }
      this.currentDocument.files.push(fileItem)
    },
    removeFileFromDocument(index) {
      this.currentDocument.files.splice(index, 1)
    },
    isFileInDocument(file, type) {
      return this.currentDocument.files.some(f => {
        if (type === 'new') {
          return f.file === file && f.type === 'new'
        } else {
          return f.file.id === file.id && f.type === 'existing'
        }
      })
    },
    addDocumentToQueue() {
      if (!this.formValid) return
      
      const docCopy = JSON.parse(JSON.stringify(this.currentDocument))
      
      if (this.editingIndex !== null) {
        this.documentQueue[this.editingIndex] = docCopy
        this.editingIndex = null
      } else {
        this.documentQueue.push(docCopy)
      }
      
      this.currentDocument = this.getEmptyDocument()
      this.$refs.documentForm.resetValidation()
    },
    editDocumentInQueue(index) {
      this.currentDocument = JSON.parse(JSON.stringify(this.documentQueue[index]))
      this.editingIndex = index
    },
    removeDocumentFromQueue(index) {
      this.documentQueue.splice(index, 1)
    },
    async createAllDocuments() {
      if (this.documentQueue.length === 0) return
      
      this.creating = true
      this.progressDialog = true
      this.createdCount = 0
      
      const errors = []
      
      for (let i = 0; i < this.documentQueue.length; i++) {
        const doc = this.documentQueue[i]
        this.progressMessage = `Создание документа "${doc.title}"...`
        
        try {
          // First, upload new files
          const uploadedFileIds = []
          for (const fileItem of doc.files) {
            if (fileItem.type === 'new') {
              const formData = new FormData()
              formData.append('file', fileItem.file)
              formData.append('original_name', fileItem.file.name)
              if (fileItem.description) {
                formData.append('description', fileItem.description)
              }
              
              const result = await this.uploadFile({ formData })
              if (result.data && result.data.id) {
                uploadedFileIds.push(result.data.id)
              }
            } else {
              uploadedFileIds.push(fileItem.file.id)
            }
          }
          
          // Create document
          const docData = {
            title: doc.title,
            direction: doc.direction,
            executor: doc.executor,
            document_type: doc.document_type,
            out_number: doc.out_number,
            description: doc.description,
            project: doc.project,
            issuer_legal: doc.issuer_legal,
            issuer_physical: doc.issuer_physical,
            owner_physical: doc.owner_physical,
            owner_legal: doc.owner_legal,
            amount: doc.amount,
            currency: doc.currency,
            existing_files: uploadedFileIds
          }
          
          await this.createDocument(docData)
          this.createdCount++
        } catch (error) {
          console.error('Error creating document:', error)
          errors.push({ title: doc.title, error })
        }
      }
      
      this.progressDialog = false
      this.creating = false
      
      if (errors.length === 0) {
        this.$emit('created')
        this.closeDialog()
      } else {
        alert(`Создано ${this.createdCount} из ${this.documentQueue.length} документов. Ошибки: ${errors.length}`)
      }
    },
    closeDialog() {
      this.documentQueue = []
      this.currentDocument = this.getEmptyDocument()
      this.uploadedFiles = []
      this.editingIndex = null
      this.dialog = false
    },
    getFileName(fileItem) {
      if (fileItem.type === 'new') {
        return fileItem.file.name
      } else {
        return fileItem.file.original_name || fileItem.file.name || 'Файл'
      }
    },
    getExecutorName(executorId) {
      const executor = this.executors.find(e => e.id === executorId)
      return executor ? executor.name : '-'
    },
    getDirectionText(direction) {
      const item = this.directionOptions.find(d => d.value === direction)
      return item ? item.text : direction
    },
    getDirectionColor(direction) {
      const colors = {
        incoming: 'blue',
        outgoing: 'green',
        internal: 'orange'
      }
      return colors[direction] || 'grey'
    },
    isImage(file) {
      return file.type && file.type.startsWith('image/')
    },
    getFilePreview(file) {
      return URL.createObjectURL(file)
    },
    getFileIcon(mimeType) {
      if (!mimeType) return 'mdi-file'
      if (mimeType.includes('pdf')) return 'mdi-file-pdf-box'
      if (mimeType.includes('word') || mimeType.includes('document')) return 'mdi-file-word'
      if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'mdi-file-excel'
      if (mimeType.includes('image')) return 'mdi-file-image'
      if (mimeType.includes('zip') || mimeType.includes('archive')) return 'mdi-zip-box'
      return 'mdi-file'
    },
    formatFileSize(bytes) {
      if (!bytes) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.file-pool-column,
.document-form-column,
.document-queue-column {
  max-height: calc(100vh - 64px);
  overflow: hidden;
}

.fill-height {
  height: 100%;
}

.overflow-y-auto {
  overflow-y: auto;
}

.flex-grow-1 {
  flex-grow: 1;
}
</style>
