<template>
  <v-row justify="center">
    <v-dialog v-model="dialog"
              fullscreen
              hide-overlay>
      <v-card>
        <v-row justify="center">
          <v-card-title><span class="headline"></span>Добавление шаблона регулярной задачи</v-card-title>
        </v-row>
        <v-form lazy-validation ref="periodicalTask">
          <v-row justify="center">
            <v-col md="6" sm="12">
              <v-row justify="start">
                <v-col md="11" sm="10">
                  <v-text-field
                      outlined
                      label="Название задачи"
                      v-model="taskForm.name"
                      :rules="rules.required"
                  ></v-text-field>
                </v-col>
                <v-col md="7" sm="5">
                  <v-autocomplete
                      outlined
                      label="Проект"
                      :items="projectList"
                      item-text="name"
                      item-value="pk"
                      return-object
                      v-model="taskForm.project"
                      :rules="rules.required"
                  ></v-autocomplete>
                </v-col>
                <v-col md="4" sm="5">
                  <v-autocomplete
                      outlined
                      label="Исполнитель"
                      :items="systemUser"
                      item-text="fullName"
                      item-value="uuid"
                      return-object
                      :rules="rules.required"
                      v-model="taskForm.executor"
                  ></v-autocomplete>
                </v-col>
                <v-col md="11" sm="10">
                  <v-textarea
                      outlined
                      label="Описание"
                      v-model="taskForm.description"
                      :rules="rules.required"
                  ></v-textarea>
                </v-col>
                <v-col md="11" sm="10">
                  <v-divider></v-divider>
                </v-col>
                <v-col md="5" sm="5">
                  <v-text-field
                      outlined
                      clearable
                      label="Дата начала"
                      type="date"
                      v-model="taskForm.date_from"
                      :rules="rules.required"
                      @input="setDate"
                  ></v-text-field>
                </v-col>
                <v-col md="4" sm="5">
                  <v-text-field
                      outlined
                      label="Кол-во дней на выполнение"
                      type="number"
                      v-model="taskForm.days_to_complete"
                      min="0"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
            <v-col md="5" sm="12">
              <v-card flat>
                <v-row justify="center">
                  <v-card-title><span class="heading">Расписание задачи</span></v-card-title>
                </v-row>
                <v-row justify="start">
                  <v-card-text>
                    <v-radio-group v-model="scheduleType" @change="clearInterval()">
                      <template v-slot:label>
                        <div>Тип расписания</div>
                      </template>
                      <v-radio value="interval">
                        <template v-slot:label>
                          <strong class="success--text">По расписанию</strong>
                        </template>
                      </v-radio>
                      <v-radio value="currentDay">
                        <template v-slot:label>
                          <strong class="primary--text">По расписанию в конкретный
                            день</strong>
                        </template>
                      </v-radio>
                    </v-radio-group>
                    <v-row v-if="scheduleType === 'interval'">
                      <v-col md="6" sm="6">
                        <v-text-field
                            outlined
                            label="Повторять задачу каждые"
                            type="number"
                            v-model="scheduleForm.interval"
                            min="1"
                            :rules="rules.interval"
                        ></v-text-field>
                      </v-col>
                      <v-col md="6" sm="6">
                        <v-select
                            outlined
                            label="Период повторения"
                            :items="periodList"
                            item-value="val"
                            item-text="name"
                            return-object
                            v-model="scheduleForm.periodicity"
                            :rules="rules.interval"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row v-else>
                      <v-col md="6" sm="6">
                        <v-text-field
                            outlined
                            label="Дата повторения"
                            type="date"
                            v-model="scheduleForm.in_current_date"
                            disabled
                            :rules="rules.currentDay"
                        ></v-text-field>
                      </v-col>
                      <v-col md="6" sm="6">
                        <v-select
                            outlined
                            label="Период повторения"
                            :items="periodList.slice(2)"
                            item-value="val"
                            item-text="name"
                            return-object
                            v-model="scheduleForm.periodicity"
                            :rules="rules.currentDay"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-col md="6" sm="6">
                      <v-text-field
                          outlined
                          label="За сколько дней создать задачу"
                          type="number"
                          v-model="scheduleForm.create_before_day"
                          min="0"
                      ></v-text-field>
                    </v-col>
                    <v-row justify="center">
                      <v-col md="1" v-for="(key, i) in dayOfWeek" :key="i" class="mr-2">
                        <v-checkbox
                            v-model="scheduleForm.day_of_week"
                            :label="key"
                            :value="i"

                        ></v-checkbox>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-row>
                <v-row justify="center">
                                <span v-if="scheduleType === 'interval' && !!scheduleForm.periodicity.name"
                                      class="text--primary">Задача будет повторятся каждые {{
                                    scheduleForm.interval || '--'
                                  }} {{
                                    scheduleForm.periodicity.name.toLowerCase() || '--'
                                  }} начиная с {{ taskForm.date_from }} </span>
                  <span v-else-if="!!scheduleForm.periodicity.name" class="text--primary">Задача будет повторятся каждое {{
                      new Date(scheduleForm.in_current_date).getDate()
                    }}-о число {{ scheduleForm.periodicity.name.toLowerCase() }}а начиная с {{
                      taskForm.date_from
                    }}</span>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
        <v-row justify="center">
          <v-card-actions>
            <v-col md="4" sm="6">
              <v-btn @click="close" color="error">Закрыть</v-btn>
            </v-col>
            <v-spacer></v-spacer>
            <v-col md="4" sm="6">
              <v-btn color="success" @click="validation()">Сохранить</v-btn>
            </v-col>
          </v-card-actions>
        </v-row>
      </v-card>
    </v-dialog>
  </v-row>


</template>

<script>
import moment from 'moment'

export default {
  name: "PeriodicalTaskCreate",
  data() {
    return {
      dialog: false,
      valid: true,
      type: 'create',
      scheduleType: 'interval',
      dayOfWeek: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      periodList: [
        {val: 'Day', name: 'День'},
        {val: 'Week', name: 'Неделя'},
        {val: 'Month', name: 'Месяц'},
        {val: 'Quarter', name: 'Квартал'},
        {val: 'Year', name: 'Год'},
      ],
      taskForm:
          {
            name: '',
            project: '',
            executor: '',
            description: '',
            date_from: '',
            days_to_complete: 0,

          },
      scheduleForm: {
        pk: '',
        periodicity: '',
        interval: '',
        in_current_date: '',
        create_before_day: 1,
        day_of_week: [0, 1, 2, 3, 4],
      },
      rules: {
        required: [
          v => !!v || 'Данное поле обязательное'
        ],
        interval: [
          v => this.interval === 'interval' || !!v || 'Данное поле обязательно'
        ],
        currentDay: [
          v => this.interval === 'currentDay' || !!v || 'Данное поле обязательно'
        ]
      }
    }
  },
  computed: {
    projectList: {
      get() {
        if (this.$store.getters.projectListData) {
          return this.$store.getters.projectListData
        }
        return new Array()
      }
    },
    systemUser: {
      get() {
        if (this.$store.getters.allSystemUsersData) {
          return this.$store.getters.allSystemUsersData
        }
        return new Array()
      }
    },
  },
  methods: {
    open() {
      this.$store.dispatch('getProjectList').then(() => {
        this.$store.dispatch('allSystemUser').then(() => {
        })
        this.dialog = true
      })

    },
    close() {
      this.dialog = false
      Object.assign(this.$data, this.$options.data())
    },
    clearInterval() {
      Object.keys(this.scheduleForm).forEach(key => {
        this.scheduleForm[key] = ''
      })
      this.scheduleForm.create_before_day = 1
    },
    save() {
      let taskFormData = new FormData()
      Object.keys(this.taskForm).forEach(key => {
        if (this.taskForm[key]) {
          if (typeof this.taskForm[key] === 'object') {
            taskFormData.set(key, this.taskForm[key]['pk'])
          } else {
            taskFormData.set(key, this.taskForm[key])
          }
        }
      })
      let scheduleFormDate = new FormData()
      Object.keys(this.scheduleForm).forEach(key => {
        if (this.scheduleForm[key]) {
          if (typeof this.scheduleForm[key] === 'object') {
            if (key === 'day_of_week') {
              scheduleFormDate.append(key, this.scheduleForm.day_of_week.sort().toString())
            } else {
              scheduleFormDate.set(key, this.scheduleForm[key]['val'])
            }

          } else {
            scheduleFormDate.set(key, this.scheduleForm[key])
          }
        }
      })
      if (this.type === 'edit') {
        this.$store.dispatch('editPeriodicalTask', {
          'taskFormData': taskFormData,
          'scheduleFormDate': scheduleFormDate,
          'pk': this.taskForm.pk
        }).then(() => {
          this.close()
        }).catch(err => {
          console.log(err)
        })
      } else {
        this.$store.dispatch('createPeriodicalTask', {taskFormData, scheduleFormDate}).then(() => {
          this.close()
        }).catch(err => {
          console.log(err)
        })
      }
    },
    validation() {
      if (this.$refs.periodicalTask.validate()) {
        this.save()
      }
    },
    setDate(val) {
      console.log(val)
      if (val) {
        this.taskForm.date_from = moment(val).format('YYYY-MM-DD')
      } else {
        this.taskForm.date_from = ''
      }

    },

  },
  watch: {
    scheduleType(val) {
      if (val === 'currentDay') {
        this.scheduleForm.in_current_date = this.taskForm.date_from
      }else {
        this.scheduleForm.in_current_date = ''
      }
    }
  },
  created() {
    this.$parent.$on('createPeriodicalTask', () => {
      this.open()
    })
    this.$parent.$on('editPeriodicalTask', ({item, type}) => {
      this.taskForm = Object.assign({}, item)
      this.scheduleForm = Object.assign({}, item['schedule'])
      this.scheduleForm.day_of_week = JSON.parse("[" + item['schedule']['day_of_week'] + "]");
      if (this.scheduleForm.in_current_date) {
        this.scheduleType = 'currentDay'
      } else {
        this.scheduleType = 'interval'
      }
      this.setDate(item['date_from'])
      this.type = type
      this.open()
    })
  }
}
</script>

<style scoped>
>>> .v-card {
  overflow: hidden !important;
}
</style>