<template>
  <v-dialog v-model="showModal" max-width="600px" persistent>
    <v-card>
      <v-card-title class="headline">
        Добавить квартальный отчет
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <p><strong>Проект:</strong> {{ currentProject | projectInfo }}</p>
              <p><strong>Период:</strong> {{ selectedQuarterYear.text }}</p>
            </v-col>
            <v-col cols="12">
              <v-file-input
                  v-model="file"
                  dense
                  outlined
                  label="Выберите файл отчета"
                  accept=".pdf"
                  prepend-icon="mdi-paperclip"
                  show-size
                  :error-messages="fileErrors"
                  @change="resetFileErrors"
              ></v-file-input>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <!-- Индикатор загрузки -->
        <v-progress-circular
            v-if="uploading"
            indeterminate
            color="primary"
            size="24"
            class="mr-3"
        ></v-progress-circular>

        <v-btn color="blue darken-1" text @click="close" :disabled="uploading">
          Отмена
        </v-btn>
        <v-btn
            color="blue darken-1"
            text
            @click="save"
            :disabled="!file || uploading"
        >
          Добавить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "QuarterReportUploadModal",
  props: {
    show: Boolean,
    currentProject: Object,
    selectedQuarterYear: Object,
    modalType: {
      type: String,
      default: 'add' // 'add' или 'replace'
    }
  },
  data() {
    return {
      file: null,
      correspondence_type: '',
      uploading: false,
      fileErrors: ''

    };
  },
  computed: {
    showModal: {
      get() {
        return this.show;
      },
      set(value) {
        this.$emit('update:show', value);
      }
    },
  },
  filters: {
    projectInfo(item) {
      return `${item?.name} - ${item?.case_number}`
    },
  },
  methods: {
    resetFileErrors() {
      this.fileErrors = '';
    },

    close() {
      this.showModal = false;
      this.resetForm();
    },

    resetForm() {
      this.file = null;
      this.comment = '';
      this.uploading = false;
      this.fileErrors = '';
    },

    async save() {
      if (!this.file) {
        this.fileErrors = 'Файл обязателен для загрузки';
        return;
      }

      this.uploading = true;

      const formData = new FormData();
      formData.append('file', this.file);
      formData.append('project', this.currentProject.id);
      formData.append('quarter_year', this.selectedQuarterYear.year);
      formData.append('quarter', this.selectedQuarterYear.quarter);
      formData.append('correspondence_type', 'Квартальный отчет');

      try {
        await this.$store.dispatch('uploadQuarterReport', formData);
        this.$emit('saved');
        this.close();
      } catch (error) {
        console.error('Ошибка загрузки отчета:', error);
      } finally {
        this.uploading = false;
      }
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.resetForm();
      }
    }
  }
};
</script>

<style scoped>
>>> .v-card__title {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}
</style>