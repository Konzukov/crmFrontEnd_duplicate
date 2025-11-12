<template>
  <v-dialog v-model="dialog" width="90vw" max-width="1200">
    <v-card min-height="600">
      <v-toolbar color="primary">
        <v-toolbar-title class="white--text py-2">
          <v-icon color="error" class="mr-2">mdi-alert</v-icon>
          Обнаружен дубликат файла
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="mt-4">
        <v-row>
          <!-- Информация о загружаемом файле -->
          <v-col cols="12" md="6">
            <v-card outlined>
              <v-card-title class="primary white--text py-2">
                <v-icon left small>mdi-upload</v-icon>
                <span class="text-body-2">Новый файл</span>
              </v-card-title>
              <v-card-text class="pa-3">
                <v-list dense class="py-0">
                  <v-list-item class="px-0">
                    <v-list-item-icon class="mr-2" style="min-width: 24px;">
                      <v-icon small>mdi-file</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content class="py-0">
                      <v-list-item-title class="text-caption font-weight-medium">Имя файла</v-list-item-title>
                      <v-list-item-subtitle class="text-caption">{{ newFileData.name }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item class="px-0">
                    <v-list-item-icon class="mr-2" style="min-width: 24px;">
                      <v-icon small>mdi-weight</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content class="py-0">
                      <v-list-item-title class="text-caption font-weight-medium">Размер</v-list-item-title>
                      <v-list-item-subtitle class="text-caption">{{ newFileData.sizeFormatted }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Информация о существующем файле -->
          <v-col cols="12" md="6">
            <v-card outlined>
              <v-card-title class="success white--text py-2">
                <v-icon left small>mdi-file-check</v-icon>
                <span class="text-body-2">Существующий файл</span>
              </v-card-title>
              <v-card-text class="pa-3">
                <v-row dense>
                  <!-- Основная информация -->
                  <v-col cols="12" md="6">
                    <v-list dense class="py-0">
                      <v-list-item class="px-0">
                        <v-list-item-icon class="mr-2" style="min-width: 24px;">
                          <v-icon small>mdi-file</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content class="py-0">
                          <v-list-item-title class="text-caption font-weight-medium">Имя файла</v-list-item-title>
                          <v-list-item-subtitle class="text-caption text-truncate">
                            {{ existingDocument.fileName || existingDocument.file }}
                          </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action class="ml-2">
                          <v-btn x-small icon @click="download(existingDocument)" color="primary">
                            <v-icon x-small>mdi-download</v-icon>
                          </v-btn>
                        </v-list-item-action>
                      </v-list-item>

                      <v-list-item class="px-0">
                        <v-list-item-icon class="mr-2" style="min-width: 24px;">
                          <v-icon small>mdi-account</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content class="py-0">
                          <v-list-item-title class="text-caption font-weight-medium">Автор</v-list-item-title>
                          <v-list-item-subtitle class="text-caption">{{ existingDocument.author | getName }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>

                      <v-list-item class="px-0">
                        <v-list-item-icon class="mr-2" style="min-width: 24px;">
                          <v-icon small>mdi-calendar</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content class="py-0">
                          <v-list-item-title class="text-caption font-weight-medium">Дата добавления</v-list-item-title>
                          <v-list-item-subtitle class="text-caption">{{ formatDate(existingDocument.entry_date) }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>

                      <v-list-item class="px-0" v-if="existingDocument.correspondence_type">
                        <v-list-item-icon class="mr-2" style="min-width: 24px;">
                          <v-icon small>mdi-tag</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content class="py-0">
                          <v-list-item-title class="text-caption font-weight-medium">Тип документа</v-list-item-title>
                          <v-list-item-subtitle class="text-caption">{{ existingDocument.correspondence_type.name }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-col>

                  <!-- Дополнительная информация -->
                  <v-col cols="12" md="6">
                    <v-list dense class="py-0">
                      <v-list-item class="px-0">
                        <v-list-item-icon class="mr-2" style="min-width: 24px;">
                          <v-icon small>mdi-account-arrow-right</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content class="py-0">
                          <v-list-item-title class="text-caption font-weight-medium">Направление</v-list-item-title>
                          <v-list-item-subtitle class="text-caption">
                            {{ existingDocument.route ? 'Исходящий' : 'Входящий' }}
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>

                      <v-list-item class="px-0" v-if="getFromWho(existingDocument)">
                        <v-list-item-icon class="mr-2" style="min-width: 24px;">
                          <v-icon small>mdi-account</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content class="py-0">
                          <v-list-item-title class="text-caption font-weight-medium">
                            {{ existingDocument.route ? 'Получатель' : 'Отправитель' }}
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-caption">{{ getFromWho(existingDocument) }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>

                      <v-list-item class="px-0" v-if="existingDocument.receiving_date">
                        <v-list-item-icon class="mr-2" style="min-width: 24px;">
                          <v-icon small>mdi-calendar-check</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content class="py-0">
                          <v-list-item-title class="text-caption font-weight-medium">Дата получения</v-list-item-title>
                          <v-list-item-subtitle class="text-caption">{{ formatDate(existingDocument.receiving_date) }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>

                      <v-list-item class="px-0">
                        <v-list-item-icon class="mr-2" style="min-width: 24px;">
                          <v-icon small>mdi-check-circle</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content class="py-0">
                          <v-list-item-title class="text-caption font-weight-medium">Статус</v-list-item-title>
                          <v-list-item-subtitle class="text-caption">
                            {{ existingDocument.processed ? 'Обработан' : 'Не обработан' }}
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>

                <!-- Проекты и теги в отдельной строке -->
                <v-row dense class="mt-1" v-if="existingDocument.project && existingDocument.project.length">
                  <v-col cols="12">
                    <v-list-item class="px-0">
                      <v-list-item-icon class="mr-2" style="min-width: 24px;">
                        <v-icon small>mdi-folder</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content class="py-0">
                        <v-list-item-title class="text-caption font-weight-medium">Проекты</v-list-item-title>
                        <v-list-item-subtitle>
                          <v-chip v-for="project in existingDocument.project" :key="project.pk" x-small class="mr-1 mb-1">
                            {{ project.name }}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-col>
                </v-row>

                <!-- Теги и сумма -->
                <v-row dense class="mt-1">
                  <v-col cols="12" md="6" v-if="existingDocument.tags && existingDocument.tags.length">
                    <v-list-item class="px-0">
                      <v-list-item-icon class="mr-2" style="min-width: 24px;">
                        <v-icon small>mdi-tag-multiple</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content class="py-0">
                        <v-list-item-title class="text-caption font-weight-medium">Теги</v-list-item-title>
                        <v-list-item-subtitle>
                          <v-chip v-for="tag in existingDocument.tags" :key="tag.pk" x-small class="mr-1 mb-1">
                            {{ tag.name }}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-col>

                  <v-col cols="12" md="6" v-if="existingDocument.price">
                    <v-list-item class="px-0">
                      <v-list-item-icon class="mr-2" style="min-width: 24px;">
                        <v-icon small>mdi-cash</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content class="py-0">
                        <v-list-item-title class="text-caption font-weight-medium">Сумма</v-list-item-title>
                        <v-list-item-subtitle class="text-caption">{{ existingDocument.price }} руб.</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-col>
                </v-row>

                <!-- Квартальный отчет и исходящий номер -->
                <v-row dense class="mt-1">
                  <v-col cols="12" md="6" v-if="existingDocument.quarter_year && existingDocument.quarter">
                    <v-list-item class="px-0">
                      <v-list-item-icon class="mr-2" style="min-width: 24px;">
                        <v-icon small>mdi-chart-box</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content class="py-0">
                        <v-list-item-title class="text-caption font-weight-medium">Квартальный отчет</v-list-item-title>
                        <v-list-item-subtitle class="text-caption">
                          {{ existingDocument.quarter }} квартал {{ existingDocument.quarter_year }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-col>

                  <v-col cols="12" md="6" v-if="existingDocument.out_number">
                    <v-list-item class="px-0">
                      <v-list-item-icon class="mr-2" style="min-width: 24px;">
                        <v-icon small>mdi-numeric</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content class="py-0">
                        <v-list-item-title class="text-caption font-weight-medium">Исходящий номер</v-list-item-title>
                        <v-list-item-subtitle class="text-caption">{{ existingDocument.out_number }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="px-4 py-3">
        <v-row justify="space-between" align="center" dense>
          <v-col cols="auto">
            <v-btn color="error" @click="close" outlined small>
              <v-icon left small>mdi-close</v-icon>
              Отмена
            </v-btn>
          </v-col>

          <v-col cols="auto">
            <v-row dense>
              <v-col cols="auto">
                <v-btn color="primary" @click="editExisting" small v-if="existingDocument">
                  <v-icon left small>mdi-pencil</v-icon>
                  Редактировать
                </v-btn>
              </v-col>
              <v-col cols="auto">
                <v-btn color="warning" @click="forceSave" outlined small>
                  <v-icon left small>mdi-content-save-alert</v-icon>
                  Сохранить новый
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>

    <!-- Компонент для редактирования документа -->
    <edit-document ref="editDocumentDialog"></edit-document>
  </v-dialog>
</template>

<script>
import editDocument from './editDocument'

export default {
  name: "DuplicateFileDialog",
  components: {
    editDocument
  },
  data: () => ({
    dialog: false,
    existingDocument: null,
    newFileData: {
      name: '',
      sizeFormatted: ''
    }
  }),
  methods: {
    close() {
      this.dialog = false
      // this.existingDocument = null
      // this.newFileData = {
      //   name: '',
      //   sizeFormatted: ''
      // }
    },
    forceSave() {
      this.$emit('forceAdd')
      this.close()
    },
    editExisting() {
      if (this.existingDocument && this.existingDocument.pk) {
        this.close()
        this.$nextTick(() => {
          this.$emit('handleEditDoc', this.existingDocument.pk)
        })
      }
    },
    download(doc) {
      this.$store.dispatch('downloadDocument', {'pk': doc.pk, 'fileName': doc.file})
    },
    formatDate(dateString) {
      if (!dateString) return '—'
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU')
    },
    formatFileSize(bytes) {
      if (!bytes) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    getFromWho(document) {
      if (document.fromWho) {
        return document.fromWho.fullName
      } else if (document.from_legal) {
        return document.from_legal.name
      } else if (document.from_physical) {
        return document.from_physical.fullName || document.from_physical.full_name
      } else if (document.to && document.to.participator) {
        return document.to.participator.fullName
      }
      return '—'
    },
    prepareNewFileData(file) {
      if (!file) return { name: 'Неизвестно', sizeFormatted: '0 Bytes' }

      return {
        name: file.name || 'Неизвестно',
        sizeFormatted: this.formatFileSize(file.size)
      }
    }
  },
  filters: {
    getName(obj) {
      if (obj && obj.hasOwnProperty('fullName')) {
        return obj.fullName
      } else if (obj && obj.hasOwnProperty('full_name')) {
        return obj.full_name
      } else if (obj && obj.first_name && obj.last_name) {
        return `${obj.last_name} ${obj.first_name}${obj.middle_name ? ' ' + obj.middle_name : ''}`
      }
      return '—'
    }
  },
  created() {
    this.$parent.$on('showDuplicate', (data) => {
      console.log('Duplicate data:', data)

      if (data && data.existFile) {
        this.existingDocument = data.existFile
        this.newFileData = this.prepareNewFileData(data.newFile)
        this.dialog = true
      } else if (data && data.pk) {
        this.existingDocument = data
        this.newFileData = { name: 'Неизвестно', sizeFormatted: '0 Bytes' }
        this.dialog = true
      }
    })
  }
}
</script>

<style scoped>
>>> .v-alert {
  margin-bottom: 0;
}

>>> .v-list-item__subtitle {
  white-space: normal;
}

>>> .v-chip {
  margin: 1px;
  height: 20px;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>