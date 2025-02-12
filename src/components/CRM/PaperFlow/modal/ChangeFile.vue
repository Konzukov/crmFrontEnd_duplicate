<template>
  <v-dialog v-model="dialog" width="50vw">
    <v-card height="30vh">
      <v-card-title class="headline grey lighten-3">
        Замена файла {{form.fileName}}
      </v-card-title>
      <v-card-text>
        <v-row justify="center" align="center">
          <v-col cols="12">
            <v-form>
              <v-file-input v-model="newFile" truncate-length="100" clearable></v-file-input>
            </v-form>
          </v-col>
          <v-col md="2" sm="2">
            <v-btn icon v-if="!uploadProcess.uploading">
              <v-tooltip bottom v-if="uploadProcess.errors.hasError">
                <template v-slot:activator="{ on, attrs }">
                  <v-icon color="error"
                          v-bind="attrs"
                          v-on="on"
                  >
                    mdi-alert-circle-outline
                  </v-icon>
                </template>
                <span>{{uploadProcess.errors.message}}</span>
              </v-tooltip>
            </v-btn>
          </v-col>
        </v-row>
        <v-progress-linear
            v-if="uploadProcess.uploading"
            v-model="uploadProcess.progress"
            height="25"
        >
          <strong>{{uploadProcess.progress}}%</strong>
        </v-progress-linear>
      </v-card-text>
      <v-card-actions>
        <v-row justify="center">
          <v-col cols="auto">
            <v-btn color="error" @click="close" :disabled="uploadProcess.uploading">
              Отмена
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn color="darken-1 success" :disabled="uploadProcess.uploading"
                   @click="save">Заменить
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
    <ErrorHandling ref="errorHandling" :hasError="uploadProcess.errors.hasError"
                   :message="uploadProcess.errors.message"
                   class="errors"></ErrorHandling>
  </v-dialog>
</template>

<script>
import {eventBus} from '../../../../bus'
import ErrorHandling from "../../../ErrorHandling/ErrorHandling";

export default {
  name: "ChangeFile",
  data() {
    return {
      dialog: false,
      uploadProcess: {
        uploaded: false,
        uploading: false,
        progress: '',
        errors: {
          message: '',
          hasError: false
        }
      },
      newFile: null,
      form: {},
    }
  },
  methods: {
    close() {
      Object.assign(this.$data, this.$options.data())
      this.dialog = false
    },
    save() {
      let formData = new FormData()
      formData.set('file', this.newFile)
      formData.set('fileName', this.newFile.name)
      console.log(this.newFile)
      console.log(this.newFile.name)
      for (let pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
      }
      this.uploadProcess.uploading = true
      this.$store.dispatch('changeDocumentFile', {formData, 'pk': this.form.pk}).then(res => {
        this.uploadProcess.uploading = false
        this.uploadProcess.uploaded = true
        this.close()
        this.$emit('finished')
      }).catch(err => {
        if (err.response.status === 444) {
          this.uploadProcess.uploaded = false
          this.uploadProcess.uploading = false
          this.uploadProcess.errors.hasError = true
          this.uploadProcess.errors.message = err.response.data.errors.message
        } else {
          let fileName = this.form.file.name
          this.uploadProcess.uploaded = false
          this.uploadProcess.uploading = false
          this.$emit('hasError', {err, fileName})
          this.uploadProcess.errors.hasError = true
          this.uploadProcess.errors.message = err
        }
      })
    },
  },
  created() {
    this.$parent.$on('changeFile', obj => {

      this.$store.dispatch('getDocumentDetail', obj.pk).then((data) => {
        let doc = data
        console.log(doc)
        this.form = Object.assign({}, doc)

      })
      this.dialog = true
    })
  },
  updated() {
    eventBus.$on('updateProgress', ({progress}) => {
      this.uploadProcess['progress'] = progress
    })
  },
  components: {
    ErrorHandling
  }
}
</script>

<style scoped>

</style>