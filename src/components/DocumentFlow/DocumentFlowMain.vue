<template>
  <v-container fluid class="pa-0">
    <v-card>
      <v-tabs v-model="activeTab" background-color="primary" dark>
        <v-tab :to="{name: 'doc-flow-documents'}">
          <v-icon left>mdi-file-document-multiple</v-icon>
          Документы
        </v-tab>
        <v-tab :to="{name: 'doc-flow-correspondence'}">
          <v-icon left>mdi-email-multiple</v-icon>
          Корреспонденция
        </v-tab>
        <v-tab :to="{name: 'doc-flow-settings'}">
          <v-icon left>mdi-cog</v-icon>
          Справочники
        </v-tab>
      </v-tabs>

      <v-card-text class="pa-4">
        <router-view></router-view>
      </v-card-text>
    </v-card>

    <v-btn
      fab
      fixed
      bottom
      right
      color="primary"
      @click="createDocument"
      v-if="$route.name === 'doc-flow-documents'"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <v-btn
      fab
      fixed
      bottom
      right
      color="primary"
      @click="createCorrespondence"
      v-if="$route.name === 'doc-flow-correspondence'"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </v-container>
</template>

<script>
export default {
  name: 'DocumentFlowMain',
  data() {
    return {
      activeTab: null
    }
  },
  methods: {
    createDocument() {
      this.$router.push({name: 'doc-flow-create'})
    },
    createCorrespondence() {
      this.$router.push({name: 'doc-flow-corr-create'})
    }
  }
}
</script>

<style scoped>
.v-card {
  height: 100%;
}
</style>
