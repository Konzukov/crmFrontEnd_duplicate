<template>
  <v-container fluid>
    <v-row justify="start">
      <v-col cols="6">
        <v-card flat height="75vh">
          <v-card-title>Список фоновых заданий</v-card-title>
          <v-card-text class="active-task">
            <template v-for="(tasks, worker) in backgroundTask.active">
              <v-list flat :key="worker" dense>
                <v-subheader>Список активный задач: Worker {{ worker }}</v-subheader>
                <v-list-item-group
                    color="primary"
                >
                  <v-list-item v-for="(task, i) in tasks" :key="i" two-line @click="selectedBgTaskUUID = task.id ">
                    <v-list-item-content>
                      <v-list-item-title>{{ task.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ task.id }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card height="75vh">
          <v-card-title class="justify-center">Детальная информация</v-card-title>
          <v-card-text class="bg-task-detail">
            <iframe src="http://192.168.2.13:8585/#/sessions/" width="100%" height="100%">

            </iframe>
          </v-card-text>
          <v-card-actions>
            <v-row justify="center">
              <v-col cols="auto" class="mr-3">
                <v-btn color="error">Остановить</v-btn>
              </v-col>
              <v-col cols="auto" class="mr-3">
                <v-btn color="primary" @click="refreshTaskStatus">Обновить статус</v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import customConst from "@/const/customConst";

export default {
  name: "BackgroundTask",
  data: () => ({
    selectedBgTaskUUID: null,
    selectedBgTask: null,
    backgroundTask: {
      active: null,
      reserved: null,
      scheduled: null,
    },

  }),
  methods: {
    getBgTaskList() {
      this.$http({
        method: "GET",
        url: customConst.CRM_API + 'background-task'
      }).then(res => {
        console.log(res.data)
        this.backgroundTask = res.data
      })
    },
    refreshTaskStatus() {
      this.$http({
        method: "GET",
        url: customConst.CRM_API + `background-task/${this.selectedBgTaskUUID}`
      }).then(res => {
        console.log(res.data)
      })
      // let socket = io('ws://192.168.2.13:4444/vnc/ea52b76090e518242eec7841fa29ae5f', {
      //   cors: {
      //   origin: '192.168.2.13:4444',
      // }
      // })
      // socket.onAny((event, ...args) => {
      //   console.log(event, args);
      // });
      //   const socket = new WebSocket('ws://192.168.2.13:4444/vnc/ea52b76090e518242eec7841fa29ae5f')
      //   socket.onopen = function (event) {
      //     console.log(event)
      //     console.log("Successfully connected to the echo websocket server...")
      //   }
      //   socket.onmessage = function(event) {
      //   console.log(event);
      // }
      // let con = io.Socket('ws://192.168.2.13:4444/vnc/21c2cdf64b5f0d3e9f810264782462a7')
      // con.sockets.on('connection', (socket)=>{
      //   console.info('Client connected');
      //   socket.on('init', (config)=>{
      //     console.log(config)
      //   })
      // })

    }
  },
  watch: {
    selectedBgTaskUUID(val) {
      console.log(val)
      this.$http({
        method: "GET",
        url: customConst.CRM_API + `background-task/${val}`
      }).then(res => {
        console.log(res.data)
      })

    }
  },
  mounted() {

  },
  created() {
    this.getBgTaskList()

  },
  components: {
  }
}
</script>

<style scoped>
.bg-task-detail {
  height: calc(80% - 10px);
}
</style>