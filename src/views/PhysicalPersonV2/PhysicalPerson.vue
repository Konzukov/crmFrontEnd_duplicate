<template>
  <v-container fluid>
    <v-row justify="start" class="physical-view">
      <v-col md="5" xl="5" sm="12" xs="12">
        <PhysicalPersonListV2 :selected-person="selectedPerson"
                              @select="handleSelect"
                              @create="handleCreate"></PhysicalPersonListV2>
      </v-col>
      <v-col md="7" xl="7" sm="12" xs="12">
        <PhysicalPersonDetail v-if="selectedPerson || isCreating"
                              :person="selectedPerson"
                              :is-creating="isCreating"
                              @save="handleSave"
                              :show-action-button="true"
                              :show-snackbar="true"
                              style="height: 90vh; overflow-y: scroll"
                              @duplicate-selected="handleSelect"
                              @cancel="handleCancel"/>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import PhysicalPersonListV2 from "@/components/referenceBook/PhysicalPersonV2/PhysicalPersonList.vue";
import PhysicalPersonDetail from "@/components/referenceBook/PhysicalPersonV2/PhysicalPersonDetail.vue";

export default {
  name: "PhysicalPersonV2",
  data: () => ({
    selectedPerson: null,
    isCreating: true
  }),
  methods: {
    handleSelect(person) {
      this.selectedPerson = person
      this.isCreating = false
    },
    handleCreate() {
      this.isCreating = true
      this.selectedPerson = null
    },
    async handleSave(person) {
      await this.$store.dispatch('fetchPhysicalPersons')
        this.isCreating = false
        this.selectedPerson = person
    },
    handleCancel() {
      this.isCreating = true
      this.selectedPerson = null
    }
  },
  components: {PhysicalPersonDetail, PhysicalPersonListV2}
}
</script>

<style scoped>
.physical-view {
  height: 93vh;
}
</style>