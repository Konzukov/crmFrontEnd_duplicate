<template>
  <v-container fluid>
    <v-row align="center" justify="start" class="flex-nowrap" style="background-color: #1976d2">
      <!-- Вкладки -->
      <v-tabs dark background-color="primary" class="flex-grow-1">
        <v-tab :to="{name: 'files'}">Файлы</v-tab>
        <v-tab :to="{name: 'documents'}">Документы</v-tab>
      </v-tabs>

      <!-- Кнопки -->
      <div class="d-flex ml-2 mr-2">
        <v-btn color="primary lighten-1" small dark @click="openUploadFile">Загрузить файлы</v-btn>
        <v-btn color="secondary" small class="ml-2" @click="openCreateDocument">Создать документ</v-btn>
      </div>
    </v-row>
    <router-view></router-view>
    <DocumentFlowFileUpload :value="fileUploadDialog" @input="fileUploadDialog = $event"
                            @uploaded="onUploaded"></DocumentFlowFileUpload>
    <DocumentCreate
        :value="documentCreateDialog"
        @input="documentCreateDialog = $event"
        @created="onDocumentCreated"
    />
  </v-container>
</template>

<script>
import DocumentFlowFileUpload from "@/components/CRM/DocumentFlow/DocumentFlowFileUpload.vue";
import {mapActions} from "vuex";
import DocumentCreate from "@/components/CRM/DocumentFlow/DocumentCreate.vue";

export default {
  name: "DocumentFlow",
  components: {DocumentCreate, DocumentFlowFileUpload},
  data: () => ({
    fileUploadDialog: false,
    documentCreateDialog: false
  }),
  methods: {
    ...mapActions('documentFlow', ['fetchFileList']),
    openUploadFile() {
      this.fileUploadDialog = true
    },
    openCreateDocument() {
      this.documentCreateDialog = true
    },
    onUploaded() {
      this.fetchFileList()
    },
    onDocumentCreated() {
      // Обновляем список документов после создания
      this.fetchFileList()
    }
  }
}
</script>

<style scoped>

</style>