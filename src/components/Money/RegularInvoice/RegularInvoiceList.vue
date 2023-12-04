<template>
  <v-container fluid>
    <v-data-table
        sort-by="number"
        :headers="headers"
        :items="regularInvoice"
        height="60vh"
        class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar
            flat
        >
          <v-toolbar-title>Регулярные счета</v-toolbar-title>
          <v-divider
              class="mx-4"
              inset
              vertical
          ></v-divider>
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              dark
              class="mb-2"
              :to="{name: 'regular-invoice-create'}"
          >
            Новый счет
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon color="primary" @click="edit(item)"><v-icon>mdi-pencil</v-icon></v-btn>
      </template>
      <template v-slot:footer>
        <v-btn @click="runGenerate">Запусть</v-btn>
      </template>
    </v-data-table>
  </v-container>

</template>

<script>
import {mapGetters} from 'vuex'
import customConst from "../../../const/customConst";

export default {
  name: "RegularInvoiceList",
  data: () => ({
    headers: [
      {text: 'Контрагент', value: 'contractor.fullName'},
      {text: 'Договор', value: 'contract'},
      {text: 'Сумма', value: 'sum'},
      {text: 'Действия', value: 'actions'},
    ]
  }),
  computed: {
    ...mapGetters({
      regularInvoice: 'regularInvoiceListData'
    })
  },
  methods:{
    edit(item){
      this.$router.push({name: 'regular-invoice-edit', params: {id:item.id}})
      console.log(item)
    },
    runGenerate(){
      this.$http({
        method: 'GET',
        url: customConst.MONEY + 'run-periodical-invoice'
      }).then(res=>{
        console.log(res)
      })
    }
  },
  created() {
    this.$store.dispatch('getRegularInvoice')
  }
}
</script>

<style scoped>
>>>.v-data-table{

  overflow: scroll;
}
</style>