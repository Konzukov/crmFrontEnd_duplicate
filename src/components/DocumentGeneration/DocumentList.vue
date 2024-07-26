<template>
  <v-container fluid class="container">
    <v-row justify="start">
      <v-col cols="4">
        <v-card>
          <v-card-title class="flex justify-space-between">
            <h4>Список документов</h4>
            <v-btn icon color="success" @click="addNewTemplate">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list >
              <v-list-group
                  :value="false"
                  no-action
                  sub-group
                  class="pl-2"
                  v-for="(value, key) in documentTemplate"
                  :key="key"
              >
                <template v-slot:activator>
                  <v-list-item-content>
                    <v-list-item-title>{{ key }}</v-list-item-title>
                  </v-list-item-content>
                </template>

                <v-list-item
                    v-for="item in value"
                    :key="item.id"
                    @click="selectTemplate(item)"
                >
                  {{ item.name }}
                </v-list-item>
              </v-list-group>

            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="8" v-if="currentTemplate && currentTemplate.name !== 'Сопровод к отчетам'">
        <DocumentGenerator v-if="currentTemplate" :template="currentTemplate"></DocumentGenerator>
      </v-col>
      <v-col cols="8" v-else-if="currentTemplate && currentTemplate.name === 'Сопровод к отчетам'">
        <ReportGenerator :template="currentTemplate"></ReportGenerator>
      </v-col>
      <v-col col="8" v-else-if="currentTemplate && currentTemplate.name === 'Сводный запрос в кредитную организацию'">

      </v-col>
    </v-row>

  </v-container>
</template>

<script>
import DocumentGenerator from "@/components/DocumentGeneration/DocumentGenerator";
import {mapGetters} from 'vuex'
import ReportGenerator from "@/components/DocumentGeneration/ReportGenerator.vue";

export default {
  name: "DocumentList",
  data: () => ({
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
    selectTemplate(item) {
      this.currentTemplate = null
      setTimeout(() => {
        this.currentTemplate = item
      }, 100)

    }
  },
  async created() {
    await this.$store.dispatch('getDocTemplate')
  },
  components: {
    ReportGenerator,
    DocumentGenerator
  }
}
</script>

<style scoped>
>>> .v-card__text {
  max-height: 85vh;
  overflow: auto;
}
>>>.v-list-group__header {
  padding-left: 10px !important;
}
.v-application--is-ltr .v-list-group--no-action.v-list-group--sub-group > .v-list-group__items > .v-list-item {
  padding-left: 50px;
}
</style>