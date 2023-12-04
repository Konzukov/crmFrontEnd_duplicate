<template>
  <v-container fluid>
    <v-row justify="start" class="mt-2 calendar">
      <vc-calendar :rows="calendarRow" :columns="6" :attributes='attrs'
                   @dayclick="getCorrespondence"
                   color="blue"
                   :property="props"
                   :from-page="startDate"
                   @update:from-page="correspondenceDateList"
                   :class="calendarRow === 2? 'nav-arrow': ''"></vc-calendar>
      <v-btn icon absolute class="collapse-calendar" @click="collapse = !collapse">
        <v-icon>mdi-arrow-collapse-vertical</v-icon>
      </v-btn>
    </v-row>
    <v-card flat class="mt-10" :height="collapse? '50vh': '30vh'">
      <template justify="start" v-for="(item, i) in historyList">
        <v-card-text :key="i" :class="[i % 2===0 ? 'bg-grey' : '', item['processed'] ? '': 'bg-warning']">
          <v-row justify="start">
            <v-col md="2" :class="item.route? 'date-type-info': 'outgoing'">
              <v-row>
                {{ item.start | filterDate }}
              </v-row>
              <v-row>
                {{ item.project | projectCase }}
              </v-row>
            </v-col>
            <v-col md="7">
              <v-row justify="start" class="item-from">
                {{ item.fromWho | getName }}
              </v-row>
              <v-row justify="start">
                {{ item.correspondence_type | getType }}
              </v-row>
              <v-row justify="start" class="primary--text item-additional-info">
                {{ item.author | getName }} | {{ item['entry_date'] | filterDate }} | {{ item.file }}
              </v-row>
            </v-col>
            <v-col md="3" class="action">
              <template>
                <v-icon size="18" class="mr-2" color="primary" @click.prevent="downloadDoc(item)">
                  mdi-download
                </v-icon>
                <v-icon size="18" class="mr-2" color="success" @click="editItem(item)">mdi-pencil
                </v-icon>
                <v-icon size="18" color="error" @click="deleteItem(item)">mdi-delete</v-icon>
                <v-menu offset-y>
                  <template v-slot:activator="{attrs, on}">
                    <v-icon size="18" v-bind="attrs"
                            v-on="on">mdi-dots-horizontal
                    </v-icon>
                  </template>
                  <v-list>
                    <v-list-item link>
                      <v-list-item-icon class="more-action">
                        <v-icon>mdi-file-replace-outline</v-icon>
                      </v-list-item-icon>
                      <v-list-item-title class="text-caption" @click="changeFile(item)">Заменить
                        файл
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item link>
                      <v-list-item-icon class="more-action">
                        <v-icon>mdi-share-variant-outline</v-icon>
                      </v-list-item-icon>
                      <v-list-item-title class="text-caption" @click="createPostOrder(item)">Создать почтовое
                        отправление
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-col>
          </v-row>
        </v-card-text>
      </template>
      <div class="text-center pt-2" v-if="pageCount">
        <v-pagination v-model="page" @input="updatePage" :length="pages" :total-visible="7"></v-pagination>
      </div>
    </v-card>
    <editDocument></editDocument>
    <deleteDocument></deleteDocument>
    <ChangeFile></ChangeFile>
    <CreatePostMail></CreatePostMail>
  </v-container>
</template>

<script>
import editDocument from "./modal/editDocument";
import deleteDocument from "./modal/deleteDocument"
import ChangeFile from "./modal/ChangeFile";
import CreatePostMail from "@/components/PostMail/CreatePostMail";
import customConst from "@/const/customConst";
import {has} from 'lodash'
import moment from "moment";

export default {
  name: "Correspondence",
  data: () => ({
    props:
        {
          titlePosition: 'center',
          navVisibility: 'hover'
        },
    collapse: false,
    page: 1,
    pageCount: 0,
    pageSize: 8,
    calendarData: {},
    correspondenceList: [],
    historyList: [],
    date: {
      year: 2023,
      month: 1,
    },
    calendar: {
      col: 6,
    },
    attrs: [
      {
        highlight: {
          style: {
            backgroundColor: '#547e33',
            borderRadius: '0px'
          },
          contentStyle: {
            color: '#ffffff'
          }
        },
        dates: [],
      },
      {
        dates: new Date(),
        highlight: {
          style: {
            backgroundColor: '#03168f',
            borderRadius: '0px'
          },
          contentStyle: {
            color: '#ffffff'
          }
        },
      }
    ]
  }),
  filters: {
    projectCase(item) {
      let caseCode = ''
      if (item.length >= 1) {
        for (let code of item) {
          caseCode += code.case_number
        }
      } else {
        return item['case_number']
      }
      return caseCode
    },
    getType(item) {
      if (has(item, 'name')) {
        return item.name
      }
      return 'Не указано'
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
    filterDate: date => moment(new Date(date)).format('DD.MM.YYYY'),
  },
  computed: {
    calendarRow() {
      return this.collapse ? 1 : 2
    },
    pages() {
      if (this.pageSize == null || this.pageCount == null) return 60;
      return Math.ceil(this.pageCount / this.pageSize);
    },
    startDate() {
      return this.collapse ? {
        month: new Date().getMonth() - 2,
        year: new Date().getFullYear()
      } : {
        month: 1,
        year: new Date().getFullYear()
      }
    }
  },
  methods: {
    testfunc(e) {
      console.log(e.year)
    },
    async getCorrespondence(item) {
      await this.$http({
        method: "GET",
        url: customConst.PAPERFLOW_API + 'get-correspondence',
        params: {
          date: item.id
        }
      }).then((res) => {
        this.correspondenceList = res.data.data.data
      }).then(async () => {
        this.page = 1
        await this.initPage()
        this.updatePage(this.page)
      })
    },
    initPage: function () {
      this.pageCount = this.correspondenceList.length;
      if (this.pageCount < this.pageSize) {
        this.historyList = this.correspondenceList;
      } else {
        this.historyList = this.correspondenceList.slice(0, this.pageSize);
      }
    },
    updatePage: function (pageIndex) {
      let _start = (pageIndex - 1) * this.pageSize;
      let _end = pageIndex * this.pageSize;
      this.historyList = this.correspondenceList.slice(_start, _end);
      this.page = pageIndex;
    },
    editItem(doc) {
      this.$emit('editDoc', doc.pk)
    },
    downloadDoc(doc) {
      this.$store.dispatch('downloadDocument', {'pk': doc.pk, 'fileName': doc.file})
    },
    deleteItem(doc) {
      this.$emit('delDoc', doc)
    },
    changeFile(doc) {
      this.$emit('changeFile', doc)
    },
    createPostOrder(doc) {
      this.$emit('createPostMail', {
        legalData: '',
        project: doc.project,
        number: '',
        doc: doc.id
      })
    },
    async correspondenceDateList(e) {
      await this.$http({
        method: "GET",
        url: customConst.PAPERFLOW_API + 'correspondence-date-list',
        params: {'year': e.year}
      }).then(res => {
        let dates = res.data.data.dates
        this.attrs[0].dates = []
        this.attrs[0].dates.push(...dates)
      }).catch(err => {
        console.log(err)
      })
    }
  },
  async created() {
   await this.correspondenceDateList({'month': 0, 'year': new Date().getFullYear()})
  },
  components: {
    editDocument,
    deleteDocument,
    ChangeFile,
    CreatePostMail
  }
}
</script>

<style scoped>
.bg-grey {
  background-color: #f4f4f4;
}

>>> .nav-arrow > .vc-pane-container .vc-arrows-container {
  top: 48%
}

.bg-warning {
  background: #eea7a7;
}

.v-card {
  overflow: auto;
}

.action {
  text-align: end;
}

.item-additional-info {
  font-size: 10px;
}

.date-type-info {
  color: #6ba141;
  font-size: 13px;
}

.outgoing {
  color: #0e27cd;
  font-size: 13px;
}

.item-from {
  font-size: 12px;
}

>>> .v-card__title {
  padding: 3px 16px 0 16px;
}

>>> .v-card__text {
  height: 80px;

  border-bottom: 1px solid #a1a1a1;
}

.v-data-table > .v-data-table__wrapper > table > tbody > tr > td,
.v-data-table > .v-data-table__wrapper > table > thead > tr > td,
.v-data-table > .v-data-table__wrapper > table > tfoot > tr > td {
  font-size: 0.775rem;
  height: 40px;
}

>>> .v-data-table {
  height: 70%;
  overflow-y: scroll;
  padding: 0 15px;
  box-sizing: border-box;
}

>>> .warning-row {
  background: #80030347;
}

>>> .el-switch__label:not(.is-active) span {
  color: #88888882;
}

>>> .el-switch__label.is-active {
  color: #02c110;
}

.switch-menu .v-input__control .v-input__slot .v-input--selection-controls__input > label {
  font-size: 14px !important;
}

>>> .v-label {
  font-size: 12px;
}

>>> .vc-title {
  font-size: 14px !important;
  line-height: 16px !important;
}

>>> .vc-day-content {
  font-size: 12px !important;
}

>>> .vc-weekday {
  font-size: 12px !important;
}

>>> .vc-day {
  min-height: 25px !important;
}

>>> .vc-highlight {
  width: 22px !important;
  height: 22px !important;
}

>>> .vc-arrow {
  height: 12px;
  width: 12px;
}

>>> .vc-header {
  padding: 10px 18px 10px 18px;
}

.calendar {
  position: relative;
}

.collapse-calendar {
  bottom: -18px;
  margin: 0 50%;
}
</style>