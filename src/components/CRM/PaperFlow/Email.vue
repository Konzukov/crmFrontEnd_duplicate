<template>
  <v-container fluid>
    <v-card flat height="86vh">
      <v-row justify="space-between" class="fill-height mt-2">
        <v-col cols="5" class="blue-grey">
          <v-card height="84vh">
            <v-toolbar>
              <v-toolbar-title>
                Электронная почта
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn icon @click="loadEmail(1)">
                <v-icon>mdi-reload</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text style="height: 84%; overflow-y: scroll">
              <template v-if="loading">
                <v-skeleton-loader
                    v-for="i in pageSize" :key="i"
                    type="list-item-three-line"
                ></v-skeleton-loader>
              </template>
              <v-list dense three-line v-else>
                <v-list-item-group
                    v-model="selectedItem"
                    color="primary"
                >
                  <v-list-item v-for="email in emailList" :key="email.id" @click="loadEmailDetail(email.id)">
                    <v-list-item-content>
                      <v-list-item-title>{{ email.subject }}</v-list-item-title>
                      <v-list-item-subtitle>{{ email.date | filterDate }}</v-list-item-subtitle>
                      <v-list-item-subtitle>{{ email.from }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-card-text>
            <div class="text-center pt-2 pagination">
              <v-pagination v-model="page" @input="updatePage" :length="pages" :total-visible="7"></v-pagination>
            </div>
          </v-card>
        </v-col>

        <v-col cols="7"></v-col>
      </v-row>
    </v-card>

  </v-container>
</template>


<script>

import customConst from "@/const/customConst";
import moment from "moment";

export default {
  name: "Email",
  data: () => ({
    loading: true,
    page: 1,
    pageCount: 0,
    pageSize: 15,
    selectedItem: null,
    emailList: [],
  }),
  filters: {
    filterDate(date) {
      return moment(date).format('DD.MM.YYYY HH:mm')
    }
  },
  computed: {
    pages() {
      if (this.pageSize == null || this.pageCount == null) return 60;
      return Math.ceil(this.pageCount / this.pageSize);
    },
  },
  methods: {
    updatePage: async function (pageIndex) {
      await this.loadEmail(pageIndex)

      this.page = pageIndex;
    },
    async loadEmailDetail(emailId) {
      let formData = new FormData()
      formData.set('emailId', emailId)
      await this.$http({
        method: "POST",
        url: customConst.PAPERFLOW_API + 'load-email',
        data: formData,
      }).then(res=>{
        console.log(res)
      }).catch(err=>{
        console.log(err)
      })
    },
    async loadEmail(page = 0) {
      this.loading = this
      let formData = new FormData()
      formData.set('page', page.toString())
      await this.$http({
        method: "POST",
        url: customConst.PAPERFLOW_API + 'load-email-list',
        data: formData,
      }).then(res => {
        this.pageCount = res.data.data.total
        this.emailList = [...res.data.data.data]
        this.loading = false
      }).catch(err => {
        console.log(err.response.data)
      })
    }
  },
  created() {
    this.loadEmail(1)
  }
}
</script>


<style scoped>

</style>