<template>
  <v-container fluid :style="collapsed? 'height: 75vh': 'height: 55vh'">
    <v-row justify="start" style="height: 100%">
      <v-col cols="6">
        <v-card height="100%">
          <v-card-text>
            <v-list-item-group v-model="selected">
              <v-list-item v-for="item in separateDisputeList" :key="item.id">
                <v-list-item-content @click="showDetail(item)">
                  <v-list-item-title>{{ item.case_number }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.court.name }} | {{ item.court.address }}</v-list-item-subtitle>
                  <v-list-item-subtitle>{{ item.judge.full_name }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card height="100%">
          <v-card-title>
            {{ separateDispute.id ? 'Редактирование обособленного спора' : 'Добавление обособленного спора' }}
          </v-card-title>
          <v-card-text style="height: 75%">
            <v-row justify="start" class="mt-3">
              <v-col cols="3" class="mr-7">
                <v-text-field outlined dense label="Номер дела" v-model="separateDispute.case_number"></v-text-field>
              </v-col>
            </v-row>
            <v-row justify="start" class="mt-3">
              <v-col cols="7" class="mr-7">
                <v-autocomplete outlined dense label="Суд" clearable :items="courtList" item-text="name"
                                item-value="pk" :error="!!errors['court']"
                                :error-messages="errors['court']"
                                v-model="separateDispute.court"></v-autocomplete>
              </v-col>
              <v-col cols="4" class="mr-7">
                <v-autocomplete outlined dense clearable label="Судья"
                                :disabled="!separateDispute.court"
                                :error="!!errors['judge']"
                                :error-messages="errors['judge']"
                                :items="judgesList" item-text="full_name" item-value="id"
                                v-model="separateDispute.judge"></v-autocomplete>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-row justify="center" class="mb-5">
              <v-btn color="success" @click="createSeparateDispute">
                {{ separateDispute.id ? 'Сохранить' : 'Добавить' }}
              </v-btn>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>


import {mapGetters} from "vuex";

export default {
  name: "SeparateDispute",
  props: ['project', 'collapsed'],
  data: () => ({
    selected: null,
    separateDisputeList: [],
    separateDispute: {
      id: '',
      case_number: '',
      court: '',
      judge: '',
    },
    errors: {}
  }),
  methods: {
    async updateData() {
      await this.$store.dispatch('getSeparatedDisputeList', this.project).then(res => {
        this.separateDisputeList = res.data.data.data
      })
    },
    createSeparateDispute() {
      let formData = new FormData()
      Object.keys(this.separateDispute).forEach(key => {
        if (this.separateDispute[key]) {
          formData.append(key, this.separateDispute[key])
        }
      })
      formData.append('project', this.project)
      if (this.separateDispute.id) {
        this.$store.dispatch('editSeparatedDispute', {formData: formData, id: this.separateDispute.id}).then(() => {
          this.updateData()
        })
      } else {
        this.$store.dispatch('createSeparatedDispute', formData).then(() => {
          this.updateData()
        })
      }
    },
    showDetail(item) {
      this.separateDispute = new Object()
      this.separateDispute.id = item.id
      this.separateDispute.case_number = item.case_number
      this.separateDispute.court = item.court.pk
      this.separateDispute.judge = item.judge.id
    }
  },
  computed: {
    ...mapGetters({
      courtList: 'courtListData',

    }),
    judgesList() {
      const judgeListData = this.$store.getters.judgeListData
      if (this.separateDispute.court) {
        return judgeListData.filter(obj => {
          if (obj.court) {
            return obj.court.id === this.separateDispute.court
          }
        })
      }
      return judgeListData
    }
  },
  filters: {},
  async mounted() {
    await this.$store.dispatch('getJudgeList')
    await this.$store.dispatch('getCourtList')
    await this.updateData()

  },
  components: {}
}
</script>

<style scoped>

</style>