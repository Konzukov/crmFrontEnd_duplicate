<template>
  <v-container>
    <v-dialog v-model="dialog" :width="width">
      <v-card>
        <v-container fluid>
          <v-row justify="center">
            <v-card-title class="">Новое событие </v-card-title>
          </v-row>
          <v-snackbar
              v-model="snackbar.display"
              :color="snackbar.color"
              :timeout="snackbar.timeout"
              right
              top
          >
            {{ snackbar.text }}
          </v-snackbar>
          <v-row justify="start">
            <v-col md="7" sm="12">
              <v-card-text>
                <v-row justify="start"></v-row>
                <v-form ref="newEvent" lazy-validation v-model="valid">
                  <v-row justify="start">
                    <v-col md="3" sm="12">
                      <v-text-field
                          outlined
                          v-model="formData.date"
                          type="datetime-local"
                      ></v-text-field>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col md="8" sm="12">
                      <v-text-field
                          outlined
                          label="Название *"
                          :rules="rules"
                          v-model="formData.name"
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row justify="start" class="mr-5">
                    <v-col md="5" sm="5">
                      <v-autocomplete
                          outlined
                          label="Проект"
                          :items="projectList"
                          v-model="formData.project"
                          append-outer-icon="mdi-plus"
                          @click:append-outer="addNewProject"
                          item-text="name"
                          clearable
                          multiple
                          chips
                          return-object
                      ></v-autocomplete>
                    </v-col>
                    <v-col md="7" sm="12">
                      <v-textarea
                          outlined
                          label="Описание"
                          :rules="rules"
                          :rows="2"
                          v-model="formData.description"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                  <v-row justify="start" class="mr-5">
                    <v-col md="6" sm="12">
                      <v-select
                          outlined
                          label="Категория события *"
                          :items="eventCategory"
                          v-model="formData.category"
                          clearable
                          :rules="rules"
                          item-value="pk"
                          item-text="name"
                          return-object
                          @change="categoryType"
                      ></v-select>
                    </v-col>
                    <v-col md="6" sm="12">

                    </v-col>
                  </v-row>
                  <template v-if="formData.category">
                    <v-card flat transition="slide-x-transition">
                      <v-card-title>
                        <v-row justify="center">
                          <h5>Детализация события</h5>
                        </v-row>
                        <v-card-text>
                          <template v-if="formData.category.name === 'Деньги'">
                            <CreateMoneyEvent
                                @savedEventData="saveAdditionalEvent"
                                :currentEvent="additionalEvent">
                            </CreateMoneyEvent>
                          </template>
                          <template
                              v-else-if="formData.category.name === 'Направленное событие'">
                            <CreateDirectedEvent
                                @savedEventData="saveAdditionalEvent"
                                :currentEvent="additionalEvent">
                            </CreateDirectedEvent>
                          </template>
                          <template v-else-if="formData.category.name === 'Мероприятие'">
                            <CreateMeasureEvent
                                @savedEventData="saveAdditionalEvent"
                                :currentEvent="additionalEvent">
                            </CreateMeasureEvent>
                          </template>
                        </v-card-text>
                      </v-card-title>
                    </v-card>
                  </template>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn color="error" @click="close">Закрыть</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="success" :disabled="!valid || disabled" @click="validate">
                  Сохранить
                </v-btn>
              </v-card-actions>
            </v-col>
            <v-col md="5" sm="12">
              <v-row justify="center">
                <span class="headline">Документы</span>
              </v-row>
              <v-row justify="center">
                <v-col md="10">
                  <v-list>
                    <template v-for="(item, index) in document">
                      <v-list-item :key="item.fileName">
                        <v-list-item-content>
                          <v-list-item-title v-html="item.fileName"></v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-row>
                            <v-btn icon @click="downloadDoc(item)">
                              <v-icon color="success lighten-1">mdi-download</v-icon>
                            </v-btn>
                            <v-btn icon @click="editItem(item)">
                              <v-icon color="primary lighten-1">mdi-eye</v-icon>
                            </v-btn>
                            <v-btn icon @click="deleteItem(item)">
                              <v-icon color="error darken-1">mdi-delete</v-icon>
                            </v-btn>
                          </v-row>
                        </v-list-item-action>
                      </v-list-item>
                      <v-divider :key="index"></v-divider>
                    </template>
                  </v-list>
                </v-col>
              </v-row>
              <v-row justify="center" class="mt-5">
                <v-btn @click="addEventDoc" :disabled="snackbar.display" fab dark large color="success">
                  <v-icon>mdi-text-box-plus</v-icon>
                </v-btn>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>
    <createDocument @allDocSaved="close"></createDocument>
    <ProjectCreate></ProjectCreate>
    <editDocument></editDocument>
    <deleteDocument @docAddedToTrash="updateDocList"></deleteDocument>
    <v-overlay :value="overlay">
      <v-progress-circular
          indeterminate
          size="64"
      ></v-progress-circular>
      <span>Загрузка...</span>
    </v-overlay>
  </v-container>
</template>

<script>
import ProjectCreate from "../../../referenceBook/Project/ProjectCreate";
import createDocument from "../../PaperFlow/modal/createDocument";
import editDocument from "../../PaperFlow/modal/editDocument";
import deleteDocument from "../../PaperFlow/modal/deleteDocument";
import CreateDirectedEvent from "./CreateDirectedEvent";
import moment from "moment";
import {mapGetters} from "vuex";
import filter from "../../../../mixin/filter";
import _ from "lodash";
import {eventBus} from "../../../../bus";

export default {
  name: "eventTaskClose",
  data() {
    return {
      overlay: false,
      additionalEvent: {},
      width: window.innerWidth,
      document: [],
      snackbar: {
        display: false,
        color: '',
        text: ''
      },
      docAdding: false,
      taskAdding: false,
      dialog: false,
      valid: true,
      actionType: '',
      disabled: false,
      selectedCategory: '',
      selectedContractor: '',
      newEventCategory: {
        display: false,
        name: ''
      },
      formData: {
        pk: '',
        name: '',
        date: moment(new Date()).locale('ru').format('yyyy-MM-DThh:mm'),
        category: '',
        description: '',
        route: true,
        project: [],
        task: [],
      },
      sourceRules: [
        i => !!this.formData.source || !!this.formData.custom_source || 'Поле обязательно',
      ],
      rules: [
        v => !!v || 'Поле обязательно',
      ],
    }
  },
  methods: {
    close() {
      this.$emit('addSolution', (this.formData.description))
      Object.keys(this.formData).forEach(key => {
        if (key === 'data') {
          this.formData[key] = new Date()
        } else if (key === 'task') {
          this.formData[key] = []
        } else if (key === 'route') {
          this.formData[key] = true
        } else if (key === 'project') {
          this.formData[key] = []
        } else {
          this.formData[key] = ''
        }
      })
      this.taskAdding = false
      this.docAdding = false
      this.document = '';
      this.dialog = false
      this.additionalEvent = ''
      Object.assign(this.$data, this.$options.data())
      eventBus.$emit('resetAdditionalForm')
    },
    open() {
      this.$store.dispatch('getParticipator').then(() => {
        this.$store.dispatch('getLegalEntity').then(() => {
          this.$store.dispatch('getPhysicalPerson').then(() => {
            this.$store.dispatch('getProjectList').then(() => {
              this.$store.dispatch('getTaskList').then(() => {
              })
            })
          })
        })
      })
    },
    validate() {
      if (this.$refs.newEvent.validate()) {
        this.newEventSave()
      }
    },
    newEventSave() {
      eventBus.$emit('saveDirectedEvent')
    },
    saveProccessing(formData) {
      this.actionType = 'create'
      if (this.actionType === 'create') {
        console.log('3')
        console.log(this.formData.pk)
        // Событие еще не создано pk = ''
        if (!this.formData.pk) {
          this.snackbar.text = `Создание события.... Ожидайте`
          this.snackbar.color = 'primary'
          this.snackbar.display = true
          this.disabled = true
          this.$store.dispatch('createEvent', formData).then((data) => {
            this.formData.pk = data['pk']
            new Promise(async (resolve) => {
              this.eventData = Object.assign({}, data)
              this.snackbar.text = `Событие ${data['name']} успешно создано`
              this.snackbar.color = 'success'
              await setTimeout(() => {
                this.snackbar.display = false
                this.disabled = false
                resolve()
              }, 1500)
            }).then(() => {
              if (!this.snackbar.display) {
                if (!this.docAdding && !this.taskAdding) {
                  this.close()
                  eventBus.$emit('resetAdditionalForm')
                } else {
                  if (this.docAdding) {
                    this.$emit('newEventDocument', this.eventData)
                    this.docAdding = false
                  } else if (this.taskAdding) {
                    this.$emit('createTask', {'event': this.eventData, 'post': null, 'type': 'create'})
                    this.taskAdding = false
                  }
                }
              }
            })
          }).catch((err) => {
            this.disabled = false
          })
        }
        else {
          this.$store.dispatch('getEventDetail', this.formData.pk).then(() => {
            this.eventData = this.$store.getters.eventDetailData
            if (!this.docAdding && !this.taskAdding) {
              this.close()
            } else {
              if (this.docAdding) {
                this.$emit('newEventDocument', this.eventData)
                this.docAdding = false
              } else if (this.taskAdding) {
                this.$emit('createTask', {'event': this.eventData, 'post': null, 'type': 'create'})
                this.taskAdding = false
              }
            }
          }).catch((err) => {
            this.disabled = false
          })
        }
      }
      else if (this.actionType === 'edit') {
        this.$store.dispatch('editEvent', {
          editedEvent: formData,
          pk: this.formData.pk
        }).then((data) => {
          this.eventData = Object.assign({}, data)
          if (!this.docAdding && !this.taskAdding) {
            this.close()
          } else {
            if (this.docAdding) {
              this.$emit('newEventDocument', this.eventData)
              this.docAdding = false
            } else if (this.taskAdding) {
              this.$emit('createTask', {'event': this.eventData, 'post': null, 'type': 'create'})
              this.taskAdding = false
            }
          }
        })
      }
    },
    setCategory(curEvent) {
      if (this.eventCategory) {
        this.eventCategory.forEach(obj => {
          if (obj['name'] === curEvent) {
            this.formData.category = obj['pk']
          }
        })
      }
    },
    addEventCategory() {
      let formData = new FormData()
      formData.append('name', this.newEventCategory.name)
      this.$store.dispatch('createEventCategory', formData).then(() => {
        this.newEventCategory.display = false
      })

    },
    addNewProject() {
      this.$emit('newProject')
    },
    addEventDoc() {
      if (this.$refs.newEvent.validate()) {
        this.docAdding = true
        this.newEventSave()
      }
    },
    downloadDoc(doc) {
      this.$store.dispatch('downloadDocument', {'pk': doc.pk, 'fileName': doc.fileName})
    },
    deleteItem(doc) {
      this.$emit('delDoc', doc)
    },
    editItem(doc) {
      this.$emit('editDoc', doc.pk)
    },
    updateDocList(doc) {
      this.document = this.document.filter(obj => {
        if (obj['pk'] !== doc) {
          return obj
        }
      })
    },
    categoryType() {
      this.$emit('changeCategoryType')
    },
    saveAdditionalEvent({type, data}, addDoc = false, addTask = false) {
      let newEventData = new FormData();
      Object.keys(this.formData).forEach(key => {
        if (typeof this.formData[key] === 'object' && this.formData[key]) {
          if (key === 'task') {
            if (this.formData[key]) {
              this.formData.task.forEach(obj => {
                newEventData.append(key, obj['pk'])
              })
            } else {
              newEventData.append(key, '')
            }
          } else if (key === 'project') {
            if (this.formData.project.length > 0) {
              this.formData.project.forEach(obj => {
                newEventData.append(key, obj['pk'].toString())
              })
            }
          } else if (key === 'date') {
            newEventData.set(key, moment(this.formData[key]).format('YYYY-MM-DD HH:mm:ss'))
          } else {
            newEventData.set(key, this.formData[key]['pk'])
          }
        } else {
          newEventData.set(key, this.formData[key])
        }
      })
      if (type && data) {
        newEventData.set(type, data['pk'])
      }
      this.saveProccessing(newEventData)
    }
  },
  computed: {
    authUser() {
      return new Array(this.$store.getters.authUserData)
    },
    projectList: {
      get() {
        if (this.$store.getters.projectListData) {
          let projectList = this.$store.getters.projectListData
          if (this.formData.participant) {
            projectList = projectList.filter(obj => {
              if (obj['participant']['pk'] === this.formData.participant['pk']) {
                return obj
              }
            })
          }
          return projectList
        }
        return new Array()
      }
    },
    ...mapGetters({
      taskList: 'taskListData',
      eventCategory: 'eventCategoryListData',
      eventDetail: 'eventDetailData'
      // ...
    }),
  },
  mixins: [filter],
  watch: {
    eventCategory(val) {
      if (val.length > 0 && this.selectedCategory) {
        this.setCategory(this.selectedCategory)
      }
    },
    formData: {
      deep: true,
      handler(val) {
        if (this.$refs.newEvent) {
          this.$refs.newEvent.validate()
        }
      }
    },
    contractorData: {
      deep: true,
      handler(val, oldVal) {
        if ((val && oldVal) && val.length > oldVal.length) {
          this.formData.contractor = _.difference(val, oldVal)[0]
        }
      }
    },
    eventDetail: {
      deep: true,
      handler(val) {
        console.log('watcher', this.eventDetail)
        console.log(val)
      }

    }

  },
  created() {
    this.open()
    this.$parent.$on('closeTask', ({task = null, preComplete = null}) => {
      this.actionType = 'create'
      console.log(preComplete)
      this.$store.dispatch('getEventCategory').then(() => {
        this.dialog = true
        let author = this.$store.getters.authUserData
        this.formData.description = '';
        this.formData.author = author['pk'];
        this.formData.date = moment(new Date()).format('YYYY-MM-DDThh:mm');
        this.formData.category = '';
        if (preComplete) {
          Object.keys(preComplete).forEach(key => {
            console.log(key)
            if (key === 'category') {
              this.formData.category = Object.assign({}, preComplete[key])
            } else {
              this.formData[key] = preComplete[key]
            }
          })
          console.log(preComplete.source)
          this.additionalEvent.source = Object.assign({}, preComplete.source)
          this.additionalEvent.type = Object.assign({}, preComplete.type)
        }
      })
    })
  },
  components: {
    ProjectCreate,
    createDocument,
    editDocument,
    deleteDocument,
    CreateDirectedEvent,
  }
}

</script>

<style scoped>

</style>