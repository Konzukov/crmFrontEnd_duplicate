<template>
  <v-container>
    <v-expansion-panel :class="[templateError? 'has-error': '', 'pr-3 pl-3']">
      <v-expansion-panel-header>
        <v-row justify="start" align="center">
          <v-col cols="auto">{{ uploadFile.name }}</v-col>
          <v-col cols="auto">
            <v-btn icon v-if="!uploadProcess.uploading">
              <v-icon v-if="uploadProcess.uploaded" color="success">
                mdi-check
              </v-icon>
              <v-tooltip bottom v-if="uploadProcess.errors.hasError">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon @click.native.stop="showDuplicate($event, uploadProcess.errors.existFile)">
                    <v-icon color="error"
                            v-bind="attrs"
                            v-on="on"
                    >
                      mdi-alert-circle-outline
                    </v-icon>
                  </v-btn>
                </template>
                <span>{{ uploadProcess.errors.message }}</span>
              </v-tooltip>
            </v-btn>
            <v-progress-circular
                v-if="uploadProcess.uploading"
                :rotate="-90"
                :size="40"
                :width="7"
                :value="uploadProcess.progress"
                color="primary"
            >
              {{ uploadProcess.progress }}
            </v-progress-circular>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto" class="error--text error-message">
            {{ errorMessage }}
          </v-col>
        </v-row>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-container>
          <v-card>
            <v-card-text>
              <v-form>
                <v-row justify="start">
                  <v-col md="auto" sm="5">
                    <v-text-field
                        outlined
                        label="Дата получения"
                        type="date"
                        v-model="form.receiving_date"
                        dense
                        :disabled="!!uploadTemplate['id']"
                    ></v-text-field>
                  </v-col>
                  <v-col md="auto">
                    <v-autocomplete outlined dense label="Вид корреспонденции" :items="correspondenceType"
                                    item-text="name"
                                    item-value="id" return-object v-model="form.correspondence_type"
                                    @change="setQuarter"
                    ></v-autocomplete>
                  </v-col>
                  <v-col md="auto" v-if="!form.route">
                    <v-text-field outlined dense label="Исходящий номер"
                                  hint="Если оставить пустым, номер будет получен автоматически"
                                  v-model="form.out_number"></v-text-field>
                  </v-col>

                  <v-col cols="auto"
                         v-if="form.correspondence_type['name'] === 'Платежный документ' || form.correspondence_type['name']==='Счет на оплату'">
                    <v-text-field label="Сумма документа" dense outlined v-model="form.price"
                                  @keypress="isNumber($event)"></v-text-field>
                  </v-col>
                  <template v-if="form.correspondence_type['name'] === 'Квартальный отчет'">
                    <v-col cols="6">
                      <v-autocomplete
                          outlined
                          dense
                          label="Квартал и год"
                          :items="quarterYearOptions"
                          item-text="text"
                          item-value="value"
                          v-model="selectedQuarterYear"
                          @change="updateQuarterYear"
                      ></v-autocomplete>
                    </v-col>
                  </template>
                </v-row>
                <v-row justify="start">
                  <v-col md="5" sm="5" class="mr-2">
                    <v-autocomplete
                        outlined
                        dense
                        label="От кого"
                        v-model="contractor"
                        :items="contractorList"
                        item-value="uuid"
                        item-text="fullName"
                        return-object
                        append-outer-icon="mdi-plus"
                        @click:append-outer="addContractor"
                        @change="setFrom"
                    ></v-autocomplete>
                  </v-col>
                  <v-col md="1" sm="2" align-self="baseline" class="mt-3">
                    <v-btn icon color="success" @click="changeRoute()">
                      <v-icon :class="[eventRoute, 'route-arrow']">mdi-arrow-right-bold
                      </v-icon>
                    </v-btn>
                  </v-col>
                  <v-col md="5" sm="5" class="ml-2">
                    <v-autocomplete
                        outlined
                        dense
                        label="Кому"
                        :items="participatorList"
                        v-model="form.to"
                        return-object
                        item-value="participator.pk"
                        item-text="participator.fullName"
                    ></v-autocomplete>
                  </v-col>
                </v-row>
                <v-row justify="start" class="align-center">
                  <v-col md="5" sm="5">
                    <v-autocomplete
                        outlined
                        dense
                        label="Проект"
                        :items="projectList"
                        return-object
                        v-model="form.project"
                        item-value="pk"
                        item-text="name"
                        chips
                        multiple
                        append-outer-icon="mdi-plus"
                        @click:append-outer="addNewProject"
                        :disabled="uploadTemplate['id']===1"
                        @change="calculateQuarter"
                    >
                      <template v-slot:selection="data">
                        <v-chip>
                          {{ data.item.name }}
                        </v-chip>
                      </template>
                      <template v-slot:item="data">
                        <v-list-item-content>
                          <v-list-item-title>{{ data.item.name }}</v-list-item-title>
                          <v-list-item-subtitle style="font-size: 10px; color: #00a6ee">{{ data.item.code }} -
                            {{ data.item.procedure | getProcedure }}
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </template>
                    </v-autocomplete>
                    <span class="error-message error--text  ">{{ projectError }}</span>
                  </v-col>
                  <v-col md="5" sm="5">
                    <AddingTag ref="tagsList"></AddingTag>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-row justify="end">
                <v-col md="auto" sm="auto">
                  <v-btn color="error" @click.native.stop="removeFile">
                    Удалить
                  </v-btn>
                </v-col>

                <v-col md="auto" sm="auto">
                  <v-btn color="success" @click="save"
                         :disabled="uploadProcess.uploading || uploadProcess.uploaded || templateError">
                    Сохранить
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-container>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <ContractorCreateModal @contractorAdded="setContractor"></ContractorCreateModal>
    <ProjectCreateModal @setProject="setProject"></ProjectCreateModal>
    <ErrorHandling ref="errorHandling" :hasError="uploadProcess.errors.hasError"
                   :message="uploadProcess.errors.message"
                   class="errors"></ErrorHandling>
    <ConfirmDialog @forceAdd="addConfirm" @handleEditDoc="editExistDoc"></ConfirmDialog>
    <EditDocument></EditDocument>
  </v-container>
</template>

<script>
import filter from '../../../../mixin/filter'
import moment from 'moment'
import {eventBus} from "@/bus";
import AddingTag from "../../../Tagging/AddTag";
import ErrorHandling from "../../../ErrorHandling/ErrorHandling";
import {mapGetters} from 'vuex'
import ConfirmDialog from "@/components/CRM/PaperFlow/modal/ConfirmDialog";
import ContractorCreateModal from "@/components/referenceBook/ContractorCreateModal";
import {ProcedureType} from "@/const/dataTypes";
import {fileUploadUtils, fileUtils} from "@/utils/main";
import ProjectCreateModal from "@/components/referenceBook/Project/modal/ProjectCreateModal.vue";
import EditDocument from "@/components/CRM/PaperFlow/modal/editDocument.vue";

export default {
  name: "createDocumentForm",
  props: ['uploadFile', 'eventData', 'uploadTemplate', 'postPk', 'project', 'taskPk', 'eventPk'],
  data() {
    return {
      selectedQuarterYear: null,
      quarterYearOptions: [],
      uploadProcess: {
        uploaded: false,
        uploading: false,
        progress: '0',
        errors: {
          message: '',
          hasError: false
        }
      },
      contractor: null,
      form: {
        file: '',
        receiving_date: '',
        from_physical: '',
        out_number: null,
        from_legal: '',
        route: true,
        project: [],
        task: '',
        event: '',
        post: '',
        to: '',
        correspondence_type: '',
        price: null,
        quarter_year: null,
        quarter: null,
      },
      templateError: false,
      errorMessage: '',
      projectError: '',
      removed: false,
    }
  },
  methods: {
    editExistDoc(item){
      this.$emit('editDoc', item)
      console.log(item)
    },
    calculateQuarter(item) {
      console.log(item)
    },
    generateQuarterYearOptions() {
      const currentYear = new Date().getFullYear();
      const years = [currentYear - 1, currentYear];
      const quarters = [1, 2, 3, 4];

      this.quarterYearOptions = [];

      years.forEach(year => {
        quarters.forEach(quarter => {
          this.quarterYearOptions.push({
            text: `${year} год, ${quarter} квартал`,
            value: `${year}-${quarter}`,
            year: year,
            quarter: quarter
          });
        });
      });
    },
    setCurrentQuarterYear() {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      // Определяем текущий квартал
      let currentQuarter = 1;
      if (currentMonth >= 4 && currentMonth <= 6) currentQuarter = 2;
      else if (currentMonth >= 7 && currentMonth <= 9) currentQuarter = 3;
      else if (currentMonth >= 10 && currentMonth <= 12) currentQuarter = 4;

      this.selectedQuarterYear = `${currentYear}-${currentQuarter}`;
      this.form.quarter_year = currentYear;
      this.form.quarter = currentQuarter;
    },
    updateQuarterYear() {
      if (this.selectedQuarterYear) {
        const [year, quarter] = this.selectedQuarterYear.split('-');
        this.form.quarter_year = parseInt(year);
        this.form.quarter = parseInt(quarter);
      } else {
        this.form.quarter_year = null;
        this.form.quarter = null;
      }
    },
    setQuarter(item) {
      console.log(item)
      if (item.name === "Квартальный отчет") {
        this.generateQuarterYearOptions()
        this.setCurrentQuarterYear()
        // const currentMonth = new Date().getMonth() + 1; // Месяцы от 1 до 12
        // const currentYear = new Date().getFullYear()
        // if (currentMonth >= 1 && currentMonth <= 3) {
        //   this.form.quarter = 1;
        // } else if (currentMonth >= 4 && currentMonth <= 6) {
        //   this.form.quarter = 2;
        // } else if (currentMonth >= 7 && currentMonth <= 9) {
        //   this.form.quarter = 3;
        // } else {
        //   this.form.quarter = 4;
        // }
        // this.form.quarter_year = currentYear
      }
    },
    async save(force = false) {
      if (!this.templateError && !this.removed) {
        let tagsList;
        if (this.$refs.tagsList) {
          tagsList = this.$refs.tagsList.selected
        }

        // Проверяем размер файла перед загрузкой
        if (this.form.file && !fileUploadUtils.checkFileSize(this.form.file, 100)) {
          console.warn(`Файл ${this.form.file.name} имеет большой размер: ${fileUtils.formatFileSize(this.form.file.size)}`)
        }

        // Подготавливаем данные для FormData
        const formDataObj = {
          receiving_date: this.form.receiving_date ? moment(this.form.receiving_date).format('YYYY-MM-DD') : '',
          from_physical: this.form.from_physical?.pk || this.form.from_physical || '',
          out_number: this.form.out_number || '',
          from_legal: this.form.from_legal?.pk || this.form.from_legal || '',
          route: this.form.route,
          task: this.form.task?.pk || this.form.task || '',
          event: this.form.event?.pk || this.form.event || '',
          post: this.form.post?.pk || this.form.post || '',
          to: this.form.to?.pk || this.form.to || '',
          quarter_year: this.form.quarter_year || '',
          quarter: this.form.quarter || '',
          correspondence_type: this.form.correspondence_type?.id || this.form.correspondence_type || '',
          price: this.form.price ? this.form.price.toString().replace(/,/g, '.') : ''
        }

        // Добавляем проекты и события как массивы
        if (this.form.project && this.form.project.length > 0) {
          formDataObj.project = this.form.project
        }

        if (this.form.event && Array.isArray(this.form.event) && this.form.event.length > 0) {
          formDataObj.event = this.form.event
        }

        // Создаем оптимизированный FormData
        let formData = fileUploadUtils.createOptimizedFormData(formDataObj, this.form.file)

        // Добавляем теги
        if (tagsList && tagsList.length > 0) {
          tagsList.forEach(obj => {
            if (obj) {
              formData.append('tags', obj.pk.toString())
            }
          })
          this.$emit('resetTagForm')
        }

        if (this.uploadProcess.uploaded === false) {
          this.uploadProcess.uploading = true
          await this.$store.dispatch('saveDocument', {
            formData,
            'template': this.uploadTemplate,
            'file': this.form.file,
            'force': force
          }).then(() => {
            this.uploadProcess.uploading = false
            this.uploadProcess.uploaded = true
            this.uploadFile['uploaded'] = true
            this.$emit('uploaded', this.form.file)
          }).catch(err => {
            if (err.response.status === 444) {
              this.uploadProcess.uploaded = false
              this.uploadProcess.uploading = false
              this.uploadProcess.errors.hasError = true
              this.uploadProcess.errors.message = err.response.data.errors.message
              this.uploadProcess.errors.existFile = err.response.data.errors.existFile
              this.uploadFile['hasError'] = true
              throw err
            } else {
              let fileName = this.uploadFile.name
              this.$emit('hasError', {err, fileName})
              this.uploadProcess.errors.hasError = true
              this.uploadProcess.errors.message = err
              this.uploadFile['hasError'] = true
              throw err
            }
          })
        }
        if (tagsList) {
          this.$refs.tagsList.clear()
        }
      }
    },
    setFrom(item) {
      if (item['type'] === 'PhysicalPerson') {
        this.form.from_physical = item
        this.form.from_legal = ''
      } else {
        this.form.from_legal = item
        this.form.from_physical = ''
      }
    },
    addContractor() {
      this.$emit('addContractor')
    },
    addNewProject() {
      this.$emit('newProject')
    },
    changeRoute() {
      this.form.route = !this.form.route
    },
    removeFile() {
      // this.$emit('removeFile', this.uploadFile)
      this.$destroy();
      // remove the element from the DOM
      this.$el.parentNode.removeChild(this.$el);
      this.uploadProcess.uploaded = true
    },
    addConfirm() {
      this.save(true)
    },
    showDuplicate(e, error) {
      // error содержит existFile из ответа сервера
      this.$emit('showDuplicate', {
        existFile: error, // существующий документ
        newFile: this.form.file // текущий загружаемый файл
      })
    },
    checkFileNameValid() {
      if (this.uploadTemplate) {
        const regex = new RegExp(this.uploadTemplate.regExp, 'g');
        let testFileName = regex.exec(this.uploadFile['name'])
        if (!testFileName) {
          this.templateError = true
          this.errorMessage = "Шаблон не может быть применен. Проверьте корректность имени файла"
        } else {
          if (this.uploadTemplate.id === 1) {
            let codeList = testFileName[1].split('-')
            this.form.receiving_date = moment(testFileName[2], 'YYYYMMDD').format('YYYY-MM-DD')
            let existProject = this.projectList.filter(item => {
              for (let code of codeList) {
                if (item.code.toLowerCase() === code.toLowerCase()) {
                  return item
                }
              }
            })
            if (existProject.length >= 1) {
              this.form.project = existProject
            } else {
              this.templateError = true
              this.projectError = `Проекты с кодами ${codeList.toString()} не найдены`
            }
          } else if (this.uploadTemplate.id === 2) {
            this.form.receiving_date = moment(testFileName[1], 'YYYYMMDD').format('YYYY-MM-DD')
          }
        }
      }
    },
    setProject(proj) {
      console.log(proj)
      this.form.project.push(proj['pk'])
    },
    setContractor(item) {
      console.log(item)
      this.contractor = item
      this.setFrom(item)
    },
    isNumber(evt) {
      evt = (evt) ? evt : window.event;
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46 && charCode !== 44) {
        evt.preventDefault();
      } else {
        return true;
      }
    }
  },
  computed: {
    participatorList: {
      get() {
        if (this.$store.getters.participatorList) {
          return this.$store.getters.participatorList
        }
        return []
      }
    },
    contractorList: {
      get() {
        if (this.$store.getters.allRefData) {
          return this.$store.getters.allRefData
        }
        return []
      }
    },
    projectList: {
      get() {
        if (this.$store.getters.projectListData) {
          return this.$store.getters.projectListData
        }
        return []
      }
    },
    systemUser: {
      get() {
        if (this.$store.getters.allSystemUsersData) {
          return this.$store.getters.allSystemUsersData
        }
        return []
      }
    },
    eventRoute() {
      return this.form.route ? 'arrow-right' : 'arrow-left'
    },
    ...mapGetters({
      docType: "docTypeData",
      correspondenceType: "correspondenceTypeData"
    })
  },
  watch: {
    uploadTemplate(val) {
      if (val) {
        this.checkFileNameValid()
      }
    }

  },
  filters: {
    getProcedure(item) {
      let legal = ProcedureType.Legal
      let physical = ProcedureType.Physical
      let physicalVal = physical.filter(obj => {
        if (obj.value === item) {
          return obj
        }
      })[0]
      let legalVal = legal.filter(obj => {
        if (obj.value === item) {
          return obj
        }
      })[0]
      if (physicalVal) {
        return physicalVal.text
      } else if (legalVal) {
        return legalVal.text
      }
    }
  },
  created() {
    this.checkFileNameValid()
    eventBus.$on('saveAllDoc', () => {
      if (!this._isDestroyed) {
        this.save()
      }
    })
    this.form.file = this.uploadFile
    if (this.postPk) this.form.post = this.postPk
    if (this.taskPk) this.form.task = this.taskPk
    if (this.eventPk) this.form.event = this.eventPk
    if (this.project) this.form.project = this.project
  },
  mounted() {
    this.form.to = this.participatorList[0]
    eventBus.$on('updateProgress', ({progress, file}) => {
      if (file === this.uploadFile) {
        this.uploadProcess.progress = progress
      }
    })
    eventBus.$on('resetForm', () => {
      Object.assign(this.$data, this.$options.data())
      this.$destroy()
    })
  },
  components: {EditDocument, ContractorCreateModal, ProjectCreateModal, AddingTag, ErrorHandling, ConfirmDialog},
  mixins: [filter]
}
</script>

<style scoped>
@import "../../../../assets/css/form.scss";

.has-error {
  border: 1px solid crimson;
}

.error-message {
  font-size: 12px;
}

>>> .arrow-left {
  transform: rotate(180deg);
}

>>> .v-expansion-panel-header {
  padding: 0 24px !important;
}

>>> i.route-arrow {
  font-size: 40px !important;
}
</style>