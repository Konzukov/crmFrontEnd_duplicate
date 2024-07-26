<template>
  <v-dialog v-model="dialog" width="50vw">
    <v-toolbar color="primary" dark dense flat>
      <v-row justify="center">
        <v-toolbar-title>Добавление реализации имущества</v-toolbar-title>
      </v-row>
    </v-toolbar>
    <v-card height="55vh" class="pt-6">
      <v-card-text style="height: 80%">
        <v-form lazy-validation class="pt-4">
          <v-row justify="start">
            <v-col cols="12">
              <v-autocomplete outlined dense label="Имущество" :items="estateList" item-text="goods_name"
                              item-value="id" v-model="form.estate"></v-autocomplete>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="6">
              <v-autocomplete dense outlined label="Способ реализации" :items="implementationMethodList"
                              item-value="val" item-text="text" v-model="form.implementation_method"></v-autocomplete>
            </v-col>
            <v-col cols="3">
              <v-text-field dense outlined label="Дата договора" type="date"
                            v-model="form.agreement_date"></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-text-field dense outlined label="Номер договора" v-model="form.agreement_number"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="6">
              <v-text-field dense outlined label="Стоимость по договору" v-model="form.cost"
                            @keypress="isNumber($event)"></v-text-field>
            </v-col>

          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-row justify="center">
          <v-col cols="auto">
            <v-btn @click="close" color="error">Отмена</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn @click="save" color="success">Сохранить</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import {eventBus} from "@/bus";

export default {
  props: ['estateSaleData', 'project'],
  name: "EstateSaleProgressCreateModal",
  data: () => ({
    dialog: false,
    implementationMethodList: [
      {val: 'POC', text: 'Публичное предложение, закрытая форма'},
      {val: 'POO', text: 'Публичное предложение, открытая форма'},
      {val: 'OAO', text: 'Открытый аукцион, открытая форма'},
      {val: 'CAO', text: 'Закрытый аукцион, открытая форма'},
    ],
    estateList: [],
    form: {
      id: null,
      project: null,
      estate: null,
      implementation_method: null,
      agreement_date: null,
      agreement_number: null,
      cost: null
    }
  }),
  methods: {
    close() {
      Object.assign(this.$data, this.$options.data())
      this.dialog = false
    },
    save() {
      let formData = new FormData()
      Object.keys(this.form).forEach(key => {
        if (key === 'cost') {
          formData.set(key, this.form[key].replace(/\s+/g, '').replace(/,/g, '.'))
        } else {
          formData.set(key, this.form[key])
        }
      })
      if (!this.form.id) {
        this.$store.dispatch('saveEstateSaveProgress', formData).then(res => {
          this.$emit('updateEstateSaleProgress')
          this.close()
        }).catch(err => {
          console.log(err)
        })
      } else {
        this.$store.dispatch('editEstateSaveProgress', {formData, id: this.form.id}).then(res => {
          this.$emit('updateEstateSaleProgress')
          this.close()
        }).catch(err => {
          console.log(err)
        })
      }

    },
    isNumber(evt) {
      evt = (evt) ? evt : window.event;
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46 && charCode !== 44) {
        evt.preventDefault();
      } else {
        return true;
      }
    }
  },
  created() {
    this.$parent.$on('addEstateSale', () => {
      this.$store.dispatch('getBankruptcyEstate', this.project).then(res => {
        this.estateList.push(...res)
      })
      this.form.project = this.project
      this.dialog = true
    })
    eventBus.$on('editEstateSale', item => {
      this.$store.dispatch('getBankruptcyEstate', this.project).then(res => {
        this.estateList.push(...res)
      })
      this.form = {...item}
      Object.keys(item).forEach(key => {
        if (key === 'estate') {
          this.form.estate = item.estate.id
        }
      })
      this.dialog = true
    })
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