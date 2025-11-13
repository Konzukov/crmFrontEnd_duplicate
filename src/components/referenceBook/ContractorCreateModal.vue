<template>
  <v-dialog v-model="dialog" width="65vw" >
    <v-card flat>
      <v-card-title>
        <h4>Добавление стороны</h4>
        <v-spacer></v-spacer>
        <v-btn icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-card-text class="">
        <v-tabs
            v-model="formType"
              fixed-tabs
            background-color="indigo"
            dark
        >
          <v-tab>
            Физическое лицо
          </v-tab>
          <v-tab>
            Юридическое лицо
          </v-tab>
          <v-tabs-items v-model="formType">
            <v-tab-item >
              <PhysicalPersonDetail @closeModal="updateAndClose" :showActionButton="true"
              class="v-card--flat"></PhysicalPersonDetail>
            </v-tab-item>
            <v-tab-item>
              <LelagEntityForm @closeModal="updateAndClose"></LelagEntityForm>
            </v-tab-item>
          </v-tabs-items>
        </v-tabs>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import PhysicalPersonDetail from "@/components/referenceBook/PhysicalPersonV2/PhysicalPersonDetail.vue";
import LelagEntityForm from "@/components/referenceBook/LegalEntity/LelagEntityForm.vue";



export default {
  name: "ContractorCreateModal",
  data: () => ({
    dialog: false,
    formType: null,
  }),
  methods:{
    updateAndClose(item){
      this.$emit('contractorAdded', item)
      this.dialog = false
    }
  },
  created() {
    this.$parent.$on('addContractor', () => {
      this.dialog = true
    })
  },
  components:{
    PhysicalPersonDetail,
    LelagEntityForm
  }
}
</script>

<style scoped>
</style>