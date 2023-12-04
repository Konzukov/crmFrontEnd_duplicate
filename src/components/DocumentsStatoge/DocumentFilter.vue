<template>
  <v-dialog transition="slide-x-transition" v-model="dialog" width="500">
    <v-card width="500" height="600" :loading="loadingData">
      <v-card-title class="justify-center"><h1>Фильтр</h1></v-card-title>
      <v-card-text>
        <v-form>
          <v-row dense>
            <v-col>
              <v-autocomplete class="form-control"
                              dense
                              outlined label="Контраген" clearable
                              v-model="filters.contractor"
                              :items="contractorList" item-text="fullName" item-value="uuid" return-object>
              </v-autocomplete>
            </v-col>
            <v-col>
              <v-autocomplete class="form-control"
                              dense
                              outlined label="Проект" clearable
                              v-model="filters.project"
                              :items="projectList" item-text="name" item-value="id" return-object multiple>
              </v-autocomplete>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col>
              <v-autocomplete outlined dense label="Категория документа"></v-autocomplete>
            </v-col>
            <v-col>
              <v-autocomplete outlined dense label="Тип документа"
                              clearable
                              v-model="filters.type"
                              :items="docTypes" item-text="name" item-value="id" return-object>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-row justify="space-around">
          <v-btn color="error" @click="resetFilter">Сбросить</v-btn>
          <v-btn color="primary" @click="applyFilters">Применить</v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'

const filterInitial = () => ({
  contractor: '',
  project: '',
  type: '',
  category: ''
})

export default {
  name: "DocumentFilter",
  data: () => ({
    dialog: false,
    loadingData: false,
    filters: filterInitial(),
  }),
  computed: {
    ...mapGetters({
      contractorList: 'contractorListData',
      docTypes: 'documentStorageType'
    }),
    projectList() {
      let projectListData = this.$store.getters.projectListData
      if (this.filters.contractor) return projectListData.filter(item => item.contractor === this.filters.contractor)
      return projectListData
    }
  },
  watch: {
    filters: {
      deep: true,
      handler: function (val) {
        // let {contractor, project,type , category} = val
        let isEmpty = this.validateFilter
        if (isEmpty) {
          this.$emit('applyFilters', {})
        }
      }
    }
  },
  methods: {
    validateFilter(val) {
      return Object.keys(val).every(k => !Object.keys(val[k]).length)
    },
    ...mapActions({
      getProjectList: "getProjectList",
      getLegalContractor: "getLegalEntity",
      getPhysicalContractor: "getPhysicalPerson",
      getDocumentType: 'getDocumentType'
    }),
    async open() {
      this.dialog = true
      this.loadingData = true
      await this.getProjectList();
      await this.getLegalContractor();
      await this.getPhysicalContractor();
      await this.getDocumentType();
      this.loadingData = false
    },
    close() {
      this.dialog = false
    },
    applyFilters() {
      if (this.validateFilter(this.filters)) {
        this.resetFilter()
      } else {
        this.$emit('applyFilters', this.filters)
        this.close()
      }

    },
    resetFilter() {
      Object.assign(this.filters, filterInitial())
      this.$emit('applyFilters', {})
      this.close()
    }
  },
  created() {
    this.$parent.$on('showFilter', () => {
      this.open()
    })
  }
}
</script>

<style scoped>
h1 {
  font-size: 16px;
}

.form-control {
  font-size: 14px;
}

>>> .v-label {
  font-size: 14px;
}
</style>