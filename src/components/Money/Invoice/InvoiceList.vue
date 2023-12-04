<template>
  <v-data-table
      sort-by="number"
      :headers="headers"
      :items="invoiceList"
      class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar
          flat
      >
        <v-toolbar-title>Счета</v-toolbar-title>
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
            :to="{name: 'invoice-create'}"
        >
          Новый счет
        </v-btn>
      </v-toolbar>
    </template>
    <template v-slot:item.position="{ item }">
      {{ totalSum(item.position) }}
    </template>
    <template v-slot:item.actions="{ item }">
      <v-menu
          offset-y
          right
          bottom
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
              icon
              v-bind="attrs"
              v-on="on"
          >
            <v-icon>mdi-dots-horizontal</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-btn icon :to="{name:'invoice-edit', params: {id: item.id, invoice: item}}">
            <v-icon>
              mdi-pencil
            </v-icon>
          </v-btn>
          <v-btn icon @click="downloadFile(item.document.docx)" :disabled="!!!item.document.docx">
            <v-icon :color="item.document.docx ? 'success': ''">
              mdi-file-word
            </v-icon>
          </v-btn>
          <v-btn icon @click="downloadFile(item.document.pdf)" :disabled="!!!item.document.pdf">
            <v-icon :color="item.document.docx ? 'success': ''">
              mdi-file-pdf-box
            </v-icon>
          </v-btn>
          <v-btn icon>
            <v-icon>
              mdi-delete
            </v-icon>
          </v-btn>
        </v-list>
      </v-menu>
    </template>
  </v-data-table>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  name: "InvoiceList",
  data() {
    return {
      invoices: [],
      headers: [
        {text: '№', value: 'number'},
        {text: 'Дата', value: 'formation_date'},
        {text: 'Контрагент', value: 'contractor.fullName'},
        {text: 'Сумма', value: 'position'},
        {text: 'Действия', value: 'actions', sortable: false},
      ],
    }
  },
  computed: {
    ...mapGetters({
      invoiceList: 'invoiceListData'
    })
  },
  methods: {
    totalSum(item) {
      let total = 0;
      item.forEach(obj => {
        total += Number.parseFloat(obj.total)
      })
      return total
    },
    downloadFile(item) {
      console.log(item)
      this.$store.dispatch('downloadDocument', {'pk': item.pk, 'fileName': item.fileName})
    },
    editInvoice(item) {
      this.$emit('editInvoice', item)
    }
  },
  mounted() {
    this.$store.dispatch('getInvoiceList').then(() => {
      console.log(this.invoiceList)
    })
  }
}
</script>

<style scoped>
>>>.v-data-table{
  min-height: 20vh;
  max-height: 70vh;
  overflow: scroll;
}
</style>