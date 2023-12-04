<template>
  <v-container class="wizard-container" fluid>
    <v-card height="90vh" flat>
      <v-row id="wizard-container">
        <v-col id="steps">
          <h2>Генерация </h2>
          <template v-for="s in steps">
            <transition name="active-step" :key="s.number">
              <div class="step" :class="[s.number === step ? 'active-step': '']" @click="step= s.number">
                <span class="number">{{ s.number }}</span>
                <h3>{{ s.text }}</h3>
                <hr v-if="s.number != steps.length">
              </div>
            </transition>
          </template>
        </v-col>
        <v-col md="6" lg="8" class="pl-4 pr-4">
          <v-card width="100%" height="89vh" flat>
            <div id="case-content" style="max-height: 80vh !important;
                                          min-height: 80vh !important;
                                          overflow-y: auto;">
              <form ref="case-list" class="ml-3 mr-3 mt-3">
                <v-row justify="space-between" v-for="(_case, i) in caseList" :key="i" align="center"
                       align-content="center">
                  <v-col>
                    <v-text-field height="30" outlined label="Номер" v-model="_case.number">
                    </v-text-field>
                  </v-col>
                  <v-col md="6">
                    <v-text-field height="30" outlined label="ФИО" v-model="_case.fullName"></v-text-field>
                  </v-col>
                  <v-col md="3">
                    <v-text-field height="30" outlined label="Номер дела" v-model="_case.caseNumber"></v-text-field>
                  </v-col>
                  <v-col align-self="center">
                    <v-btn icon @click="removeCase(i)">
                      <v-icon>mdi-minus</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <a @click="addCase">Добавить</a>
              </form>
            </div>
            <v-card-actions class="mt-5">
              <v-btn color="primary">Далее</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

  </v-container>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  name: "Wizard",
  data: () => ({
    steps: [
      {number: 1, text: 'Данные и номера проектов'},
      {number: 2, text: 'Документы для генерации'},
      {number: 3, text: 'Генерация документов'},
      {number: 4, text: 'Отправка'},
    ],
    step: 1,
    caseList: [
      {number: '', fullName: '', caseNumber: ''}
    ],
  }),
  computed: {
    ...mapGetters({
      projectList: 'projectListData'
    })
  },
  methods: {
    addCase() {
      this.caseList.unshift({number: '', fullName: '', caseNumber: ''})
    },
    removeCase(index) {
      this.caseList.splice(index, 1)
    }
  },
  mounted() {
    this.$store.dispatch('getProjectList').then(() => {
      // this.projectList.sort((prev, next ) => next.pk -  prev.pk)
      let lastCode = Math.max.apply(Math, this.projectList.map(function(o) { return o.y; }))
      console.log(lastCode)
    })
  }
}
</script>

<style src="../../assets/css/project-setup.scss" lang="scss" scoped>
$text-field-filled-full-width-outlined-dense-slot-min-height: 40px;
#wizard-container {
  height: 100%;
  width: 100%;

  .col {
    .v-card {
      #case-content {
        max-height: 80vh !important;
        min-height: 80vh !important;
        overflow-y: scroll;
      }
    }
  }
}

</style>