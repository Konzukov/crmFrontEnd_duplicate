<template>
  <v-dialog fullscreen persistent hide-overlay v-model="show">
    <v-card height="100vh">
      <v-toolbar dark flat color="primary" height="50">
        <v-toolbar-title>Добавить инструкцию</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon small @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="mt-3">
        <v-form>
          <v-row justify="start">
            <v-col cols="12" md="12">
              <v-text-field flat dense outlined label="Название" v-model="form.title"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="12" md="12">
              <v-file-input multiple show-size counter dense outlined label="Видео файлы"
                            v-model="form.video_files"></v-file-input>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="12" md="12">
              <VueEditor v-model="form.description"></VueEditor>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="flex justify-end">
        <v-btn color="error" @click="close">Отмена</v-btn>
        <v-btn color="success" @click="save">Сохранить</v-btn>

      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {VueEditor} from "vue2-editor";

export default {
  name: "AddVideoInstruction",
  data: () => ({
    show: false,

    form: {
      id: null,
      title: '',
      video_files: [],
      description: ''
    }
  }),
  methods: {
    close() {
      this.show = false
    },
    async save() {
      let formData = new FormData()
      formData.append('title', this.form.title)
      formData.append('description', this.form.description)
      this.form.video_files.forEach(file => {
        formData.append('video_files', file)
      })
      await this.$store.dispatch('saveWiki', {data: formData, id: this.form.id})
      this.$emit('saved');
      this.close()
    }
  },
  created() {
    this.$parent.$on("addInstruction", () => {
      this.show = true
    })
  },
  components: {
    VueEditor
  }
}
</script>
<style scoped>
>>> #quill-container .ql-editor {
  height: 50vh !important;
}
</style>