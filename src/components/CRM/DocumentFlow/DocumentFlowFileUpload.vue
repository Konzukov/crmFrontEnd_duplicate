<template>
  <v-dialog v-model="value" fullscreen persistent>
    <v-card class="fullscreen-dialog">
      <v-card-title class="headline primary white--text py-2">
        <v-icon left color="white">mdi-file-document-multiple</v-icon>
        Создание документов
        <v-spacer></v-spacer>
        <v-btn icon dark @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-3" style="height: calc(100vh - 120px); overflow-y: auto;">
        <v-row style="height: 100%;">
          <!-- Левая колонка - Форма документа -->
          <v-col cols="5" style="height: 100%; display: flex; flex-direction: column;">
            <!-- Форма документа -->
            <v-card outlined class="mb-2 flex-grow-0">
              <v-card-title class="subtitle-1 py-2">
                <v-icon left small>mdi-file-document-edit</v-icon>
                {{ activeDocumentIndex !== null ? 'Редактирование документа' : 'Данные документа' }}
                <v-spacer></v-spacer>
                <v-btn
                    v-if="activeDocumentIndex !== null"
                    icon
                    small
                    @click="cancelEdit"
                    title="Отменить редактирование"
                >
                  <v-icon small>mdi-close</v-icon>
                </v-btn>
              </v-card-title>
              <v-card-text class="pa-3">
                <v-form ref="documentForm" v-model="currentDocumentValid">
                  <v-row dense>
                    <v-col cols="12" class="pb-1">
                      <v-text-field
                          outlined
                          dense
                          v-model="currentDocument.title"
                          label="Название *"
                          :rules="[v => !!v || 'Обязательно']"
                          hide-details
                      ></v-text-field>
                    </v-col>

                    <v-col cols="6" class="pb-1">
                      <v-select
                          outlined
                          dense
                          v-model="currentDocument.direction"
                          :items="directionOptions"
                          label="Тип *"
                          :rules="[v => !!v || 'Обязательно']"
                          hide-details
                      ></v-select>
                    </v-col>

                    <v-col cols="6" class="pb-1">
                      <v-select
                          outlined
                          dense
                          v-model="currentDocument.document_type"
                          :items="documentTypes"
                          item-text="name"
                          item-value="id"
                          label="Вид"
                          hide-details
                      ></v-select>
                    </v-col>

                    <v-col cols="12" class="pb-1">
                      <v-autocomplete
                          outlined
                          dense
                          v-model="currentDocument.executor"
                          :items="executors"
                          item-text="full_name"
                          item-value="id"
                          label="Исполнитель *"
                          :rules="[v => !!v || 'Обязательно']"
                          hide-details
                      ></v-autocomplete>
                    </v-col>

                    <v-col cols="12" class="pb-1">
                      <v-text-field
                          outlined
                          dense
                          v-model="currentDocument.out_number"
                          label="Номер"
                          hide-details
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" class="pb-1">
                      <v-textarea
                          outlined
                          dense
                          v-model="currentDocument.description"
                          label="Описание"
                          rows="1"
                          auto-grow
                          hide-details
                      ></v-textarea>
                    </v-col>

                    <v-col cols="6" class="pb-1">
                      <v-autocomplete
                          outlined
                          dense
                          v-model="currentDocument.project"
                          :items="projects"
                          item-text="name"
                          item-value="id"
                          label="Проект"
                          clearable
                          hide-details
                      ></v-autocomplete>
                    </v-col>

                    <v-col cols="6" class="pb-1">
                      <v-autocomplete
                          outlined
                          dense
                          v-model="currentDocument.issuer_legal"
                          :items="legalEntities"
                          item-text="name"
                          item-value="id"
                          label="Организация"
                          clearable
                          hide-details
                      ></v-autocomplete>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
              <v-card-actions class="pa-2">
                <v-spacer></v-spacer>
                <v-btn
                    v-if="activeDocumentIndex === null"
                    color="primary"
                    small
                    @click="addDocument"
                    :disabled="!currentDocumentValid"
                >
                  <v-icon left small>mdi-plus</v-icon>
                  Добавить
                </v-btn>
                <v-btn
                    v-else
                    color="primary"
                    small
                    @click="updateDocument"
                    :disabled="!currentDocumentValid"
                >
                  <v-icon left small>mdi-content-save</v-icon>
                  Сохранить
                </v-btn>
              </v-card-actions>
            </v-card>

            <!-- Список добавленных документов -->
            <v-card outlined class="flex-grow-1" style="min-height: 200px;">
              <v-card-title class="subtitle-1 py-2">
                <v-icon left small>mdi-format-list-bulleted</v-icon>
                Документы ({{ documents.length }})
              </v-card-title>
              <v-card-text class="pa-1" style="height: calc(100% - 60px); overflow-y: auto;">
                <v-list dense class="py-0">
                  <v-list-item
                      v-for="(doc, index) in documents"
                      :key="index"
                      :class="{ 'active-document': activeDocumentIndex === index, 'editing-document': isEditing && activeDocumentIndex === index }"
                      @click="setActiveDocument(index)"
                      class="px-2"
                      style="min-height: 48px;"
                  >
                    <v-list-item-icon class="mr-2" style="min-width: 32px;">
                      <v-icon small :color="isEditing && activeDocumentIndex === index ? 'primary' : ''">
                        {{ isEditing && activeDocumentIndex === index ? 'mdi-pencil' : 'mdi-file-document' }}
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content class="py-1">
                      <div class="text-caption font-weight-medium text-truncate">
                        {{ doc.title }}
                        <v-chip v-if="isEditing && activeDocumentIndex === index" x-small color="primary"
                                text-color="white" class="ml-1">
                          редактируется
                        </v-chip>
                      </div>
                      <div class="text-caption text--secondary">
                        {{ getDirectionText(doc.direction) }} •
                        {{ getExecutorName(doc.executor) }} •
                        {{ doc.files.length }} файл.
                      </div>
                    </v-list-item-content>
                    <v-list-item-action class="ma-0 ml-2">
                      <v-btn icon x-small @click.stop="removeDocument(index)">
                        <v-icon color="error" x-small>mdi-close</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>

                  <v-list-item v-if="documents.length === 0" class="px-2">
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-center grey--text text-caption py-2">
                        Нет документов
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Правая колонка - Файлы -->
          <v-col cols="7" style="height: 100%; display: flex; flex-direction: column;">
            <v-card outlined class="flex-grow-1">
              <v-card-title class="subtitle-1 py-2">
                <v-icon left small>mdi-paperclip</v-icon>
                Файлы документа
                <v-spacer></v-spacer>
                <span v-if="activeDocumentIndex !== null" class="text-caption">
                  {{ getActiveDocumentTitle() }}
                </span>
              </v-card-title>
              <v-card-text class="pa-2" style="height: calc(100% - 60px); overflow-y: auto;">
                <div v-if="activeDocumentIndex === null" class="text-center grey--text py-8">
                  <v-icon class="mb-1">mdi-file-document</v-icon>
                  <div class="text-caption">Выберите документ для управления файлами</div>
                </div>

                <div v-else style="height: 100%;">
                  <!-- Упрощенное управление файлами - все в одном интерфейсе -->
                  <v-card outlined class="mb-2">
                    <v-card-title class="subtitle-2 py-2">
                      <v-icon left small>mdi-plus</v-icon>
                      Добавить файлы к документу
                    </v-card-title>
                    <v-card-text class="pa-3">
                      <!-- Область для перетаскивания файлов -->
                      <div
                          class="drag-area"
                          :class="{ 'dragging': isDragging }"
                          @click="$refs.fileInput.click()"
                          @dragover.prevent="isDragging = true"
                          @dragleave="isDragging = false"
                          @drop="onDrop"
                      >
                        <v-icon large color="primary">mdi-cloud-upload</v-icon>
                        <div>Перетащите файлы сюда или нажмите для выбора</div>
                        <div class="instructions">Файлы будут сразу добавлены к документу</div>
                      </div>

                      <input
                          type="file"
                          ref="fileInput"
                          multiple
                          style="display: none"
                          @change="onFileInputChange"
                      >

                      <!-- Быстрый выбор существующих файлов -->
                      <v-expansion-panels flat class="mt-3">
                        <v-expansion-panel>
                          <v-expansion-panel-header class="py-2">
                            <v-icon small left>mdi-folder</v-icon>
                            Выбрать из существующих файлов
                          </v-expansion-panel-header>
                          <v-expansion-panel-content class="pa-2">
                            <v-text-field
                                outlined
                                dense
                                v-model="existingFilesSearch"
                                placeholder="Поиск файлов..."
                                prepend-inner-icon="mdi-magnify"
                                hide-details
                                class="mb-2"
                            ></v-text-field>

                            <v-data-table
                                v-model="selectedExistingFiles"
                                :headers="existingFileHeaders"
                                :items="filteredExistingFiles"
                                show-select
                                dense
                                hide-default-footer
                                :items-per-page="5"
                                class="elevation-1"
                            >
                              <template v-slot:item.file_type="{ item }">
                                <v-icon :color="getFileTypeIcon(item.file_type).color" small>
                                  {{ getFileTypeIcon(item.file_type).icon }}
                                </v-icon>
                              </template>

                              <template v-slot:item.actions="{ item }">
                                <v-btn
                                    color="primary"
                                    x-small
                                    @click="addSingleExistingFile(item)"
                                >
                                  <v-icon x-small>mdi-plus</v-icon>
                                </v-btn>
                              </template>
                            </v-data-table>

                            <v-card-actions class="pa-0 mt-2">
                              <v-spacer></v-spacer>
                              <v-btn
                                  color="primary"
                                  small
                                  @click="addSelectedExistingFiles"
                                  :disabled="selectedExistingFiles.length === 0"
                              >
                                <v-icon small left>mdi-plus</v-icon>
                                Добавить выбранные
                              </v-btn>
                            </v-card-actions>
                          </v-expansion-panel-content>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </v-card-text>
                  </v-card>

                  <!-- Файлы текущего документа -->
                  <v-card outlined class="mt-2">
                    <v-card-title class="subtitle-2 py-2">
                      <v-icon left small>mdi-attachment</v-icon>
                      Файлы в документе ({{ getActiveDocumentFiles().length }})
                    </v-card-title>
                    <v-card-text class="pa-2" style="max-height: 400px; overflow-y: auto;">
                      <v-list dense class="py-0">
                        <v-list-item
                            v-for="(file, index) in getActiveDocumentFiles()"
                            :key="file.key"
                            class="px-2"
                            style="min-height: 60px;"
                        >
                          <v-list-item-icon class="mr-2" style="min-width: 32px;">
                            <v-icon :color="getFileTypeIcon(file.fileType).color">
                              {{ getFileTypeIcon(file.fileType).icon }}
                            </v-icon>
                          </v-list-item-icon>
                          <v-list-item-content>
                            <div class="text-body-2 font-weight-medium">
                              {{ file.name }}
                            </div>
                            <div class="d-flex mt-1">
                              <v-text-field
                                  outlined
                                  dense
                                  v-model="file.pageRange"
                                  placeholder="Диапазон страниц"
                                  hide-details
                                  class="mr-2"
                                  style="max-width: 150px;"
                              ></v-text-field>
                              <v-text-field
                                  outlined
                                  dense
                                  v-model="file.description"
                                  placeholder="Описание файла"
                                  hide-details
                                  class="flex-grow-1"
                              ></v-text-field>
                            </div>
                          </v-list-item-content>
                          <v-list-item-action class="ma-0 ml-2">
                            <v-btn icon small @click="removeFileFromDocument(activeDocumentIndex, index)">
                              <v-icon color="error" small>mdi-close</v-icon>
                            </v-btn>
                          </v-list-item-action>
                        </v-list-item>

                        <v-list-item v-if="getActiveDocumentFiles().length === 0" class="px-2">
                          <v-list-item-content>
                            <v-list-item-subtitle class="text-center grey--text py-4">
                              Файлы не добавлены. Перетащите файлы или выберите из существующих.
                            </v-list-item-subtitle>
                          </v-list-item-content>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Компактная панель создания -->
        <v-card outlined class="mt-2">
          <v-card-actions class="pa-2">
            <div class="text-caption">
              <strong>Итого:</strong> {{ documents.length }} док., {{ totalFilesCount }} файл.
            </div>
            <v-spacer></v-spacer>
            <v-btn
                text
                x-small
                @click="closeDialog"
            >
              Отмена
            </v-btn>
            <v-btn
                color="primary"
                small
                :loading="creating"
                @click="createAllDocuments"
                :disabled="documents.length === 0 || isEditing"
            >
              <v-icon left small>mdi-check</v-icon>
              Создать ({{ documents.length }})
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

export default {
  name: 'DocumentCreate',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    currentDocumentValid: false,
    creating: false,
    activeDocumentIndex: null,
    isEditing: false,
    isDragging: false,
    existingFilesSearch: '',

    // Текущий редактируемый документ
    currentDocument: {
      title: '',
      direction: 'internal',
      document_type: null,
      executor: null,
      out_number: '',
      description: '',
      project: null,
      issuer_legal: null,
      issuer_physical: null,
      physical_owner: null,
      legal_owner: null,
      amount: null,
      currency: 'RUB'
    },

    // Массив документов для создания
    documents: [],

    // Файлы
    selectedExistingFiles: [],

    directionOptions: [
      {text: 'Внутренний', value: 'internal'},
      {text: 'Исходящий', value: 'outgoing'},
      {text: 'Входящий', value: 'incoming'}
    ],

    existingFileHeaders: [
      {text: 'Имя файла', value: 'original_name'},
      {text: 'Тип', value: 'file_type', width: '80px'},
      {text: 'Размер', value: 'file_size_display', width: '100px'},
      {text: 'Дата загрузки', value: 'uploaded_at', width: '120px'},
      {text: 'Действия', value: 'actions', width: '80px', sortable: false}
    ]
  }),
  computed: {
    ...mapGetters('documentFlow', ['getFileList', 'getCreateOptions']),
    ...mapGetters(['currentUserData']),

    availableFiles() {
      return this.getFileList
    },

    filteredExistingFiles() {
      if (!this.existingFilesSearch) {
        return this.availableFiles
      }
      const search = this.existingFilesSearch.toLowerCase()
      return this.availableFiles.filter(file =>
          file.original_name.toLowerCase().includes(search)
      )
    },

    currentUser() {
      return this.currentUserData?.[0] || null
    },

    documentTypes() {
      return this.getCreateOptions?.document_types || []
    },

    executors() {
      return this.getCreateOptions?.executors || []
    },

    currentUserExecutor() {
      if (!this.currentUser || !this.executors.length) return null

      const userExecutor = this.executors.find(executor => {
        if (executor.user && executor.user.uuid === this.currentUser.uuid) return true
        if (executor.uuid === this.currentUser.uuid) return true

        const executorFullName = executor.full_name?.toLowerCase()
        const userFullName = `${this.currentUser.first_name} ${this.currentUser.last_name}`.toLowerCase()
        if (executorFullName && executorFullName === userFullName) return true

        return false
      })

      return userExecutor
    },

    projects() {
      return this.getCreateOptions?.projects || []
    },

    legalEntities() {
      return this.getCreateOptions?.legal_entities || []
    },

    totalFilesCount() {
      return this.documents.reduce((total, doc) => total + doc.files.length, 0)
    }
  },
  methods: {
    ...mapActions('documentFlow', ['fetchCreateOptions', 'createDocument', 'uploadDocumentFile']),
    ...mapActions('documentFlow', {fetchFiles: 'fetchFileList'}),

    async init() {
      await this.$store.dispatch('allSystemUser')
      if (!this.getCreateOptions) {
        await this.fetchCreateOptions()
      }
      await this.fetchFiles()
      this.setDefaultExecutor()
    },

    setDefaultExecutor() {
      if (this.currentUserExecutor && !this.currentDocument.executor) {
        this.currentDocument.executor = this.currentUserExecutor.id
      }
    },

    // Управление документами
    addDocument() {
      const newDocument = {
        ...this.currentDocument,
        files: [],
        id: Date.now()
      }

      this.documents.push(newDocument)
      this.resetCurrentDocument()

      // Показываем уведомление
      this.$store.dispatch('snackbar/showSnackbar', {
        text: `Документ "${newDocument.title}" добавлен`,
        color: 'success'
      }, {root: true})
    },

    // Редактирование документа
    setActiveDocument(index) {
      if (this.activeDocumentIndex === index && this.isEditing) {
        return
      }

      this.activeDocumentIndex = index
      this.isEditing = true

      // Загружаем данные выбранного документа в форму
      const selectedDoc = this.documents[index]
      this.currentDocument = {
        title: selectedDoc.title,
        direction: selectedDoc.direction,
        document_type: selectedDoc.document_type,
        executor: selectedDoc.executor,
        out_number: selectedDoc.out_number,
        description: selectedDoc.description,
        project: selectedDoc.project,
        issuer_legal: selectedDoc.issuer_legal,
        issuer_physical: selectedDoc.issuer_physical,
        physical_owner: selectedDoc.physical_owner,
        legal_owner: selectedDoc.legal_owner,
        amount: selectedDoc.amount,
        currency: selectedDoc.currency
      }
    },

    // Обновление документа
    updateDocument() {
      if (this.activeDocumentIndex === null) return

      // Обновляем документ в массиве
      this.documents[this.activeDocumentIndex] = {
        ...this.documents[this.activeDocumentIndex],
        ...this.currentDocument
      }

      // Выходим из режима редактирования
      this.cancelEdit()

      this.$store.dispatch('snackbar/showSnackbar', {
        text: `Документ "${this.currentDocument.title}" обновлен`,
        color: 'success'
      }, {root: true})
    },

    // Отмена редактирования
    cancelEdit() {
      this.isEditing = false
      this.activeDocumentIndex = null
      this.resetCurrentDocument()
    },

    removeDocument(index) {
      const docTitle = this.documents[index].title

      // Если удаляем редактируемый документ, сбрасываем режим редактирования
      if (this.activeDocumentIndex === index) {
        this.cancelEdit()
      }

      this.documents.splice(index, 1)

      // Корректируем активный индекс после удаления
      if (this.activeDocumentIndex > index) {
        this.activeDocumentIndex--
      } else if (this.activeDocumentIndex === index) {
        this.activeDocumentIndex = null
      }

      this.$store.dispatch('snackbar/showSnackbar', {
        text: `Документ "${docTitle}" удален`,
        color: 'info'
      }, {root: true})
    },

    resetCurrentDocument() {
      this.currentDocument = {
        title: '',
        direction: 'internal',
        document_type: null,
        executor: this.currentUserExecutor?.id || null,
        out_number: '',
        description: '',
        project: null,
        issuer_legal: null,
        issuer_physical: null,
        physical_owner: null,
        legal_owner: null,
        amount: null,
        currency: 'RUB'
      }

      if (this.$refs.documentForm) {
        this.$refs.documentForm.resetValidation()
      }
    },

    // Управление файлами - новые методы
    onFileInputChange(e) {
      this.addNewFiles(e.target.files)
      e.target.value = ''
    },

    onDrop(e) {
      e.preventDefault()
      this.isDragging = false
      this.addNewFiles(e.dataTransfer.files)
    },

    addNewFiles(fileList) {
      if (this.activeDocumentIndex === null) {
        this.$store.dispatch('snackbar/showSnackbar', {
          text: 'Сначала выберите или создайте документ',
          color: 'warning'
        }, {root: true})
        return
      }

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        // Проверяем, не добавлен ли уже файл с таким именем
        if (!this.documents[this.activeDocumentIndex].files.some(f => f.name === file.name)) {
          const fileData = {
            key: `new_${file.name}_${Date.now()}`,
            type: 'new',
            file: file,
            name: file.name,
            fileType: this.getFileTypeFromName(file.name),
            description: '',
            pageRange: ''
          }

          this.documents[this.activeDocumentIndex].files.push(fileData)
        }
      }

      if (fileList.length > 0) {
        this.$store.dispatch('snackbar/showSnackbar', {
          text: `Добавлено ${fileList.length} файлов к документу`,
          color: 'success'
        }, {root: true})
      }
    },

    addSingleExistingFile(file) {
      if (this.activeDocumentIndex === null) {
        this.$store.dispatch('snackbar/showSnackbar', {
          text: 'Сначала выберите или создайте документ',
          color: 'warning'
        }, {root: true})
        return
      }

      const fileData = {
        key: `existing_${file.id}_${Date.now()}`,
        type: 'existing',
        fileId: file.id,
        name: file.original_name,
        fileType: file.file_type,
        description: '',
        pageRange: ''
      }

      this.documents[this.activeDocumentIndex].files.push(fileData)

      this.$store.dispatch('snackbar/showSnackbar', {
        text: `Файл "${file.original_name}" добавлен к документу`,
        color: 'success'
      }, {root: true})
    },

    addSelectedExistingFiles() {
      if (this.activeDocumentIndex === null) return

      this.selectedExistingFiles.forEach(file => {
        this.addSingleExistingFile(file)
      })

      this.selectedExistingFiles = []
    },

    removeFileFromDocument(docIndex, fileIndex) {
      const fileName = this.documents[docIndex].files[fileIndex].name
      this.documents[docIndex].files.splice(fileIndex, 1)

      this.$store.dispatch('snackbar/showSnackbar', {
        text: `Файл "${fileName}" удален из документа`,
        color: 'info'
      }, {root: true})
    },

    getActiveDocumentFiles() {
      return this.activeDocumentIndex !== null ?
          this.documents[this.activeDocumentIndex].files : []
    },

    getActiveDocumentTitle() {
      return this.activeDocumentIndex !== null ?
          this.documents[this.activeDocumentIndex].title : ''
    },

    getDocumentFilesCount(index) {
      return this.documents[index].files.length
    },

    // Вспомогательные методы
    getFileTypeIcon(fileType) {
      const fileTypeIcons = {
        DOCX: {icon: 'mdi-file-word', color: 'blue darken-2'},
        PDF: {icon: 'mdi-file-pdf-box', color: 'red darken-2'},
        SIGN: {icon: 'mdi-certificate', color: 'green darken-2'},
        OTHER: {icon: 'mdi-file', color: 'grey darken-1'}
      }
      return fileTypeIcons[fileType] || fileTypeIcons.OTHER
    },

    getFileTypeFromName(filename) {
      const ext = filename.split('.').pop().toLowerCase()
      const extensionMap = {
        'pdf': 'PDF',
        'docx': 'DOCX',
        'doc': 'DOCX',
        'sig': 'SIGN',
        'p7s': 'SIGN'
      }
      return extensionMap[ext] || 'OTHER'
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    getDirectionText(direction) {
      const option = this.directionOptions.find(opt => opt.value === direction)
      return option ? option.text : direction
    },

    getExecutorName(executorId) {
      const executor = this.executors.find(e => e.id === executorId)
      return executor ? executor.full_name : 'Не указан'
    },

    // Создание документов
    async createAllDocuments() {
      this.creating = true
      try {
        const results = []
        for (const doc of this.documents) {
          try {
            const documentData = {
              title: doc.title,
              direction: doc.direction,
              document_type: doc.document_type,
              executor: doc.executor,
              out_number: doc.out_number,
              description: doc.description,
              project: doc.project,
              issuer_legal: doc.issuer_legal,
              issuer_physical: doc.issuer_physical,
              physical_owner: doc.physical_owner,
              legal_owner: doc.legal_owner,
              amount: doc.amount,
              currency: doc.currency
            }

            const createdDoc = await this.createDocument(documentData)
            await this.processDocumentFiles(createdDoc.id, doc.files)
            results.push({success: true, document: createdDoc})
          } catch (error) {
            console.error('Error creating document:', error)
            results.push({success: false, error, document: doc})
          }
        }

        this.$emit('created', results)
        this.closeDialog()

        const successCount = results.filter(r => r.success).length
        this.$store.dispatch('snackbar/showSnackbar', {
          text: `Успешно создано ${successCount} из ${this.documents.length} документов`,
          color: successCount === this.documents.length ? 'success' : 'warning'
        }, {root: true})
      } catch (error) {
        console.error('Error creating documents:', error)
        this.$store.dispatch('snackbar/showSnackbar', {
          text: 'Ошибка при создании документов',
          color: 'error'
        }, {root: true})
      } finally {
        this.creating = false
      }
    },

    async processDocumentFiles(documentId, files) {
      for (const file of files) {
        try {
          if (file.type === 'existing') {
            await this.$store.dispatch('documentFlow/addExistingFileToDocument', {
              documentId: documentId,
              fileId: file.fileId,
              description: file.description,
              page_range: file.pageRange
            })
          } else if (file.type === 'new') {
            await this.uploadDocumentFile({
              documentId: documentId,
              file: file.file,
              description: file.description,
              page_range: file.pageRange
            })
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error)
        }
      }
    },

    closeDialog() {
      this.$emit('input', false)
      this.resetAll()
    },

    resetAll() {
      this.documents = []
      this.activeDocumentIndex = null
      this.isEditing = false
      this.isDragging = false
      this.existingFilesSearch = ''
      this.resetCurrentDocument()
      this.selectedExistingFiles = []
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.init()
        }
      }
    }
  }
}
</script>

<style scoped>
.fullscreen-dialog {
  height: 100vh;
}

.active-document {
  background-color: #e3f2fd;
  border-left: 3px solid #1976d2;
}

.editing-document {
  background-color: #fff8e1;
  border-left: 3px solid #ffa000;
}

.v-list-item {
  cursor: pointer;
}

.v-list-item:hover {
  background-color: #f5f5f5;
}

.drag-area {
  border: 2px dashed #1976d2;
  border-radius: 4px;
  padding: 40px;
  text-align: center;
  transition: all 0.3s;
  background-color: #e3f2fd;
  cursor: pointer;
}

.drag-area.dragging {
  background-color: #bbdefb;
  border-color: #0d47a1;
}

.instructions {
  margin-top: 8px;
  font-size: 14px;
  color: #616161;
}
</style>