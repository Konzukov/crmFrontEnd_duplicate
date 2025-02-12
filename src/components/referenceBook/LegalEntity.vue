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
                <v-list-item-content @click="showDetail(item)">
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

      <v-col md="6" >
        <LegalEntityEditForm></LegalEntityEditForm>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
 import LegalEntityEditForm from "@/components/referenceBook/LegalEntity/LelagEntityForm.vue";

export default {
  name: "LegalEntity",
  data: () => ({
    searchField: '',
    selected: null,
    selectedItem: {},
  }),
  methods: {
    showDetail(item) {
      this.$emit('legalEntityEdit', item)
    }
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
  },
  watch: {},
  filters: {},
  created() {
    this.$store.dispatch('getLegalEntity')
  },
  components: {
    LegalEntityEditForm
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