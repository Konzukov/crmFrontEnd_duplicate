<template>
  <v-snackbar
      v-model="showNotice"
      :timeout="1500"
      tile
      top
      left
  >
    <template v-slot:default>
      <v-alert
          prominent
          :type="type"
      >
        {{ message }}
      </v-alert>
    </template>

  </v-snackbar>
</template>

<script>
export default {
  props: {
    message: String,
    type: String,
    snackbar: {
      type: Boolean,
      default: false
    }
  },
  name: "SnackbarMessage",
  data: () => ({
    showNotice: false
  }),
  watch: {
   snackbar(val){
     if(val){
       this.showNotice = true
     }

   }
  },
  methods: {
    show(){
      if (this.snackbar){
        this.showNotice = true
      }

    }
  }
}
</script>

<style scoped>

>>>.v-snack__content {
  padding: 0;
}

>>>.v-snack__wrapper.theme--dark {
  background-color: transparent !important;
}
>>>.v-alert {
  margin-bottom: 0;
}
>>>.v-application--is-ltr .v-snack__action{
  margin-right: 0;
}
</style>