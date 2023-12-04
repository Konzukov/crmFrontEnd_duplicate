<template>
  <v-card dense height="70vh">
    <v-list-item-group v-model="selectedEvent">
      <v-list-item v-for="(eventData, i) in eventList" :key="i" @click="viewEvent(eventData)">
        <v-list-item-content>
          <v-card flat class="mb-1">
            <v-card-text class="mt-2 mb-2">
              <v-row justify="start">
                <v-col md="2">
                  <v-row class="item-additional-info">
                    <v-col class="pl-1 pr-1"><span>Дата: {{ eventData.date | dateFormat }}</span></v-col>
                  </v-row>
                </v-col>
                <v-col md="8">
                  <v-row>
                    <v-col cols="auto" class="task-name">
                      <strong>{{ eventData.name }}</strong>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col class="item-additional-info"><span>Проект: {{ eventData.project| projectName }}</span>
                    </v-col>
                  </v-row>
                </v-col>
<!--                <v-col>-->
<!--                  <v-btn icon>-->
<!--                    <v-icon color="black" small>mdi-dots-vertical</v-icon>-->
<!--                  </v-btn>-->
<!--                </v-col>-->
              </v-row>
            </v-card-text>
            <v-divider></v-divider>
          </v-card>
        </v-list-item-content>
      </v-list-item>
    </v-list-item-group>
  </v-card>
</template>

<script>
import moment from "moment";

export default {
  props: ['eventList'],
  name: "EventList",
  data: () => ({
    benched: 0,
    selectedEvent: ''
  }),
  methods: {
    viewEvent(eventData) {
      this.$emit("viewEvent", eventData)
    }
  },
  filters: {
    projectName(project) {
      if (project.length > 1) {
        let name = "";
        for (let proj of project) {
          name += proj.name + ", "
        }
        return name
      } else if (project.length === 1) {
        return project[0].name
      } else {
        return 'Не определен'
      }

    },
    executorName(executor) {
      if (executor) return executor
      return "Не определен"
    },
    dateFormat(date) {
      if (date) return moment(date).format("DD.MM.YYYY")
      return "Не определена"
    }
  },
  created() {
    console.log(this.eventList)
  }
}
</script>

<style scoped>
* {
  font-family: Arial, sans-serif !important;
}

.item-additional-info {
  font-size: 10px;
}

.expire-task {
  background-color: #f1070029;
}

.v-card {
  overflow: auto;
}

.v-card .v-list-item {
  padding: 0;
}

.v-list-item__content {
  padding: 0;
}

.task-name {
  font-size: 15px;
}

.row > .col {
  padding-top: 5px;
  padding-bottom: 5px;
  line-height: 13px;
}
</style>