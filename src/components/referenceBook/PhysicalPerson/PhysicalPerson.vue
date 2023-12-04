<template>
  <v-container fluid>
    <v-row justify="start">
      <v-col md="6">
        <PhysicalPersonList @showDetail="showDetail"></PhysicalPersonList>
      </v-col>
      <v-col cols="6" style="height: 90vh;">
        <PhysicalPersonCreate @clearRectified="showDetail(null)" :rectified-physical-person.sync="rectifiedPhysicalPerson"></PhysicalPersonCreate>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import func from "../../../assets/functions/func";

// import RelatedPersonCreate from "../modalWindows/RelatedPersonCreate";
// import RelatedPersonEdit from "../modalWindows/RelatedPersonEdit";
// import ContractCreate from "../modalWindows/crm/ContractCreate";
// import DirectionCreate from "../modalWindows/crm/DirectionCreate";
import PhysicalPersonList from "@/components/referenceBook/PhysicalPerson/PhysicalPersonList";
import PhysicalPersonCreate from "@/components/referenceBook/PhysicalPerson/PhysicalPersonCreate";

export default {
  name: "PhysicalPerson",
  data() {
    return {
      valid: true,
      dialog: false,
      loading: true,
      detailLoading: false,
      fab: false,
      searchField: '',
      apiUrl: '',
      rectifiedPhysicalPerson: null,
      editAction: false,
      selectedServices: [],
      formError: {
        last_name: '',
        phone: '',
        first_name: '',
        email: '',
        services: '',
        hasPermission: '',
      },
      personContract: '',
      rules: {
        nameRules: [v => !!v || 'Данное поля обязатольно'],
        emailRequired: [v => !!v || 'Данное поля обязатольно'],
        emailNotRequired: [v => !v || 'Данное поля не обязатольно'],
      },
    }
  },
  methods: {
    endLoading() {
      this.loading = false
    },
    updateServiceList() {
      let newServicesList = []
      this.selectedServices.forEach(service => {
        this.servicesList.forEach(serviceInList => {
          if (serviceInList['id'] === service) {
            newServicesList.push(serviceInList)
          }
        })
      })
      this.personDetail.services = newServicesList
    },
    showDetail(person) {
      this.rectifiedPhysicalPerson = person
      console.log(this.rectifiedPhysicalPerson)
    },
    editPerm() {
      return func.getPermission('change')
    },
    deletePerm() {
      return func.getPermission('delete')
    },
    savePhysicalPerson(personDetail) {
      let data = func.createFormData(personDetail)
      data.set('newServiceList', this.selectedServices)
      this.$store.dispatch('editPhysicalPerson', {data, personDetail})
    },
    showActions() {
      this.editAction = !this.editAction
    },
    editCancel() {
      this.editAction = !this.editAction
    },
    removePhysicalPerson(pk) {
      this.$store.dispatch('deletePhysicalPerson', pk).then(() => {
        this.$refs.editForm.reset()
      }).catch(err => console.log(err))
    },
    relatedPersonCreate(personDetail) {
      this.$emit('addRelationPerson', personDetail)
    },
    editRelatedPerson(relatedObject) {
      this.$emit('editRelated', relatedObject)
    },
    addContract() {
      this.$emit('addContract')
    },
    editContract(contract) {
      this.$emit('editContract', contract)
    },
    delContract(contract) {
      this.$store.dispatch('deleteContract', contract['pk'])
    },
  },
  computed: {
    servicesList: {
      get() {
        if (this.$store.getters.servicesListData) {
          return this.$store.getters.servicesListData
        } else {
          return new Array()
        }
      }
    }
  },
  components: {
    // RelatedPersonCreate,
    // RelatedPersonEdit,
    // ContractCreate,
    // DirectionCreate,
    PhysicalPersonCreate,
    PhysicalPersonList
  },
  created() {
    this.$store.dispatch('getPhysicalPerson').then(() => {
      this.$store.dispatch('getContractList')
    })
  },

}

</script>

<style scoped lang="scss">
.container {
  height: 100%;
}
</style>