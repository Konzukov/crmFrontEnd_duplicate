<template>
  <v-dialog v-model="dialog">
    <v-card class="pt-5" height="90vh">
      <v-card-text class="document-edit-container">
        <v-row>
          <v-col md="6" sm="12" class="document-view">
            <vue-pdf-app
                v-if="form.url"
                :pdf="form.url"></vue-pdf-app>
            <!--            <PDFDocument v-if="form.url" :pdfUrl="form.url"></PDFDocument>-->
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
                <v-col md="auto" v-if="!form.route">
                  <v-text-field outlined dense label="Исходящий номер"
                                hint="Если оставить пустым, номер будет получен автоматически"
                                v-model="form.out_number"></v-text-field>
                </v-col>
                <template v-if="form.correspondence_type">
                  <v-col cols="6" v-if="form.correspondence_type['name'] === 'Квартальный отчет'">
                    <v-autocomplete
                        outlined
                        dense
                        label="Квартал и год"
                        :items="quarterYearOptions"
                        item-text="text"
                        item-value="value"
                        v-model="selectedQuarterYear"
                        @change="updateQuarterYear"
                    ></v-autocomplete>
                  </v-col>
                </template>
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
                      :label="form.route? 'Отправитель': 'Получатель'"
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
                      :label="form.route? 'Получатель': 'Отправитель'"
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
              <v-row justify="start">
                <v-col cols="3">
                  <v-text-field outlined dense label="Сумма документа" v-model="form.price"
                                @keypress="isNumber($event)"></v-text-field>
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
  </v-dialog>
</template>

<script>
import filter from '../../../../mixin/filter'
import customConst from "../../../../const/customConst";
import moment from 'moment'
import AddTag from "../../../Tagging/AddTag";
import {mapGetters} from "vuex";
// import DocumentViewer from "@/components/CRM/PaperFlow/DocumentViewer.vue";
import VuePdfApp from "vue-pdf-app";
import "vue-pdf-app/dist/icons/main.css";
// import PDFDocument from "@/components/PDFViewer/PDFDocument";


export default {
  name: "editDocument",
  data() {
    return {
      selectedQuarterYear: null,
      quarterYearOptions: [],
      overlay: false,
      dialog: false,
      loading: true,
      from: '',
      route: true,
      form: {},
      existTags: null,
      dataLoaded: {
        participator: false,
        legalEntity: false,
        physicalPersons: false,
        projects: false,
        systemUsers: false,
        correspondenceType: false
      }
    }
  },
  methods: {
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
    setCurrentQuarterYear() {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      // Определяем текущий квартал
      let currentQuarter = 1;
      if (currentMonth >= 4 && currentMonth <= 6) currentQuarter = 2;
      else if (currentMonth >= 7 && currentMonth <= 9) currentQuarter = 3;
      else if (currentMonth >= 10 && currentMonth <= 12) currentQuarter = 4;

      this.selectedQuarterYear = `${currentYear}-${currentQuarter}`;
      this.form.quarter_year = currentYear;
      this.form.quarter = currentQuarter;
    },
    updateQuarterYear() {
      if (this.selectedQuarterYear) {
        const [year, quarter] = this.selectedQuarterYear.split('-');
        this.form.quarter_year = parseInt(year);
        this.form.quarter = parseInt(quarter);
      } else {
        this.form.quarter_year = null;
        this.form.quarter = null;
      }
    },
    setQuarter(item) {
      console.log(item)
      if (item.name === "Квартальный отчет") {
        this.generateQuarterYearOptions()
        this.setCurrentQuarterYear()
        // const currentMonth = new Date().getMonth() + 1; // Месяцы от 1 до 12
        // const currentYear = new Date().getFullYear()
        // if (currentMonth >= 1 && currentMonth <= 3) {
        //   this.form.quarter = 1;
        // } else if (currentMonth >= 4 && currentMonth <= 6) {
        //   this.form.quarter = 2;
        // } else if (currentMonth >= 7 && currentMonth <= 9) {
        //   this.form.quarter = 3;
        // } else {
        //   this.form.quarter = 4;
        // }
        // this.form.quarter_year = currentYear
      }
    },
    async open() {
      this.dialog = true;
      this.overlay = true;

      try {
        // Создаем массив промисов для загрузки недостающих данных
        const loadPromises = [];

        // Проверяем и загружаем данные только если они отсутствуют
        if (!this.participatorList.length) {
          loadPromises.push(this.loadParticipator());
        }

        if (!this.contractorList.length) {
          loadPromises.push(this.loadContractorData());
        } else {
          // Если данные уже есть, отмечаем их как загруженные
          this.dataLoaded.legalEntity = true;
          this.dataLoaded.physicalPersons = true;
        }

        if (!this.projectList.length) {
          loadPromises.push(this.loadProjects());
        }

        if (!this.systemUser.length) {
          loadPromises.push(this.loadSystemUsers());
        }

        if (!this.correspondenceType.length) {
          loadPromises.push(this.loadCorrespondenceType());
        }

        // Ожидаем завершения всех загрузок
        await Promise.all(loadPromises);
        this.overlay = false;
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        this.overlay = false;
      }
    },

    async loadParticipator() {
      await this.$store.dispatch('getParticipator');
      this.dataLoaded.participator = true;
    },

    async loadContractorData() {
      await Promise.all([
        this.$store.dispatch('getLegalEntity'),
        this.$store.dispatch('fetchPhysicalPersons')
      ]);
      this.dataLoaded.legalEntity = true;
      this.dataLoaded.physicalPersons = true;
    },

    async loadProjects() {
      await this.$store.dispatch('getProjectList');
      this.dataLoaded.projects = true;
    },

    async loadSystemUsers() {
      await this.$store.dispatch('allSystemUser');
      this.dataLoaded.systemUsers = true;
    },

    async loadCorrespondenceType() {
      await this.$store.dispatch('getCorrespondenceType');
      this.dataLoaded.correspondenceType = true;
    },
    close() {
      this.dialog = false;
      this.form = Object.assign({}, '');
      this.loading = true;
      if (this.$refs.tagsList) {
        this.$refs.tagsList.clear();
      }
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
    isNumber() {
      let evt = (evt) ? evt : window.event;
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      console.log(charCode)
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
        return []
      }
    },
    participatorList: {
      get() {
        if (this.$store.getters.participatorList) {
          return this.$store.getters.participatorList
        }
        return []
      }
    },
    contractorList: {
      get() {
        if (this.$store.getters.allRefData) {
          return this.$store.getters.allRefData
        }
        return []
      }
    },
    projectList: {
      get() {
        if (this.$store.getters.projectListData) {
          return this.$store.getters.projectListData
        }
        return []
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
    this.$parent.$on('editDoc', (pk) => {
      this.open()
      this.$store.dispatch('getDocumentDetail', pk).then(() => {
        let doc = this.$store.getters.singleDocumentData
        if (doc?.correspondence_type && doc.correspondence_type['name'] === 'Квартальный отчет'){
          this.generateQuarterYearOptions()
        }
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
    })
  },
  components: {
    VuePdfApp,
    AddTag,
    // DocumentViewer
  }
}
</script>

<style scoped>
>>> .v-dialog {
  margin: 5px;
}

.document-edit-action {
  position: relative;
  bottom: 40px;
  right: 100px;
}

.document-edit-container {
  height: 95%;
}

.document-edit-container .row {
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