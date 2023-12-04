<template>
  <v-dialog v-model="dialog" width="50vw">
    <v-card>
      <v-card-title>
        <v-row justify="center" class="mt-3">
          {{ form.id ? 'Редактировать заявителя' : 'Добавить заявителя' }}
        </v-row>
      </v-card-title>
      <v-card-text class="mt-4">
        <v-form lazy-validation>
          <v-row justify="start">
            <v-col cols="5">
              <v-text-field dense outlined label="ФИО заявителя" v-model="form.applicant"></v-text-field>
            </v-col>
            <v-col cols="auto">
              <v-text-field dense outlined label="Дата подачи заявки" type="datetime-local"
                            v-model="form.application_date"></v-text-field>
            </v-col>
            <v-col cols="auto">
              <v-text-field dense outlined label="Сумма" v-model="form.lot_price"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="auto">
              <v-select dense outlined label="Лот" :items="lots" item-text="name" item-value="id"
                        v-model="form.lot"></v-select>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="3">
              <v-switch
                  v-model="form.accepted"
                  :label="form.accepted? 'Принята': 'Отклонена'"
              ></v-switch>
            </v-col>
            <v-col cols="7" v-if="!form.accepted">
              <v-textarea rows="2" outlined dense label="Причина отказа" v-model="form.rejected"></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-row justify="center">
          <v-col cols="auto">
            <v-btn color="error" @click="close">Закрыть</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn color="success" @click="save">{{ form.id ? 'Сохранить' : 'Добавить' }}</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script>
import customConst from "@/const/customConst";

export default {
  name: "ApplicantCreateModal",
  data: () => ({
    dialog: false,
    form: {
      id: null,
      bargaining: null,
      application_date: null,
      lot_price: null,
      applicant: null,
      lot: null,
      accepted: true,
      rejected: null,
    },
    lots: []
  }),
  methods: {
    save() {
      let formData = new FormData()
      this.saving = true
      Object.keys(this.form).forEach(key => {
        if (this.form[key]) {
          formData.set(key, this.form[key])
        }
      })
      let method = null
      let url = null
      if (!this.form.id) {
        method = 'POST'
        url = customConst.REFERENCE_BOOK_API + 'applicant/'
      } else {
        method = 'PUT'
        url = customConst.REFERENCE_BOOK_API + `applicant/${this.form.id}/`
      }
      this.$http({
        method: method,
        url: url,
        data: formData
      }).then(res => {
        setTimeout(() => {
          Object.assign(this.$data, this.$options.data())
          this.dialog = false
          this.saving = false
        }, 1000)
      }).catch(err => {
        let errors = err.response.data.errors
        Object.keys(this.form).forEach(key => {
          if (key in errors) {
            this.formErrors[key] = {'error': true, 'message': errors[key][0]}
          } else {
            this.formErrors[key] = {'error': false, 'message': ''}
          }
        })
        console.log(this.formErrors)
        this.message = 'Ошибка при сохранении данных. Проверьте правильность данных'
      })
    },
    close() {
      Object.assign(this.$data, this.$options.data())
      this.dialog = false
    }
  },
  created() {
    this.$parent.$on('addApplicant', (item) => {
      console.log(item)
      console.log(item)
      this.form.bargaining = item.id
      this.lots.push(...item.lot)
      this.dialog = true
    })
  }
}
</script>

<style scoped>
.v-card {
  height: 50vh;
}

.v-card__text {
  height: 70%;
}
</style>