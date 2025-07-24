<template>
  <v-container fluid>
    <v-card flat height="89vh">
      <v-row justify="space-around" class="align-baseline" justify-lg="space-around">
        <v-col md="3">
          <v-text-field dense outlined label="Поиск" single-line v-model="filter.search"></v-text-field>
        </v-col>
        <v-col md="auto">
          <v-autocomplete
              dense
              :items="directionsList"
              item-value="pk"
              outlined
              v-model="filter.direction"
              return-object
              clearable
              item-text="direction.name"
              label="Направления"
          >
          </v-autocomplete>
        </v-col>
        <v-col md="3">
          <v-switch
              dense
              v-model="filter.isArchive"
              label="Скрывать архивные"
          ></v-switch>
        </v-col>
        <v-col md="auto" offset="1">
          <v-btn
              icon
              large
              outlined
              color="primary"
              @click="toggleFilter"
          >
            <v-icon>
              mdi-tune
            </v-icon>
          </v-btn>
        </v-col>
        <v-col md="auto">
          <v-btn
              class="showModal"
              outlined
              large
              icon
              color="success"
              @click="showCreate"
          >
            <v-icon>mdi-pail-plus-outline</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row justify="start" class="ma-1">
        <v-col :cols="display.left">
          <v-data-table
              v-if="grouping ==='byDefault'"
              class="overflow-visible"
              :items="filteredProject"
              multi-sort
              id="project-list"
              v-model="selectedProject"
              show-select
              :search="filter.search"
              item-key="pk"
              :headers="headers"
          >
            <template v-slot:body="{ items }">
              <tbody>
              <tr v-for="item in items"
                  :key="item.pk"
                  :class="[{archive: item.isArchive, },
                  existAct(item.act)
                  ]"
              >
                <td>
                  <v-checkbox dense v-model="selectedProject" :value="item"
                              hide-details/>
                </td>
                <td @click="showDetail(item.pk)">{{ item.name }}</td>
                <td width="100">{{ item.code }}</td>
                <td>{{ item.case_number }} <br>
                  <span style="font-size: 10px; color: #00a6ee">{{ item.procedure | getProcedure }}</span>
                </td>
                <td>
                  <template v-if="item.act">{{ item.act | filterDate }}</template>
                </td>
                <td>{{ item.responsible }}</td>
                <td v-if="item.judge">{{ item.judge.full_name }}</td>
                <td v-else></td>
                <td>
                  <v-menu
                      bottom
                      left
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                          icon
                          v-bind="attrs"
                          v-on="on"
                      >
                        <v-icon small>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item>
                        <v-list-item-title>
                          <v-btn class="mr-2" @click="editProject(item)">Редактировать
                          </v-btn>
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>
                          <v-btn class="mr-2" @click="addToArchive(item)">В архив
                          </v-btn>
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
              </tr>
              </tbody>
            </template>
            <template v-slot:footer>
              <tr>
                <td>
                  <export-excel
                      :data="selectedProject"
                      :fields="excelField"
                      type="xls"
                      name="project-export"
                      :before-finish="resetSelected"
                  >
                    <v-btn :disabled="selectedProject.length === 0">Выгрузить</v-btn>
                  </export-excel>
                </td>
                <td colspan="2"></td>
                <td>
                  <v-btn @click="getPreProjectReport">Выгрузить(До проекты)</v-btn>
                </td>
              </tr>
            </template>
          </v-data-table>
          <div v-else class="grouped-view">
            <v-expansion-panels multiple accordion v-model="panel">
              <v-expansion-panel v-for="(group, caseNumber) in groupedProjects" :key="caseNumber">
                <v-expansion-panel-header class="py-1" style="min-height: 36px">
                  <v-row align="center" class="ma-0">
                    <v-col cols="10" class="py-0">
                      <strong class="text-caption font-weight-bold">{{ caseNumber }}</strong>
                    </v-col>
                    <v-col cols="2" class="text-right py-0">
                      <v-chip x-small>{{ group.length }}</v-chip>
                    </v-col>
                  </v-row>
                </v-expansion-panel-header>
                <v-expansion-panel-content class="py-1">
                  <div class="grid-view">
                    <div class="grid-container">
                      <div class="grid-header">
                        <div>Код</div>
                        <div>Проект</div>
                        <div>Процедура</div>
                        <div>Дата решения</div>
                        <div>Ответственный</div>
                        <div>Действия</div>
                      </div>
                      <div class="grid-body">
                        <div
                            v-for="item in group"
                            :key="item.pk"
                            class="grid-row"
                            :class="[{archive: item.isArchive}, existAct(item.act)]"
                        >

                          <div @click="showDetail(item.pk)">{{ item.code }}</div>
                          <div @click="showDetail(item.pk)">{{ item.name }}</div>
                          <div @click="showDetail(item.pk)">{{ item.procedure | getProcedure }}</div>
                          <div @click="showDetail(item.pk)">
                            <template v-if="item.act">{{ item.act | filterDate }}</template>
                          </div>
                          <div @click="showDetail(item.pk)">{{ item.responsible }}</div>
                          <div class="actions">
                            <v-btn icon x-small @click.stop="editProject(item)">
                              <v-icon x-small>mdi-pencil</v-icon>
                            </v-btn>
                            <v-btn icon x-small @click.stop="addToArchive(item)">
                              <v-icon x-small>mdi-archive</v-icon>
                            </v-btn>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-col>
        <v-col :cols="display.right" class="left-window">
          <ProjectCreate v-if="showProjectCreate || showProjectDetail" @close="closeCreate"
                         :rectifiedProject="rectifiedProject"
          ></ProjectCreate>
        </v-col>
      </v-row>
    </v-card>
    <addToArchive></addToArchive>
    <v-dialog v-model="showFilter" width="450px" class="filter">
      <v-card height="300px">
        <v-toolbar dense>
          <v-toolbar-title>Отображение</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="showFilter=false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="mt-5" style="height: 60%">
          <!-- Изменена метка на "По номеру дела" -->
          <v-radio-group v-model="grouping">
            <v-radio
                label="По номеру дела"
                value="byNumber"
            ></v-radio>
            <v-radio
                label="По умолчанию"
                value="byDefault"
            ></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-row justify="center">
            <v-btn text color="error">Отмена</v-btn>
            <v-btn text color="success" @click="applyFilter">Применить</v-btn>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import methods from '../../../mixin/projectColor'
import filter from '../../../mixin/filter'
import ProjectCreate from "./ProjectCreate";
import addToArchive from "./modal/addToArchive";
import {mapGetters} from 'vuex'
import {ProcedureType} from "@/const/dataTypes";
import {saveAs} from 'file-saver'
import moment from "moment/moment";

export default {
  name: "Project",
  data() {
    return {
      panel: [],
      showFilter: false,
      grouping: 'byDefault',
      sortBy: [],
      sortDesc: [],
      display: {
        left: 12,
        right: 0
      },
      loading: true,
      rectifiedProject: null,
      selectedProject: [],
      showProjectCreate: false,
      showProjectDetail: false,
      filter: {
        isArchive: true,
        participant: '',
        search: '',
        direction: ''
      },
      headers: [
        {text: 'Проект', value: 'name'},
        {text: 'Код', value: 'code'},
        {text: 'Номер дела', value: 'case_number'},
        {text: 'Дата решения/заседания', value: 'act.heading_date'},
        {text: 'Ответственный', value: 'responsible'},
        {text: 'Судья', value: 'judge'},
        {text: 'Действия', value: 'actions', sortable: false},
      ],
      excelField: {
        'Проект': 'name',
        'Код': {
          field: 'code', callback: (val) => {
            return ' ' + val + ' '
          }
        },
        'Номер дела': {
          field: 'case_number',
        },
        'Ответственный': {
          field: 'responsible',
        },
        'Представитель': {
          field: 'agent'
        },
        // 'Акт': {
        //   field: 'act'
        // },
        'Судья': {
          field: 'judge.full_name',
        },
        'Архивный': {
          field: 'isArchive',
          callback: (value) => {
            return value ? 'В архиве' : 'Активный'
          }
        },
        'Дата закрытия': 'terminationDate'
      }
    }
  },
  computed: {
    filteredProject() {
      const searchTerm = this.filter.search ? this.filter.search.toLowerCase() : '';

      return this.projectList.filter(item => {
        // Фильтр по архиву
        if (this.filter.isArchive && item.isArchive) return false;

        // Фильтр по направлению
        if (this.filter.direction && item.direction?.pk !== this.filter.direction.pk) {
          return false;
        }

        // Фильтр по поиску
        if (searchTerm) {
          const matchesSearch = [
            item.name,
            item.code,
            item.case_number,
            item.responsible
          ].some(value =>
              value && value.toString().toLowerCase().includes(searchTerm)
          );

          if (!matchesSearch) return false;
        }

        return true;
      });
    },
    groupedProjects() {
      const groups = {};
      this.filteredProject.forEach(project => {
        const key = project.case_number || 'Без номера дела';
        groups[key] = groups[key] || [];
        groups[key].push(project);
      });
      return groups;
    },
    ...
        mapGetters({
          projectList: 'projectListData',
          participatorList: 'participatorList',
          directionsList: 'directionsListData'
        })


  },
  filters: {
    getProcedure(item) {
      const legal = ProcedureType.Legal.find(obj => obj.value === item);
      const physical = ProcedureType.Physical.find(obj => obj.value === item);
      return physical?.text || legal?.text || '';
    },
    filterDate(item) {
      return item?.heading_date ? moment(item.heading_date).format('DD.MM.YYYY') : ''
    }
  },
  methods: {
    applyFilter() {
      this.showFilter = false
      localStorage.setItem('grouping', this.grouping)
    },
    existAct(item) {
      if (!item || item.act) return '';

      const now = moment();
      const date = moment(item.heading_date);
      return date.isAfter(now) ? 'headingDate' : 'expiredDate';
    },
    getPreProjectReport() {
      this.$store.dispatch('downloadPreProjectReport').then(res => {
        saveAs(res.data, 'preProject-report.xlsx')
      })
    },
    resetSelected() {
      this.selectedProject = []
    },
    addNewProject() {
      this.$emit('newProject')
    },
    editProject(item) {
      this.rectifiedProject = null
      this.showProjectDetail = false
      this.showProjectCreate = false
      setTimeout(() => {
        this.rectifiedProject = item
        this.showProjectDetail = true
        this.display.left = 6
        this.display.right = 6
      }, 500)

    },
    addToArchive(item) {
      this.$emit('addToArchive', item)
    },
    showDetail(pk) {
      this.$router.push({name: 'project-detail', params: {pk}})
    },
    toggleFilter() {
      this.showFilter = true
    },
    showCreate() {
      this.rectifiedProject = null
      this.showProjectDetail = false
      this.showProjectCreate = false
      setTimeout(() => {
        this.showProjectCreate = true
        this.display.left = 6
        this.display.right = 6
      }, 500)

    },
    closeCreate() {
      this.display.left = 12
      this.display.right = 0
      this.rectifiedProject = null
      this.showProjectCreate = false
      this.showProjectDetail = false
    }
  },
  mixins: [methods, filter],
  watch: {
    groupedProjects: {
      deep: true,
      handler(newVal) {
        this.panel = Object.keys(newVal).map((_, index) => index);
      },
      immediate: true
    }
  },
  components: {
    ProjectCreate,
    addToArchive,
  }
  ,
  created() {
    if (localStorage.getItem('grouping') !== null) {
      this.grouping = localStorage.getItem('grouping');
    }
    this.$store.dispatch('getProjectList');
    this.$store.dispatch('getDirectionsList');
    // this.grouping.bySide = localStorage.getItem('bySide')
    // this.$store.dispatch('getProjectList').then(() => {
    //   this.$store.dispatch('getDirectionsList').then(() => {
    //     this.loading = false
    //     this.selectedProject = []
    //   })
    //
    // })
  },
}
</script>

<style scoped>
.grouped-view {
  max-height: 60vh;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 4px;
}

.grid-view {
  max-height: 200px;
  overflow-y: auto;
}

.grid-container {
  display: grid;
  grid-template-columns: 0.5fr 1fr 1.5fr 1fr 1fr 0.5fr;
  font-size: 12px;
}

.grid-header {
  display: contents;
}

.grid-header > div {
  padding: 4px 8px;
  font-weight: bold;
  background-color: #f5f5f5;
  position: sticky;
  top: 0;
  z-index: 1;
}

.grid-body {
  display: contents;
}

.grid-row {
  display: contents;
}

.grid-row > div {
  padding: 4px 8px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.grid-row > div.actions {
  cursor: default;
}

.grid-row.archive > div {
  color: rgba(0, 0, 0, 0.5);
  font-weight: 100;
}

.headingDate > div {
  color: #b76f00;
}

.expiredDate > div {
  color: #ee0000;
}

.v-expansion-panel {
  margin-bottom: 4px;
}

.v-expansion-panel-header {
  padding: 0 8px;
  min-height: 36px !important;
}

.text-caption {
  font-size: 12px !important;
  font-family: 'Roboto Condensed', sans-serif !important;
}

td {
  font-size: 12px !important;
  font-family: 'Roboto Condensed', sans-serif !important;
}

>>> .v-data-table__wrapper {
  height: 60vh;
  overflow-x: auto;
  overflow-y: scroll !important;
}

table > tbody > tr.archive {
  font-weight: 100;
  color: rgba(0, 0, 0, 0.5);
}

>>> .headingDate {
  color: #b76f00;
}

>>> .expiredDate {
  color: #ee0000;
}

table > tbody > tr {
  font-weight: 400;
}

>>> div.v-data-footer {
  justify-content: center;
}

.left-window {
  height: 70vh;
  overflow-y: scroll;
}
</style>
