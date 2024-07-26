<template>
  <v-dialog v-model="dialog" width="45vw">
    <v-toolbar color="primary" dark dense flat>
      <v-row justify="center">
        <v-toolbar-title>Добавление имущества</v-toolbar-title>
      </v-row>
    </v-toolbar>
    <v-card height="55vh" class="pt-6">
      <v-card-text style="height: 80%">
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
  props: ['estateData', 'project'],
  name: "BankruptcyEstateCreateModal",
  data: () => ({
    dialog: false,
    categoryList: [
      {header: 'Внеоборотные активы'},
      {text: 'Недвижимое имущество', value: 'RE'},
      {text: 'Движимое имущество', value: 'MA'},
      {divider: true},
      {header: 'Оборотные активы'},
      {text: 'Акции и иное участие в коммерческих организациях', value: 'RS'},
      {text: 'Ценные бумаги и иные финансовые инструменты всего', value: 'VAT'},
      {text: 'Денежные средства', value: 'CH'},
      {text: 'Дебиторская задолженность', value: 'AR'},
      {text: 'Иное имущество', value: 'OCA'},
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
    close() {
      Object.assign(this.$data, this.$options.data())
      this.dialog = false
    },
    save() {
      let formData = new FormData()
      Object.keys(this.form).forEach(key => {
        if (key === 'carrying_cost' || key === 'market_cost') {
          formData.set(key, this.form[key].replace(/\s+/g, '').replace(/,/g, '.'))
        } else {
          formData.set(key, this.form[key])
        }
      })
      if (!this.form.id) {
        this.$store.dispatch('saveBankruptcyEstate', formData).then(res => {
          this.$emit('updateBankruptcyEstate')
          this.close()
        }).catch(err => {
          console.log(err)
        })
      } else {
        this.$store.dispatch('editBankruptcyEstate', {formData, id: this.form.id}).then(res => {
          this.$emit('updateBankruptcyEstate')
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
    this.$parent.$on('addEstate', () => {
      this.form.project = this.project
      this.dialog = true
    })
    eventBus.$on('editBankruptcyEstate', item => {
      this.form = {...item}
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