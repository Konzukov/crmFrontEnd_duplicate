<template>
  <v-card full-width flat >
    <v-text-field
        dense
        v-model="searchField"
        label="Поиск"
        outlined
        class="mt-3"
    ></v-text-field>
    <v-divider></v-divider>
    <v-card-text>
      <v-list-item-group v-model="selectedPerson">
        <v-list-item v-for="item in physicalPersonList" :key="item.pk" @click="viewPersonDetail(item)">
          <v-list-item-avatar>
            <span class="black--text headline">
              {{ item.last_name | avatarLetter }}{{ item.first_name| avatarLetter }}
            </span>
          </v-list-item-avatar>
          <v-list-item-content>

            <v-list-item-title>
              {{ item.last_name }} {{ item.first_name }} {{ item.middle_name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ item.phone || '-' }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "PhysicalPersonList",
  data: () => ({
    searchField: '',
    selectedPerson: '',
  }),
  computed: {
    physicalPersonList() {
      const list = this.$store.getters.physicalPersonData
      if (this.searchField) {
        return list.filter(obj => {
          for (let key in obj) {
            if (obj[key] !== null && obj[key].toString().toLowerCase().indexOf(this.searchField.toLowerCase()) !== -1) {
              return obj
            }
          }
        })
      }
      return list
    }
  },
  methods: {
    viewPersonDetail(person){
      this.$emit("showDetail", person)
    }
  },
  filters: {
    avatarLetter(val) {
      if (!val) return ''
      return val.charAt(0).toUpperCase()
    }
  },
}
</script>

<style scoped>
.v-card__text {
  overflow-y: scroll;
  height: 81vh;
}

.v-avatar .headline {
  font-size: 0.5em;
  letter-spacing: normal !important;
  font-family: "Roboto", sans-serif !important;
}
</style>