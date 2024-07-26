<template xmlns:v-select="http://www.w3.org/1999/html">
  <v-container fluid>
    <v-card height="79vh" flat>
      <v-toolbar>
        <v-spacer></v-spacer>
        <v-toolbar-title>Добавление до проекта</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text>
        <v-form v-model="valid"
                ref="form"
                lazy-validation>
          <v-row justify="start">
            <v-col>
              <v-text-field
                  label="Код"
                  dense
                  outlined
                  :rules="required"
                  v-model="form.code"
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-select
                  outlined
                  dense
                  v-model="form.type"
                  :items="caseType"
                  item-text="text"
                  item-value="value"
              >
              </v-select>
            </v-col>
            <v-col cols="5">
              <v-text-field
                  outlined
                  dense
                  :placeholder="form.type === 'PHYSICAL'? 'Фамилия Имя Отчество': 'ООО \'Ромашка\''"
                  :rules="required"
                  :label="form.type === 'PHYSICAL'? 'ФИО': 'Название организации'"
                  v-model.lazy="form.relatedObject.full_name"
                  @change="generateGenitiveFullName"
              ></v-text-field>
            </v-col>
            <v-col>
              <v-text-field
                  outlined
                  dense
                  label="ИНН"
                  v-model="form.relatedObject.inn"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4">
              <v-text-field
                  outlined
                  dense
                  label="Номер дела"
                  v-model="form.case_number"
                  :rules="required"
              >
                <template v-slot:append-outer>
                  <v-tooltip
                      bottom
                  >
                    <template v-slot:activator="{ on }">
                      <v-btn icon @click="syncCaseData" :disabled="!form.case_number">
                        <v-icon v-on="on" size="30" color="primary">
                          mdi-sync
                        </v-icon>
                      </v-btn>
                    </template>
                    Получить данные из "Мой арбитр"
                  </v-tooltip>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="8">
              <v-card flat height="30vh" style="overflow-y: scroll" width="100%">
                <v-row class="ml-2 mr-2" justify="start" v-for="(record, i) in caseHistory" :key="i"
                       :class="[record.type ==='Ошибка'? 'error--text': '']">
                  <v-col cols="2">{{ record.date }}</v-col>
                  <v-col cols="2">{{ record.type }}</v-col>
                  <v-col cols="4">{{ record.description }}</v-col>
                  <v-col cols="4" v-if="record.file">
                    <a :href="record.file" target="_blank">{{ record.description }}</a>
                  </v-col>
                </v-row>
                {{ judicialSitting }}
                <v-row class="ml-2 mr-2" justify="center" v-if="judicialSitting">
                  <p class="text-h6">
                    {{ judicialSitting }}
                  </p>
                  <v-btn color="indigo" @click="parseIcs">Создать задачу</v-btn>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col>
              <v-row justify="start">
                <v-col cols="8">
                  <v-file-input
                      outlined
                      dense
                      @change="addFile"
                      :disabled="form.definition.fileURL !==''"
                      label="Файл определения"
                      prepend-icon=""
                  >
                  </v-file-input>
                </v-col>
                <v-col>
                  <v-btn icon @click="selectFile">
                    <v-icon size="32">
                      mdi-form-select
                    </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <template v-if="form.definition.fileURL">
              <span class="text-pre-wrap">Будет загружен файл:
                <a :href="form.definition.fileURL" target="_blank">{{ form.definition.fileName }}</a>
            </span>
                <v-btn icon color="error" class="font-weight-bold" @click="resetFile('definition')">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </template>
            </v-col>
            <v-col>
              <v-text-field type="date"
                            outlined
                            v-model="form.definition.date"
                            label="Дата определения">
              </v-text-field>
              <v-text-field type="datetime-local"
                            outlined
                            v-model="form.heading_date"
                            label="Дата заседания">
              </v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="auto">
              <v-text-field dense outlined label="ФИО в родительном падиже"
                            v-model="form.genitiveFullName"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select
                  outlined
                  label="Шаблон согласия"
                  v-model="form.agreement_template"
                  :items="agreementTemplateData"
                  item-value="id"
                  item-text="attributes.name"
              >
                <template v-slot:append-outer>
                  <v-btn @click="generateAgreement">Сформировать</v-btn>
                </template>
              </v-select>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col>
              <template>
                <v-row class="ml-2 mb-5" justify="start" v-if="form.agreement.docx">
                <span class="text-pre-wrap">Будет загружен файл:
                <a :href='form.agreement.docx.url'
                   target="_blank">{{ form.agreement.docx.name }}</a>
            </span>
                  <v-btn icon color="error" class="font-weight-bold" @click="resetFile('agreementDocx')">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                  <v-btn v-if="!form.agreement.pdf" icon @click="generatePDF(form.agreement.docx)">
                    <v-icon>mdi-file-plus</v-icon>
                  </v-btn>
                </v-row>
                <v-file-input
                    v-else
                    outlined
                    prepend-icon=""
                    label="Файл согласия в docx"
                    @change="(file)=>this.form.agreement.docx = file"
                ></v-file-input>
              </template>
              <template>
                <v-row class="ml-2" justify="start" v-if="form.agreement.pdf">
                        <span class="text-pre-wrap">Будет загружен файл:
                <a :href='form.agreement.pdf.url'
                   target="_blank">{{ form.agreement.pdf.name }}</a>
            </span>
                  <v-btn icon color="error" class="font-weight-bold" @click="resetFile('agreementPDF')">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-row>
                <v-file-input
                    v-else
                    outlined
                    prepend-icon=""
                    label="Файл согласия в pdf"
                >
                </v-file-input>
              </template>

            </v-col>
            <v-col>
              <v-text-field type="date"
                            outlined
                            v-model="form.agreement.date"
                            label="Дата согласия">
              </v-text-field>
            </v-col>
          </v-row>
        </v-form>

      </v-card-text>
      <v-card-actions class="justify-space-around">
        <v-btn color="success" @click="save" :disabled="!valid">Сохранить</v-btn>
      </v-card-actions>
    </v-card>
    <v-overlay :value="overlay">
      <v-progress-circular
          indeterminate
          size="64"
      ></v-progress-circular>
      {{ loadMessage }}
    </v-overlay>
    <v-dialog v-model="dialogSelectDefine"
              scrollable
              max-width="550px">
      <v-card height="50vh">
        <v-card-title>
          Выберете файл определения
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text style="padding-top: 100px !important;">
          <v-radio-group
              row
              v-model="selectedDefine"
          >
            <v-radio v-for="(item, i) in availableFile" :key="i" :value="item">
              <template v-slot:label>
                {{item.date}} | {{item.description}}
              </template>
            </v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn @click="getFile(selectedDefine)">Добавить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import moment from "moment";
import {mapGetters} from 'vuex'
import customConst from "../../../const/customConst";

export default {
  props: ['id'],
  name: "Create",
  data() {
    return {
      valid: true,
      overlay: false,
      loading: false,
      dialogSelectDefine: false,
      loadMessage: 'Получение данных...',
      form: {
        type: 'PHYSICAL',
        relatedObject: {
          pk: '',
          full_name: '',
          inn: '',
        },
        code: '',
        case_number: '',
        agreement_template: '1',
        genitiveFullName: '',
        inn: '',
        heading_date: null,
        definition: {
          file: '',
          fileName: '',
          fileURL: '',
          date: '',

        },
        agreement: {
          date: '',
          docx: null,
          pdf: null,
        }
      },
      caseType: [
        {text: 'Юр. лицо', value: 'LEGAL'},
        {text: 'Физ. лицо', value: 'PHYSICAL'}
      ],
      caseHistory: [],
      judicialSitting: '',
      ics: {
        url: null,
        cookie: null
      },
      availableFile: [],
      selectedDefine: null,
      required: [
        v => !!v || 'Данное поле обязательно',
      ]
    }
  },
  methods: {
    parseIcs() {
      let icsFormData = new FormData()
      icsFormData.append('url', this.ics.url)
      icsFormData.append('cookie', this.ics.cookie)
      icsFormData.append('case_number', this.form.case_number)
      this.$http({
        method: "post",
        url: customConst.REFERENCE_BOOK_API + "pre-project/create-session/",
        data: icsFormData
      }).then(res => {
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
    },
    syncCaseData() {
      this.caseHistory = new Array()
      return new Promise((resolve, reject) => {
        this.overlay = true
        this.$http({
          method: "GET",
          url: customConst.REFERENCE_BOOK_API + 'get-case-from-arbitr',
          params: {'case-number': this.form.case_number}
        }).then(res => {
          console.log(res.data)
          this.caseHistory = res.data.data
          this.ics.url = res.data.url
          this.ics.cookie = res.data.cookie
          this.caseHistory.map(obj => {
            if (obj.type === 'Определение') {
              this.availableFile.push(obj)
              if (obj.description.indexOf('О принятии заявления о признании должника банкротом') !== -1) {
                this.form.definition.date = new Date(obj.date)
                if (obj['additionalInfo'].indexOf('Дата и время судебного заседания') !== -1) {
                  this.judicialSitting = obj['additionalInfo']
                  const dateRegExp = new RegExp('\\d{2}([.\\-/ ])\\d{2}\\1\\d{4}, \\d{2}:\\d{2}')
                  try {
                    this.form.heading_date = moment(dateRegExp.exec(obj['additionalInfo'])[0], 'DD.MM.YYYY, HH:mm').format('YYYY-MM-DDTHH:mm')
                  } catch (e) {
                    console.log(e)
                  }
                }
              }
            }
          })
          this.loadMessage = 'Формирование данных'
          setTimeout(() => {
            this.overlay = false
          }, 1500)
          resolve()
        }).catch(err => {
          console.log(err)
          this.overlay = false
          this.caseHistory = new Array({
            date: moment(new Date()).format('DD.MM.YYYY'),
            type: 'Ошибка',
            description: 'Ошибка при загрузке'
          })
        })
      })
    },
    selectFile() {
      this.dialogSelectDefine = true
    },
    getFile(obj) {
      this.form.definition.fileURL = obj.file
      this.form.definition.fileName = obj.description
      this.form.definition.date = moment(obj.date, 'DD.MM.YYYY').format('YYYY-MM-DD')
      console.log(this.form.definition.date)
      this.dialogSelectDefine = false
    },
    addFile(item) {
      this.form.definition.file = item
    },
    generateAgreement() {
      let formData = new FormData()

      if (!this.form.agreement.docx) {
        formData.append('agreement_template', this.form.agreement_template)
        formData.append('case_number', this.form.case_number)
        formData.append('full_name', this.form.genitiveFullName)
        formData.append('type', this.form.type)
      } else {
        formData.append('file', this.form.agreement.docx)
      }
      this.overlay = true
      return new Promise((resolve, reject) => {
        this.$http({
          method: "POST",
          url: customConst.REFERENCE_BOOK_API + 'generate-agreement',
          data: formData
        }).then(res => {
          Object.assign(this.form.agreement, res.data)
          this.form.agreement.date = moment(new Date()).format('YYYY-MM-DD')
          this.overlay = false
          resolve()
        }).catch(err => {
          this.overlay = false
        })
      })
    },
    resetFile(fType) {
      switch (fType) {
        case 'definition':
          Object.keys(this.form.definition).forEach(key => {
            console.log(this)
            this.form.definition[key] = ''
          })
          break;
        case 'agreementPDF':
          this.form.agreement.pdf = null
          break;
        case 'agreementDocx':
          this.form.agreement.docx = null
          break;
      }
    },
    generateGenitiveFullName(val) {
      let formData = new FormData()
      formData.append('full_name', val)
      console.log(val)
      this.$http({
        method: "POST",
        url: customConst.REFERENCE_BOOK_API + 'generate-genative',
        data: formData
      }).then(res => {
        this.form.genitiveFullName = res.data.data
      }).catch(err => {
        console.log(err)
      })
    },
    save() {
      console.log(this.$route.name)
      if (this.$refs.form.validate()) {
        this.overlay = true
        this.loadMessage = 'Сохранение данных! Ожидайте....'
        let formData = new FormData()
        formData.append('cookie', this.ics.cookie)
        const action = this.$route.name
        Object.keys(this.form).forEach(key => {
          if (typeof this.form[key] === 'object') {
            if (key === 'definition') {
              if (!this.form[key]['file']) {
                formData.append('definitionDate', this.form[key]['date'])
                formData.append('definitionFileURL', this.form[key]['fileURL'])
                formData.append('definitionFileName', this.form[key]['fileName'])
              } else {
                formData.append('file', this.form[key]['file'])
                formData.append('definitionDate', moment(new Date()).format('YYYY-MM-DD'))
              }
            } else if (key === 'agreement') {
              // Object.keys(this.form[key])
              if (this.form[key]["docx"] && this.form[key]["pdf"]) {
                formData.append('agreementDocxFile', this.form[key]['docx']['url'])
                formData.append('agreementPdfFile', this.form[key]['pdf']['url'])
                formData.append('agreement_doc_date', this.form[key]['date'])
              } else {
                formData.append('agreementDocxFile', '')
                formData.append('agreementPdfFile', '')
              }
            } else if (key === 'relatedObject') {
              if (this.form[key].pk) {
                this.form.type === 'PHYSICAL' ? formData.append('physical', this.form[key].pk) : formData.append('legal', this.form[key].pk)
              } else {
                formData.append('full_name', this.form[key].full_name)
                formData.append('full_inn', this.form[key].inn)
              }
            }

          } else {
            if (this.form[key] || action === 'createPreProject') {
              formData.append(key, this.form[key])
            }
          }
        })
        if (action === 'createPreProject') {
          this.$store.dispatch(action, formData).then(() => {
            this.loadMessage = 'Данные успешно добавлены'

            setTimeout(() => {
              this.overlay = false
              Object.assign(this.$data, this.$options.data())
            }, 1200)

          }).catch(() => {
            this.overlay = false
          })
        } else if (action === 'editPreProject') {
          this.$store.dispatch(action, {formData, id: this.id}).then(() => {
            this.overlay = false
          }).catch(() => {
            this.overlay = false
          })
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      agreementTemplateData: 'agreementTemplateData'
    })
  },
  watch: {
    $route(to, from) {
      let leftCols, rightCols;
      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length
      if (toDepth > fromDepth) {
        leftCols = 1
        this.rightCols = 11
      } else {
        leftCols = 11
        rightCols = 1
      }
      this.$emit('change-cols', {leftCols, rightCols})
    }
  },
  beforeMount() {
    this.$store.dispatch('getAgreementTemplate')
    console.log(this.$route.name)
    if (this.id) {
      this.$store.dispatch('getPreProjectDetail', this.id).then(() => {
        const preProjectData = this.$store.getters.preProjectDetailData
        console.log(preProjectData)
        this.form.type = preProjectData['type']
        if (preProjectData['type'] === "PHYSICAL") {
          const physical = preProjectData['physical']
          this.form.relatedObject.full_name = `${physical.last_name} ${physical.first_name} ${physical.middle_name}`
          this.form.relatedObject.pk = physical['pk']
          this.form.relatedObject.inn = physical['inn']
        } else {
          this.form.full_name = preProjectData['legal']['name']
          this.form.pk = preProjectData['legal']['pk']
          this.form.inn = preProjectData['legal']['inn']
        }
        this.form.code = preProjectData['code']

        this.form.case_number = preProjectData['case_number']
        this.form.heading_date = moment(preProjectData['heading_date']).format('YYYY-MM-DDTHH:mm')
        //yyyy-MM-ddThh:mm
        this.form.definition.date = preProjectData['definition_date']
        this.form.definition.fileURL = preProjectData['definition_doc']
        const fileName = preProjectData['definition_doc'].split('/')
        this.form.definition.fileName = fileName[fileName.length - 1]
        const docxName = decodeURIComponent(preProjectData['agreement_doc_docx']).split('/')
        const pdfName = decodeURIComponent(preProjectData['agreement_doc_pdf']).split('/')
        this.form.agreement.date = preProjectData['agreement_doc_date']
        if (preProjectData['agreement_doc_docx']) {
          this.form.agreement.docx = {
            name: docxName[docxName.length - 1],
            url: preProjectData['agreement_doc_docx']
          }
        }
        if (preProjectData['agreement_doc_pdf']) {
          this.form.agreement.pdf = {
            name: pdfName[pdfName.length - 1],
            url: preProjectData['agreement_doc_pdf']
          }
        }
      })
    }
  },

}
</script>

<style scoped>
>>> .v-card {
  overflow: scroll;
}

>>> .v-input__append-outer {
  margin-top: 2px;
}

>>> .v-input__slot {
  max-height: 40px;
  min-height: 40px !important;
}

.v-input {
  font-size: 14px !important;
}

>>> .v-input__icon {
  height: 10px !important;
}

>>> .v-text-field__slot label {
  font-size: 14px !important;
}

>>> .v-text-field--outlined .v-label {
  top: 10px !important;
}

>>> .v-text-field--outlined .v-label--active {
  transform: translateY(-18px) scale(0.75) !important;
}

.container {
  margin: 0;
  padding: 0;
}

>>> .v-overlay__content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>