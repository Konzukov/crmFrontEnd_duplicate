<template>
  <v-dialog
      v-model="dialog"
      persistent
      no-click-animation
      fullscreen
      scrollable
      hide-overlay
      transition="dialog-bottom-transition"
  >
    <v-card tile>
      <v-card-title>
        <v-toolbar flat dark color="primary">
          <v-toolbar-title>Создание задачи</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
      </v-card-title>
      <v-row justify="space-between" dense>
        <v-col cols="6" class="mt-6 ma-4">
          <v-card height="100%" flat>
            <v-card-text class="task-form">
              <v-form ref="taskCreate" v-model="valid">
                <v-row justify="start">
                  <v-col cols="auto" class="mr-3">
                    <v-text-field class="required" disabled outlined dense label="Автор"
                                  v-model="task.author.fullName"></v-text-field>
                  </v-col>
                  <v-col cols="auto">
                    <v-text-field class="required" disabled outlined dense label="Дата создания"
                                  v-model="task.date"></v-text-field>
                  </v-col>
                </v-row>
                <v-row justify="start">
                  <v-text-field outlined dense label="Название задачи"
                                v-model="task.name"
                                :error="!!errors['name']"
                                :error-messages="errors['name']"
                  ></v-text-field>
                </v-row>
                <v-row justify="start">
                  <v-textarea class="required" outlined dense label="Описание задачи"
                              v-model="task.description"
                              :error="!!errors['description']"
                              :error-messages="errors['description']"
                              :rules="required"></v-textarea>
                </v-row>
                <v-expansion-panels focusable>
                  <v-expansion-panel>
                    <v-expansion-panel-header class="pr-5 pl-5 mb-4">Дополнительные поля</v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-row justify="start">
                        <v-col cols="auto" xs="12" class="mr-3">
                          <v-autocomplete outlined dense label="Проект"
                                          v-model="task.project"
                                          :error="!!errors['project']"
                                          :error-messages="errors['project']"
                                          :items="projectList" item-text="name"
                                          item-value="id"></v-autocomplete>
                        </v-col>
                        <v-col cols="auto" xs="6" class="mr-3">
                          <v-text-field outlined dense label="Дата начала"
                                        v-model="task.date_from"
                                        :error="!!errors['date_from']"
                                        :error-messages="errors['date_from']" type="datetime-local"></v-text-field>
                        </v-col>
                        <v-col cols="auto" xs="6">
                          <v-text-field outlined dense label="Дата окончания"
                                        v-model="task.date_to"
                                        :error="!!errors['date_to']"
                                        :error-messages="errors['date_to']"
                                        type="datetime-local"></v-text-field>
                        </v-col>

                      </v-row>
                      <v-row justify="start">
                        <v-col cols="auto" class="mr-3">
                          <v-autocomplete outlined dense label="Статус"
                                          v-model="task.status" :items="taskStatusList" item-text="name"
                                          item-value="id"></v-autocomplete>
                        </v-col>
                        <v-col cols="auto" class="mr-3">
                          <v-autocomplete outlined dense label="Исполнитель"
                                          v-model="task.executor" :items="systemUser" item-text="fullName"
                                          item-value="id"></v-autocomplete>
                        </v-col>
                        <v-col cols="auto">
                          <AddTag ref="tagsList" :existTags="existTags"></AddTag>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-row justify="end">
                <v-col cols="auto" class="mr-3">
                  <v-btn color="error" @click="close">Отмена</v-btn>
                </v-col>
                <v-col cols="auto" class="mr-3">
                  <v-btn color="success" @click="save()">Сохранить</v-btn>
                </v-col>
                <v-col cols="auto" class="mr-2">
                  <v-btn color="primary" @click="taskDone()"
                         :disabled="type === 'create'">
                    Закрыть задачу
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-actions>

          </v-card>
        </v-col>
        <v-col cols="auto">

        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from 'moment'
import {mapGetters} from 'vuex'
import AddTag from "@/components/Tagging/AddTag";

export default {
  name: "TaskCreate",
  data: () => ({
    dialog: false,
    valid: false,
    loading: false,
    type: 'create',
    required: [
      v => !!v || 'Данное поле обязательно',
    ],
    errors: {},
    task: {
      name: '',
      description: '',
      author: '',
      date: moment().format('YYYY-MM-DD HH:mm'),
      date_from: '',
      date_to: '',
      project: '',
      executor: '',
      status: '',
    },
    existTags: null,
  }),
  computed: {
    ...mapGetters({
      currentUser: 'authUserData',
      systemUser: 'allSystemUsersData',
      projectList: 'projectListData',
      taskStatusList: 'taskStatusListData'
    })
  },
  methods: {
    save() {
      if (this.$refs.taskCreate.validate()) {
        if (this.task.name === '') {
          try {
            this.task.name = this.task.description.split('.')[0]
          } catch (e) {
            this.task.name = this.task.description
          }

        }
        let formData = new FormData()
        let tagsList = []
        if (this.$refs.tagsList) {
          tagsList = this.$refs.tagsList.selected
        }
        Object.keys(this.task).forEach(key => {
          if (typeof this.task[key] === 'object' && this.task[key]) {
            formData.append(key, this.task[key]['id'])
          } else {
            if (this.task[key]) {
              if (key === 'date_from' || key === 'date_to') {
                formData.append(key, moment(this.task[key]).format('YYYY-MM-DD'))
              } else {
                formData.append(key, this.task[key])
              }
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
        for (let pair of formData.entries()) {
          console.log(pair[0] + ', ' + pair[1]);
        }
        if (this.type === 'create') {
          this.$store.dispatch('createTask', formData).then(() => {
            this.errors = {}
            this.close()
          }).catch(err => {
            this.errors = err.response.data.errors
          })
        }
      }

    },
    taskDone() {

    },
    async open() {
      await this.$store.dispatch('allSystemUser');
      await this.$store.dispatch('getProjectList');
      await this.$store.dispatch('getTaskStatusList');
      this.dialog = true
      this.loading = false
    },
    close() {
      this.dialog = false
      if (this.$refs.tagsList) {
        this.$refs.tagsList.clear()
      }

      Object.assign(this.$data, this.$options.data())
    },
  },
  created() {
    this.$parent.$on('createTask', async () => {
      await this.open()
      this.task.author = this.systemUser.filter(obj => obj.user.id === this.currentUser.id)[0]
    })
  },
  components: {AddTag}
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

.task-form {
  height: 94%;
}

>>> .required fieldset {
  border: 0.15em solid;
}

>>> .v-input--is-focused fieldset {
  color: rgba(0, 0, 0, 0.87);
}

>>> .required .error--text fieldset {
  color: rgb(167, 25, 25);
}

>>> .required.v-input--is-focused fieldset {
  border: 0.19em solid;
}

>>> .required.v-input--is-focused.error--text fieldset {
  border: 0.19em solid;
  color: rgb(167, 25, 25);
}

.v-dialog > .v-card > .v-card__title {
  padding: 0;
}

>>> .v-messages.error--text {
  max-width: fit-content;
  max-height: 40px;
}
</style>