<template>
  <v-container fluid>
    <v-tabs
        height="30px"
        background-color="primary"
        class="mb-3"
        dark>
      <v-tab
          v-for="syncType in availableSyncTypes"
          :key="syncType.value"
          :to="{name: syncType.route}"
          :disabled="syncType.disabled">
        <v-icon left>{{ syncType.icon }}</v-icon>
        <span>{{ syncType.name }}</span>
        <v-chip v-if="syncType.beta" x-small color="orange" class="ml-1">Beta</v-chip>
      </v-tab>
    </v-tabs>
    <router-view></router-view>
  </v-container>
</template>

<script>
export default {
  name: "SyncMain",
  data() {
    return {
      availableSyncTypes: [
        {
          name: 'Физические лица',
          value: 'physical-persons',
          route: 'syncPhysicalPersons',
          icon: 'mdi-account-sync',
          enabled: true,
          beta: false
        },
        {
          name: 'Юридические лица',
          value: 'legal-entities',
          route: 'syncLegalEntities',
          icon: 'mdi-domain',
          enabled: false,
          beta: true,
          disabled: true
        },
        {
          name: 'Проекты',
          value: 'projects',
          route: 'syncProjects',
          icon: 'mdi-folder-sync',
          enabled: false,
          beta: true,
          disabled: true
        }
      ]
    }
  },
  methods: {
  },
  created() {
  }
}
</script>