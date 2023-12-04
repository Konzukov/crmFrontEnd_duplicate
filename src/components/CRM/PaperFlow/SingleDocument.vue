<template>
  <v-container fluid>
    <v-card flat height="90vh">
      <v-card-text class="document-edit-container pt-4">
        <v-row>
          <v-col md="6" sm="12" class="document-view">
            <PDFDocument :pdfUrl="form.url"></PDFDocument>
          </v-col>
          <v-col md="6" sm="12">
            <v-form>
              <v-row justify="space-between">
                <v-col md="auto" class="mr-2">
                  <v-select
                      v-model="form.author"
                      :items="systemUser"
                      return-object
                      dense
                      outlined
                      label="Автор"
                      disabled
                      item-value="uuid"
                      item-text="fullName"
                  >
                  </v-select>
                </v-col>
                <v-col mmd="auto">
                  <v-text-field
                      outlined
                      dense
                      label="Дата получения"
                      type="date"
                      v-model="form.receiving_date"
                  ></v-text-field>
                </v-col>
                <v-col md="auto">
                  <v-autocomplete outlined dense label="Вид корреспонденции" :items="correspondenceType"
                                  item-text="name"
                                  item-value="id" v-model="form.correspondence_type"></v-autocomplete>
                </v-col>
              </v-row>
              <v-row justify="start">
                <v-col md="12" sm="12кк ">
                  <v-text-field
                      outlined
                      dense
                      label="Имя файла"
                      v-model="form.fileName"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row justify="space-between">
                <v-col md="5" sm="5" class="mr-2">
                  <v-autocomplete
                      :items="contractorList"
                      dense
                      v-model="from"
                      label="От кого"
                      outlined
                      return-object
                      clearable
                      item-text="fullName"
                      item-value="uuid"
                      @change="setFrom"
                  ></v-autocomplete>
                </v-col>
                <v-col md="1" sm="2" align-self="baseline" class="mt-3">
                  <v-btn icon color="success" @click="changeRoute">
                    <v-icon :class="[eventRoute, 'route-arrow']">mdi-arrow-right-bold
                    </v-icon>
                  </v-btn>
                </v-col>
                <v-col md="5" sm="5">
                  <v-autocomplete
                      outlined
                      dense
                      label="Кому"
                      :items="participatorList"
                      clearable
                      v-model="form.to"
                      @click:clear="changeItem(form.to)"
                      return-object
                      item-value="participator.pk"
                      item-text="participator.fullName"
                  >
                  </v-autocomplete>
                </v-col>
              </v-row>
              <v-row justify="space-between">
                <v-col md="5" sm="5">
                  <v-autocomplete
                      outlined
                      dense
                      label="Проект"
                      clearable
                      @click:clear="changeItem(form.project)"
                      :items="projectList"
                      return-object
                      multiple
                      chips
                      v-model="form.project"
                      item-value="pk"
                      item-text="name"
                  ></v-autocomplete>
                </v-col>
                <v-col md="5" sm="5">
                  <AddTag ref="tagsList" :existTags.sync="existTags"></AddTag>
                </v-col>
              </v-row>
            </v-form>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class='document-edit-action'>
        <v-row justify="end">
          <v-col md="auto">
            <v-btn color="error" @click="close">
              Закрыть
            </v-btn>
          </v-col>
          <v-col md="auto">
            <v-btn color="success" @click="save">
              Сохранить
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
    <v-overlay :value="overlay">
      <v-progress-circular
          indeterminate
          size="64"
      ></v-progress-circular>
      <span>Загрузка...</span>
    </v-overlay>
  </v-container>
</template>

<script>
import moment from 'moment'
import customConst from '../../../const/customConst'
import {mapGetters} from "vuex";
import filter from "@/mixin/filter";
import AddTag from "@/components/Tagging/AddTag";
import PDFDocument from "@/components/PDFViewer/PDFDocument";


export default {
  name: "SingleDocument",
  data() {
    return {
      overlay: false,
      dialog: false,
      loading: true,
      from: '',
      route: true,
      form: {},
      existTags: null
    }
  },
  methods: {
    open() {
      this.dialog = true
      this.overlay = true
      this.$store.dispatch('getParticipator').then(() => {
        this.$store.dispatch('getLegalEntity').then(() => {
          this.$store.dispatch('getPhysicalPerson').then(() => {
            this.$store.dispatch('getProjectList').then(() => {
              this.$store.dispatch('allSystemUser').then(() => {
                this.$store.dispatch('getProjectList').then(() => {
                  this.$store.dispatch('getCorrespondenceType').then(() => {
                    this.overlay = false
                  })
                })
              })
            })
          })
        })
      })
    },
    close() {
      this.dialog = false
      this.form = Object.assign({}, '')
      this.loading = true
      this.$refs.tagsList.clear()
      this.$router.push({name: 'paper_flow'})
    },
    save() {
      let formData = new FormData()
      let tagsList;
      if (this.$refs.tagsList) {
        tagsList = this.$refs.tagsList.selected
      }
      Object.keys(this.form).forEach(key => {
            if (this.form[key]) {
              if (typeof this.form[key] === 'object') {
                if (key === 'receiving_date') {
                  formData.append(key, moment(this.form[key]).format('YYYY-MM-DD'))
                } else if (key === 'project') {
                  if (this.form.project.length > 0) {
                    this.form.project.forEach(obj => {
                      formData.append(key, obj.pk.toString())
                    })
                  }
                } else {
                  formData.set(key, this.form[key]['pk'])
                }
              } else {
                formData.set(key, this.form[key])
              }
            } else {
              if (key === 'route') {
                formData.set(key, this.form[key])
              } else {
                formData.set(key, '')
              }

            }
          }
      )
      if (tagsList) {
        formData.delete('tags')
        tagsList.forEach(obj => {
          if (obj && obj['pk']) {
            formData.append('tags', obj['pk'].toString())
          }
          console.log(formData.all)
          this.$emit('resetTagForm')
        })
      }
      for (let pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
      }
      this.$store.dispatch('editDocument', {formData, 'pk': this.form.pk}).then(() => {
        this.close()
      }).catch(err => {
        console.log(err.response.data.errors)
      })
    },
    renderDoc(file) {
      if (file && file.split('.').pop() === 'jpg') {
        return new Array(customConst.BASE_URL + file)
      } else if (file && file.split('.').pop() === 'pdf') {
        return
      }
    },
    changeItem(item) {
      return ''
    },
    setFrom(item) {
      if (!item) {
        this.form.from_legal = ''
        this.form.from_physical = ''
      } else {
        if (item['type'] === 'PhysicalPerson') {
          this.form.from_physical = item
          this.form.from_legal = ''
        } else {
          this.form.from_legal = item
          this.form.from_physical = ''

        }
      }
    },
    changeRoute() {
      console.log('click')
      this.route = !this.route
      this.form.route = this.route
    }
  },
  computed: {
    systemUser: {
      get() {
        if (this.$store.getters.allSystemUsersData) {
          return this.$store.getters.allSystemUsersData
        }
        return new Array()
      }
    },
    participatorList: {
      get() {
        if (this.$store.getters.participatorList) {
          return this.$store.getters.participatorList
        }
        return new Array()
      }
    },
    contractorList: {
      get() {
        if (this.$store.getters.contractorListData) {
          return this.$store.getters.contractorListData
        }
        return new Array()
      }
    },
    projectList: {
      get() {
        if (this.$store.getters.projectListData) {
          return this.$store.getters.projectListData
        }
        return new Array()
      },
    },
    ...mapGetters({
      correspondenceType: "correspondenceTypeData"
    }),
    eventRoute() {
      return this.route ? 'arrow-right' : 'arrow-left'
    }
  },
  mixins: [filter],
  mounted() {
    this.open()
    const pk = this.$route.params.pk
    this.$store.dispatch('getDocumentDetail', pk).then(() => {
      let doc = this.$store.getters.singleDocumentData
      Object.keys(doc).forEach(key => {
        if (key === 'fromWho') {
          this.from = doc[key]
        } else if (key === 'route') {
          this.route = doc[key]
        }
        this.form[key] = doc[key]
      })
      this.existTags = doc.tags
      this.loading = false
    })
  },
  components: {
    AddTag,
    PDFDocument
  }
}
</script>

<style scoped>
.document-edit-action{
  position: relative;
  bottom: 140px;
  right: 100px;
}
.document-edit-container {
  height: 95%;
}
.document-edit-container .row{
  height: 100%;
}
.document-view {
  position: relative;
}



>>> .v-carousel {
  height: 100%;
}

>>> .v-image__image--cover {
  background-size: contain;
}
>>> .arrow-left {
  transform: rotate(180deg);
}

>>> i.route-arrow {
  font-size: 40px !important;
}

>>> .v-overlay__content {
  display: flex;
  flex-flow: column;
}
</style>