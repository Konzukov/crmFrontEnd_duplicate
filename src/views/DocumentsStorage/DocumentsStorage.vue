<template>
  <v-container fluid>
  <v-tabs color="#5e6470">
    <v-tab :to="{name:'processed-documents-list'}">Обработанные документы</v-tab>
  </v-tabs>
    <router-view></router-view>
  </v-container>
</template>

<script>
export default {
  name: "DocumentsStorage"
}
</script>

<style scoped>

</style>