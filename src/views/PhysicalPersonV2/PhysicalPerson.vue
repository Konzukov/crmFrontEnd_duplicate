<template>
  <v-container fluid>
    <v-row justify="start" class="physical-view">
      <v-col md="7" xl="7" sm="12" xs="12">
        <PhysicalPersonListV2></PhysicalPersonListV2>
      </v-col>
      <v-col md="5" xl="6" sm="12" xs="12"></v-col>
    </v-row>
  </v-container>
</template>


<script>
import PhysicalPersonListV2 from "@/components/referenceBook/PhysicalPersonV2/PhysicalPersonList.vue";

export default {
  name: "PhysicalPersonV2",
  components: {PhysicalPersonListV2}
}
</script>

<style scoped>
.physical-view {
  height: 93vh;
}
</style>