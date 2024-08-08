<template>
  <v-dialog v-model="dialog" persistent max-width="700">
    <v-card>
      <v-card-title>
        <h4>Добавление организации</h4>
        <v-spacer></v-spacer>
        <v-btn icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <legal-entity-create @closeModal="updateAndClose" :legalData.sync="legalData"></legal-entity-create>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import LegalEntityCreate from "@/components/referenceBook/LegalEntity/LegalEntityCreate.vue";

export default {
  name: "LegalEntityCreateModal",
  components: {LegalEntityCreate},
  props: ['subsystem'],
  data() {
    return {
      dialog: false,
      legalData: null,
    }
  },
  methods: {
    updateAndClose(item) {
      this.$emit('contractorAdded', item)
      this.dialog = false
    }
  },
  created() {
    this.$parent.$on('legalEntityModal', (item) => {
      console.log(item)
      this.$store.dispatch('getLegalEntityDetailInfo', item.pk).then((item) => {

        setTimeout(() => {
          this.legalData = Object.assign({}, item)
        }, 100)

        this.dialog = !this.dialog
      })

      // if (this.subsystem.name === name) {
      //
      // }
    })
  }
}
</script>

<style scoped>

</style>