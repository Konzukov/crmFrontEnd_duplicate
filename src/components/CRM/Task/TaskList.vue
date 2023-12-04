<template>
  <v-card flat height="70vh">
    <v-list-item-group v-model="selectedTask" >
      <v-list-item v-for="(task, i) in taskList" :key="i" @click="viewTask(task)">
        <v-list-item-content>
          <v-card flat :class="[expiredTask(task.date_to), 'mb-1']">
            <v-card-text class="mt-2 mb-2">
              <v-row justify="start" >
                <v-col md="2">
                  <v-row class="item-additional-info">
                    <v-col class="pl-1 pr-1"><span>До: {{ task.date_to | dateFormat }}</span></v-col>
                  </v-row>
                </v-col>
                <v-col md="8">
                  <v-row>
                    <v-col cols="auto" class="task-name">
                      <strong>{{ task.name }}</strong>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col class="item-additional-info"><span>Проект: {{ task.project| projectName }}</span></v-col>
                    <v-col class="item-additional-info"><span>Исполнитель: {{ task.executor | executorName }}</span>
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
import moment from 'moment'

export default {
  props: ['taskList'],
  name: "TaskList",
  data: () => ({
    benched: 0,
    selectedTask: "",
  }),
  methods: {
    viewTask(task) {
      this.$emit("viewTask", task)
    },
    expiredTask(date){

      let curDate = moment(new Date()).format('YYYY-MM-DD')
      if (date < curDate){
        return 'expire-task'
      }else{
        return ''
      }
    }
  },
  filters: {
    projectName(project) {
      if (project) {
        return project.name
      }
      return 'Не определен'
    },
    executorName(executor) {
      if (executor) return executor
      return "Не определен"
    },
    dateFormat(date) {
      if (date) return moment(date).format("DD.MM.YYYY")
      return "Не определена"
    }
  }
}
</script>

<style scoped>
* {
  font-family: Arial, sans-serif !important;
}


.v-sheet.v-card:not(.v-sheet--outlined) {
  box-shadow: 0px 3px 1px -2px #ffffff !important;
}
.item-additional-info {
  font-size: 10px;
}
.expire-task{
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