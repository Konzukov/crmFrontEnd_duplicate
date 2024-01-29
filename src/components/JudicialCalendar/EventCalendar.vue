<template>
  <v-container fluid>
    <v-sheet
        tile
        height="54"
        class="d-flex"
    >
      <v-switch class="ml-5" label="Показать только мои" v-model="onlyMyEvent"></v-switch>
      <v-spacer></v-spacer>
      <v-btn
          icon
          class="ma-2"
          @click="$refs.calendar.prev()"
      >
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>

      <v-select
          v-model="type"
          :items="calendarType"
          item-value="val"
          item-text="text"
          dense
          outlined
          hide-details
          class="ma-2"
          label="Отображать"
      ></v-select>

      <v-btn
          icon
          class="ma-2"
          @click="$refs.calendar.next()"
      >
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </v-sheet>
    <v-sheet :height="windowHeight">
      <v-calendar
          ref="calendar"
          :type="type"
          v-model="value"
          :weekdays="[1,2,3,4,5]"
          first-interval="8"
          :events="judicialEventList"
          interval-count="12"
          locale="ru"
          :event-color="getEventColor"
          @click:event="showEventDetail"
          @click:date="viewDayEvent"
          event-overlap-mode="column"
          :event-overlap-threshold="30"
      >
        <!--   moment(date).format('DD.MM.YYYY')     -->
        <template v-slot:day-label-header="{date}">{{ date | moment }}</template>
      </v-calendar>
      <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          content-class="calendar-card"
          top
          offset-y
          offset-x
          allow-overflow
          transition="scale-transition"
          max-width="350px"
      >
        <v-card v-if="detailLoaded(selectedEvent)">
          <v-skeleton-loader
              class="pa-3"
              min-width="350px"
              max-width="350px"
              type="card-heading, text, text, text , text, text, text, text"
          ></v-skeleton-loader>
        </v-card>
        <v-card
            v-else
            color="grey lighten-4"
            min-width="350px"
            max-width="350px"
            flat
        >
          <v-toolbar dark>
            <v-toolbar-title v-html="selectedEvent['project_name']"></v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="editJudicialEvent(selectedEvent)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text>
            <template>
              <p>
                <strong>Номер дела</strong>
                <span v-html="': ' + selectedEvent.case_number"></span>
              </p>
              <p>
                <strong>Начало заседания</strong>
                <span v-html="': ' + selectedEvent.date_begin"></span>
              </p>
              <p>
                <strong>Место проведения</strong>
                <span v-html="': ' + selectedEvent.location"></span>
              </p>
              <p>
                <strong>Судья</strong>

                <span v-if="selectedEvent.judge">: {{ selectedEvent.judge.full_name }}</span>
                <span v-else v-html="': ' "></span>

              </p>
              <p>
                <strong>Категория</strong>
                <span v-html="': ' + selectedEvent.category"></span>
              </p>
              <div>
                <p>
                  <strong>Требование суда</strong>
                </p>
                <p style="height: 30vh; overflow-y: scroll">
                  {{ selectedEvent.court_requirement }}
                </p>
              </div>
              <p>
                <strong>Ссылка на определение:</strong><a :href="selectedEvent.definition_url"
                                                          target="_blank">{{ selectedEvent.definition_url }}</a>
              </p>
              <v-row>
                <v-col cols="6">
                  <strong>Ответственный:</strong>
                  <span v-html="selectedEvent.responsible  !== null ? selectedEvent.responsible : ' Не указан'"></span>
                </v-col>
                <v-col cols="6">
                  <strong>Срок исполнения:</strong>
                  <span
                      v-html="selectedEvent.date_execution === null ? selectedEvent.date_execution : ' Не указано'"></span>
                </v-col>
              </v-row>
            </template>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-sheet>
    <v-btn color="primary" bottom @click="newJudicialSession"
           right outlined fab icon class="v-btn-plus">
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <v-btn color="success" bottom @click="downloadReport"
           right outlined fab icon class="v-btn-download">
      <v-icon>mdi-download</v-icon>
    </v-btn>
    <v-btn color="warning" bottom @click="parseJudicialSession"
           right outlined fab icon class="v-btn-parse">
      <v-icon>mdi-reload</v-icon>
    </v-btn>
    <NewJudicialEvent @saveDone="saveDone"></NewJudicialEvent>
  </v-container>
</template>

<script>
import NewJudicialEvent from "@/components/JudicialCalendar/NewJudicialEvent";
import moment from 'moment'
import {isEmpty} from 'lodash'
import customConst from "@/const/customConst";

export default {
  name: "EventCalendar",
  data: () => ({
    type: 'week',
    windowHeight: window.innerHeight - 300,
    value: '',
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    onlyMyEvent: false,
    colors: ['#F48FB1', '#3F51B5', '#EF6C00', '#1B5E20',],
    calendarType: [
      {val: 'month', text: 'Месяц'},
      {val: 'week', text: 'Неделя'},
      {val: 'day', text: 'День'},
    ],
  }),
  computed: {
    judicialEventList() {
      let judicialEventListData = this.$store.getters.judicialEventData
      if (this.onlyMyEvent) {
        const curUser = this.$store.getters.currentUserData[0]
        return judicialEventListData.filter(obj => obj.responsible === curUser.uuid)
      }
      return judicialEventListData
    },
    title() {
      const {start, end} = this
      if (!start || !end) {
        return ''
      }
      const startMonth = this.monthFormatter(start)
      const endMonth = this.monthFormatter(end)
      const suffixMonth = startMonth === endMonth ? '' : endMonth
      const startYear = start.year
      const endYear = end.year
      const suffixYear = startYear === endYear ? '' : endYear
      const startDay = start.day + this.nth(start.day)
      const endDay = end.day + this.nth(end.day)
      switch (this.type) {
        case 'month':
          return `${startMonth} ${startYear}`
        case 'week':
        case '4day':
          return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`
        case 'day':
          return `${startMonth} ${startDay} ${startYear}`
      }
      return ''
    },
    monthFormatter() {
      return this.$refs.calendar.getFormatter({
        timeZone: 'UTC', month: 'long',
      })
    },
    currentUserInfo() {
      return this.$store.getters.currentUserData[0]
    }
  },
  methods: {
    saveDone(event) {
      this.$store.dispatch('detailJudicialEvent', event).then(eventDetail => {
        this.selectedEvent = eventDetail
      })
      console.log('saveDone')
    },
    newJudicialSession() {
      this.$emit('newJudicialSession')
    },
    getEventColor(event) {
      switch (event['category_id']) {
        case 1:
        case 9:
        case 10:
        case 11:
          return this.colors[0]
        case 2:
        case 3:
          return this.colors[1]
        case 7:
        case 8:
          return this.colors[3]
        case 4:
        case 5:
        case 6:
          return this.colors[2]
        default:
          return '#90CAF9'
      }
    },
    showEventDetail({nativeEvent, event}) {
      this.selectedEvent = {}
      const open = () => {
        this.selectedElement = nativeEvent.target
        requestAnimationFrame(() => requestAnimationFrame(() => this.selectedOpen = true))
        this.$store.dispatch('detailJudicialEvent', event['id']).then(eventDetail => {
          this.selectedEvent = eventDetail
        })
      }

      if (this.selectedOpen) {
        this.selectedOpen = false
        requestAnimationFrame(() => requestAnimationFrame(() => open()))
      } else {
        open()
      }

      nativeEvent.stopPropagation()
    },
    viewDayEvent({date}) {
      this.focus = date
      this.type = 'day'
    },
    detailLoaded(selectedEvent) {
      return isEmpty(selectedEvent)
    },
    editJudicialEvent(judicialEvent) {
      this.$emit('editJudicialEvent', (judicialEvent))
    },
    downloadReport() {
      this.$http({
        method: "GET",
        url: customConst.CRM_API + "export-judicial-sessions",
        responseType: "arraybuffer",
      }).then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'report.xls'); //or any other extension
        document.body.appendChild(link);
        link.click();
      })
    },
    showOnlyMyEvent() {

    },
    parseJudicialSession() {
      this.$http({
        method: 'GET',
        url: customConst.CRM_API + 'run-session-parsing',
      }).then(res => {
        console.log(res)
      })
    }
  },
  filters: {
    moment: function (date) {
      return moment(date).format('DD.MM.YYYY');
    }
  },
  created() {
    this.$store.dispatch('getJudicialEvent')
  },
  components: {
    NewJudicialEvent
  }
}
</script>

<style scoped>
.v-btn-plus {
  bottom: 20px;
  right: 20px;
  position: fixed;
  margin: 0 0 16px 16px;
}

.v-btn-download {
  bottom: 20px;
  right: 80px;
  position: fixed;
  margin: 0 0 16px 16px;
}

.v-btn-parse {
  bottom: 20px;
  right: 140px;
  position: fixed;
  margin: 0 0 16px 16px
}

.v-btn-eye {
  bottom: 20px;
  right: 120px;
  position: fixed;
  margin: 0 0 16px 16px;
}

.v-application p {
  margin-bottom: 5px;
}
.calendar-card{
  top: 95px !important;
}
</style>