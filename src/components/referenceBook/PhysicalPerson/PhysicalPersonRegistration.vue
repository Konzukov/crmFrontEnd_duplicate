<template>
  <v-form class="mt-5" lazy-validation v-model="valid" ref="physicalPersonRegistrationForm">
    <v-row justify="start">
      <v-col cols="3" class="pt-0 pb-0">
        <v-text-field dense outlined label="Почтовый индекс" v-model="registration.postcode"></v-text-field>
      </v-col>
      <v-col cols="9" class="pt-0 pb-0">
        <v-text-field dense outlined class="required" :rules="required" label="Адрес регистрации" v-model="registration.address"></v-text-field>
      </v-col>
    </v-row>
    <v-row justify="start">
      <v-col cols="5" class="pt-0 pb-0">
        <v-text-field outlined dense  type="date"  label="Дата регистриции"
                      v-model="registration.start"></v-text-field>
      </v-col>
      <v-col cols="5" class="pt-0 pb-0">
        <v-text-field outlined dense label="Дата окончания регистриции" type="date" v-model="registration.end"></v-text-field>
      </v-col>
    </v-row>
    <v-row justify="start" class="mb-4">
      <v-col cols="3">
        <v-btn color="error" @click="removeForm">Удалить</v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  props: ['registrationData'],
  name: "PhysicalPersonRegistration",
  data: () => ({
    valid: false,
    registration: {
      pk: null,
      postcode: null,
      address: null,
      end: null,
      start: null
    },
    required: [
      v => !!v || 'Данное поле обязательно',
    ],
  }),
  methods: {
    removeForm() {
      this.$emit('removeForm')
    },
    save() {
      if (this.$refs.physicalPersonRegistrationForm.validate()) {
        let formData = new FormData()
        Object.keys(this.registration).forEach(key => {
          if (this.registration[key]) {
            formData.append(key, this.registration[key])
          } else {
            if (key !== 'pk') {
              formData.append(key, '')
            }
          }
        })
        return formData
      }
    }
  },
  created() {
    if (this.registrationData){
      Object.assign(this.registration, this.registrationData)
    }
  }
}
</script>

<style scoped>

</style>