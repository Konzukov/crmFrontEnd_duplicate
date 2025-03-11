<template>
  <v-form>
    <v-container fluid>
      <v-card flat>
        <v-card-title>
          <v-row justify="center">Добавление юридического лица</v-row>
        </v-card-title>
        <v-card-text class="mt-2 form">
          <v-row justify="start" class="mt-1">
            <v-col md="5" lg="5" sm="12" xs="12">
              <v-autocomplete outlined dense label="Категория юр. лица" :items="legalType"
                              hint="Укажите категорию юридического лица"
                              persistent-hint v-model="form.legal_type"></v-autocomplete>
            </v-col>
            <v-col md="7" lg="7" sm="12" xs="12">
              <v-text-field outlined dense label="Наименование" v-model="form.name"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="12">
              <v-text-field outlined dense label="Полное наименование" v-model="form.full_name"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col md="5" lg="5" sm="12" xs="12">
              <v-text-field outlined dense label="ИНН" v-model="form.inn"
                            @click:append-outer="loadEGRULData"
                            :error-messages="errorMessage.inn"
                            hint="Введите ИНН для получения данных из ЕГРЮЛ"
                            persistent-hint
                            append-outer-icon="mdi-sync"></v-text-field>
            </v-col>
            <v-col md="4" lg="4" sm="12" xs="12">
              <v-text-field dense outlined label="КПП" v-model="form.kpp"></v-text-field>
            </v-col>
            <v-col md="3" lg="3" sm="12" xs="12">
              <v-text-field dense outlined label="ОРГН" v-model="form.ogrn"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start" class="mb-2">
            <v-col md="6" lg="6" sm="12" xs="12">
              <v-textarea dense outlined label="Юридический адрес" rows="2" v-model="form.legal_address"></v-textarea>
            </v-col>
            <v-col md="6" lg="6" sm="12" xs="12">
              <v-textarea dense outlined label="Почтовый адрес" rows="2" v-model="form.postal_address"
                          append-outer-icon="mdi-content-copy"
              >
                <template v-slot:append-outer>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                          color="primary"
                          icon
                          dark
                          :disabled="!form.legal_address"
                          @click="copyAddress"
                          v-bind="attrs"
                          v-on="on"
                      >
                        <v-icon>
                          mdi-content-copy
                        </v-icon>
                      </v-btn>

                    </template>
                    <span>Скопировать юридический адрес</span>
                  </v-tooltip>
                </template>
              </v-textarea>
            </v-col>
          </v-row>
          <hr>
          <v-row justify="center"><h4 style="background-color: #FFFFFF">Дополнительные информация</h4></v-row>
          <template v-for="(item, i) in form.additional_info.communication">
            <v-row justify="start" class="mt-6" :key="i">
              <v-col md="5" lg="5" sm="12" xs="12">
                <v-autocomplete dense outlined label="Способ коммуникации" :items="communicationMethod"
                                v-model="form.additional_info['communication'][i]['type']"></v-autocomplete>
              </v-col>
              <v-col md="6" lg="6" sm="12" xs="12">
                <v-text-field dense outlined label=""
                              v-model="form.additional_info['communication'][i]['value']"></v-text-field>
              </v-col>
              <v-col md="1" lg="1" sm="1" xs="1">
                <v-btn icon v-if="i === form.additional_info['communication'].length - 1"
                       color="primary"
                       @click='form.additional_info.communication.push({type: "ElectronicMail", value: null})'
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </template>

          <v-row justify="start">
            <v-col lg="5" md="5" sm="12" xs="12">
              <v-text-field outlined dense label="Руководитель"
                            v-model="form.additional_info['supervisor']"></v-text-field>
            </v-col>
            <v-col lg="7" md="7" sm="12" xs="12">
              <v-text-field outlined dense label="Должность"
                            v-model="form.additional_info['supervisorTitle']"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col lg="2" md="2" sm="4" xs="4">
              <v-text-field outlined dense label="Код ОКВЭД"
                            v-model="form.additional_info['codeOKVED']"
              ></v-text-field>
            </v-col>
            <v-col lg="10" md="10" sm="8" xs="8">
              <v-text-field outlined dense label="Наименование ОКВЭД"
                            v-model="form.additional_info['nameOKVED']"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-row justify="space-around">
            <v-col cols="auto">
              <v-btn small color="error">{{ !form.id ? 'Очистить' : 'Отмена' }}</v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn small color="success" @click="createLegalEntity">{{ !form.id ? 'Создать' : 'Сохранить' }}</v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-container>
  </v-form>
</template>

<script>
import {CommunicationMethodType, LegalEntityType} from '@/const/dataTypes'

import {isObject} from 'lodash'

export default {
  name: "LegalEntityEditForm",
  props: ['legalData'],
  data: () => ({
    errorMessage: {
      inn: ''
    },
    form: {
      id: null,
      legal_type: "EMPTY",
      inn: null,
      ogrn: null,
      kpp: null,
      name: null,
      full_name: null,
      legal_address: null,
      postal_address: null,
      additional_info: {
        supervisor: null,
        supervisorTitle: null,
        codeOKVED: null,
        nameOKVED: null,
        communication: [
          {
            type: "ElectronicMail",
            value: null
          }
        ]
      }
    },
    legalType: LegalEntityType,
    communicationMethod: CommunicationMethodType
  }),
  methods: {
    prepareFormData() {
      const formData = new FormData();

      // Добавляем все поля из form
      Object.entries(this.form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (isObject(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }

        }
      });
      return formData;
    },
    copyAddress() {
      this.form.postal_address = this.form.legal_address
    },
    toTitleCase(str) {
      str = str.toLowerCase()
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    async loadEGRULData() {
      this.errorMessage.inn = ''
      const url = "https://egrul.itsoft.ru/";
      let inn = this.form.inn
      try {
        let req = await fetch(`${url}${inn}.json`);
        if (req.ok) {
          const data = await req.json()
          this.form.full_name = data['СвЮЛ']['СвНаимЮЛ']['@attributes']['НаимЮЛПолн']
          this.form.name = data['СвЮЛ']['СвНаимЮЛ']['СвНаимЮЛСокр']['@attributes']['НаимСокр']
          this.form.kpp = data['СвЮЛ']['@attributes']['КПП']
          this.form.ogrn = data['СвЮЛ']['@attributes']['ОГРН']
          let address = data['СвЮЛ']['СвАдресЮЛ']['АдресРФ']
          let postal_code = address['@attributes']['Индекс']
          let region = address['Регион']['@attributes']['НаимРегион'].replace(/Г\.?МОСКВА/gi, 'г.Москва')
          let city = address?.['Город']?.['@attributes']?.['НаимГород'] ?? null;
          if (city) {
            city = this.toTitleCase(city)
            let cityType = address['Город']['@attributes']['ТипГород']
            cityType = cityType.endsWith('.') ? cityType.toLowerCase() : `${cityType.toLowerCase()}.`
            city = cityType + city
          }
          city = city ? (city.endsWith('.') ? city : `${city}.`) : null;
          let streetType = address['Улица']['@attributes']['ТипУлица']
          streetType = streetType.endsWith('.') ? streetType : `${streetType}.`
          streetType = streetType.replace(/УЛ\.?/g, 'ул.')
              .replace(/ПЕР\.?/g, 'пер.')
              .replace(/Д\.?/g, 'д.');
          let street = this.toTitleCase(address['Улица']['@attributes']['НаимУлица'].toLowerCase())
          let frame = address?.['@attributes']?.['Корпус'] ?? null;
          if (frame) {
            frame = frame.replace(/СТР\.?/g, 'стр.')
          }
          let building = address?.['@attributes']?.['Дом'].replace(/Д\.?/g, 'д.');
          this.form.legal_address = `${postal_code}, ${region}, ${city || ''} ${streetType}${street}, ${frame || ''} ${building}`
          const supervisor = data['СвЮЛ']['СведДолжнФЛ']
          let supervisorName = supervisor['СвФЛ']['@attributes']
          this.form.additional_info['supervisor'] = this.toTitleCase(supervisorName['Фамилия']) + " " +
              this.toTitleCase(supervisorName['Имя']) + " " +
              this.toTitleCase(supervisorName['Отчество'])
          let supervisorTitle = supervisor['СвДолжн']['@attributes']
          this.form.additional_info['supervisorTitle'] = this.toTitleCase(supervisorTitle['НаимДолжн'])
          const mainOKVED = data['СвЮЛ']['СвОКВЭД']['СвОКВЭДОсн']['@attributes']
          this.form.additional_info['codeOKVED'] = mainOKVED['КодОКВЭД']
          this.form.additional_info['nameOKVED'] = mainOKVED['НаимОКВЭД']
          console.log('Данные EGRUL:', data);
        } else {
          this.errorMessage.inn = 'Проверьте корректность ИНН'
        }
      } catch (e) {
        this.errorMessage.inn = 'Проверьте корректность ИНН'
      }

    },
    createLegalEntity() {
      const formData = this.prepareFormData();

      this.$store.dispatch('createLegalEntityNew', formData).then(res => {
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
    }
  },
  watch: {
    legalData(val) {
      for (const [key, value] of Object.entries(val)) {
        this.form[key] = value
      }
    }
  }
}
</script>

<style scoped>
>>> .v-card {
  height: 100vh;
}

>>> .form {
  overflow-y: auto;
  max-height: 80%;
}

>>> .form .row .col {
  padding-bottom: 0;
  padding-top: 8px;

}
</style>