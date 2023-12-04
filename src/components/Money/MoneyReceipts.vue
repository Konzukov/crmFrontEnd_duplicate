<template>
  <v-container fluid v-if="permission">
    <v-data-table
        :headers="headers"
        :items="moneyReceiptsList"
        sort-by="number"
        class="elevation-1"
        :item-class="is_confirm"
        height="55vh"
    >
      <template v-slot:top>
        <v-toolbar
            flat
        >
          <v-toolbar-title>Поступления</v-toolbar-title>
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
              @click="newReceipts()"
          >
            Добавить поступление
          </v-btn>

          <!--          <v-dialog v-model="dialogDelete" max-width="500px">-->
          <!--            <v-card>-->
          <!--              <v-card-title class="headline">Are you sure you want to delete this item?</v-card-title>-->
          <!--              <v-card-actions>-->
          <!--                <v-spacer></v-spacer>-->
          <!--                <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>-->
          <!--                <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>-->
          <!--                <v-spacer></v-spacer>-->
          <!--              </v-card-actions>-->
          <!--            </v-card>-->
          <!--          </v-dialog>-->
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon
            small
            class="mr-2"
            @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
            small
            @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>
      <template v-slot:no-data>
        <v-btn
            color="primary"
            @click="initialize"
        >
          Reset
        </v-btn>
      </template>
    </v-data-table>
    <createReceipts></createReceipts>
    <deleteMoney></deleteMoney>
  </v-container>
</template>

<script>
import createReceipts from "@/components/Money/modal/createReceipts";
import {mapGetters} from 'vuex'
import deleteMoney from "./modal/deleteMoney";


export default {
  name: "MoneyReceipts",
  data: () => ({
    actionButton: false,
    permission: null,
    lastNum: 0,
    headers: [
      {text: '№', value: 'number'},
      {text: 'Отправитель', value: 'user.fullName'},
      {text: 'Проект', value: 'project'},
      {text: 'Дата', value: 'date'},
      {text: 'Сумма', value: 'amount'},
      {text: 'Описание', value: 'description'},
      {text: 'Действия', value: 'actions', sortable: false},
    ],
  }),
  computed: {
    ...mapGetters({
      moneyReceiptsList: 'moneyReceiptsListData'
    }),
  },
  methods: {
    newReceipts() {
      this.$emit('newReceipts', this.lastNum)
    },
    editItem(item) {
      this.$emit('editReceipts', item)
    },
    deleteItem(item) {
      this.$emit('deleteReceipt', item)
    },
    is_confirm(item) {
      if (!item.is_confirm) {
        return 'not-confirm'
      }
    }
  },
  watch: {
    moneyReceiptsList(val) {
      if (val.length > 0) {
        this.lastNum = val.length
      }
    }
  },
  created() {
    this.$store.dispatch('getMoneyReceipts').then(() => {
      this.permission = true
    }).catch((err => {
      if (err.response.status === 403) {
        this.permission = false
        this.$router.push({name: 'permission-denied'})
      }
    }))
  },
  components: {
    createReceipts,
    deleteMoney
  }
}
</script>

<style scoped>
>>> .not-confirm {
  color: rgba(88, 88, 88, 0.68) !important;
}
</style>