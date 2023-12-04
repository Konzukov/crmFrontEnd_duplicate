<template>
  <v-dialog v-model="dialog" width="90wv">
    <v-card min-height="600">
      <v-toolbar>
        <v-toolbar-title>Дубликат файла</v-toolbar-title>
      </v-toolbar>
      <v-card-text class="mt-6">
        <v-row justify="space-between">
          <v-col cols="auto"></v-col>
          <v-col cols="auto" v-if="form">
            <v-row justify="start">
              <v-btn @click="download(form)">Скачать файл</v-btn>
            </v-row>
            <v-row justify="start">
              <v-col cols="auto">Внес: {{ form.author | getName}}</v-col>
              <v-col cols="auto">Дата внесения: {{ form['entry_date'] }}</v-col>
            </v-row>
            <v-row v-if="form.project">
              <v-col cols="auto">Проект:
                <span v-for="(proj, i) in form.project" :key="i">{{ proj.name }}</span>
              </v-col>
              <v-col cols="auto" v-if="form.correspondence_type">Вид документа: {{ form.correspondence_type.name }}
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-row justify="center">
          <v-col cols="auto">
            <v-btn color="error" @click="close">Закрыть</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn color="success" @click="save">Всеравно сохранить</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ConfirmDialog",
  data: () => ({
    dialog: false,
    form: '',
  }),
  methods: {
    close() {
      this.dialog = false
      Object.assign(this.$data, this.$options.data())
    },
    save() {
      console.log('save')
      this.$emit('forceAdd')
      this.close()
    },
    download(doc) {
      this.$store.dispatch('downloadDocument', {'pk': doc.pk, 'fileName': doc.file})
    }
  },
  filters: {
    getName(obj) {
      if (obj && obj.hasOwnProperty('fullName')) {
        return obj.fullName
      }
      return '-------'
    },
  },
  created() {
    this.$parent.$on('showDuplicate', (form) => {
      console.log(form)
      this.form = form
      this.dialog = true
    })
  }
}
</script>

<style scoped>

</style>