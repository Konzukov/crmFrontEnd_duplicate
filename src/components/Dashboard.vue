<template>
  <v-app class="main-app">
    <SystemUpdateNotice></SystemUpdateNotice>
    <v-navigation-drawer
        app
        v-model="drawer"
        mini-variant
        height="95vh"
        permanent
        expand-on-hover
        mini-variant-width="50"
        :clipped="$vuetify.breakpoint.mdAndUp"
    >
      <v-list rounded>
        <v-list-item>
          <v-list-item-content v-if="userData.profile">
            <v-select
                :items="userData.profile['available_organization']"
                item-text="name"
                item-value="uuid"
                v-model="activeOrganization"
                @change="changeActiveOrganization"
            ></v-select>
          </v-list-item-content>
        </v-list-item>
        <v-list-item-group color="primary" v-if="userData.profile">
          <template v-for="(system, id) in userData.profile.service">
            <v-list-item v-if="system.app_name"
                         :key="id"
                         :to="{name: system.app_name}"
            >
              <v-list-item-icon v-if="system.app_name === 'money'">
                <span class="money-icon"></span>
              </v-list-item-icon>
              <v-list-item-icon v-else>
                <v-icon v-text="system.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="system.name"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-else
                         :key="id"
            >
              <v-list-item-icon>
                <v-icon v-text="system.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="system.name"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <v-list-item :to="{name: 'event-calendar'}">
            <v-list-item-icon>
              <v-icon>mdi-calendar-clock</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Календарь</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item :to="{name: 'background-task'}">
            <v-list-item-icon>
              <v-icon>mdi-view-list</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Фоновые задания</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item :to="{name: 'documentGenerator'}">
            <v-list-item-icon>
              <v-icon>mdi-file-document-edit</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Документы</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app dense height="35px">
      <v-row justify="end">
        <v-col md="3" >{{ new Date().toLocaleDateString() }}</v-col>
        <v-col md="3" id="user-info">
          <v-menu
              open-on-hover
              top
              offset-y
          >
            <template v-slot:activator="{ on, attrs }">
                                <span v-bind="attrs"
                                      v-on="on"
                                      v-if="userData.first_name && userData.last_name">
                                  {{ userData.first_name }} {{ userData.last_name }} </span>
              <span v-bind="attrs"
                    v-on="on" v-else> {{ userData.username }} </span>
            </template>

            <!--              <v-list>-->
            <!--                <v-list-item>-->
            <!--                  <v-list-item-title>-->
            <!--                    <router-link :to="{name: 'userSetting'}">Настройки</router-link>-->
            <!--                  </v-list-item-title>-->
            <!--                </v-list-item>-->
            <!--              </v-list>-->
          </v-menu>
          <span> | <a @click="logout">Выход</a></span>
        </v-col>
      </v-row>
    </v-app-bar>
    <!-- Sizes your content based upon application components -->
    <v-main class="main-content" style="padding: 38px 0 12px 48px;">
      <!-- Provides the application the proper gutter -->
      <!-- If using vue-router -->
      <router-view></router-view>
      <v-main v-if="$route.name === 'crm' || $route.name === 'dashboard'" class="mr-2 mt-2 ml-2 pa-0">
        <v-row justify="center" align="center" @drop="onDrop($event, 1)">
          <v-col md="4" sm="12" xs="12" @dragstart="onDragStart($event, 1)" class="dash-title"
                 v-if="(!detailActive.task & !detailActive.event && !detailActive.doc) || detailActive.task"
          >
            <v-row justify="center">
              <h2 class="headline">
                Задачи
              </h2>
            </v-row>
            <v-row justify="center">
              <v-btn fab elevation="0" class="dash-active-btn"
                     :to="{name: 'task-list'}"
                     translate="animatedPulse"
                     @click="showDetailInfo(dashboardItems[0].task, 'task')"
                     :width="taskFont() + 15"
                     :height="taskFont() + 15"
                     :style="{fontSize: taskFont(),
                         color: convert(0.7)}">{{ dashboardTaskList.total }}
              </v-btn>

            </v-row>
          </v-col>
          <v-col md="4" sm="12" xs="12" class="dash-title"
                 v-if="(!detailActive.task & !detailActive.event && !detailActive.doc) || detailActive.event"
          >
            <v-row justify="center">
              <h2 class="headline">
                События
              </h2>
            </v-row>
          </v-col>
          <v-col md="4" sm="12" xs="12" class="dash-title"
                 v-if="(!detailActive.task & !detailActive.event & !detailActive.doc) || detailActive.doc"
          >
            <v-row justify="center">
              <h2 class="headline">
                Документы
              </h2>
            </v-row>
          </v-col>
        </v-row>
        <v-row v-if="showBackMenu">
          <template v-for="(item, index) in dashboardItems">
            <v-btn absolute icon v-for="(obj, key) in item" :key="key"
                   :style="{top: 30 + (index*50) + 'px', left: '10px'}">
              <v-icon size="36" v-if="!obj.active">{{ obj.icon }}</v-icon>
              <v-icon size="36" v-else @click="goBack(obj, key)">mdi-undo</v-icon>
            </v-btn>
          </template>
        </v-row>
      </v-main>
    </v-main>
    <v-footer
        padless
    >
    </v-footer>
  </v-app>
</template>

<script>
import moment from 'moment'
import {mapGetters, mapActions} from 'vuex'
import SystemUpdateNotice from "@/components/UI/SystemUpdateNotice.vue";
import {eventBus} from "@/bus";


export default {
  name: "Dashboard",
  data() {
    return {
      navDrawerPinned: false,
      dashboardItems: [
        {
          task: {
            name: 'Задачи',
            icon: 'mdi-clipboard-list-outline',
            active: false,
            detail: false,
          }
        },
        {
          event: {
            name: 'События',
            icon: 'mdi-lightbulb-on-outline',
            active: false,
            detail: false,
          }
        },
        {
          doc: {
            name: 'Документы',
            icon: 'mdi-file-outline',
            active: false
          }
        },
      ],
      showBackMenu: false,
      detailActive: {
        task: false,
        event: false,
        doc: false
      },
      drawer: null,
      menu: false,
      expanded: [],
      selectedDate: [],
      today: moment().format('YYYY-MM-DD'),
      physicalPersonAction: false,
      fab: false,
      loading: true,
      activeOrganization: '',
      notice: {},
    }
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn
    },
    userData() {
      return this.$store.getters.authUserData
    },
    ...mapGetters({
      dashboardTaskList: 'dashboardUserTaskList',
    }),
    userTaskList: {
      get() {
        if (this.$store.getters.userTaskListData) {
          return this.$store.getters.userTaskListData
        }
        return new Array()
      }
    },
    // userEventList: {
    //   get() {
    //     if (this.$store.getters.userEventListData) {
    //       return this.$store.getters.userEventListData
    //     }
    //     return new Array()
    //   }
    // },

  },
  methods: {
    logout: function () {
      this.$store.dispatch('logout', this.userData.pk)
          .then(() => {
            this.$router.push('/login')
          })
    },
    async endLoading() {
      this.activeOrganization = this.userData.profile.active_organization['uuid']
      this.loading = !this.loading
    },
    showDetailInfo(obj, title) {
      obj.active = true
      this.showBackMenu = true
      this.detailActive[title] = true
    },
    goBack(obj, title) {
      obj.active = false
      this.showBackMenu = false
      this.detailActive[title] = false

    },
    eventDetail(event) {
      this.$emit('editEvent', event)
    },
    editTask(item) {
      this.$emit('editTask', {item, type: 'edit'})
    },
    ...mapActions({
      getDashboardTaskList: 'getDashboardTaskList'
    }),
    convert(opacity) {
      let r = Math.floor(100 / (this.dashboardTaskList['total'] / this.dashboardTaskList['expired']))
      // let g = Math.floor(100 / (this.dashboardTaskList['total'] / this.dashboardTaskList['done']))
      // let b = Math.floor(100 / (this.dashboardTaskList['total'] / this.dashboardTaskList['open']))
      return "rgba(" + r + ", " + 0 + ", " + 0 + ", " + opacity + ")";
    },
    taskFont() {
      if (this.dashboardTaskList.total > 70) {
        return 30 + 'px'
      }
      return (10 + this.dashboardTaskList.total) + 'px'
    },
    changeActiveOrganization(item) {
      let formData = new FormData()
      formData.set('uuid', item)
      this.$store.dispatch('changeOrganization', formData).then(() => {
        location.reload()
      })
    },
  },
  async created() {
    await this.$store.dispatch('checkAuth').then(async (data) => {
      await this.$store.dispatch('getSystemUpdateNotice').then(notice => {
        let showNotice = notice['display_user'].filter(obj => obj.uuid === this.userData.uuid)
        if (showNotice?.length) {
          eventBus.$emit('showSystemUpdateMessage', {notice, uuid: this.userData.uuid})
        }
      })
    })
    await this.getDashboardTaskList()
    await this.$store.dispatch('getLegalEntity')
    await this.$store.dispatch('getUserTaskList', {'user': -1, 'project': -1, 'tags': '-1'})
    // this.$store.dispatch('getUserEventList')
    this.selectedDate.push(this.today)
    this.activeOrganization = this.userData.profile['active_organization']['uuid']
  },
  components: {SystemUpdateNotice}
}
</script>

<style scoped>
#user-info {
  text-align: right;
}
.money-icon {
  max-height: 30px;
  height: 24px;
  max-width: 30px;
  width: 24px;
  background-size: 25px auto !important;
  background: url("../assets/icon/minimal-wallet-with-money-v2.svg") no-repeat;
}

>>> .v-main {
  height: 70vh;
  width: 100%;
}
</style>
