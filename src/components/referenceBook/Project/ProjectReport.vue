<template>
  <v-container fluid :style="collapsed? 'height: 75vh': 'height: 55vh'">
    <v-row justify="start" class="ma-0" style="height: 100%;">
      <v-col :cols="cols.left" style="height: 100%">
        <v-card id="report-card" width="100%" height="100%"
                class="overflow-x-hidden">
          <template v-for="(item, i) in historyList">
            <v-card-text :key="i"
                         :class="[i % 2===0 ? 'bg-grey' : '', item.route && item.route !== 'Исходящее'? '': 'bg-out']">
              <v-row justify="start" class="mt-2 ml-2 mb-3 ">
                <v-col md="2" class="date-type-info">
                  <!--                  .receiving_date ? item.receiving_date : item['entry_date']-->
                  <v-row>{{ item | filterDate }}</v-row>
                  <v-row class="type">
                    <span v-if="item.type === 'event'">Событие</span>
                    <span v-else-if="item.type === 'task'">Задача</span>
                    <span v-else-if="item.type === 'document'">Документ</span>
                    <span v-else-if="item.type === 'post'">Почта</span>
                  </v-row>
                </v-col>
                <v-col md="9">
                  <v-row justify="start" class="item-from">
                    <span v-if="item.type === 'event'">{{ item.author | getName }}</span>
                    <span v-else-if="item.type === 'task'">{{ item.author | getName }}</span>
                    <span v-else-if="item.type === 'document'">{{ item.fromWho | getName }}</span>
                    <span v-else-if="item.type === 'post'">{{ item.from_who | getName }}</span>
                  </v-row>
                  <v-row justify="start"
                         :class="['black--text', ] ">
                    <span v-if="item.type === 'event'">{{ item.name }}</span>
                    <span v-else-if="item.type === 'task'">{{ item.name }}</span>
                    <span v-else-if="item.type === 'document'"
                          :class="item.correspondence_type === 'Отказ в предоставлении ответа на запрос финансового управляющего'? 'font-weight-bold colored': ''">{{
                        item.correspondence_type
                      }}</span>
                    <span v-else-if="item.type === 'post'">{{ item.correspondence_type }}</span>
                  </v-row>
                  <v-row justify="start" class="primary--text item-additional-info">
                    <span v-if="item.type === 'event'">
                      {{ item.author | getName }} | {{ item | filterDate }} | {{ item.name }}
                    </span>
                    <span v-else-if="item.type === 'task'">
                      {{ item.author | getName }} | {{ item.name }}
                    </span>
                    <span v-else-if="item.type === 'document'">
                      {{ item.author | getName }} | {{ item | filterDate }} | {{ item.file }}
                    </span>
                    <span v-else-if="item.type === 'post'">
                      {{ item.user | getName }} | {{ item | filterDate }} | {{ item | fileName }}
                    </span>
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
                        <v-list-item v-if="item.type === 'document' || item.type === 'post'" link
                                     @click="showDocument(item)">
                          <v-list-item-title>
                            Показать документ
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="item.type === 'document'" link @click="addToSendQueue(item)">
                          <v-list-item-title>
                            Отправить документ
                          </v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item link @click="createTask(item)">
                          <v-list-item-title>
                            Создать задачу
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item link @click="createEvent(item)">
                          <v-list-item-title>
                            Создать событие
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
                    <v-spacer></v-spacer>
                    <v-icon class="mt-10" size="15" v-if="item.type==='event' && item['documents']">mdi-plus</v-icon>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>
          </template>
          <div class="text-center pt-2 pagination">
            <v-btn small color="primary" @click="showAll">Все</v-btn>
            <v-pagination v-model="page" @input="updatePage" :length="pages" :total-visible="7"></v-pagination>
          </div>
        </v-card>
      </v-col>
      <v-col :cols="cols.right" :style="[detailView? 'display: block': 'display: none', 'height: 100%']">
        <v-card height="100%"
                flat
                class="overflow-x-hidden">
          <DocumentPreView :document-list="selectedDocumentList"></DocumentPreView>
<!--          <DocumentViewer :documentUrl="documentUrl" @closeView="closeView" v-if="detailView"></DocumentViewer>-->
          <TaskDetail v-if="showDetail" :task="selectedTask"
                      @hideDetail="hideDetail()"
                      @editTask="editTask"
          ></TaskDetail>
          <TaskCreateComponent
              ref="taskForm"
              :collapsed="this.collapsed"
              :document="documentTask"
              :project="project"
              :event="rectifiedEvent"
              :rectifiedTask.sync="rectifiedTask" v-if="showCreateTask"
              @createEvent="createEvent"
              @hideCreate="hideCreate()"></TaskCreateComponent>
          <EventCreateComponent
              ref="eventForm"
              :collapsed="this.collapsed"
              @hideCreate="hideEvent"
              @createTask="createTask"
              :rectifiedEvent.sync="rectifiedEvent"
              :document="documentEvent"
              :project="project" v-if="showCreateEvent"
              :task="selectedTask"></EventCreateComponent>
        </v-card>
      </v-col>
    </v-row>
    <v-container class="d-none">
      <ErrorHandling></ErrorHandling>
      <editDocument></editDocument>
      <ChangeFile @finished="getData"></ChangeFile>
      <DeleteDocument @finished="getData"></DeleteDocument>
      <PostEdit></PostEdit>
      <SystemMessage :state.sync="state" @forceAdd="addToSendQueue(sendQueueItem, true)"/>
    </v-container>
  </v-container>
</template>

<script>
import moment from "moment";
import ErrorHandling from "@/components/ErrorHandling/ErrorHandling";
import editDocument from "@/components/CRM/PaperFlow/modal/editDocument";
import ChangeFile from "@/components/CRM/PaperFlow/modal/ChangeFile";
import DeleteDocument from "@/components/CRM/PaperFlow/modal/deleteDocument";
import PostEdit from "@/components/CRM/PaperFlow/Post/modal/PostEdit";
// import DocumentDetail from "@/components/CRM/PaperFlow/DocumentView";
// import DocumentViewer from "@/components/CRM/PaperFlow/DocumentViewer.vue";
import TaskDetail from "@/components/CRM/Task/TaskDetail";
import TaskCreateComponent from "@/components/CRM/Task/TaskCreateComponent";
import EventCreateComponent from "@/components/CRM/Event/EventCreateComponent";
import SystemMessage from "@/components/UI/SystemMessage.vue";
import DocumentPreView from "@/components/CRM/PaperFlow/DocumentPreView/DocumentPreView.vue";
export default {
  props: ['project', 'collapsed'],
  name: "ProjectReport",
  data: () => ({
    state: '',
    cols: {
      left: 12,
      right: 0,
    },
    page: 1,
    pageCount: 0,
    pageSize: 8,
    historyList: [],
    detailView: false,
    showDetail: false,
    showCreateTask: false,
    showCreateEvent: false,
    documentUrl: null,
    selectedDocumentList: [],
    selectedTask: {},
    rectifiedTask: null,
    rectifiedEvent: null,
    documentTask: null,
    documentEvent: null,
    sendQueueItem: null,
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
  }),
  methods: {
    getData() {
      this.$store.dispatch('getProjectReport', {
        project: this.filter.project,
        date: {
          from: this.filter.range.from ? this.filter.range.from : '-1',
          to: this.filter.range.to ? this.filter.range.to : '-1',
        }
      }).then(() => {
        this.loading = false
        this.initPage()
        this.updatePage(this.page)
      })
    },
    orderingDate(item) {
      this.filter.range.sort()
    },
    addToSendQueue(item, force = false) {
      let formData = new FormData()
      this.sendQueueItem = item
      formData.append('doc', item.id)
      formData.append('force', force.toString())
      this.$store.dispatch('addToSendQueue', formData).then(res => {
        this.sendQueueItem = null
        this.state = 'success'
        this.$emit('showSystemMessage', {response: res, state: this.state, send: false})
      }).catch(err => {
        this.state = 'error'
        this.$emit('showSystemMessage', {response: err, state: this.state, send: false})
      })
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
    async changeFile(doc) {
      await this.$emit('changeFile', doc)
    },
    async deleteItem(doc) {
      await this.$emit('delDoc', doc)
    },
    reset() {
      this.rectifiedEvent = null
      this.rectifiedTask = null
      this.documentEvent = null
      this.documentTask = null
      this.selectedTask = null
    },
    taskColor(item) {
      if (item.status.name === 'Выполнена' || item.status === 'Закрыта событием') return 'success'
      else if (item.status === 'Отменена') return 'warning'
      else return 'error'
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
    createTask(item) {
      this.cols.right = 6
      this.cols.left = 6
      this.reset()
      if (item.type === 'document') {
        this.documentTask = item
      }
      if (this.showCreateTask) {
        this.$refs.taskForm.close()
      }
      setTimeout(() => {
        this.showDetail = false
        this.showCreateEvent = false
        if (item.type === 'event') {
          this.rectifiedEvent = item
        }
        this.showCreateTask = true
        this.cols.right = 6
        this.cols.left = 6
      }, 400)
    },
    createEvent(item) {
      this.cols.right = 6
      this.cols.left = 6
      this.reset()
      if (item.type === 'document') {
        this.documentEvent = item
      }
      if (this.showCreateEvent) {
        this.rectifiedEvent = null
        this.$refs.eventForm.close()
      }
      setTimeout(() => {
        this.showDetail = false
        if (item.type === 'task') {
          this.selectedTask = item
        }
        this.showCreateEvent = true
        this.showCreateTask = false
        this.cols.right = 6
        this.cols.left = 6
      }, 400)
    },
    editItem(item) {
      switch (item.type) {
        case "document" :
          this.$emit('editDoc', item.pk)
          break
        case 'event':
          this.editEvent(item)
          break
        case 'task':
          // this.$emit('editTask', item)
          this.editTask(item)
          break
        case 'post':
          this.$emit('editPost', item.pk)
          break
      }
    },
    hideDetail() {
      this.showDetail = false
      this.cols.right = 0
      this.cols.left = 12
    },
    hideEvent() {
      this.showCreateEvent = false
      this.cols.right = 0
      this.cols.left = 12
    },
    hideCreate() {
      this.showCreateTask = false
      this.cols.right = 0
      this.cols.left = 12
    },
    showDocument(item) {
      this.detailView = true
      this.cols.left = 6
      this.cols.right = 6
      if (item.type === 'post') {
        console.log(item)
        this.selectedDocumentList = [...item['post_documents']]

      }else{
        this.documentUrl = item.url
      }
    },
    closeView() {
      this.detailView = false
      this.cols.left = 12
      this.cols.right = 0

    },
    editTask(item) {
      this.reset()
      this.showCreateTask = false
      this.showCreateEvent = false
      this.cols.right = 6
      this.cols.left = 6
      this.rectifiedTask = {}
      setTimeout(() => {
        this.rectifiedTask['pk'] = item['pk']
        this.rectifiedTask['type'] = 'edit'
        this.showCreateEvent = false
        this.showCreateTask = true
        this.showDetail = false
      }, 50)
    },
    editEvent(item) {
      this.reset()
      this.showCreateEvent = false
      this.showCreateTask = false
      this.cols.right = 6
      this.cols.left = 6
      this.rectifiedEvent = {}
      setTimeout(() => {
        this.rectifiedEvent['pk'] = item['pk']
        this.rectifiedEvent['type'] = 'edit'
        this.showCreateTask = false
        this.showCreateEvent = true
        this.showDetail = false
      }, 50)
    },
    initPage: function () {
      this.pageCount = this.reportData.length;
      if (this.pageCount < this.pageSize) {
        this.historyList = this.reportData;
      } else {
        this.historyList = this.reportData.slice(0, this.pageSize);
      }
    },
    updatePage: function (pageIndex) {
      let _start = (pageIndex - 1) * this.pageSize;
      let _end = pageIndex * this.pageSize;
      this.historyList = this.reportData.slice(_start, _end);
      this.page = pageIndex;
    },
    showAll: function () {
      this.historyList = this.reportData
      this.page = 1;
    }
  },
  computed: {
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
    pages() {
      if (this.pageSize == null || this.pageCount == null) return 60;
      return Math.ceil(this.pageCount / this.pageSize);
    },
  },
  async mounted() {
    await this.getData()
    setTimeout(async () => {
      await this.showAll()
    }, 1000)
  },
  filters: {
    sliceDescription(description) {
      return description.slice(0, 35) + '...'
    },
    filterDate(item) {
      if (item.type === 'document') {
        return moment(new Date(item.receiving_date)).format('DD.MM.YYYY')
      } else if (item.type === 'post') {
        return moment(new Date(item.departure_date)).format('DD.MM.YYYY')
      } else if (item.type === 'event') {
        return moment(new Date(item.start)).format('DD.MM.YYYY')
      } else if (item.type === 'task') {
        return moment(new Date(item.start)).format('DD.MM.YYYY')
      }
      // return moment(new Date(date)).format('DD.MM.YYYY'),
    },
    getName(obj) {
      if (typeof obj === 'object') {
        if (obj && obj.hasOwnProperty('fullName')) {
          return obj.fullName
        }
        return '-------'
      } else {
        return obj
      }

    },
    fileName(item) {
      let files = []
      if (item && item.hasOwnProperty('post_documents')) {
        if (Array.isArray(item['post_documents'])) {
          for (let docs of item['post_documents']) {
            files.push(docs.fileName)
          }
          return files.join(', ')
        }
        return 'Нет вложения'
      }
      return 'Нет вложения'
    }
  },
  async created() {
    this.filter.project = this.$route.params['pk']
  },
  components: {
    DocumentPreView,
    SystemMessage,
    ErrorHandling,
    editDocument,
    TaskCreateComponent,
    EventCreateComponent,
    TaskDetail,
    ChangeFile,
    DeleteDocument,
    // DocumentViewer,
    PostEdit
  }
}
</script>

<style scoped>
.bg-warning {
  background: #eea7a7;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center
}

.pagination .v-btn {

}

>>> .v-pagination li button {
  height: 25px;
  min-width: 25px;
}

>>> .v-pagination__item {
  font-size: 14px;
}

.colored {
  color: #7a1111;
}

.container {
  overflow: hidden;
}

.detail-view {
  display: none;
}

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
  height: 80px;
  padding-bottom: 0;
  padding-top: 1px;
  border-bottom: 1px solid #a1a1a1;
}

.bg-out {
  background-color: rgba(11, 39, 177, 0.3) !important;
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