<template>
  <div class="container">
    <v-card>
      <v-card-title class="justify-center">Генерация документов</v-card-title>
      <form ref="generator" id="generatorForm" class="ml-4 mr-4" @submit.prevent="generate">
        <v-row justify="start">
          <v-col md="6">
            <v-autocomplete
                outlined
                :items="docTemplate"
                item-value="id"
                v-model="template"
                item-text="attributes.name"
                label="Выберете шаблон"
                @change="loadTemplate(template)"
            ></v-autocomplete>
          </v-col>
        </v-row>
        <v-row v-if="loadingField && templateFields.length === 0" justify="center">
          Загружаем поля...
        </v-row>
        <v-row v-else>
          <v-col md="5" v-for="fields in templateFields" :key="fields.id">
            <v-text-field
                outlined
                :name="fields.name"
                :label="fields.name"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col md="6" sm="12">
            <v-text-field
                outlined
                v-model="fileName"
                label="Имя выходного файла"
                name="fileName"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row justify="center" class="pb-5">
          <v-btn color="success" type="submit">Сгенерировать</v-btn>
        </v-row>
      </form>
    </v-card>
  </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

export default {
  name: "ContractGenerator",
  data() {
    return {
      template: null,
      loadingField: false,
      fileName: ''
    }
  },
  methods: {
    ...mapActions({
      getDocumentTemplate: "getDocTemplate",
      getTemplateFields: 'getTemplateFields',
      generateDocument: 'generateDocument'
    }),
    loadTemplate(template){
      this.loadingField = true
      this.getTemplateFields(template).then(()=>{
        this.loadingField = false
      }).catch(()=>{
        console.log('Ошибка загрузки ')
      })
    },
    generate() {
      const form = this.$refs.generator
      let formData = new FormData(form)
      formData.set('template', this.template)
      console.log(formData)
      for (let pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
      }
      this.generateDocument({formData, 'fileName': this.fileName + '.docx'})
    }
  },
  computed: {
    ...mapGetters({
      docTemplate: 'docTemplateData',
      templateFields: 'templateFieldsData'
    })
  },
  mounted() {
    this.getDocumentTemplate()
  }
}
</script>

<style scoped>

</style>