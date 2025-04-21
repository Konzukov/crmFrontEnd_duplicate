<template>
  <v-dialog v-model="dialog" width="50vw">
    <v-card height="60vh">
      <v-toolbar dense>
        <v-toolbar-title>Выберите сертификат</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon small @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text style="height: 75%; overflow-y: scroll;">
        <v-list three-line flat>
          <v-list-item-group v-model="selectedCert" color="success">
            <v-list-item v-for="item in certsList" :key="item.index" :value="item">
              <v-list-item-content>
                <v-list-item-title>Владелец:        <span class="text-small">{{item.name}}      </span></v-list-item-title>
                <v-list-item-title>Издатель:        <span class="text-small">{{item.publisher}} </span></v-list-item-title>
                <v-list-item-title>Выдан:           <span class="text-small">{{item.validFrom}} </span></v-list-item-title>
                <v-list-item-title>Действителен до: <span class="text-small">{{item.validTo}}   </span></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-card-text>
      <v-card-actions class="d-flex justify-center">
        <v-btn color="error" small>Отмена</v-btn>
        <v-btn color="success" small @click="select">Выбрать</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script>
import customConst from "@/const/customConst";

export default {
  name: "SelectCertificate",
  data: () => ({
    dialog: false,
    certsList: [],
    selectedCert: null,
  }),
  methods: {
    close() {
      Object.assign(this.$data, this.$options.data())
      this.dialog = false
    },
    select(){
      this.$emit('certSelected', this.selectedCert)
      this.close()
    }
  },
  created() {
    this.$parent.$on('selectCert', () => {
      this.$http({
        method: "GET",
        // url: 'http://80.254.125.196:9893/api/paper-flow/get-cert',
        url: customConst.PAPERFLOW_API + "get-cert",
      }).then(res => {
        console.log(res)
        this.certsList = [...res.data.data.data]
      }).catch(err => {
        console.log(err)
      })
      this.dialog = true
    })
  }
}
</script>

<style scoped>
>>>.v-list-item__title{
  text-wrap: inherit;
}
.text-small {
  font-size: 0.8rem;
}
</style>