<template>
  <v-container fluid class="container">
    <v-row justify="start">
      <v-col cols="4">
        <v-card >
          <v-card-title class="flex justify-space-between">
            <h4>Список документов</h4>
            <v-btn icon color="success" @click="addNewTemplate">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list-item-group v-model="selectedTemplate" color="primary">
              <v-list v-for="item in documentTemplate" :key="item.id" >
                <v-list-item @click="selectTemplate(item)">{{ item.name }}</v-list-item>
              </v-list>
            </v-list-item-group>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="8">
        <DocumentGenerator  v-if="currentTemplate" :template="currentTemplate"></DocumentGenerator>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import DocumentGenerator from "@/components/DocumentGeneration/DocumentGenerator";
import {mapGetters} from 'vuex'

export default {
  name: "DocumentList",
  data: ()=>({
    selectedTemplate: null,
    currentTemplate: null,
  }),
  computed: {
    ...mapGetters({
      documentTemplate: "docTemplateData"
    })
  },
  methods: {
    addNewTemplate() {

    },
    selectTemplate(item){
      this.currentTemplate = null
      setTimeout(()=>{
       this.currentTemplate = item
      }, 100)

    }
  },
  async created() {
    await this.$store.dispatch('getDocTemplate')
  },
  components: {
    DocumentGenerator
  }
}
</script>

<style scoped>

</style>