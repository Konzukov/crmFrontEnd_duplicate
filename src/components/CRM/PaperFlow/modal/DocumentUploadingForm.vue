<template>
  <v-container>
    <v-expansion-panel class='pr-3 pl-3'>
      <v-expansion-panel-header>
        <v-row justify="start" align="center">
          <v-col cols="auto">{{ uploadFile.name }}</v-col>
        </v-row>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-card width="100%">
          <v-card-text>
            <v-form>
              <v-row justify="start">
                <v-col md="auto" sm="5">
                  <v-text-field
                      outlined
                      label="Дата получения"
                      type="date"
                      v-model="form.receiving_date"
                      dense
                  ></v-text-field>
                </v-col>
                <v-col md="auto">
                  <v-autocomplete outlined dense label="Вид корреспонденции" :items="correspondenceType"
                                  item-text="name"
                                  item-value="id" v-model="form.correspondence_type"></v-autocomplete>
                </v-col>
              </v-row>
              <v-row justify="space-around">
                <v-col md="5" sm="5" class="mr-2">
                  <v-autocomplete
                      outlined
                      dense
                      :label="form.route? 'От кого': 'Кому'"
                      v-model="form.from"
                      :items="contractorList"
                      item-value="uuid"
                      item-text="fullName"
                      return-object
                      append-outer-icon="mdi-plus"
                      @click:append-outer="addContractor"
                      @change="setFrom"
                  ></v-autocomplete>
                </v-col>
                <v-col md="1" sm="2" align-self="baseline" class="mt-3">
                  <v-btn icon color="success" @click="changeRoute()">
                    <v-icon :class="[eventRoute, 'route-arrow']">mdi-arrow-right-bold
                    </v-icon>
                  </v-btn>
                </v-col>
                <v-col md="5" sm="5" class="ml-2">
                  <v-autocomplete
                      outlined
                      dense
                      :label="form.route? 'Кому': 'От кого'"
                      :items="participatorList"
                      v-model="form.to"
                      return-object
                      item-value="participator.pk"
                      item-text="participator.fullName"
                  ></v-autocomplete>
                </v-col>
              </v-row>
              <v-row justify="start" class="align-center">
                <v-col md="5" sm="5">
                  <v-autocomplete
                      outlined
                      dense
                      label="Проект"
                      :items="projectList"
                      return-object
                      v-model="form.project"
                      item-value="pk"
                      item-text="name"
                      chips
                      multiple
                      append-outer-icon="mdi-plus"
                  >
                    <template v-slot:selection="data">
                      <v-chip>
                        {{ data.item.name }}
                      </v-chip>
                    </template>
                    <template v-slot:item="data">
                      <v-list-item-content>
                        <v-list-item-title>{{ data.item.name }}</v-list-item-title>
                        <v-list-item-subtitle style="font-size: 10px; color: #00a6ee">{{ data.item.code }} -
                          {{ data.item.procedure | getProcedure }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </template>
                  </v-autocomplete>
                </v-col>
                <v-col md="5" sm="5">
                  <AddTag ref="tagsList"></AddTag>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-container>
</template>

<script>
import {mapGetters} from "vuex";
import AddTag from "@/components/Tagging/AddTag";
import moment from 'moment'

export default {
  props: ['uploadFile', 'task', 'event'],
  name: "DocumentUploadingForm",
  data: () => ({
    form: {
      file: '',
      receiving_date: '',
      from_physical: '',
      from_legal: '',
      route: true,
      project: [],
      task: '',
      event: '',
      post: '',
      to: '',
      correspondence_type: ''
    },
  }),
  computed: {
    ...mapGetters({
      docType: "docTypeData",
      correspondenceType: "correspondenceTypeData",
      contractorList: "contractorListData",
      participatorList: "participatorList",
      projectList: "projectListData"
    }),
    eventRoute() {
      return this.form.route ? 'arrow-right' : 'arrow-left'
    },
  },
  methods: {
    addContractor() {
      this.$emit('addContractor')
    },
    setFrom(item) {
      if (item['type'] === 'PhysicalPerson') {
        this.form.from_physical = item
        this.form.from_legal = ''
      } else {
        this.form.from_legal = item
        this.form.from_physical = ''
      }
    },
    changeRoute() {
      this.form.route = !this.form.route
    },
    save() {
      let tagsList;
      if (this.$refs.tagsList) {
        tagsList = this.$refs.tagsList.selected
      }
      let formData = new FormData()
      Object.keys(this.form).forEach(key => {
            if (this.form[key]) {
              if (typeof this.form[key] === 'object') {
                if (key === 'receiving_date') {
                  formData.append(key, moment(this.form[key]).format('YYYY-MM-DD'))
                } else if (key === 'project') {
                  if (this.form.project.length > 0) {
                    console.log(this.form.project)
                    this.form.project.forEach(obj => {
                      if (typeof obj === 'object') {
                        formData.append(key, obj.pk.toString())
                      } else {
                        formData.append(key, obj.toString())
                      }
                    })
                  }
                } else if (key === 'event') {
                  if (this.form.event.length > 0) {
                    this.form.event.forEach(obj => {
                      formData.append(key, obj.pk.toString())
                    })
                  }
                } else if (key === 'file') {
                  formData.set(key, this.form[key])
                } else {
                  formData.set(key, this.form[key]['pk'])
                }
              } else {
                formData.set(key, this.form[key])
              }
            } else {
              formData.set(key, '')
            }
          }
      )
      if (tagsList) {
        tagsList.forEach(obj => {
          if (obj) {
            formData.append('tags', obj.pk.toString())
          }
          this.$emit('resetTagForm')
        })
      }
      return formData
    }
  },
  created() {
    this.form.file = this.uploadFile
    if (this.event) {
      this.form.event = this.event['pk']
      this.form.receiving_date = moment(this.event.date).format('YYYY-MM-DD')
      this.form.project = this.event.project
      this.form.to = this.participatorList[0]
    } else if (this.task) {
      this.form.task = this.task['pk']
      this.form.project = this.task.project
      this.form.to = this.participatorList[0]
    }

  },
  components: {
    AddTag
  }

}
</script>

<style scoped>
.has-error {
  border: 1px solid crimson;
}

.error-message {
  font-size: 12px;
}

>>> .arrow-left {
  transform: rotate(180deg);
}

>>> .v-expansion-panel-header {
  padding: 0 24px !important;
}

>>> i.route-arrow {
  font-size: 40px !important;
}
</style>