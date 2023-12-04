<template>
  <v-container v-if="load">
    <v-card :style="collapsed? 'height: 75vh': 'height: 51vh'" width="100%" class="pa-3">
      <v-card-title class="justify-center">
        <template v-if="rectifiedTask">
          Редактирование задачи {{ rectifiedTask.name }}

        </template>
        <template v-else>Новая задача</template>
      </v-card-title>
      <v-card-text class="task-form" style="height: 75%; overflow: scroll">
        <v-form ref="taskCreate" v-model="valid" class="mt-3">
          <v-row justify="start">
            <v-col cols="auto" class="mr-3">
              <v-text-field class="required" disabled outlined dense label="Автор"
                            v-model="task.author.fullName"></v-text-field>
            </v-col>
            <v-col cols="auto">
              <v-text-field class="required" disabled outlined dense label="Дата создания"
                            v-model="task.date"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-text-field outlined dense label="Название задачи"
                          v-model="task.name"
                          :error="!!errors['name']"
                          :error-messages="errors['name']"
            ></v-text-field>
          </v-row>
          <v-row justify="start">
            <v-textarea class="required" outlined dense label="Описание задачи"
                        v-model="task.description"
                        :error="!!errors['description']"
                        :error-messages="errors['description']"
                        :rules="required"></v-textarea>
          </v-row>
          <v-row>
            <v-expansion-panels focusable>
              <v-expansion-panel>
                <v-expansion-panel-header class="pr-5 pl-5">Дополнительные поля</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-row justify="start" class="mt-3">
                    <v-col cols="auto" md="5" xs="12" class="mr-3">
                      <v-autocomplete outlined dense label="Проект"
                                      v-model="task.project"
                                      @change="setExecutor"
                                      :error="!!errors['project']"
                                      :error-messages="errors['project']"
                                      :items="projectList" item-text="name"
                                      item-value="pk"></v-autocomplete>
                    </v-col>
                    <v-col cols="auto" md="5" xs="12" class="mr-3">
                      <v-autocomplete outlined dense label="Категория"
                                      v-model="task.category" :items="taskCategoryList" item-text="name"
                                      item-value="pk"></v-autocomplete>
                    </v-col>
                    <v-col cols="auto" xs="6" class="mr-3">
                      <v-text-field outlined dense label="Дата начала"
                                    v-model="task.date_from"
                                    :error="!!errors['date_from']"
                                    :error-messages="errors['date_from']" type="date"></v-text-field>
                    </v-col>
                    <v-col cols="auto" xs="6">
                      <v-text-field outlined dense label="Дата окончания"
                                    v-model="task.date_to"
                                    :error="!!errors['date_to']"
                                    :error-messages="errors['date_to']"
                                    type="date"></v-text-field>
                    </v-col>

                  </v-row>
                  <v-row justify="start">
                    <v-col cols="auto" class="mr-3">
                      <v-autocomplete outlined dense label="Статус"
                                      v-model="task.status" :items="taskStatusList" item-text="name"
                                      item-value="pk"></v-autocomplete>
                    </v-col>
                    <v-col cols="auto" class="mr-3">
                      <v-autocomplete outlined dense label="Исполнитель"
                                      v-model="task.executor" :items="systemUser" item-text="fullName"
                                      item-value="pk"></v-autocomplete>
                    </v-col>

                    <v-col cols="auto">
                      <AddTag ref="tagsList" :existTags="existTags"></AddTag>
                    </v-col>
                  </v-row>
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-header class="pr-5 pl-5">Документы</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <template v-if="document">
                    <v-row justify="start" class="mt-3 mb-3"
                           align="center">
                      <v-col md="11">
                        {{ document.author | getName }} | {{ document.entry_date | filterDate }} | {{ document  .file }}
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
                  <template v-if="task.documents">
                    <v-row justify="start" class="mt-3 mb-3" v-for="doc in task.documents" :key="doc['pk']"
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
                    <v-btn color="success" @click="addTaskDoc" :disabled="!task.project">
                      Добавить новый
                    </v-btn>
                    <v-btn color="primary" @click="chooseTaskDoc" :disabled="!task.project">
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
            <v-btn color="error" @click="close">Отмена</v-btn>
          </v-col>
          <v-col cols="auto" class="mr-3">
            <v-btn color="success" @click="save()">Сохранить</v-btn>
          </v-col>
          <v-col cols="auto" class="mr-2">
            <v-btn color="success" @click="createEvent"
                   :disabled="!task.pk">
              Создать событие
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
    <DocumentUploading :task="task" @docsAdded="docsAdded"></DocumentUploading>
    <editDocument></editDocument>
    <ChooseDocument :task-pk="task.pk" @chooseDocs="appendDocs" @successAdded="updateTask"></ChooseDocument>
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
  </v-container>

</template>

<script>
import moment from "moment";
import {mapGetters} from "vuex";
import AddTag from "@/components/Tagging/AddTag";
import DocumentUploading from "@/components/CRM/PaperFlow/modal/DocumentUploading";
import editDocument from "@/components/CRM/PaperFlow/modal/editDocument";
import ChooseDocument from "@/components/CRM/PaperFlow/modal/ChooseDocument";


export default {
  props: ['rectifiedTask', 'event', 'project', 'document', 'collapsed'],
  name: "TaskCreateComponent",
  data: () => ({
    dialog: false,
    load: false,
    valid: false,
    loading: false,
    type: 'create',
    uploadDocsLoader: false,
    uploadDocsCounter: 0,
    required: [
      v => !!v || 'Данное поле обязательно',
    ],
    errors: {},
    task: {
      pk: '',
      name: '',
      description: '',
      documents: '',
      author: '',
      event: '',
      category: '',
      date: moment().format('YYYY-MM-DD HH:mm'),
      date_from: '',
      date_to: '',
      project: '',
      executor: '',
      status: '',
    },
    existTags: null,
    docsToUpload: [],
    docsToAppend: null,
    chooseDocs: [],
  }),
  computed: {
    ...mapGetters({
      currentUser: 'authUserData',
      systemUser: 'allSystemUsersData',
      projectList: 'projectListData',
      taskStatusList: 'taskStatusListData',
      taskCategoryList: 'taskCategoryListData'
    })
  },
  methods: {
    updateTask() {
      if (this.type === 'create') {
        this.close()
      }
    },
    updateTaskData() {
      this.docsToUpload = []
      this.chooseDocs = []
      if (this.task.pk) {
        this.$store.dispatch('getTaskDetail', this.task.pk).then(() => {
          let taskDetail = this.$store.getters.taskDetailData
          Object.keys(taskDetail).forEach(key => {
            if (taskDetail[key]) {
              if (key === 'documents') {
                this.task[key] = taskDetail[key]
              }
            }
          })
        })
      } else {
        this.$store.dispatch('getTaskDetail', this.rectifiedTask['pk']).then(() => {
          let taskDetail = this.$store.getters.taskDetailData
          Object.keys(taskDetail).forEach(key => {
            if (taskDetail[key]) {
              if (key === 'project') {
                this.task[key] = taskDetail[key]['pk']
              } else {
                this.task[key] = taskDetail[key]
              }
            }
          })
          this.type = this.rectifiedTask['type']
          this.existTags = taskDetail.tags
        })
      }
    },
    async saveDoc(formData) {
      await this.$store.dispatch('saveDocument', {
        formData,
        'template': '',
        'file': formData.get('file'),
        'force': true
      }).then(res => {
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
    },
    async appendDoc(formData) {
      await this.$store.dispatch('addDocsToEvent', formData)
    },
    async save(closeBeforeSave = true) {
      if (this.$refs.taskCreate.validate()) {
        if (this.task.name === '') {
          try {
            this.task.name = this.task.description.split('.')[0]
          } catch (e) {
            this.task.name = this.task.description
          }
        }
        let formData = new FormData()
        let tagsList = []
        let pk = this.task.pk
        if (this.$refs.tagsList) {
          tagsList = this.$refs.tagsList.selected
        }
        Object.keys(this.task).forEach(key => {
          if (key !== 'documents') {
            if (typeof this.task[key] === 'object' && this.task[key]) {
              formData.append(key, this.task[key]['id'])
            } else {
              if (this.task[key]) {
                if (key === 'date_from' || key === 'date_to') {
                  formData.append(key, moment(this.task[key]).format('YYYY-MM-DD'))
                } else {
                  formData.append(key, this.task[key])
                }
              }
            }
          } else if (key === 'documents') {
            if (this.document) {
              formData.append('documents', this.document.pk)
            } else {
              for (let doc of this.task.documents) {
                formData.append('documents', doc['id'])
              }
            }
          }
        })
        formData.delete('tags')
        if (tagsList) {
          tagsList.forEach(obj => {
            if (obj) {
              formData.append('tags', obj.pk.toString())
            }
          })
        }
        if (this.type === 'create') {
          this.$store.dispatch('createTask', formData).then(async (data) => {
            this.errors = {}
            this.task.pk = data.pk
            if (this.docsToUpload.length > 0) {
              this.uploadDocsLoader = true
              for (let doc of this.docsToUpload) {
                this.uploadDocsCounter++
                doc.append('task', data.pk)
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
            this.$emit('updateTaskList')
            await this.$store.dispatch('sendTaskNotify', data.pk)
            await this.updateTaskData()
          }).catch(err => {
            console.log(err)
            this.errors = err.response.data.errors
          })
        } else if (this.type === 'edit') {
          this.$store.dispatch('editTask', {formData, pk}).then(async () => {
            this.errors = {}
            console.log(this.docsToUpload)
            if (this.docsToUpload.length > 0) {
              this.uploadDocsLoader = true
              for (let doc of this.docsToUpload) {
                this.uploadDocsCounter++
                await this.saveDoc(doc)
              }
            }
            this.uploadDocsLoader = false
            this.uploadDocsCounter = 0
            this.updateTaskData()
          }).catch(err => {
            this.errors = err.response.data.errors
          })
        }
      }
    },
    createEvent() {
      this.task['type'] = 'task'
        this.$emit('createEvent', this.task)
    },
    close() {
      if (this.$refs.tagsList) {
        this.$refs.tagsList.clear()
      }
      Object.assign(this.$data, this.$options.data())
      this.$emit('hideCreate')
    },
    async addTaskDoc() {
      this.$emit('newTaskDoc', this.task)
    },
    setExecutor(project) {
      this.$store.dispatch('getProjectDetail', project).then(data => {
        if (this.type === 'create') {
          this.task.executor = data.responsible
        } else {
          if (!this.task.executor) {
            this.task.executor = data.responsible
          }
        }
      })
    },
    async chooseTaskDoc() {
      let existDoc = []
      if (this.task.documents.length > 0) {
        existDoc = this.task.documents.map(obj => {
          return obj.id
        })
      }
      this.$emit('chooseDocs', {project: this.task.project, existDoc: existDoc})
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
    delDocToUpload(i) {
      this.docsToUpload.splice(i, 1);
    },
    docsAdded({formsData, files}) {
      this.docsToUpload = formsData
    },
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
  watch: {
    rectifiedTask() {
      this.updateTaskData()
    },
    docsToUpload() {
      console.log(this.docsToUpload)
    }

  },
  async created() {
    console.log(' console.log(this.event)', this.event)
    await this.$store.dispatch('getProjectList');
    await this.$store.dispatch('getTaskStatusList');
    await this.$store.dispatch('getTaskCategoryList');
    await this.$store.dispatch('allSystemUser')
    this.task.author = this.systemUser.filter(obj => {
      return obj.user.id === this.currentUser.id
    })[0]
    if (this.rectifiedTask) {
     await this.updateTaskData()
    }
    if (this.event) {
      console.log(' console.log(this.event)', this.event)
      let project = this.event.project[0]['pk']? this.event.project[0]['pk'] : this.event.project[0]
      this.task.project = project
      this.task.event = this.event.pk
      console.log(this.task.event)
    } else if (this.project) {
      this.task.project = Number(this.project)
      this.setExecutor(this.project)
    } else if (this.document) {
      this.task.documents = this.document
    }
    if (this.task.project) {
      this.setExecutor(this.task.project)
    }
    this.load = true

  },
  components: {
    AddTag,
    DocumentUploading,
    editDocument,
    ChooseDocument
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