<template>
  <v-dialog
      v-model="saveInProgress"
      hide-overlay
      persistent
      width="300"
  >
    <v-card height="300">
      <v-card-text v-if="!saveDone && !saveError">
        <v-row justify="center" no-gutters align="center" style="height: 200px">
          <v-progress-circular
              :width="5"
              :size="50"
              color="green"
              indeterminate
          ></v-progress-circular>
        </v-row>
        <v-row justify="center">
          {{ message }}
        </v-row>
      </v-card-text>
      <v-card-text v-else-if="saveDone && !saveError">
        <v-row justify="center" no-gutters align="center" style="height: 200px">
          <v-icon size="50" color="success">mdi-check</v-icon>
        </v-row>
        <v-row justify="center">
          {{ message }}
        </v-row>
      </v-card-text>
      <v-card-text v-else-if="saveError">
        <v-row justify="center" no-gutters align="center" style="height: 200px">
          <v-icon size="50" color="error">mdi-alert-octagram</v-icon>
        </v-row>
        <v-row justify="center">
          {{ message }}
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>

</template>

<script>
export default {
  name: "SaveProcessed",
  data: () => ({
    saveInProgress: false,
    saveDone: false,
    saveError: false,
    message: ''
  }),
  methods: {
    close() {
      Object.assign(this.$data, this.$options.data())
    }
  },
  mounted() {
    this.$parent.$on('saveInProcess', () => {
      this.saveInProgress = true
      this.message = 'Сохранение... Одижайте'
    })
    this.$parent.$on('saveDone', () => {
      this.message = 'Данные сохранены'
      this.saveDone = true
      setTimeout(() => {
        this.saveInProgress = false
        this.$emit('saved')
        this.close()
      }, 2000)

    })
    this.$parent.$on('saveError', () => {
      this.message = 'Ошибка при сохранении данных'
      this.saveDone = false
      this.saveError = true
      setTimeout(() => {
        this.saveInProgress = false
        this.close()
      }, 2000)

    })
  }
}
</script>

<style scoped>

</style>