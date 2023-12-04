<template>
  <v-card width="100%" height="85vh">
    <v-toolbar color="primary" dark>
      <v-row justify="center">
        <v-toolbar-title>Мастер создания проектов</v-toolbar-title>
      </v-row>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-row justify="center">
      <v-col>
        <v-stepper
            v-model.number="step"
            vertical
            non-linear>
          <v-stepper-step
              complete-icon="mdi-check"
              :complete="step > 1"
              step="1"
          >
            Личные данные
          </v-stepper-step>
          <v-stepper-content step="1">
            <v-card class="mb-12" height="45vh" style="overflow-y: scroll" flat>
              <v-card-text>
                <v-form ref="personalInfo" v-model="questionnaire.personalInfoValid">
                  <v-row justify="start">
                    <v-col md="4">
                      <v-text-field outlined label="Фамилия"
                                    :rules="rules.required"
                                    v-model="questionnaire.personalInfo.lastName"></v-text-field>
                    </v-col>
                    <v-col md="4">
                      <v-text-field outlined label="Имя"
                                    :rules="rules.required"
                                    v-model="questionnaire.personalInfo.firstName"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row justify="start">
                    <v-col md="4">
                      <v-text-field outlined label="Отчество"
                                    :rules="rules.required"
                                    v-model="questionnaire.personalInfo.middleName"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row justify="start">
                    <v-col md="5" lg="5">
                      <v-row>
                        <v-col
                            v-for="(image, n) in questionnaire.personalInfo.passport"
                            :key="n"
                            class="d-flex child-flex"
                            cols="4"
                        >
                          <v-hover v-slot="{ hover }">
                            <v-img
                                contain
                                aspect-ratio="1"
                                width="200"
                                :src="generateURI(image)"
                            >
                              <v-btn dark fab x-small color="white" v-if="hover"
                                     @click="removePassportFile('password',image)">
                                <v-icon color="error">mdi-close</v-icon>
                              </v-btn>
                            </v-img>
                          </v-hover>
                        </v-col>
                        <span v-if="questionnaire.personalInfo.passport.length === 0"
                              :class="[checkFile(questionnaire.personalInfo.passport) ? '': 'has-error']"
                        >Фото паспорта</span>
                      </v-row>
                      <div id="passport-file-field">
                        <input id="passport-file" multiple
                               type="file"
                               v-show="false"
                               ref="passport"
                               @change="addFile('password', $event)"
                               accept="image/*"
                        />
                      </div>
                      <v-btn class="mt-5" @click="openFileUpload('passport-file')">Добавить фото</v-btn>
                    </v-col>
                    <v-col lg="3" md="3">
                      <v-row>
                        <v-col
                            v-for="(image, n) in questionnaire.personalInfo.inn"
                            :key="n"
                            class="d-flex child-flex"
                            cols="7"
                        >
                          <v-hover v-slot="{ hover }">
                            <v-img
                                contain
                                aspect-ratio="1"
                                width="400"
                                :src="generateURI(image)"
                            >
                              <v-btn dark fab x-small color="white" v-if="hover"
                                     @click="removePassportFile('inn',image)">
                                <v-icon color="error">mdi-close</v-icon>
                              </v-btn>
                            </v-img>
                          </v-hover>
                        </v-col>
                        <span v-if="questionnaire.personalInfo.inn.length === 0"
                              :class="[checkFile(questionnaire.personalInfo.inn) ? '': 'has-error']">Фото ИНН</span>
                      </v-row>
                      <div id="inn-file-field">
                        <input id="inn-file" multiple
                               v-show="false"
                               type="file"
                               ref="inn"
                               @change="addFile('inn', $event)"
                               accept="image/*"
                        />
                      </div>
                      <v-btn class="mt-5" @click="openFileUpload('inn-file')">Добавить фото</v-btn>
                    </v-col>
                    <v-col lg="3" md="3">
                      <v-row>
                        <v-col
                            v-for="(image, n) in questionnaire.personalInfo.snils"
                            :key="n"
                            class="d-flex child-flex"
                            cols="7"
                        >
                          <v-hover v-slot="{ hover }">
                            <v-img
                                contain
                                aspect-ratio="1"
                                width="400"
                                :src="generateURI(image)"
                            >
                              <v-btn dark fab x-small color="white" v-if="hover"
                                     @click="removePassportFile('snils',image)">
                                <v-icon color="error">mdi-close</v-icon>
                              </v-btn>
                            </v-img>
                          </v-hover>
                        </v-col>
                        <span v-if="questionnaire.personalInfo.snils.length === 0"
                              :class="[checkFile(questionnaire.personalInfo.snils) ? '': 'has-error']">Фото СНИЛС</span>
                      </v-row>
                      <div id="snils-file-field">
                        <input id="snils-file" multiple
                               v-show="false"
                               type="file"
                               ref="snils"
                               @change="addFile('snils', $event)"
                               accept="image/*"
                        />
                      </div>
                      <v-btn class="mt-5" @click="openFileUpload('snils-file')">Добавить фото</v-btn>
                    </v-col>
                  </v-row>
                  <v-row justify="start" class="mt-6">
                    <v-col md="1" lg="1" sm="2">
                        <span
                            :class="[questionnaire.personalInfo.marriage.status ? 'marriage-active' :'marriage-inactive']">Брак</span>
                      <v-switch
                          v-model="questionnaire.personalInfo.marriage.status"
                          inset
                          color="success"
                          hide-details
                      ></v-switch>
                    </v-col>
                    <template v-if="questionnaire.personalInfo.marriage.status">
                      <v-row>
                        <v-col md="3" lg="3" sm="5" class="mt-7">
                          <v-text-field
                              outlined
                              label="Супруг(а)"
                              :rules="questionnaire.personalInfo.marriage.status? rules.required: ''"
                              v-model="questionnaire.personalInfo.marriage.spouse"
                          ></v-text-field>
                        </v-col>
                        <v-col md="3" lg="3" sm="5" class="mt-7">
                          <v-text-field type="date" v-model="questionnaire.personalInfo.marriage.date"
                                        :rules="questionnaire.personalInfo.marriage.status? rules.required: ''"
                                        outlined label="Дата брака"></v-text-field>
                        </v-col>
                        <v-col md="5" lg="5" class="mt-7">
                          <v-row>
                            <v-col
                                v-for="(image, n) in questionnaire.personalInfo.marriage.file"
                                :key="n"
                                class="d-flex child-flex"
                                cols="4"
                            >
                              <v-hover v-slot="{ hover }">
                                <v-img
                                    contain
                                    aspect-ratio="1"
                                    width="200"
                                    :src="generateURI(image)"
                                >
                                  <v-btn dark fab x-small color="white" v-if="hover"
                                         @click="removePassportFile('marriage',image)">
                                    <v-icon color="error">mdi-close</v-icon>
                                  </v-btn>
                                </v-img>
                              </v-hover>
                            </v-col>
                            <span
                                v-if="questionnaire.personalInfo.marriage.file.length === 0">Фото свидетельства </span>
                          </v-row>
                          <div id="marriage-file-field">
                            <input id="marriage-file" multiple
                                   type="file"
                                   v-show="false"
                                   ref="marriage"
                                   @change="addFile('marriage', $event)"
                                   accept="image/*"
                            />
                          </div>
                          <v-btn class="mt-5" @click="openFileUpload('marriage-file')">Добавить фото</v-btn>
                        </v-col>
                      </v-row>
                    </template>
                  </v-row>
                  <v-row justify="start" class="mt-6">
                    <v-col md="1" lg="1" sm="2">
                        <span
                            :class="[questionnaire.personalInfo.divorce.status ? 'marriage-active' :'marriage-inactive']">Развод (смерть)</span>
                      <v-switch
                          v-model="questionnaire.personalInfo.divorce.status"
                          inset
                          color="success"
                          hide-details
                      ></v-switch>
                    </v-col>
                    <template v-if="questionnaire.personalInfo.divorce.status">
                      <v-row>
                        <v-col md="3" lg="3" sm="5" class="mt-12">
                          <v-text-field type="date" v-model="questionnaire.personalInfo.divorce.date"
                                        outlined label="Дата развода(сметри)"></v-text-field>
                        </v-col>
                        <v-col md="5" lg="5" class="mt-12">
                          <v-row>
                            <v-col
                                v-for="(image, n) in questionnaire.personalInfo.divorce.file"
                                :key="n"
                                class="d-flex child-flex"
                                cols="4"
                            >
                              <v-hover v-slot="{ hover }">
                                <v-img
                                    contain
                                    aspect-ratio="1"
                                    width="200"
                                    :src="generateURI(image)"
                                >
                                  <v-btn dark fab x-small color="white" v-if="hover"
                                         @click="removePassportFile('divorce',image)">
                                    <v-icon color="error">mdi-close</v-icon>
                                  </v-btn>
                                </v-img>
                              </v-hover>
                            </v-col>
                            <span v-if="questionnaire.personalInfo.divorce.file.length === 0">Фото свидетельства </span>
                          </v-row>
                          <div id="divorce-file-field">
                            <input id="divorce-file" multiple
                                   type="file"
                                   v-show="false"
                                   ref="marriage"
                                   @change="addFile('divorce', $event)"
                                   accept="image/*"
                            />
                          </div>
                          <v-btn class="mt-5" @click="openFileUpload('divorce-file')">Добавить фото</v-btn>
                        </v-col>
                      </v-row>
                    </template>
                  </v-row>
                  <v-row>
                    <v-btn @click="addChild" color="primary">Добавить ребёнка</v-btn>
                  </v-row>
                  <v-row justify="start" align="baseline"
                         v-for="(item, i) in questionnaire.personalInfo.children" :key="i">
                    <v-col cols="1">
                      {{ i + 1 }}.
                    </v-col>
                    <v-col cols="5">
                      <v-text-field label="ФИО" outlined v-model="item['name']" :rules="rules.required"></v-text-field>
                    </v-col>
                    <v-col cols="3">
                      <v-text-field label="Дата рождения" type="date" outlined
                                    v-model="item['birthday']" :rules="rules.required"></v-text-field>
                    </v-col>
                    <v-col>
                      <v-col
                          v-for="(image, n) in item.file"
                          :key="n"
                          class="d-flex child-flex"
                          cols="4"
                      >
                        <v-hover v-slot="{ hover }">
                          <v-img
                              contain
                              aspect-ratio="1"
                              width="200"
                              :src="generateURI(image)"
                          >
                            <v-btn dark fab x-small color="white" v-if="hover"
                                   @click="removePassportFile('child-photo-${i}',image, item)">
                              <v-icon color="error">mdi-close</v-icon>
                            </v-btn>
                          </v-img>
                        </v-hover>
                      </v-col>
                      <span v-if="item.file.length === 0">Фото свидетельства </span>
                      <div>
                        <input :id="`child-photo-${i}`" multiple
                               type="file"
                               v-show="false"
                               ref="marriage"
                               @change="addFile('childPhoto', $event, item)"
                               accept="image/*"
                        />
                      </div>
                      <v-btn class="mt-5" @click="openFileUpload(`child-photo-${i}`)">Добавить фото</v-btn>
                    </v-col>
                    <v-col cols="1">
                      <v-btn color="error" @click="removeChild(item)">
                        <v-icon>mdi-minus</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
            </v-card>
            <v-btn
                color="primary"
                @click="nextStep()"
                class="mr-4"
            >
              Далее
            </v-btn>
            <v-btn text>
              Отмена
            </v-btn>
          </v-stepper-content>
          <v-stepper-step
              complete-icon="mdi-check"
              :complete="step > 2"
              step="2"
          >
            Доходы
          </v-stepper-step>
          <v-stepper-content step="2">
            <v-card
                color="grey lighten-1"
                class="mb-12"
                height="200px"
            ></v-card>
            <v-btn
                color="primary"
                @click="e6 = 3"
            >
              Далее
            </v-btn>
            <v-btn text @click="step--">
              Назад
            </v-btn>
          </v-stepper-content>
          <v-stepper-step
              complete-icon="mdi-check"
              editable
              :complete="step > 3"
              step="3"
          >
            Обязательства
          </v-stepper-step>
          <v-stepper-content step="3">
            <v-card
                color="grey lighten-1"
                class="mb-12"
                height="200px"
            ></v-card>
            <v-btn
                color="primary"
                @click="step = 4"
            >
              Continue
            </v-btn>
            <v-btn text>
              Cancel
            </v-btn>
          </v-stepper-content>
          <v-stepper-step step="4">
            Имущество и сделки
          </v-stepper-step>
          <v-stepper-content step="4">
            <v-card
                color="grey lighten-1"
                class="mb-12"
                height="200px"
            ></v-card>
            <v-btn
                color="primary"
                @click="step = 1"
            >
              Сохранить
            </v-btn>
            <v-btn text>
              Отмена
            </v-btn>
          </v-stepper-content>
        </v-stepper>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  name: "ProjectSetupWizard",
  data: () => ({
    step: 1,
    rules: {
      required: [
        v => !!v || 'Не может быть пустым'
      ],
      fileEmpty: [
        v => v.length < 1 || 'Не загружено ни одного файла'
      ]
    },
    questionnaire: {
      personalInfo: {
        valid: false,
        lastName: '', // Фамилия
        firstName: '', // Имя
        middleName: '', // Отчество
        passport: [],
        inn: [],
        snils: [],
        marriage: {
          status: false,
          spouse: '',
          date: '',
          file: []
        },
        divorce: {
          status: false,
          date: '',
          file: []
        },
        children: []
      },
    }
  }),
  methods: {
    nextStep() {

      switch (this.step) {
        case 1:
          if (this.$refs.personalInfo.validate()) {
            if (this.checkFile(this.questionnaire.personalInfo.passport)
                && this.checkFile(this.questionnaire.personalInfo.inn)
                && this.checkFile(this.questionnaire.personalInfo.snils)) {
              this.step += 1
            }
          }
          break
      }
    },
    openFileUpload(id) {
      document.getElementById(id).click()
    },
    generateURI(file) {
      return URL.createObjectURL(file)
    },
    removePassportFile(fileType, file, child=null) {
      console.log(fileType)
      if (fileType === 'password') {
        this.questionnaire.personalInfo.passport = this.questionnaire.personalInfo.passport.filter(obj => obj !== file)
      } else if (fileType === 'inn') {
        this.questionnaire.personalInfo.inn = this.questionnaire.personalInfo.inn.filter(obj => obj !== file)
      } else if (fileType === 'snils') {
        this.questionnaire.personalInfo.snils = this.questionnaire.personalInfo.snils.filter(obj => obj !== file)
      } else if (fileType === 'marriage') {
        this.questionnaire.personalInfo.marriage.file = this.questionnaire.personalInfo.marriage.file.filter(obj => obj !== file)
      } else if (fileType === 'divorce') {
        this.questionnaire.personalInfo.divorce.file = this.questionnaire.personalInfo.divorce.file.filter(obj => obj !== file)
      }else if (child) {
          child.file  = child.file.filter(obj => obj !== file)
        }
    },
    addFile(fileType, e, child = null) {
      console.log(fileType)
      e.preventDefault()
      let addedFiles = e.target.files;
      ([...addedFiles]).forEach(f => {
        if (fileType === 'password') {
          this.questionnaire.personalInfo.passport.unshift(f)
        } else if (fileType === 'inn') {
          this.questionnaire.personalInfo.inn.unshift(f)
        } else if (fileType === 'snils') {
          this.questionnaire.personalInfo.snils.unshift(f)
        } else if (fileType === 'marriage') {
          this.questionnaire.personalInfo.marriage.file.unshift(f)
        } else if (fileType === 'divorce') {
          this.questionnaire.personalInfo.divorce.file.unshift(f)
        } else if (child) {
          child.file.push(f)
        }

      })
    },
    checkFile(files) {
      if (files.length >= 1) {
        return true
      }
      return false
    },
    addChild() {
      let child = {
        name: '',
        birthday: '',
        file: []
      }
      this.questionnaire.personalInfo.children.push(child)
    },
    removeChild(child) {
      this.questionnaire.personalInfo.children = this.questionnaire.personalInfo.children.filter(obj => obj != child)
    }
  },
}
</script>

<style scoped>
>>> .v-card {
  overflow-y: scroll;
}

>>> .v-stepper__step__step {
  width: 40px;
  height: 40px;
  min-width: 40px;
  font-size: 18px;
}

>>> .v-stepper__content {
  margin: -8px -36px -16px 43px !important;
}

#passport-file-field {
  display: none !important;
}

span.has-error {
  color: #ff5252;
}

span.marriage-inactive {
  color: rgba(82, 82, 82, 0.54)
}

span.marriage-active {
  color: rgb(0, 0, 0)
}
</style>