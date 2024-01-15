<template>
  <v-container fluid v-if="permission" >
    <v-data-table
        height="55vh"
        :headers="headers"
        sort-by="number"
        :items="moneyExpensesList"
        class="elevation-1 data-table"
        :loading="loading"
        loading-text="Загрузка данных ожидайте...."
    >
      <template v-slot:top>
        <v-toolbar
            flat
        >
          <v-toolbar-title>Расходы</v-toolbar-title>
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
              @click="newExpenses()"
          >
            Добавить расходы
          </v-btn>
        </v-toolbar>
      </template>
    </v-data-table>
    <createExpenses></createExpenses>
  </v-container>
</template>

<script>

export default {
  name: "MoneyExpenses",
  data: () => ({
    permission: true,
    loading: true,
    headers: [
      {text: '№', value: 'number'},
      {text: 'Получатель', value: 'to_user.fullName'},
      {text: 'Проект', value: 'project'},
      {text: 'Дата', value: 'date'},
      {text: 'Сумма', value: 'amount'},
      {text: 'Описание', value: 'description'},
      {text: 'Действия', value: 'actions', sortable: false},
    ],
  }),
  computed: {
    moneyExpensesList(){
      return this.$store.getters.moneyExpensesListData
    }
  },
  methods:{
    newExpenses(){
      this.$emit('createExpenses')
    },
  },
  components: {
    createExpenses: () => import('./modal/createMoneyExpenses'),
  },
  created() {
    this.$store.dispatch('getMoneyExpenses').then(()=>{
      this.loading = false
    })
  }
}
</script>

<style scoped>

</style>