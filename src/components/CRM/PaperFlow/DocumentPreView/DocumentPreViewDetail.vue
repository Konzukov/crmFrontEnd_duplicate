<template>
  <v-card-text style="height: 85%">
    <v-tabs v-model="selectedDocument" center-active>
      <v-tab>Документ</v-tab>
      <v-tab>Просмотр</v-tab>
    </v-tabs>
    <v-tabs-items v-model="selectedDocument">
      <v-tab-item>
        <v-card-text style=" height: calc(62vh); overflow-y: auto">
          <v-container fluid>
            <v-row justify="start">
              <v-col md="auto" class="mr-2">
                Автор: {{ document.author.fullName }}
              </v-col>
              <v-col md="auto" class="mr-2">
                Дата получения: {{ document.receiving_date | formatDate }}
              </v-col>
              <v-col md="auto" class="mr-2">
                Исх. №: {{ document.out_number }}
              </v-col>
              <v-col md="auto" class="mr-2">
                Сумма: {{ document.price }}
              </v-col>
              <v-row justify="start">
                <v-col md="auto" class="mr-2">
                  Вид корреспонденции: {{ document.correspondence_type.name }}
                </v-col>
              </v-row>
              <v-row justify="start">
                <v-col md="auto" class="mr-2" v-if="!document.route">
                  Получатель: {{ document.fromWho.name }}
                </v-col>
                <v-col md="auto" class="mr-2" v-else>
                  Получен от: {{ document.fromWho.name }}
                </v-col>
              </v-row>
            </v-row>
          </v-container>
        </v-card-text>
      </v-tab-item>
      <v-tab-item>
        <v-card-text style=" height: calc(62vh); overflow-y: auto">
          <vue-pdf-app
              :pdf.sync="document.url"></vue-pdf-app>
        </v-card-text>
      </v-tab-item>
    </v-tabs-items>
  </v-card-text>
</template>


<script>
import VuePdfApp from "vue-pdf-app";
import moment from "moment/moment";

export default {
  props: ['document'],
  name: "DocumentPreViewDetail",
  data: () => ({
    selectedDocument: null
  }),
  filters: {
    formatDate: function (date) {
      return moment(date).format('DD.MM.YYYY')
    }
  },
  components: {VuePdfApp}
}
</script>

<style scoped>

</style>