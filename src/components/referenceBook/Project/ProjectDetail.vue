<template>
  <v-container fluid>
    <v-overlay :value="archiveLoader">
      <v-progress-circular
          indeterminate
          size="64"
      >
        <span>Ожидайте формирование и скачивание архива... {{ downloadProgress }}</span>
      </v-progress-circular>
    </v-overlay>
    <v-card height="103px" class="case-header">
      <v-card-title>{{ projectDetail.case_number }}</v-card-title>
      <v-card-subtitle>Рассматривается в первой инстанции</v-card-subtitle>
      <span class="primary--text item-additional-info pl-4 mb-2" style="font-size: 12px">
        {{ projectDetail.code }} : {{ projectDetail | getContractor }} :  {{ projectDetail | getBirthday }} : процедура идет {{
          projectDetail | dayCount
        }} дней
      </span>
    </v-card>
    <v-card height="200px" :style="collapse? 'display: none': 'display: block'">
      <v-tabs
          height="30px"
          v-model="activeTab"
          fixed-tabs
          class="case-tabs-item"

      >
        <v-tab value="one">
          <span class="case_icon  mr-3">
              <i class="parts"></i>
          </span>
          Участники дела
        </v-tab>
        <v-tab value="two">
          <span class="case_icon mr-3">
              <i class="judge"></i>
          </span>
          Суды и судьи
        </v-tab>
        <v-tab value="three">
          <span class="case_icon mr-3">
              <i class="act"></i>
          </span>
          Судебные акты
        </v-tab>
      </v-tabs>
      <v-window v-model="activeTab">
        <v-window-item class="case-tab__content">
          <ProjectDetailParts :projectInfo="projectDetail"></ProjectDetailParts>
        </v-window-item>
        <v-window-item class="case-tab__content">
          <ProjectDetailJudge :projectInfo="projectDetail"></ProjectDetailJudge>
        </v-window-item>
        <v-window-item class="case-tab__content">
          <!--          <v-card width="100%" height="100%" style="position: absolute"></v-card>-->
        </v-window-item>
      </v-window>
    </v-card>

    <v-item-group dark active-class="active-menu" mandatory class="main-menu" v-model="activeMenu">
      <v-row justify="center" align-content="center" class="align-center mt-0">
        <div class="main-btn-group ">
          <v-item v-slot="{ active, toggle }">
            <v-card :to="{name: 'procedure'}" class="text-center nav-btn"
                    @click="toggle">
              Процедура
            </v-card>
          </v-item>
          <v-item v-slot="{ active, toggle }">
            <v-card :to="{name: 'project-report'}" class="text-center nav-btn"
                    @click="toggle">
              Карточка
            </v-card>
          </v-item>
          <v-item v-slot="{ active, toggle }">
            <v-card :to="{name: 'file-view'}" class="text-center nav-btn"
                    @click="toggle">
              Файлы
            </v-card>
          </v-item>
          <v-item v-slot="{ active, toggle }">
            <v-card :to="{name: 'project-questionnaire'}" class="text-center nav-btn"
                    @click="toggle">
              Анкета
            </v-card>
          </v-item>
          <v-item v-slot="{ active, toggle }">
            <v-card :to="{name: 'project-money'}" class="text-center nav-btn"
                    @click="toggle">
              Деньги
            </v-card>
          </v-item>
          <v-item v-slot="{ active, toggle }">
            <v-card :to="{name: 'separate-dispute'}" class="text-center nav-btn"
                    @click="toggle">
              Обособленные споры
            </v-card>
          </v-item>

        </div>
        <v-btn icon absolute class="collapse-calendar" @click="collapse = !collapse">
          <v-icon>mdi-arrow-collapse-vertical</v-icon>
        </v-btn>
      </v-row>
    </v-item-group>
    <router-view :project="projectPK" :collapsed="collapse" :act="projectDetail.act" :freePart="projectFreePart"
                 class="main-content">

    </router-view>
    <v-fab-transition>
      <v-btn
          color="primary"
          fab
          small
          dark
          bottom
          right
          class="v-btn--example"
          @click="downloadArchive(projectPK)"
      >
        <v-icon>mdi-folder-download</v-icon>
      </v-btn>
    </v-fab-transition>
    <v-dialog v-model="showDownloadUrl" width="40vw">
      <v-card>
        <v-toolbar dense>
          <v-toolbar-title>Ссылка на файл</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="showDownloadUrl = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text style="height: 30vh; align-content: center;">
          <v-row justify="start">
            <v-col cols="12">
              <h3>{{ downloadUrl }}</h3>
              <h3>Данная ссылку будет доступна в течении 30 минут</h3>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-row class="ma-0">
            <v-col cols="auto">
              <v-btn color="success" @click="downloadFile">Скачать</v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn color="primary" @click="copyUrl">{{ copyUrlText ? "Ссылка скопирована" : "Скопировать ссылку" }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--    <v-speed-dial v-model="fab" bottom left>-->
    <!--      <template v-slot:activator>-->
    <!--        <v-btn v-model="fab" color="blue darken-2" dark fab>-->
    <!--          <v-icon v-if="fab">-->
    <!--            mdi-close-->
    <!--          </v-icon>-->
    <!--          <v-icon v-else>-->
    <!--            mdi-cloud-download-outline-->
    <!--          </v-icon>-->
    <!--        </v-btn>-->
    <!--      </template>-->
    <!--      <v-btn fab dark small color="red" @click="downloadArchive(projectPK)">-->
    <!--        <v-icon>mdi-folder-download</v-icon>-->
    <!--      </v-btn>-->
    <!--    </v-speed-dial>-->
  </v-container>
</template>

<script>
import {mapGetters,} from 'vuex'
import customConst from "@/const/customConst";
import ProjectDetailParts from "@/components/referenceBook/Project/ProjectDetail/ProjectDetailParts";
import ProjectDetailJudge from "@/components/referenceBook/Project/ProjectDetail/ProjectDetailJudge";
// import {saveAs} from 'file-saver'
import moment from "moment";


export default {
  name: "ProjectDetail",
  data: () => ({
    showDownloadUrl: false,
    copyUrlText: false,
    downloadUrl: '',
    collapse: true,
    activeTab: null,
    activeMenu: 1,
    fab: false,
    projectPK: null,
    projectFreePart: null,
    archiveLoader: false,
    downloadProgress: 0,
  }),
  methods: {
    copyUrl() {
      navigator.clipboard.writeText(this.downloadUrl).then(() => {
        this.copyUrlText = true
      }).catch(err => {
        alert('Ошибка при копировании ссылки.');
      });
    },
    downloadFile() {
      window.location.href = this.downloadUrl;
    },
    downloadArchive(projectPK) {
      this.archiveLoader = true
      this.$http({
        method: 'GET',
        url: customConst.REPORT_API + 'download-docs/' + projectPK,
      }).then((response) => {
        this.showDownloadUrl = true
        this.archiveLoader = false
        this.downloadUrl = `${customConst.BASE_URL}/media/generated_report_archive/${response.data.data.data}`
      }).catch(err => {
        this.archiveLoader = false
        console.log(err)
      })
    },
    uploadToCloud(projectPK) {
      this.$http({
        method: 'GET',
        url: customConst.REPORT_API + 'upload-docs-to-cloud/' + projectPK
      })
    }
  },
  computed: {
    ...
        mapGetters({
          projectDetail: 'projectDetailData'
        })
  },
  filters: {
    getContractor(item) {
      if (item.legal_contractor) {
        console.log(item.legal_contractor)
        return item.legal_contractor?.full_name
      }
      return item.physical_contractor?.fullName

    },
    getBirthday(item) {
      if (item.physical_contractor) {
        return moment(item.physical_contractor.birthday).format('DD.MM.YYYY')
      } else {
        return '----'
      }
    },
    dayCount(item) {
      if (item.act) {
        console.log(item.act)
        let duration = moment.duration(moment(new Date()).diff(new Date(item.act)))
        return Math.floor(duration.asDays())
      }
    }
  },
  async mounted() {
    this.projectPK = this.$route.params['pk']
    await this.$store.dispatch('getProjectDetail', this.$route.params['pk']).then(async (data) => {
      this.projectFreePart = data?.['procedure_free_part']
      await this.$router.push({name: 'project-report'})
    })
  },
  components: {
    ProjectDetailParts,
    ProjectDetailJudge
  }
}
</script>

<style scoped>
.link-actions input[type="text"] {
  width: 100%;
  padding: 8px;
  margin-right: 10px;
}

.v-btn--example {
  bottom: 0;
  position: absolute;
  margin: 0 0 16px 95%;
  z-index: 9999;
}

.main-content {
  height: 60vh;
  overflow: auto;
}

.main-menu {
  position: relative;
}

.collapse-calendar {
  bottom: 5px;
  left: 25px;
}

>>> .v-window {
  height: 100% !important;
  position: relative;
  background: white !important;
}

.case_icon {
  display: block;
  position: relative;
  height: 17px;
  padding: 8px 0 5px 15px;
  overflow: hidden;
}

.case_icon > i {
  position: absolute;
  top: 0;
  display: block;
  width: 672px;
  height: 16px;
  background: url('~@/assets/image/icons-sprite.png') no-repeat;

}

.case_icon > i.act {
  left: -223px;
}

.case_icon > i.judge {
  left: -160px;
}

.case_icon > i.parts {
  left: -128px;
}

.case-header {
  background-color: #e6e8ea;
  margin-top: -12px;
  font-family: Arial, sans-serif;
  border-bottom: 1px solid #5f6776;
  border-radius: 0px;
}

.case-header .v-card__title {
  color: #75797e !important;
  font-size: 15px;
}


.case-header .v-card__subtitle {
  padding-bottom: 4px;
  color: #919498;
  font-size: 12px;
  text-shadow: 1px 1px 0 #f5f6f7;
}

>>> .case-tabs-item > .v-item-group.v-tabs-bar {
  background-color: #67bbff !important;
  color: white !important;
  border-bottom: none;

}

.v-tabs-bar__content > .v-tab.v-tab {
  max-width: none;
  justify-content: left;
  text-transform: none;
  font-size: 12px;
  font-weight: bold;
  font-family: Arial, sans-serif;
  border-left: thin black;
  border-right: 1px solid black;
  border-bottom: 1px solid black;
  box-shadow: 10px 0px 8px -2px rgba(34, 60, 80, 0.49);
}

.v-tabs-bar__content > .v-tab.v-tab--active {
  background-color: #ffffff !important;
  color: #67bbff;
}

.case-tab__content {
  background-color: white;

}

.main-btn-group {
  height: 30px;
  display: flex;
  border: 1px solid #9BA1AA;
  border-bottom: 2px solid #9BA1AA;
  border-radius: 3px;
}

.main-btn-group a:first-child {
  border-radius: 3px 0 0 3px;
}

.main-btn-group a:last-child {
  border-radius: 0 3px 3px 0;
}

.v-progress-circular__info span {
  width: 300px;
  margin-top: 170px;
  margin-left: 25px;
}

>>> .v-speed-dial__list {
  left: 0;
  width: 60px;
}

>>> .v-speed-dial--left {
  left: 95%;
}

>>> .v-speed-dial--bottom {
  bottom: 5vh;
}

.v-card {
  font-family: arial, sans-serif !important;
}

h2.title {
  color: #75797e;
  font-weight: normal;
  font-size: 15px !important;
}

div.v-item-group {
  background: -webkit-linear-gradient(top, #7f8692, #4c525e);
  text-shadow: -1px -1px 0 #424751;
  height: 50px;
}

div.v-item-group .row {
  height: 50px;
}

.v-card.nav-btn {
  padding: 5px 0 4px;
  border-right: 1px solid #4D5462;
  border-left: 1px solid #878D98;
  text-align: center;
  text-shadow: -1px -1px #505865;
  line-height: 20px;
  cursor: pointer;
  width: 159px;

  background-color: transparent;
  font-size: 12px !important;
}

.active-menu.nav-btn {
  background-color: #494d56 !important;
  border-left: 1px solid #494d56;
}

div.container {
  padding: 0 !important;
}

.v-tab {
  font-size: 12px;
}
</style>