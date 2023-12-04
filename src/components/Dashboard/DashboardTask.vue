<template>
  <v-container fluid>
    <template v-for="(item, index) in dashboardItems">
      <v-btn absolute icon v-for="(obj, key) in item" :key="key"
             :style="{top: 20 + (index*50) + 'px', left: '10px'}">
        <v-icon size="36" v-if="!obj.active">{{ obj.icon }}</v-icon>
        <v-icon size="36" v-else @click="$router.push({name: 'crm'})">mdi-undo</v-icon>
      </v-btn>
    </template>
    <v-row>
      <v-col md="4" xl="4" lg="4" sm='12'>
        <v-card
            width="100%"
            class="mx-auto ml-15"
        >
          <v-app-bar
              :color="convert('0.8')"
              dark
              scroll-target="#scrolling-techniques-7"
              elevate-on-scroll
          >
            <v-toolbar-title>Список задач</v-toolbar-title>

            <v-spacer></v-spacer>
          </v-app-bar>
          <v-sheet
              id="scrolling-techniques-7"
              class="task task-list"
              max-height="70vh"
          >
            <v-list three-line nav dense>
              <v-divider></v-divider>
              <v-list-item-group
                  v-model="selectedTaskID"
                  color="primary"
              >
                <template v-for="task in dashboardUserTaskList"
                          link>

                  <v-list-item :key="task.pk" :to="{name: 'task-detail', params: { pk: task.pk }}">
                    <v-list-item-content>
                      <v-list-item-title class="task-list-title">
                        <template v-if="task.project !== null">
                          <span>{{ task.project.name }}</span>
                          <span>Срок исполнения: {{ task.date_to }}</span>
                        </template>

                        <template v-else>
                          <span>Не указан</span>
                          <span>Срок исполнения: {{ task.date_to }}</span>
                        </template>
                      </v-list-item-title>
                      <v-list-item-subtitle v-html="task.name"></v-list-item-subtitle>

                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list-item-group>
            </v-list>
          </v-sheet>
        </v-card>
      </v-col>
      <v-col md="7" xl="7" lg="7" sm="12">
        <router-view :prop-to-child="selectedTaskID"></router-view>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "DashboardTask",
  data: () => ({
    selectedTaskID: 0,
    selectedTask: {},
    dashboardItems: [
      {
        task: {
          name: 'Задачи',
          icon: 'mdi-clipboard-list-outline',
          active: true,
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
  }),
  computed: {
    ...mapGetters({
      dashboardTaskList: 'dashboardUserTaskList',
      dashboardUserTaskList: 'dashboardUserTaskListData'
    }),
  },
  methods: {
    convert(opacity) {
      let r = Math.floor(100 / (this.dashboardTaskList['total'] / this.dashboardTaskList['expired']))
      // let g = Math.floor(100 / (this.dashboardTaskList['total'] / this.dashboardTaskList['done']))
      // let b = Math.floor(100 / (this.dashboardTaskList['total'] / this.dashboardTaskList['open']))
      return "rgba(" + r + ", " + 0 + ", " + 0 + ", " + opacity + ")";
    },
  },
  created() {
    this.$store.dispatch('getDashboardTaskList').then(() => {
      this.$store.dispatch('getDashboardUserTaskList')
    })
  }

}
</script>

<style scoped>
.v-sheet.task {
  overflow-y: scroll;

}

.task-list-title {
  display: flex;
  justify-content: space-between;
}
.v-list-item__subtitle {
  color: #000;
}
/* полоса прокрутки (скроллбар) */
::-webkit-scrollbar {
  width: 6px; /* ширина для вертикального скролла */
  background-color: #fff;
}

/* ползунок скроллбара */
::-webkit-scrollbar-thumb {
  background-color: #030e4e;
  border-radius: 9em;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #253861;
}
</style>
