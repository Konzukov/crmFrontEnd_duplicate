<template>
  <v-container fluid>
    <v-tabs
        height="30px"
        background-color="primary"
        class="mb-3"
        dark>
      <v-tab :to="{name: 'video-instruction'}">
        <span>Инструкции</span>
      </v-tab>
      <!--            <v-tab :to="{name: 'new-project-list'}">-->
      <!--              <span>Проекты(Н)</span>-->
      <!--            </v-tab>-->
    </v-tabs>
    <router-view></router-view>
  </v-container>
</template>

<script>
export default {
  name: "WIki"
}
</script>

<style scoped>

</style>