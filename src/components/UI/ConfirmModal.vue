<template>
  <v-dialog v-model="show" width="400" :retain-focus="false">
    <v-card>
      <v-card-title class="justify-center">Подтверждение сохранения</v-card-title>
      <v-card-text>
        <template v-if="parentData">
          <h3>Указанный номер дела {{ parentData[0]['case_number'] }} используется</h3>
          <p>Процедура {{ parentData[0]['code'] }} - {{ parentData[0]['name'] }}</p>
          <strong>Вы хотите продолжить сохранение?</strong>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-btn color="success" @click="confirmSave">Да</v-btn>
        <v-btn color="error" @click="close()">Нет</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ConfirmModal",
  data: () => ({
    show: false,
    parentData: null,
  }),
  methods: {

    confirmSave() {
      this.$emit('confirmSave', true)
      this.show = false;
    },
    close(){
      this.show = false;
      Object.assign(this.$data, this.$options.data())
    }
  },
  created() {
    this.$parent.$on('forceSaveConfirm', (data) => {
      this.show = true;
      this.parentData = data;
    })
  }
}
</script>

<style scoped>

</style>