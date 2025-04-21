<template>
  <v-dialog v-model="dialog" persistent max-width="700" scrollable>
    <v-card height="85vh">
      <v-card-title>
        <h4>Добавление организации</h4>
        <v-spacer></v-spacer>
        <v-btn icon @click="close()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <LegalEntityForm :legal-entity-data.sync="legalData"></LegalEntityForm>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import {eventBus} from "@/bus";
import LegalEntityForm from "@/components/referenceBook/LegalEntity/LelagEntityForm.vue";

export default {
  name: "LegalEntityCreateModal",
  components: {LegalEntityForm},
  props: ['subsystem'],
  data() {
    return {
      dialog: false,
      legalData: {},
      show: false
    }
  },
  methods: {
    updateAndClose(item) {
      this.$emit('contractorAdded', item)
      this.$emit('contractorUpdate', item)
      this.dialog = false
    },
    close() {
      this.legalData = null
      Object.assign(this.$data, this.$options.data())
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
      this.legalData = null
      setTimeout(()=>{
        this.legalData = Object.assign({}, item)
        this.dialog = !this.dialog
      }, 300)
    })
  }
}
</script>

<style scoped>

</style>