<template>
  <v-card flat height="88%">
    <v-toolbar dense flat floating>
      <v-toolbar-title>Просмотр документа</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="close">
        <v-icon color="error">mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text style="height: 100%;">
      <vue-pdf-app
                   :pdf="documentUrl"></vue-pdf-app>
    </v-card-text>

  </v-card>
</template>

  
<script>
import VuePdfApp from "vue-pdf-app";
// import this to use default icons for buttons
import "vue-pdf-app/dist/icons/main.css";

export default {
  name: "DocumentDetail",
  props: ['documentUrl'],
  methods: {
    close() {
      this.$emit('closeView')
    },
  },
  components: {
    VuePdfApp
  }
}
</script>


<style scoped>

</style>