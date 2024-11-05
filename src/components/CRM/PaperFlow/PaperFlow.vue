<template>
  <v-container fluid>
    <v-tabs center-active
            background-color="primary"
            dark>
      <!--        <v-tab  v-for="(nav, i) in subsystems" :to="{name: nav.name}" :key="i" >-->
      <!--          <span>{{nav.navName}}</span>-->
      <!--        </v-tab>-->
      <v-tab :to="{name: 'post-order'}">
        <span>Почта к отправке</span>
      </v-tab>
      <v-tab :to="{name: 'incoming-post'}">
        <span>Почта</span>
      </v-tab>
      <v-tab :to="{name: 'outgoing-post'}">
        <span>Исходящая почта</span>
      </v-tab>
      <v-tab :to="{name: 'correspondence'}">
        <span>Корреспонденция</span>
      </v-tab>
      <v-tab :to="{name: 'email'}">
        <span>Email</span>
      </v-tab>
      <!--      <v-tab :to="{name: 'processed-document-list'}">-->
      <!--        <span>Обработанные документы</span>-->
      <!--      </v-tab>-->
      <!--      <v-tab :to="{name: 'unprocessed-document-list'}">-->
      <!--        <span>Не обработанные документы</span>-->
      <!--      </v-tab>-->
      <v-tab :to="{name: 'trash-document-list'}">
        <span>Корзина</span>
      </v-tab>
      <v-tab :to="{name: 'trash-post-list'}">
        <span>Корзина(Почта)</span>
      </v-tab>
    </v-tabs>
    <transition
        :enter-active-class="transitionEnter"
        :leave-active-class="transitionLeave"
        mode="out-in">
      <router-view></router-view>
    </transition>
    <v-btn dark large top right absolute color="#66BB6A" @click="newDocument">
      <v-icon>mdi-text-box-plus-outline</v-icon>
    </v-btn>
    <createDocument></createDocument>
  </v-container>
</template>

<script>
import createDocument from "./modal/createDocument";

export default {
  name: "PaperFlow",
  data() {
    return {
      subsystems: '',
      transitionEnter: 'animated zoomIn',
      transitionLeave: 'animated zoomOut'
    }
  },
  methods: {
    newDocument() {
      this.$emit('newDocument')
    },
    getSubSystem() {
      let systems = this.$store.getters.authUserData['profile']['accessible_system']
      for (let i = 0; i != systems.length; i++) {
        for (let key in systems[i]) {
          if (systems[i][key] == 'Документохранилище') {
            return systems[i].subsystem
          }
        }
      }
    },
  },
  components: {
    createDocument
  },
  watch: {
    $route(to, from) {
      console.log(to.name)
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
    // this.subsystems = this.$router.options.routes.find(pRoute => (
    //     pRoute.name === 'dashboard'
    // )).children.find(r => r.name === this.$route.name).children.filter(cRoute => cRoute.name !== 'single-document')
  }
}
</script>

<style scoped>
.v-btn {
  top: 14px;
}

>>> .v-tab {
  font-size: 12px;
}
</style>