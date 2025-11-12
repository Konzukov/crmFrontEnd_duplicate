<template>
  <v-row>
    <v-dialog v-model="dialog" scrollable fullscreen hide-overlay>
      <v-overlay :value="loadingData">
        <v-progress-circular
            indeterminate
            size="64"
        ></v-progress-circular>
      </v-overlay>
      <v-container fluid>
        <v-card height="100vh">
          <v-card-title>
            <v-row justify="center">
              <span class="headline">Добавить документы</span>
            </v-row>
          </v-card-title>
          <v-row justify="center">
            <v-col md="8">
              <v-checkbox
                  outlined
                  label="Использовать шаблон для загрузки"
                  v-model="useTemplate"
                  @change="cleanTemplate"
              ></v-checkbox>
            </v-col>
          </v-row>
          <v-row justify="center">
            <v-col md="8">
              <v-select v-if="useTemplate"
                        v-model="template"
                        outlined
                        :items="uploadTemplates"
                        item-text="name"
                        item-value="id"
                        :hint="template.helpText"
                        return-object
              ></v-select>
            </v-col>
          </v-row>
          <v-card-text>
            <v-row class="ml-5 mr-5 mb-3">
              <v-col md="12" sm="12" @drop.prevent="dropAddFile" @dragover.prevent>
                <form action="" ref="fileInput">
                  <v-file-input counter
                                label="Добавьте файлы"
                                multiple
                                :accept="template.id === 3? '.yml,.yaml': ''"
                                v-model="files"
                                placeholder="Выберете или перетащите файлы"
                                outlined
                                clearable
                                @click:clear="resetForm"
                  >
                  </v-file-input>
                </form>
              </v-col>
            </v-row>
            <v-row class="ml-5 mr-5 mb-4">
              <v-expansion-panels flat focusable v-if="template.id === 3">
                <yaml-file-processing v-for="(item, i) in files"
                                      :ref="`yamlForm`"
                                      :uploadFile.sync="item"
                                      :key="i"
                ></yaml-file-processing>
              </v-expansion-panels>
              <v-expansion-panels flat focusable v-else>
                <createDocumentForm v-for="(item, i) in files"
                                    :ref="`docForm`"
                                    :key="i" :uploadFile.sync="item"
                                    :postPk="postPk"
                                    :taskPk="taskPK"
                                    :eventPk="eventPk"
                                    :project="project"
                                    @saveDocument="saveDoc" :eventData.sync="eventData"
                                    @removeFile="delDoc($event, item, i)"
                                    @uploaded="fileUploaded"
                                    :uploadTemplate="template">
                </createDocumentForm>
              </v-expansion-panels>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-row justify="center" class="pb-5">
              <v-col cols="auto" class="mr-5">
                <v-btn @click="close" color="error">Закрыть</v-btn>
              </v-col>
              <v-col cols="auto">
                <v-btn v-if="template.id ===3 " color="success" :disabled="files.length === 0" @click="processYaml">
                  Обработать
                </v-btn>
                <v-btn v-else color="success" :disabled="files.length === 0" @click="saveAll">Сохранить все</v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-dialog>
    <LegalEntityCreateModal></LegalEntityCreateModal>
  </v-row>
</template>

<script>
import createDocumentForm from "./createDocumentForm";
import {eventBus} from "../../../../bus";
import {DocumentNameTemplate} from "@/const/dataTypes";
import YamlFileProcessing from "@/components/CRM/PaperFlow/modal/yamlFileProcessing.vue";
import LegalEntityCreateModal from "@/components/referenceBook/LegalEntity/LegalEntityCreateModal.vue";

export default {
  name: "createDocument",
  data() {
    return {
      hasError: false,
      loadingData: false,
      useTemplate: false,
      postPk: '',
      taskPK: '',
      eventPk: '',
      project: '',
      template: '',
      dialog: false,
      eventData: '',
      taskData: '',
      files: [],
      show: true,
    }
  },
  computed: {
    uploadTemplates: {
      get() {
        if (this.useTemplate) {
          return DocumentNameTemplate
        }
        return []
      }
    }
  },
  methods: {
    async processYaml() {
      let yamlFormComponent = this.$refs['yamlForm']
      await Promise.all(yamlFormComponent.map(async (_component) => {
        await _component.processYaml(); // Ожидаем завершения processYaml
      }));
    },
    open() {
      this.dialog = true
      this.loadingData = true
      this.$store.dispatch('getParticipator');
      this.$store.dispatch('getLegalEntity');
      this.$store.dispatch('fetchPhysicalPersons');
      this.$store.dispatch('getProjectList');
      this.$store.dispatch('getUploadingTemplates')
      this.$store.dispatch('getDocType')
      this.$store.dispatch('getCorrespondenceType')
      this.loadingData = false
    },
    close() {
      if (this.postPk) {
        this.$emit('updatePost', this.postPk)
      }
      Object.assign(this.$data, this.$options.data())
    },
    async saveDoc({formData, file}) {
      this.files = this.files.map(obj => {
        if (obj === file) {
          obj['uploading'] = true
        }
        return obj
      })
      if (!file['uploaded']) {
        new Promise(async (resolve) => {
          await this.$store.dispatch('saveDocument', {formData, 'template': this.template, file}).then(() => {
            this.files = this.files.map(obj => {
              if (obj === file) {
                obj['uploaded'] = true
                obj['uploading'] = false
              }
              this.$emit('successAdded')
              return obj
            })
          }).catch(err => {
            if (err.response.status === 444) {
              this.files = this.files.map(obj => {
                if (obj === file) {
                  obj['uploaded'] = false
                  obj['uploading'] = false
                  obj['error'] = true
                  obj['errorMessage'] = err.response.data.errors.message
                }
                return obj
              })
            } else {
              let fileName = file
              this.$emit('hasError', {err, fileName})
              this.errors.hasError = true
              this.errors.message = err
            }
          }).finally(() => {
            resolve()
          })
        })

      }
    },
    delDoc(elem, item, index) {
      // let docFormComponent = this.$refs['docForm']
      // let childComponent = this.$refs['docForm'][index]
      // childComponent.$destroy()
      this.files = this.files.filter(obj => {
        if (obj !== item) {
          return obj
        }
      })
      //
    },
    dropAddFile(e) {
      let droppedFiles = e.dataTransfer.files;
      if (!droppedFiles) return false;
      ([...droppedFiles]).forEach(file => {
        console.log(file)
        this.files.push(file)
      })
    },
    async saveAll() {
      let docFormComponent = this.$refs['docForm']
      new Promise(async resolve => {
        for (let _component of docFormComponent) {
          await _component.save()
        }
        resolve()
      }).then(() => {
        for (let obj of this.files) {
          if (obj.hasError) {
            this.hasError = true
            break
          }
        }
        if (!this.hasError) {
          this.close()

        }
      })
      // this.close()
      // eventBus.$emit('saveAllDoc')
    },
    cleanTemplate(item) {
      if (!item) {
        this.template = ''
      }
    },
    resetForm() {
      this.files = new Array()
      eventBus.$emit('resetForm')
      // Object.assign(this.$data, this.$options.data())
    },
    fileUploaded(file) {
      let fileCount = 0;
      let uploadedFile = this.files.filter(f => f === file)
      uploadedFile['uploaded'] = true
      this.files.forEach(obj => {
        if (obj['uploaded']) {
          fileCount += 1
        }
        if (fileCount === this.files.length) {
          this.$emit('allDocSaved')
        }
      })

    }
  },
  created() {
    this.$parent.$on('newDocument', () => {
      this.open()
    })
    this.$parent.$on('newPostDocument', (data) => {
      this.postPk = data.postPk
      this.project = data.project
      this.open();
    })
    this.$parent.$on('newEventDocument', (event) => {
      this.eventData = Object.assign({}, event)
      this.open()
    })
    this.$parent.$on('newTaskDoc', (task) => {
      this.project = task.project
      this.taskPK = task.pk
      this.taskData = task
      this.open()
    })
    this.$parent.$on('newEventDoc', (event) => {
      this.project = event.project
      this.eventPk = event.pk
      this.taskData = event
      this.open()
    })

  },
  mounted() {
    eventBus.$on('updateProgress', ({progress, file}) => {
      this.files = this.files.map(obj => {
        if (obj === file) {
          obj['progress'] = progress
        }
        return obj
      })
    })
  },
  components: {
    YamlFileProcessing,
    createDocumentForm,
    LegalEntityCreateModal
  },
}
</script>

<style scoped>

.doc-prev .v-card__title {
  font-size: 12px;
}

* {
  margin: 0;
  padding: 0;
}

>>> .v-expansion-panel-header {
  min-height: 30px !important;
}

.v-card {
  overflow-y: scroll;
}

.errors {
  z-index: 9999999999999;
}
</style>