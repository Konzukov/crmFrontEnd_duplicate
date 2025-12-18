<template>
  <v-card flat class="questionnaire mt-4"
          :style="collapsed? 'height: 72vh; overflow: hidden': 'height: 45vh; overflow: hidden'">
    <v-row justify="start" style="height: 96%; overflow: hidden">
      <v-col cols="6">
        <v-card-text class="physical-person" v-if="contractor"
                     :style="collapsed? 'height: 65vh; overflow-y: scroll': 'height: 40vh; overflow-y: scroll'">
          <PhysicalPersonDetail
              :yaml="yaml"
              v-if="contractor.type==='PhysicalPerson'"
              :person="contractor"
              :showActionButton="false"
              :showSnackbar="false"
              class="v-card--flat"
              ref="personComponent"
          ></PhysicalPersonDetail>
          <LegalEntityForm
              v-else
              :legalEntityData.sync="contractor"
              :show-action-button="false"
              ref="legalEntityComponent"
          ></LegalEntityForm>
        </v-card-text>
      </v-col>


      <v-col cols="6">
        <v-card-text>
          <ProjectCreate
              :rectified-project="projectDetail"
              :yaml="yaml"
              @changeContractor="changeContractor"
              :show-action-button="false"
              ref="projectComponent"
          ></ProjectCreate>
        </v-card-text>
      </v-col>
    </v-row>

    <v-card-actions>
      <v-row justify="center">
        <v-col cols="auto" class="ml-2">
          <v-btn color="error" @click="$emit('cancel')">
            <v-icon left>mdi-cancel</v-icon>
            Отмена
          </v-btn>
        </v-col>
        <v-col cols="auto" class="mr-2">
          <v-btn
              color="success"
              @click="handleSave"
              :loading="isSaving"
              :disabled="isSaving"
          >
            <v-icon left>mdi-content-save</v-icon>
            Сохранить
          </v-btn>
        </v-col>
        <v-col cols="auto" class="mr-2">
          <input class="d-none" ref="uploader" type="file" @change="handleFileUpload"/>
          <v-btn
              color="primary"
              @click="selectFile"
              :loading="isSaving"
              :disabled="isSaving"
          >
            <v-icon left>mdi-file-arrow-left-right</v-icon>
            Загрузить данные из yaml
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>

    <!-- Универсальный snackbar для уведомлений -->
    <v-snackbar
        v-model="showNotification"
        :timeout="notificationTimeout"
        :color="notificationType"
        multi-line
    >
      <v-icon left>
        {{ notificationType === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
      </v-icon>
      {{ notificationMessage }}

      <template v-slot:action="{ attrs }">
        <v-btn
            text
            v-bind="attrs"
            @click="showNotification = false"
        >
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>
import PhysicalPersonDetail from "@/components/referenceBook/PhysicalPersonV2/PhysicalPersonDetail.vue";
import ProjectCreate from "@/components/referenceBook/Project/ProjectCreate";
import LegalEntityForm from "@/components/referenceBook/LegalEntity/LelagEntityForm.vue";
import jsYaml from "js-yaml";

export default {
  props: ['collapsed'],
  name: "ProjectQuestionnaire",
  components: {
    LegalEntityForm,
    ProjectCreate,
    PhysicalPersonDetail
  },
  data: () => ({
    projectDetail: null,
    contractor: null,
    yaml: null,
    isSaving: false,
    showNotification: false,
    notificationMessage: '',
    notificationType: 'success',
    notificationTimeout: 2000
  }),
  methods: {
    async handleSave() {
      this.isSaving = true;

      try {
        // Сначала сохраняем проект
        await this.saveProject();

        // Затем сохраняем контрагента
        if (this.contractor) {
          await this.saveContractor();
        }

        // Показываем уведомление об успехе
        this.showNotificationMessage('Данные успешно сохранены', 'success');
        this.$emit('save-success');
      } catch (error) {
        console.error('Ошибка сохранения:', error);
        const errorMsg = this.getErrorMessage(error);
        this.showNotificationMessage(errorMsg, 'error');
        this.$emit('save-error', errorMsg);
      } finally {
        this.isSaving = false;
      }
    },

    getErrorMessage(error) {
      if (error.isValidationError) {
        return error.message;
      }
      if (error.response?.data?.errors) {
        return 'Исправьте ошибки в форме';
      }
      if (error.response?.data?.message) {
        return error.response.data.message;
      }
      return 'Произошла ошибка при сохранении';
    },

    showNotificationMessage(message, type = 'success') {
      this.notificationMessage = message;
      this.notificationType = type;
      this.showNotification = true;

      // Для ошибок не auto-close, только по кнопке
      this.notificationTimeout = type === 'error' ? -1 : 6000;
    },

    async saveProject() {
      return new Promise((resolve, reject) => {
        this.$refs.projectComponent.save()
            .then(response => {
              console.log(response)
              this.projectDetail = response.data.data.data;
              this.$refs.projectComponent.project.pk = response.data.data.data.pk;
              resolve(response);
            })
            .catch(error => {
              console.error('Ошибка сохранения проекта:', error);
              reject(error);
            });
      });
    },

    async saveContractor() {
      return new Promise((resolve, reject) => {
        if (this.contractor.type === 'PhysicalPerson') {
          this.$refs.personComponent.save()
              .then(response => {
                this.contractor = response;
                resolve(response);
              })
              .catch(error => {
                console.error('Ошибка сохранения физ. лица:', error);
                reject(error);
              });
        } else {
          this.$refs.legalEntityComponent.save()
              .then(response => {
                this.contractor = response;
                resolve(response);
              })
              .catch(error => {
                console.error('Ошибка сохранения юр. лица:', error);
                reject(error);
              });
        }
      });
    },

    changeContractor(item) {
      if (item) {
        this.contractor = item;
      }
    },

    selectFile() {
      this.$refs.uploader.click();
    },

    handleFileUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.readYamlFile(file);
      }
      e.target.value = '';
    },

    readYamlFile(file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          this.yaml = jsYaml.load(event.target.result)
        } catch (error) {
          console.error('Ошибка парсинга YAML:', error);
          this.showNotificationMessage('Ошибка при чтении YAML файла', 'error');
        }
      }

      reader.onerror = (error) => {
        console.error('Ошибка при чтении файла:', error);
        this.showNotificationMessage('Ошибка при чтении файла', 'error');
      };

      reader.readAsText(file);
    }
  },
  async created() {
    try {
      const projectPK = this.$route.params['pk'];
      const data = await this.$store.dispatch('getProjectDetail', projectPK);
      this.projectDetail = data;

      if (data.legal_contractor) {
        this.contractor = data.legal_contractor;
      } else if (data.physical_contractor) {
        this.contractor = data.physical_contractor;
      }
    } catch (error) {
      console.error('Ошибка загрузки данных проекта:', error);
      this.showNotificationMessage('Ошибка загрузки данных проекта', 'error');
    }
  }
}
</script>

<style scoped>
.questionnaire {
  transition: height 0.3s ease;
}

</style>