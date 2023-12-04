<template>
  <v-row justify="start">
    <v-col sx="12" sm="12" md="auto">
      <v-card>
        <v-card-title>Выберите проект</v-card-title>
        <v-card-text>
          <v-form>
            <v-row justify="center">
              <v-spacer></v-spacer>
              <v-col md="3" sm="3">
                <v-btn icon @click="display = 'timeLine'"
                       :color="display === 'timeLine' ? 'success' : ''">
                  <v-icon size="36">mdi-chart-timeline-variant</v-icon>
                </v-btn>
              </v-col>
              <v-col md="3" sm="3">
                <v-btn icon @click="display = 'table'"
                       :color="display === 'table' ? 'success' : ''">
                  <v-icon size="36">mdi-table-large</v-icon>
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
            </v-row>
            <v-autocomplete
                :items="projectList"
                label="Проект"
                item-value="pk"
                item-text="name"
                clearable
                v-model="filter.project"
            ></v-autocomplete>
            <v-text-field label="Начало перода"
                          type="date"
                          v-model="filter.range.from"
                          append-icon="mdi-close"
                          @click:append="filter.range.from = ''"
            ></v-text-field>
            <v-text-field label="Конец перода"
                          type="date" v-model="filter.range.to"
                          append-icon="mdi-close"
                          @click:append="filter.range.to = ''"
            ></v-text-field>
            <v-btn block color="primary" @click="getEvent" :disabled="!filter.project">Сформировать</v-btn>
          </v-form>
          <v-row justify="space-around">
            <v-checkbox
                v-model="event"
                label="События"
            ></v-checkbox>
            <v-checkbox
                v-model="task"
                label="Задачи"
            ></v-checkbox>
            <v-checkbox
                v-model="document"
                label="Документы"
            ></v-checkbox>
          </v-row>
          <v-row justify="center" align-content="start">
            <v-btn text @click="downloadReport" :loading="reportLoading"
                   :disabled="reportLoading" block>
              Выгрузить данные
              <template v-slot:loader>
                <v-progress-linear
                    v-model="downloadProgress"
                    height="20"
                    color="success"
                    stream
                    :value="downloadProgress"
                    buffer-value="0"
                    striped
                >
                                            <span
                                                class="text-caption float-left">Формирование отчета... <strong>{{
                                                downloadProgress
                                              }}%</strong>
                                            </span>
                </v-progress-linear>
              </template>
            </v-btn>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col>
      <template>
        <template v-if="loading">
          <v-skeleton-loader
              class="mx-auto"
              width="100%"
              type="table"
          ></v-skeleton-loader>
        </template>
        <template v-else>
          <v-card :height="reportCardHeight()" id="report-card" width="100%">
            <template v-for="(item, i) in reportData">
              <v-card-text :key="i" :class="i % 2===0 ? 'bg-grey' : ''">
                <v-row justify="start" class="mt-2 ml-2 mb-3">
                  <v-col md="2" class="date-type-info">
                    <v-row>{{item.start | filterDate}}</v-row>
                    <v-row class="type">
                      <span v-if="item.type === 'event'">Событие</span>
                      <span v-else-if="item.type === 'task'">Задача</span>
                      <span v-else-if="item.type === 'document'">Документ</span>
                      <span v-else-if="item.type === 'file'">Файл</span>
                    </v-row>
                  </v-col>
                  <v-col md="9">
                    <v-row justify="start" class="item-from">
                      <span v-if="item.type === 'event'">{{item.author | getName}}</span>
                      <span v-else-if="item.type === 'task'">{{item.author | getName}}</span>
                      <span v-else-if="item.type === 'document'">{{item.fromWho | getName}}</span>
                      <span v-else-if="item.type === 'file'">Файл</span>
                    </v-row>
                    <v-row justify="start" class="black--text ">
                      <span v-if="item.type === 'event'">{{item.name}}</span>
                      <span v-else-if="item.type === 'task'">{{item.name}}</span>
                      <span v-else-if="item.type === 'document'">{{item.correspondence_type}}</span>
                      <span v-else-if="item.type === 'file'">Файл</span>
                    </v-row>
                    <v-row justify="start" class="primary--text item-additional-info">
                      <span v-if="item.type === 'event'">{{item.author | getName}} | {{
                          item.start | filterDate
                        }} | {{item.name}}</span>
                      <span v-else-if="item.type === 'task'">{{item.author | getName}} | {{item.name}}</span>
                      <span v-else-if="item.type === 'document'">{{
                          item.author | getName
                        }} | {{item.entry_date | filterDate}} | {{item.file}}</span>
                      <span v-else-if="item.type === 'file'">{{item}}</span>
                    </v-row>

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
                          <v-list-item link v-if="item.type === 'document'" @click="downloadItem(item)">
                            <v-list-item-title>
                              Скачать
                            </v-list-item-title>
                          </v-list-item>
                          <v-divider></v-divider>
                          <v-list-item link @click="editItem(item)">
                            <v-list-item-title>
                              Редактировать
                            </v-list-item-title>
                          </v-list-item>
                          <v-divider></v-divider>
                          <v-list-item link @click="taskCreate(item)">
                            <v-list-item-title>
                              Создать задачу
                            </v-list-item-title>
                          </v-list-item>
                          <v-divider></v-divider>
                          <v-list-item link v-if="item.type === 'document'" @click="changeFile(item)">
                            <v-list-item-title>
                              Заменить
                            </v-list-item-title>
                          </v-list-item>
                          <v-divider></v-divider>
                          <v-list-item link v-if="item.type === 'document'" @click="deleteItem(item)">
                            <v-list-item-title>
                              Удалить
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu >
                      <v-spacer></v-spacer>
                      <v-icon class="mt-10" size="15" v-if="item.type==='event' && item['documents']">mdi-plus</v-icon>
                    </v-row>

                  </v-col>
                </v-row>
              </v-card-text>
            </template>
          </v-card>

          <v-card class="unprocessed" v-if="unprocessedReportData.length > 0">
            <v-card-title>Документы без даты получения</v-card-title>
            <v-card-text>
              <v-card flat>
                <template v-for="(item, i) in unprocessedReportData">
                  <v-card-text :key="i" :class="i % 2===0 ? 'bg-grey' : ''">
                    <v-row justify="start" class="mt-2 ml-2 mb-3">
                      <v-col md="2" class="date-type-info">
                        <v-row class="type">
                          <span v-if="item.type === 'event'">Событие</span>
                          <span v-else-if="item.type === 'task'">Задача</span>
                          <span v-else-if="item.type === 'document'">Документ</span>
                          <span v-else-if="item.type === 'file'">Файл</span>
                        </v-row>
                      </v-col>
                      <v-col md="9">
                        <v-row justify="start" class="item-from">
                          <span v-if="item.type === 'event'">{{item.author | getName}}</span>
                          <span v-else-if="item.type === 'task'">{{item.author | getName}}</span>
                          <span v-else-if="item.type === 'document'">{{item.fromWho | getName}}</span>
                          <span v-else-if="item.type === 'file'">Файл</span>
                        </v-row>
                        <v-row justify="start" class="black--text ">
                          <span v-if="item.type === 'event'">{{item.name}}</span>
                          <span v-else-if="item.type === 'task'">{{item.name}}</span>
                          <span v-else-if="item.type === 'document'">{{item.correspondence_type}}</span>
                          <span v-else-if="item.type === 'file'">Файл</span>
                        </v-row>
                        <v-row justify="start" class="primary--text item-additional-info">
                          <span v-if="item.type === 'event'">{{item.author | getName}} | {{item.start | filterDate}} | {{
                              item.name
                            }}</span>
                          <span v-else-if="item.type === 'task'">{{item.author | getName}} | {{item.name}}</span>
                          <span v-else-if="item.type === 'document'">{{
                              item.author | getName
                            }} | {{item.entry_date | filterDate}} | {{item.file}}</span>
                          <span v-else-if="item.type === 'file'">Файл</span>
                        </v-row>
                      </v-col>
                      <v-col md="1">
                        <v-menu bottom
                                left>
                          <template v-slot:activator="{attrs, on}">
                            <v-icon size="15" v-bind="attrs"
                                    v-on="on">mdi-dots-vertical
                            </v-icon>
                          </template>
                          <v-list class="action bg-grey">
                            <v-list-item link v-if="item.type === 'document'" @click="downloadItem(item)">
                              <v-list-item-title class="text-caption">
                                Скачать
                              </v-list-item-title>
                            </v-list-item>
                            <v-divider></v-divider>
                            <v-list-item link @click="editItem(item)">
                              <v-list-item-title>
                                Редактировать
                              </v-list-item-title>
                            </v-list-item>
                            <v-divider></v-divider>
                            <v-list-item link @click="taskCreate(item)">
                              <v-list-item-title class="text-caption">
                                Создать задачу
                              </v-list-item-title>
                            </v-list-item>
                            <v-divider></v-divider>
                            <v-list-item link v-if="item.type === 'document'" @click="changeFile(item)">
                              <v-list-item-title>
                                Заменить
                              </v-list-item-title>
                            </v-list-item>
                            <v-divider></v-divider>
                            <v-list-item link v-if="item.type === 'document'" @click="deleteItem(item)">
                              <v-list-item-title>
                                Удалить
                              </v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
<!--                        <v-icon>mdi-plus</v-icon>-->
                      </v-col>
                    </v-row>
                  </v-card-text>
                </template>
              </v-card>
            </v-card-text>
          </v-card>
        </template>
      </template>
    </v-col>
    <ErrorHandling ref="errorHandling" :hasError="errors.hasError" :message="errors.message"
                   class="errors"></ErrorHandling>
    <editDocument></editDocument>
    <ChangeFile></ChangeFile>
    <DeleteDocument></DeleteDocument>
  </v-row>
</template>

<script>
import ErrorHandling from "../../ErrorHandling/ErrorHandling";
import {eventBus} from "../../../bus";
import editDocument from "../PaperFlow/modal/editDocument";
import ChangeFile from "@/components/CRM/PaperFlow/modal/ChangeFile";
import DeleteDocument from "@/components/CRM/PaperFlow/modal/deleteDocument";
import moment from "moment";


export default {
  name: "Report",
  data() {
    return {
      scrollerHeight: '',
      display: 'table',
      downloadProgress: 0,
      expanded: [],
      loading: false,
      reportLoading: false,
      event: true,
      task: true,
      post: true,
      document: true,
      file: true,
      filter: {
        project: '',
        user: '',
        range: {
          from: '',
          to: ''
        }
      },
      errors: {
        message: '',
        hasError: false
      }
    }
  },
  computed: {
    projectList: {
      get() {
        if (this.$store.getters.projectListData) {
          return this.$store.getters.projectListData
        }
        return new Array()
      }
    },
    reportData: {
      get() {
        if (this.$store.getters.projectReportListData) {
          let data = this.$store.getters.projectReportListData
          if (this.filter.range.length > 0) {
            data = data.filter(obj => {
              if (this.filter.range.length === 2) {
                if (obj.start >= this.filter.range[0] && obj.start <= this.filter.range[1]) {
                  return obj
                }
              } else {
                if (obj.start >= this.filter.range[0]) {
                  return obj
                }
              }
            })
          }
          return data
        }
        return new Array()
      }
    },
    unprocessedReportData: {
      get() {
        if (this.$store.getters.unprocessedProjectReportListData) {
          return this.$store.getters.unprocessedProjectReportListData
        }
        return new Array()
      }
    },
  },
  methods: {
    getEvent() {
      if (this.filter.project) {
        this.loading = true
        this.$store.dispatch('getProjectReport', {
          project: this.filter.project,
          date: {
            from: this.filter.range.from ? this.filter.range.from : '-1',
            to: this.filter.range.to ? this.filter.range.to : '-1',
          }
        }).then(() => {
          this.loading = false
        })
      }
    },
    orderingDate(item) {
      this.filter.range.sort()
    },
    downloadItem(item) {
      switch (item.type) {
        case "document" :
          this.$store.dispatch('downloadDocument', {'pk': item.pk, 'fileName': item.fileName})
          break
        case 'file':
          this.$store.dispatch('downloadFile', item)
          break
      }
    },
    changeFile(doc) {
      this.$emit('changeFile', doc)
    },
    deleteItem(doc) {
      this.$emit('delDoc', doc)
    },
    taskColor(item) {
      if (item.status.name === 'Выполнена' || item.status === 'Закрыта событием') return 'success'
      else if (item.status === 'Отменена') return
      else return 'error'
    },
    reportCardHeight() {
      let card = document.querySelector('.v-main')
      return card.offsetHeight - 150
    },
    downloadReport() {
      this.reportLoading = true

      this.$store.dispatch('downloadReport', this.filter.project).then((res) => {
        this.reportLoading = false
      }).catch((err) => {
        this.$emit('hasError', {err, fileName: ''})
        this.errors.hasError = true
        this.errors.message = err
        this.reportLoading = false
      })
    },
    taskCreate(item) {
      this.$emit('createTask', {'event': null, 'post': item, 'type': 'create'})
    },
    editItem(item) {
      switch (item.type) {
        case "document" :
          this.$emit('editDoc', item.pk)
          break
        case 'event':
          this.$emit('editEvent', item)
          break
        case 'task':
          this.$emit('editTask', item)
          break
      }
      console.log(item)
    }
  },
  filters: {
    sliceDescription(description) {
      return description.slice(0, 35) + '...'
    },
    filterDate: date => moment(new Date(date)).format('DD.MM.YYYY'),
    getName(obj) {
      if (obj && obj.hasOwnProperty('fullName')) {
        return obj.fullName
      }
      return '-------'
    }
  },
  created() {
    this.$store.dispatch('getProjectList').then(() => {
      this.$store.dispatch('allSystemUser')
    })
  },
  mounted() {
    eventBus.$on('updateProgress', progress => {
      console.log('updateProgress', progress)
      this.downloadProgress = progress
    })
  },
  components: {
    ErrorHandling,
    editDocument,
    ChangeFile,
    DeleteDocument
  }
}
</script>

<style scoped>

* {
  font-family: Arial, sans-serif !important;
}

.action div .v-list-item__title {
  font-size: 15px;
}

.action .v-list-item {
  min-height: 27px;
  max-height: 27px;
}

.date-type-info {
  color: #6ba141;
  font-size: 13px;

}

.item-from {
  font-size: 12px;
}

.item-additional-info {
  font-size: 10px;
}

.item-from + div {
  font-size: 15px;
}

.date-type-info .type {
  color: #75797e;
  font-weight: 100;
  font-size: 13px;
}

.more-action {
  font-size: 100%;
}

>>> .v-card#report-card {
  overflow-x: scroll;
  overflow-y: scroll;
}

>>> .v-card__text {
  padding-bottom: 0;
  padding-top: 1px;
  border-bottom: 1px solid #a1a1a1;
}

.bg-grey {
  background-color: #f4f4f4;

}

i.doc-icon {
  margin: 0 45px;
}

.activeDisplay {
  color: green;
}

.routeIcon {
  color: #30b21d;
}

tr.event-list td {
  border-color: #0D47A1 !important;
  border-top: 2px solid;
  border-bottom: 2px solid;
}

tr.event-list td:first-child {
  border-color: #0D47A1 !important;
  border-left: 2px solid;
}

tr.event-list td:last-child {
  border-color: #0D47A1 !important;
  border-right: 2px solid;
}

tr.task-list td {
  border-color: #B71C1C !important;
  border-top: 2px solid;
  border-bottom: 2px solid;
}

tr.task-list td:first-child {
  border-color: #B71C1C !important;
  border-left: 2px solid;
}

tr.task-list td:last-child {
  border-color: #B71C1C !important;
  border-right: 2px solid;
}

tr.doc-list td {
  border-color: #FFB74D !important;
  border-top: 2px solid;
  border-bottom: 2px solid;
}

tr.doc-list td:first-child {
  border-color: #FFB74D !important;
  border-left: 2px solid;
}

tr.doc-list td:last-child {
  border-color: #FFB74D !important;
  border-right: 2px solid;
}

.unprocessed thead tr span {
  color: #800403 !important;
}
</style>