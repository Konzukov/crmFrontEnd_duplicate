<template>
  <v-container fluid>
    <v-row class="mt-5">
      <div class="list-wrapper resizable">
        <v-card width="100%" class="mx-auto ">
          <v-app-bar
              scroll-target="#project-list"
              elevate-on-scroll
          >
            <v-toolbar-title>Список проектов</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-icon @click="filter.showFilter = !filter.showFilter">mdi-tune</v-icon>
          </v-app-bar>
          <template v-if="filter.showFilter">
            <v-row justify="center">
              <v-col md="10" sm="10">
                <v-form id="list-filter">
                  <v-text-field
                      dense
                      v-model="filter.search"
                      label="Поиск"
                  ></v-text-field>
                  <v-autocomplete
                      dense
                      :items="participatorList"
                      item-value="pk"
                      return-object
                      clearable
                      v-model="filter.participant"
                      item-text="participator.fullName"
                      label="Участник"
                  >
                  </v-autocomplete>
                  <v-autocomplete
                      dense
                      :items="directionsList"
                      item-value="pk"
                      v-model="filter.direction"
                      return-object
                      clearable
                      item-text="direction.name"
                      label="Направления"
                  >
                  </v-autocomplete>
                  <v-switch
                      dense
                      v-model="filter.isArchive"
                      label="Скрывать архивные"
                      class="pa-3"
                  ></v-switch>
                </v-form>
              </v-col>
            </v-row>
          </template>
          <v-sheet
              id="project-list"
              class="list"
              max-height="70vh">
            <v-list three-line nav dense>
              <v-divider></v-divider>
              <v-list-item-group
                  v-model="selectedProject"
                  color="primary"
              >
                <template v-for="project in filteredProject"
                          link>
                  <v-list-item :key="project.pk" :to="{name: 'project-detail', params: { pk: project.pk }}">
                    <v-list-item-content>
                      <v-list-item-title class="project-list-title ">
                        <span>Код: {{ project.code }}</span>
                        <span>Направление: {{ project.direction.direction.name }}</span>
                      </v-list-item-title>
                      <v-list-item-subtitle v-html="project.name"
                                            class="project-list-subtitle text--darken-3 text--black font-weight-bold"></v-list-item-subtitle>

                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list-item-group>
            </v-list>
          </v-sheet>
        </v-card>
        <div class="resize" @mousedown="startResize"></div>
      </div>
      <v-col>
        <router-view :prop-to-child="selectedProject"></router-view>
      </v-col>
    </v-row>
    <v-btn dark
           class="wizard-btn"
           absolute
           right
           fab color="success"
           :to="{name:'projectWizard'}">
      <v-icon>mdi-auto-fix</v-icon>
    </v-btn>
  </v-container>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'


export default {
  name: "ProjectNew",
  data: () => ({
    filter: {
      showFilter: false,
      participant: '',
      direction: '',
      search: '',
      isArchive: true
    },
    selectedProject: '',

  }),
  computed: {
    ...mapGetters({
      projectList: 'projectListData',
      participatorList: 'participatorList',
      directionsList: 'directionsListData'
    }),
    filteredProject() {
      return this.projectList.filter(item => {
        if (this.filter.isArchive && !item.isArchive) return item
        else if (!this.filter.isArchive) return item
      }).filter(item => item.name.toLowerCase().indexOf(this.filter.search.toLowerCase()) !== -1)
          .filter(item => {
            if (this.filter.participant && item.participant.pk === this.filter.participant.pk) {
              return item
            } else if (!this.filter.participant) return item
          }).filter(item => {
            if (this.filter.direction && item.direction.pk === this.filter.direction.pk) {
              return item
            } else if (!this.filter.direction) return item
          })
    }
  },
  methods: {
    ...mapActions([
      'getProjectList', 'getDirectionsList'
    ]),
    startResize(initEvent) {
      const resizableElement = initEvent.path.filter(elem => elem.classList && elem.classList.value.indexOf('resizable') !== -1)
      const resizer = initEvent.target
      resizer.addEventListener('mousedown', function (event) {
        event.preventDefault()
        window.addEventListener('mousemove', resize)
        window.addEventListener('mouseup', stopResize)
      })

      function resize(e) {
        resizableElement[0].style.width = e.pageX - resizableElement[0].getBoundingClientRect().left + 'px'
      }

      function stopResize() {
        window.removeEventListener('mousemove', resize)
      }
    }
  },
  created() {
    this.getProjectList().then(() => {
      this.getDirectionsList()
    })
  }
}
</script>

<style scoped>
.list-wrapper {
  width: 30%;
  position: relative !important;
}

div.resize {
  width: 7px;
  height: 100%;
  background-color: #0a5593;
  float: left;
  top: 2px;
  right: -8px;
  border-radius: 5%;
  position: absolute !important;
}

div.resize:hover {
  cursor: col-resize;
}

.project-list-title {
  display: flex;
  justify-content: space-between;
  color: #2727279c;
}

.project-list-subtitle {
  color: #000;
}

#list-filter > * {
  margin-bottom: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.v-sheet#project-list {
  overflow-y: scroll;
}

/* полоса прокрутки (скроллбар) */
::-webkit-scrollbar {
  width: 6px; /* ширина для вертикального скролла */
  background-color: #fff;
}

/* ползунок скроллбара */
::-webkit-scrollbar-thumb {
  background-color: #030e4e;
  border-radius: 9em;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #253861;
}

.v-btn.wizard-btn {
  right: 70px;
  bottom: -50px;
}
</style>