<template>
  <v-container fluid>
    <v-row justify="start">
      <v-col cols="4">
        Список
      </v-col>
      <v-col cols="8">
        <LegalEntityEditForm></LegalEntityEditForm>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import LegalEntityEditForm from "@/components/referenceBook/LegalEntityNew/LegalEntityEditForm.vue";

export default {
  name: "LegalEntityNew",
  components: {LegalEntityEditForm},
  data: ()=>({

  }),
  created() {
    console.log(1)
  }
}
</script>

<style scoped>

</style>