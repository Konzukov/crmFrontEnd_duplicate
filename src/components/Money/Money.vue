<template>
  <v-container fluid>
    <v-tabs center-active
            :optional="true"
            background-color="primary"
            dark>
      <v-tab :to="{name: 'money'}">
        <v-icon>mdi-home</v-icon>
      </v-tab>
      <v-tab :to="{name: 'money-receipts'}">
        <v-icon class="mr-4">mdi-cash-plus</v-icon>
        Поступления
      </v-tab>
      <v-tab :to="{name: 'money-expenses'}">
        <v-icon class="mr-4">mdi-cash-minus</v-icon>
        Расходы
      </v-tab>
      <v-tab :to="{name: 'invoice-list'}">
        Счета
      </v-tab>
      <v-tab :to="{name: 'act-list'}">
        Акты
      </v-tab>
      <v-tab :to="{name: 'regular-invoice-list'}">
        Регулярные счета
      </v-tab>
    </v-tabs>
    <transition
        :enter-active-class="transitionEnter"
        :leave-active-class="transitionLeave"
        mode="out-in">
      <router-view></router-view>
    </transition>
  </v-container>
</template>

<script>
export default {
  name: "Money",
  data: () => ({
    transitionEnter: 'animated zoomIn',
    transitionLeave: 'animated zoomOut'
  }),
  created() {

  }
}
</script>

<style scoped>

</style>