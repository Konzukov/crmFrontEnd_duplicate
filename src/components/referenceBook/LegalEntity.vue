<template>
  <v-container fluid>
    <v-row justify="start">
      <v-col md="6">
        <v-text-field
            v-model="searchField"
            label="Поиск"
            outlined
            dense
        ></v-text-field>
        <v-divider></v-divider>
        <v-card full-width class="legal-list" flat>
          <v-card-text>
            <v-list-item-group v-model="selected">
              <v-list-item v-for="item in filteredLegalEntity" :key="item.pk">
                <v-list-item-content @click="showDetail(item.pk)">
                  <v-list-item-title>{{ item.fullName || item.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    ИНН {{ item.inn || '-' }} / ОРГН {{ item.ogrn || '-' }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col md="6">
        <LegalEntityCreate  :legalData="legalData" @close="closeForm"></LegalEntityCreate>
      </v-col>
    </v-row>
    <RelatedPersonCreate :legalEntity.sync="legalEntityDetail"></RelatedPersonCreate>
    <RelatedPersonEdit :legalEntity.sync="legalEntityDetail"></RelatedPersonEdit>
    <ContactInfoCreate :legalEntity.sync="legalEntityDetail"></ContactInfoCreate>

    <ContactInfoEdit></ContactInfoEdit>
    <StaffCreate></StaffCreate>
    <StaffEdit></StaffEdit>
    <ContractCreate :legalEntity.sync="legalEntityDetail"></ContractCreate>
  </v-container>
</template>

<script>
import Axios from 'axios'
import func from "../../assets/functions/func";
import RelatedPersonCreate from "../modalWindows/RelatedPersonCreate";
import RelatedPersonEdit from "../modalWindows/RelatedPersonEdit";
import ContactInfoCreate from "../modalWindows/ContactInfoCreate";
import ContactInfoEdit from "../modalWindows/ContactInfoEdit";
import StaffCreate from "../modalWindows/StaffCreate";
import StaffEdit from "../modalWindows/StaffEdit";
import ContractCreate from "../modalWindows/crm/ContractCreate";

import LegalEntityCreate from "@/components/referenceBook/LegalEntity/LegalEntityCreate";

// import ContractEdit from "../modalWindows/crm/ContractEdit";

export default {

  name: "LegalEntity",
  data() {
    return {
      selected: '',
      loader: false,
      searchField: '',
      loading: true,
      getDataDone: false,
      isEditing: false,
      editAction: false,
      countyList: [],
      legalEntityContract: '',
      legalData: null,
    }
  },
  methods: {
    closeForm(){
      console.log('asdasdasd')
      this.legalData = null

    },
    endLoading() {
      this.loading = false
    },
    showDetail(pk) {
      this.legalData = null
      this.loading = true
      this.$store.dispatch('getLegalEntityDetailInfo', pk).then((item) => {

        setTimeout(()=>{
          this.legalData = Object.assign({}, item)
        }, 100)

        this.loading = false
      })
    },
    showActions() {
      this.editAction = !this.editAction
    },
    editCancel() {
      this.editAction = !this.editAction
    },
    saveLegalEntity(legalEntityDetail) {
      let data = func.createFormData(this.legalEntityDetail)
      this.$store.dispatch('editLegalEntity', {data, legalEntityDetail})
    },
    deleteLegalEntity(pk) {
      this.$store.dispatch('deleteLegalEntity', pk).then(() => {
        this.$refs.editForm.reset()
      }).catch(err => console.log(err))
    },
    relatedPersonCreate(legalEntity) {
      this.$emit('addRelationPerson', legalEntity)
    },
    removeRelatedPhysicalPerson(relationPk, legalEntityPk) {
      this.$store.dispatch('deleteRelatedPerson', {
        'relation': relationPk,
        'person': legalEntityPk,
        'type': 'legalEntity'
      })
    },
    editRelatedPerson(relatedObject) {
      this.$emit('editRelated', relatedObject)
    },
    editContactInfo(contact) {
      this.$emit('editContact', contact)
    },
    removeContactInfo(contact, entityPk) {
      this.$store.dispatch('deleteContactInfo', {'contact': contact, 'entity': entityPk})
    },
    addContactInfo(legalEntity) {
      this.$emit('addContactInfo', legalEntity)
    },
    addBankAccount(legalEntity) {
      this.$emit('addBankAccount', legalEntity)
    },
    addStaff(legalEntity) {
      this.$emit('addStaff', legalEntity)
    },
    editStaff(staff, legalEntity) {
      this.$emit('editStaff', staff, legalEntity)
    },
    delStaff(staffPk, legalEntityPk) {
      this.$store.dispatch('deleteStaff', {'staffPk': staffPk, 'legalEntityPk': legalEntityPk})
    },
    addContract(legalEntity) {
      this.$emit('addContract', new Array(legalEntity))
    },
    delContract(contract) {
      this.$store.dispatch('deleteContract', contract['pk'])
    },
    editContract(contract) {
      this.$emit('editContract', contract)
    },
    checkOrganization(inn) {
      this.loader = !this.loader
      Axios({
        method: 'get',
        url: 'http://localhost:8080/api/egr?req=' + inn + '&key=0f1b50c8fd2a53fddda080ecca86d46176a7ae44',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
      }).then(response => {
        if (response.data.items[0].ЮЛ) {
          this.legalEntityDetail.full_name = response.data.items[0].ЮЛ.НаимПолнЮЛ
          this.legalEntityDetail.name = response.data.items[0].ЮЛ.НаимСокрЮЛ
          this.legalEntityDetail.kpp = response.data.items[0].ЮЛ.КПП
          this.legalEntityDetail.ogrn = response.data.items[0].ЮЛ.ОГРН
          this.legalEntityDetail.registration_date = response.data.items[0].ЮЛ.ДатаРег
          this.legalEntityDetail.legal_address = response.data.items[0].ЮЛ.Адрес.Индекс +
              ', ' + response.data.items[0].ЮЛ.Адрес.АдресПолн

        } else if (response.data.items[0].ИП) {
          this.legalEntityDetail.full_name = "ИП " + response.data.items[0].ИП.ФИОПолн
          this.legalEntityDetail.name = "ИП " + response.data.items[0].ИП.ФИОПолн.split(' ')[0] +
              response.data.items[0].ИП.ФИОПолн.split(' ')[1][0] + '.' +
              response.data.items[0].ИП.ФИОПолн.split(' ')[1][0] + '.'
          this.legalEntityDetail.ogrn = response.data.items[0].ИП.ОГРНИП
          this.legalEntityDetail.registration_date = response.data.items[0].ИП.ДатаРег
          this.legalEntityDetail.legal_address = response.data.items[0].ИП.Адрес.АдресПолн
        }

      }).then(() => {
        this.loader = false
        this.getDataDone = true

      })
    },
  },
  computed: {
    filteredLegalEntity() {
      if (this.legalEntity) {
        return this.legalEntity.filter(obj => {
          for (let key in obj) {
            if (obj[key] !== null && obj[key].toString().toLowerCase().indexOf(this.searchField.toLowerCase()) !== -1) {
              return obj
            }
          }
        })
      } else {
        return false
      }
    },
    legalEntity() {
      return this.$store.getters.legalEntityData
    },
    editPerm() {
      return func.getPermission('change')
    },
    deletePerm() {
      return func.getPermission('delete')
    },
    contractList() {
      return this.$store.getters.contractListData
    },
    legalEntityDetail() {
      return this.$store.getters.legalEntityDetailData
    }
  },
  watch: {
    legalEntity(data) {
      if (data) {
        this.endLoading()
      }
    },
    contractList(val) {
      if (this.legalEntityDetail) {
        this.showDetail(this.legalEntityDetail.pk)
      }

    }
  },
  filters: {
    fullName(obj) {
      if (obj.middle_name !== "undefined") {
        return `${obj.first_name} ${obj.last_name} ${obj.middle_name}`
      }
      return `${obj.first_name} ${obj.last_name}`
    },
    Department(obj) {
      if (obj) {
        return obj.name
      }
    },
    Position(obj) {
      if (obj) {
        return obj.name
      }
    }
  },
  created() {
    this.$store.dispatch('getLegalEntity').then(() => {
      this.$store.dispatch('getContractList')
    })
  },
  components: {
    LegalEntityCreate,
    RelatedPersonCreate,
    RelatedPersonEdit,
    ContactInfoCreate,
    ContactInfoEdit,
    StaffCreate,
    StaffEdit,
    ContractCreate,

  }
}
</script>

<style scoped>
div.container {
  padding: 0 12px !important;
}

div.v-card {
  max-height: 70vh;
  overflow: auto;
}

>>> .done {
  color: green;
}
</style>