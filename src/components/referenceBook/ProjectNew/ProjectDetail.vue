<template>
  <v-container fluid>
    <v-tabs grow v-model="activeSection" slider-color="#9799A2">
      <v-tab>Анкета</v-tab>
      <v-divider vertical></v-divider>
      <v-tab>Этапы</v-tab>
      <v-divider vertical></v-divider>
      <v-tab>Бабосы</v-tab>
    </v-tabs>
    <v-tabs-items v-model="activeSection">
      <v-tab-item>
        <router-view></router-view>
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
export default {
  props: {
    pk: {
      default: null,
    },
  },
  name: "ProjectDetail",
  data: ()=>({
    activeSection: null,
  })
}
</script>

<style scoped>

</style>