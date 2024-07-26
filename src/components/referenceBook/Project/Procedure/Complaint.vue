<template>
  <v-expansion-panel>
    <v-expansion-panel-header class="pr-5 pl-5">
      3. Информация о жалобах на действия (бездействие) финансового управляющего
    </v-expansion-panel-header>
    <v-expansion-panel-content class="procedure_content" :style="collapsed? 'height: 63vh': 'height: 41vh'">
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>


<script>
export default {
  props: ['project', 'collapsed', 'act'],
  name: "InvolvedPersons"
}
</script>

<style scoped>
.v-expansion-panel-header {
  height: 45px;
}

.procedure_content {
  overflow-y: scroll;
}

.procedure_content .v-card {
  height: 80%;
}

.v-expansion-panel-header > *:not(.v-expansion-panel-header__icon) {
  flex: 0 0 auto;
}
</style>