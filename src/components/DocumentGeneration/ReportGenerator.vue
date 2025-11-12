<template>
  <v-container>
    <v-card height="90vh">
      <v-card-title class="justify-center">Генерация документа</v-card-title>
      <v-card-text>
        <v-btn @click="selectAll">{{ creditorId.length > 0 ? 'Снять выделение' : 'Выбрать все' }}</v-btn>
        <v-list-item-group
            class="mt-2 mb-2"
            multiple
            v-model="selectedCreditor"
        >
          <v-list-item v-for="(item, i) in creditorList" :key="i">
            <template v-slot:default="{ active }">
              <v-list-item-action>
                <v-checkbox :input-value="active" v-model="creditorId" :value="item['id']"></v-checkbox>
              </v-list-item-action>
              <v-list-item-content>
                {{ item | gerCreditor }}
              </v-list-item-content>
            </template>
          </v-list-item>
        </v-list-item-group>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="generate">Сформировать</v-btn>
      </v-card-actions>
    </v-card>
    <v-overlay :value="loading">
      <v-container width="560" height="600">
        <v-row justify="center">
          <v-progress-circular
              v-if="!hasError"
              indeterminate
              size="64"
          ></v-progress-circular>
        </v-row>
        <div v-if="!hasError">
          <v-row justify="center">Формирование, ожидайте....</v-row>
          <v-row justify="center">Процесс формирования может занимать до 15 минут в зависимости от количества выбранных
            кредиторов
          </v-row>
        </div>
        <div v-else>
          <v-row>{{ error.code }}</v-row>
          <v-row>{{ error.text }}</v-row>

        </div>

      </v-container>
    </v-overlay>
  </v-container>
</template>


<script>
import customConst from "@/const/customConst";
import {saveAs} from 'file-saver';
import moment from "moment";

export default {
  props: ['template'],
  name: "ReportGenerator",
  data: () => ({
    loading: false,
    hasError: false,
    error: {
      code: '',
      text: ''
    },
    selectedCreditor: [],
    creditorId: [],
    creditorList: []
  }),
  filters: {
    gerCreditor(item) {
      if (item.legal_creditor) {
        return item.legal_creditor.name
      } else if (item.physical_creditor) {
        return item.physical_creditor.fullName
      }
    }
  },
  methods: {
    selectAll() {
      if (this.creditorId.length > 1) {
        this.selectedCreditor = []
        this.creditorId = []
      } else {
        this.selectedCreditor = []
        this.creditorId = []
        for (let item in this.creditorList) {
          this.selectedCreditor.push(Number(item))
          this.creditorId.push(Number(this.creditorList[item]['id']))
        }
      }
    },
    async getCreditorList() {
      await this.$http({
        method: "GET",
        url: customConst.REFERENCE_BOOK_API + 'creditors-claims/report-creditor-list'
      }).then(res => {
        this.creditorList.push(...res.data.data.data)
        console.log(res.data.data.data)
      })
    },
    generate() {
      this.loading = true
      let formData = new FormData()
      formData.set('template', this.template.id)
      for (let item of this.creditorId) {
        formData.append('creditor', item)
      }
      this.$http({
        method: "POST",
        url: customConst.REFERENCE_BOOK_API + "creditors-claims/generate-report/",
        data: formData,
        responseType: 'blob'
      }).then(res => {
        let now = moment(new Date()).format('YYYY_MM_DD')
        let fileName = `Сопроводы_${now}`
        saveAs(res.data, fileName)
        this.loading = false
      }).catch(err => {
        this.error.code = err.response.status
        this.error.text = err.response.statusText
        this.hasError = true
        setTimeout(() => {
          this.hasError = false
          this.loading = false
        }, 3000)
      })
    }
  },
  async created() {
    await this.getCreditorList()
    this.selectAll()
  }
}

</script>


<style scoped>
.v-card .v-card__text {
  height: 80%;
  overflow: scroll;
}
</style>