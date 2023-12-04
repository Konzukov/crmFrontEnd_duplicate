<template>
  <v-dialog v-model="dialog" width="40%">
    <v-card>
      <v-card-title>
        <v-row justify="center">
          <h4>Закрытие проекта</h4>
        </v-row>

      </v-card-title>
      <v-card-text>
        <v-row justify="center">
          <v-col md="10">
            <v-text-field
                outlined
                label="Дата"
                type="date"
                v-model="form.termination_date"
            ></v-text-field>
          </v-col>
          <v-col md="10">
            <v-textarea
                outlined
                rows="4"
                v-model="form.termination_reason"
                label="Причина закрытия"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-row justify="center">
          <v-col md="5">
            <v-btn color="error" @click="close()">Отмена</v-btn>
          </v-col>
          <v-col md="5">
            <v-btn color="success" @click="save()">Сохранить</v-btn>
          </v-col>

        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from 'moment'

export default {
  name: "addToArchive",
  data() {
    return {
      dialog: false,
      form: {
        pk: '',
        name: '',
        code: '',
        participant: '',
        direction: '',
        contractor: '',
        contract: '',
        description: '',
        objective: '',
        termination_date: moment().format('YYYY-MM-DD'),
        termination_reason: ''
      }
    }
  },
  methods: {
    save() {
      let formData = new FormData()
      Object.keys(this.form).forEach(key => {
        if (this.form[key]) {
          if (typeof this.form[key] === 'object') {
            if (key === 'participant') {
              formData.append(key, this.form[key]['pk'])
            } else if (key === 'contractor') {
              if (this.form[key]['type'] === 'LegalEntity') {
                formData.append('legal_contractor', this.form[key].pk)
              } else {
                formData.append('physical_contractor', this.form[key].pk)
              }
            } else if (key === 'termination_date') {
              formData.append(key, moment(this.form[key]).format('YYYY-MM-DD'))
            } else {
              if (this.form[key].pk) {
                formData.append(key, this.form[key].pk)
              }
            }
          } else {
            if (this.form[key]) {
              formData.append(key, this.form[key])
            }
          }
        }
      })
      this.$store.dispatch('editProject', {formData, pk: this.form.pk}).then(() => {
        this.close()
      }).catch(err => {
        console.log(err.response.data.errors)
      })
    },
    close() {
      this.dialog = false
      this.$forceUpdate()
    },
  },
  created() {
    this.$parent.$on('addToArchive', (item) => {
      this.$store.dispatch('getProjectDetail', item.pk).then(() => {
        this.dialog = true
        let projectDetail = this.$store.getters.projectDetailData
        this.form = Object.assign({}, projectDetail)
        this.form.termination_date = moment().format('YYYY-MM-DD')
      })
    })

  }
}
</script>

<style scoped>
>>> .v-dialog {
  overflow: hidden;
}
</style>