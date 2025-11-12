<template>
  <v-dialog v-model="show" max-width="900" persistent>
    <v-card>
      <v-card-title class="headline">
        Выбор кредиторов и проектов для отчета
      </v-card-title>

      <v-card-text style="max-height: 80vh; min-height: 70vh;  overflow-y: auto;">
        <v-expansion-panels v-model="expandedPanels">
          <v-expansion-panel v-for="creditor in internalCreditorsData" :key="creditor.creditor_id">
            <v-expansion-panel-header>
              <div class="header-content">
                <div class="checkbox-col">
                  <v-checkbox
                      :value="isCreditorFullySelected(creditor)"
                      :indeterminate="isCreditorPartiallySelected(creditor)"
                      @click.stop="toggleCreditorSelection(creditor, $event)"
                      hide-details
                  ></v-checkbox>
                </div>

                <div class="text-col">
                  <div class="creditor-name" :title="creditor.creditor_name">
                    {{ creditor.creditor_name }}
                  </div>
                  <div class="creditor-info">
                    Проектов: {{ creditor.projects.length }} | Выбрано: {{ getSelectedProjectsCount(creditor) }}
                  </div>
                </div>

                <div class="chip-col">
                  <v-chip small :color="isCreditorFullySelected(creditor) ? 'primary' : 'grey'" text-color="white">
                    {{ creditor.creditor_type === 'legal' ? 'Юр. лицо' : 'Физ. лицо' }}
                  </v-chip>
                </div>
              </div>
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <v-list dense>
                <v-list-item v-for="project in creditor.projects" :key="project.project_id">
                  <v-list-item-action class="my-0 mr-3">
                    <v-checkbox
                        :input-value="project.selected"
                        @change="toggleProjectSelection(project, creditor)"
                        hide-details
                    ></v-checkbox>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title>Дело №: {{ project.case_number }}</v-list-item-title>
                    <v-list-item-subtitle>ID проекта: {{ project.project_id }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <div v-if="internalCreditorsData.length === 0" class="text-center py-8">
          <v-icon large color="grey lighten-1">mdi-information-outline</v-icon>
          <div class="subtitle-1 grey--text mt-2">Нет данных для отображения</div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="cancel">Отмена</v-btn>
        <v-btn
            :loading="loading"
            color="primary"
            @click="confirmSelection"
            :disabled="selectedProjectsCount === 0"
        >
          Сформировать отчет ({{ selectedProjectsCount }})
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import customConst from "@/const/customConst";

export default {
  name: "CreditorSelectionModal",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    creditorsData: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    loading:false,
    expandedPanels: [],
    internalCreditorsData: []
  }),
  computed: {
    selectedProjectsCount() {
      return this.internalCreditorsData.reduce((total, creditor) => {
        return total + creditor.projects.filter(project => project.selected).length;
      }, 0);
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.initializeData();
      }
    },
    creditorsData: {
      handler(newData) {
        if (this.show) {
          this.initializeData();
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    initializeData() {
      if (this.creditorsData.length === 0) {
        this.internalCreditorsData = [];
        return;
      }

      // Создаем глубокую копию с сохранением состояния выбора
      const newData = JSON.parse(JSON.stringify(this.creditorsData));

      // Сохраняем состояния выбора если данные уже были инициализированы
      if (this.internalCreditorsData.length > 0) {
        const oldSelectionMap = this.createSelectionMap();

        newData.forEach(creditor => {
          creditor.projects.forEach(project => {
            const key = `${creditor.creditor_id}_${project.project_id}`;
            project.selected = oldSelectionMap[key] || false;
          });
        });
      } else {
        // Первая инициализация - все не выбрано
        newData.forEach(creditor => {
          creditor.projects.forEach(project => {
            project.selected = false;
          });
        });
      }

      this.internalCreditorsData = newData;
      this.expandedPanels = this.internalCreditorsData.map((_, index) => index);
    },

    createSelectionMap() {
      const map = {};
      this.internalCreditorsData.forEach(creditor => {
        creditor.projects.forEach(project => {
          const key = `${creditor.creditor_id}_${project.project_id}`;
          map[key] = project.selected;
        });
      });
      return map;
    },

    isCreditorFullySelected(creditor) {
      return creditor.projects.length > 0 &&
          creditor.projects.every(project => project.selected);
    },

    isCreditorPartiallySelected(creditor) {
      const selectedCount = creditor.projects.filter(project => project.selected).length;
      return selectedCount > 0 && selectedCount < creditor.projects.length;
    },

    toggleCreditorSelection(creditor, event) {
      event.preventDefault();
      event.stopPropagation();

      const shouldSelect = !this.isCreditorFullySelected(creditor);
      creditor.projects.forEach(project => {
        this.$set(project, 'selected', shouldSelect);
      });
    },

    toggleProjectSelection(project, creditor) {
      this.$set(project, 'selected', !project.selected);
    },

    getSelectedProjectsCount(creditor) {
      return creditor.projects.filter(project => project.selected).length;
    },

    confirmSelection() {
      const groupedProjects = {};

      this.internalCreditorsData.forEach(creditor => {
        creditor.projects.forEach(project => {
          if (project.selected) {
            const creditorId = creditor.creditor_id;

            // Создаем запись для кредитора, если её нет
            if (!groupedProjects[creditorId]) {
              groupedProjects[creditorId] = {
                creditor_id: creditorId,
                creditor_name: creditor.creditor_name,
                creditor_type: creditor.creditor_type,
                projects: [] // Проекты этого кредитора
              };
            }

            // Добавляем проект в группу
            groupedProjects[creditorId].projects.push({
              project_id: project.project_id,
              case_number: project.case_number,
              project_name: project.project_name,
              report: project.doc,
            });
          }
        });
      });
      const result = Object.values(groupedProjects);
      this.loading = true
      this.$http({
        method: "POST",
        url: customConst.REFERENCE_BOOK_API + "creditors-claims/generate-quarter-report/",
        data: result,
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(() => {
        this.$emit('confirm', result);
        this.$emit('update:show', false);
        this.loading = false
      }).finally(()=>{
        this.loading = true
      })
    },

    cancel() {
      this.$emit('update:show', false);
      this.$emit('cancel');
    }
  }
}
</script>

<style scoped>
.header-content {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 48px;
}

.checkbox-col {
  display: flex;
  align-items: center;
}

.text-col {
  min-width: 0;
  overflow: hidden;
}

.creditor-name {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.creditor-info {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.chip-col {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.v-expansion-panel-header {
  min-height: 64px;
  padding: 0 16px;
}

.v-list-item {
  border-left: 3px solid transparent;
  transition: border-color 0.3s ease;
}

.v-list-item:hover {
  border-left-color: #2196f3;
  background-color: #f5f5f5;
}

/* Убедимся, что контент не выходит за границы */
.v-expansion-panel-header__content {
  margin: 0;
  width: 100%;
}

/* Для очень длинных имен - дополнительная защита */
@media (max-width: 600px) {
  .header-content {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: 4px 12px;
  }

  .chip-col {
    grid-column: 2;
    grid-row: 2;
    justify-content: flex-start;
  }
}
</style>