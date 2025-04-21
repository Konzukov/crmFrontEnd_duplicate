<template>
  <v-expansion-panel>
    <v-expansion-panel-header class="pr-5 pl-5">
      3. Информация о жалобах на действия (бездействие) финансового управляющего
      <v-spacer></v-spacer>
      <v-btn icon small class="mr-6" color="success" @click.native.stop="addComplaints">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-expansion-panel-header>
    <v-expansion-panel-content class="procedure_content" :style="collapsed? 'height: 63vh': 'height: 41vh'">
      <v-data-table :headers="headers" :items="complaintsList" :items-per-page="50"
                    dense
                    height="50%">
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="primary" @click="editComplaint(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>


<script>
import {eventBus} from "@/bus";
import {mapGetters} from "vuex";

export default {
  props: ['project', 'collapsed', 'act'],
  name: "Complaints",
  data: () => ({
    headers: [
      {text: 'Заявитель', value: 'complainant'},
      {text: 'Дата поступления жалобы', value: 'complaint_date'},
      {text: 'Орган рассмотревший жалобу', value: 'decision_maker.name'},
      {text: 'Суть жалобы', value: 'complaint_essence'},
      {text: 'Принятое решение', value: 'accepted_decision'},
      {text: 'Дата документа по итогам рассмотрения жалобы', value: 'act_date'},
      {text: 'Сведения о пересмотре', value: 'revision'},
      {text: 'Действия', value: "actions"},
    ]
  }),
  computed: {
    ...mapGetters({
      complaintsList: "complaintsData"
    })
  },
  methods: {
    addComplaints() {
      eventBus.$emit('addComplaints', this.project)
    },
    editComplaint(item){
      eventBus.$emit('editComplaints', item)
    }
  },
  created() {
    this.$store.dispatch('getComplaintList', this.project)
  }
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