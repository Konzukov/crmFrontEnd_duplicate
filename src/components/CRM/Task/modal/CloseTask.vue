<template>
  <v-dialog v-model="dialog" width="400">
    <v-card>
      <v-card-title>
        <v-row justify="center">Закрыть задачу?</v-row>
      </v-card-title>
      <v-card-actions>
        <v-row justify="center">
          <v-col cols="auto">
            <v-btn color="error" @click="close">Нет</v-btn>
          </v-col>
          <v-col cols="auto"  >
            <v-btn color="success" @click="closeTask">Да</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "CloseTask",
  data: () => ({
    dialog: false,
    task: null
  }),
  methods: {
    close() {
      Object.assign(this.$data, this.$options.data())
      this.dialog = false
    },
    closeTask() {
      this.$store.dispatch('setCloseTaskStatus', this.task).then(()=>{
        this.close()
      })
    }
  },
  created() {
    this.$parent.$on('closeTask', task => {
      console.log(task)
      this.task = task[0]
      this.dialog = true
    })
  }
}
</script>

<style scoped>
.v-card__actions .row {
  margin: 0;
}
</style>