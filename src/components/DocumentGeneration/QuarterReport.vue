<template>
  <v-container>
    <v-card height="90vh">
      <v-card-title class="justify-center">Генерация квартального отчета</v-card-title>
      <v-card-actions>
        <v-row>
          <v-col cols="7">
            <v-autocomplete
                dense
                outlined
                label="Квартал и год"
                :items="quarterYearOptions"
                item-text="text"
                item-value="value"
                v-model="selectedQuarterYear"
                return-object
            ></v-autocomplete>
          </v-col>
          <v-col cols="auto">
            <v-btn small color="success" @click="setPeriod(selectedQuarterYear)">Применить</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
      <v-card-text style="height: 77%">
        <div class="mt-2 mb-2">
          <v-list-item
              v-for="(item, i) in projectList"
              :key="i"
              dense
              :class="['project-item', {
              'selected': isProjectSelected(item.id),
              'disabled': !item['quarter_report']
            }]"
          >
            <v-list-item-action>
              <v-checkbox
                  :input-value="isProjectSelected(item.id)"
                  @change="toggleProject(item.id, item)"
                  :disabled="!item['quarter_report']"
                  :color="item['quarter_report'] ? 'primary' : 'grey'"
              ></v-checkbox>
            </v-list-item-action>
            <v-list-item-content
                @click="toggleProject(item.id, item)"
                :class="setExist(item)"
            >
              <div class="d-flex align-center">
                <span>{{ item.name }} - {{ item.case_number }}</span>
              </div>
              <div v-if="!item['quarter_report']" class="caption warning--text">
                Отчет не загружен
              </div>
            </v-list-item-content>
            <v-list-item-action class="ml-auto">
              <v-menu bottom left>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list dense>
                  <v-list-item dense>
                    <v-list-item-title>
                      <v-btn v-if="item['quarter_report']" text small @click.stop="openReplaceModal(item)">Заменить
                        отчет
                      </v-btn>
                      <v-btn v-else text small @click.stop="openAddModal(item)">Добавить отчет</v-btn>
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-list-item-action>
          </v-list-item>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="selectAll" small>
          {{ isAllSelected ? 'Снять выделение' : 'Выбрать все' }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="success" @click="generateReport" :disabled="projectId.length === 0">
          Сформировать отчет ({{ projectId.length }})
        </v-btn>
      </v-card-actions>
    </v-card>
    <CreditorSelectionModal
        :show="showCreditorModal"
        :creditors-data="creditorsData"
        @update:show="showCreditorModal = $event"
        @confirm="generateFinalReport"
    />

    <QuarterReportUploadModal
        :show="showUploadModal"
        :current-project="currentProject"
        :selected-quarter-year="selectedQuarterYear"
        :modal-type="modalType"
        @update:show="showUploadModal = $event"
        @saved="onReportSaved"
    />
    <ChangeFile></ChangeFile>
  </v-container>
</template>

<script>
import QuarterReportUploadModal from "@/components/CRM/PaperFlow/modal/QuarterReportUploadModal.vue";
import ChangeFile from "@/components/CRM/PaperFlow/modal/ChangeFile.vue";
import customConst from "@/const/customConst";
import CreditorSelectionModal from "@/components/DocumentGeneration/CreditorSelectionModal.vue";

export default {
  name: "QuarterReport",
  components: {CreditorSelectionModal, QuarterReportUploadModal, ChangeFile},
  data: () => ({
    projectList: [],
    selectedQuarterYear: null,
    quarterYearOptions: [],
    projectId: [], // ID выбранных проектов
    isAllSelected: false,
    showUploadModal: false,
    showCreditorModal: false,
    creditorsData: [],
    showViewModal: false,
    currentProject: null,
    currentReport: null,
    modalType: 'add' // 'add' или 'replace'
  }),
  computed: {
    // Вычисляемое свойство для проверки, все ли проекты выбраны
    allProjectIds() {
      return this.projectList.map(project => project.id);
    },
    // Только проекты с quarter_report для выбора "всех"
    selectableProjectIds() {
      return this.projectList
          .filter(project => project.quarter_report)
          .map(project => project.id);
    },
  },
  filters: {
    projectInfo(item) {
      return `${item?.name} - ${item?.case_number}`
    }
  },
  methods: {
    // Проверяем, выбран ли проект
    isProjectSelected(projectId) {
      return this.projectId.includes(projectId);
    },

    onReportSaved() {
      // Обновляем список проектов
      this.setPeriod(this.selectedQuarterYear);
    },
    openAddModal(project) {
      this.currentProject = project;
      this.modalType = 'add';
      this.showUploadModal = true;
    },
    openReplaceModal(item) {
      console.log(item)
      this.$emit('changeFile', item['quarter_report'])
    },
    setExist(item) {
      const classes = [];
      if (!item['quarter_report']) {
        classes.push('not-exist');
      }
      if (this.isProjectSelected(item.id)) {
        classes.push('selected-text');
      }
      return classes.join(' ');
    },
    generateQuarterYearOptions() {
      const currentYear = new Date().getFullYear();
      const years = [currentYear - 1, currentYear];
      const quarters = [1, 2, 3, 4];

      this.quarterYearOptions = [];

      years.forEach(year => {
        quarters.forEach(quarter => {
          this.quarterYearOptions.push({
            text: `${year} год, ${quarter} квартал`,
            value: `${year}-${quarter}`,
            year: year,
            quarter: quarter
          });
        });
      });
    },
    setPeriod(item) {
      if (!item) {
        this.$store.dispatch('showMessage', {type: 'error', text: 'Выберите период'});
        return;
      }

      const year = item.year;
      const quarter = item.quarter;
      let formData = new FormData()
      formData.append('year', year)
      formData.append('quarter', quarter)
      this.$store.dispatch('getProjectByQuarter', formData)
          .then(data => {
            this.projectList = [...data];
            this.projectId = []; // Сбрасываем выбор при смене периода
            this.isAllSelected = false;
          })
          .catch(error => {
            console.error('Ошибка загрузки проектов:', error);
            this.$store.dispatch('showMessage', {
              type: 'error',
              text: 'Ошибка загрузки проектов'
            });
          });
    },
    toggleProject(projectId, item) {
      // Если у проекта нет quarter_report, блокируем выбор
      if (item && !item.quarter_report) {
        this.$store.dispatch('showMessage', {
          type: 'warning',
          text: 'Нельзя выбрать проект без загруженного отчета'
        });
        return;
      }
      console.log(projectId, item)
      const index = this.projectId.indexOf(projectId);
      if (index > -1) {
        this.projectId.splice(index, 1);
      } else {
        this.projectId.push(projectId);
      }
      this.updateSelectAllState();
    },
    selectAll() {
      if (this.isAllSelected) {
        // Снимаем выделение со всех
        this.projectId = [];
        this.isAllSelected = false;
      } else {
        // Выбираем только проекты с quarter_report
        this.projectId = [...this.selectableProjectIds];
        this.isAllSelected = true;
      }
    },
    updateSelectAllState() {
      this.isAllSelected = this.projectId.length === this.selectableProjectIds.length && this.selectableProjectIds.length > 0;
    },
    generateReport() {
      let formData = new FormData()
      const reportData = this.projectList.filter(project =>
          this.projectId.includes(project.id)
      );

      console.log(reportData)
      this.projectId.forEach(obj => {
        formData.append('projects', Number(obj))
      })
      reportData.forEach(obj=>{
        formData.set(obj['id'], obj['quarter_report']['id'])
      })
      this.$http({
        method: "POST",
        url: customConst.REFERENCE_BOOK_API + "creditors-claims/prepare-report/",
        data: formData,
      }).then(res => {
        if (res.data.status === 'success') {
          this.creditorsData = res.data.data;
          this.showCreditorModal = true;
        } else {
          this.showMessage({type: 'error', text: 'Ошибка при подготовке отчета'});
        }
      }).catch(error => {
        console.error('Ошибка:', error);
        this.showMessage({type: 'error', text: 'Ошибка при подготовке отчета'});
      });
      console.log('Данные для отчета:', this.projectId);
    },
    generateFinalReport(selectedProjects) {
      // Здесь отправляем выбранные проекты на генерацию отчета
      console.log('Выбранные проекты для отчета:', selectedProjects);
    }
  },
  watch: {
    // Следим за изменениями projectList и обновляем состояние выбора
    projectList: {
      handler() {
        this.updateSelectAllState();
      },
      deep: true
    }
  },
  created() {
    this.generateQuarterYearOptions();
    // Устанавливаем текущий квартал и год по умолчанию
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentQuarter = Math.floor((currentDate.getMonth() + 3) / 3);

    const defaultOption = this.quarterYearOptions.find(option =>
        option.year === currentYear && option.quarter === currentQuarter
    );

    if (defaultOption) {
      this.selectedQuarterYear = defaultOption;
    }
  }
}
</script>

<style scoped>
.v-list-item-content {
  cursor: pointer;
}

.caption {
  font-size: 0.75rem;
  margin-top: 2px;
}

.not-exist {
  color: #b1b1b1;
}

.v-list-item {
  border-bottom: 1px solid #eee;
  padding: 8px 0;
  transition: all 0.3s ease;
}

/* Стили для выбранных элементов */
.project-item.selected {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding-left: 12px;
}

.selected-text {
  font-weight: 600;
  color: #1976d2;
}

/* Стили для отключенных элементов */
.project-item.disabled {
  opacity: 0.6;
  background-color: #f5f5f5;
}

.project-item.disabled .v-list-item-content {
  cursor: not-allowed;
}

.project-item.disabled .v-list-item-action {
  pointer-events: none;
}

.warning--text {
  color: #ff9800 !important;
}

/* Убираем стандартные отступы Vuetify для лучшего визуального эффекта */
.v-list-item__action {
  margin-right: 8px;
}
</style>