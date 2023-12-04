<template>
  <v-card width="100%" height="100%" style="position: absolute">
    <v-row justify="start" class="ml-3 mr-3 mt-3">
      <span class="font-weight-bold">{{ projectInfo.judge.court.name }}</span>
    </v-row>
    <v-row justify="start" class="ml-3 mr-3 mt-3">
      {{ projectInfo.judge.court.address }}
    </v-row>
    <v-row justify="start" class="ml-3 mr-3 mt-3">
      {{ projectInfo.judge.full_name }}
    </v-row>
  </v-card>
</template>

<script>
export default {
  props: ['projectInfo'],
  name: "ProjectDetailJudge",
  created() {
    console.log(this.projectInfo)
  }
}
</script>

<style scoped>
* {
  font-family: Arial, sans-serif !important;
}
.v-card {
  font-size: 12px;

  text-shadow: none !important;
}
</style>