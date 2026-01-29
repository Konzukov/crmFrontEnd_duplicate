<template>
  <v-container fluid>
    <v-tabs
        height="30px"
        background-color="primary"
        class="mb-3"
        dark>
      <!--      <v-tab :to="{name: 'physicalPersonV2'}">-->
      <!--        <span>Физ.лица (2)</span>-->
      <!--      </v-tab>-->
      <v-tab v-for="(subsystem, id) in subsystems" :key="id" :to="{name: subsystem.api_list_url}">
        <v-icon class="mr-2">{{ subsystem.icon }}</v-icon>
        <span>{{ subsystem.name }}</span>
      </v-tab>
      <v-tab :to="{name: 'preProject'}">
        <span>До Проект</span>
      </v-tab>
      <v-tab :to="{name: 'AccountOpening'}">
        <span>Заявки на открытие счета</span>
      </v-tab>
<!--      <v-tab :to="{name: 'syncPhysicalPersons'}">-->
<!--        <v-icon left>mdi-database-sync</v-icon>-->
<!--        <span>Синхронизация</span>-->
<!--      </v-tab>-->
      <!--            <v-tab :to="{name: 'new-project-list'}">-->
      <!--              <span>Проекты(Н)</span>-->
      <!--            </v-tab>-->
    </v-tabs>
    <router-view></router-view>
    <physicalPersonCreate :subsystem="getCurrentSubsystem('Физические лица')"></physicalPersonCreate>
    <LegalEntityCreate :subsystem="getCurrentSubsystem('Организации')"></LegalEntityCreate>
  </v-container>
</template>

<script>

import PhysicalPersonCreate from "./modalWindows/PhysicalPersonCreate";
import LegalEntityCreate from "./referenceBook/LegalEntity/LegalEntityCreateModal";

export default {
  name: "ReferenceBook",
  data() {
    return {
      apiUrl: '',
      inactive: false,
      subsystems: {},
      fab: false,
      dialog: false
    }
  },
  computed: {
    userData() {
      return this.$store.getters.authUserData
    },
  },
  methods: {
    getSubSystem() {
      console.log(this.$store.getters.authUserData)
      let systems = this.userData['profile']['accessible_system']
      for (let i = 0; i != systems.length; i++) {
        for (let key in systems[i]) {
          if (systems[i][key] == 'Справочники') {
            return systems[i].subsystem
          }
        }
      }
    },
    getCurrentSubsystem(subsystemName) {
      for (let i in this.subsystems) {
        for (let key in this.subsystems[i]) {
          if (this.subsystems[i][key] == subsystemName)
            return this.subsystems[i]
        }

      }
      return subsystemName
    },
    showModal(subsystem) {
      this.$emit('showModals', subsystem)
    }
  },
  components: {
    physicalPersonCreate: PhysicalPersonCreate,
    LegalEntityCreate
  },
  async created() {
    await this.$store.dispatch('checkAuth')
    this.subsystems = this.getSubSystem()
    this.getCurrentSubsystem('Физические лица')
  },
}
</script>

<style scoped>
div.container {
  height: 87vh;
  padding: 0 2px !important;
}

/*.col-7 {*/
/*  border-right: 1px solid black;*/
/*}*/

/*#search, .person-list {*/
/*  margin: 0px 10px 10px 0px;*/
/*}*/

.v-speed-dial {
  bottom: 60px;
  right: 70px;
}
</style>