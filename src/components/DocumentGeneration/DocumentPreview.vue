<template>
  <v-dialog v-model="show" width="70vw">
    <v-card height="70vh">
      <v-card-text>

      </v-card-text>
    </v-card>
  </v-dialog>
</template>


<script>

export default {
  name: "DocumentPreview",
  data: () => ({
    show: false,
    documentHtml: '',
    config: {
      documentType: "word",
    }
  }),
  methods: {
    onDocumentReady() {
      console.log("Document is loaded");
    },
    onLoadComponentError(errorCode, errorDescription) {
      switch (errorCode) {
        case -1: // Unknown error loading component
          console.log(errorDescription);
          break;

        case -2: // Error load DocsAPI from http://documentserver/
          console.log(errorDescription);
          break;

        case -3: // DocsAPI is not defined
          console.log(errorDescription);
          break;
      }
    }
  },
  created() {
    this.$parent.$on('showPreview', (documentData) => {
      this.show = true
      this.config.document = documentData
    })
  },
  components: {
  }
}
</script>


<style scoped>
>>> .v-card__text {
  height: 80%;
  overflow-y: scroll;
}
</style>