<template>
  <v-form class="mt-5" lazy-validation v-model="valid" ref="passportForm">
    <v-row justify="start">
      <v-col cols="4" class="pt-0 pb-0">
        <v-select dense outlined class="required" :rules="required" label="Вид паспорта" v-model="passport.type"
                  :items="passportTypes"
                  item-text="val" item-value="key"></v-select>
      </v-col>
      <v-col cols="3" class="pt-0 pb-0">
        <v-text-field dense outlined :rules="required" label="Серия" class="required" @keypress="isNumber($event)"
                      v-model="passport.serial"></v-text-field>
      </v-col>
      <v-col cols="5" class="pt-0 pb-0">
        <v-text-field class="required" :rules="required" dense outlined label="Номер" @keypress="isNumber($event)"
                      v-model="passport.number"></v-text-field>
      </v-col>
    </v-row>
    <v-row justify="start">
      <v-col cols="5" class="pt-0 pb-0">
        <v-text-field outlined dense label="Код подразделения"
                      v-model="passport.division_code"></v-text-field>
      </v-col>
      <v-col cols="5" class="pt-0 pb-0">
        <v-text-field outlined dense label="Дата выдачи" type="date" v-model="passport.date_issue"></v-text-field>
      </v-col>
    </v-row>
    <v-row justify="start">
      <v-col cols="12" class="pt-0 pb-0">
        <v-text-field outlined dense label="Кем выдан" v-model="passport.issued_by"></v-text-field>
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
  props: ['passportData'],
  name: "PhysicalPersonPassport",
  data: () => ({
    valid: false,
    passportTypes: [
      {key: 'PR', val: 'Гражданский паспорт'},
      {key: 'IP', val: 'Загран паспорт'},
      {key: 'SP', val: 'Паспорт моряка'},
    ],
    passport: {
      pk: '',
      serial: '',
      type: 'PR',
      number: '',
      date_issue: '',
      division_code: '',
      issued_by: '',
    },
    required: [
      v => !!v || 'Данное поле обязательно',
    ],
  }),
  methods: {
    removeForm() {
      this.$emit('removeForm')
    },
    isNumber: function (evt) {
      evt = (evt) ? evt : window.event;
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && (charCode !== 46 || charCode === 189)) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    save() {
      if (this.$refs.passportForm.validate()) {
        let formData = new FormData()
        Object.keys(this.passport).forEach(key => {
          if (this.passport[key]){
            formData.append(key, this.passport[key])
          }else{
            if(key !== 'pk'){
              formData.append(key, '')
            }
          }
        })
        return formData
      }
    }
  },
  created() {
    if (this.passportData){
      Object.assign(this.passport, this.passportData)
    }
  }

}
</script>

<style scoped>
>>> .required fieldset {
  border: 0.15em solid;
}

>>> .v-input--is-focused fieldset {
  color: rgba(0, 0, 0, 0.87);
}

>>> .required .error--text fieldset {
  color: rgb(167, 25, 25);
}

>>> .required.v-input--is-focused fieldset {
  border: 0.15em solid;
}

>>> .required.v-input--is-focused.error--text fieldset {
  border: 0.15em solid;
  color: rgb(167, 25, 25);
}

>>> .v-messages.error--text {
  max-width: fit-content;
  max-height: 40px;
}
</style>