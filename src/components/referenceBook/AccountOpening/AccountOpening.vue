<template>
  <v-container fluid>
    <v-toolbar flat>
      <v-toolbar-title>Заявки на открытие счета (ПАО Совкомбанк)</v-toolbar-title>
    </v-toolbar>
    <v-row>
      <v-col cols="6" class="pa-4">
        <!-- Колонка 1 -->
        <v-card class="card">
          <v-card-title>Подготовленные заявления</v-card-title>
          <v-card-text class="card__content">
            <v-list
                flat
            >
              <v-list-item-group
                  v-model="selectedApplication"
                  multiple
                  active-class=""
              >
                <v-list-item v-for="(item, i) in accountOpeningList" :key="i">
                  <template v-slot:default="{ active }">
                    <v-list-item-content>
                      <v-list-item-title>{{ item.project.case_number }} | {{ item.project.name }}</v-list-item-title>
                      <v-list-item-subtitle>Файл: {{ item.document }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-checkbox :input-value="active" v-model="applications" :value="item.id"></v-checkbox>
                    </v-list-item-action>

                  </template>
                </v-list-item>
              </v-list-item-group>
            </v-list>

          </v-card-text>
          <v-card-actions>
            <v-btn @click="generateApplication" :disabled="selectedApplication.length === 0">Сформировать</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="6" class="pa-4">
        <!-- Колонка 2 -->
        <v-card class="card">
          <v-card-title>Добавить</v-card-title>
          <v-card-text class="card__content">
            <v-form lazy-validation>
              <v-row justify="start">
                <v-col cols="6">
                  <v-autocomplete dense outlined label="Проект" v-model="form.project" :items="projectList"
                                  item-text="name" item-value="id"></v-autocomplete>
                </v-col>
                <v-col cols="auto">
                  <v-btn :disabled="!form.project" color="success" class="mr-2"
                         @click="addDocument">
                    {{ selectedPassport ? 'Выбрать другой' : 'Добавить паспорт' }}
                  </v-btn>
                </v-col>
              </v-row>
              <v-row>
                <div v-if="selectedPassport">
                  <span>Выбран:</span> {{ selectedPassport.correspondence_type }} | {{ selectedPassport.fileName }}
                </div>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="saveApplication">Добавить</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="overlay" width="25vw" scrollable persistent>
      <v-card width="25vw" height="25vh">
        <v-card-text v-if="loading" style="display:flex;">
          <v-row justify="center" align="center">
            Формирование и отправка данных. Ожидайте...
            <v-progress-circular
                indeterminate
                size="64"
            ></v-progress-circular>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <ChooseDocument @chooseDocs="appendDocs" solo="true"></ChooseDocument>
    <SystemMessage :state.sync="state"/>
  </v-container>
</template>


<script>
import {mapGetters} from 'vuex'
import ChooseDocument from "@/components/CRM/PaperFlow/modal/ChooseDocument.vue";
import {saveAs} from 'file-saver'
import SystemMessage from "@/components/UI/SystemMessage.vue";

export default {
  name: "AccountOpening",
  components: {ChooseDocument, SystemMessage},
  data: () => ({
    overlay: false,
    loading: false,
    state: '',
    form: {
      project: null,
      // bank: null,
      passport: null
    },
    applications: [],
    selectedApplication: [],
    selectedPassport: null
  }),
  methods: {
    update() {
      this.$store.dispatch('getAccountOpeningApplication')
      this.$store.dispatch('getProjectList')
    },
    generateApplication() {
      this.overlay = true
      this.loading = true
      let formData = new FormData()
      this.applications.forEach(item => formData.append('application', item))
      this.$store.dispatch('generateAccountOpeningApplication', formData).then(res => {
        saveAs(res.data, 'Заявка_в_ПАО_Совкомбанк.zip')
        this.update()
        this.overlay = false
        this.loading = false
      }).catch(err=>{
        this.overlay = false
        this.loading = false
        this.state = 'error'
        this.$emit('showSystemMessage', {response: err, state: this.state})
      })
    },
    saveApplication() {
      let formData = new FormData()
      formData.append('project', this.form.project)
      formData.append('document', this.form.passport)
      this.$store.dispatch('saveAccountOpeningApplication', formData).then(() => {
        this.update()
        this.form.passport = null
        this.form.project = null
        this.selectedPassport = null
      })
    },
    addDocument() {
      this.$emit('chooseDocs', {project: this.form.project, existDoc: []})
    },
    appendDocs(doc) {
      this.selectedPassport = doc.chooseDocs[0]
      this.form.passport = doc.chooseDocs[0].id
    }
  },
  computed: {
    ...mapGetters({
      projectList: 'projectListData',
      accountOpeningList: 'accountOpeningApplicationData'
      // bankList: 'bankListData'
    })
  },
  created() {
    this.update()
  },

}
</script>


<style scoped>

>>> .v-toolbar__content {
  justify-content: center;
}

.card__content {
  overflow-y: scroll;
  max-height: 60vh;
}

.card {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}
</style>