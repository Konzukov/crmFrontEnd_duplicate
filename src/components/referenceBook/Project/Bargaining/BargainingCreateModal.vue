<template>
  <v-dialog v-model="dialog" width="50vw">
    <v-card>
      <v-card-title>
        <v-row justify="center" class="mt-3">
          {{ form.id ? 'Редактировать торги' : 'Добавить торги' }}
        </v-row>
      </v-card-title>
      <v-card-text class="mt-4" style="overflow-y: scroll ">
        <v-form lazy-validation>
          <v-row justify="start">
            <v-col cols="auto">
              <v-text-field dense outlined type="datetime-local" label="Начало приема заявок"
                            v-model="form.application_start_date"
                            :error="formErrors.application_start_date.error"
                            :error-messages="formErrors.application_start_date.message"
              ></v-text-field>
            </v-col>
            <v-col cols="auto">
              <v-text-field dense outlined type="datetime-local" label="Окончание приема заявок"
                            v-model="form.application_end_date"
                            :error="formErrors['application_end_date']['error']"
                            :error-messages="formErrors['application_end_date']['message']"
              ></v-text-field>
            </v-col>
            <v-col cols="auto">
              <v-text-field dense outlined type="datetime-local" label="Окончание торгов"
                            v-model="form.bidding_end_date"
                            :error="formErrors['bidding_end_date']['error']"
                            :error-messages="formErrors['bidding_end_date']['message']"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start">

            <v-col cols="4">
              <v-text-field dense outlined label="Номер ЕФРСБ" v-model="form.efrsb_number"
                            :error="formErrors['efrsb_number']['error']"
                            :error-messages="formErrors['efrsb_number']['message']"
              ></v-text-field>
            </v-col>
            <v-col cols="7">
              <v-select dense outlined label="Вид торгов" v-model="form.lot_type" :items="lot_type" item-value="value"
                        item-text="text"
                        :error="formErrors['lot_type']['error']"
                        :error-messages="formErrors['lot_type']['message']"
              ></v-select>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn small v-bind="attrs"
                       v-on="on" color="success" @click="addLot">
                  Добавить лот
                </v-btn>
              </template>
              <span>Добавить лот</span>
            </v-tooltip>
          </v-row>
          <v-row v-for="(item, index) in lots" :key="index">
            <v-col cols="3">
              <v-text-field outlined dense label="Номер лота" v-model="item.number"></v-text-field>
            </v-col>
            <v-col cols="7">
              <v-textarea outlined dense rows="2" label="Название лота" v-model="item.name"></v-textarea>
            </v-col>
            <v-col cols="1">
              <v-btn icon color="error" @click="removeLot(item)">
                <v-icon>mdi-minus</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-text style="height: 10%">
        <v-row justify="center" v-if="saving">
          {{ message }}
        </v-row>
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
import moment from "moment/moment";
// import LotCreate from "@/components/referenceBook/Project/Bargaining/LotCreate.vue";

export default {
  name: "BargainingCreateModal",
  data: () => ({
    valid: false,
    dialog: false,
    saving: false,
    message: 'Данные сохранены. Окно будет закрыто автоматически',
    formErrors: {
      application_start_date: {
        "error": false, message: ''
      },
      application_end_date: {
        "error": false, message: ''
      },
      bidding_end_date: {
        "error": false, message: ''
      },
      efrsb_number: {
        "error": false, message: ''
      },
      lot_type: {
        "error": false, message: ''
      },
      lot: {
        "error": false, message: ''
      },
    },
    form: {
      id: null,
      project: null,
      application_start_date: null,
      application_end_date: null,
      bidding_end_date: null,
      efrsb_number: null,
      lot_type: null,
    },
    lots: [],
    lot_type: [
      {value: 'OA', text: 'Открытый аукцион'},
      {value: 'PA', text: 'Публичное предложение'},
    ]
  }),
  methods: {
    saveLot(formData) {
      this.$http({
        method: 'POST',
        url: customConst.REFERENCE_BOOK_API + 'lot/',
        data: formData
      }).then(res=>{
        console.log(res)
        return true
      }).catch(err=>{
        console.log(err)
        return false
      })
    },
    updateLot(){
      this.$http({
        method: "GET",
        url: customConst.REFERENCE_BOOK_API + 'lot',
        params: {bargaining: this.form.id}
      }).then(res=>{
        let lotsList = res.data.data.data
        console.log(lotsList)
        this.lots.push(...res.data.data.data)
      })
    },
    save() {
      this.errors = {}
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
        url = customConst.REFERENCE_BOOK_API + 'bargaining/'
      } else {
        method = 'PUT'
        url = customConst.REFERENCE_BOOK_API + `bargaining/${this.form.id}/`
      }
      this.$http({
        method: method,
        url: url,
        data: formData
      }).then(res => {
        let result = []
        let bargaining = res.data.data.data
        this.lots.forEach((lot) => {
          let lotFormData = new FormData()
          lotFormData.set('bargaining', bargaining.id)
          lotFormData.set('name', lot.name)
          lotFormData.set('number', lot.number)
          result.push(this.saveLot(lotFormData))
        })
        if (result) {
          console.log(result)
        }

        // setTimeout(() => {
        //   Object.assign(this.$data, this.$options.data())
        //   this.dialog = false
        //   this.saving = false
        // }, 1000)
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
    },
    addLot() {
      let lot = {
        id: null,
        number: null,
        name: null,
      }
      this.lots.push(lot)
    },
    removeLot(item) {
      if (!item.id) {
        this.lots.splice(this.lots.indexOf(item), 1)
      } else {
        this.$http({
          method: 'DELETE',
          url: customConst.REFERENCE_BOOK_API + `lot/${item.id}`
        }).then(res=>{
          this.lots.splice(this.lots.indexOf(item), 1)
        })
      }
    }
  },
  created() {
    this.$parent.$on('addBargaining', (project) => {
      this.form.project = project
      this.dialog = true
    })
    this.$parent.$on('editBargaining', (item) => {

      Object.keys(this.form).forEach(key => {
        if (key === 'application_start_date') {
          this.form[key] = moment(item.application_start_date, 'DD.MM.yyyy HH:mm').format('yyyy-MM-DD HH:mm')
        } else if (key === 'application_end_date') {
          this.form[key] = moment(item.application_end_date, 'DD.MM.yyyy HH:mm').format('yyyy-MM-DD HH:mm')
        } else if (key === 'bidding_end_date') {
          this.form[key] = moment(item.bidding_end_date, 'DD.MM.yyyy HH:mm').format('yyyy-MM-DD HH:mm')
        } else {
          this.form[key] = item[key]
        }
      })
      this.updateLot()
      this.dialog = true
    })
  },
  components: {
    // LotCreate
  }
}
</script>


<style scoped>
.v-card {
  height: 70vh;
}

.v-card__text {
  height: 65%;
}
</style>