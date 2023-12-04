<template>
  <v-container>
    <v-dialog v-model="show" max-width="40wv">
      <v-card flat height="80vh">
        <v-toolbar class="mb-6">
          <v-toolbar-title class="mr-5">Новый расход(надо переименовать)</v-toolbar-title>
          <v-divider vertical></v-divider>
          <span class="ml-3 red--text">{{errorMessage}}</span>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon color="error" class="align-content-end" @click="close">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-form lazy-validation v-model="valid" ref="expenses">
            <v-row justify="start">
              <v-col lg="3" md="3" xs="12" sm="12">
                <v-text-field type="datetime-local" v-model="expenses.date" outlined label="Дата"></v-text-field>
              </v-col>
              <v-col lg="3" md="3" xs="12" sm="12">
                <v-text-field v-model="expenses.number" :rules="rules.require" outlined label="Номер"></v-text-field>
              </v-col>
              <v-col lg="4" md="4" xs="12" sm="12">
                <v-autocomplete outlined label="Проект" :items="projectList" :rules="rules.require" v-model="expenses.project"
                                item-value="pk" item-text="name" ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row justify="start">
              <v-col md="5" lg="5" sm="12" xs="12">
                <v-row>
                  <v-col cols="10">
                    <v-select label="От кого"
                              outlined
                              disabled
                              v-model="expenses.from_user"
                              :items="userList"
                              item-text="fullName"
                              item-value="user.pk"
                              return-object
                    ></v-select>
                  </v-col>
                  <v-col cols="10">
                    <v-row class="ml-0">
                      <v-select label="C кошелька" outlined v-model="expenses.from_wallet" append-outer-icon="mdi-plus"
                                @click:append-outer="addWallet(expenses.from_user)" :items="fromWallet"
                                item-value="id"
                                item-text="name"
                      >
                      </v-select>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
              <v-col md="5" lg="5" sm="12" xs="12">
                <v-row>
                  <v-col cols="10">
                    <v-select label="Кому"
                              outlined
                              v-model="expenses.to_user"
                              :items="userList"
                              :rules="rules.require"
                              item-text="fullName"
                              item-value="pk"
                    ></v-select>
                  </v-col>
                  <v-col cols="10">
                    <v-row class="ml-0">
                      <v-select label="На кошельк" outlined v-model="expenses.to_wallet" :items="toWallet"
                                :rules="rules.require"
                                item-value="id"
                                item-text="name"
                      >
                      </v-select>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row justify="start">
              <v-col md="3" lg="3" sm="12" xs="12">
                <v-text-field v-model.number="expenses.amount" label="Сумма" outlined
                              :rules="rules.require"
                              @keypress="onlyNum"></v-text-field>
              </v-col>

              <v-col md="5" lg="5" sm="12" xs="12">
                <v-textarea v-model="expenses.description" label="Описание" outlined rows="2"></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-row justify="space-around">
            <v-btn @click="close" color="error">Отмена</v-btn>
            <v-btn @click="save" color="success" :loading="loading" :disabled="!valid">Сохранить</v-btn>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <createWallet></createWallet>
  </v-container>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'
import moment from "moment";

export default {
  name: "createMoneyExpenses",
  data: () => ({
    show: false,
    valid: false,
    loading: false,
    rules: {
      require: [
          v => !!v || 'Данное поле обязательно'
      ]
    },
    errorMessage: '',
    expenses: {
      number: '',
      project: '',
      date: '',
      from_user: '',
      from_wallet: '',
      to_user: '',
      to_wallet: '',
      amount: 0,
      description: ''

    }
  }),
  computed: {
    ...mapGetters({
      projectList: "projectListData",
      userList: 'allSystemUsersData',
      currentUser: 'authUserData',
    }),
    fromWallet() {
      return this.$store.getters.walletListData.filter(wallet => wallet.user.uuid === this.currentUser.uuid)
    },
    toWallet() {
      return this.$store.getters.walletListData.filter(wallet => {
        console.log(wallet.user.pk, this.expenses.to_user)
        return wallet.user.pk === this.expenses.to_user
      })
    },
    formTitle() {
      return this.editedIndex === -1 ? 'Добавить постуление' : `Редактировать поуступление № ${this.editedIndex}`
    },
  },
  methods: {
    ...mapActions(['getProjectList', 'allSystemUser', 'getWallet']),
    close() {
      Object.assign(this.$data, this.$options.data())
      this.show = false
    },
    onlyNum(evt) {
      evt = (evt) ? evt : window.event;
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    save() {
      if (!this.$refs.expenses.validate()) return false
      this.loading = true
      this.errorMessage = ''
      let formData = new FormData
      Object.keys(this.expenses).forEach(key => {
        if (this.expenses[key]) {
          if (typeof this.expenses[key] === 'object') {
            formData.append(key, this.expenses[key]['id'])
          } else {
            if (key === 'date') {
              formData.append(key, moment(this.expenses[key]).format('yyyy-MM-DDThh:mm'))
            } else {
              formData.append(key, this.expenses[key])
            }
          }
        }
      })
      for (let pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
      }
      this.$store.dispatch('createMoneyExpenses', formData).then(()=>{
        this.close()
      }).catch(err=>{
        this.loading = false
        this.errorMessage = err.response.data.errors['detail']
      })
    },
    addWallet(item) {
      this.$emit('addWallet', item)
      console.log(item)
    }
  },
  components: {
    createWallet: () => import ('./createWallet')
  },
  created() {
    this.$parent.$on('createExpenses', () => {
      this.getProjectList()
      this.getWallet()
      this.allSystemUser().then(() => {
        this.expenses.from_user = this.currentUser.pk
        this.expenses.date = moment(new Date()).format('YYYY-MM-DDTHH:mm')
      })
      this.show = true
    })
  }
}
</script>

<style scoped>

</style>