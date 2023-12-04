<template>
  <v-dialog v-model="dialog" width="500" >
    <v-card>
      <v-card-title class="headline grey lighten-3">
        Замена файла
      </v-card-title>
      <v-card-text >
        <v-row justify="start" align="center">
          <v-col md="10" sm="10">
            <v-form>
              <v-file-input v-model="form.file"></v-file-input>
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
          <v-col md="5" sm="5">
            <v-btn color="error" @click="close" :disabled="uploadProcess.uploading">
              Отмена
            </v-btn>
          </v-col>
          <v-col md="5" sm="5">
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
      form: '',
    }
  },
  methods: {
    close() {
      this.dialog = false
      Object.assign(this.$data, this.$options.data())
    },
    save() {
      let formData = new FormData()
      formData.set('file', this.form.file)
      formData.set('fileName', this.form.file.name)

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
          this.$emit('hasError', {err, fileName})
          this.uploadProcess.errors.hasError = true
          this.uploadProcess.errors.message = err
        }
      })
    },
  },
  created() {
    this.$parent.$on('changeFile', obj => {
      this.$store.dispatch('getDocumentDetail', obj.pk).then(() => {
        let doc = this.$store.getters.singleDocumentData
        this.form = Object.assign({}, doc)

      })
      this.dialog = true
      // this.form = Object.assign({}, item)
      console.log(this.form)
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