<template>
  <div :class="[isActive ? 'active' : 'mr-2 not-active', 'filter-component']">
    <transition name="custom-classes-transition"
                enter-active-class="animated fadeInLeft"
                leave-active-class="animated fadeInRight"
    >

      <div v-if="isActive" class="filter">
        <v-col md="12">
          <v-date-picker
              no-title
              v-model="focus"
              :picker-date.sync="month"
              :first-day-of-week="1"
              full-width
              :range="useCalendarRange"
              locale="ru"
              :events="showToCalender"
              event-color="green lighten-1"
              @input="orderingDate"
          ></v-date-picker>
        </v-col>
        <v-col md="10">
          <v-autocomplete
              label="Проект"
              :items="projectList"
              item-text="name"
              item-value="pk"
              v-model="project"
              clearable
          ></v-autocomplete>
        </v-col>
        <v-col md="10">
          <v-autocomplete
              label="Теги"
              :items="tagsList"
              item-value="pk"
              item-text="name"
              multiple
              chips
              v-model="tags"
              clearable
          >
          </v-autocomplete>
        </v-col>
        <v-col md="10">
          <v-autocomplete
              label="Исполнитель"
              :items="userList"
              item-value="pk"
              item-text="fullName"
              return-object
              v-model="user"
              clearable
          >
          </v-autocomplete>
        </v-col>
        <v-btn color="success" @click="applyFilter()">Применить</v-btn>
      </div>
    </transition>
  </div>

</template>

<script>
import moment from 'moment'
import {eventBus} from "@/bus";

export default {
  name: "Filter",
  props: {
    isActive: Boolean,
    allData: Array,
    projectList: Array,
    userList: Array,
    tagsList: Array,
    dataType: String,
    useCalendarRange: Boolean
  },
  data() {
    return {
      month: moment().format('YYYY-MM-DD'),
      focus: moment().format('YYYY-MM-DD'),
      project: '',
      user: '',
      range: [],
      tags: ''
    }
  },
  methods: {
    showFilter() {
      this.isActive = !this.isActive
      eventBus.$emit('filterActive', this.isActive)
    },
    orderingDate() {
      if (typeof this.focus === 'object') {
        this.range = this.focus.sort()
      }
    },
    showToCalender(date) {
      if (this.dataType === 'event') {
        for (let event in this.allData) {
          if (this.allData[event].start.split(' ')[0] === date) {
            return true
          }
        }
      } else if (this.dataType === 'task') {
        if (!date) {
          date = this.focus
        }
        for (let task in this.allData) {
          if (this.allData[task].hasOwnProperty('status') && this.allData[task]['status'] !== 'Выполнена') {
            if (date >= this.allData[task]['date_from'] && date <= this.allData[task]['date_to']) {
              if (date === this.allData[task]['date_to']) {
                return ['#800403', '#1B5E20']
              }
              return '#1B5E20'
            }
          }
        }
      } else if (this.dataType === 'document') {
        for (let i in this.allData) {
          if (this.allData[i].receiving_date === date) return true
        }
      }
    },
    applyFilter() {
      console.log(this.focus)
      let date = '-1';
      let project, user, tags;
      if (!this.project || !this.user) {
        date = moment(this.focus).format('YYYY-M')
      }
      if (this.project) {
        project = this.project
      } else {
        project = -1
      }
      if (this.tags.length > 0) {
        tags = this.tags
      } else {
        tags = -1
      }
      if (this.user) {
        user = this.user.user.pk
      } else {
        user = -1
      }
      if (this.range) {
        date = {from: this.range[0], to: this.range[1]}
      }
      this.$emit('applyFilter', {date, 'project': project, 'user': user, 'tags': tags})
    },
  },
  watch: {
    range() {
      this.$emit('applyRangeFilter', this.range)
    },
    month(val) {
      // 07008597
      let project, user;
      if (this.project) {
        project = this.project
      } else {
        project = -1
      }
      if (this.user) {
        user = this.user.user.pk
      } else {
        user = -1
      }
      if (this.dataType !== 'task') {
        this.$emit('getMonthData', {date: val, 'project': project, 'user': user})
      }
    },
    focus(val) {
      console.log(this.focus)
      this.$emit('getDayListData', val)
    },
  }, created() {
    this.range = this.focus
  }
}
</script>

<style scoped>

@media screen and (max-width: 1024px) {
  div.main div.filter-component {
    min-width: 100%;
    max-width: 100%;
  }
}

>>> .v-date-picker-title {
  align-items: center;
}

div.filter-component.not-active {
  display: none;
}

div.filter-component {
  position: relative;
  flex-grow: 1;
  max-width: 20%;
}

div.filter-component div.hide {
  visibility: collapse;
}

div.filter-component button.toggleBtn {
  position: absolute;
  z-index: 2;
  height: 44px;
  min-width: 44px;
  width: 44px;
  left: -15px;
  top: -15px;
}

</style>