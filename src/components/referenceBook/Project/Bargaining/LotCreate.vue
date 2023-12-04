<template>
  <v-form>
    <v-row justify="start">
      <v-col cols="3">
        <v-text-field outlined dense label="Норме лота" v-model="form.number">

        </v-text-field>
      </v-col>
      <v-col cols="8">
        <v-textarea dense outlined label="Название лота" rows="2" v-model="form.name">

        </v-textarea>
      </v-col>
    </v-row>
  </v-form>
</template>


<script>
export default {
  name: "LotCreate",
  data: () => ({
    form: {
      id: null,
      number: null,
      name: null,
      bargaining: null,
    }
  })
}
</script>

<style scoped>

</style>