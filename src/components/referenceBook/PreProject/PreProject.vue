<template>
  <v-container fluid>
    <v-card height="85vh" width="100%" flat>
      <v-toolbar dense>
        <v-spacer></v-spacer>
        <v-toolbar-title>Список до проектов</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon color="warning" @click="showFilter = !showFilter">
          <v-icon>mdi-tune</v-icon>
        </v-btn>
        <template>
          <v-btn v-if="routeDeep === 0" icon color="primary" :to="{name: 'createPreProject'}">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn v-if="routeDeep === 1" icon color="error" :to="{name: 'preProject'}">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-toolbar>
      <div class="filter" v-if="showFilter" :class="showFilter? 'active':''">

      </div>
      <v-card-text>
        <v-row justify="start">
          <v-col :cols="leftCols" style="height: 79vh;">
            <v-card flat >
              <v-card-title>
                <v-row justify="start" class="ml-3">
                  <v-col cols="7">
                    <v-text-field  dense v-model="filter.search" label="Поиск" append-icon="mdi-magnify" single-line
                                  hide-details></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-switch dense label="Отображать архивные" color="success" v-model="filter.showArchive"></v-switch>
                  </v-col>
                </v-row>
              </v-card-title>
              <v-card-text>
                <v-data-table height="41vh" :search="filter.search" :headers="headers" :items="preProjectList" :item-class="is_archive">
                  <template v-slot:item.fio="{ item }" :class="isValid? '': ''">
                    {{ item.fullName }}
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-row justify="start" align="center">
                      <v-checkbox
                          :value="item.id"
                          multiple
                          color="primary"
                          v-model="selectedCase"
                          :disabled="!item['heading_date']"
                      ></v-checkbox>
                      <v-btn icon color="primary">
                        <v-icon @click="editPreProject(item)">mdi-pencil</v-icon>
                      </v-btn>
                    </v-row>
                  </template>
                </v-data-table>
              </v-card-text>
              <v-card-actions>
                <v-row align="baseline" justify="start">
                  <v-col cols="5">
                    <v-text-field v-model="email" label="email для отправки документов" outlined
                                  append-outer-icon="mdi-send"
                                  :disabled="selectedCase.length < 1"
                                  :rules="emailRules">
                      <template v-slot:append-outer>
                        <v-btn icon @click="sendTransition" :disabled="loading">
                          <v-icon>mdi-send</v-icon>
                        </v-btn>
                      </template>
                    </v-text-field>
                  </v-col>
                  или
                  <v-col class="ml-3">
                    <v-btn
                        :class="[selectedCase.length > 0? 'download-enable' : 'download-disable',  ' v-btn download-link ']"
                        @click="generateTransition"
                        :disabled="loading"
                    >Сформировать и скачать
                    </v-btn>
                    <a style="display: none" @click="removeURL" class="download-btn v-btn"></a>
                  </v-col>
                </v-row>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col :cols="rightCols" class="pt-0 pl-1 pr-0">
            <router-view @change-cols="changeColsSize">
              <div slot="create">
                Добавить
              </div>
            </router-view>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-overlay :value="loading">
      <v-progress-circular
          indeterminate
          size="64"
      ></v-progress-circular>
      {{ loadMessage }}
    </v-overlay>
    <SystemMessage :state.sync="state"/>
  </v-container>
</template>

<script>
// import {animate__fadeIn, animate__fadeOut} from 'animate.css'

import customConst from "../../../const/customConst";
import * as moment from "moment";
import SystemMessage from "@/components/UI/SystemMessage.vue";


export default {
  name: "PreProject",
  components: {SystemMessage},
  data() {
    return {
      state: '',
      headers: [
        {text: 'Номер', value: 'code'},
        {text: 'ФИО', value: 'fullName'},
        {text: 'Номер дела', value: 'case_number'},
        {text: 'Дата определния', value: 'definition_date'},
        {text: 'Действия', value: 'actions'},
      ],
      filter: {
        search: '',
        showArchive: false,
      },
      loading: false,
      loadMessage: '',
      email: 'sro_edinstvo@mail.ru',
      emailRules: [
        v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
      ],
      selectedCase: [],
      showFilter: false,
      transitionName: '',
      leftCols: 11,
      rightCols: 1,
      routeDeep: 0,
      downloadDocs: false,
    }
  },
  computed: {
    preProjectList(){
      let data = this.$store.getters.preProjectData
      data = data.filter(item => {
        if (!this.filter.showArchive && !item.archive) return item
        else if (this.filter.showArchive) return item
      })
      return data
    }
    // ...mapGetters({
    //   preProjectList: 'preProjectData'
    // }),
  },
  methods: {
    is_archive(item) {
      console.log(item)
      if (item.archive) {
        return 'archive'
      } else if (!item['heading_date'] || !item['definition_date']){
        return 'has-error'
      }
    },
    isValid(item){
      console.log(item)
    },
    changeColsSize(l, r) {
      this.leftCols = l
      this.rightCols = r
    },
    sendTransition() {
      let formData = new FormData()
      formData.append('cases', this.selectedCase)
      formData.append('email', this.email)
      this.loading = true
      this.loadMessage = 'Формирование и отправка документов'
      return new Promise((resolve, reject) => {
        this.$http({
          method: 'POST',
          url: customConst.REFERENCE_BOOK_API + 'generate-transmittal',
          data: formData
        }).then((res) => {
          setTimeout(() => {
            this.loading = false
          }, 1500)
          this.state = 'success'
          this.$emit('showSystemMessage', {response: res, state: this.state, send: true})
          resolve()
          this.selectedCase = []
          this.email = ''
        }).catch((res) => {
          this.loading = false
          this.state = 'error'
          this.$emit('showSystemMessage', {response: res, state: this.state, send: false})
          reject()
        })
      })
    },
    generateTransition() {
      let formData = new FormData()
      formData.append('cases', this.selectedCase)
      this.loading = true
      const elem = document.getElementsByClassName('download-link')[0]
      elem.innerText = 'Формирование .....'
      return new Promise((resolve, reject) => {
        this.$http({
          method: 'POST',
          url: customConst.REFERENCE_BOOK_API + 'generate-transmittal',
          data: formData
        }).then(res => {
          let now = moment(new Date()).format('YYYY_MM_DD')
          elem.style.display = 'none'
          elem.innerText = 'Сформировать и скачать'
          let element = document.getElementsByClassName('download-btn')[0]
          element.style.display = ''
          element.setAttribute('href', 'data:text/plain;base64,' + res.data);
          element.setAttribute('download', `Пакет документов_${now}.zip`);
          element.innerHTML = 'Скачать'
          this.downloadDocs = true
          URL.revokeObjectURL(element.href);
          this.loading = false
          resolve()
          // element.style.textDecoration = 'none';
          // elem.appendChild(element);
          // element.click();
        }).catch(()=>{
          this.loading = false
        })
      })
    },
    removeURL() {
      let elem = document.getElementsByClassName('download-link')[0]
      let element = document.getElementsByClassName('download-btn')[0]
      URL.revokeObjectURL(element.href);
      element.style.display = 'none'
      elem.style.display = ''
    },
    editPreProject(item) {
      this.$router.push({name: 'editPreProject', params: {id: item.id}})
    },
    sendEmail() {
      console.log('send')
    }
  },
  watch: {
    $route(to, from) {
      console.log(this.$route)
      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length
      if (toDepth > fromDepth) {
        this.leftCols = 6
        this.rightCols = 6
        this.changeColsSize(6, 6)
        this.routeDeep = 1
      } else {
        this.leftCols = 12
        this.rightCols = 0
        this.changeColsSize(12, 0)
        this.routeDeep = 0
      }
      // this.transitionName = toDepth < fromDepth ? animate__fadeIn : animate__fadeOut
    }
  },
  mounted() {
    this.$store.dispatch('getPreProjectList')
  }
}
</script>

<style scoped>
.hide {
  visibility: hidden;
}
>>>.v-data-table{
  min-height: 20vh;
  max-height: 70vh;
}
>>> .archive {
  color: rgba(88, 88, 88, 0.68) !important;
}

>>> .has-error{
  color: rgba(117, 27, 27, 0.68) !important;
}

.download-disable {
  color: grey !important;
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

.download-enable {
  color: green;
}

.show {
  visibility: visible;
}

.filter {
  position: relative;
  margin: 0;
  padding: 0;
  height: 0;
  background-color: #7091A4;
}

.active {
  height: 70px;
  transition: height 50s ease-in;
}

</style>