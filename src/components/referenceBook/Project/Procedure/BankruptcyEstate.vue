<template>
    <v-expansion-panel-content class="procedure_content" :style="collapsed? 'height: 63vh': 'height: 41vh'">
      <v-row justify="start" style="height: 80%">
        <v-col cols="12">
          <v-card flat>
            <v-card-text style="height: 80%">
              <v-data-table
                  :items=bankruptcyEstateList
                  :headers="headers">
                <template v-slot:item.category="{ item }">
                  {{item.category | getCategory}}
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-icon
                      small
                      class="mr-2"
                      @click="editItem($event, {item})"
                  >
                    mdi-pencil
                  </v-icon>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-expansion-panel-content>
</template>


<script>
import {eventBus} from "@/bus";

export default {
  props: ['project', 'collapsed'],
  name: "BankruptcyEstate",
  data: () => ({
    selectedEstate: null,
    headers: [
      {text: 'Имущество', value: 'goods_name'},
      {text: 'Балансовая стоимость ', value: 'carrying_cost'},
      {text: 'Рыночная стоимость ', value: 'market_cost'},
      {text: 'Категория', value: 'category'},
      {text: 'Действия', value: 'actions'},
    ],

    bankruptcyEstateList: []
  }),
  methods: {
    editItem(event, {item}) {
      eventBus.$emit('editBankruptcyEstate', item)
    },
    updateData() {
      this.bankruptcyEstateList = []
      this.$store.dispatch('getBankruptcyEstate', this.project).then(data => {
        this.bankruptcyEstateList.push(...data)
      })
    }
  },
  filters:{
    getCategory(item){
      const categoryNames = [
      {text: 'Основные средства', value: 'FA'},
      {text: 'Незавершенное строительство', value: 'CIP'},
      {text: 'Долгосрочные финансовые вложения', value: 'LTFI'},
      {text: 'Недвижимое имущество', value: 'RE'},
      {text: 'Движимое имущество', value: 'MA'},
      {text: 'Запасы', value: 'RS'},
      {text: 'НДС по приобретенным ценностям', value: 'VAT'},
      {text: 'Денежные средства', value: 'CH'},
      {text: 'Дебиторская задолженность', value: 'AR'},
      {text: 'Краткосрочные финансовые вложения', value: 'STFI'},
      {text: 'Прочие оборотные активы', value: 'OCA'},
      {text: 'Не указано', value: 'UN'},
    ]
      return categoryNames.filter(obj => {
        if (obj.value === item) return obj
      })[0]?.text
    }
  },
  created() {
    eventBus.$on('updateBankruptcyEstate', ()=>{
      this.updateData()
    })
    this.updateData()
  }
}
</script>

<style scoped>
.v-expansion-panel-header {
  height: 45px;
}

.procedure_content {
  overflow-y: scroll;
}

.procedure_content .v-card {
  height: 80%;
}

.v-expansion-panel-header > *:not(.v-expansion-panel-header__icon) {
  flex: 0 0 auto;
}
</style>