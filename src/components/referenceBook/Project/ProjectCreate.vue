<template>
  <v-container fluid>
    <v-card flat height="100%" style="position: absolute">
      <v-card-title class="justify-center">
        <template v-if="rectifiedProject">Редактирование проекта {{ rectifiedProject.name }}</template>
        <template v-else>Новый проект</template>
      </v-card-title>
      <v-card-text style="height: 80%; overflow-y: scroll">
        <v-form lazy-validation v-model="valid" ref="projectCreate">
          <v-row justify="start" class="mt-2">
            <v-col cols="4" class="mr-3">
              <v-autocomplete outlined dense label="Участник" v-model="project.participant"
                              :items="participatorList"
                              item-value="id"
                              item-text="participator.fullName"
              ></v-autocomplete>
            </v-col>
            <v-col cols="6">
              <v-autocomplete class="required" dense outlined label="Сторона" @change="setContractor"
                              v-model="contractor"
                              :items="allRefList" item-text="fullName"
                              :rules="required"
                              return-object
                              append-outer-icon="mdi-plus"
                              @click:append-outer="addContractor"
                              item-value="uuid"></v-autocomplete>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="4" class="mr-3">
              <v-text-field class="required" outlined dense label="Название проекта"
                            :error="!!errors['name']"
                            :rules="required"
                            :error-messages="errors['name']"
                            v-model="project.name"></v-text-field>
            </v-col>
            <v-col cols="3" class="mr-3">
              <v-text-field class="required" outlined dense label="Код"
                            :rules="required"
                            :error="!!errors['code']"
                            :error-messages="errors['code']"
                            v-model="project.code"></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-text-field outlined dense label="Номер дела"
                            :error="!!errors['case_number']"
                            :error-messages="errors['case_number']"
                            @change="setCurt"
                            v-model="project.case_number"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="4" class="mr-3">
              <v-autocomplete dense outlined label="Вид процедуры" :items="ProcedureType(contractor.type)" item-value="value"
                        item-text="text"
                        v-model="project.procedure">

              </v-autocomplete>
            </v-col>
            <v-col cols="auto" class="mr-3">
              <v-autocomplete class="required" :rules="required" dense outlined label="Ответственный"
                              :items="systemUserList" item-value="id"
                              item-text="fullName" v-model="project.responsible"></v-autocomplete>
            </v-col>
            <v-col cols="auto" class="mr-3">
              <v-autocomplete dense outlined label="Брокер"
                              @change="setAgent"
                              v-model="agent"
                              :items="allRefList" item-text="fullName"
                              return-object
              ></v-autocomplete>
            </v-col>
          </v-row>
          <v-expansion-panels focusable multiple flat>
            <v-expansion-panel>
              <v-expansion-panel-header class="pr-5 pl-5">Данные суда</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row justify="start" class="mt-3">
                  <v-col cols="5" class="mr-7">
                    <v-autocomplete outlined dense label="Суд" clearable :items="courtList" item-text="name"
                                    item-value="pk" :error="!!errors['court']"
                                    :error-messages="errors['court']"
                                    @change="clearJudge"
                                    v-model="project.court"></v-autocomplete>
                  </v-col>
                  <v-col cols="5">
                    <v-autocomplete outlined dense clearable label="Судья"
                                    :disabled="!project.court"
                                    :error="!!errors['judge']"
                                    :error-messages="errors['judge']"
                                    :items="judgesList" item-text="full_name" item-value="id"
                                    v-model="project.judge"></v-autocomplete>
                  </v-col>
                </v-row>

              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header class="pr-5 pl-5">Дополнительные данные</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row justify="start" class="mt-3">
                  <v-col cols="auto" class="mr-2">
                    <v-text-field outlined dense label="Дата отчета"
                                  type="datetime-local"
                                  v-model="project.report_date"></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="3" class="mr-2">
                    <v-text-field outlined dense label="Ъ - № публикации"
                                  v-model="project.publication_number"></v-text-field>
                  </v-col>
                  <v-col cols="5">
                    <v-text-field outlined dense label="Дата публикации коммерсант"
                                  type="date"
                                  v-model="project.publication_date"></v-text-field>
                  </v-col>
                  <v-row>
                    <v-col cols="3" class="mr-2">
                      <v-text-field outlined dense label="Страница Ъ - публикации"
                                    v-model="project.publication_number_page"></v-text-field>
                    </v-col>
                    <v-col cols="5" class="mr-2">
                      <v-text-field outlined dense label="Номер выпуска - Ъ"
                                    v-model="project.publication_issue_number"></v-text-field>
                    </v-col>
                  </v-row>
                </v-row>
                <v-row>
                  <v-col cols="6" class="mr-2">
                    <v-text-field outlined dense label="ЕФСБ - № публикации"
                                  v-model="project.publication_number_efrsb"></v-text-field>
                  </v-col>
                  <v-col cols="5">
                    <v-text-field outlined dense label="Дата публикации ЕФРСБ"
                                  type="date"
                                  v-model="project.publication_date_efrsb"></v-text-field>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header class="pr-5 pl-5">Судебные акт</v-expansion-panel-header>
              <v-expansion-panel-content>
                <template v-for="item in judicialActCount" class="mb-3">
                  <JudicialAct :act="item.data" :project="rectifiedProject" :ref="item.ref"
                               :key="item.index"></JudicialAct>
                </template>
                <v-row justify="center" class="ma-2">
                  <v-btn color="success" class="mr-2" @click="addJudicialAct">Добавить из базы</v-btn>
                  <v-btn color="primary" class="ml-2" @click="checkDocumentArbitr">На сайте суда</v-btn>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel v-if="currentUser[0]['user']['is_superuser']">
              <v-expansion-panel-header class="pr-5 pl-5">Комментарий</v-expansion-panel-header>
              <v-expansion-panel-content>

                <v-row justify="start" class="mt-2">
                  <VueEditor v-model="project.comment" class="comment"></VueEditor>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-form>
      </v-card-text>
      <v-card-actions v-if="showActionButton">
        <v-row justify="center">
          <v-col cols="4">
            <v-btn color="error" @click="close">
              Отмена
            </v-btn>
          </v-col>
          <v-col cols="4">
            <v-btn color="success" @click="save">
              Сохранить
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
    <ContractorCreateModal @contractorAdded="setContractor"></ContractorCreateModal>
    <DocInArbitr @saveDoc="saveDoc" ref="docInArbitr" @clearDocumentArbitr="clearDocumentArbitr"
                 :available-doc-list.sync="availableDoc"></DocInArbitr>
    <SystemMessage :state="state"/>
  </v-container>
</template>

<script>
import JudicialAct from "@/components/CRM/PaperFlow/JudicialAct";
import {mapGetters} from "vuex";
import ContractorCreateModal from "@/components/referenceBook/ContractorCreateModal";
import customConst from "@/const/customConst";
import DocInArbitr from "@/components/UI/DocInArbitr";
import {VueEditor} from "vue2-editor";
import {ProcedureType} from "@/const/dataTypes";
import SystemMessage from "@/components/UI/SystemMessage.vue";

export default {
  props: {
    rectifiedProject: Object,
    showActionButton: {
      type: Boolean,
      default: true
    },
    callSave: Boolean,
    collapsed: Boolean
  },

  name: "ProjectCreate",
  data: () => ({
    valid: false,
    contractor: '',
    agent: '',
    state: '',
    judicialActCount: [],
    judicialAct: [],
    errors: {},
    availableDoc: [],
    separateDispute: {
      number: '',
      curt: '',
      judge: '',
    },
    required: [
      v => !!v || 'Данное поле обязательно',
    ],
    project: {
      pk: '',
      name: '',
      code: '',
      procedure: '',
      case_number: '',
      legal_agent: '',
      physical_agent: '',
      publication_date: '',
      publication_number: '',
      publication_number_page: '',
      publication_issue_number: '',
      publication_date_efrsb: '',
      publication_number_efrsb: '',
      report_date: '',
      participant: '',
      legal_contractor: '',
      physical_contractor: '',
      description: '',
      objective: '',
      responsible: '',
      court: '',
      judge: '',
      comment: '',
    },
    cookie: null
  }),
  computed: {
    ...mapGetters({
      participatorList: 'participatorList',
      allRefList: 'allRefData',
      courtList: 'courtListData',
      systemUserList: 'allSystemUsersData',
      currentUser: 'currentUserData'
    }),
    judgesList() {
      const judgeListData = this.$store.getters.judgeListData
      if (this.project.court) {
        return judgeListData.filter(obj => {
          if (obj.court) {
            return obj.court.id === this.project.court
          }
        })
      }
      return judgeListData
    }
  },
  methods: {
    ProcedureType(val) {
      console.log(val)
      if (val === 'PhysicalPerson') return ProcedureType.Physical
      else if (val === 'LegalEntity') return ProcedureType.Legal
      else return ProcedureType.Physical
    },
    async loadData() {
      await this.$store.dispatch('getParticipator')
      await this.$store.dispatch('getLegalEntity')
      await this.$store.dispatch('getPhysicalPerson')
      await this.$store.dispatch('getJudgeList')
      await this.$store.dispatch('getCourtList')
      await this.$store.dispatch('allSystemUser')
    },
    close() {
      Object.assign(this.$data, this.$options.data())
      this.$emit('close')
    },
    save() {
      console.log('call')
      if (this.$refs.projectCreate.validate()) {
        let formData = new FormData()
        Object.keys(this.project).forEach(key => {
          if (key === 'physical_contractor') {
            console.log(this.project[key])
          } else if (key === 'legal_contractor') {
            console.log(this.project[key])
          }
          formData.append(key, this.project[key])
        })
        if (!this.project.pk) {
          this.$store.dispatch('createProject', formData).then(response => {
            this.project.pk = response['pk']
            this.$emit('showSystemMessage', {response: response, state: 'success', send: false  })
            this.$emit('close', response)
          }).catch(err => {
            this.errors = err.response.data.errors
          })
        } else {
          this.$store.dispatch('editProject', {formData, pk: this.project.pk}).then(res => {
            this.$emit('showSystemMessage', {response: res, state: 'success', send: false  })
          }).catch(err => {
            this.errors = err.response.data.errors
          })
        }
        if (this.judicialActCount.length > 0) {
          console.log('judicialActCount')
          console.log(this.judicialActCount)

          const refs = this.judicialActCount.map(obj => {
            return obj.ref
          })
          console.log(refs)
          for (let ref of refs) {
            let judicialActComponent = this.$refs[ref]
            if (judicialActComponent) {
              judicialActComponent[0].save()
            }
          }
        }
      }
    },
    updateData() {
      this.$store.dispatch('getProjectDetail', this.project.pk).then(res => {
        console.log(res['pk'])
        this.$store.dispatch('getProjectAct', res['pk']).then(res => {
          let act = res.data.data.data
          if (act.length > 0) {
            act.forEach((obj, index) => {
              this.judicialActCount.push({index, ref: `judicialActComponent${index}`, data: obj})
            })
          }
        }).catch(err => {
          console.log(err)
        })
        Object.keys(this.project).forEach(key => {
          if (typeof res[key] === 'object') {
            if (res[key]) {
              this.project[key] = res[key]['id']
            } else {
              this.project[key] = ''
            }

          } else {
            this.project[key] = res[key]
          }
        })
        if (this.project.legal_agent){
          this.agent = this.$store.getters.legalEntityData.filter(obj => {
            return obj.pk === this.project.legal_agent
          })[0]
        } else if (this.project.physical_agent) {
          this.agent = this.$store.getters.physicalPersonData.filter(obj => {
            return obj.pk === this.project.physical_agent
          })[0]
        }
        if (this.project.legal_contractor) {
          this.contractor = this.$store.getters.legalEntityData.filter(obj => {
            return obj.pk === this.project.legal_contractor
          })[0]
        } else if (this.project.physical_contractor) {
          this.contractor = this.$store.getters.physicalPersonData.filter(obj => {
            return obj.pk === this.project.physical_contractor
          })[0]
        }
      })
    },
    setCurt(item) {
      if (item) {
        let curtCode = item.split("-")[0]
        let curt = this.courtList.filter(item => item.code === curtCode)[0]
        this.project.court = curt["pk"]
      }
    },
    setAgent(item){
      switch (item.type) {
        case "LegalEntity":
          this.project.legal_agent = item['pk']
          break
        case "PhysicalPerson":
          this.project.physical_agent = item['pk']
          break
      }
    },
    setContractor(item) {
      this.contractor = item
      switch (item.type) {
        case "LegalEntity":
          this.project.legal_contractor = item['pk']
          this.project.physical_contractor = ''
          if (!this.project.name) {
            this.project.name = item.fullName
          }
          break
        case "PhysicalPerson":
          this.project.physical_contractor = item['pk']
          this.project.legal_contractor = ''
          if (!this.project.name) {
            let projName = `${item['last_name']} ${item['first_name']} `
            if (item['middle_name']) {
              projName += item['middle_name']
            }
            this.project.name = projName
          }
          break
      }
    },
    forceSave(forced) {
      this.isForce = forced
      this.save()
    },
    addContractor() {
      this.$emit('addContractor')
    },
    addJudicialAct() {
      const judicialActComponentLength = this.judicialActCount.length
      this.judicialActCount.push({
        index: judicialActComponentLength + 1,
        ref: `judicialActComponent${judicialActComponentLength}`,
        data: {}
      })
    },
    checkDocumentArbitr() {
      this.$refs.docInArbitr.openModal()
      this.$http({
        method: "GET",
        url: customConst.REFERENCE_BOOK_API + 'get-case-from-arbitr',
        params: {'case-number': this.project.case_number}
      }).then(res => {
        this.availableDoc = res.data.data.filter(obj => {
          if (obj.file) {
            return obj
          }
        })
        this.cookie = res.data.cookie
      }).catch(err => {
        this.$refs.docInArbitr.close()
        this.state = 'error'
        this.$emit('showSystemMessage', {response: err, state: this.state})
      })
    },
    clearDocumentArbitr() {
      this.availableDoc = []
    },
    clearJudge(item) {
      console.log(item)
    },
    saveDoc(doc) {
      let formData = new FormData()
      formData.append('url', doc.url)
      formData.append('receiving_date', doc.date)
      formData.append('cookie', this.cookie)
      formData.append('project', this.project.pk)
      this.$http({
        method: "POST",
        url: customConst.PAPERFLOW_API + 'create-document-act',
        data: formData
      }).then(res => {
        this.$refs.docInArbitr.close()
        this.updateData()
      }).catch(err => {
        console.log(err)
      })
    }
  },
  watch: {
    callSave(val) {
      if (val) {
        this.save()
      }
    },
    contractor(val) {
      this.$emit('changeContractor', val)
    },
  },
  async created() {
    await this.loadData()
    if (this.rectifiedProject) {
      this.project.pk = this.rectifiedProject.pk
      this.updateData()
    } else {
      this.project.participant = this.participatorList[0]['pk']
    }
  },
  destroyed() {

  },
  components: {SystemMessage, ContractorCreateModal, JudicialAct, DocInArbitr, VueEditor}
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

.comment {
  height: 300px;
}

>>> .v-text-field__details {
  margin-bottom: 0px !important;
}

/*.v-card__text {*/
/*  height: 100vh;*/
/*}*/

>>> .required fieldset {
  border: 0.15em solid;
}

>>> .v-input--is-focused fieldset {
  color: rgba(0, 0, 0, 0.87);
}

>>> .required .error--text fieldset {
  color: rgb(167, 25, 25);
}

>>> .required.v-input--is-focused fieldset {
  border: 0.19em solid;
}

>>> .required.v-input--is-focused.error--text fieldset {
  border: 0.19em solid;
  color: rgb(167, 25, 25);
}

>>> .v-messages.error--text {
  max-width: fit-content;
  max-height: 40px;
}

</style>