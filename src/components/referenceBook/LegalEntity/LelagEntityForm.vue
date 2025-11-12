<template>
  <v-form>
    <v-container fluid>
      <v-card flat>
        <v-card-title>
          <v-row justify="center">
            {{ !form.id ? 'Добавление юридического лица' : 'Редактирование юридического лица' }}
          </v-row>
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

          <v-expansion-panels flat multiple>
            <v-expansion-panel>
              <v-expansion-panel-header>Способы коммуникации</v-expansion-panel-header>
              <v-expansion-panel-content>
                <template v-if="form.communication.length > 0">
                  <v-row justify="start" v-for="(item, i) in form.communication" :key="i">
                    <v-col md="4" lg="4" sm="12" xs="12">
                      <v-autocomplete disabled outlined dense label="Способ коммуникации" :items="communicationMethod"
                                      v-model="item.communication_type"
                      ></v-autocomplete>
                    </v-col>
                    <v-col md="7" lg="7" sm="11" xs="11">
                      <template v-if="form.communication_type === 'Email'">
                        <v-text-field disabled dense outlined label="Email" v-model="item.value"></v-text-field>
                      </template>
                      <template v-else>
                        <v-textarea disabled dense outlined label="Почтовый адрес" rows="2"
                                    v-model="item.value"></v-textarea>
                      </template>
                    </v-col>
                    <v-col md="1" lg="1" sm="1" xs="1" class="mt-3">
                      <v-row align="center">
                        <v-btn icon small color="primary" @click="editCommunication(item)">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                      </v-row>
                      <v-row align="center">
                        <v-btn icon small color="error" @click="deleteCommunication(item)">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </v-row>
                    </v-col>
                  </v-row>
                </template>
                <v-row justify="end" class="mb-2">
                  <v-btn :disabled="!form.id" color="primary" @click="addCommunication">
                    Добавить
                  </v-btn>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>Должностное лицо</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row justify="start" class="mb-2">
                  <v-col lg="5" md="5" sm="12" xs="12">
                    <v-text-field outlined dense label="Руководитель"
                                  v-model="form.additional_info['supervisor']"></v-text-field>
                  </v-col>
                  <v-col lg="7" md="7" sm="12" xs="12">
                    <v-text-field outlined dense label="Должность"
                                  v-model="form.additional_info['supervisorTitle']"></v-text-field>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>Основной вид деятельности</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row justify="start">
                  <v-col lg="2" md="2" sm="4" xs="4">
                    <v-text-field outlined dense label="Код ОКВЭД"
                                  v-model="form.okved_code"
                    ></v-text-field>
                  </v-col>
                  <v-col lg="10" md="10" sm="8" xs="8">
                    <v-text-field outlined dense label="Наименование ОКВЭД"
                                  v-model="form.okved_name"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>Дополнительные сведенья</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-card
                    v-for="(info, index) in filteredAdditionalInfo"
                    :key="index"
                    style="height: max-content"
                >
                  <v-card-text>
                    <v-row justify="start" class="mb-2">
                      <v-col class="pt-0" lg="7" md="7" sm="12" xs="12">
                        <v-autocomplete dense outlined label="Доп. данные"
                                        :items="additionalField"
                                        item-value="val"
                                        item-text="text"
                                        v-model="info.type"
                        ></v-autocomplete>
                      </v-col>
                      <v-col class="pt-0" lg="5" md="5" sm="12" xs="12">
                        <template v-if="info.type==='SRO_REG_DATE'">
                          <DatePicker v-model="info.value" value-type="format" format="DD.MM.YYYY"></DatePicker>
                        </template>
                        <v-text-field v-else outlined dense label="Значение"
                                      v-model="info.value"></v-text-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
                <v-btn
                    small
                    color="primary"
                    @click="addAdditionalInfo"
                    class="mt-2"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Добавить сведенья
                </v-btn>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions v-if="showActionButton">
          <v-row justify="space-around">
            <v-col cols="auto">
              <v-btn small color="error" @click="closeEdit">{{ !form.id ? 'Очистить' : 'Отмена' }}</v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn small color="success" @click="createLegalEntity">{{ !form.id ? 'Создать' : 'Сохранить' }}</v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-container>
    <CommunicationForm @update="update(form.id)"></CommunicationForm>
    <SystemMessage :state.sync="state"/>
    <ConfirmDialog @confirm="confirmDeleteCommunication"></ConfirmDialog>
  </v-form>
</template>

<script>
import {CommunicationMethodType, LegalEntityType} from '@/const/dataTypes'
import CommunicationForm from "@/components/referenceBook/Communication/CommunicationForm.vue";
import {eventBus} from "@/bus";
import SystemMessage from "@/components/UI/SystemMessage.vue";
import ConfirmDialog from "@/components/UI/ConfirmDialog.vue";
import moment from "moment";

export default {
  components: {ConfirmDialog, SystemMessage, CommunicationForm},
  props: {
    legalEntityData: {
      type: Object
    },
    callSave: {
      type: Boolean,
      default: true
    },
    showActionButton: {
      type: Boolean,
      default: true
    },
  },
  name: "LegalEntityForm",
  data: () => ({
    state: null,
    additionalField: [
      {val: 'SRO_NUM', text: 'Номер саморегулируемой организации'},
      {val: 'SRO_REG_DATE', text: 'Дата регистрации саморегулируемой организации'},
      {val: 'court_code', text: 'Код суда'},
    ],
    errorMessage: {
      inn: ''
    },
    action: 'create',
    additionalInfoList: [],
    nextId: 1,
    form: {
      id: null,
      pk: null,
      legal_type: "EMPTY",
      inn: null,
      ogrn: null,
      kpp: null,
      name: null,
      full_name: null,
      legal_address: null,
      postal_address: null,
      okved_code: null,
      okved_name: null,
      communication: [],
      additional_info: {
        supervisor: null,
        supervisorTitle: null,
        update_date: [],
      }
    },
    legalType: LegalEntityType,
    communicationMethod: CommunicationMethodType
  }),
  methods: {
    addAdditionalInfo() {
      this.additionalInfoList.push({
        id: this.nextId++,
        type: '',
        value: ''
      });
    },
    closeEdit() {
      Object.assign(this.$data, this.$options.data())
    },
    update(id) {
      this.additionalInfoList = [];
      this.nextId = 1;

      if (!id) return;

      this.$store.dispatch('getLegalEntityDetailInfo', id)
          .then(item => {
            // Простое копирование данных
            this.form = {...this.form, ...item};

            // Обработка additional_info
            this.processAdditionalInfo(item.additional_info);
          })
          .catch(error => {
            console.error("Ошибка загрузки данных:", error);
            this.state = 'error';
            eventBus.$emit('showSystemMessage', {
              response: 'Ошибка загрузки данных юридического лица',
              state: this.state
            });
          });
    },
    processAdditionalInfo(additionalInfo) {
      try {
        // Конвертация строки в объект
        const info = typeof additionalInfo === 'string'
            ? JSON.parse(additionalInfo)
            : additionalInfo || {};

        // Сохраняем системные поля
        this.form.additional_info = {
          supervisor: info.supervisor || null,
          supervisorTitle: info.supervisorTitle || null,
          update_date: info.update_date || []
        };

        // Обрабатываем дополнительные поля
        const systemFields = ['supervisor', 'supervisorTitle', 'update_date'];
        Object.entries(info).forEach(([key, value]) => {
          if (!systemFields.includes(key)) {
            this.additionalInfoList.push({
              id: this.nextId++,
              type: key,
              value: value
            });
          }
        });
      } catch (e) {
        console.error("Ошибка обработки additional_info:", e);
        this.form.additional_info = {
          supervisor: null,
          supervisorTitle: null,
          update_date: []
        };
      }
    },
    addCommunication() {
      eventBus.$emit('addCommunication', {legal: this.form.id})
    },
    editCommunication(item) {
      eventBus.$emit('editCommunication', item)
    },
    confirmDeleteCommunication(item) {
      this.$store.dispatch('deleteCommunication', {id: item.id}).then(() => {
        this.update(this.form.id)
      })
    },
    deleteCommunication(item) {
      eventBus.$emit('deleteCommunication', item)
    },
    formatDateForStorage(dateString) {
      if (!dateString) return '';

      // Пробуем разные форматы
      const formats = ['DD.MM.YYYY', 'YYYY-MM-DD', 'YYYY/MM/DD'];
      for (const format of formats) {
        const date = moment(dateString, format);
        if (date.isValid()) {
          return date.format('YYYY-MM-DD');
        }
      }

      return dateString; // Возвращаем как есть, если не распознано
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
      let req;
      try {
        req = await fetch(`${url}${inn}.json`);
      } catch (e) {
        this.errorMessage.inn = 'Проверьте корректность ИНН'
      }
      if (req.ok) {
        const data = await req.json()
        if (!this.form.full_name) {
          this.form.full_name = data['СвЮЛ']['СвНаимЮЛ']['@attributes']['НаимЮЛПолн']
        }
        if (!this.form.name) {
          this.form.name = data['СвЮЛ']['СвНаимЮЛ']['СвНаимЮЛСокр']['@attributes']['НаимСокр']
        }
        this.form.kpp = data['СвЮЛ']['@attributes']['КПП']
        this.form.ogrn = data['СвЮЛ']['@attributes']['ОГРН']
        let address = data['СвЮЛ']['СвАдресЮЛ']
        if (address.hasOwnProperty('АдресРФ')) {
          address = address['АдресРФ']
        } else {
          address = address['СвАдрЮЛФИАС']
        }
        let postal_code = address['@attributes']['Индекс']
        let region;
        if (address['Регион'].hasOwnProperty('@attributes')) {
          region = address['Регион']['@attributes']['НаимРегион'].replace(/Г\.?МОСКВА/gi, 'г. Москва')
        } else {
          region = address['НаимРегион'].replace(/Г\.?МОСКВА/gi, 'г. Москва')
        }
        let city = address?.['Город']?.['@attributes']?.['НаимГород'] ?? null;
        if (city) {
          city = this.toTitleCase(city)
          let cityType = address['Город']['@attributes']['ТипГород']
          cityType = cityType.endsWith('.') ? `${cityType.toLowerCase()} ` : `${cityType.toLowerCase()}. `
          city = cityType + city
        }
        city = city ? (city.endsWith('.') ? city : `${city}.`) : null;
        let streetType;
        let street;
        if (address.hasOwnProperty('Улица')) {
          streetType = address['Улица']['@attributes']['ТипУлица']
          street = this.toTitleCase(address['Улица']['@attributes']['НаимУлица'].toLowerCase())
        } else {
          streetType = address['ЭлУлДорСети']['@attributes']['Тип']
          street = this.toTitleCase(address['ЭлУлДорСети']['@attributes']['Наим'].toLowerCase())
        }
        streetType = streetType.endsWith('.') ? streetType : `${streetType}.`
        streetType = streetType.replace(/УЛ\.?/g, 'ул. ')
            .replace(/ПЕР\.?/g, 'пер. ')
            .replace(/Д\.?/g, 'д. ')
            .replace(/НАБ\.?/g, 'наб. ');

        let frame = address?.['@attributes']?.['Корпус'] ?? null;
        if (frame) {
          frame = frame.replace(/СТР\.?/g, 'стр.')
        }
        let building;
        if (address.hasOwnProperty('Здание')) {
          let buildingData = address['Здание']['@attributes']
          let buildingType = buildingData['Тип'].replace(/Д\.?/g, 'д.').replace(/ЗД\.?/g, 'зд.')
          building = buildingType + buildingData['Номер']
        } else {
          building = address?.['@attributes']?.['Дом'].replace(/Д\.?/g, 'д.').replace(/ЗД\.?/g, 'зд.');
        }
        this.form.legal_address = `${postal_code}, ${region}, ${city || ''} ${streetType}${street}, ${frame || ''} ${building}`
        const supervisor = data['СвЮЛ']['СведДолжнФЛ']
        if (supervisor.hasOwnProperty('СвФЛ')) {
          let supervisorName = supervisor['СвФЛ']['@attributes']
          this.form.additional_info['supervisor'] = this.toTitleCase(supervisorName['Фамилия']) + " " +
              this.toTitleCase(supervisorName['Имя']) + " " +
              this.toTitleCase(supervisorName['Отчество'])
          let supervisorTitle = supervisor['СвДолжн']['@attributes']
          this.form.additional_info['supervisorTitle'] = this.toTitleCase(supervisorTitle['НаимДолжн'])
        }

        const mainOKVED = data['СвЮЛ']['СвОКВЭД']['СвОКВЭДОсн']['@attributes']
        this.form.okved_code = mainOKVED['КодОКВЭД']
        this.form.okved_name = mainOKVED['НаимОКВЭД']
        this.form.additional_info.update_date.push({
          date: new Date(),
          user_id: this.userData['id'],
          username: this.userData['username']
        })
      } else {
        this.errorMessage.inn = 'Проверьте корректность ИНН'
      }
    },
    createLegalEntity() {
      if (!this.form.id) {
        this.$store.dispatch('createLegalEntity', this.form).then(res => {
          this.state = 'success'
          eventBus.$emit('showSystemMessage', {response: res, state: this.state, send: false})
        }).catch(err => {
          this.state = 'error'
          eventBus.$emit('showSystemMessage', {response: err, state: this.state, send: false})
        })
      } else {
        this.$store.dispatch('editLegalEntity', this.form).then(res => {
          this.state = 'success'
          eventBus.$emit('showSystemMessage', {response: res, state: this.state, send: false})
        }).catch(err => {
          this.state = 'error'
          eventBus.$emit('showSystemMessage', {response: err, state: this.state, send: false})
        })
      }
    }
  },
  watch: {
    legalEntityData(val) {
      if (val) {
        this.update(val.id)
      }
    },
    additionalInfoList: {
      deep: true,
      handler() {
        // Автоматическое обновление form.additional_info
        const updatedInfo = {...this.form.additional_info};

        // Удаляем старые дополнительные поля
        const systemFields = ['supervisor', 'supervisorTitle', 'update_date'];
        Object.keys(updatedInfo).forEach(key => {
          if (!systemFields.includes(key)) delete updatedInfo[key];
        });

        // Добавляем новые поля
        this.additionalInfoList.forEach(item => {
          if (item.type && item.value) {
            updatedInfo[item.type] = item.value;
          }
        });

        this.form.additional_info = updatedInfo;
      }
    }
  },
  computed: {
    filteredAdditionalInfo() {
      return this.additionalInfoList;
    },
    userData() {
      return this.$store.getters.authUserData
    },
  },
  created() {
    if (this.legalEntityData) {
      this.update(this.legalEntityData.id)
    }
    this.$parent.$on('legalEntityEdit', item => {
      this.update(item.id)
    })
  }
}
</script>

<style scoped>
>>> .v-card {
  height: 100vh;
}

>>> .form {
  overflow-y: auto;
  max-height: 75%;
  min-height: 75%;
}

>>> .form .row .col {
  padding-bottom: 0;
  padding-top: 8px;

}

.mx-datepicker {
  position: relative;
  display: inline-block;
  width: 100%;
}
</style>