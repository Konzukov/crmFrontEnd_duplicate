<template>
  <v-container fluid style="padding: 0; margin: 0;">
    <v-card v-if="display"
            width="100%"
            class="mx-auto ml-15"
    >
      <v-toolbar color="primary" dark>
        <v-toolbar-title>
          <span v-text="loading ? 'Загрузка...' : taskDetail.name "></span>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn @click="close()" icon>
          <v-icon>mdi-close-circle</v-icon>
        </v-btn>
      </v-toolbar>
      <v-sheet
          max-height="70vh"
          min-height="70vh"
          class="task"
      >
        <v-skeleton-loader
            v-if="loading"
            max-height="75vh"
            min-height="75vh"
            boilerplate
            elevation="4"
            :loading="loading"
            type="article, actions"
        ></v-skeleton-loader>
        <v-card-text v-else>
          <v-form ref="taskDetailForm" lazy-validation>
            <v-row justify="start">
              <v-col md="4" xl="4" lg="4" sm="4">
                <v-text-field v-model="form.date"
                              label="Дата создание"
                              outlined
                              disabled
                ></v-text-field>
              </v-col>
              <v-col md="4" xl="4" lg="4" sm="4">
                <v-select v-model="form.author"
                          label="Автор"
                          :items="systemUser"
                          item-value="uuid"
                          item-text="fullName"
                          return-object
                          outlined
                          disabled
                ></v-select>
              </v-col>
              <v-col md="4" xl="4" lg="4" sm="4">
                <v-select v-model="form.status"
                          label="Статус"
                          :items="taskStatusList"
                          item-text="name"
                          item-value="pk"
                          outlined
                ></v-select>
              </v-col>
            </v-row>
            <v-row justify="start">
              <v-col md="6" xl="6" lg="6" sm="8" class="ml-3">
                <AddTag ref="tagsList" :existTags="existTags"></AddTag>
              </v-col>
              <v-col md="4" xl="4" lg="4" sm="4">
                <v-text-field v-model="form.date_to"
                              label="Срок выполнения"
                              type="date"
                              outlined
                ></v-text-field>
              </v-col>

            </v-row>
            <v-row justify="center">
              <v-col md="11" xl="11" lg="11" sm="11">
                <v-textarea v-model="form.description" outlined label="Описание" rows="8">
                </v-textarea>
                <v-textarea v-if="form.solution" v-model="form.solution" outlined label="Описание" rows="8">
                </v-textarea>
              </v-col>
            </v-row>
          </v-form>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header>Активность</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-tabs>
                  <v-tab>
                    <v-icon left>
                      mdi-message
                    </v-icon>
                    Комментарии
                  </v-tab>
                  <v-tab-item>
                    <CommentDisplay :task.sync="form.pk" max-height="auto" min-height="10vh"></CommentDisplay>
                    <CommentCreate :task.sync="form.pk"></CommentCreate>
                  </v-tab-item>
                </v-tabs>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
          <v-card-actions>
            <v-col md="3" sm="3">
              <v-btn color="error" @click="close">Отмена</v-btn>
            </v-col>
            <v-col md="4" sm="3">
              <v-btn color="success" @click="save()">Сохранить</v-btn>
            </v-col>
            <v-col md="4" sm="3">
              <v-btn color="primary" @click="taskDone()">
                Закрыть задачу
              </v-btn>
            </v-col>
          </v-card-actions>
        </v-card-text>

      </v-sheet>
    </v-card>
    <eventTaskClose @addSolution="taskComplete"></eventTaskClose>
  </v-container>

</template>

<script>
import {mapActions, mapGetters} from 'vuex'
import AddTag from "../Tagging/AddTag";
import moment from "moment";
import CommentCreate from "../Comment/CommentCreate";
import CommentDisplay from "../Comment/CommentDisplay";
import eventTaskClose from "../CRM/Event/modal/eventTaskClose";

export default {
  props: {
    pk: {
      default: null,
    },
  },
  name: "DashboardTaskDetail",
  data() {
    return {
      loading: true,
      display: false,
      form: {},
      error: {},
      taskStatus: {
        display: false,
        name: '',
      },
      existTags: null
    }
  },
  methods: {
    ...mapActions([
      'getTaskDetail',
      'getTaskStatusList',
      'getProjectList',
      'allSystemUser'
    ]),
    newTaskStatus() {
      if (this.taskStatus.display) {
        this.taskStatus.display = false
      } else {
        this.taskStatus.display = true
      }
    },
    hasError(field) {
      if (field) {
        return true
      }
      return false
    },
    getTaskData(pk) {
      this.display = true
      this.loading = true
      this.getTaskDetail(pk).then(() => {
        this.form = Object.assign({}, this.taskDetail)
        this.existTags = this.taskDetail.tags
        this.loading = false
      })
    },
    taskDone() {
      console.log(this.taskDetail)
      let preComplete = {
        name: `Задача ${this.taskDetail.name} - выполнена`,
        project: [this.taskDetail.project],
        category: { "pk": 3, "name": "Направленное событие" },
        source: this.taskDetail.executor,
        type: {"pk": 2, "name": "Непосредственное участие"},
      }
      this.$emit('closeTask', {task: null, preComplete})
    },
    taskComplete(solution) {
      this.taskStatusList.map(status => {
        if (status.name === 'Выполнена') {
          this.form.status = status
        }
        this.form.solution = solution

      })
    },
    save() {
      let formData = new FormData
      let tagsList = this.$refs.tagsList.selected
      let pk = this.form.pk
      Object.keys(this.form).forEach(key => {
        if (this.form[key]) {
          if (typeof this.form[key] === 'object') {
            if (key === 'event') {
              this.form[key].forEach(obj => {
                formData.append(key, obj.pk)
              })
            } else {
              if (key !== 'tags') {
                formData.append(key, this.form[key].pk)
              }
            }
          } else if (key === 'date_from' || key === 'date_to') {
            formData.append(key, moment(this.form[key]).format('YYYY-MM-DD'))
          } else {
            formData.append(key, this.form[key])
          }
        }
      })
      formData.delete('tags')
      if (tagsList) {
        tagsList.forEach(obj => {
          if (obj) {
            formData.append('tags', obj.pk.toString())
          }
        })
      }
      this.$store.dispatch('editTask', {formData, pk}).then(() => {
        console.log('Save done')
      }).catch((error) => {
        if (error) {
          this.error = error.response.data.errors
        }
      })
    },
    close() {
      Object.assign(this.$data, this.$options.data())
    }
  },
  computed: {
    ...mapGetters({
      taskDetail: 'taskDetailData',
      projectList: 'projectListData',
      taskStatusList: 'taskStatusListData',
      systemUser: 'allSystemUsersData'
    })
  },
  watch: {
    pk(val) {
      console.log('watch')
      this.getTaskData(val)
    }
  },
  created() {
    this.allSystemUser()
    this.getTaskStatusList()
    this.getProjectList()
    this.getTaskData(this.pk)
  },
  components: {
    AddTag,
    CommentCreate,
    CommentDisplay,
    eventTaskClose
  }
}
</script>

<style scoped>
.v-sheet.task {
  overflow-y: scroll;
}

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
</style>