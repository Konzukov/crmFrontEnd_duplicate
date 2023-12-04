<template>
  <v-container v-if="loading">
  </v-container>
  <v-container v-else fluid>
    <v-card>
      <v-card-title>
        <v-spacer></v-spacer>
        <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Поиск"
            single-line
            hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
          :headers="headers"
          :items="contractList"
          multi-sort
          :search="search"
      >
        <template v-slot:item.contractor="{ item }">
          <tr>
            <td v-if="item.contractor.type === 'LegalEntity'">
              {{ item.contractor.name }}
            </td>
            <td v-else>
              {{ item.contractor.last_name }} {{ item.contractor.first_name }}
            </td>
          </tr>
        </template>
        <template v-slot:top>
          <v-toolbar flat color="white">
            <v-toolbar-title>Контракты</v-toolbar-title>
            <v-divider
                class="mx-4"
                inset
                vertical
            ></v-divider>
            <v-spacer></v-spacer>
            <ContractCreate></ContractCreate>

          </v-toolbar>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon
              small
              class="mr-2"
          >
            mdi-pencil
          </v-icon>
          <v-icon
              small
          >
            mdi-delete
          </v-icon>
        </template>

      </v-data-table>
    </v-card>
    <DirectionCreate></DirectionCreate>
  </v-container>
</template>

<script>
import ContractCreate from "../modalWindows/crm/ContractCreate";
import DirectionCreate from '../modalWindows/crm/DirectionCreate'

export default {
  name: "Contract",
  data() {
    return {
      loading: true,
      contracts: '',
      search: '',
      participator: '',
      headers: [
        {
          text: 'Номер',
          value: 'number',
          align: 'start',
        },
        {
          text: 'Контрагент',
          value: 'contractor'
        }, {
          text: 'Направление',
          value: 'direction.name'
        }, {
          text: 'Дата начала',
          value: 'date_from'
        }, {
          text: 'Дата окончания',
          value: 'date_to'
        },
        {text: 'Действия', value: 'actions', sortable: false},
      ]
    }
  },
  computed: {
    contractList() {
      return this.$store.getters.contractListData
    }
  },
  watch: {
    contractList(val) {
      if (val) {
        this.loading = false
      }
    }
  },
  created() {
    this.$store.dispatch('getContractList')
  },
  components: {
    ContractCreate,
    DirectionCreate
  }
}
</script>

<style scoped>

</style>