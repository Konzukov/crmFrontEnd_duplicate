<template>
  <v-data-table
      sort-by="number"
      :headers="headers"
      :items="actList"
      class="elevation-1"
  >
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
          <v-btn icon :to="{name:'act-edit', params: {id: item.id, invoice: item}}">
            <v-icon color="primary">
              mdi-pencil
            </v-icon>
          </v-btn>
          <v-btn icon @click="downloadFile(item['act_doc'].docx)" :disabled="!!!item['act_doc'].docx">
            <v-icon :color="item['act_doc'].docx ? 'success': ''">
              mdi-file-word
            </v-icon>
          </v-btn>
          <v-btn icon @click="downloadFile(item['act_doc'].pdf)" :disabled="!!!item['act_doc'].pdf">
            <v-icon :color="item['act_doc'].docx ? 'success': ''">
              mdi-file-pdf-box
            </v-icon>
          </v-btn>
          <v-btn icon disabled>
            <v-icon color="error">
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
  name: "ActList",
  data: () => ({
    headers: [
      {text: '№', value: 'number'},
      {text: 'Дата', value: 'formation_date'},
      {text: 'Контрагент', value: 'contract.contractor.fullName'},
      {text: 'Счет', value: 'invoice.name'},
      {text: 'Действия', value: 'actions', sortable: false},
    ],
  }),
  computed: {
    ...mapGetters({
      actList: 'actListData'
    })
  },
  methods: {
    downloadFile(item) {
      this.$store.dispatch('downloadDocument', {'pk': item.pk, 'fileName': item.fileName})
    },
  },
  created() {
    this.$store.dispatch('getActList')
    console.log(this.actList)
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