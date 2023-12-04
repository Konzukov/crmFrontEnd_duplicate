<template>
  <v-card flat height="90%" style="position: relative">
    <v-toolbar dense flat floating>
      <v-toolbar-title>Просмотр документа</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="close">
        <v-icon color="error">mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text style="border: none">
      <v-row>
        <PDFDocument :pdfUrl="documentUrl"></PDFDocument>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>

import PDFDocument from "@/components/PDFViewer/PDFDocument";


export default {
  name: "DocumentDetail",
  props: ['documentUrl'],
  methods: {
    close() {
      this.$emit('closeView')
    },
  },
  components: {
    PDFDocument
  }
}
</script>

<style scoped>
.v-card {
  overflow-x: auto;
}
</style>