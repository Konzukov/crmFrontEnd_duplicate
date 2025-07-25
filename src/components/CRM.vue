<template>
  <v-container fluid>
    <v-tabs center-active
            :optional="true"
            background-color="primary"
            dark>
      <v-tab :to="{name: 'crm'}">
        <v-icon>mdi-home</v-icon>
      </v-tab>
      <v-tab :to="{name: 'event-list'}">
        <span>События</span>
      </v-tab>
      <v-tab :to="{name: 'task-list'}">
        <span>Задачи</span>
      </v-tab>
      <!--      <v-tab v-for="(subsystem, id) in subsystems" :key="id" :to="{name: subsystem.api_list_url}">-->
      <!--        <v-icon class="mr-2">{{ subsystem.icon }}</v-icon>-->
      <!--        <span>{{ subsystem.name }}</span>-->
      <!--      </v-tab>-->
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
  name: "CRM",
  data() {
    return {
      tabs: '',
      subsystems: '',
      transitionEnter: 'animated zoomIn',
      transitionLeave: 'animated zoomOut'
    }
  },
  methods: {
    getSubSystem() {
      let systems = this.$store.getters.authUserData['profile']['accessible_system']
      for (let i = 0; i != systems.length; i++) {
        for (let key in systems[i]) {
          if (systems[i][key] == 'Dashboard') {
            return systems[i].subsystem
          }
        }
      }
    },
  },
  watch: {
    $route(to, from) {
      if (to.name === 'participatorOrganization' || to.name === 'participatorStaff') {
        this.transitionEnter = 'animated bounceInRight'
        this.transitionLeave = 'animated bounceOutLeft'
      } else {
        this.transitionEnter = 'animated zoomIn'
        this.transitionLeave = 'animated zoomOut'
      }
    }
  },
  created() {
    this.subsystems = this.getSubSystem()
  },
}
</script>

<style scoped>

</style>