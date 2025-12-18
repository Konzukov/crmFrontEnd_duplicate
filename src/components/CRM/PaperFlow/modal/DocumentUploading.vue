<template>
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
        <v-card-text>
          <v-row class="ml-5 mr-5 mb-3">
            <v-col md="12" sm="12" @drop.prevent="dropAddFile" @dragover.prevent>
              <form action="" ref="fileInput">
                <v-file-input counter
                              label="Добавьте файлы"
                              multiple
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
            <v-expansion-panels flat focusable>
              <DocumentUploadingForm v-for="(item, i) in files"
                                     :ref="`docForm`"
                                     :key="i" :uploadFile.sync="item"
                                     :task="task"
                                     :event="event"
                                     @saveDocument="saveDoc"
                                     @removeFile="delDoc($event, item, i)"
              >
              </DocumentUploadingForm>
            </v-expansion-panels>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-row justify="center" class="pb-5">
            <v-col cols="auto" class="mr-5">
              <v-btn @click="close" color="error">Закрыть</v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn color="success" :disabled="files.length === 0" @click="saveAll">Добавить</v-btn>
            </v-col>
          </v-row>

        </v-card-actions>
      </v-card>
    </v-container>
  </v-dialog>
</template>

<script>
import DocumentUploadingForm from "@/components/CRM/PaperFlow/modal/DocumentUploadingForm";


export default {
  props: ['task', 'event'],
  name: "DocumentUploading",
  data: () => ({
    loadingData: false,
    dialog: false,
    files: [],
    formsData: [],
  }),
  methods: {
    async dispatchData() {
      const promises = [];
      if (!this.$store.getters.participatorList?.length) {
        promises.push(this.$store.dispatch('getParticipator'));
      }
      if (!this.$store.getters.legalEntityDetailData?.length) {
        promises.push(this.$store.dispatch('getLegalEntity'));
      }
      if (!this.$store.getters.physicalPersonListDataV2?.length) {
        promises.push(this.$store.dispatch('fetchPhysicalPersons'));
      }
      if (!this.$store.getters.projectListData?.length) {
        promises.push(this.$store.dispatch('getProjectList'));
      }
      if (promises.length > 0) {
        await Promise.all(promises);
      }

      this.$store.dispatch('getUploadingTemplates')
      this.$store.dispatch('getDocType')
      this.$store.dispatch('getCorrespondenceType')
    },
    close() {
      this.dialog = false
      this.files = []
      this.formsData = []
    },
    delDoc(elem, item) {
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
        this.files.push(file)
      })
    },
    resetForm() {
      this.files = new Array()
    },
    async saveAll() {
      let docFormComponent = this.$refs['docForm']
      for (let _component of docFormComponent) {
        let data = _component.save()
        console.log(data)
        this.formsData.push(data)
      }
      this.$emit('docsAdded', {'formsData': this.formsData, 'files': this.files})
      this.close()
    },
    saveDoc(formData) {
      console.log(formData)
    }
  },
  created() {
    this.dispatchData()
    this.$parent.$on("newEventDoc", () => {
      this.dialog = true
    })
    this.$parent.$on("newTaskDoc", () => {
      this.dialog = true
    })
  },
  components: {
    DocumentUploadingForm
  }
}
</script>

<style scoped>

</style>