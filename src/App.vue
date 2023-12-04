<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn
    },
    loggedUserInfo() {
      return this.$store.getters.authUserData
    },
    userData() {
      return this.$store.getters.authUserData
    }
  },
  data: () => ({
    //
  }),
  methods: {
    logout() {
      this.$store.dispatch('logout')
    }
  },
  async created() {
    if (this.$cookies.get('token')) {
      await this.$store.dispatch('checkAuth').then(response => {
        console.log(response)
      }).catch(() => {
        this.$router.push('/login')
      })
    } else {
      console.log('Not Auth')
    }

  }
};
</script>

<style>
html {
  overflow-x: hidden !important;
}

* {
  font-family: "Roboto Condensed";
}
.v-label{
  font-size: 14px !important;
}
.v-text-field--filled.v-input--dense.v-text-field--single-line > .v-input__control > .v-input__slot, .v-text-field--filled.v-input--dense.v-text-field--outlined > .v-input__control > .v-input__slot, .v-text-field--filled.v-input--dense.v-text-field--outlined.v-text-field--filled > .v-input__control > .v-input__slot, .v-text-field--full-width.v-input--dense.v-text-field--single-line > .v-input__control > .v-input__slot, .v-text-field--full-width.v-input--dense.v-text-field--outlined > .v-input__control > .v-input__slot, .v-text-field--full-width.v-input--dense.v-text-field--outlined.v-text-field--filled > .v-input__control > .v-input__slot, .v-text-field--outlined.v-input--dense.v-text-field--single-line > .v-input__control > .v-input__slot, .v-text-field--outlined.v-input--dense.v-text-field--outlined > .v-input__control > .v-input__slot, .v-text-field--outlined.v-input--dense.v-text-field--outlined.v-text-field--filled > .v-input__control > .v-input__slot {
  font-size: 14px !important;
  min-height: 35px !important;
}

>>> #app {
  height: 99vh;
}


</style>