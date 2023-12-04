<template>
  <v-container fluid>
    <v-card flat height="89vh">
      <v-row justify="space-around" class="align-baseline" justify-lg="space-around">
        <v-col md="auto">
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
                  :class="{archive: item.isArchive}"
              >
                <td>
                  <v-checkbox dense v-model="selectedProject" :value="item"
                              hide-details/>
                </td>
                <td @click="showDetail(item.pk)">{{ item.name }}</td>
                <td width="100">{{ item.code }}</td>
                <td>{{ item.case_number }}</td>
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
              </tr>
            </template>
          </v-data-table>
        </v-col>
        <v-col :cols="display.right" class="left-window">
          <ProjectCreate v-if="showProjectCreate || showProjectDetail" @close="closeCreate"
                         :rectifiedProject="rectifiedProject"
          ></ProjectCreate>
        </v-col>
      </v-row>
    </v-card>
    <addToArchive></addToArchive>
  </v-container>
</template>

<script>
import methods from '../../../mixin/projectColor'
import filter from '../../../mixin/filter'
import ProjectCreate from "./ProjectCreate";
import addToArchive from "./modal/addToArchive";

import {mapGetters} from 'vuex'

export default {
  name: "Project",
  data() {
    return {
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
    filteredProject: function () {
      const filtered = this.projectList.filter(item => {
        if (this.filter.isArchive && !item.isArchive) return item
        else if (!this.filter.isArchive) return item
      }).filter(item => {
        if (this.filter.direction && JSON.stringify(item.direction.direction) === JSON.stringify(this.filter.direction.direction)) {
          return item
        } else if (!this.filter.direction) return item
      }).filter(item => {
        if (this.filter.participant && this.filter.participant.pk === item.participant.pk) {
          return item
        } else if (!this.filter.participant) return item
      })
      return filtered
    }
    ,
    ...
        mapGetters({
          projectList: 'projectListData',
          participatorList: 'participatorList',
          directionsList: 'directionsListData'
        })


  }
  ,
  methods: {
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
  components:
      {
        ProjectCreate,
        addToArchive,
      }
  ,
  created() {
    this.$store.dispatch('getProjectList').then(() => {
      this.$store.dispatch('getDirectionsList').then(() => {
        this.loading = false
        this.selectedProject = []
      })

    })
  }
}
</script>

<style scoped>
td {
  font-size: 12px !important;
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
