<template>
  <v-container fluid>
    <v-card flat height="90%" style="position: absolute">
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
                              :items="allRefList"
                              item-text="fullName"
                              :rules="required"
                              return-object
                              append-outer-icon="mdi-plus"
                              @click:append-outer="addContractor"
                              item-value="uuid"></v-autocomplete>
            </v-col>
          </v-row>
          <v-row justify="start" v-if="checkStatus(contractor)">
            <v-checkbox v-model="project.is_individual_entrepreneur"
                        label="Процедура в отношении индивидуального предпринимателя"
            >
            </v-checkbox>
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
              <v-autocomplete dense outlined label="Вид процедуры" :items="ProcedureType(contractor.type)"
                              item-value="value"
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
                                    v-model="project.legal_court"></v-autocomplete>
                  </v-col>
                  <v-col cols="5">
                    <v-autocomplete outlined dense clearable label="Судья"
                                    :disabled="!project.legal_court"
                                    :error="!!errors['judge']"
                                    :error-messages="errors['judge']"
                                    append-outer-icon="mdi-plus"
                                    @click:append-outer="addJudge(project.legal_court)"
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
                  <v-btn color="success" class="mr-2" @click="runSelenium">На сайте суда (Новый)</v-btn>
                  <v-btn color="primary" class="ml-2" @click="checkDocumentArbitr">На сайте суда</v-btn>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel v-if="currentUser && currentUser[0]['user']['is_superuser']">
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
    <JudgeCreateModal @judgeCreate="setJudge"></JudgeCreateModal>
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
import JudgeCreateModal from "@/components/referenceBook/Project/Judge/JudgeCreateModal.vue";
import moment from "moment";

export default {
  props: {
    rectifiedProject: Object,
    showActionButton: {
      type: Boolean,
      default: true
    },
    callSave: Boolean,
    collapsed: Boolean,
    yaml: {
      type: Object
    }
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
      is_individual_entrepreneur: false,
      report_date: '',
      participant: '',
      legal_contractor: '',
      physical_contractor: '',
      description: '',
      objective: '',
      responsible: '',
      legal_court: '',
      judge: '',
      comment: '',
      court_document: []
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
      if (this.project.legal_court) {
        return judgeListData.filter(obj => {
          if (obj.legal) {
            return obj.legal.id === this.project.legal_court
          }
        })
      }
      return judgeListData
    }
  },
  methods: {
    async runSelenium() {
      this.$refs.docInArbitr.openModal()
      const baseUrl = await this.determineServerUrl();
      console.log(baseUrl)
      const url = `${baseUrl}/parse?case_number=${this.project.case_number}`;
      this.$http({
        method: "GET",
        url: url,
        // url: `http://127.0.0.1:8000/parse?case_number=${this.project.case_number}`,
      }).then(res => {
        this.availableDoc = res.data.data.filter(obj => {
          if (obj.file) {
            return obj
          }
        })
        this.cookie = res.data.cookie
      })
    },
    async determineServerUrl() {
      // const devServer = "http://127.0.0.1:8000";
      const localServer = 'http://192.168.1.112:8000';
      const remoteServer = 'http://80.254.125.196:9563';

      try {
        // Проверка доступности локального сервера
        const isAvailable = await this.checkServerAvailability(localServer);
        return isAvailable ? localServer : remoteServer;
      } catch (error) {
        return remoteServer; // Возвращаем удаленный сервер при ошибке
      }
    },
    async checkServerAvailability(url) {
      const controller = new AbortController();
      const timeout = 500; // Таймаут 500 мс

      const timeoutId = setTimeout(
          () => controller.abort(),
          timeout
      );

      try {
        await fetch(`${url}/ping`, {
          method: 'GET',
          mode: 'no-cors',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return true;
      } catch (error) {
        clearTimeout(timeoutId);
        return false;
      }
    },
    checkStatus(contractor) {
      if (contractor.type === "PhysicalPerson") {
        let existingIndex = contractor.special_statuses.findIndex(item =>
            item.status_type === 'individual_entrepreneur')
        return existingIndex !== -1;
      }
      return false
    },
    async setJudge(val) {
      await this.$store.dispatch('getJudgeList')
      let filteredJudge = this.judgesList.find(obj => {
        return obj.id === val.id
      })
      let filteredCurt = this.courtList.find(obj => {
        console.log(val)
        return obj.id === val.court
      })
      if (filteredJudge) {
        this.project.judge = filteredJudge.id
      }
      if (filteredCurt) {
        this.project.court = filteredCurt.id
      }

    },
    ProcedureType(val) {
      if (val === 'PhysicalPerson') return ProcedureType.Physical
      else if (val === 'LegalEntity') return ProcedureType.Legal
      else return ProcedureType.Physical
    },
    async loadData() {
      // Используем кэширование - загружаем только если данные отсутствуют
      const promises = [];

      if (!this.$store.getters.participatorList?.length) {
        promises.push(this.$store.dispatch('getParticipator'));
      }

      if (!this.$store.getters.legalEntityData?.length) {
        promises.push(this.$store.dispatch('getLegalEntity'));
      }

      if (!this.$store.getters.physicalPersonListDataV2?.length) {
        promises.push(this.$store.dispatch('fetchPhysicalPersons'));
      }

      if (!this.$store.getters.judgeListData?.length) {
        promises.push(this.$store.dispatch('getJudgeList'));
      }

      // Загружаем только необходимые справочники
      if (promises.length > 0) {
        await Promise.all(promises);
      }

      // Остальные справочники загружаем по требованию
      // или отдельным методом при необходимости
    },
    async loadAdditionalData() {
      // Загружаем остальные справочники только при необходимости
      const additionalPromises = [];


      if (!this.$store.getters.allSystemUsersData?.length) {
        additionalPromises.push(this.$store.dispatch('allSystemUser'));
      }

      if (additionalPromises.length > 0) {
        // Загружаем в фоне, не блокируя основной интерфейс
        await Promise.all(additionalPromises);
      }
    },
    processProjectData(projectData, actResponse) {
      // Обрабатываем данные проекта
      Object.keys(this.project).forEach(key => {
        if (typeof projectData[key] === 'object') {
          if (projectData[key]) {
            this.project[key] = projectData[key]['id'];
          } else {
            this.project[key] = '';
          }
        } else {
          if (key === 'court_document') {
            try {
              this.project.court_document = JSON.parse(projectData[key]);
            } catch (err) {
              console.log(err);
            }
          } else {
            this.project[key] = projectData[key];
          }
        }
      });

      // Обрабатываем судебные акты
      if (actResponse?.data?.data?.data?.length > 0) {
        actResponse.data.data.data.forEach((obj, index) => {
          this.judicialActCount.push({
            index,
            ref: `judicialActComponent${index}`,
            data: obj
          });
        });
      }

      // Устанавливаем контрагента и агента
      this.setContractorAndAgent(projectData);
    },
    setContractorAndAgent(projectData) {
      // Устанавливаем агента
      if (projectData.legal_agent) {
        this.agent = this.allRefList?.find(
            obj => obj.uuid === projectData.legal_agent.uuid
        );
      } else if (projectData.physical_agent) {
        this.agent = this.allRefList?.find(
            obj => obj.uuid === projectData.physical_agent.uuid
        );
      }

      // Устанавливаем контрагента
      if (projectData.legal_contractor) {
        this.contractor = projectData.legal_contractor;
      } else if (projectData.physical_contractor) {
        this.contractor = projectData.physical_contractor;
      }
    },
    close() {
      Object.assign(this.$data, this.$options.data())
      this.$emit('close')
    },
    save() {
      console.log(this.project)
      return new Promise((resolve, reject) => {
        if (this.$refs.projectCreate.validate()) {
          let formData = new FormData()
          Object.keys(this.project).forEach(key => {
            if (key === 'court_document') {
              formData.append(key, JSON.stringify(this.project[key]))
            } else {
              console.log(key, this.project[key])
              formData.append(key, this.project[key])
            }

          })
          const saveAction = this.project.pk
              ? this.$store.dispatch('editProject', {formData, pk: this.project.pk})
              : this.$store.dispatch('createProject', formData);

          saveAction
              .then(response => {
                this.saveJudicialActs().then(() => resolve(response));
              })
              .catch(error => {
                this.errors = error.response?.data?.errors || {};
                reject(error);
              });
        } else {
          reject(new Error('Форма не валидна'));
        }
      })
    },
    async saveJudicialActs() {
      if (this.judicialActCount.length === 0) return Promise.resolve();
      const promises = this.judicialActCount.map(item => {
        const component = this.$refs[item.ref];
        return component ? component[0].save() : Promise.resolve();
      });
      return Promise.all(promises);
    },
    async updateData() {
      if (this.project.pk) {
        try {
          // Загружаем проект и судебные акты параллельно
          const [projectData, actData] = await Promise.all([
            this.$store.dispatch('getProjectDetail', this.project.pk),
            this.$store.dispatch('getProjectAct', this.project.pk)
          ]);

          this.processProjectData(projectData, actData);
        } catch (error) {
          console.error('Ошибка загрузки данных:', error);
        }
      }
    },
    setCurt(item) {
      if (item) {
        console.log(item)
        let curtCode = item.split("-")[0]
        let curt = this.courtList.find(item => {
          console.log(item?.additional_info?.court_code === curtCode)
          return item?.additional_info?.court_code === curtCode
        })
        this.project.legal_court = curt["pk"]
      }
    },
    setAgent(item) {
      console.log(item)
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
      console.log(item)
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
    addJudge(curt) {
      const curtData = this.courtList.find(obj => obj.pk === curt)
      this.$emit('createJudge', {
        court: curtData
      })
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
      console.log(doc)
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
    yaml(val) {
      if (val) {
        const project = val['court_case'];

        // Основные поля проекта
        this.project.case_number = project['case_number'] || '';
        if (project['case_number']) {
          this.setCurt(project['case_number'])
        }
        if (project['bankruptcy_procedure']) {
          // Определяем тип процедуры в зависимости от типа контрагента
          const procedureType = this.contractor.type === 'PhysicalPerson'
              ? ProcedureType.Physical
              : ProcedureType.Legal;

          // Приводим к нижнему регистру для сравнения
          const yamlProcedure = project['bankruptcy_procedure'].toLowerCase().replace('гражданина', "должника");
          // Ищем совпадение в тексте процедур
          const matchedProcedure = procedureType.find(pt => {
                console.log(pt.text.toLowerCase())
                return pt.text.toLowerCase().includes(yamlProcedure)
              }
          );
          console.log(matchedProcedure)
          if (matchedProcedure) {
            this.project.procedure = matchedProcedure.value;

            // Обработка дат
            if (project['next_hearing_date']) {
              this.project.report_date = moment(project['next_hearing_date'], 'DD.MM.YYYY').format('YYYY-MM-DDTHH:mm');
            }
          }
        }

        // Поиск судьи
        if (project['judge_name']) {
          const judgeName = project['judge_name'].replace(/\s/g, '');
          const judge = this.judgesList.find(
              j => j.full_name.replace(/\s/g, '') === judgeName
          );

          if (judge) {
            this.project.judge = judge.id;
          } else {
            this.$emit('createJudge', {
              court: project['court_name'],
              judge: project['judge_name'],
              cab: project['judge_cabinet']
            });
          }
        }

        // Поиск суда по коду дела
        if (project['case_number']) {
          const curtCode = project['case_number'].split("-")[0];
          const curt = this.courtList.find(c => c.code === curtCode);
          if (curt) this.project.court = curt.pk;
        }
      }
    },
    callSave: {
      immediate: true,
      handler(val) {
        if (val) {
          this.save()
        }
      }
    },
    rectifiedProject: {
      immediate: true,
      handler(val) {
        if (val) {
          this.project.pk = val.pk;
        }
      }
    },
    contractor(val) {
      this.$emit('changeContractor', val)
    },
  },
  async created() {
    await this.loadData();
    await this.loadAdditionalData();
    if (this.rectifiedProject) {
      this.project.pk = this.rectifiedProject.pk;
      await this.updateData();
    } else {
      if (this.participatorList?.length) {
        this.project.participant = this.participatorList[0]?.pk;
      }
    }
  },
  components: {
    SystemMessage, ContractorCreateModal, JudicialAct, DocInArbitr, VueEditor, JudgeCreateModal
  }
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