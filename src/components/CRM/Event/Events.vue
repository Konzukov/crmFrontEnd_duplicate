<template>
  <v-container fluid>
    <v-btn class="mx-2" fab dark absolute right color="green" @click="createEvent()">
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
          <leftFilter :allData.sync="eventList"
                      :projectList="projectList"
                      :dataType="'event'"
                      :isActive="showFilter"

          ></leftFilter>
          <v-col class="list" xs="12" cols="6">
            <v-tabs v-model="activeTab">
              <v-tab>Созданные мной</v-tab>
              <v-tab>Все</v-tab>
              <v-tab>Не определенные</v-tab>
            </v-tabs>
            <v-tabs-items v-model="activeTab">
              <v-tab-item>
                <EventList :event-list="eventUserAuthorList" @viewEvent="viewEvent"></EventList>
              </v-tab-item>
              <v-tab-item>
                <EventList :event-list="eventUserAuthorList" @viewEvent="viewEvent"></EventList>
              </v-tab-item>
              <v-tab-item>
                <EventList :event-list="eventUserAuthorList" @viewEvent="viewEvent"></EventList>
              </v-tab-item>
            </v-tabs-items>
          </v-col>
          <v-col :class="[showDetail || showCreateEvent? 'show': 'hide', 'detail' ]" xs="12">
            <EventDetail v-if="showDetail" :event.sync="selectedEvent"
                         @hideDetail="hideDetail()"
                         @createTask="createTask"
                         @editEvent="editEvent"
            ></EventDetail>
            <TaskCreateComponent v-if="showCreateTask"
                                 :event.sync="selectedEvent"
                                 @createEvent="createEvent"
                                 :project.sync="rectifiedEventProject" @hideCreate="hideCreate()"></TaskCreateComponent>
            <EventCreateComponent
                ref="eventForm"
                :task="task"
                :collapsed="true"
                :rectifiedEvent.sync="rectifiedEvent" v-if="showCreateEvent"
                @createTask="createTask"
                @hideCreate="hideCreate()"></EventCreateComponent>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import moment from 'moment'
import leftFilter from "../../filter/leftFilter";
import {mapGetters} from 'vuex'
import EventList from "@/components/CRM/Event/EventList";
import EventDetail from "@/components/CRM/Event/EventDetail";
import EventCreateComponent from "@/components/CRM/Event/EventCreateComponent";
import TaskCreateComponent from "@/components/CRM/Task/TaskCreateComponent";

export default {
  name: "Events",
  data() {
    return {
      loading: true,
      activeTab: '',
      showFilter: false,
      rectifiedEvent: null,
      showCreateEvent: false,
      showCreateTask: false,
      selectedEvent: {},
      task: '',
      showDetail: false,
      rectifiedEventProject: null,
      eventList: [],
      focus: moment().format('YYYY-MM-DD'),
      type: 'month',
      endDate: null,
      dayEventsList: [],
      nowDate: moment().format('YYYY-MM-DD')
    }
  },
  methods: {
    createEvent(item) {
      console.log(item)
      if (item) {
        if (item.type === 'task') {
          this.task = item
        }
      }
      if (this.showCreateEvent) {
        this.rectifiedEvent = null
        this.$refs.eventForm.close()
      }
      if (this.showCreateTask) {
        this.rectifiedEvent = null
      }
      setTimeout(() => {
        console.log('asdasd')
        this.showDetail = false
        this.showCreateTask = false
        this.showCreateEvent = true
      }, 400)
      console.log(this.showDetail, this.showCreateTask, this.showCreateEvent)
    },
    loadData() {
      if (this.projectList?.length > 0 ) {
        return Promise.resolve(); // Возвращаем успешный промис и завершаем выполнение
      }
      this.$store.dispatch('allSystemUser')
      this.$store.dispatch('getProjectList')
      this.$store.dispatch('getUserEvent')
    },

    detailContent() {
      return 8
    },
    viewEvent(item) {
      this.selectedEvent = item
      this.showCreateEvent = false
      this.showCreateTask = false
      this.showDetail = true
    },
    editEvent(item) {
      this.rectifiedEvent = new Object()
      this.rectifiedEvent['pk'] = item['pk']
      this.rectifiedEvent['type'] = 'edit'
      this.showCreateEvent = true
      this.showCreateTask = false
      this.showDetail = false
    },
    hideDetail() {
      this.showDetail = false
    },
    hideCreate() {
      this.showCreateEvent = false
      this.showCreateTask = false
    },
    createTask(eventData) {
      this.selectedEvent = eventData
      this.rectifiedEventProject = eventData['project'][0] ? eventData['project'][0]['pk'] : eventData['project'][0]
      this.rectifiedEvent = eventData
      this.showCreateEvent = false
      this.showDetail = false
      this.showCreateTask = true
    }
  },
  computed: {
    ...mapGetters({
      projectList: 'projectListData',
      eventUserAuthorList: 'getUserAuthorEventListData'

    })
  },
  watch: {},
  created() {
    this.loadData()
  },
  components: {
    EventDetail,
    EventCreateComponent,
    TaskCreateComponent,
    leftFilter,
    EventList
  }
}
</script>

<style scoped>

@media screen and (max-width: 1024px) {
  div.container div.main {
    flex-wrap: wrap;
  }
}

div.main {
  display: inline-flex;
  flex-wrap: nowrap;
  flex-direction: row;
  width: 100%;
}

div.main > .content {
  flex-grow: 1;
  width: 40%;
  resize: horizontal;
}

>>> .new-event {
  font-size: 24px;
}

button.toggleBtn {
  position: absolute;
  z-index: 2;
  height: 44px;
  min-width: 44px;
  width: 44px;

}
</style>