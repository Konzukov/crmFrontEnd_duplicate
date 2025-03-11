<template>
  <v-card flat width="100%" height="100%">
    <v-card-title class="justify-center pb-4">
      <v-row justify="center" class="pb-2">
        <template v-if="rectifiedPhysicalPerson">
          Редактирование {{ rectifiedPhysicalPerson.fullName }}
        </template>
        <template v-else>Новое физ. лицо</template>
      </v-row>
    </v-card-title>
    <v-card-text class="create-form pl-4 pr-4 pb-4 mb-3">
      <v-form lazy-validation v-model="valid" class="mt-4" ref="physicalPersonCreateForm">
        <v-row justify="start">
          <v-col cols="4" class="pt-0 pb-0">
            <v-avatar class="photo" size="128" tile @click="loadImage"></v-avatar>
          </v-col>
          <v-col cols="8">
            <v-row justify="start">
              <v-col md="12" lg="12" sm="12" xs="12" class="pt-0 pb-0">
                <v-text-field class="required" :rules="rules.required" outlined dense label="Фамилия"
                              v-model.trim="form.last_name"></v-text-field>
              </v-col>
              <v-col md="6" lg="6" sm="12" xs="12" class="pt-0 pb-0">
                <v-text-field class="required" :rules="rules.required" outlined dense label="Имя"
                              v-model.trim="form.first_name"></v-text-field>
              </v-col>
              <v-col md="6" lg="6" sm="12" xs="12" class="pt-0 pb-0">
                <v-text-field outlined dense label="Отчество"
                              v-model.trim="form.middle_name"></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          <v-row justify="start" class="mt-2">
            <v-col md="4" lg="4" sm="12" xs="12">
              <DatePicker v-model="form.birthday" value-type="format" format="DD.MM.YYYY" placeholder="Дата рождения"
                          :clearable="false"></DatePicker>
              <!--              <v-text-field outlined dense label="Дата рождения" v-model="form.birthday"-->
              <!--              ></v-text-field>-->
            </v-col>
            <v-col md="3" lg="3" sm="12" xs="12">
              <v-autocomplete outlined dense label="Гражданство" :items="countryList" item-value="id" item-text="name"
                              v-model="form.citizenship"></v-autocomplete>
            </v-col>
            <v-col md="5" lg="5" sm="12" xs="12">
              <v-textarea outlined dense label="Место рождения" rows="1"
                          v-model.trim="form.birthplace"></v-textarea>
            </v-col>
          </v-row>

        </v-row>
        <v-row justify="start">
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header>
                Паспортные данные
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <template v-for="item in passportCount">
                  <PhysicalPersonPassport @removeForm="removePassportForm(item.index)"
                                          :ref="item.ref"
                                          :key="item.index"
                                          :passport-data="item.data"
                  ></PhysicalPersonPassport>
                  <v-divider :key="item.ref"></v-divider>
                </template>

                <v-row justify="start" class="ma-2">
                  <v-col cols="3">
                    <v-btn color="success" @click="addPassport">Добавить</v-btn>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                Регистрационные данные
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <template v-for="item in registrationCount">
                  <PhysicalPersonRegistration @removeForm="removePassportForm(item.index)"
                                              :ref="item.ref"
                                              :key="item.index"
                                              :registration-data="item.data"
                  ></PhysicalPersonRegistration>
                  <v-divider :key="item.ref"></v-divider>
                </template>

                <v-row justify="start" class="ma-2">
                  <v-col cols="3">
                    <v-btn color="success" @click="addRegistration">Добавить</v-btn>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>Налоговые идентификаторы</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row justify="start" class="mt-2">
                  <v-col cols="4">
                    <v-text-field outlined dense label="СНИЛС" v-mask="'###-###-### ##'"
                                  v-model="form.snils"></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field outlined dense label="ИНН" v-mask="'############'"
                                  v-model="form.inn"></v-text-field>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions v-if="showActionButton" class="mt-3">
      <v-row justify="center">
        <v-col cols="4">
          <v-btn v-if="rectifiedPhysicalPerson" color="error" @click="resetForm">Закрыть</v-btn>
          <v-btn v-else color="error" @click="resetForm">Очистить</v-btn>
        </v-col>
        <v-col cols="4">
          <v-btn color="success" @click="save">Сохранить</v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
    <v-dialog
        v-model="savingData"
        hide-overlay
        persistent
        height="300"
        width="300"
    >
      <v-card
          color="primary"
          dark
      >
        <v-card-text>
          <template v-if="!savingDone">
            Сохранение данных
            <v-progress-linear
                indeterminate
                color="white"
                class="mb-0"
            ></v-progress-linear>
          </template>
          <template v-else>
            Данные сохранены
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import PhysicalPersonPassport from "@/components/referenceBook/PhysicalPerson/PhysicalPersonPassport";
import PhysicalPersonRegistration from "@/components/referenceBook/PhysicalPerson/PhysicalPersonRegistration";
import {mapGetters} from 'vuex'
import moment from "moment";

export default {
  props: {
    rectifiedPhysicalPerson: Object,
    showActionButton: {
      type: Boolean,
      default: true
    },
    callSave: Boolean,
    yaml: {
      type: Object
    }
  },
  name: "PhysicalPersonCreate",
  data: () => ({
    valid: false,
    savingData: false,
    savingDone: false,
    passportCount: [],
    registrationCount: [],
    registrationFormsData: [],
    passportFormsData: [],
    date: null,
    form: {
      pk: '',
      last_name: '',
      first_name: '',
      middle_name: '',
      birthday: '',
      birthplace: '',
      citizenship: '',
      hasPermission: false,
      snils: '',
      inn: null,
      communication_email: ''
    },
    rules: {
      required: [
        v => !!v || 'Данное поле обязательно',
      ],
    },

  }),
  computed: {
    ...mapGetters({
      countryList: 'countryListData'
    })
  },
  methods: {
    handleInput(event) {
      const input = event.target.value;
      console.log(event.target.value)
      // Проверяем, что введенная строка соответствует формату даты
      if (/^\d{2}\.\d{2}\.\d{4}$/.test(input)) {
        this.form.birthday = input;
        this.date = new Date(input.replace(/\./g, '/'));
      } else {
        this.formattedDate = '';
      }
    },
    handlePaste(event) {
      const clipboardData = event.clipboardData || window.clipboardData;
      let pastedText = '';

      if (clipboardData) {
        pastedText = clipboardData.getData('text');
      }

      // Проверяем, что скопированный текст соответствует формату даты
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(pastedText)) {
        this.formattedDate = pastedText.replace(/\//g, '.');
        this.date = new Date(pastedText);
      }
    },
    updateData() {
      this.passportCount = []
      this.passportFormsData = []
      this.registrationCount = []
      this.registrationFormsData = []
      this.$store.dispatch('getPhysicalPersonDetail', this.rectifiedPhysicalPerson['pk']).then(data => {
        Object.keys(this.form).forEach(key => {
          if (key === 'birthday') {
            this.form[key] = moment(data[key]).format('DD.MM.YYYY')
          } else {
            this.form[key] = data[key]
          }
        })
        if (data['passports'].length > 0) {
          data['passports'].forEach((obj, index) => {
            this.passportCount.push(
                {index, ref: `passportComponent${index}`, data: obj}
            )
          })
        }
        if (data['registration'].length > 0) {
          data['registration'].forEach((obj, index) => {
            this.registrationCount.push(
                {index, ref: `registrationComponent${index}`, data: obj}
            )
          })
        }
      })
    },
    loadImage() {
      console.log('call')
    },
    addPassport() {
      const passportComponentLength = this.passportCount.length
      this.passportCount.push({
        index: passportComponentLength + 1,
        ref: `passportComponent${passportComponentLength}`,
        data: {}
      })
    },
    addRegistration() {
      const registrationComponentLength = this.registrationCount.length
      this.registrationCount.push({
        index: registrationComponentLength + 1,
        ref: `registrationComponent${registrationComponentLength}`,
        data: {}
      })
    },
    removePassportForm(index) {
      this.passportCount = this.passportCount.filter(obj => {
        if (obj.index !== index) return obj
      })
    },
    resetForm() {
      if (this.rectifiedPhysicalPerson) {
        Object.assign(this.$data, this.$options.data())
        this.$emit('clearRectified')
      } else {
        this.$refs.physicalPersonCreateForm.reset()
        this.passportFormsData = []
        this.passportCount = []
      }

    },
    prepareFormData() {
      let formData = new FormData()
      Object.entries(this.form).forEach(([key, value]) => {
        console.log(key, value)
        if (value) {
          if (key === 'birthday') {
            if (this.form[key] !== "Invalid date") {
              formData.append(key, moment(this.form[key], 'DD.MM.YYYY').format('YYYY-MM-DD'))
            }
          } else {
            formData.append(key, this.form[key])
          }
        } else {
          if (key !== 'pk') {
            formData.append(key, '')
          }
        }
      })
      return formData
    },
    async save() {
      this.passportFormsData = []
      this.savingData = true
      if (this.$refs.physicalPersonCreateForm.validate()) {
        let formData = this.prepareFormData()
        //
        if (this.passportCount.length > 0) {
          console.log(this.passportCount.length)
          const refs = this.passportCount.map(obj => {
            return obj.ref
          })
          console.log(refs)
          for (let ref of refs) {
            console.log(ref)
            let passportCreateComponent = this.$refs[ref]
            if (passportCreateComponent) {
              let data = passportCreateComponent[0].save()
              if (data) {
                for (let pair of data.entries()) {
                  console.log(pair[0] + ', ' + pair[1]);
                }
                this.passportFormsData.push(data)
              }
            }
          }
        }
        if (this.registrationCount.length > 0) {
          const refs = this.registrationCount.map(obj => {
            return obj.ref
          })
          for (let ref of refs) {
            let registrationCreateComponent = this.$refs[ref]
            if (registrationCreateComponent) {
              let data = registrationCreateComponent[0].save()
              if (data) {
                this.registrationFormsData.push(data)
              }
            }
          }
        }
        if (!this.form.pk) {
          this.$store.dispatch('createPhysicalPerson', formData).then(async (res) => {
            this.form.pk = res['pk']
            if (this.passportCount.length === this.passportFormsData.length) {
              for (let passportFormData of this.passportFormsData) {
                passportFormData.append('physical_person', res['pk'])
                await this.$store.dispatch('createPhysicalPersonPassport', passportFormData).then(res => {
                  console.log(res)
                }).catch(err => {
                  setTimeout(() => {
                    this.savingData = false
                  }, 1500)
                })
              }
            }
            if (this.registrationCount.length === this.registrationFormsData.length) {
              for (let registrationFormData of this.registrationFormsData) {
                registrationFormData.append('physical_person', res['pk'])
                await this.$store.dispatch('createPhysicalPersonRegistration', registrationFormData).then(res => {
                  console.log(res)
                }).catch(err => {
                  setTimeout(() => {
                    this.savingData = false
                  }, 1500)
                })
              }
            }
            this.savingDone = true
            setTimeout(() => {
              this.savingData = false
            }, 1500)
            this.$emit('closeModal', res)
          }).catch(err => {
            setTimeout(() => {
              this.savingData = false
            }, 1500)
          })
        } else {
          for (let passportFormData of this.passportFormsData) {
            if (passportFormData.get('pk')) {
              await this.$store.dispatch('editPhysicalPersonPassport', {
                formData: passportFormData,
                pk: passportFormData.get('pk')
              }).then(() => {
                this.savingDone = true
                setTimeout(() => {
                  this.savingData = false
                }, 1500)
              })
            } else {
              passportFormData.append('physical_person', this.form.pk)
              await this.$store.dispatch('createPhysicalPersonPassport', passportFormData).then(() => {
                this.savingDone = true
                setTimeout(() => {
                  this.savingData = false
                }, 1500)
              }).catch(err => {
                setTimeout(() => {
                  this.savingData = false
                }, 5500)
              })
            }
          }
          for (let registrationFormData of this.registrationFormsData) {
            console.log(registrationFormData.get('pk'))
            if (registrationFormData.get('pk')) {
              console.log('registrationFormsData edit')
              await this.$store.dispatch('editPhysicalPersonRegistration', {
                formData: registrationFormData,
                pk: registrationFormData.get('pk')
              }).then(() => {
                this.savingDone = true
                setTimeout(() => {
                  this.savingData = false
                }, 1500)
              }).catch(err => {
                setTimeout(() => {
                  this.savingData = false
                }, 1500)
              })
            } else {
              console.log('passport create')
              registrationFormData.append('physical_person', this.form.pk)
              await this.$store.dispatch('createPhysicalPersonRegistration', registrationFormData).then(() => {
                this.savingDone = true
                setTimeout(() => {
                  this.savingData = false
                }, 1500)
              })
            }
          }
          this.$store.dispatch('editPhysicalPerson', {formData, pk: this.form.pk}).then(async (res) => {
            this.savingDone = true
            setTimeout(() => {
              this.savingData = false
            }, 1500)
          })
        }
        setTimeout(() => {
          this.updateData()
        }, 500)
      }
    }
  },
  watch: {
    yaml(val) {
      if (val) {
        const person = val['citizen']
        if (person.hasOwnProperty('date_of_birth')) {
          this.form.birthday = moment(person['date_of_birth'], 'DD.MM.YYYY').format('DD.MM.YYYY')
        }
        this.form.birthplace = person?.['place_of_birth']
        this.form.inn = person?.inn
        this.form.snils = person?.snils
        if (person.hasOwnProperty('registration_address')) {
          const registrationComponentLength = this.registrationCount.length
          this.registrationCount.push({
            index: registrationComponentLength + 1,
            ref: `registrationComponent${registrationComponentLength}`,
            data: {address: person['registration_address']}
          })
        }
      }
    },
    rectifiedPhysicalPerson(val) {
      if (val) this.updateData()
    },
    callSave(val) {
      if (val) {
        this.save()
      }
    }
  },
  components: {PhysicalPersonPassport, PhysicalPersonRegistration},
  created() {
    this.$store.dispatch('getCountry')
    if (this.rectifiedPhysicalPerson) {
      this.updateData()
    }
  }
}
</script>

<style scoped>

>>> .mx-input:hover, >>> .mx-input:focus {
  border-color: #000000;
}

>>> .mx-input:focus {
  border: 2px solid black;
}

.v-card__title, .v-card__text {
  margin: 0;
  padding: 0;
}

input {
  font-family: Arial, sans-serif;
}

.v-card__text.create-form {
  height: 90%;
  overflow-y: auto;
  overflow-x: hidden;
}

.photo {
  border: 1px solid;
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
  border: 0.15em solid;
}

>>> .required.v-input--is-focused.error--text fieldset {
  border: 0.15em solid;
  color: rgb(167, 25, 25);
}

>>> .v-messages.error--text {
  max-width: fit-content;
  max-height: 40px;
}
</style>