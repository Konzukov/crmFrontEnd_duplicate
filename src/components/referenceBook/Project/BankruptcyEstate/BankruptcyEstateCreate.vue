<template>
  <v-container>
    <v-form lazy-validation class="pt-4">
      <v-row justify="start">
        <v-col cols="12">
          <v-text-field outlined dense label="Имущество" v-model="form.goods_name"></v-text-field>
        </v-col>
      </v-row>
      <v-row justify="start">
        <v-col cols="6">
          <v-text-field outlined dense label="Балансовая стоимость" @keypress="isNumber($event)"
                        v-model="form.carrying_cost"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field outlined dense label="Рыночная стоимость" @keypress="isNumber($event)"
                        v-model="form.market_cost"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <v-select dense outlined label="" v-model="form.estate" :items="estateState" item-value="value"
                    item-text="text"></v-select>
        </v-col>
        <v-col cols="6">
          <v-select
              dense
              outlined
              label="Категория"
              :items="categoryList"
              item-text="text"
              item-value="value"
              v-model="form.category"
              clearable
          >
            <template v-slot:selection="data">
              {{ data.item.text }}
            </template>
            <template v-slot:item="data">
              <template v-if="typeof data.item !== 'object'">
                <v-list-item-content v-text="data.item"></v-list-item-content>
              </template>
              <template v-else>
                <v-list-item-content>
                  <v-list-item-title v-html="data.item.text"></v-list-item-title>
                </v-list-item-content>
              </template>
            </template>
          </v-select>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="auto">
          <v-btn @click="reset" color="error">Отмена</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="save" color="success">Сохранить</v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import {isEmpty} from "lodash";

export default {
  props: ['estateData', 'project'],
  name: "BankruptcyEstateCreate",
  data: () => ({
    categoryList: [
      {header: 'Внеоборотные активы'},
      {text: 'Основные средства', value: 'FA'},
      {text: 'Незавершенное строительство', value: 'CIP'},
      {text: 'Долгосрочные финансовые вложения', value: 'LTFI'},
      {text: 'Недвижимое имущество', value: 'RE'},
      {text: 'Движимое имущество', value: 'MA'},
      {divider: true},
      {header: 'Оборотные активы'},
      {text: 'Запасы', value: 'RS'},
      {text: 'НДС по приобретенным ценностям', value: 'VAT'},
      {text: 'Денежные средства', value: 'CH'},
      {text: 'Дебиторская задолженность', value: 'AR'},
      {text: 'Краткосрочные финансовые вложения', value: 'STFI'},
      {text: 'Прочие оборотные активы', value: 'OCA'},
      {divider: true},
      {header: 'Не указано'},
      {text: 'Не указано', value: 'UN'},
    ],
    estateState: [
      {value: 'IN', text: 'Включается в конкурсную массу'},
      {value: 'OUT', text: 'Исключается из конкурсной массы'},
    ],
    selectedItems: [],
    form: {
      id: null,
      project: null,
      estate: "IN",
      goods_name: null,
      carrying_cost: null,
      market_cost: null,
      category: null
    }
  }),
  methods: {
    selectItem(item) {
      this.selectedItems = item
    },
    save() {
      let formData = new FormData()
      console.log(this.form.project)
      Object.keys(this.form).forEach(key => {
        console.log(key, this.form[key])
        if (key === 'carrying_cost' || key === 'market_cost') {
          formData.set(key, this.form[key].replace(/\s+/g, '').replace(/,/g, '.'))
        } else {
          formData.set(key, this.form[key])
        }
      })
      if (!this.form.id) {
        this.$store.dispatch('saveBankruptcyEstate', formData).then(res => {
          this.$emit('updateBankruptcyEstate')
        }).catch(err => {
          console.log(err)
        })
      } else {
        this.$store.dispatch('editBankruptcyEstate', {formData, id: this.form.id}).then(res => {
          this.$emit('updateBankruptcyEstate')
        }).catch(err => {
          console.log(err)
        })
      }

    },
    reset() {

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
    this.form.project = this.project
    if (!isEmpty(this.estateData)) {
      this.form.id = this.estateData.id
      this.form.category = this.estateData.category
      this.form.carrying_cost = this.estateData.carrying_cost
      this.form.market_cost = this.estateData.market_cost
      this.form.goods_name = this.estateData.goods_name
      this.form.estate = this.estateData.estate
    }
  }
}
</script>

<style scoped>

</style>