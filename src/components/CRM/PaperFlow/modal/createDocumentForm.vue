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
                                    item-value="id" return-object v-model="form.correspondence_type"></v-autocomplete>
                  </v-col>
                  <v-col md="auto" v-if="!form.route">
                    <v-text-field outlined dense label="Исходящий номер"
                                  hint="Если оставить пустым, номер будет получен автоматически"
                                  v-model="form.out_number"></v-text-field>
                  </v-col>
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
                        :disabled="!!uploadTemplate['id']"
                    ></v-autocomplete>
                    <span class="error-message error--text  ">{{ projectError }}</span>
                  </v-col>
                  <v-col md="5" sm="5">
                    <AddingTag ref="tagsList"></AddingTag>
                  </v-col>
                </v-row>
                <v-row justify="start" v-if="form.correspondence_type['name'] === 'Платежный документ'">
                  <v-col cols="3">
                    <v-text-field label="Сумма документа" dense outlined v-model="form.price"
                                  @keypress="isNumber($event)"></v-text-field>
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
    <ConfirmDialog @forceAdd="addConfirm"></ConfirmDialog>
  </v-container>
</template>

<script>
import filter from '../../../../mixin/filter'
import moment from 'moment'
import {eventBus} from "../../../../bus";
import AddingTag from "../../../Tagging/AddTag";
import ErrorHandling from "../../../ErrorHandling/ErrorHandling";
import {mapGetters} from 'vuex'
import ConfirmDialog from "@/components/CRM/PaperFlow/modal/ConfirmDialog";
import ProjectCreateModal from "@/components/referenceBook/Project/modal/ProjectCreateModal";
import ContractorCreateModal from "@/components/referenceBook/ContractorCreateModal";

export default {
  name: "createDocumentForm",
  props: ['uploadFile', 'eventData', 'uploadTemplate', 'postPk', 'project', 'taskPk', 'eventPk'],
  data() {
    return {
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
      },
      templateError: false,
      errorMessage: '',
      projectError: '',
      removed: false,
    }
  },
  methods: {
    async save(force = false) {
      if (!this.templateError && !this.removed) {
        let tagsList;
        if (this.$refs.tagsList) {
          tagsList = this.$refs.tagsList.selected
        }
        let formData = new FormData()
        Object.keys(this.form).forEach(key => {
              if (this.form[key]) {
                if (typeof this.form[key] === 'object') {
                  if (key === 'receiving_date') {
                    formData.append(key, moment(this.form[key]).format('YYYY-MM-DD'))
                  } else if (key === 'project') {
                    if (this.form.project.length > 0) {
                      console.log(this.form.project)
                      this.form.project.forEach(obj => {
                        if (typeof obj === 'object') {
                          formData.append(key, obj.pk.toString())
                        } else {
                          formData.append(key, obj.toString())
                        }
                      })
                    }
                  } else if (key === 'event') {
                    if (this.form.event.length > 0) {
                      this.form.event.forEach(obj => {
                        formData.append(key, obj.pk.toString())
                      })
                    }
                  } else if (key === 'file') {
                    formData.set(key, this.form[key])
                  } else if (key === 'correspondence_type') {
                    formData.set(key, this.form[key]['id'])
                  } else {
                    formData.set(key, this.form[key]['pk'])
                  }
                } else {
                  if (this.form[key] === 'price') {
                    formData.set(key, this.form[key].replace(/,/g, '.'))
                  }
                  formData.set(key, this.form[key])
                }
              } else {
                if (key === 'route') {
                  formData.set(key, this.form[key])
                } else {
                  formData.set(key, '')
                }
              }
            }
        )
        if (tagsList) {
          tagsList.forEach(obj => {
            if (obj) {
              formData.append('tags', obj.pk.toString())
            }
            this.$emit('resetTagForm')
          })
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
            } else {
              let fileName = this.uploadFile.name
              this.$emit('hasError', {err, fileName})
              this.uploadProcess.errors.hasError = true
              this.uploadProcess.errors.message = err
              this.uploadFile['hasError'] = true
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
      this.$emit('showDuplicate', error)
    },
    checkFileNameValid() {
      if (this.uploadTemplate) {
        const regex = /(\S+)_(\d{8})_(\S+)/g;
        let testFileName = regex.exec(this.uploadFile['name'])
        if (!testFileName) {
          this.templateError = true
          this.errorMessage = "Шаблон не может быть применен. Проверьте корректность имени файла"
        } else {
          let codeList = testFileName[1].split('-')
          let existProject = this.projectList.filter(item => {
            for (let code of codeList) {
              if (item.code === code) {
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
        return new Array()
      }
    },
    contractorList: {
      get() {
        if (this.$store.getters.contractorListData) {
          return this.$store.getters.contractorListData
        }
        return new Array()
      }
    },
    projectList: {
      get() {
        if (this.$store.getters.projectListData) {
          return this.$store.getters.projectListData
        }
        return new Array()
      }
    },
    systemUser: {
      get() {
        if (this.$store.getters.allSystemUsersData) {
          return this.$store.getters.allSystemUsersData
        }
        return new Array()
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
  components: {ContractorCreateModal, ProjectCreateModal, AddingTag, ErrorHandling, ConfirmDialog},
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