<template>
  <v-dialog v-model="value" fullscreen persistent>
    <v-card class="fullscreen-dialog d-flex flex-column">
      <v-card-title class="headline primary white--text py-2 flex-grow-0">
        <v-icon left color="white">mdi-file-document-multiple</v-icon>
        Создание документов
        <v-spacer></v-spacer>
        <v-btn icon dark @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-3 flex-grow-1" style="overflow: hidden;">
        <v-row style="height: 100%;">
          <!-- Левая колонка - Пул файлов и файлы системы -->
          <v-col cols="4" style="height: 100%;">
            <v-card outlined class="d-flex flex-column" style="height: 100%;">
              <v-card-title class="subtitle-1 py-2 flex-grow-0">
                <v-icon left small>mdi-paperclip</v-icon>
                Файлы
              </v-card-title>

              <v-card-text class="pa-0 flex-grow-1 d-flex flex-column" style="overflow: hidden;">
                <!-- Вкладки -->
                <v-tabs v-model="activeTab" grow class="flex-grow-0">
                  <v-tab>
                    <v-icon left small>mdi-format-list-bulleted</v-icon>
                    Загружаемые файлы
                    <v-chip x-small class="ml-1">{{ filePool.length }}</v-chip>
                  </v-tab>
                  <v-tab>
                    <v-icon left small>mdi-folder</v-icon>
                    Файлы системы
                  </v-tab>
                </v-tabs>

                <!-- Контент вкладок -->
                <div class="flex-grow-1 d-flex flex-column" style="overflow: hidden;">
                  <!-- Вкладка 1: Пул файлов -->
                  <div v-if="activeTab === 0" class="d-flex flex-column flex-grow-1" style="overflow: hidden;">
                    <div class="pa-2 flex-grow-1 d-flex flex-column" style="overflow: hidden;">
                      <!-- Drag & Drop область -->
                      <div
                          class="drag-area mb-3"
                          :class="{ 'dragging': isDragging }"
                          @click="$refs.fileInput.click()"
                          @dragover.prevent="isDragging = true"
                          @dragleave="isDragging = false"
                          @drop="onDrop"
                      >
                        <v-icon large color="primary">mdi-cloud-upload</v-icon>
                        <div>Перетащите файлы сюда или нажмите для выбора</div>
                        <div class="instructions">Файлы будут добавлены в общий пул</div>
                      </div>

                      <input
                          type="file"
                          ref="fileInput"
                          multiple
                          style="display: none"
                          @change="onFileInputChange"
                      >

                      <!-- Заголовок и кнопка очистки -->
                      <div class="d-flex align-center mb-2">
                        <span class="subtitle-2">Загружаемые файлы</span>
                        <v-spacer></v-spacer>
                        <v-btn
                            v-if="filePool.length > 0"
                            icon
                            small
                            @click="clearFilePool"
                            title="Очистить пул файлов"
                        >
                          <v-icon small>mdi-delete-sweep</v-icon>
                        </v-btn>
                      </div>

                      <!-- Список файлов в пуле -->
                      <div class="flex-grow-1" style="overflow-y: auto;">
                        <v-list dense class="py-0">
                          <v-list-item
                              v-for="(file, index) in filePool"
                              :key="file.key"
                              class="px-2"
                              style="min-height: 48px;"
                              @click="addFileToDocument(file)"
                          >
                            <v-list-item-icon class="mr-2" style="min-width: 32px;">
                              <v-icon :color="getFileTypeIcon(file.fileType).color" small>
                                {{ getFileTypeIcon(file.fileType).icon }}
                              </v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                              <div class="text-caption font-weight-medium text-truncate">
                                {{ file.name }}
                                <v-chip v-if="isFileInCurrentDocument(file)" x-small color="primary" text-color="white"
                                        class="ml-1">
                                  в документе
                                </v-chip>
                              </div>
                              <div class="text-caption text--secondary">
                                {{ file.fileSizeDisplay }}
                              </div>
                            </v-list-item-content>
                            <v-list-item-action class="ma-0 ml-1" style="display: flex; align-items: center;">
                              <!-- Кнопка просмотра PDF -->
                              <v-btn
                                  v-if="file.fileType === 'PDF'"
                                  icon
                                  x-small
                                  @click.stop="openPdfViewer(file)"
                                  title="Просмотреть PDF"
                                  class="mr-1"
                              >
                                <v-icon x-small>mdi-eye</v-icon>
                              </v-btn>
                              <v-btn icon x-small @click.stop="removeFileFromPool(index)">
                                <v-icon color="error" x-small>mdi-close</v-icon>
                              </v-btn>
                            </v-list-item-action>
                          </v-list-item>
                        </v-list>
                      </div>
                    </div>
                  </div>

                  <!-- Вкладка 2: Файлы системы -->
                  <div v-if="activeTab === 1" class="d-flex flex-column flex-grow-1" style="overflow: hidden;">
                    <!-- Убрал flex-grow-1 и pa-2 из основного контейнера -->
                    <div class="d-flex flex-column" style="overflow: hidden;">
                      <!-- Поиск по файлам системы -->
                      <div class="pa-2 flex-grow-0"> <!-- Добавил отдельный контейнер для поиска -->
                        <v-text-field
                            outlined
                            dense
                            v-model="systemFilesSearch"
                            placeholder="Поиск файлов..."
                            prepend-inner-icon="mdi-magnify"
                            hide-details
                        ></v-text-field>
                      </div>

                      <!-- Заголовок -->
                      <div class="d-flex align-center px-2 pb-2 flex-grow-0"> <!-- Убрал верхний отступ -->
                        <span class="subtitle-2">Файлы системы</span>
                        <v-spacer></v-spacer>
                        <span class="text-caption text--secondary">
        {{ filteredSystemFiles.length }} файлов
      </span>
                      </div>

                      <!-- Список файлов системы - теперь занимает всё оставшееся пространство -->
                      <div class="flex-grow-1" style="overflow-y: auto;">
                        <v-list dense class="py-0">
                          <v-list-item
                              v-for="file in filteredSystemFiles"
                              :key="file.id"
                              class="px-2"
                              style="min-height: 48px;"
                          >
                            <v-list-item-icon class="mr-2" style="min-width: 32px;">
                              <v-icon :color="getFileTypeIcon(file.file_type).color" small>
                                {{ getFileTypeIcon(file.file_type).icon }}
                              </v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                              <div class="text-caption font-weight-medium text-truncate">
                                {{ file.original_name }}
                              </div>
                              <div class="text-caption text--secondary">
                                {{ file.file_size_display }} • {{ formatDate(file.uploaded_at) }}
                              </div>
                            </v-list-item-content>
                            <v-list-item-action class="ma-0 ml-1">
                              <v-btn
                                  color="primary"
                                  x-small
                                  icon
                                  @click="addSystemFileToPool(file)"
                              >
                                <v-icon x-small>mdi-plus</v-icon>
                              </v-btn>
                            </v-list-item-action>
                          </v-list-item>

                          <v-list-item v-if="filteredSystemFiles.length === 0" class="px-2">
                            <v-list-item-content>
                              <v-list-item-subtitle class="text-center grey--text text-caption py-4">
                                {{ systemFilesSearch ? 'Файлы не найдены' : 'Нет файлов в системе' }}
                              </v-list-item-subtitle>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                      </div>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Центральная колонка - Создание/редактирование документа -->
          <v-col cols="4" style="height: 100%; display: flex; flex-direction: column;">
            <!-- Форма документа -->
            <v-card outlined class="mb-2 flex-grow-0">
              <v-card-title class="subtitle-1 py-2">
                <v-icon left small>mdi-file-document-edit</v-icon>
                {{ isEditing ? 'Редактирование документа' : 'Создание документа' }}
                <v-spacer></v-spacer>
                <v-btn
                    v-if="isEditing"
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
                          item-text="fullName"
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
            </v-card>

            <!-- Файлы для текущего документа -->
            <v-card outlined class="flex-grow-1 d-flex flex-column">
              <v-card-title class="subtitle-1 py-2 flex-grow-0">
                <v-icon left small>mdi-attachment</v-icon>
                Файлы в документе ({{ currentDocument.files.length }})
                <v-spacer></v-spacer>
                <v-btn
                    v-if="currentDocument.files.length > 0"
                    icon
                    small
                    @click="clearAllFilesFromDocument"
                    title="Очистить все файлы"
                >
                  <v-icon small>mdi-delete-sweep</v-icon>
                </v-btn>
              </v-card-title>

              <v-card-text class="pa-2 flex-grow-1" style="overflow-y: auto; min-height: 0;">
                <v-list dense class="py-0">
                  <v-list-item
                      v-for="(file, index) in currentDocument.files"
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
                      <v-btn icon small @click="removeFileFromDocument(index)">
                        <v-icon color="error" small>mdi-close</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>

                  <v-list-item v-if="currentDocument.files.length === 0" class="px-2">
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-center grey--text py-4">
                        Файлы не добавлены. Нажмите на файл в пуле слева, чтобы добавить его в документ.
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>

              <!-- Кнопка создания/сохранения документа -->
              <v-card-actions class="pa-2 flex-grow-0">
                <v-spacer></v-spacer>
                <v-btn
                    v-if="isEditing"
                    text
                    @click="cancelEdit"
                >
                  Отмена
                </v-btn>
                <v-btn
                    color="primary"
                    @click="isEditing ? updateDocument() : addDocument()"
                    :disabled="!currentDocumentValid || currentDocument.files.length === 0"
                >
                  <v-icon left>{{ isEditing ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
                  {{ isEditing ? 'Сохранить изменения' : `Добавить документ (${currentDocument.files.length} файлов)` }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <!-- Правая колонка - Документы для создания -->
          <v-col cols="4" style="height: 100%; display: flex; flex-direction: column;">
            <v-card outlined class="flex-grow-1 d-flex flex-column">
              <v-card-title class="subtitle-1 py-2 flex-grow-0">
                <v-icon left small>mdi-format-list-bulleted</v-icon>
                Документы для создания ({{ documents.length }})
                <v-spacer></v-spacer>
                <v-btn
                    v-if="documents.length > 0"
                    icon
                    small
                    @click="clearAllDocuments"
                    title="Очистить все документы"
                >
                  <v-icon small>mdi-delete-sweep</v-icon>
                </v-btn>
              </v-card-title>

              <v-card-text class="pa-1 flex-grow-1" style="overflow-y: auto;">
                <v-list dense class="py-0">
                  <v-list-item
                      v-for="(doc, index) in documents"
                      :key="doc.id"
                      class="px-2"
                      :class="{ 'active-document': editingIndex === index }"
                      style="min-height: 60px;"
                      @click="editDocument(index)"
                  >
                    <v-list-item-icon class="mr-2" style="min-width: 32px;">
                      <v-icon :color="editingIndex === index ? 'primary' : ''">
                        {{ editingIndex === index ? 'mdi-pencil' : 'mdi-file-document' }}
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <div class="text-caption font-weight-medium">
                        {{ doc.title }}
                        <v-chip v-if="editingIndex === index" x-small color="primary" text-color="white" class="ml-1">
                          редактируется
                        </v-chip>
                      </div>
                      <div class="text-caption text--secondary">
                        {{ getDirectionText(doc.direction) }} •
                        {{ getExecutorName(doc.executor) }}
                      </div>
                      <div class="mt-1">
                        <v-chip
                            v-for="file in doc.files.slice(0, 2)"
                            :key="file.key"
                            x-small
                            class="mr-1 mb-1"
                        >
                          {{ file.name }}
                          <span v-if="file.pageRange" class="ml-1">({{ file.pageRange }})</span>
                        </v-chip>
                        <v-chip
                            v-if="doc.files.length > 2"
                            x-small
                            class="mb-1"
                        >
                          +{{ doc.files.length - 2 }} ещё
                        </v-chip>
                      </div>
                    </v-list-item-content>
                    <v-list-item-action class="ma-0 ml-2">
                      <v-btn icon small @click.stop="removeDocument(index)">
                        <v-icon color="error" small>mdi-close</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>

                  <v-list-item v-if="documents.length === 0" class="px-2">
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-center grey--text py-4">
                        Нет документов для создания
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>

              <!-- Панель создания всех документов -->
              <v-card-actions class="pa-2 flex-grow-0">
                <div class="text-caption">
                  <strong>Итого:</strong> {{ documents.length }} док., {{ totalFilesCount }} файл.
                  <span v-if="filePool.length > 0" class="info--text ml-2">
                    • {{ filePool.length }} файл. в пуле
                  </span>
                  <span v-if="isEditing" class="warning--text ml-2">
                    • Режим редактирования
                  </span>
                </div>
                <v-spacer></v-spacer>
                <v-btn
                    text
                    @click="closeDialog"
                >
                  Отмена
                </v-btn>
                <v-btn
                    color="primary"
                    :loading="creating"
                    @click="createAllDocuments"
                    :disabled="documents.length === 0 || isEditing"
                >
                  <v-icon left>mdi-check</v-icon>
                  Создать все документы ({{ documents.length }})
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <PdfViewer
        v-if="pdfViewer.visible"
        :value="pdfViewer.visible"
        :src="pdfViewer.src"
        :fileName="pdfViewer.fileName"
        @close="closePdfViewer"
    />
  </v-dialog>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'
import PdfViewer from "@/components/PDFViewer/PdfViewer.vue";

export default {
  name: 'DocumentCreate',
  components: {PdfViewer},
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    currentDocumentValid: false,
    creating: false,
    isDragging: false,
    systemFilesSearch: '',
    editingIndex: null,
    activeTab: 0,
    filePool: [],
    currentDocument: {
      title: '',
      direction: 'internal',
      document_type: null,
      executor: null,
      out_number: '',
      description: '',
      project: null,
      issuer_legal: null,
      files: []
    },
    documents: [],
    directionOptions: [
      {text: 'Внутренний', value: 'internal'},
      {text: 'Исходящий', value: 'outgoing'},
      {text: 'Входящий', value: 'incoming'}
    ],
    pdfViewer: {
      visible: false,
      src: null,
      fileName: ''
    }
  }),
  computed: {
    ...mapGetters('documentFlow', ['getFileList', 'getCreateOptions']),
    ...mapGetters(['currentUserData']),

    systemFiles() {
      return this.getFileList || []
    },

    // Файлы системы с фильтрацией по поиску
    filteredSystemFiles() {
      if (!this.systemFilesSearch) {
        return this.systemFiles
      }
      const search = this.systemFilesSearch.toLowerCase()
      return this.systemFiles.filter(file =>
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
    },

    isEditing() {
      return this.editingIndex !== null
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

    // Редактирование документа
    editDocument(index) {
      const docToEdit = this.documents[index]

      // Копируем данные документа в форму редактирования
      this.currentDocument = {
        title: docToEdit.title,
        direction: docToEdit.direction,
        document_type: docToEdit.document_type,
        executor: docToEdit.executor,
        out_number: docToEdit.out_number,
        description: docToEdit.description,
        project: docToEdit.project,
        issuer_legal: docToEdit.issuer_legal,
        files: [...docToEdit.files] // Копируем файлы
      }

      this.editingIndex = index

      this.$store.dispatch('snackbar/showSnackbar', {
        text: `Редактирование документа "${docToEdit.title}"`,
        color: 'info'
      }, {root: true})
    },

    // Обновление документа после редактирования
    updateDocument() {
      if (this.editingIndex === null) return

      // Обновляем документ в массиве
      this.documents[this.editingIndex] = {
        ...this.documents[this.editingIndex],
        ...this.currentDocument
      }

      this.$store.dispatch('snackbar/showSnackbar', {
        text: `Документ "${this.currentDocument.title}" обновлен`,
        color: 'success'
      }, {root: true})

      // Сбрасываем режим редактирования
      this.cancelEdit()
    },

    // Отмена редактирования
    cancelEdit() {
      this.editingIndex = null
      this.resetCurrentDocument()
    },

    // Управление пулом файлов
    onFileInputChange(e) {
      this.addNewFilesToPool(e.target.files)
      e.target.value = ''
    },

    onDrop(e) {
      e.preventDefault()
      this.isDragging = false
      this.addNewFilesToPool(e.dataTransfer.files)
    },

    addNewFilesToPool(fileList) {
      let addedCount = 0

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        // Проверяем, не добавлен ли уже файл с таким именем
        if (!this.filePool.some(f => f.name === file.name)) {
          const fileData = {
            key: `new_${file.name}_${Date.now()}`,
            type: 'new',
            file: file,
            name: file.name,
            fileType: this.getFileTypeFromName(file.name),
            fileSizeDisplay: this.formatFileSize(file.size),
            description: '',
            pageRange: ''
          }

          this.filePool.push(fileData)
          addedCount++
        }
      }

      if (addedCount > 0) {
        this.$store.dispatch('snackbar/showSnackbar', {
          text: `Добавлено ${addedCount} файлов в пул`,
          color: 'success'
        }, {root: true})
      }
    },

    // Добавление файла из системы в пул
    addSystemFileToPool(file) {
      const fileData = {
        key: `existing_${file.id}_${Date.now()}`,
        type: 'existing',
        fileId: file.id,
        name: file.original_name,
        fileType: file.file_type,
        fileSizeDisplay: file.file_size_display,
        description: '',
        pageRange: ''
      }

      this.filePool.push(fileData)

      this.$store.dispatch('snackbar/showSnackbar', {
        text: `Файл "${file.original_name}" добавлен в пул`,
        color: 'success'
      }, {root: true})

      // Переключаемся на вкладку пула файлов, чтобы пользователь увидел добавленный файл
      this.activeTab = 0
    },

    removeFileFromPool(index) {
      const fileName = this.filePool[index].name
      this.filePool.splice(index, 1)

      this.$store.dispatch('snackbar/showSnackbar', {
        text: `Файл "${fileName}" удален из пула`,
        color: 'info'
      }, {root: true})
    },

    clearFilePool() {
      if (this.filePool.length === 0) return

      if (confirm('Вы уверены, что хотите очистить весь пул файлов?')) {
        const fileCount = this.filePool.length
        this.filePool = []

        this.$store.dispatch('snackbar/showSnackbar', {
          text: `Пул файлов очищен (${fileCount} файлов удалено)`,
          color: 'info'
        }, {root: true})
      }
    },

    // Проверка использования файла в текущем документе
    isFileInCurrentDocument(file) {
      return this.currentDocument.files.some(f => f.key === file.key)
    },

    // Управление файлами в текущем документе
    addFileToDocument(file) {
      // Проверяем, не добавлен ли уже файл
      if (this.isFileInCurrentDocument(file)) {
        this.$store.dispatch('snackbar/showSnackbar', {
          text: `Файл "${file.name}" уже добавлен в документ`,
          color: 'warning'
        }, {root: true})
        return
      }

      const fileCopy = {
        ...file
      }

      this.currentDocument.files.push(fileCopy)

      this.$store.dispatch('snackbar/showSnackbar', {
        text: `Файл "${file.name}" добавлен к документу`,
        color: 'success'
      }, {root: true})
    },

    removeFileFromDocument(index) {
      const fileName = this.currentDocument.files[index].name
      this.currentDocument.files.splice(index, 1)

      this.$store.dispatch('snackbar/showSnackbar', {
        text: `Файл "${fileName}" удален из документа`,
        color: 'info'
      }, {root: true})
    },

    clearAllFilesFromDocument() {
      if (this.currentDocument.files.length === 0) return

      if (confirm('Вы уверены, что хотите удалить все файлы из этого документа?')) {
        const fileCount = this.currentDocument.files.length
        this.currentDocument.files = []

        this.$store.dispatch('snackbar/showSnackbar', {
          text: `Удалено ${fileCount} файлов из документа`,
          color: 'info'
        }, {root: true})
      }
    },

    // Управление документами
    addDocument() {
      const newDocument = {
        ...this.currentDocument,
        id: Date.now() + Math.random() // Уникальный ID
      }

      this.documents.push(newDocument)

      this.$store.dispatch('snackbar/showSnackbar', {
        text: `Документ "${newDocument.title}" добавлен с ${newDocument.files.length} файлами`,
        color: 'success'
      }, {root: true})

      // Сбрасываем форму для создания следующего документа
      this.resetCurrentDocument()
    },

    removeDocument(index) {
      const docTitle = this.documents[index].title

      // Если удаляем редактируемый документ, сбрасываем режим редактирования
      if (this.editingIndex === index) {
        this.cancelEdit()
      }

      this.documents.splice(index, 1)

      // Корректируем индекс редактирования, если нужно
      if (this.editingIndex === index) {
        this.editingIndex = null
      } else if (this.editingIndex > index) {
        this.editingIndex--
      }

      this.$store.dispatch('snackbar/showSnackbar', {
        text: `Документ "${docTitle}" удален`,
        color: 'info'
      }, {root: true})
    },

    clearAllDocuments() {
      if (confirm('Вы уверены, что хотите удалить все документы?')) {
        this.documents = []
        this.editingIndex = null
        this.resetCurrentDocument()

        this.$store.dispatch('snackbar/showSnackbar', {
          text: 'Все документы удалены',
          color: 'info'
        }, {root: true})
      }
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
        files: []
      }

      if (this.$refs.documentForm) {
        this.$refs.documentForm.resetValidation()
      }
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

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU')
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
              issuer_legal: doc.issuer_legal
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
      this.filePool = []
      this.documents = []
      this.editingIndex = null
      this.activeTab = 0
      this.resetCurrentDocument()
      this.isDragging = false
      this.systemFilesSearch = ''
    },

    openPdfViewer(file) {
      console.log(file)
      if (file.type === 'new' && file.file) {
        // Для новых файлов используем Blob
        const blobUrl = URL.createObjectURL(file.file)
        console.log('Created blob URL:', blobUrl)
        this.pdfViewer = {
          visible: true,
          src: blobUrl,
          fileName: file.name,
          blobUrl: blobUrl
        }
        console.log(this.pdfViewer)
      } else if (file.type === 'existing') {
        // Для существующих файлов из системы - нужно получить URL
        this.openSystemPdfViewer({
          id: file.fileId,
          original_name: file.name
        })
      }
    },
    openSystemPdfViewer(file) {
      console.log(file)
      this.pdfViewer = {
        visible: true,
        // src: url,
        // fileName: file.original_name
      }
    },
    closePdfViewer() {
      this.pdfViewer = {
        visible: false,
        src: null,
        fileName: ''
      }
    },
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

.v-list-item {
  cursor: pointer;
}

.v-list-item:hover {
  background-color: #f5f5f5;
}

.active-document {
  background-color: #e3f2fd;
  border-left: 3px solid #1976d2;
}

.drag-area {
  border: 2px dashed #1976d2;
  border-radius: 4px;
  padding: 20px;
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
  font-size: 12px;
  color: #616161;
}

/* Стили для вкладок */
.v-tab {
  min-width: 0;
  font-size: 0.75rem;
}

.v-tab .v-icon {
  margin-right: 4px;
}
</style>