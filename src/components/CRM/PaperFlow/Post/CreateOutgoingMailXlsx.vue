<template>
  <v-container>
    <v-form>
      <v-row justify="start" align="baseline">
        <v-col md="6" sm="8" xl="6" lg="6">
          <v-file-input
              dense
              label="Добавьте файл xlsx"
              v-model="outMail"
              outlined
          ></v-file-input>
        </v-col>
        <v-col md="4" sm="4" xl="4" lg="4">
          <v-btn tile @click="checkOutPostXlsx()">Обработать</v-btn>
        </v-col>
      </v-row>
    </v-form>
    <v-row justify="start">
      <v-col cols="6">
        <v-row justify="center"><h4>Обработанная</h4></v-row>
        <hr class="mt-3">
        <v-list-item-group style="height: 65vh; overflow: scroll">
          <v-list v-for="(item, i) in existPostData" :key="i">
            <v-list-item-content>
              <v-list-item-title style="font-size: 13px">{{item.rpo}}: {{item.post.from_who.fullName}}</v-list-item-title>
              <v-list-item-subtitle style="font-size: 12px">
                Проект: {{item.post.project}}
              </v-list-item-subtitle>
              <v-list-item-subtitle>{{item.post.post_documents | getFileName}}</v-list-item-subtitle>

            </v-list-item-content>
          </v-list>
        </v-list-item-group>
      </v-col>
      <v-col cols="6">
        <v-row justify="center"><h4>Не обработанная</h4></v-row>
        <hr class="mt-3">
        <v-list-item-group style="height: 65vh; overflow: scroll">
          <v-list v-for="(item, i) in notExistPostData" :key="i">
            <v-list-item-title style="font-size: 13px">{{ item.rpo }}</v-list-item-title>
          </v-list>
        </v-list-item-group>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import customConst from "@/const/customConst";

export default {
  name: 'CreateOutgoingMail',
  data: () => ({
    outMail: null,
    existPostData: [],
    notExistPostData: []
  }),
  methods: {
    checkOutPostXlsx() {
      let formData = new FormData
      formData.append('file', this.outMail)
      return new Promise((resolve, reject) => {
        this.$http({
          method: "POST",
          url: customConst.PAPERFLOW_API + 'check-outgoing-post-xlsx',
          data: formData
        }).then(res => {
          let data = res.data.data.data
          data.filter(obj => {
            if (obj.exist) {
              this.existPostData.push(obj)
            } else {
              this.notExistPostData.push(obj)
            }
          })

        }).catch(err => {
          console.log(err)
        })
      })
    }
  },
  filters: {
    getFileName(obj){
      console.log(obj)
      return obj?.fileName
    }
  }
}

</script>

<style scoped>

</style>