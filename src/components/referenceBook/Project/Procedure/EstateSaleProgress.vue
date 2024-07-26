<template>
  <v-expansion-panel-content class="procedure_content" :style="collapsed? 'height: 63vh': 'height: 41vh'">
    <v-row justify="start" style="height: 80%">
      <v-col cols="12">
        <v-card flat>
          <v-card-text style="height: 80%">
            <v-data-table
                :headers="headers"
                :items="estateSaleProgress"
            >
              <template v-slot:item.implementation_method="{ item }">
                {{ item.implementation_method | getCategory }}
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
  props: ['collapsed', 'project'],
  name: "EstateSaleProgress",
  data: () => ({
    estateSaleProgress: [],
    headers: [
      {text: 'Имущество', value: 'estate.goods_name'},
      {text: 'Способ реализации ', value: 'implementation_method'},
      {text: 'Дата договора ', value: 'agreement_date'},
      {text: 'Номер договора', value: 'agreement_number'},
      {text: 'Стоимость', value: 'cost'},
      {text: 'Действия', value: 'actions'},
    ]
  }),
  methods: {
    editItem(event, {item}) {
      eventBus.$emit('editEstateSale', item)
    },
    updateData() {
      this.estateSaleProgress = []
      this.$store.dispatch('getEstateSaleProgress', this.project).then(data => {
        this.estateSaleProgress.push(...data)
      })
    }
  },
  filters: {
    getCategory(item) {
      const implementationMethodList = [
        {val: 'POC', text: 'Публичное предложение, закрытая форма'},
        {val: 'POO', text: 'Публичное предложение, открытая форма'},
        {val: 'OAO', text: 'Открытый аукцион, открытая форма'},
        {val: 'CAO', text: 'Закрытый аукцион, открытая форма'},
      ]
      return implementationMethodList.filter(obj => {
        if (obj.val === item) return obj
      })[0]?.text
    }
  },
  created() {
    eventBus.$on('updateEstateSaleProgress', () => {
      console.log('emited')
      this.updateData()
    })
    this.updateData()
  }
}
</script>


<style scoped>

</style>