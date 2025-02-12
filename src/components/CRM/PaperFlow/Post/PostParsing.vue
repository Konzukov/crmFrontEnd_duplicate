<template>
  <v-container>
    <v-row justify="start">
      <v-col md="4" lg="4 " sm="12">
        <v-card height="70vh">
          <v-card-title>
            <v-row class="ma-4">
              <v-select dense outlined label="Выберите аккаунт" :items="postAccount" item-value="id"
                        item-text="login" v-model="account"></v-select>
            </v-row>
            <v-row justify="center">
              <v-btn @click="$router.go(-1)" class="mr-3">Вернутся</v-btn>
              <v-divider vertical></v-divider>
              <v-btn @click="runPostParsing" class="ml-3">Запустить</v-btn>
            </v-row>
          </v-card-title>
          <v-card-title>Информация по текущей задаче</v-card-title>
          <v-card-text>
            ID задачи: {{ task.id }}
          </v-card-text>
          <v-card-actions>
            <v-row justify="end" align="end">
              <v-col cols="auto">
                <v-btn color="error" @click="stopParsing(task.id)">Остановить</v-btn>
              </v-col>
              <v-col cols="auto">
                <v-btn @click="statusParsing(task.id)" color="primary">Обновить статус</v-btn>
              </v-col>
              <v-col cols="auto"></v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col md="7" lg="7 " sm="12">
        <v-card min-width="100%" height="70vh" style="overflow: scroll">
          <v-card-text>
            <v-row v-for="(res, i) in task.result" :key="i">
              <p v-if="i !== 0">
                <b>РПО:</b> {{ res['rpo'] }} |
                <b>Рег. номер: </b> {{ res['reg_num'] }} |
                <b>Получатель:</b> {{ res['from_custom'] }} |
                <b>Описание: </b> {{ res['description'] }} |
                <b>Цена: </b>{{ res['price'] }} |
                <b>Имя файла: </b>{{ res['file'] }}
              </p>
              <v-divider v-if="i !== 0"></v-divider>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import customConst from "@/const/customConst";


export default {
  name: "PostParsing",
  data: () => ({
    account: null,
    task: {
      id: '',
      status: '',
      fileName: '',
      result: []
    }
  }),
  computed: {
    postAccount() {
      return this.$store.getters.postAccountData
    }
  },
  methods: {
    runPostParsing() {
      this.$http({
        method: 'GET',
        url: customConst.PAPERFLOW_API + 'run-post-parsing',
        params: {
          'account': this.account
        }
      }).then(res => {
        this.task['id'] = res.data.task
        this.task['status'] = 'Задача запущена'
        this.task['fileName'] = res.data['result_file']
      })
    },
    stopParsing() {
      this.$http({
        method: 'GET',
        url: customConst.PAPERFLOW_API + 'stop-post-parsing/' + this.task.id,
      }).then(res => {
        console.log(res)
        this.task['status'] = 'Задача остановлена'
      })
    },
    statusParsing() {
      this.$http({
        method: 'GET',
        url: customConst.PAPERFLOW_API + 'status-post-parsing/' + this.task.id + '/' + this.task.fileName,
      }).then(res => {
        res.data['result'] = []
        res.data['result'].map(obj => {
          this.task.result.push(JSON.parse(obj))
        })

      })
    },
  },
  created() {
    this.$store.dispatch('getPostAccount')
  }
}
</script>

<style scoped>

</style>