<template>
  <v-container v-if="load">
    <v-card :style="collapsed? 'height: 75vh': 'height: 51vh'" width="100%" class="pa-3">
      <v-card-title class="justify-center">
        <template v-if="rectifiedEvent">

          Редактирование события {{ event.name }}

        </template>
        <template v-else>Новое событие</template>
      </v-card-title>
      <v-card-text class="task-form" style="height: 80%; overflow: scroll">
        <v-form ref="eventCreate" v-model="valid" class="mt-3">
          <v-row justify="start">
            <v-col cols="auto" class="mr-3">
              <v-text-field class="required" disabled outlined dense label="Автор"
                            v-model="event.author.fullName"></v-text-field>
            </v-col>
            <v-col cols="auto">
              <v-text-field class="required" disabled outlined dense label="Дата создания"
                            v-model="event.date"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-text-field outlined dense label="Название события"
                          v-model="event.name"
                          :error="!!errors['name']"
                          :error-messages="errors['name']"
            ></v-text-field>
          </v-row>
          <v-row justify="start">
            <v-textarea class="required" outlined dense label="Описание события"
                        v-model="event.description"
                        :error="!!errors['description']"
                        :error-messages="errors['description']"
                        :rules="required"></v-textarea>
          </v-row>
          <v-row justify="start">
            <v-col cols="auto" md="7" xs="12" class="mr-3">
              <v-autocomplete outlined dense label="Проект"
                              multiple
                              v-model="event.project"
                              :error="!!errors['project']"
                              :error-messages="errors['project']"
                              :items="projectList" item-text="name"
                              item-value="pk"></v-autocomplete>
            </v-col>
            <v-col cols="auto" md="4" xs="12" class="mr-3">
              <AddTag ref="tagsList" :existTags="existTags"></AddTag>
            </v-col>
          </v-row>
          <v-row>
            <v-expansion-panels focusable>
              <v-expansion-panel>
                <v-expansion-panel-header class="pr-5 pl-5">Документы</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <template v-if="document">
                    <v-row justify="start" class="mt-3 mb-3"
                           align="center">
                      <v-col md="11">
                        {{ document.author | getName }} | {{ document.entry_date | filterDate }} | {{ document.file }}
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
                            <v-list class="action bg-grey">
                              <v-list-item link @click="downloadItem(doc)">
                                <v-list-item-title>
                                  Скачать
                                </v-list-item-title>
                              </v-list-item>
                              <v-divider></v-divider>
                              <v-list-item link @click="editItem(doc)">
                                <v-list-item-title>
                                  Редактировать
                                </v-list-item-title>
                              </v-list-item>
                            </v-list>
                          </v-menu>
                        </v-row>
                      </v-col>
                    </v-row>
                  </template>
                  <template v-if="event.documents">
                    <v-row justify="start" class="mt-3 mb-3" v-for="doc in event.documents" :key="doc['pk']"
                           align="center">
                      <v-col md="11">
                        {{ doc.author | getName }} | {{ doc.entry_date | filterDate }} | {{ doc.file }}
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
                            <v-list class="action bg-grey">
                              <v-list-item link @click="downloadItem(doc)">
                                <v-list-item-title>
                                  Скачать
                                </v-list-item-title>
                              </v-list-item>
                              <v-divider></v-divider>
                              <v-list-item link @click="editItem(doc)">
                                <v-list-item-title>
                                  Редактировать
                                </v-list-item-title>
                              </v-list-item>
                            </v-list>
                          </v-menu>
                        </v-row>
                      </v-col>
                    </v-row>

                  </template>
                  <template v-if="chooseDocs">
                    <v-row justify="start" class="mt-3 mb-3" v-for="doc in chooseDocs" :key="doc['pk']"
                           align="center">
                      <v-col md="11">
                        {{ doc.author | getName }} | {{ doc.entry_date | filterDate }} | {{ doc.file }}
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
                            <v-list class="action bg-grey">
                              <v-list-item link @click="downloadItem(doc)">
                                <v-list-item-title>
                                  Скачать
                                </v-list-item-title>
                              </v-list-item>
                              <v-divider></v-divider>
                              <v-list-item link @click="editItem(doc)">
                                <v-list-item-title>
                                  Редактировать
                                </v-list-item-title>
                              </v-list-item>
                            </v-list>
                          </v-menu>
                        </v-row>
                      </v-col>
                    </v-row>

                  </template>
                  <template v-if="docsToUpload">
                    <v-row justify="start" class="mt-3 mb-3" v-for="(doc, i) in docsToUpload" :key="i"
                           align="center">
                      <v-col md="11">
                        {{ doc.get("file").name }}
                      </v-col>
                      <v-col md="1">
                        <v-row class="flex-column justify-space-between">
                          <v-btn @click="delDocToUpload(i)" icon>
                            <v-icon size="15" color="error">mdi-delete
                            </v-icon>
                          </v-btn>
                        </v-row>
                      </v-col>
                    </v-row>
                  </template>
                  <v-row justify="space-between" class="mt-3">
                    <v-btn color="success" @click="addEventDoc" :disabled="event.project.length < 1">
                      Добавить новый
                    </v-btn>
                    <v-btn color="primary" @click="chooseEventDoc" :disabled="event.project < 1">
                      Выбрать документ
                    </v-btn>
                  </v-row>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="mt-2">
        <v-row justify="end">
          <v-col cols="auto" class="mr-3">
            <v-btn color="error" @click="close" v-html="event.pk? 'Закрыть': 'Отмена'"></v-btn>
          </v-col>
          <v-col cols="auto" class="mr-3">
            <v-btn color="success" @click="save()">Сохранить</v-btn>
          </v-col>
          <v-col cols="auto" class="mr-2">
            <v-btn color="success" @click="createTask()"
                   :disabled="!event.pk || event.project.length === 0">
              Создать задачу
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
    <DocumentUploading :event="event" @docsAdded="docsAdded"></DocumentUploading>
    <editDocument></editDocument>
    <ChooseDocument :event-pk="event.pk" @chooseDocs="appendDocs" @successAdded="updateEventData"></ChooseDocument>
    <v-dialog
        v-model="uploadDocsLoader"
        hide-overlay
        persistent
        width="300"
    >
      <v-card
          color="primary"
          dark
      >
        <v-card-text>
          Загрузка документов {{ uploadDocsCounter }} из {{ docsToUpload.length }}
          <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <CloseTask></CloseTask>
    <SnackbarMessage :message="snackbar.message" :type="snackbar.type"
                     :snackbar="snackbar.snackbar"></SnackbarMessage>
  </v-container>
</template>

<script>
import moment from 'moment'
import {mapGetters} from "vuex";
import {isEmpty} from 'lodash'
import AddTag from "@/components/Tagging/AddTag";
import editDocument from "@/components/CRM/PaperFlow/modal/editDocument";
import ChooseDocument from "@/components/CRM/PaperFlow/modal/ChooseDocument";
import DocumentUploading from "@/components/CRM/PaperFlow/modal/DocumentUploading";
import CloseTask from "@/components/CRM/Task/modal/CloseTask";
import SnackbarMessage from "@/components/UI/SnackbarMessage";


export default {
  props: ['rectifiedEvent', 'document', 'task', 'project', 'collapsed'],
  name: "EventCreateComponent",
  data: () => ({
    valid: false,
    load: false,
    type: 'create',
    uploadDocsLoader: false,
    uploadDocsCounter: 0,
    errors: {},
    event: {
      pk: '',
      date: moment().format('YYYY-MM-DD HH:mm'),
      author: '',
      project: [],
      description: '',
      name: '',
      documents: '',
      task: []
    },
    docsToUpload: [],
    docsToAppend: null,
    chooseDocs: [],
    existTags: null,
    required: [
      v => !!v || 'Данное поле обязательно',
    ],
    snackbar: {
      message: '',
      snackbar: false,
      type: 'success'
    }

  }),
  computed: {
    ...mapGetters({
      currentUser: 'authUserData',
      systemUser: 'allSystemUsersData',
      projectList: 'projectListData',
      eventCategory: 'eventCategoryListData'
    })
  },
  methods: {
    updateEvent() {
      if (this.type === 'create') {
        this.close()
      }
    },
    async saveDoc(formData) {
      await this.$store.dispatch('saveDocument', {
        formData,
        'template': '',
        'file': formData.get('file'),
        'force': true
      })
    },
    async appendDoc(formData) {
      await this.$store.dispatch('addDocsToEvent', formData)
    },
    async updateEventData() {
      this.docsToUpload = []
      this.docsToAppend = []
      this.chooseDocs = []
      if (this.event.pk) {
        await this.$store.dispatch('getEventDetail', this.event.pk).then(() => {
          let eventDetail = this.$store.getters.eventDetailData
          Object.keys(eventDetail).forEach(key => {
            if (eventDetail[key]) {
              if (key === 'documents') {
                this.event[key] = eventDetail[key]
              }
            }
          })
        })
      } else {
        console.log('2')
        await this.$store.dispatch('getEventDetail', this.rectifiedEvent['pk']).then(() => {
          let eventDetail = this.$store.getters.eventDetailData
          Object.keys(eventDetail).forEach(key => {
            if (eventDetail[key]) {
              if (key === 'project') {
                if (eventDetail[key].length > 0) {
                  for (let project of eventDetail[key]) {
                    this.event[key].push(project['pk'])
                  }
                }
              } else {
                this.event[key] = eventDetail[key]
              }
            }
          })
          this.type = this.rectifiedEvent['type']
          this.existTags = eventDetail.tags
        })
      }

    },
    async addEventDoc() {
      this.$emit('newEventDoc', this.event)
    },
    async save(closeBeforeSave = false) {
      if (this.$refs.eventCreate.validate()) {
        if (this.event.name === '') {
          try {
            this.event.name = this.event.description.split('.')[0]
          } catch (e) {
            this.event.name = this.event.description
          }
        }
        let formData = new FormData()
        let tagsList = []
        let pk = this.event.pk
        if (this.$refs.tagsList) {
          tagsList = this.$refs.tagsList.selected
        }
        Object.keys(this.event).forEach(key => {
              if (key !== 'documents' && key !== 'task') {
                if (typeof this.event[key] === 'object' && this.event[key]) {
                  if (key === 'project') {
                    for (let project of this.event[key]) {
                      if (typeof project === 'object') {
                        formData.append(key, project['pk'])
                      } else {
                        formData.append(key, project)
                      }
                    }
                  } else {
                    formData.append(key, this.event[key]['id'])
                  }

                } else {
                  if (this.event[key]) {
                    formData.append(key, this.event[key])
                  }
                }
              } else if (key === 'documents') {
                if (this.document) {
                  formData.append('documents', this.document.pk)
                } else {
                  for (let doc of this.event.documents) {
                    formData.append('documents', doc['id'])
                  }
                }
              } else if (key === 'task' && this.event[key].length > 0) {
                formData.append('task', [...this.event[key]])
              }
            }
        )
        formData.delete('tags')
        if (tagsList) {
          tagsList.forEach(obj => {
            if (obj) {
              formData.append('tags', obj.pk.toString())
            }
          })
        }
        if (this.type === 'create') {
          await this.$store.dispatch('createEvent', formData).then(async (data) => {
            this.errors = {}
            this.event.pk = data.pk
            if (this.docsToUpload.length > 0) {
              this.uploadDocsLoader = true
              for (let doc of this.docsToUpload) {
                this.uploadDocsCounter++
                doc.append('event', data.pk)
                await this.saveDoc(doc)
              }
              this.uploadDocsLoader = false
              this.uploadDocsCounter = 0
            }
            if (this.docsToAppend) {
              this.docsToAppend.append('event', data.pk)
              await this.appendDoc(this.docsToAppend)
            }
            this.type = 'edit'
            this.snackbar.snackbar = true
            this.snackbar.message = 'Событие успешно создано'
            this.snackbar.type = 'success'
            setTimeout(() => {
              this.snackbar.snackbar = false
            }, 2000)
            await this.$store.dispatch('sendEventNotify', data.pk)
            await this.updateEventData()
          }).catch(err => {
            this.snackbar.snackbar = true
            this.snackbar.message = 'Ошибка при создании события'
            this.snackbar.type = 'error'
            setTimeout(() => {
              this.snackbar.snackbar = false
            }, 2000)
            if (err) {
              this.errors = err.response.data.errors
            }
            throw new Error('Форма не прошла валидацию')
          })
          if (this.event.task.length !== 0) {
            this.$emit('closeTask', this.event.task)
          }
        } else if (this.type === 'edit') {
          await this.$store.dispatch('editEvent', {formData, pk}).then(async () => {
            this.errors = {}
            if (this.docsToUpload.length > 0) {
              this.uploadDocsLoader = true
              for (let doc of this.docsToUpload) {
                this.uploadDocsCounter++
                await this.saveDoc(doc)
              }
              this.uploadDocsLoader = false
              this.uploadDocsCounter = 0
            }
            this.snackbar.snackbar = true
            this.snackbar.message = 'Событие успешно сохранено'
            this.snackbar.type = 'success'
            setTimeout(() => {
              this.snackbar.snackbar = false
            }, 2000)
          }).catch(err => {
            this.snackbar.snackbar = true
            this.snackbar.message = 'Ошибка при сохранении события'
            this.snackbar.type = 'error'
            setTimeout(() => {
              this.snackbar.snackbar = false
            }, 2000)
            if (err) {
              console.log(err)
              this.errors = err.response.data.errors
              throw new Error('Форма не прошла валидацию')
            }

          })
          await this.updateEventData()
        }
      } else {
        throw new Error('Форма не прошла валидацию')
      }

    },
    close() {
      if (this.$refs.tagsList) {
        this.$refs.tagsList.clear()
      }
      Object.assign(this.$data, this.$options.data())
      this.$emit('hideCreate')
    },
    async chooseEventDoc() {
      let existDoc = []
      if (this.event.documents.length > 0) {
        existDoc = this.event.documents.map(obj => {
          return obj.id
        })
      }
      this.$emit('chooseDocs', {project: this.event.project, existDoc: existDoc})
    },
    appendDocs({formData, chooseDocs}) {
      this.docsToAppend = formData
      this.chooseDocs = chooseDocs
    },
    downloadItem(doc) {
      this.$store.dispatch('downloadDocument', {'pk': doc.pk, 'fileName': doc.fileName})
    },
    editItem(doc) {
      this.$emit('editDoc', doc.pk)
    },
    createTask() {
      new Promise(async (resolve) => {
        await resolve(this.save(false))
      }).then(() => {
            this.event['type'] = 'event'
            console.log(this.event)
            this.$emit('createTask', this.event)
          }
      );
    },
    docsAdded({formsData, files}) {
      this.docsToUpload = formsData
    },
    delDocToUpload(i) {
      this.docsToUpload.splice(i, 1);
    }
  },
  watch: {
    rectifiedEvent(val) {
      this.updateEventData()
    }
  },
  filters: {
    filterDate: date => moment(new Date(date)).format('DD.MM.YYYY'),
    getName(obj) {
      if (obj && obj.hasOwnProperty('fullName')) {
        return obj.fullName
      }
      return '-------'
    },
  },
  async created() {
    await this.$store.dispatch('getProjectList');
    await this.$store.dispatch('getEventCategory');
    this.event.author = this.systemUser.filter(obj => obj.user.id === this.currentUser.id)[0]
    if (this.rectifiedEvent) {
      await this.updateEventData()
    } else {
      if (!isEmpty(this.task)) {
        let project = this.task.project.pk ? this.task.project.pk : this.task.project
        this.event.project.push(project)
        this.event.task.push(this.task.pk)
      } else if (this.project) {
        this.event.project.push(Number(this.project))
      } else if (this.document) {
        this.event.documents = this.document
      }
    }

    this.load = true
  },
  components: {
    AddTag,
    DocumentUploading,
    editDocument,
    ChooseDocument,
    CloseTask,
    SnackbarMessage
  }
}
</script>

<style scoped>
>>> .col {

  padding-bottom: 0;
  padding-top: 4px;
}

>>> .required fieldset {
  border: 0.15em solid;
}

>>> .v-input--is-focused fieldset {
  color: rgba(0, 0, 0, 0.87);
}

>>> .required .error--text fieldset {
  color: rgb(167, 25, 25);
}

>>> .required.v-input--is-focused fieldset {
  border: 0.19em solid;
}

>>> .required.v-input--is-focused.error--text fieldset {
  border: 0.19em solid;
  color: rgb(167, 25, 25);
}

>>> .v-messages.error--text {
  max-width: fit-content;
  max-height: 40px;
}
</style>