<template>
  <v-expansion-panel-content class="procedure_content" :style="collapsed? 'height: 63vh': 'height: 41vh'">
    <v-row justify="start" style="height: 80%">
      <v-col cols="12">
        <v-card flat>
          <v-card-text style="height: 80%">
            <v-row justify="start" v-for="(item, i) in creditorMeetingList" :key="i">
              <v-col cols="2">
                {{ item.date | dateFilter }}
                <v-btn icon small color="primary" @click="editItem($event, {item})">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </v-col>
              <v-col cols="5" v-html="item.agendas"></v-col>
              <v-col cols="5" v-html="item.resolutions"></v-col>
              <v-col cols="12">
                <hr>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-expansion-panel-content>
</template>


<script>
import {eventBus} from "@/bus";
import {mapGetters} from 'vuex'
import moment from "moment";

export default {
  props: ['project', 'collapsed'],
  name: "CreditorMeeting",
  data: () => ({}),
  computed: {
    ...mapGetters({
      creditorMeetingList: "creditorMeetingData"
    })
  },
  methods: {
    editItem(event, {item}) {
      eventBus.$emit('editCreditorMeeting', item)
    },
    updateData() {
      this.$store.dispatch('getCreditorMeeting', this.project)
    }
  },
  filters: {
    dateFilter(item) {
      return moment(item).format('DD.MM.YYYY HH:mm')
    }
  },
  created() {
    eventBus.$on('', () => {
      this.updateData()
    })
    this.updateData()
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