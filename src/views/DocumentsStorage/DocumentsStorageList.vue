<template>
  <v-container fluid>
    <section>
      <v-row justify="space-between" align="baseline">
        <v-col cols="auto"><h1>Обработанные документы</h1></v-col>
        <v-spacer></v-spacer>
        <v-col cols="2" offset="2">
          <v-text-field v-model="search" prepend-inner-icon="mdi-magnify"></v-text-field>
        </v-col>
        <v-col>
          <v-btn class="ml-2 mr-2" icon @click="$emit('showFilter')">
            <v-icon :class="Object.keys(filters).length === 0 ? '': 'active-filter'"
                    :color="Object.keys(filters).length === 0 ? 'black': 'primary'">mdi-tune
            </v-icon>
          </v-btn>
          <v-btn color="black" dark elevation="4" @click="openDocumentUploadForm">Добавить документ</v-btn>
        </v-col>
      </v-row>
    </section>
    <section>
      <v-data-table
          :items="processedDocumentList"
          :headers="headers"
          :loading="loading"
          dense
          :search="search"
          :loading-text="loadingMessage"
          :footer-props="{
            'items-per-page-text':'Строк на странице',
            'items-per-page-options': [15, 30, 50, 100]
          }"
      >
      </v-data-table>
    </section>
    <DocumentFilter @applyFilters="applyFilter" @resetFilter="applyFilter"></DocumentFilter>
    <UploadDocumentsForm></UploadDocumentsForm>
  </v-container>
</template>

<script>
import {mapActions} from 'vuex'
import * as lodash from 'lodash'
import DocumentFilter from "@/components/DocumentsStatoge/DocumentFilter";
import UploadDocumentsForm from "@/components/DocumentsStatoge/UploadDocumentsForm";

export default {
  name: "DocumentsStorageList",
  data: () => ({
    filters: {},
    headers: [
      {text: "Файл", value: 'file'},
      {text: "Дата документа", value: 'doc_date'},
      {text: "Проект", value: 'projects_repr'},
      {text: "Тип документа", value: 'type'},
    ],
    loading: false,
    loadingMessage: 'Загрузка данных, ожидайте...',
    search: ''
  }),
  methods: {
    ...mapActions({
      getDocument: 'getDocuments'
    }),
    openDocumentUploadForm(){
      this.$emit('openDocumentUploadForm')
    },
    applyFilter(filters) {
      this.filters = filters
    },
  },
  computed: {
    processedDocumentList() {
      let processedDocument = this.$store.getters.processedDocument
      if (!lodash.isEmpty(Object.entries(this.filters))) {
        return processedDocument.filter((item) => {
          for (let [key, val] of Object.entries(this.filters)) {
            // Фильтр для типа и категории документа
            if (key === 'type' || key === 'category') {
              return item[key] === val.name
            }
            // Фильтр для проектов
            else if (key === 'project') {
              for (let dataProject of item[key]) {
                for (let project of val) {
                  if (dataProject['name'].indexOf(project['name']) === 0) {
                    return item
                  }
                }
              }
            }
          }
        })
      }
      return processedDocument
    },
  },
  async beforeMount() {
    this.loading = true
    await this.getDocument().then(() => {
    }).catch(() => {
      this.loadingMessage = 'Ошибка при загрузке данных. Обратитесь с администратору'
    }).finally(() => {
      this.loading = false
    })

  },
  components: {
    DocumentFilter,
    UploadDocumentsForm
  }
}
</script>

<style scoped>
h1 {
  font-size: 16px;
  text-transform: uppercase;
}

.active-filter {
  animation: animate-tune 2s ease-in infinite;
}

@keyframes animate-tune {
  0%, 100% {
    text-shadow: 0 0 4px #1976d2;
  }
  50% {
    text-shadow: 0 0 0 #1976d2;
  }
}


</style>