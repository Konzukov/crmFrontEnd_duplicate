<template>
  <v-card height="100%">
    <v-card-title v-if="showActionButton">
      <span>{{ formTitle }}</span>
      <v-spacer></v-spacer>
      <v-btn icon @click="$emit('cancel')" v-if="!isCreating">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-form ref="form" v-model="valid" style="max-height: 75%">
        <v-tabs v-model="tab">
          <v-tab>Основное</v-tab>
          <v-tab>Гражданства</v-tab>
          <v-tab>Паспорта</v-tab>
          <v-tab>Коммуникация</v-tab>
          <v-tab>Семья</v-tab>
          <v-tab>Спец. статусы</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab" class="mt-4">
          <v-tab-item>
            <v-card>
              <v-card-text>
                <v-row class="mt-3">
                  <v-col cols="12" md="4">
                    <v-text-field outlined dense v-model="editedItem.last_name" label="Фамилия*" :rules="requiredRules"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field outlined dense v-model="editedItem.first_name" label="Имя*" :rules="requiredRules"/>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field outlined dense v-model="editedItem.middle_name" label="Отчество"/>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select outlined dense v-model="editedItem.gender" :items="genders" label="Пол*"
                              :rules="requiredRules"/>
                  </v-col>
                  <v-col cols="12" md="6">
                    <DatePicker v-model="editedItem.birthday" value-type="format" format="DD.MM.YYYY"
                                placeholder="Дата рождения"
                                @keypress="isNumber($event)"
                                :clearable="false"></DatePicker>
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-text-field outlined dense v-model="editedItem.birthplace"
                                  label="Место рождения"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <!-- Гражданства -->
          <v-tab-item>
            <v-card v-for="(citizenship, index) in editedItem.citizenships"
                    :key="index" class="mb-4">
              <v-card-text class="citizenship-content">
                <v-row justify="start">
                  <v-col cols="12" md="6" class="pb-0">
                    <v-select dense outlined v-model="citizenship.country" :items="countries" label="Страна*"
                              item-text="name"
                              item-value="id"
                              :rules="requiredRules"
                              return-object
                    />
                  </v-col>
                  <v-col cols="12" md="6" class="pb-0">
                    <v-select dense outlined v-model="citizenship.obtaining_method"
                              :items="obtainingMethods"
                              item-value="value"
                              item-text="text"
                              label="Способ получения*"
                              :rules="requiredRules"
                    />
                  </v-col>
                </v-row>
                <v-row justify="start">
                  <v-col cols="12" md="4" xl="4" class="pt-0">
                    <DatePicker v-model="citizenship.date_begin" value-type="format" format="DD.MM.YYYY"
                                placeholder="Дата получения"
                                @keypress="isNumber($event)"
                                :clearable="false"></DatePicker>
                  </v-col>
                  <v-col cols="12" md="4" xl="4" class="pt-0">
                    <DatePicker v-model="citizenship.date_end" value-type="format" format="DD.MM.YYYY"
                                placeholder="Дата прекращения гражданства"
                                :clearable="false"></DatePicker>
                  </v-col>
                </v-row>
                <v-expansion-panels flat class="mt-4 mb-4 identifier-panel">
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      Идентификаторы
                      <template v-slot:actions>
                        <v-icon>mdi-chevron-down</v-icon>
                      </template>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-card
                          v-for="(identifier, idIndex) in identifierLists[citizenship.id || citizenship.tempId]"
                          :key="`${citizenship.id}-${idIndex}`"
                          class="mb-2 identifier-card"
                      >
                        <v-card-text>
                          <v-row>
                            <v-col cols="12" md="4">
                              <v-select
                                  outlined
                                  dense
                                  v-model="identifier.type"
                                  :items="filteredIdentifierTypes(citizenship.id || citizenship.tempId)"
                                  label="Тип идентификатора"
                                  item-text="val"
                                  item-value="key"
                              />
                            </v-col>
                            <v-col cols="12" md="7">
                              <v-text-field
                                  v-mask="getMaskType(identifier.type)"
                                  @paste="formatIdentifierValue(identifier)"
                                  :rules="[ v => validateIdentifier(v, identifier.type) || false ]"
                                  outlined
                                  dense
                                  v-model="identifier.value"
                                  label="Значение"
                                  :append-outer-icon="identifier.type === 'INN'? 'mdi-refresh': ''"
                                  @click:append-outer="loadEGRULData(identifier.value)"
                              />
                            </v-col>
                            <v-col cols="12" md="1" class="d-flex align-center">
                              <v-btn
                                  icon
                                  small
                                  color="error"
                                  @click="removeIdentifier(citizenship.id || citizenship.tempId, identifier)"
                              >
                                <v-icon>mdi-delete</v-icon>
                              </v-btn>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                      <v-btn
                          :disabled="!hasAvailableIdentifierTypes(citizenship.id || citizenship.tempId)"
                          small
                          color="primary"
                          @click="addIdentifier(citizenship)"
                          class="mt-2"
                      >
                        <v-icon left>mdi-plus</v-icon>
                        Добавить идентификатор
                      </v-btn>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      Регистрация
                      <template v-slot:actions>
                        <v-icon>mdi-chevron-down</v-icon>
                      </template>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-card
                          v-for="(registration, idIndex) in registrationList[citizenship.id]"
                          :key="idIndex"
                          class="mb-2 identifier-card"
                      >
                        <v-card-text>
                          <v-row justify="start">
                            <v-col cols="12" md="11" sm="11">
                              <v-row align="center">
                                <v-col cols="12" md="4">
                                  <DatePicker v-model="registration.start" value-type="format" format="DD.MM.YYYY"
                                              placeholder="Действует с"
                                              :clearable="false"></DatePicker>
                                </v-col>
                                <v-col cols="12" md="4">
                                  <DatePicker v-model="registration.end" value-type="format" format="DD.MM.YYYY"
                                              placeholder="Действует по"
                                              :clearable="false"></DatePicker>
                                </v-col>
                              </v-row>
                              <v-row>
                                <v-col cols="12" md="4" class="pt-0 pb-0">
                                  <v-text-field dense outlined label="Почтовый индекс"
                                                v-model="registration.postcode"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="8" class="pt-0 pb-0">
                                  <v-text-field dense outlined label="Адрес"
                                                v-model="registration.address"></v-text-field>
                                </v-col>
                              </v-row>
                            </v-col>
                            <v-col cols="12" md="1" sm="1" align-self="center">
                              <v-btn
                                  icon
                                  small
                                  color="error"
                                  @click="removeRegistration(editedItem.registration.findIndex(i => i === registration))"
                              >
                                <v-icon>mdi-delete</v-icon>
                              </v-btn>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                      <v-btn
                          small
                          color="primary"
                          @click="addRegistration(citizenship)"
                          class="mt-2"
                      >
                        <v-icon left>mdi-plus</v-icon>
                        Добавить регистрацию
                      </v-btn>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>
            </v-card>
            <v-btn @click="addCitizenship(true)" class="mb-4">Добавить гражданство</v-btn>
          </v-tab-item>
          <!--    Паспорт        -->
          <v-tab-item>
            <v-card v-for="(passport, index) in editedItem.passports"
                    :key="index" class="mb-4">
              <v-card-text>
                <v-row justify="start">
                  <v-col cols="12" md="5" class="pt-0 pb-0">
                    <v-select dense outlined class="required" :rules="requiredRules" label="Вид паспорта"
                              v-model="passport.type"
                              :items="passportTypes"
                              item-text="val" item-value="key"></v-select>
                  </v-col>
                  <v-col cols="12" md="7" class="pt-0 pb-0">
                    <v-select
                        dense
                        outlined
                        label="Гражданство"
                        :rules="requiredRules"
                        :items="editedItem.citizenships"
                        item-text="country.name"
                        item-value="id"
                        return-object
                        @change="setCitizenship(passport, $event, 'passports')"
                        :value="getCurrentCitizenshipValue(passport)"
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row justify="start">
                  <v-col cols="12" md="2" class="pt-0 pb-0">
                    <v-text-field dense outlined :rules="requiredRules" label="Серия" class="required"
                                  v-model="passport.serial"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4" class="pt-0 pb-0">
                    <v-text-field class="required" :rules="requiredRules" dense outlined label="Номер"
                                  v-model="passport.number"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="3" class="pt-0 pb-0">
                    <DatePicker v-model="passport.date_issue" value-type="format" format="DD.MM.YYYY"
                                placeholder="Дата выдачи"
                                :clearable="false"></DatePicker>
                  </v-col>
                  <v-col cols="12" md="3" class="pt-0 pb-0">
                    <v-text-field outlined dense label="Код подразделения"
                                  v-model="passport.division_code"></v-text-field>
                  </v-col>

                </v-row>
                <v-row justify="start">
                  <v-col cols="12" class="pt-0 pb-0">
                    <v-textarea rows="2" outlined dense label="Кем выдан" v-model="passport.issued_by"></v-textarea>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            <v-btn @click="addPassport(true)" class="mb-4">Добавить паспортные данные</v-btn>
          </v-tab-item>
          <!--    Коммуникация        -->
          <v-tab-item>
            <v-card v-for="(communication, index) in editedItem.communication"
                    :key="index" class="mb-4">
              <v-card-text>
                <v-row justify="start">
                  <v-col cols="12" md="5" class="pt-0 pb-0">
                    <v-select dense outlined label="Способ коммуникации" :rules="requiredRules"
                              :items="communicationType" v-model="communication.communication_type"
                              item-value="key"
                              item-text="val"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" md="5" class="pt-0 pb-0">
                    <v-text-field dense outlined :rules="requiredRules" label="Адрес" class="required"
                                  v-model="communication.value"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="2" class="pt-0 pb-0">
                    <v-checkbox dense outlined label="Основной"
                                v-model="communication.is_main"></v-checkbox>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            <v-btn @click="addCommunication()" class="mb-4">Добавить способ коммуникации</v-btn>
          </v-tab-item>
          <!--    Семья        -->
          <v-tab-item>
            <v-card>
              <v-card-text>
                <v-card v-for="(member, index) in editedItem.family_members" :key="index" class="mb-4">
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="5">
                        <v-autocomplete
                            outlined
                            dense
                            v-model="member.relation_type"
                            :items="familyRelationTypes"
                            label="Тип родства*"
                            :rules="requiredRules"
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="5">
                        <v-autocomplete
                            outlined
                            dense
                            v-model="member.relative"
                            :items="availableRelatives"
                            label="Член семьи*"
                            item-text="fullName"
                            item-value="id"
                            :rules="requiredRules"
                            return-object
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="2">
                        <v-btn icon color="error" @click="removeFamilyMember(index)">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
                <v-btn @click="addFamilyMember" color="primary">
                  <v-icon left>mdi-plus</v-icon>
                  Добавить члена семьи
                </v-btn>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <!-- Спец. статус -->
          <v-tab-item>
            <v-card>
              <v-card-text>
                <v-expansion-panels multiple v-model="expandedStatusPanels" flat class="identifier-panel">
                  <v-expansion-panel v-for="(status, index) in editedItem.special_statuses" :key="index">
                    <v-expansion-panel-header disable-icon-rotate>
                      {{ getStatusTitle(status) }}
                      <template v-slot:actions>
                        <v-btn icon small style="color: #ff5252 !important" @click.stop="removeSpecialStatus(index)">
                          <v-icon color="error">mdi-delete</v-icon>
                        </v-btn>
                      </template>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-container justify="start">
                        <!-- Общий элемент для всех статусов -->
                        <v-col cols="12" md="6">
                          <v-autocomplete
                              outlined
                              dense
                              v-model="status.status_type"
                              :items="specialStatusTypes"
                              label="Тип статуса*"
                              item-text="text"
                              item-value="value"
                              :rules="requiredRules"
                          ></v-autocomplete>
                        </v-col>

                        <!-- Группа для арбитражного управляющего -->
                        <template v-if="status.status_type === 'arbitration_manager'">
                          <v-col cols="12">
                            <v-card outlined class="mb-4">
                              <v-card-title class="subtitle-1">Данные арбитражного управляющего</v-card-title>
                              <v-card-text>
                                <v-row>
                                  <v-col cols="12" md="6">
                                    <v-autocomplete
                                        outlined
                                        dense
                                        v-model="status.content_object"
                                        :items="arbitrationManagerList"
                                        label="Арбитражный управляющий*"
                                        item-text="fullName"
                                        item-value="id"
                                        :rules="requiredRules"
                                        return-object
                                    ></v-autocomplete>
                                  </v-col>

                                  <v-col cols="12" md="6">
                                    <v-autocomplete
                                        :items="arbitrationStatuses"
                                        item-text="text"
                                        item-value="value"
                                        outlined
                                        dense
                                        v-model="status.content_object.status"
                                        label="Статус*"
                                        readonly
                                    ></v-autocomplete>
                                  </v-col>
                                </v-row>

                                <!-- Детали выбранного управляющего -->
                                <template v-if="status.content_object">
                                  <v-row class="mt-2">
                                    <v-col cols="12" md="4">
                                      <v-autocomplete
                                          outlined
                                          dense
                                          label="СРО*"
                                          :items="legalList"
                                          item-text="fullName"
                                          item-value="id"
                                          v-model="status.content_object.sro"
                                      ></v-autocomplete>
                                    </v-col>

                                    <v-col cols="12" md="4">
                                      <v-text-field
                                          outlined
                                          dense
                                          v-model="status.content_object.reg_number"
                                          label="Регистрационный номер*"
                                          :rules="requiredRules"
                                          readonly
                                      ></v-text-field>
                                    </v-col>

                                    <v-col cols="12" md="4">
                                      <DatePicker
                                          v-model="status.content_object.reg_date"
                                          value-type="format"
                                          format="DD.MM.YYYY"
                                          placeholder="Дата регистрации"
                                          @keypress="isNumber($event)"
                                          :clearable="false"
                                      ></DatePicker>
                                    </v-col>
                                  </v-row>
                                  <v-row justify="start">
                                    <v-col cols="12" md="11">
                                      <v-textarea rows="2" dense outlined
                                                  label="Адрес для получения корреспонденции АУ(для отчета)"
                                                  append-outer-icon="mdi-content-copy"
                                                  v-model="status.content_object.correspondence_address"
                                      >
                                        <template v-slot:append-outer>
                                          <v-tooltip bottom>
                                            <template v-slot:activator="{ on, attrs }">
                                              <v-btn
                                                  color="primary"
                                                  icon
                                                  dark
                                                  @click="copyAddress(status.content_object)"
                                                  v-bind="attrs"
                                                  v-on="on"
                                              >
                                                <v-icon>
                                                  mdi-content-copy
                                                </v-icon>
                                              </v-btn>

                                            </template>
                                            <span>Скопировать основной способ коммуникации</span>
                                          </v-tooltip>
                                        </template>
                                      </v-textarea>
                                    </v-col>
                                  </v-row>
                                  <!-- Группа страховок -->
                                  <v-col cols="12" class="mt-4">
                                    <v-expansion-panels flat>
                                      <v-expansion-panel>
                                        <v-expansion-panel-header>
                                          Страховки
                                          <template v-slot:actions>
                                            <v-icon>mdi-chevron-down</v-icon>
                                          </template>
                                        </v-expansion-panel-header>

                                        <v-expansion-panel-content>
                                          <v-card
                                              v-for="(insurance, idx) in status.content_object.insurance"
                                              :key="idx"
                                              class="mb-1 pt-2"
                                          >
                                            <v-card-text>
                                              <v-row>
                                                <v-col cols="12" md="4" class="pt-0 pb-0">
                                                  <v-text-field
                                                      outlined
                                                      dense
                                                      v-model="insurance.contract"
                                                      label="Номер договора*"
                                                      :rules="requiredRules"
                                                  ></v-text-field>
                                                </v-col>

                                                <v-col cols="12" md="4" class="pt-0 pb-0">
                                                  <DatePicker
                                                      v-model="insurance.date_start"
                                                      value-type="format"
                                                      format="DD.MM.YYYY"
                                                      placeholder="Дата начала"
                                                      @keypress="isNumber($event)"
                                                      :clearable="false"
                                                  ></DatePicker>
                                                </v-col>

                                                <v-col cols="12" md="4" class="pt-0 pb-0">
                                                  <DatePicker
                                                      v-model="insurance.date_end"
                                                      value-type="format"
                                                      format="DD.MM.YYYY"
                                                      placeholder="Дата окончания"
                                                      @keypress="isNumber($event)"
                                                      :clearable="false"
                                                  ></DatePicker>
                                                </v-col>

                                                <v-col cols="12" class="pt-0 pb-0">
                                                  <v-autocomplete
                                                      outlined
                                                      dense
                                                      :items="legalList"
                                                      item-value="id"
                                                      item-text="fullName"
                                                      v-model="insurance.legal_entity"
                                                      label="Юридическое лицо"
                                                  ></v-autocomplete>
                                                </v-col>
                                              </v-row>
                                            </v-card-text>
                                          </v-card>

                                          <v-btn
                                              small
                                              color="primary"
                                              @click="addInsurance(status.content_object.id, index)"
                                              class="mt-2"
                                          >
                                            <v-icon left>mdi-plus</v-icon>
                                            Добавить страховку
                                          </v-btn>
                                        </v-expansion-panel-content>
                                      </v-expansion-panel>
                                    </v-expansion-panels>
                                  </v-col>
                                </template>
                              </v-card-text>
                            </v-card>
                          </v-col>
                        </template>

                        <!-- Группа для индивидуального предпринимателя -->
                        <template v-else-if="status.status_type === 'individual_entrepreneur'">
                          <v-col cols="12">
                            <v-card outlined class="mb-4">
                              <v-card-title class="subtitle-1">Данные индивидуального предпринимателя</v-card-title>
                              <v-card-text>
                                <v-row>
                                  <v-col cols="12" md="4">
                                    <v-text-field
                                        dense
                                        outlined
                                        :rules="requiredRules"
                                        label="ОГРНИП"
                                        v-model="status.content_object.ogrnip"
                                    ></v-text-field>
                                  </v-col>

                                  <v-col cols="12" md="4">
                                    <DatePicker
                                        v-model="status.content_object.opening_date"
                                        value-type="format"
                                        format="DD.MM.YYYY"
                                        :is-required="true"
                                        placeholder="Дата открытия"
                                        @keypress="isNumber($event)"
                                        :clearable="false"
                                    ></DatePicker>
                                  </v-col>

                                  <v-col cols="12" md="4">
                                    <DatePicker
                                        v-model="status.content_object.closing_date"
                                        value-type="format"
                                        format="DD.MM.YYYY"
                                        placeholder="Дата закрытия"
                                        @keypress="isNumber($event)"
                                        :clearable="false"
                                    ></DatePicker>
                                  </v-col>
                                </v-row>

                                <template v-if="status.content_object.additional_info">
                                  <v-row class="mt-2">
                                    <v-col cols="12" md="2">
                                      <v-text-field
                                          outlined
                                          dense
                                          label="Код ОКВЭД"
                                          v-model="status.content_object.additional_info['codeOKVED']"
                                      ></v-text-field>
                                    </v-col>

                                    <v-col cols="12" md="10">
                                      <v-text-field
                                          outlined
                                          dense
                                          label="Наименование ОКВЭД"
                                          v-model="status.content_object.additional_info['nameOKVED']"
                                      ></v-text-field>
                                    </v-col>
                                  </v-row>
                                </template>
                              </v-card-text>
                            </v-card>
                          </v-col>
                        </template>
                      </v-container>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>

                <!-- Кнопка добавления нового статуса -->
                <v-btn @click="addSpecialStatus" color="primary" class="mt-4">
                  <v-icon left>mdi-plus</v-icon>
                  Добавить спец. статус
                </v-btn>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-form>
    </v-card-text>
    <v-card-actions v-if="showActionButton">
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="save" :disabled="saving">Сохранить</v-btn>
      <v-btn @click="$emit('cancel')">Отмена</v-btn>
    </v-card-actions>
    <v-snackbar
        v-if="showSnackbar"
        v-model="showNotification"
        :timeout="notificationTimeout"
        :color="notificationType"
        tile
        multi-line
    >
      <v-icon left>
        {{ notificationType === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
      </v-icon>
      <div v-html="notificationMessage"></div>
      <template v-slot:action="{ attrs }">
        <v-btn
            text
            v-bind="attrs"
            @click="showNotification = false"
        >
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>
import {mapGetters} from "vuex";
import {uuid} from "vue-uuid";
import {cloneDeep} from "lodash";
import moment from "moment";
// import {VueMaskFilter} from 'v-mask'

export default {
  props: {
    person: Object,
    isCreating: Boolean,
    showActionButton: Boolean,
    showSnackbar: Boolean,
    yaml: Object,
  },
  data: () => ({
    saving: false,
    showNotification: false,
    notificationMessage: '',
    notificationType: 'success',
    notificationTimeout: 2000,
    tab: 0,
    valid: false,
    editedItem: null,
    originalItem: null,
    requiredRules: [v => !!v || 'Обязательное поле'],
    genders: [
      {text: 'Мужской', value: 'Male'},
      {text: 'Женский', value: 'Female'},
      {text: 'Другое', value: 'Other'}
    ],
    obtainingMethods: [
      {value: 'Acquired', text: 'Приобретенное'},
      {value: 'Birthright', text: 'По рождению'},
    ],
    passportTypes: [
      {key: 'PR', val: 'Гражданский паспорт'},
      {key: 'IP', val: 'Загран паспорт'},
      {key: 'SP', val: 'Паспорт моряка'},
    ],
    identifierTypes: [
      {key: 'INN', val: 'ИНН'},
      {key: 'SNILS', val: 'СНИЛС'},
      {key: 'INSURANCE', val: 'Страховой полис'},
    ],
    communicationType: [
      {key: 'PaperMail', val: 'Бумажная почта'},
      {key: 'ElectronicMail', val: 'Электронные письма'},
      {key: 'Email', val: 'Электронная почта'},
      {key: 'SBIS', val: 'Сбис'},
    ],
    familyRelationTypes: [
      {text: 'Супруг(а)', value: 'spouse'},
      {text: 'Ребенок', value: 'child'},
      {text: 'Родитель', value: 'parent'},
      {text: 'Брат/Сестра', value: 'sibling'},
      {text: 'Другой родственник', value: 'other'}
    ],
    expandedStatusPanels: [],
    specialStatusTypes: [
      {text: 'Арбитражный управляющий', value: 'arbitration_manager'},
      {text: 'Индивидуальный предприниматель', value: 'individual_entrepreneur'},
      {text: 'Самозанятый', value: 'self_employed'},
      {text: 'Нотариус', value: 'notary'},
      {text: 'Адвокат', value: 'lawyer'},
    ],
    arbitrationStatuses: [
      {text: 'Исключен из реестра', value: 'Excluded'},
      {text: 'Включен в реестр', value: 'Included'},
      {text: 'Без статуса', value: 'Undefined'},
    ],
  }),
  computed: {
    ...mapGetters({
      countries: 'countryListData',
      physicalPersonList: 'physicalPersonListDataV2',
      arbitrationManagerList: 'arbitrationManagerData',
      legalList: 'legalEntityData'

    }),
    availableRelatives() {
      // Исключаем текущее лицо и уже выбранных родственников
      const currentId = this.editedItem.id;
      const selectedIds = this.editedItem.family_members.map(m => m.relative_id);

      return this.physicalPersonList.filter(person =>
          person.id !== currentId && !selectedIds.includes(person.id)
      );
    },
    formTitle() {
      return this.isCreating ? 'Новое физ. лицо' :
          `Редактирование: ${this.person?.fullName || ''}`
    },
    identifierLists() {
      const lists = {};
      this.editedItem.citizenships.forEach(c => {
        const key = c.id ? c.id : c.tempId;
        lists[key] = [];

        this.editedItem.identifiers.forEach(idObj => {
          // Проверяем связь по ID или tempId
          const match =
              (c.id && idObj.citizenship === c.id) ||
              (c.tempId && idObj.citizenshipTempId === c.tempId);

          if (match && idObj.identifier && Array.isArray(idObj.identifier)) {
            lists[key] = [...lists[key], ...idObj.identifier];
          }
        });
      });
      return lists;
    },
    registrationList() {
      const lists = {};
      this.editedItem.citizenships.forEach(c => {
        lists[c.id] = this.editedItem.registration.filter(id => {
          return id.citizenship === c.id
        })
      })
      return lists
    }
  },
  watch: {
    yaml: {
      immediate: true,
      handler(yamlData) {
        if (!yamlData || !yamlData.citizen) return;
        const citizen = yamlData.citizen;

        // Основные поля
        this.editedItem.last_name = citizen.last_name || '';
        this.editedItem.first_name = citizen.first_name || '';
        this.editedItem.middle_name = citizen.middle_name || '';
        this.editedItem.birthday = citizen.date_of_birth || null;
        this.editedItem.birthplace = citizen.place_of_birth || '';

        // Поиск России среди стран
        const russia = this.countries.find(c =>
            c.name.includes('РОССИЯ') ||
            c.name.includes('RUSSIA')
        );
        if (!russia) return;

        // Поиск существующего российского гражданства
        let citizenship = this.editedItem.citizenships.find(c =>
            c.country && c.country.id === russia.id
        );

        // Создаем новое только если не найдено существующего
        if (!citizenship) {
          citizenship = {
            country: russia,
            obtaining_method: 'Birthright',
            date_begin: null,
            date_end: null,
            tempId: uuid.v4()
          };
          this.editedItem.citizenships.push(citizenship);
        }

        // Добавление идентификаторов
        const identifiers = [];
        if (citizen.inn) identifiers.push({type: 'INN', value: citizen.inn});
        if (citizen.snils) identifiers.push({type: 'SNILS', value: citizen.snils});

        if (identifiers.length > 0) {
          // Поиск существующего блока идентификаторов
          let identifierObj = this.editedItem.identifiers.find(item =>
              (citizenship.id && item.citizenship === citizenship.id) ||
              (citizenship.tempId && item.citizenshipTempId === citizenship.tempId)
          );

          if (identifierObj) {
            // Добавляем только новые идентификаторы
            identifiers.forEach(newId => {
              if (!identifierObj.identifier.some(id => id.type === newId.type)) {
                identifierObj.identifier.push(newId);
              }
            });
          } else {
            // Создаем новый блок
            this.editedItem.identifiers.push({
              citizenship: citizenship.id,
              citizenshipTempId: citizenship.tempId,
              identifier: identifiers
            });
          }
        }

        // Добавление регистрации
        if (citizen.registration_address) {
          // Поиск существующей регистрации
          let registration = this.editedItem.registration.find(reg =>
              (citizenship.id && reg.citizenship === citizenship.id) ||
              (citizenship.tempId && reg.citizenshipTempId === citizenship.tempId)
          );

          if (!registration) {
            registration = {
              address: citizen.registration_address,
              postcode: null,
              start: null,
              end: null
            };

            if (citizenship.id) {
              registration.citizenship = citizenship.id;
            } else {
              registration.citizenshipTempId = citizenship.tempId;
            }

            this.editedItem.registration.push(registration);
          } else {
            // Обновляем адрес если нашли существующий
            registration.address = citizen.registration_address;
          }
        }
      }
    },
    person: {
      immediate: true,
      handler(newVal) {
        console.log(newVal)
        this.originalItem = cloneDeep(newVal);
        this.editedItem = cloneDeep(newVal);
      }
    },
    isCreating(val) {
      if (val) this.resetForm()
    },
  },
  methods: {
    copyAddress(content_object){
       content_object.correspondence_address = this.editedItem.communication.filter(obj=> obj.is_main)[0].value
    },
    async loadEGRULData(inn) {
      console.log(inn);
      const baseUrl = "https://egrul.itsoft.ru/";

      try {
        // Параллельное выполнение запросов для JSON и XML
        const [jsonResponse, xmlResponse] = await Promise.allSettled([
          fetch(`${baseUrl}${inn}.json`),
          fetch(`${baseUrl}${inn}.xml`)
        ]);

        const results = [];
        const processedOgrnips = new Set();

        // Обработка JSON-ответа
        if (jsonResponse.status === 'fulfilled' && jsonResponse.value.ok) {
          try {
            const data = await jsonResponse.value.json();
            results.push(this.processIPData(data));
          } catch (e) {
            console.error("JSON parsing error:", e);
          }
        }

        // Обработка XML-ответа
        if (xmlResponse.status === 'fulfilled' && xmlResponse.value.ok) {
          try {
            const xmlText = await xmlResponse.value.text();
            const xmlData = this.parseXML(xmlText);
            results.push(this.processIPData(xmlData));
          } catch (e) {
            console.error("XML parsing error:", e);
          }
        }

        // Обработка полученных данных
        for (const ipData of results.flat()) {
          if (!ipData) continue;

          const ogrnip = ipData.ogrnip;
          if (!ogrnip) continue;

          // Проверяем, обрабатывали ли мы уже этот ОГРНИП
          if (processedOgrnips.has(ogrnip)) {
            this.updateExistingRecord(ogrnip, ipData);
          } else {
            this.createOrUpdateRecord(ogrnip, ipData);
            processedOgrnips.add(ogrnip);
          }
        }

        if (processedOgrnips.size > 0) {
          this.showNotificationMessage(
              "Добавлены данные по ИП. Проверьте правильность и сохраните изменения",
              "primary"
          );
        } else {
          this.showNotificationMessage(
              "Данные не найдены",
              "warning"
          );
        }

        this.showNotification = true;
      } catch (e) {
        this.showNotificationMessage(
            "Ошибка при получении данных: " + e.message,
            "error"
        );
        this.showNotification = true;
      }
    },
    processIPData(data) {
      const results = [];

      // Обработка структуры JSON
      if (data.СвИП) {
        results.push(this.extractIPInfo(data.СвИП));
      }

      // Обработка структуры XML (EGRIP)
      if (data.EGRIP && data.EGRIP.СвИП) {
        results.push(this.extractIPInfo(data.EGRIP.СвИП));
      }

      return results.flat();
    },
// Извлечение информации об ИП
    extractIPInfo(ipData) {
      const attributes = ipData["@attributes"] || {};
      let ogrnip = attributes.ОГРНИП;

      // 1. Приоритетное извлечение данных из СвРегИП
      let openingDate = null;
      if (ipData.СвРегИП) {
        const regAttributes = ipData.СвРегИП["@attributes"] || ipData.СвРегИП;

        // 1.1. Обновляем ОГРНИП из СвРегИП, если он там есть
        if (regAttributes.ОГРНИП && !ogrnip) {
          ogrnip = regAttributes.ОГРНИП;
        }

        // 1.2. Берем дату регистрации из СвРегИП.ДатаРег (приоритет для JSON)
        if (regAttributes.ДатаРег) {
          openingDate = regAttributes.ДатаРег;
        }
        // 1.3. Если ДатаРег нет, но есть ДатаОГРНИП в СвРегИП
        else if (regAttributes.ДатаОГРНИП) {
          openingDate = regAttributes.ДатаОГРНИП;
        }
      }

      // 2. Если дата регистрации не найдена в СвРегИП, берем из основного блока
      if (!openingDate && attributes.ДатаОГРНИП) {
        openingDate = attributes.ДатаОГРНИП;
      }

      // Проверка обязательных полей
      if (!ogrnip) return null;

      // 3. Форматирование даты открытия
      const formattedOpeningDate = openingDate
          ? moment(openingDate, "YYYY-MM-DD").format("DD.MM.YYYY")
          : null;

      // 4. Извлечение ОКВЭД (остается без изменений)
      let additionalInfo = {codeOKVED: null, nameOKVED: "Не указан"};
      if (ipData.СвОКВЭД?.СвОКВЭДОсн) {
        const mainOKVED = ipData.СвОКВЭД.СвОКВЭДОсн["@attributes"] || ipData.СвОКВЭД.СвОКВЭДОсн;
        additionalInfo = {
          codeOKVED: mainOKVED.КодОКВЭД,
          nameOKVED: mainOKVED.НаимОКВЭД
        };
      }

      // 5. Обработка даты прекращения
      let closingDate = null;
      if (ipData.СвПрекращ?.СвСтатус) {
        const statusAttrs = ipData.СвПрекращ.СвСтатус["@attributes"] || ipData.СвПрекращ.СвСтатус;
        if (statusAttrs.ДатаПрекращ) {
          closingDate = moment(statusAttrs.ДатаПрекращ, "YYYY-MM-DD").format("DD.MM.YYYY");
        }
      }

      return {
        ogrnip,
        openingDate: formattedOpeningDate,
        closingDate,
        additionalInfo,
        fullData: ipData
      };
    },
    updateExistingRecord(ogrnip, newData) {
      const existingIndex = this.editedItem.special_statuses.findIndex(item =>
          item.status_type === 'individual_entrepreneur' &&
          item.content_object?.ogrnip === ogrnip
      );

      if (existingIndex !== -1) {
        const contentObject = this.editedItem.special_statuses[existingIndex].content_object;

        // Сохраняем существующий ID и другие поля
        const updatedContent = {
          ...contentObject, // сохраняем все существующие поля
          opening_date: newData.openingDate || contentObject.opening_date,
          closing_date: newData.closingDate || contentObject.closing_date,
          additional_info: newData.additionalInfo.codeOKVED ?
              newData.additionalInfo :
              contentObject.additional_info
        };

        // Обновляем только content_object, сохраняя ID записи
        this.editedItem.special_statuses[existingIndex].content_object = updatedContent;
      }
    },
    createOrUpdateRecord(ogrnip, ipData) {
      const existingIndex = this.editedItem.special_statuses.findIndex(item =>
          item.status_type === 'individual_entrepreneur' &&
          item.content_object?.ogrnip === ogrnip
      );

      if (existingIndex !== -1) {
        // Обновление существующей записи с сохранением ID
        const contentObject = this.editedItem.special_statuses[existingIndex].content_object;

        this.editedItem.special_statuses[existingIndex].content_object = {
          ...contentObject, // сохраняем все существующие поля
          opening_date: ipData.openingDate || contentObject.opening_date,
          closing_date: ipData.closingDate || contentObject.closing_date,
          additional_info: ipData.additionalInfo.codeOKVED ?
              ipData.additionalInfo :
              contentObject.additional_info
        };
      } else {
        // Создание новой записи
        this.editedItem.special_statuses.push({
          status_type: 'individual_entrepreneur',
          content_object: {
            ogrnip,
            opening_date: ipData.openingDate,
            closing_date: ipData.closingDate,
            additional_info: ipData.additionalInfo
          }
        });
      }
    },
    parseXML(xmlText) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");

      // Проверка на ошибки парсинга
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        throw new Error("Ошибка обработки XML-данных");
      }

      // Конвертация XML в JSON-подобную структуру
      return this.xmlToJson(xmlDoc.documentElement);
    },
    xmlToJson(xml) {
      const obj = {};

      // Обработка атрибутов
      if (xml.attributes.length > 0) {
        obj["@attributes"] = {};
        for (const attr of xml.attributes) {
          obj["@attributes"][attr.name] = attr.value;
        }
      }

      // Обработка дочерних элементов
      for (const node of xml.childNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        const nodeName = node.nodeName;
        const childData = this.xmlToJson(node);

        if (obj[nodeName]) {
          if (Array.isArray(obj[nodeName])) {
            obj[nodeName].push(childData);
          } else {
            obj[nodeName] = [obj[nodeName], childData];
          }
        } else {
          obj[nodeName] = childData;
        }
      }

      // Обработка текстового содержимого
      if (xml.childNodes.length === 1 && xml.childNodes[0].nodeType === Node.TEXT_NODE) {
        return xml.textContent.trim();
      }

      return obj;
    },
    getMaskType(type) {
      const masks = {
        'SNILS': '###-###-### ##',
        'INN': '############',
        'INSURANCE': '###############',
      };
      return masks[type] || '';
    },
    validateIdentifier(value, type) {
      if (!value) return true; // Пропускаем пустые значения

      const cleanValue = value.replace(/\D/g, ''); // Удаляем все нецифровые символы

      if (type === 'INN') {
        return cleanValue.length === 12 || 'ИНН должен содержать 12 цифр';
      }

      if (type === 'SNILS') {
        // Проверяем длину и формат ###-###-### ##
        const isValidLength = cleanValue.length === 11;
        const isValidFormat = /^\d{3}-\d{3}-\d{3} \d{2}$/.test(value);

        return (isValidLength && isValidFormat) || 'Неверный формат СНИЛС (XXX-XXX-XXX XX)';
      }

      return true; // Для других типов валидация не требуется
    },
    formatIdentifierValue(identifier) {
      const mask = this.getMaskType(identifier.type)
      if (!mask) return;
      const cleaned = identifier.value.replace(new RegExp(`[^${mask.replace(/#/g, '\\d')}]`, 'g'), '');
      let newValue = '';
      identifier.value = '';
      let maskIndex = 0;
      let valueIndex = 0;

      while (maskIndex < mask.length && valueIndex < cleaned.length) {
        if (mask[maskIndex] === '#') {
          newValue += cleaned[valueIndex];
          valueIndex++;
        } else {
          newValue += mask[maskIndex];
        }
        maskIndex++;
      }
      identifier.value = newValue
    },
    showNotificationMessage(message, type = 'success') {
      this.notificationMessage = message;
      this.notificationType = type;
      this.showNotification = true;

      // Для ошибок не auto-close, только по кнопке
      this.notificationTimeout = type === 'error' ? -1 : 6000;
    },
    resetForm() {
      this.editedItem = {
        id: null,
        last_name: '',
        first_name: '',
        middle_name: null,
        birthday: null,
        birthplace: null,
        gender: 'Male',
        identifiers: [],
        citizenships: [],
        passports: [],
        registration: [],
        communication: [],
        family_members: [],
        special_statuses: [],
      }
    },
    getCurrentCitizenshipValue(item) {
      // Возвращаем текущее гражданство (новое или существующее)
      if (item.citizenship) {
        return this.editedItem.citizenships.find(c => c.id === item.citizenship);
      } else if (item.citizenshipTempId) {
        return this.editedItem.citizenships.find(c => c.tempId === item.citizenshipTempId);
      }
      return null;
    },
    setCitizenship(item, selectedCitizenship, field) {
      // Удаляем оба поля сначала, чтобы не было конфликтов
      delete item.citizenship;
      delete item.citizenshipTempId;

      // Определяем, новое это гражданство или существующее
      if (selectedCitizenship.tempId) {
        // Для нового гражданства (есть tempId)
        item.citizenshipTempId = selectedCitizenship.tempId;
      } else {
        // Для существующего гражданства (есть id)
        item.citizenship = selectedCitizenship.id;
      }

      // Принудительно обновляем объект паспорта
      if (field === 'registration') {
        this.$set(this.editedItem.registration, this.editedItem.registration.indexOf(item), item);
      } else if (field === 'passports') {
        this.$set(this.editedItem.passports, this.editedItem.passports.indexOf(item), item);
      }
    },
    addCitizenship(isNew = false) {
      const newCitizenship = {
        country: null,
        obtaining_method: null,
        date_begin: null,
        date_end: null,
        tempId: uuid.v4()
      }
      this.editedItem.citizenships.push(newCitizenship)
    },
    addPassport(isNew = false) {
      const newPassport = {
        type: 'PR',
        serial: '',
        number: '',
        date_issue: null,
        division_code: null,
        issued_by: null,
        isNew: isNew
      }
      this.editedItem.passports.push(newPassport)
    },
    addIdentifier(citizenship) {
      const key = citizenship.id || citizenship.tempId;
      const isTemp = !citizenship.id;

      // Ищем существующий объект идентификаторов для этого гражданства
      let identifierObj = this.editedItem.identifiers.find(item =>
          (isTemp && item.citizenshipTempId === key) ||
          (!isTemp && item.citizenship === key)
      );

      if (identifierObj) {
        // Добавляем новый идентификатор в существующий объект
        identifierObj.identifier.push({type: "", value: ""});
      } else {
        // Создаем новый объект для гражданства
        identifierObj = {
          identifier: [{type: "", value: ""}],
        };
        if (citizenship.id) {
          identifierObj.citizenship = citizenship.id;
        } else {
          identifierObj.citizenshipTempId = citizenship.tempId;
        }
        this.editedItem.identifiers.push(identifierObj);
      }
    },
    removeIdentifier(citizenshipKey, identifier) {
      // Находим индекс объекта идентификаторов
      const identifierObjIndex = this.editedItem.identifiers.findIndex(item =>
          item.citizenship === citizenshipKey ||
          item.citizenshipTempId === citizenshipKey
      );

      if (identifierObjIndex === -1) return;

      const identifierObj = this.editedItem.identifiers[identifierObjIndex];
      // Находим индекс идентификатора в массиве
      const idIndex = identifierObj.identifier.findIndex(id =>
          id.type === identifier.type && id.value === identifier.value
      );

      if (idIndex !== -1) {
        // Удаляем идентификатор из массива
        identifierObj.identifier.splice(idIndex, 1);

        // Если массив пуст - удаляем весь объект
        if (identifierObj.identifier.length === 0) {
          this.editedItem.identifiers.splice(identifierObjIndex, 1);
        }
      }
    },
    addFamilyMember() {
      this.editedItem.family_members.push({
        relative: null,
        relation_type: null,
      });
    },
    removeFamilyMember(index) {
      this.editedItem.family_members.splice(index, 1);
    },
    filteredIdentifierTypes(citizenshipKey) {
      // Находим объект идентификаторов для гражданства
      const identifierObj = this.editedItem.identifiers.find(item =>
          item.citizenship === citizenshipKey ||
          item.citizenshipTempId === citizenshipKey
      );

      const usedTypes = [];
      if (identifierObj && identifierObj.identifier) {
        identifierObj.identifier.forEach(id => {
          if (id.type) usedTypes.push(id.type);
        });
      }

      return this.identifierTypes.map(type => ({
        ...type,
        disabled: usedTypes.includes(type.key)
      }));
    },
    getStatusTitle(status) {
      // Базовый заголовок по типу статуса
      const typeTitle = this.specialStatusTypes.find(t => t.value === status.status_type)?.text || 'Специальный статус';

      // Обработка арбитражного управляющего
      if (status.status_type === 'arbitration_manager') {
        if (!status.content_object) {
          return `${typeTitle} (данные не указаны)`;
        }

        const statusText = this.getStatusText(status.content_object.status) || 'статус не указан';
        const regNumber = status.content_object.reg_number ? `№${status.content_object.reg_number}` : '';
        const regDate = status.content_object.reg_date ? `от ${status.content_object.reg_date}` : '';

        return `${typeTitle} ${regNumber} ${regDate} - ${statusText}`.trim();
      }

      // Обработка индивидуального предпринимателя
      if (status.status_type === 'individual_entrepreneur') {
        if (!status.content_object) {
          return `${typeTitle} (данные не указаны)`;
        }

        const ogrnip = status.content_object.ogrnip ? `ОГРНИП: ${status.content_object.ogrnip}` : '';
        return `${typeTitle} ${ogrnip}`.trim();
      }

      // Для остальных статусов просто возвращаем их название
      return typeTitle;
    },
    getStatusText(statusValue) {
      if (!statusValue) return null;

      const status = this.arbitrationStatuses.find(s => s.value === statusValue);
      return status ? status.text : statusValue;
    },
    addSpecialStatus() {
      const newStatus = {
        status_type: 'arbitration_manager',
        content_object: {}
      };

      this.editedItem.special_statuses.push(newStatus);

    },
    addInsurance(contentId, index) {
      const insurance = {
        date_start: null,
        date_end: null,
        contract: null,
        legal_entity: null,
        arbitration_manager: contentId
      }

      this.editedItem.special_statuses[index].content_object.insurance.push(insurance)
    },
    removeSpecialStatus(index) {
      this.editedItem.special_statuses.splice(index, 1);
      this.expandedStatusPanels = this.expandedStatusPanels
          .map(i => i > index ? i - 1 : i)
          .filter(i => i !== index);
    },
    hasAvailableIdentifierTypes(citizenshipKey) {
      // Находим объект идентификаторов для гражданства
      const identifierObj = this.editedItem.identifiers.find(item =>
          item.citizenship === citizenshipKey ||
          item.citizenshipTempId === citizenshipKey
      );

      const usedTypes = [];
      if (identifierObj && identifierObj.identifier) {
        identifierObj.identifier.forEach(id => {
          if (id.type) usedTypes.push(id.type);
        });
      }

      return this.identifierTypes.some(type => !usedTypes.includes(type.key));
    },
    addCommunication() {
      this.editedItem.communication.push({
        communication_type: null,
        value: null,
        is_main: false,
      })
    },
    addRegistration(citizenship) {
      const newRegistration = {
        address: '',
        postcode: null,
        start: null,
        end: null
      }
      if (citizenship?.id) {
        newRegistration['citizenship'] = citizenship.id
      } else {
        newRegistration['citizenshipTempId'] = citizenship.tempId
      }
      this.editedItem.registration.push(newRegistration)
    },
    removeRegistration(registration, index) {
      this.editedItem.registration.splice(index, 1)
    },
    isNumber: function (evt) {
      evt = evt || window.event;
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      let char = String.fromCharCode(charCode);
      // Заменяем запятую на точку
      if (char === ',') {
        evt.preventDefault();
        // Создаем событие вставки точки вместо запятой
        let inputEvent = new Event('input', {bubbles: true});
        evt.target.value += '.';
        evt.target.dispatchEvent(inputEvent);
        return false;
      }

      // Разрешаем: цифры, точка, Backspace, Tab, стрелки и Del
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        evt.preventDefault();
        return false;
      }

      // Проверка на несколько точек
      if (charCode === 46 && evt.target.value.indexOf('.') !== -1) {
        evt.preventDefault();
        return false;
      }

      return true;
    },
    getErrorMessage(error) {
      const fieldLabels = {
        'ogrnip': 'ОГРНИП',
        'opening_date': 'Дата открытия',
        'last_name': 'Фамилия',
        'first_name': 'Имя',
        'birthday': 'Дата рождения',
        "special_statuses": 'Ошибка спец статуса'
        // Добавьте другие поля по мере необходимости
      };

      if (error.isValidationError) {
        return error.message;
      }
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const messages = [];
        for (const [field, errorsList] of Object.entries(errors)) {
          const fieldName = fieldLabels[field] || field;
          const fieldErrors = Array.isArray(errorsList) ? errorsList.join(', ') : errorsList;
          messages.push(`<b>${fieldName}</b>: ${fieldErrors}`);
        }

        return `Обнаружены ошибки в форме:<br>${messages.join('<br>')}`;
      }
      if (error.response?.data?.message) {
        return error.response.data.message;
      }
      return 'Произошла ошибка при сохранении';
    },
    async save() {
      this.saving = true
      return new Promise(async (resolve, reject) => {
        if (this.$refs.form.validate()) {

          try {
            const dataToSave = {
              ...this.editedItem,
              identifiers: this.editedItem.identifiers.map(item => {
                const identifierObj = {};
                item.identifier.forEach(id => {
                  identifierObj[id.type] = id.value;
                });
                return {
                  id: item.id,
                  citizenship: item.citizenship,
                  citizenshipTempId: item.citizenshipTempId,
                  identifier: identifierObj
                };
              }),
              family_members: this.editedItem.family_members.map(member => ({
                id: member.id,
                relative: member.relative.id,
                relation_type: member.relation_type,
              })),
              user: this.editedItem.user?.id
            };
            const savedPerson = await this.$store.dispatch('savePerson', dataToSave)
            this.showNotificationMessage('Данные успешно сохранены', 'success');
            this.$emit('save', savedPerson);
            resolve(savedPerson)
          } catch (error) {
            console.error('Ошибка сохранения:', error);
            const errorMsg = this.getErrorMessage(error);
            this.showNotificationMessage(errorMsg, 'error');
            reject(error);
          } finally {
            this.saving = false
          }
        } else {
          const errorMsg = "Форма не валидна. Проверьте корректность данных";
          this.showNotificationMessage(errorMsg, 'error');
          this.saving = false
          reject();
        }
      });
    }
  },
  created() {
    this.resetForm()
    if (this.countries.length === 0) {
      this.$store.dispatch('getCountry')
    }
  }
}
</script>

<style scoped>
>>> .v-snack__content {
  display: flex;
}

.mx-datepicker {
  position: relative;
  display: inline-block;
  width: 100%;
}

.v-card {
  display: flex;
  flex-direction: column;
}

>>> .v-tabs-items {
  overflow-y: auto;
  max-height: 75%;
}

/*
.v-card.mb-4 {
  max-height: 250px;
}
*/
>>> .required.v-input--is-focused.error--text fieldset {
  border: 0.15em solid;
  color: rgb(167, 25, 25);
}

.citizenship-content {
  padding-bottom: 0;
}

.identifier-panel {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.identifier-card {
  background-color: #f5f5f5;
  border-left: 3px solid #1976d2;
}

/* Убираем лишние отступы */
.v-expansion-panel-header {
  min-height: 48px;
  padding: 0 16px;
}

.v-expansion-panel-content >>> .v-expansion-panel-content__wrap {
  padding: 8px 16px 16px;
}

/* Адаптивные стили */
@media (max-width: 960px) {
  .identifier-card .v-col {
    padding-top: 8px;
    padding-bottom: 8px;
  }
}

</style>