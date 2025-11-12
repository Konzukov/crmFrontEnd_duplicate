<template>
  <v-dialog fullscreen persistent hide-overlay scrollable v-model="show">
    <v-card height="100vh">
      <v-toolbar dark flat color="primary" height="50">
        <v-toolbar-title>Редактировать инструкцию</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon small @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="mt-3">
        <v-form>
          <v-row justify="start">
            <v-col cols="12" md="12">
              <v-text-field
                flat
                dense
                outlined
                label="Название"
                v-model="form.title"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Существующие видеофайлы -->
          <v-row v-if="existingFiles.length">
            <v-col cols="12">
              <v-card outlined>
                <v-card-title class="text-subtitle-1">
                  Существующие видеофайлы
                  <v-spacer></v-spacer>
                  <v-btn
                    small
                    color="error"
                    @click="deleteAllFiles"
                    v-if="existingFiles.length"
                  >
                    Удалить все
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col
                      cols="12"
                      md="4"
                      v-for="(file, index) in existingFiles"
                      :key="file.id"
                    >
                      <div class="video-wrapper">
                        <video controls width="100%">
                          <source :src="file.video_url" type="video/mp4">
                        </video>
                        <div class="d-flex justify-space-between mt-2">
                          <span class="text-caption">
                            {{ formatDate(file.created_at) }}
                          </span>
                          <v-btn
                            icon
                            small
                            color="error"
                            @click="markForDeletion(file.id, index)"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Новые видеофайлы -->
          <v-row justify="start">
            <v-col cols="12" md="12">
              <v-file-input
                multiple
                show-size
                counter
                dense
                outlined
                label="Добавить новые видеофайлы"
                v-model="form.new_video_files"
              ></v-file-input>
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
import { VueEditor } from "vue2-editor";
import moment from "moment";

export default {
  name: "EditVideoInstruction",
  props: {
    show: Boolean,
    articleId: [Number, String]
  },
  components: {
    VueEditor
  },
  data: () => ({
    form: {
      id: null,
      title: '',
      description: '',
      new_video_files: [],
      deleted_files: []
    },
    existingFiles: [],
    hasLoaded: false
  }),
  watch: {
    // Следим за изменением видимости диалога
    show: {
      immediate: true,
      handler(val) {
        if (val && this.articleId && !this.hasLoaded) {
          this.loadArticle();
        }
      }
    },
    // Следим за изменением ID статьи
    articleId: {
      immediate: true,
      handler(newVal) {
        if (newVal && this.show) {
          this.loadArticle();
        }
      }
    }
  },
  methods: {
    async loadArticle() {
      try {
        const article = await this.$store.dispatch('fetchWikiDoc', this.articleId);
        this.form.id = article.id;
        this.form.title = article.title;
        this.form.description = article.description;
        this.existingFiles = article.files || [];
      } catch (error) {
        console.error('Ошибка загрузки статьи:', error);
      }
    },

    formatDate(date) {
      return moment(date).format('DD.MM.YYYY');
    },

    markForDeletion(fileId, index) {
      this.form.deleted_files.push(fileId);
      this.existingFiles.splice(index, 1);
    },

    deleteAllFiles() {
      this.existingFiles.forEach(file => {
        this.form.deleted_files.push(file.id);
      });
      this.existingFiles = [];
    },

    close() {
      this.$emit('close');
      this.resetForm();
    },

    resetForm() {
      this.form = {
        id: null,
        title: '',
        description: '',
        new_video_files: [],
        deleted_files: []
      };
      this.existingFiles = [];
      this.hasLoaded = false; // Сбрасываем флаг загрузки
    },

    async save() {
      const formData = new FormData();
      formData.append('id', this.form.id);
      formData.append('title', this.form.title);
      formData.append('description', this.form.description);

      // Добавляем файлы для удаления
      this.form.deleted_files.forEach(id => {
        formData.append('deleted_files', id);
      });

      // Добавляем новые видеофайлы
      this.form.new_video_files.forEach(file => {
        formData.append('video_files', file);
      });

      try {
        await this.$store.dispatch('saveWiki', {data: formData, id: this.form.id});
        this.$emit('saved');
        this.close();
      } catch (error) {
        console.error('Ошибка сохранения:', error);
      }
    }
  }
};
</script>

<style scoped>
.video-wrapper {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 8px;
  background-color: #fafafa;
}

>>> #quill-container .ql-editor {
  height: 40vh !important;
}
</style>