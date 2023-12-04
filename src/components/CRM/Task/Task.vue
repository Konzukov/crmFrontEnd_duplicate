<template>
  <v-container fluid>
    <v-btn class="mx-2" fab dark absolute right color="green" @click="createTask()">
      <v-icon dark>mdi-plus</v-icon>
    </v-btn>
    <v-btn
        small
        absolute
        depressed
        class="toggleBtn flex"
        @click="showFilter = !showFilter"
    >
      <v-icon>mdi-tune</v-icon>
    </v-btn>
    <v-card class="main " height="100%" width="100%" flat>
      <v-card-text>
        <v-row class="flex flex-nowrap">
          <leftFilter :allData.sync="userTaskList"
                      class="pa-0 ma-0"
                      :projectList="projectList"
                      :userList="userList"
                      :dataType="'task'"
                      :isActive="showFilter"
                      @getMonthData="getUserTaskList"
                      @getDayListData="getDayTaskList"
                      @applyFilter="getUserTaskList"
          ></leftFilter>
          <v-col class="list" xs="12" cols="6">
            <v-tabs v-model="activeTab">
              <v-tab>Назначенные мне</v-tab>
              <v-tab>Созданные мной</v-tab>
              <v-tab>Не определенные</v-tab>
            </v-tabs>
            <v-tabs-items v-model="activeTab">
              <v-tab-item>
                <TaskList :task-list="userExecutorTaskList" @viewTask="viewTask"></TaskList>
                <v-btn @click="downloadTaskList('userExecutorTaskList')" color="primary">Скачать</v-btn>
              </v-tab-item>
              <v-tab-item>
                <TaskList :task-list="userAuthorTaskList" @viewTask="viewTask"></TaskList>
                <v-btn @click="downloadTaskList('userAuthorTaskList')" color="primary">Скачать</v-btn>
              </v-tab-item>
              <v-tab-item>
                <TaskList :task-list="indefiniteTaskList" @viewTask="viewTask"></TaskList>
                <v-btn @click="downloadTaskList('indefiniteTaskList')" color="primary">Скачать</v-btn>
              </v-tab-item>
            </v-tabs-items>
          </v-col>
          <v-col :class="[showDetail || showCreateTask || showCreateEvent? 'show': 'hide', 'detail' ]" xs="12">
            <TaskDetail v-if="showDetail" :task="selectedTask"
                        @hideDetail="hideDetail()"
                        @editTask="editTask"
                        @createEvent="createEvent"
            ></TaskDetail>
            <TaskCreateComponent
                ref="taskForm"
                :rectifiedTask.sync="rectifiedTask" v-if="showCreateTask"
                :event.sync="event"
                @createEvent="createEvent"
                @updateTaskList="dispatchStoreData"
                @hideCreate="hideCreate()"></TaskCreateComponent>
            <EventCreateComponent @hideCreate="hideEvent" v-if="showCreateEvent"
                                  @createTask="createTask"
                                  @updateTaskList="dispatchStoreData"
                                  :task="selectedTask"></EventCreateComponent>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <createDocument></createDocument>
  </v-container>
</template>

<script>
import moment from 'moment'
import {mapGetters,} from 'vuex'
import leftFilter from "../../filter/leftFilter";
import TaskDetail from "@/components/CRM/Task/TaskDetail";
import TaskCreateComponent from "@/components/CRM/Task/TaskCreateComponent";
import TaskList from "@/components/CRM/Task/TaskList";
import createDocument from "@/components/CRM/PaperFlow/modal/createDocument";
import EventCreateComponent from "@/components/CRM/Event/EventCreateComponent";
import customConst from "@/const/customConst";


export default {
  name: "Task",
  data() {
    return {
      showDetail: false,
      activeTab: '',
      showCreateTask: false,
      isCloseTask: false,
      showCreateEvent: false,
      showFilter: false,
      rectifiedTask: null,
      event: null,
      focus: moment().format('DD.MM.YYYY'),
      currentDay: moment().format('DD.MM.YYYY'),
      dayTaskList: [],
      expanded: [],
      deadLineTaskList: [],
      selectedTask: {},
      loading: true,
      search: '',
      headers: [
        {text: 'Исполнитель', value: 'executor'},
        {text: 'Проект', value: 'project.name'},
        {text: 'Задача', value: 'name'},
        {text: 'Дата До', value: 'date_to'},
        {text: 'Actions', value: 'actions', sortable: false},
      ]
    }
  },
  methods: {
    dispatchStoreData() {
      this.$store.dispatch('allSystemUser').then(() => {
        this.$store.dispatch('getProjectList').then(() => {
          this.$store.dispatch('getUserExecutorTask')
          this.$store.dispatch('getUserAuthorTask')
          this.$store.dispatch('getIndefiniteTask')
          this.getUserTaskList({date: '-1'})
          this.loading = false
        })
      })
    },
    getUserTaskList({date, project = '-1', user = '-1', tags = '-1'}) {
      this.$store.dispatch('getUserTaskList', {date, project, user, tags})
    },
    getDayTaskList(date) {
      this.focus = date
      this.dayTaskList = this.userTaskList.filter(obj => {
        if (date >= obj['date_from'] && date <= obj['date_to']) {
          return obj
        }
      })
    },
    getUserTask() {
      this.$emit('getUserTask')
    },
    createTask(item) {
      this.rectifiedTask = null
      this.event = null
      if (this.showCreateTask) {
        this.$refs.taskForm.close()
      }
      setTimeout(() => {
        if (item) {
          this.event = item
          if (item.type === 'event') {
            this.event = item
          }
        }
        this.showDetail = false
        this.showCreateEvent = false
        this.showCreateTask = true
      }, 400)
      // this.$emit('createTask', {'event': null, 'post': null, type: 'create'})
    },
    editTask(item) {
      this.rectifiedTask = new Object()
      this.rectifiedTask['pk'] = item['pk']
      this.rectifiedTask['type'] = 'edit'
      this.showCreateTask = true
      this.showDetail = false
      this.showCreateEvent = false
    },
    mainContent() {
      return 12
    },
    detailContent() {
      return 8
    },
    viewTask(item) {
      this.selectedTask = item
      this.showCreateTask = false
      this.showCreateEvent = false
      this.showDetail = true
    },
    hideDetail() {
      this.showDetail = false
    },
    hideCreate() {
      this.showCreateTask = false
    },
    hideEvent() {
      this.showCreateEvent = false
      this.showDetail = true
    },
    createEvent(item) {
      this.selectedTask = item
      this.showCreateEvent = true
      this.showDetail = false
      this.showCreateTask = false
    },
    downloadTaskList(item) {
      function download(data) {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'report.xls'); //or any other extension
        document.body.appendChild(link);
        link.click();
      }

      switch (item) {
        case 'userExecutorTaskList':
          this.$http({
            method: "GET",
            url: customConst.CRM_API + 'download-executor-task',
            responseType: "arraybuffer",
          }).then(res => {
            download(res.data)
          })
          break
        case 'userAuthorTaskList':
          this.$http({
            method: "GET",
            url: customConst.CRM_API + 'download-author-task',
            responseType: "arraybuffer",
          }).then(res => {
            download(res.data)
          })
          break
        case 'indefiniteTaskList':
          this.$http({
            method: "GET",
            url: customConst.CRM_API + 'download-indefinite-task',
            responseType: "arraybuffer",
          }).then(res => {
            download(res.data)
          })
          break
      }
    }

  },
  computed: {
    taskList: {
      get() {
        if (!this.loading) {
          return this.$store.getters.taskListData
        }
        return new Array()
      }
    },
    ...mapGetters({
      userList: 'allSystemUsersData',
      projectList: 'projectListData',
      currentUser: 'authUserData',
      userTaskList: 'userTaskListData',
      userExecutorTaskList: 'userExecutorTaskListData',
      userAuthorTaskList: 'userAuthorTaskListData',
      indefiniteTaskList: 'indefiniteTaskListData',
    })
  },
  watch: {
    userTaskList: {
      deep: true,
      handler(val) {
        if (val) {
          this.getDayTaskList(this.focus)
        }
      }
    },
  },
  created() {
    this.dispatchStoreData()

  },
  components: {
    TaskDetail,
    TaskList,
    leftFilter,
    TaskCreateComponent,
    createDocument,
    EventCreateComponent
  }
}
</script>

<style scoped>


.deadline-task-list {
  border: 1px solid #800403;
}

.task-list {
  border: 1px solid green;
}

.hide {
  display: none;
}

.show {
  display: flex;
}

button.toggleBtn {
  position: absolute;
  z-index: 2;
  height: 44px;
  min-width: 44px;
  width: 44px;

}
</style>