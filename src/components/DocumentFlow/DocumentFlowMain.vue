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

    <!-- Document Create Dialog -->
    <DocumentCreateDialog v-model="showCreateDialog" @created="onDocumentsCreated" />
  </v-container>
</template>

<script>
import DocumentCreateDialog from './DocumentCreateDialog.vue'

export default {
  name: 'DocumentFlowMain',
  components: {
    DocumentCreateDialog
  },
  data() {
    return {
      activeTab: null,
      showCreateDialog: false
    }
  },
  methods: {
    createDocument() {
      this.showCreateDialog = true
    },
    createCorrespondence() {
      this.$router.push({name: 'doc-flow-corr-create'})
    },
    async onDocumentsCreated() {
      // Refresh documents list
      await this.$store.dispatch('documentFlow/fetchDocuments')
      this.showCreateDialog = false
    }
  }
}
</script>

<style scoped>
.v-card {
  height: 100%;
}
</style>
