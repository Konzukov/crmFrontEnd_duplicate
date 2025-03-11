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
      <LegalEntityEditForm :legal-data="legalData"></LegalEntityEditForm>
      <v-card-text>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import {eventBus} from "@/bus";
import LegalEntityEditForm from "@/components/referenceBook/LegalEntityNew/LegalEntityEditForm.vue";

export default {
  name: "LegalEntityCreateModal",
  components: {LegalEntityEditForm},
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
      this.$emit('contractorUpdate', item)
      this.dialog = false
    }
  },
  created() {
    eventBus.$on('createLegalEntity', (item) => {
      if (item) {
        setTimeout(() => {
          this.legalData = {}
          Object.keys(item).forEach(key => {
            this.legalData[key] = item[key]
          })
        }, 200)
      }
      this.dialog = true
    })
    this.$parent.$on('legalEntityModal', (item) => {
      this.$store.dispatch('getLegalEntityDetailInfo', item.pk).then((item) => {
        setTimeout(() => {
          this.legalData = Object.assign({}, item)
        }, 100)
        this.dialog = !this.dialog
      })
    })
  }
}
</script>

<style scoped>

</style>