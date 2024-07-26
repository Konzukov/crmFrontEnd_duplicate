<template>
  <v-dialog v-model="dialog" width="650" persistent>
    <template v-if="notice">
      <v-toolbar flat dark color="primary" >
        <v-toolbar-title class="justify-center">
          Обновление от {{ notice['update_date'] | formatDate}}
        </v-toolbar-title>
      </v-toolbar>
      <v-card height="60vh">
        <v-card-text style="height: 88%;">
          <v-container v-html="notice['message']"></v-container>
        </v-card-text>
        <v-toolbar flat >
                  <v-toolbar-title class="justify-center">
          <v-btn @click="confirmAcquainted" color="success">Ознакомлен</v-btn>
        </v-toolbar-title>
        </v-toolbar>
      </v-card>
    </template>

  </v-dialog>
</template>


<script>

import {eventBus} from "@/bus";
import moment from "moment";

export default {
  name: "SystemUpdateNotice",
  data: () => ({
    dialog: false,
    notice: null,
    userUUID: null,
  }),
  methods: {
    confirmAcquainted(){
      let formData = new FormData()
      formData.append('uuid', this.userUUID)
      formData.append('notice', this.notice.id)
      this.$store.dispatch('confirmAcquainted', formData).then(()=>{
        this.dialog = false
      })
    }
  },
  filters: {
    formatDate(date){
      return moment(date).format('DD.MM.YYYY');
    }
  },
  created() {
    eventBus.$on('showSystemUpdateMessage', ({notice, uuid}) => {
      this.userUUID = uuid
      this.dialog = true
      this.notice = notice
    })
  }
}
</script>


<style scoped>

</style>