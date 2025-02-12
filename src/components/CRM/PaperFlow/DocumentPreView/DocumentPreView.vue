<template>
  <v-card>
    <v-tabs center-active v-model="document">
      <v-tab v-for="item in documentList" :key="item.id"
             @click="handleClick(item)"
      >{{ item.file }}
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="document">
      <DocumentPreViewDetail v-if="selectedDocument" :document="selectedDocument"></DocumentPreViewDetail>
    </v-tabs-items>
  </v-card>
</template>

<script>
import DocumentPreViewDetail from "@/components/CRM/PaperFlow/DocumentPreView/DocumentPreViewDetail.vue";

export default {
  components: {DocumentPreViewDetail},
  props: ['documentList'],
  name: "DocumentPreView",
  data: () => ({
    document: null,
    selectedDocument: null,
    selectedPdfUrl: null
  }),
  methods: {
    handleClick(item) {
      console.log(item)
       this.selectedDocument = null
      setTimeout(()=>{
        this.selectedDocument = item
      }, 100)
    }
  },
  watch: {
    document(newVal) {
      if (newVal !== null && newVal >= 0 && newVal < this.documentList.length) {
        const item = this.documentList[newVal];
        this.selectedPdfUrl = item.url;
      }
    },
    selectedDocument(newVal) {
      if (newVal === 1) { // 1 означает вкладку "Просмотр"
        const item = this.documentList[this.document];
        this.selectedPdfUrl = item.url;
      }
    }
  }
}
</script>


<style scoped>
.document-detail >>> .v-slide-group__content.v-tabs-bar__content {
  justify-content: space-between !important;
}

>>> .canvasWrapper {
  height: 100% !important;
}
</style>