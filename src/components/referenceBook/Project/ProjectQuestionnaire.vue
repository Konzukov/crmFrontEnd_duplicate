<template>
  <v-card flat class="questionnaire mt-4" :style="collapsed? 'height: 63vh': 'height: 45vh'">
    <v-row justify="start">
      <v-col cols="6" :style="collapsed? 'height: 73vh': 'height: 45vh'">
        <v-card-text class="physical-person" v-if="contractor">
          <PhysicalPersonCreate :yaml="yaml" v-if="contractor.type==='PhysicalPerson'" :rectified-physical-person="contractor"
                                :callSave="callSave"
                                :show-action-button="false"></PhysicalPersonCreate>
          <LegalEntityForm v-else :legalEntityData.sync="contractor"
                           :callSave="callSave"
                           :show-action-button="false"></LegalEntityForm>
        </v-card-text>
      </v-col>
      <input class="d-none" ref="uploader" type="file" @change="handleFileUpload"/>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn large icon fixed class="yaml-data" color="primary" v-bind="attrs"
                 v-on="on" @click="selectFile">
            <v-icon>mdi-file-arrow-left-right</v-icon>
          </v-btn>
        </template>
        <span style="font-size: 12px">Загрузить данные из yaml</span>
      </v-tooltip>
      <v-col cols="6" :style="collapsed? 'height: 73vh': 'height: 45vh'">
        <v-card-text>
          <ProjectCreate :rectified-project="projectDetail" :yaml="yaml" :callSave="callSave" @changeContractor="changeContractor"
                         :show-action-button="false"></ProjectCreate>
        </v-card-text>
      </v-col>
    </v-row>
    <v-card-actions>
      <v-row justify="center">
        <v-col cols="auto" class="ml-2">
          <v-btn color="error">Отмена</v-btn>
        </v-col>
        <v-col cols="auto" class="mr-2">
          <v-btn color="success" @click="save">Сохранить</v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script>
import PhysicalPersonCreate from "@/components/referenceBook/PhysicalPerson/PhysicalPersonCreate";
import ProjectCreate from "@/components/referenceBook/Project/ProjectCreate";
import LegalEntityForm from "@/components/referenceBook/LegalEntity/LelagEntityForm.vue";
import jsYaml from "js-yaml";


export default {
  props: ['collapsed'],
  name: "ProjectQuestionnaire",
  data: () => ({
    projectDetail: null,
    contractor: null,
    callSave: false,
    yaml: null,
  }),
  methods: {
    save() {
      this.callSave = true
      setTimeout(() => {
        this.callSave = false
      }, 500)
    },
    changeContractor(item) {
      if (item) {
        if (item.type === "LegalEntity") {
          this.contractor = this.$store.getters.legalEntityData.filter(obj => {
            return obj.pk === item['pk']
          })[0]
        } else if (item.type === "PhysicalPerson") {
          this.contractor = this.$store.getters.physicalPersonData.filter(obj => {
            return obj.pk === item['pk']
          })[0]
        }
      }

    },
    selectFile() {
      this.$refs.uploader.click()
    },
    handleFileUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.readYamlFile(file);
      }
      e.target.value = ''
    },
    readYamlFile(file) {
      const reader = new FileReader();

      // Добавляем проверку начала чтения
      reader.onloadstart = () => {
        console.log('Начало чтения файла');
      }

      reader.onload = (event) => {
        console.log('Файл успешно прочитан');
        const yamlContent = event.target.result;
        this.yaml = jsYaml.load(yamlContent)
        console.log(this.yaml)
      }

      // Добавляем обработку ошибок
      reader.onerror = (error) => {
        console.error('Ошибка при чтении файла:', error);
      }
      reader.readAsText(file);
    }
  },
  async created() {
    this.projectPK = this.$route.params['pk']
    await this.$store.dispatch('getProjectDetail', this.$route.params['pk']).then(async (data) => {
      console.log(data)
      this.projectDetail = data
      if (data.legal_contractor) {
        this.contractor = this.$store.getters.legalEntityData.filter(obj => {
          return obj.pk === data.legal_contractor
        })[0]
      } else if (data.physical_contractor) {
        this.contractor = this.$store.getters.physicalPersonData.filter(obj => {
          return obj.pk === data.physical_contractor
        })[0]
      }
    })
  },
  components: {
    LegalEntityForm,
    PhysicalPersonCreate,
    ProjectCreate
  }
}
</script>

<style scoped>
* {
  font: 62.5%/1.4 arial, sans-serif;
}

.yaml-data {
  right: 48%;
  top: 26%;
}

.questionnaire {
  background-color: white !important;
  text-shadow: 0 0 #ffffff !important;
}

.v-card__text {
  height: 100%;
}
</style>