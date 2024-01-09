<template>
  <v-container>
    <v-form>
      <v-row justify="start" align="baseline">
        <v-col md="6" sm="8" xl="6" lg="6">
          <v-file-input
              label="Добавьте архив"
              v-model="outMail"
              outlined
          ></v-file-input>
        </v-col>
        <v-col md="4" sm="4" xl="4" lg="4">
          <v-btn tile @click="chekOutPostArchive()">Обработать</v-btn>
        </v-col>
      </v-row>
      <v-data-table dense
                    :loading="loading"
                    :headers="headers"
                    :item-key="headers[0].value"
                    show-select
                    v-model="selected"
                    hide-default-footer
                    :items-per-page="mailData.length"
                    :item-class="(item) => item.isExist"
                    :items="mailData">
        <template v-slot:item.data-table-select="{ item, isSelected, select }">
          <v-simple-checkbox
              :value="isSelected"
              :disabled="item.isExist === 'success lighten-3'"
              v-ripple
              @input="select($event)"
          ></v-simple-checkbox>
        </template>
        <template v-slot:footer>
          <v-row justify="end">
            <v-btn @click="createSelectedMail" class="mr-5">Создать выбранные</v-btn>
            <v-btn @click="createSelectedMail">Создать все</v-btn>
          </v-row>
        </template>
      </v-data-table>
    </v-form>
    <v-snackbar
        v-model="snackbar.show"
        absolute
        bottom
        right
        :color="snackbar.color"
    >
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn
            color="red"
            text
            v-bind="attrs"
            @click="snackbar.show = false"
        >
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import customConst from "@/const/customConst";

export default {
  name: "CreateOutgoingMail",
  data: () => ({
    outMail: null,
    snackbar: {
      show: false,
      text: '',
      color: ''
    },
    loading: false,
    headers: [{value: '№'}],
    departureDate: '',
    mailData: [],
    selected: []
  }),
  methods: {
    chekOutPostArchive() {
      let formData = new FormData
      formData.append('file', this.outMail)
      return new Promise((resolve, reject) => {
        this.$http({
          method: "POST",
          url: customConst.PAPERFLOW_API + 'check-outgoing-post',
          data: formData
        }).then(res => {
          this.headers = res.data.data.tableHeaders
          this.mailData = res.data.data.tableData
          this.departureDate = res.data.data.departureDate
          console.log(res)
        }).catch(err => {
          console.log(err)
        })
      })
    },
    createSelectedMail() {
      const dt = {data: this.selected, departureDate: this.departureDate};
      return new Promise((resolve, reject) => {
        this.$http({
          method: "POST",
          url: customConst.PAPERFLOW_API + 'create-outgoing-post',
          data: dt
        }).then(res => {
          this.snackbar.text = res.data.data.message
          this.snackbar.color = 'success'
          this.snackbar.show = true
        }).catch(err => {
          this.snackbar.text = err.response.data.message
          this.snackbar.color = 'error'
          this.snackbar.show = true

        })
      })
    },
  }
}
</script>

<style scoped>
.post-exist {
  color: #30b21d;
}
</style>