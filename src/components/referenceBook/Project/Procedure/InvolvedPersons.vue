<template>
  <v-expansion-panel-content class="procedure_content" :style="collapsed? 'max-height: 63vh': 'max-height: 41vh'">
    <v-data-table :headers="headers" :items="involvedPerson" :items-per-page="50"
                  dense
                  height="50%">
      <template v-slot:item.actions="{ item }">
        <v-btn icon small color="primary" @click="editInvolvedPerson(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-expansion-panel-content>
</template>


<script>


import {mapGetters} from "vuex";
import {eventBus} from "@/bus";

export default {
  components: {},
  props: ['project', 'collapsed', 'act'],
  name: "InvolvedPersons",
  data: () => ({
    headers: [
      {text: 'Услуга', value: "work_type"},
      {text: 'Наименование юридического лица или фамилия, имя', value: "contractor"},
      {text: 'Договор', value: "contract"},
      {text: 'Размер вознаграждения', value: "amount"},
      {text: 'Дата судебного акта', value: "judicial_act_date"},
      {text: 'Сведения о наличии аккредитации лица', value: "sro"},
      {text: 'Действия', value: "actions"},
    ],
  }),
  computed: {
    ...mapGetters({
      involvedPerson: 'involvedPersonData'
    })
  },
  methods: {
    update() {
      this.$store.dispatch('getInvolvedPersonList', this.$route.params['pk'])
    },
    editInvolvedPerson(item) {
      eventBus.$emit('editInvolvedPerson', item)
    }
  },
  created() {
    this.update()
  },

}
</script>

<style scoped>
.v-expansion-panel-header {
  height: 45px;
}

.procedure_content {
  overflow-y: scroll;
}

.procedure_content .v-card {
  height: 80%;
}

.v-expansion-panel-header > *:not(.v-expansion-panel-header__icon) {
  flex: 0 0 auto;
}
</style>