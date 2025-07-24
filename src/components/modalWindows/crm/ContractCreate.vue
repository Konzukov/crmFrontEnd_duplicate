<template>
  <v-container>
    <v-dialog v-model="dialog" max-width="900px" persistent transition="slide-x-reverse-transition">
      <template v-slot:activator="{ on }" v-if="this.$route.name === 'contract'">
        <v-btn color="primary" dark class="mb-2" v-on="on">Новый контракт</v-btn>
      </template>
      <v-card>
        <v-row justify="center">
          <v-card-title>
            <span class="headline">Добавить контракт</span>
          </v-card-title>
        </v-row>
        <v-card-text>
          <v-container>
            <v-form ref="createContract" lazy-validation v-model="valid">
              <v-row justify="start">
                <v-col cols="6">
                  <v-text-field
                      dense
                      id="contractNumber"
                      outlined
                      :error="raiseError(error.number)"
                      :error-messages="error.number"
                      label="Номер контракта"
                      v-model="contract.number"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6" >
                  <v-autocomplete
                      dense
                      outlined
                      label="Участник"
                      :error="raiseError(error.participator)"
                      :error-messages="error.participator"
                      v-model="contract.participator"
                      :items="participator"
                      item-text="participator.fullName"
                      item-value="pk"
                      @change="getDirection(contract.participator)"
                  >
                  </v-autocomplete>
                </v-col>
                <v-col cols="6">
                  <v-autocomplete
                      dense
                      outlined
                      label="Контрагент"
                      :items="contractorData"
                      item-text="fullName"
                      item-value="uuid"
                      return-object
                      :error="raiseError(error.contractor)"
                      :error-messages="error.contractor"
                      v-model="contract.contractor"
                  >
                  </v-autocomplete>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="3">
                  <v-autocomplete
                      dense
                      outlined
                      :disabled="!contract.participator"
                      :items="directionsListData"
                      item-text="direction.name"
                      item-value="pk"
                      :error="raiseError(error.name)"
                      :error-messages="error.name"
                      v-model="contract.direction"
                      append-outer-icon="mdi-plus"
                      @click:append-outer="addDirections(contract.participator)"
                  >
                  </v-autocomplete>
                </v-col>
                <v-col cols="6">
                  <v-textarea rows="2" dense outlined label="Наименование услуги" v-model="contract.service_name"></v-textarea>
                </v-col>
              </v-row>
              <v-row>
                <v-col md="6" sm="12">
                  <v-text-field
                      dense
                      outlined
                      label="Дата начала"
                      :error="raiseError(error.date_from)"
                      :error-messages="error.date_from"
                      type="date"
                      v-model="contract.date_from"
                  ></v-text-field>
                </v-col>
                <v-col md="6" sm="12">
                  <v-text-field
                      outlined
                      label="Дата окончания"
                      type="date"
                      v-model="contract.date_to"
                      :error="raiseError(error.date_to)"
                      :error-messages="error.date_to"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-row justify="center" class="pb-5">
          <v-card-actions>
            <v-btn color="error darken-1" @click="close">Отмена</v-btn>
            <v-btn color="success darken-1" @click="save">Сохранить</v-btn>
          </v-card-actions>
        </v-row>
      </v-card>
    </v-dialog>
    <DirectionCreate></DirectionCreate>
  </v-container>
</template>

<script>
import moment from 'moment'
import DirectionCreate from '../crm/DirectionCreate'

export default {
  name: "ContractCreate",
  props: ['legalEntity', 'physicalPerson'],
  data() {
    return {
      dialog: false,
      valid: false,
      type: 'create',
      error: {},
      contract: {
        pk: '',
        number: '',
        participator: '',
        contractor: '',
        direction: '',
        date_from: '',
        date_to: '',
        service_name: ''
      }
    }
  },
  computed: {
    participator: {
      get() {
        return this.$store.getters.participatorList
      }
    },
    contractorData: {
      get() {
        return this.$store.getters.legalEntityData
      }
    },
    directionsListData: {
      get() {
        if (this.$store.getters.directionsParticipantListData) {
          return this.$store.getters.directionsParticipantListData
        } else {
          return new Array()
        }
      }
    }
  },
  methods: {
    addDirections(participant) {
      this.$emit('newDirection', {'participant': participant, 'type': 'create', 'fromContract': true})
    },
    getDirection(pk) {
      this.$store.dispatch('getDirectionsParticipantList', pk)
    },
    save() {
      let formData = new FormData()
      Object.keys(this.contract).forEach(key => {
        if (key === 'date_form' || key === 'date_to') {
          if (this.contract[key]) {
            formData.set(key, moment(this.contract[key]).format('YYYY-MM-DD'))
          }
        } else {
          if (key === 'contractor') {
            if (this.contract.contractor['type'] === 'LegalEntity') {
              console.log(this.contract[key])
              formData.set('legal_contractor', this.contract[key]['pk'])
            } else if (this.contract.contractor['type'] === 'PhysicalPerson') {
              console.log(this.contract[key])
              formData.set('physical_contractor', this.contract[key]['pk'])
            }
          } else {
            formData.set(key, this.contract[key])
          }
        }
      })
      if (this.type === 'create') {
        this.$store.dispatch('createContract', formData).then(() => {
          Object.assign(this.$data, this.$options.data())
          this.dialog = false
        }).catch((error) => {
          this.error = error.response.data.errors
        })
      } else {
        this.$store.dispatch('changeContract', {'formData': formData, 'pk': this.contract.pk}).then(() => {
          Object.assign(this.$data, this.$options.data())
          this.dialog = false
        })
      }

    },
    raiseError(field) {
      if (field) return true;
      return false
    },
    close() {
      this.dialog = false
      this.$refs.createContract.reset()
    },
  },
  filters: {
    participatorDisplayName(obj) {
      if (obj.item.hasOwnProperty('attributes')) {
        if (obj.item.attributes.participator.hasOwnProperty('name')) {
          return obj.item.attributes.participator['name']
        } else {
          return `${obj.item.attributes.participator['last_name']} ${obj.item.attributes.participator['first_name']}`
        }
      } else {
        if (obj.item.hasOwnProperty('name')) {
          return obj.item['name']
        } else {
          return `${obj.item.last_name} ${obj.item.first_name}`
        }
      }
    }
  },
  created() {
    this.$store.dispatch('getParticipator').then(() => {
      this.$store.dispatch('getLegalEntity').then(() => {
        this.$store.dispatch('fetchPhysicalPersons')
      })
    })
    this.$parent.$on('addContract', ({contractor, participant}) => {
      this.contract.contractor = contractor
      this.contract.participator = this.participator[0].pk
      this.getDirection(this.contract.participator)
      this.dialog = true
      this.type = 'create'
    })
    this.$parent.$on('editContract', (contract) => {
      this.type = 'edit'
      Object.keys(this.contract).forEach(key => {
        if (typeof contract[key] === 'object' && contract[key]) {
          this.contract[key] = contract[key]['pk']
        } else {
          this.contract[key] = contract[key]
        }
      })
      this.getDirection(this.contract.participator)
      this.dialog = true
    })
  },
  components: {
    DirectionCreate
  }
}
</script>

<style scoped>
>>> .v-card .row {
  margin-right: 0px;
}

>>> #contractNumber {
  text-transform: uppercase;
}

>>> .mdi-plus {
  color: green;
  font-size: 30px;
}
</style>