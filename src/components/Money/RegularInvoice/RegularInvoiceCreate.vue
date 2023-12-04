<template>
  <v-container fluid>
    <v-row>
      <v-col cols="7">
        <v-card height="80vh" style="overflow-x: hidden; overflow-y: scroll">
          <v-toolbar>
            <v-btn icon @click="$router.go(-1)">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title>{{ regularInvoice.id ? 'Редактирование' : 'Добавление нового' }} регулярного счета
            </v-toolbar-title>
            <v-divider vertical class="ml-4"></v-divider>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-row justify="space-around">
                <v-col cols="5">
                  <v-select label="Организация" outlined v-model="regularInvoice.organization" disabled
                            :items="userData.profile.available_organization" item-text="name"
                            item-value="uuid"></v-select>
                </v-col>
                <v-col cols="7">
                  <v-select :items="organizationBankAccount" item-value="id" item-text="account"
                            label="Расчетный счет"
                            :rules="rules.require"
                            outlined v-model="regularInvoice.organization_bank_account">
                  </v-select>
                </v-col>
              </v-row>
              <v-row justify="start">
                <v-col cols="4">
                  <v-autocomplete outlined label="Контрагент" :items="legalList.data" item-value="uuid"
                                  return-object v-model="regularInvoice.contractor" @change="getContracts"
                                  item-text="fullName" @input="getContractorAccount"
                                  :rules="rules.require"
                  ></v-autocomplete>
                </v-col>
                <v-col cols="6">
                  <v-autocomplete outlined label="Договор" :items="contractorContractListData" item-value="pk"
                                  item-text="name" :disabled="!!!regularInvoice.contractor"
                                  :loading="contractIsLoading" v-model="regularInvoice.contract">
                    <template v-slot:no-data>
                      <div class="ml-4"><span>Добавить новый</span>
                        <v-btn icon @click="addContract">
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </div>
                    </template>
                  </v-autocomplete>
                </v-col>
              </v-row>
              <v-row justify="start">
                <v-col cols="5">
                  <v-combobox
                      v-model="regularInvoice.emails"
                      outlined
                      :search-input.sync="email"
                      label="Email для отправки"
                      multiple
                      persistent-hint
                      small-chips
                  >
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            Нажмите <kbd>enter</kbd> что бы добавить <strong>{{ email }}</strong>
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-combobox>
                </v-col>
                <v-col cols="5">
                  <v-combobox
                      v-model="regularInvoice.admin_emails"
                      outlined
                      :search-input.sync="email"
                      label="Email администратора/ов"
                      multiple
                      persistent-hint
                      small-chips
                      hint="На данные email адреса будут отправлены все документы включая docx"
                  >
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            Нажмите <kbd>enter</kbd> что бы добавить <strong>{{ email }}</strong>
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-combobox>
                </v-col>
              </v-row>
              <div class="invoice-item">
                <v-row class="mt-3 ml-3 mr-0" v-for="(pos, i) in regularInvoice.position" :key="i">
                  <v-col cols="6">
                    <v-text-field v-model="pos.service" outlined label="Название услуги"></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="pos.price" outlined label="Сумма"></v-text-field>
                  </v-col>
                  <v-col cols="1">
                    <v-btn icon color="error" @click="removePosition(i)">
                      <v-icon>mdi-minus</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row justify="center">
                  <v-btn icon color="success" @click="addPosition">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </v-row>
              </div>
            </v-form>
            <v-divider></v-divider>
            <v-row justify="center" class="mb-3 mt-3">
              <span class="headline">Расписание</span>
            </v-row>
            <v-form ref="schedule-form">
              <v-row>
                <v-select :items="scheduleList" outlined label="Расписение" item-text="name" item-value="id"
                          return-object @input="setSchedule" v-model="regularInvoice.schedule.id"></v-select>
              </v-row>

              <v-row justify="start">
                <v-col cols="5">
                  <v-text-field outlined label="Дата" type="date"
                                v-model="regularInvoice.schedule.in_current_date"></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-select
                      :items="periodList"
                      outlined
                      label="Период"
                      item-value="val"
                      item-text="name"
                      v-model="regularInvoice.schedule.periodicity"
                  >
                  </v-select>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-row justify="center">
              <v-col cols="4">
                <v-btn color="error" @click="close">Отмена</v-btn>
              </v-col>
              <v-col cols="4">
                <v-btn color="success" @click="save">Добавить</v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="5">
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: "RegularInvoiceCreate",
  data: () => ({
    actionType: 'create',
    contractIsLoading: false,
    email: null,
    periodList: [
      {val: 'Day', name: 'День'},
      {val: 'Week', name: 'Неделя'},
      {val: 'Month', name: 'Месяц'},
      {val: 'Quarter', name: 'Квартал'},
      {val: 'Year', name: 'Год'},
    ],
    regularInvoice: {
      id: '',
      organization: null,
      organization_bank_account: null,
      contractor: '',
      contract: '',
      emails: [],
      admin_emails: [],
      position: [
        {
          id: '',
          service: '',
          price: 0
        }
      ],
      schedule: {
        id: '',
        in_current_date: '',
        periodicity: 'Month'
      }
    },
    organizationBankAccount: [],
    rules: {
      require: [v => !!v || 'Данное поле обязательно'],
    },

  }),
  methods: {
    ...mapActions({
      getOrganizationBankAccount: 'getOrganizationBankAccount',
      getContractorBankAccount: 'getContractorBankAccount',
      getContractorContract: 'getContractorContract'
    }),
    getContracts(obj) {
      this.contractIsLoading = true
      this.getContractorContract(obj.uuid).then(() => {
        this.contractIsLoading = false
      })
    },
    getContractorAccount(item) {
      this.getContractorBankAccount(item.uuid).then(account => {
        this.contractorAccount = account
      })
    },
    addContract() {
      this.$emit('addContract', ({contractor: this.invoice.contractor, participant: this.invoice.organization}))
    },
    addPosition() {
      let posObj = {
        service: '',
        price: 0
      }
      this.regularInvoice.position.push(posObj)
    },
    removePosition(index) {
      this.regularInvoice.position.splice(index, 1)
    },
    save() {
      let formData = new FormData()
      Object.keys(this.regularInvoice).forEach(key => {
        console.log(key)
        if (key === 'schedule') {
          formData.set(key, JSON.stringify(this.regularInvoice[key]))
        } else if (key === 'position') {
          this.regularInvoice[key].forEach(obj => {
            formData.append('position', JSON.stringify(obj))
          })
        } else if (key === 'emails') {
          formData.append(key, this.regularInvoice[key])
        }
        else if (key === 'admin_emails') {
          formData.append(key, this.regularInvoice[key])
        } else {
          if (typeof this.regularInvoice[key] === 'object') {
            formData.set(key, this.regularInvoice[key]['id'])
          } else {
            formData.set(key, this.regularInvoice[key])
          }
        }
      })
      if (this.actionType === 'create') {
        this.$store.dispatch('createRegularInvoice', formData).then((data)=>{
          this.regularInvoice.id = data.id
        })
      } else {
        this.$store.dispatch('editRegularInvoice', {id: this.regularInvoice.id, formData: formData})
      }
    },
    setSchedule(item) {
      this.regularInvoice.schedule.id = item.id
      this.regularInvoice.schedule.in_current_date = item.in_current_date
      this.regularInvoice.schedule.periodicity = item.periodicity
    },
    close(){
      this.$router.go(-1)
    }
  },
  computed: {
    ...mapGetters({
      userData: 'authUserData',
      legalList: 'legalEntityData',
      contractorContractListData: 'contractorContractListData',
      scheduleList: 'scheduleListData'
    })
  },
  created() {
    this.$store.dispatch('getSchedule')
    this.regularInvoice.organization = this.userData.profile['active_organization'].uuid
    this.getOrganizationBankAccount(this.regularInvoice.organization).then((data) => {
      this.organizationBankAccount = data
    })
    const id = this.$route.params.id
    if (id || this.$route.name === 'regular-invoice-edit') {
      this.actionType = 'edit'
    }
    this.$store.dispatch('getDetailRegularInvoice', id).then(res => {
      this.regularInvoice.id = res.id
      this.regularInvoice.contractor = res.contractor
      this.getContracts(res.contractor)
      this.regularInvoice.contract = res.contract
      this.regularInvoice.organization_bank_account = res.organization_bank_account
      this.regularInvoice.emails.push(res.emails)
      this.regularInvoice.schedule.id = res.schedule
      this.setSchedule(res.schedule)
      this.regularInvoice.position = []
      res.position.forEach(pos => {
        this.regularInvoice.position.push(pos)
      })
    })
  }
}
</script>

<style scoped>
>>> .invoice-item {
  max-height: 25vh !important;
  overflow-y: scroll !important;
  overflow-x: hidden !important;

}
</style>