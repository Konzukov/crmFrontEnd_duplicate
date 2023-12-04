<template>
  <v-container>
    <v-row justify="start">
      <v-col md="4" xl="4" lg="4" sm="12">
        <v-btn @click="downloadFile(file)">Скачать</v-btn>
      </v-col>
      <v-col md="6" xl="6" lg="6" sm="12">
        <v-form>
          <v-text-field
              outlined
              label="Файл"
              v-model="file.fileName"
          ></v-text-field>
        </v-form>
      </v-col>
    </v-row>

  </v-container>

</template>

<script>
import {mapActions} from 'vuex'
export default {
  name: "FileView",
  data() {
    return {
      file: {}
    }
  },
  methods:{
    ...mapActions([
        'getFile',
        'downloadFile'
    ])
  },
  created() {
    console.log(this.$route.params.pk)
    this.getFile(this.$route.params.pk).then(file=>{
      console.log(file)
      this.file = Object.assign({}, file)
    })
  }
}
</script>

<style scoped>

</style>