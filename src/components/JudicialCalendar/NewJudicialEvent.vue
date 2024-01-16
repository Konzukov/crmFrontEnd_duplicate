<template>
  <v-container>
    <v-dialog v-model="show" width="650" hide-overlay>
      <v-card height="90vh">
        <v-card-title class="justify-center">Добавление нового заседания</v-card-title>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="auto">
                <v-text-field outlined dense label="Начало заседания" v-model="formField.date_begin"
                              type="datetime-local"></v-text-field>
              </v-col>
              <v-col cols="auto">
                <v-text-field outlined dense label="Окончание заседания" v-model="formField.date_end"
                              type="datetime-local"></v-text-field>
              </v-col>

            </v-row>

            <v-row>
              <v-col cols="auto">
                <v-autocomplete
                    dense
                    outlined label="Проект"
                    :items="projectList"
                    @change="setJudge"
                    v-model="formField.project"
                    item-text="name" item-value="id" return-object
                >
                </v-autocomplete>
              </v-col>
              <v-col cols="auto">
                <v-text-field dense outlined disabled label="Номер дела"
                              :value="formField.project.case_number"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="auto">
                <v-autocomplete outlined label="Судья" prepend-inner-icon="mdi-plus"
                                :items="judgesList"
                                v-model="formField.judge"
                                item-value="id"
                                item-text="full_name"
                                @click:prepend-inner="addJudge"
                                dense>

                </v-autocomplete>
              </v-col>
              <v-col cols="auto">
                <v-autocomplete dense outlined label="Категория заседания" :items="judicialCategories"
                                item-text="name"
                                item-value="id"
                                v-model="formField.category"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field dense label="Место проведения" outlined v-model="formField.location"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-textarea outlined dense label="Требование суда" v-model="formField.court_requirement"></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field type="url" dense outlined label="Ссылка на определение"
                              v-model="formField.definition_url">
                </v-text-field>
              </v-col>
            </v-row>
            <v-row>

              <v-col cols="auto">
                <v-autocomplete dense label="Ответственный"
                                :items="userList"
                                item-value="id"
                                item-text="fullName"
                                v-model="formField.responsible"
                                outlined>
                </v-autocomplete>
              </v-col>
              <v-col cols="auto">
                <v-text-field outlined dense label="Срок исполнения" v-model="formField.date_execution"
                              type="datetime-local"></v-text-field>
              </v-col>
            </v-row>
          </v-form>
          <v-overlay :value="loading">
            <v-progress-circular
                indeterminate
                size="64"
            ></v-progress-circular>
          </v-overlay>
        </v-card-text>
        <v-card-actions class="justify-space-between pb-6">
          <v-btn color="error" @click="close()">Закрыть</v-btn>
          <v-btn color="success" @click="save()">{{ actionType === 'create' ? 'Добавить' : 'Сохранить' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <SaveProcessed></SaveProcessed>
    <NewJudge></NewJudge>
  </v-container>
</template>

<script>
import {mapGetters} from 'vuex'
import NewJudge from "@/components/referenceBook/Judges/NewJudge";
import SaveProcessed from "@/components/UI/SaveProcessed";


export default {
  name: "NewJudicialEvent",
  data: () => ({
    show: false,
    loading: false,
    actionType: 'create',
    windowHeight: window.innerHeight - 350,
    formField: {
      id: '',
      date_begin: '',
      date_end: '',
      project: '',
      judge: '',
      court_requirement: '',
      category: '',
      location: '',
      responsible: '',
      definition_url: '',
      date_execution: ''
    }
  }),
  computed: {
    ...mapGetters({
      projectList: 'projectListData',
      judgesList: 'judgeListData',
      judicialCategories: 'judicialCategoriesData',
      userList: 'allSystemUsersData'
    }),
    // judgesList: {
    //   get(){
    //     let judgeLIst = this.$store.getters.judgeListData
    //     if (this.formField.project){
    //       let courtId =
    //       return judgeLIst
    //     }else {
    //       return  judgeLIst
    //     }
    //   }
    // }
  },
  methods: {
    addJudge() {
      this.$emit('newJudge')
    },
    setJudge(item){
      if (item.judge){
        this.formField.judge = item.judge.id
      }
    },
    save() {
      let formData = new FormData();
      for (let [key, val] of Object.entries(this.formField)) {
        if (key === 'project') formData.set(key, val['id'])
        else formData.set(key, val)
      }
      new Promise((resolve, reject) => {
        this.$emit('saveInProcess')
        resolve()
      }).then(() => {
        if (this.actionType === 'create') {
          this.$store.dispatch('createJudicialEvent', formData).then(() => {
            this.$emit('saveDone')
            this.close()
          }).catch(() => {
            this.$emit('saveError')
          })
        } else {
          this.$store.dispatch('editJudicialEvent', {formData, id: this.formField.id}).then(() => {
            this.$emit('saveDone', this.formField.id)
            this.close()
          }).catch(() => {
            this.$emit('saveError')
          })
        }

      })

    },
    close() {
      Object.assign(this.$data, this.$options.data())
      this.show = false

    },
    async loadingData() {
      await new Promise(resolve => {
        this.loading = true
        this.$store.dispatch('getJudgeList')
        this.$store.dispatch('getProjectList')
        this.$store.dispatch('getJudicialCategories')
        this.$store.dispatch('allSystemUser')
        resolve()
      }).then(() => {
        this.loading = false
      })
    }
  },
  mounted() {
    this.loadingData()
    this.$parent.$on('newJudicialSession', () => {
      this.show = true
    })
    this.$parent.$on('editJudicialEvent', (judicialEvent) => {
      for (let [key, val] of Object.entries(judicialEvent)) {
        if (val !== 0) {
          if (key === 'category_id') this.formField['category'] = val
          else if (key === 'responsible_id') this.formField['responsible'] = val
          else if (key === 'judge') this.formField[key] = val['id']
          else {
            if (val) this.formField[key] = val
          }
        }
      }
      this.actionType = 'edit'
      this.show = true
    })
  },
  components: {
    NewJudge,
    SaveProcessed
  }
}
</script>

<style scoped>
>>> .v-text-field__details {
  display: none;
}
</style>