<template>
  <v-container fluid :style="collapsed? 'height: 75vh': 'height: 55vh'" class="flex">
    <v-row
        v-if="loading"
        class="fill-height"
        align-content="center"
        justify="center"
    >
      <v-col
          class="text-subtitle-1 text-center"
          cols="12"
      >
        Получаем данные на сайте суда
      </v-col>
      <v-col cols="6">
        <v-progress-linear
            color="deep-purple accent-4"
            indeterminate
            rounded
            height="6"
        ></v-progress-linear>
      </v-col>
    </v-row>
    <v-row justify="start" class="ma-0" style="height: 100%;" v-else>
      <v-col :cols="12" style="height: 100%">
        <v-card id="report-card" width="100%" height="100%"
                class="overflow-x-hidden">
          <template v-for="(item, i) in historyList">
            <v-card-text :key="i"
                         :class="[i % 2===0 ? 'bg-grey' : '']">
              <v-row justify="start" class="mt-2 ml-2 mb-3 ">
                <v-col md="2" >
                  <v-row class="date-type-info">{{ item.date }}</v-row>
                  <v-row class="type">
                    <span>{{ item.type }}</span>
                  </v-row>
                </v-col>
                <v-col md="10" align-self="end">
                  <template v-if="item.file">
                    <v-row v-if="item.additionalInfo" justify="space-between" class="row-info">
                      <span>{{ item['case_subject'] }}</span>
                      <span>{{ item.additionalInfo }}</span>
                    </v-row>
                    <v-row justify="start" class="item-from">
                      <a v-if="item.file" :href="item.file" target="_blank">{{ item.description }}</a>
                    </v-row>
                    <v-row v-if="item['file_pub_date']">
                      <span>{{ item['file_pub_date'] }}</span>
                    </v-row>
                  </template>
                  <template v-else>
                    <v-row v-if="item.additionalInfo" justify="space-between" class="row-info">
                      <span>{{ item['case_subject'] }}</span>
                      <span>{{ item.additionalInfo }}</span>
                    </v-row>
                    <v-row v-else>
                      <span>{{ item['case_subject'] }}</span>
                    </v-row>
                    <v-row justify="start" class="item-from">
                      {{ item.description }}
                    </v-row>
                    <v-row v-if="item['file_pub_date']">
                      <span>{{ item['file_pub_date'] }}</span>
                    </v-row>
                  </template>
                </v-col>
              </v-row>
            </v-card-text>
          </template>
          <div class="text-center pt-2 pagination">
            <v-btn small color="primary" @click="showAll">Все</v-btn>
            <v-pagination v-model="page" @input="updatePage" :length="pages" :total-visible="7"></v-pagination>
            <v-btn small color="success" @click="loadCourtDocument">Загрузить с сайта суда</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>

export default {
  props: ['rectifiedProject', 'collapsed'],
  name: "CurtCard",
  data: () => ({
    loading: false,
    historyList: [],
    page: 1,
    pageCount: 0,
    pageSize: 8,
    project: {
      pk: '',
      name: '',
      code: '',
      procedure: '',
      case_number: '',
      legal_agent: '',
      physical_agent: '',
      publication_date: '',
      publication_number: '',
      publication_number_page: '',
      publication_issue_number: '',
      publication_date_efrsb: '',
      publication_number_efrsb: '',
      report_date: '',
      participant: '',
      legal_contractor: '',
      physical_contractor: '',
      description: '',
      objective: '',
      responsible: '',
      court: '',
      judge: '',
      comment: '',
      court_document: []
    },
  }),
  computed: {
    pages() {
      if (this.pageSize == null || this.pageCount == null) return 60;
      return Math.ceil(this.pageCount / this.pageSize);
    },
  },
  methods: {
    loadCourtDocument() {
      this.loading = true
      this.$http({
        method: "GET",
        url: `http://80.254.125.196:9563/parse?case_number=${this.project.case_number}`,
        // url: `http://127.0.0.1:8000/parse?case_number=${this.project.case_number}`,
      }).then(res => {
        this.project.court_document = [...res.data.data]
        if (this.project.pk) {
          this.save()
        }
      }).finally(() => {
        this.loading = false
      })
    },
    save() {
      let formData = new FormData()
      Object.keys(this.project).forEach(key => {
        if (key === 'court_document') {
          formData.append(key, JSON.stringify(this.project[key]))
        } else {
          formData.append(key, this.project[key])
        }
      })
      this.$store.dispatch('editProject', {formData, pk: this.project.pk})
    },
    async updateData() {
      await this.$store.dispatch('getProjectDetail', this.project.pk).then(res => {
        Object.keys(this.project).forEach(key => {
          if (typeof res[key] === 'object') {
            if (res[key]) {
              this.project[key] = res[key]['id']
            } else {
              this.project[key] = ''
            }
          } else {
            if (key === 'court_document') {
              this.project.court_document = JSON.parse(res[key])
            } else {
              this.project[key] = res[key]
            }

          }
        })
        if (this.project.legal_agent) {
          this.agent = this.$store.getters.legalEntityData.filter(obj => {
            return obj.pk === this.project.legal_agent
          })[0]
        } else if (this.project.physical_agent) {
          this.agent = this.$store.getters.physicalPersonData.filter(obj => {
            return obj.pk === this.project.physical_agent
          })[0]
        }
        if (this.project.legal_contractor) {
          this.contractor = this.$store.getters.legalEntityData.filter(obj => {
            return obj.pk === this.project.legal_contractor
          })[0]
        } else if (this.project.physical_contractor) {
          this.contractor = this.$store.getters.physicalPersonData.filter(obj => {
            return obj.pk === this.project.physical_contractor
          })[0]
        }
      })
    },
    initPage: function () {
      this.pageCount = this.project.court_document.length;
      if (this.pageCount < this.pageSize) {
        this.historyList = this.project.court_document;
      } else {
        this.historyList = this.project.court_document.slice(0, this.pageSize);
      }
    },
    updatePage: function (pageIndex) {
      let _start = (pageIndex - 1) * this.pageSize;
      let _end = pageIndex * this.pageSize;
      this.historyList = this.project.court_document.slice(_start, _end);
      this.page = pageIndex;
    },
    showAll: function () {
      this.historyList = this.project.court_document
      this.page = 1;
    }
  },
  async created() {
    this.project.pk = this.$route.params['pk']
    await this.updateData()
    this.initPage()
  },

}
</script>


<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center
}
>>> .v-card__text {
  max-height: 100px;
  min-height: 60px;
  padding-bottom: 0;
  padding-top: 1px;
  border-bottom: 1px solid #a1a1a1;
}

.date-type-info {
  color: #6ba141;
  font-size: 13px;

}
.type {
  font-size: 13px;
}
.item-from{
  font-size: 15px;
}
.row-info{
  font-size: 12px;
}

.bg-grey {
  background-color: #f4f4f4;
}

>>> .v-pagination li button {
  height: 25px;
  min-width: 25px;
}

>>> .v-pagination__item {
  font-size: 14px;
}
</style>