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
          <v-tab>Имущество</v-tab>
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
                    <template v-if="communication.communication_type === 'Email'">
                      <v-text-field dense outlined :rules="emailRules" label="Email"
                                    v-model="communication.value" class="required"></v-text-field>
                    </template>
                    <template v-else-if="communication.communication_type === 'Phone'">
                      <v-text-field dense outlined :rules="requiredRules" label="Номер телефона"
                                    v-mask="'+# (###) #######'"
                                    v-model="communication.value" class="required"></v-text-field>
                    </template>
                    <template v-else>
                      <v-textarea dense outlined :rules="requiredRules" label="Почтовый адрес" rows="2"
                                  v-model="communication.value" class="required"></v-textarea>
                    </template>
                  </v-col>
                  <v-col cols="12" md="2" class="pt-0 pb-0">
                    <v-checkbox
                        v-if="communication.communication_type === 'Phone'"
                        dense outlined label="Основной телефон"
                        v-model="communication.is_main_phone"></v-checkbox>
                    <v-checkbox
                        v-else
                        dense outlined label="Основной"
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
                    <v-row justify="center">
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
                        >
                          <template v-slot:append-outer style="margin-top: 0 !important;">
                            <v-btn
                                v-if="!member.relative"
                                icon
                                @click="openPersonFormForFamilyMember(index)"
                                class="mt-0"
                            >
                              <v-icon>mdi-plus</v-icon>
                            </v-btn>
                          </template>
                        </v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="2">
                        <v-btn icon color="error" @click="removeFamilyMember(index)">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </v-col>
                      <template v-if="member.relation_type==='spouse'">
                        <v-col cols="12" md="6">
                          <DatePicker v-model="member.date_start" value-type="format" format="DD.MM.YYYY"
                                      placeholder="Дата заключения брака"
                                      :clearable="false"></DatePicker>
                        </v-col>
                        <v-col cols="12" md="6">
                          <DatePicker v-model="member.date_end" value-type="format" format="DD.MM.YYYY"
                                      placeholder="Дата прекращения брака"
                                      :clearable="false"></DatePicker>
                        </v-col>
                      </template>

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
          <!-- Имущество -->
          <v-tab-item>
            <v-card>
              <v-card-text>
                <v-chip-group v-model="assetFilter" mandatory class="mb-4">
                  <v-chip filter value="all">Все</v-chip>
                  <v-chip filter value="personal">Личное</v-chip>
                  <v-chip filter value="joint">Совместное</v-chip>
                </v-chip-group>

                <v-expansion-panels multiple v-model="expandedAssetPanels" flat class="identifier-panel">
                  <v-expansion-panel
                      v-for="(asset, index) in filteredAssets"
                      :key="index"
                      :class="{'joint-asset-panel': asset.ownership_type === 'joint'}"
                  >
                    <v-expansion-panel-header disable-icon-rotate>
                      <div class="d-flex align-center flex-grow-1">
                        <div class="d-flex flex-column">
                          <span>{{ getAssetTitle(asset) }}</span>
                          <div class="caption mt-1 d-flex align-center">
                            <v-chip
                                v-if="isJointAsset(asset)"
                                x-small
                                color="primary"
                                class="mr-1"
                            >
                              Совместное
                            </v-chip>
                            <v-chip
                                v-else
                                x-small
                                color="grey lighten-1"
                                class="mr-1"
                            >
                              Личное
                            </v-chip>
                            <span v-if="asset.acquisition_date" class="ml-1">
          Приобретено: {{ formatDate(asset.acquisition_date) }}
        </span>
                            <span
                                v-if="asset.status_display"
                                class="ml-2"
                                :class="getStatusClass(asset.status)"
                            >
          {{ asset.status_display }}
        </span>
                          </div>
                        </div>
                      </div>

                      <template v-slot:actions>
                        <!-- Информация о совместном имуществе -->
                        <v-tooltip v-if="isJointAsset(asset)" bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                small
                                color="primary"
                                class="mr-2"
                                v-bind="attrs"
                                v-on="on"
                            >
                              mdi-information
                            </v-icon>
                          </template>
                          <span style="white-space: pre-line;">
        <strong>Совместное имущество</strong><br>
        {{ getJointAssetTooltip(asset) }}
      </span>
                        </v-tooltip>

                        <!-- Кнопка удаления только для личного имущества -->
                        <v-btn
                            v-if="!isJointAsset(asset) && isAssetBelongsToCurrentPerson(asset)"
                            icon
                            small
                            color="error"
                            @click.stop="removeAsset(index)"
                            class="mr-1"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>

                        <v-icon>mdi-chevron-down</v-icon>
                      </template>
                    </v-expansion-panel-header>

                    <v-expansion-panel-content>
                      <v-container>
                        <v-row>
                          <v-col cols="12" md="5">
                            <v-autocomplete
                                hide-details
                                outlined dense
                                v-model="asset.category"
                                :items="assetCategories"
                                label="Категория*"
                                :rules="requiredRules"
                            />
                          </v-col>

                          <v-col cols="12" md="5">
                            <v-autocomplete
                                hide-details
                                outlined dense
                                v-model="asset.asset_type"
                                :items="assetTypes"
                                label="Тип*"
                                :rules="requiredRules"
                                @change="onAssetTypeChange(asset)"
                            />
                          </v-col>


                          <v-col cols="12" md="4">
                            <DatePicker
                                hide-details
                                v-model="asset.acquisition_date"
                                value-type="format"
                                format="DD.MM.YYYY"
                                placeholder="Дата приобретения"
                                :clearable="false"
                            />
                          </v-col>

                          <v-col cols="12" md="4">
                            <DatePicker
                                hide-details
                                v-model="asset.disposal_date"
                                value-type="format"
                                format="DD.MM.YYYY"
                                placeholder="Дата выбытия"
                                :clearable="false"
                            />
                          </v-col>

                          <v-col cols="12" md="4">
                            <v-autocomplete
                                hide-details
                                outlined dense
                                v-model="asset.status"
                                :items="assetStatuses"
                                label="Статус*"
                                :rules="requiredRules"
                            />
                          </v-col>
                          <v-col cols="12" md="4">
                            <v-text-field
                                type="number"
                                step="0.1"
                                hide-details
                                outlined dense
                                v-model="asset.carrying_cost"
                                label="Балансовая стоимость"
                                :rules="requiredRules"
                            />
                          </v-col>
                          <v-col cols="12" md="4">
                            <v-text-field
                                type="number"
                                step="0.1"
                                hide-details
                                outlined dense
                                v-model="asset.market_cost"
                                label="Рыночная стоимость"
                                :rules="requiredRules"
                            />
                          </v-col>
                        </v-row>

                        <!-- ДИНАМИЧЕСКИЕ ПОЛЯ ПО JSON СХЕМЕ -->
                        <v-divider class="my-4" v-if="asset.asset_type && getSchemaFields(asset)"></v-divider>
                        <strong v-if="asset.asset_type && getSchemaFields(asset)">Характеристики</strong>

                        <v-row class="mt-2" v-if="asset.asset_type && getSchemaFields(asset)">
                          <v-col cols="12" :md="field.type === 'boolean' ? 12 : 6"
                                 v-for="(field, key) in getSchemaFields(asset)" :key="key">
                            <component
                                :is="resolveFieldComponent(field, key)"
                                v-model="asset.details[key]"
                                :label="field.label"
                                :rules="getFieldRules(field)"
                                v-bind="getFieldAttrs(field, key)"
                                outlined dense
                            />
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>

                <v-btn @click="addAsset" color="primary" class="mt-4">
                  <v-icon left>mdi-plus</v-icon>
                  Добавить имущество
                </v-btn>
                <v-btn @click="triggerJsonUpload" color="primary" class="mt-4 ml-4">
                  <v-icon left>mdi-file-upload</v-icon>
                  Загрузить из JSON
                </v-btn>
                <input
                    type="file"
                    ref="jsonFileInput"
                    accept=".json"
                    style="display: none"
                    @change="handleJsonFileUpload"
                />
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
    <v-dialog v-model="duplicateDialog" max-width="800px">
      <v-card>
        <v-card-title>Найдены похожие записи</v-card-title>
        <v-card-text>
          <p>Обнаружены существующие записи с похожими данными:</p>
          <v-data-table
              :headers="duplicateHeaders"
              :items="duplicates"
              hide-default-footer
              class="elevation-1"
          >
            <template v-slot:item.actions="{ item }">
              <v-btn small color="primary" @click="useDuplicate(item)">Использовать</v-btn>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="duplicateDialog = false">Продолжить создание</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showPersonFormModal" width="800" persistent>
      <PhysicalPersonForm showActionButton @closeModal="onPersonFormCloseModal"
                          @save="setFamilyPerson"></PhysicalPersonForm>
    </v-dialog>
  </v-card>
</template>

<script>
import {mapGetters} from "vuex";
import {uuid} from "vue-uuid";
import {cloneDeep, debounce} from "lodash";
import moment from "moment";
import {AssetSchemas} from '@/const/dataTypes'
import PhysicalPersonForm from "@/components/referenceBook/PhysicalPersonV2/PhysicalPersonForm.vue";

export default {
  name: "PhysicalPersonDetail",
  components: {PhysicalPersonForm},
  props: {
    person: Object,
    isCreating: Boolean,
    showActionButton: Boolean,
    showSnackbar: Boolean,
    yaml: Object,
  },
  data: () => ({
    showPersonFormModal: false,
    currentFamilyMemberIndex: null,
    assetCategories: [
      "Недвижимое имущество",
      "Движимое имущество",
      "Денежные средства",
      "Дебиторская задолженность",
      "Ценные бумаги",
      "Акции и участие",
      "Иное имущество"
    ],
    assetTypes: Object.keys(AssetSchemas),
    assetFilter: 'all',
    assetStatuses: [
      {value: "active", text: "Активный"},
      {value: "inactive", text: "Неактивный"},
      {value: "disputed", text: "Оспаривается"},
      {value: "leased", text: "В аренде"},
      {value: "under repair", text: "На ремонте"},
      {value: "outstanding", text: "Просрочен"}
    ],
    duplicateDialog: false,
    duplicates: [],
    duplicateHeaders: [
      {text: 'ФИО', value: 'fullName'},
      {text: 'Дата рождения', value: 'birthday'},
      {text: 'Действия', value: 'actions', sortable: false}
    ],
    debouncedCheckDuplicates: null,
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
    emailRules: [
      v => !!v || 'Email обязателен',
      v => /.+@.+\..+/.test(v) || 'Email должен быть действительным'
    ],
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
      {key: 'Phone', val: 'Телефон'},
    ],
    familyRelationTypes: [
      {text: 'Супруг(а)', value: 'spouse'},
      {text: 'Ребенок', value: 'child'},
      {text: 'Родитель', value: 'parent'},
      {text: 'Брат/Сестра', value: 'sibling'},
      {text: 'Другой родственник', value: 'other'}
    ],
    expandedStatusPanels: [],
    expandedAssetPanels: [],
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
    },
    filteredAssets() {
      if (this.assetFilter === 'all') {
        return this.editedItem.assets || [];
      } else if (this.assetFilter === 'personal') {
        return (this.editedItem.assets || []).filter(asset =>
            asset.ownership_type === 'personal'
        );
      } else if (this.assetFilter === 'joint') {
        return (this.editedItem.assets || []).filter(asset =>
            asset.ownership_type === 'joint'
        );
      }
      return [];
    },
  },
  watch: {
    'editedItem.last_name': function (newVal) {
      if (this.isCreating) {
        this.debouncedCheckDuplicates();
      }
    },
    // 'editedItem.first_name': function (newVal) {
    //   if (this.isCreating) {
    //     this.debouncedCheckDuplicates();
    //   }
    // },
    // 'editedItem.middle_name': function (newVal) {
    //   if (this.isCreating) {
    //     this.debouncedCheckDuplicates();
    //   }
    // },
    // 'editedItem.birthday': function (newVal) {
    //   if (this.isCreating) {
    //     this.debouncedCheckDuplicates();
    //   }
    // },
    'editedItem.assets': {
      deep: true,
      handler() {
        // Принудительно обновляем filteredAssets при изменении assets
        this.$forceUpdate();
      }
    },
    assetFilter() {
      this.expandedAssetPanels = [];
    },
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
        this.originalItem = cloneDeep(newVal);
        this.editedItem = cloneDeep(newVal);
      }
    },
    isCreating(val) {
      if (val) this.resetForm()
    },
  },
  methods: {
    onPersonFormCloseModal() {
      this.showPersonFormModal = false;
      this.currentFamilyMemberIndex = null; // Сбрасываем индекс при закрытии
    },
    openPersonFormForFamilyMember(index) {
      this.currentFamilyMemberIndex = index;
      this.showPersonFormModal = true;
    },
    setFamilyPerson(item) {
      if (this.currentFamilyMemberIndex !== null) {
        this.editedItem.family_members[this.currentFamilyMemberIndex].relative = item;

        // Также обновляем relative_id для совместимости
        this.editedItem.family_members[this.currentFamilyMemberIndex].relative_id = item.id;
      }

      this.showPersonFormModal = false;
      this.currentFamilyMemberIndex = null

    },
    copyAddress(content_object) {
      content_object.correspondence_address = this.editedItem.communication.filter(obj => obj.is_main)[0].value
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
        assets: []
      }
      if (this.person && this.person.assets) {
        this.person.assets.forEach(asset => {
          this.initAssetDetails(asset);
        });
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
        date_start: null,
        date_end: null
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
    getAssetTitle(asset) {
      // Существующий метод
      if (!asset) return "Имущество";
      const category = asset.category ? `${asset.category}` : "Без категории";
      const type = asset.asset_type ? `${asset.asset_type}` : "Без типа";
      return `${category} - ${type}`;
    },
    addAsset() {
      const newAsset = {
        id: null,
        category: "",
        asset_type: "",
        acquisition_date: null,
        disposal_date: null,
        carrying_cost: 0,
        market_cost: 0,
        status: "active",
        details: {},
        _isJoint: false,
      };
      this.initAssetDetails(newAsset);
      this.editedItem.assets.push(newAsset);
      this.expandedAssetPanels.push(this.editedItem.assets.length - 1);
    },
    onAssetTypeChange(asset) {
      if (!this.isJointAsset(asset)) {
        // Находим оригинальный актив
        const originalAsset = this.findOriginalAsset(asset);
        if (originalAsset) {
          // Очищаем существующие детали
          originalAsset.details = {};

          // Получаем схему для выбранного типа
          const schema = AssetSchemas[originalAsset.asset_type];
          if (schema && schema.properties) {
            // Инициализируем каждое поле значением по умолчанию
            Object.keys(schema.properties).forEach(key => {
              const field = schema.properties[key];

              if (field.type === 'boolean') {
                originalAsset.details[key] = field.default !== undefined ? field.default : false;
              } else if (field.type === 'number' || field.type === 'integer') {
                originalAsset.details[key] = field.default !== undefined ? field.default : 0;
              } else if (field.type === 'string') {
                originalAsset.details[key] = field.default !== undefined ? field.default : '';
              } else {
                originalAsset.details[key] = null;
              }
            });
          }

          // Обновляем реактивность
          const assetIndex = this.editedItem.assets.findIndex(a =>
              (a.id && a.id === originalAsset.id) ||
              (a === originalAsset)
          );

          if (assetIndex !== -1) {
            this.$set(this.editedItem.assets, assetIndex, {...originalAsset});
          }
        }
      }
    },
    removeAsset(index) {
      const asset = this.filteredAssets[index];

      if (asset && !this.isJointAsset(asset)) {
        // Находим оригинальный актив
        const originalAsset = this.findOriginalAsset(asset);
        if (originalAsset) {
          // Находим индекс в editedItem.assets
          const assetIndex = this.editedItem.assets.findIndex(a =>
              (a.id && a.id === originalAsset.id) ||
              (a === originalAsset)
          );

          if (assetIndex !== -1) {
            this.editedItem.assets.splice(assetIndex, 1);
          }

          // Обновляем expandedAssetPanels
          this.expandedAssetPanels = this.expandedAssetPanels
              .map(i => i > index ? i - 1 : i)
              .filter(i => i !== index);
        }
      }
    },
    isAssetBelongsToCurrentPerson(asset) {
      const currentPersonId = this.editedItem.id;
      // Если актив новый (без id) или принадлежит текущему лицу
      return !asset.id || asset.owner === currentPersonId;
    },
    isJointAsset(asset) {
      // Проверяем несколько условий
      return asset.ownership_type === 'joint' ||
          (asset.joint_property_info && asset.joint_property_info.is_joint) ||
          asset.is_joint_property;
    },
    getJointAssetTooltip(asset) {
      if (!this.isJointAsset(asset)) return '';

      const jointInfo = asset.joint_property_info || {};
      let tooltip = '';

      if (jointInfo.is_joint) {
        if (jointInfo.owner_is_spouse) {
          tooltip += `Владелец: ${jointInfo.spouse_name || 'Не указано'}\n`;
        } else {
          tooltip += `Принадлежит: ${asset.owner_name || 'Не указано'}\n`;
        }

        if (jointInfo.marriage_start) {
          const startDate = this.formatDate(jointInfo.marriage_start);
          const endDate = jointInfo.marriage_end
              ? this.formatDate(jointInfo.marriage_end)
              : 'Настоящее время';
          tooltip += `Период брака: ${startDate} - ${endDate}\n`;
        }

        if (jointInfo.acquisition_during_marriage) {
          tooltip += 'Приобретено в период брака';
        }
      }

      return tooltip;
    },
    getStatusClass(status) {
      const statusClasses = {
        'active': 'success--text',
        'inactive': 'grey--text',
        'disputed': 'error--text',
        'leased': 'warning--text',
        'under repair': 'info--text',
        'outstanding': 'error--text'
      };
      return statusClasses[status] || '';
    },
    formatDate(dateString) {
      if (!dateString) return '';
      // Проверяем формат даты
      if (dateString.includes('-')) {
        // Формат YYYY-MM-DD
        return moment(dateString, 'YYYY-MM-DD').format('DD.MM.YYYY');
      } else if (dateString.includes('.')) {
        // Формат DD.MM.YYYY
        return dateString;
      }
      return dateString;
    },
    findOriginalAsset(asset) {
      // Проверяем, есть ли у актива id
      if (asset.id) {
        return this.editedItem.assets.find(a => a.id === asset.id);
      }

      // Если id нет, ищем по ссылке
      const assetIndex = this.editedItem.assets.findIndex(a => a === asset);
      if (assetIndex !== -1) {
        return this.editedItem.assets[assetIndex];
      }

      return null;
    },
    getSchemaFields(asset) {
      if (!asset.asset_type || !AssetSchemas[asset.asset_type]) {
        return {};
      }
      const schema = AssetSchemas[asset.asset_type];
      return schema?.properties || {};
    },
    resolveFieldComponent(field) {
      switch (field.type) {
        case "boolean":
          return "v-checkbox";
        case "date":
          return "DatePicker";
        case "string":
          if (field.enum && field.enum.length > 0) {
            return "v-autocomplete";
          }
          return "v-text-field";
        case "integer":
        case "number":
          return "v-text-field";
        default:
          return "v-text-field";
      }
    },
    getFieldRules(field, fieldKey) {
      const rules = [];

      // Обязательное поле
      if (field.required) {
        rules.push(v => !!v || 'Обязательное поле');
      }

      // Валидация для строковых полей
      if (field.type === 'string') {
        // Проверка минимальной длины
        if (field.minLength !== undefined) {
          rules.push(v => !v || v.length >= field.minLength ||
              `Минимальная длина: ${field.minLength} символов`);
        }

        // Проверка максимальной длины
        if (field.maxLength !== undefined) {
          rules.push(v => !v || v.length <= field.maxLength ||
              `Максимальная длина: ${field.maxLength} символов`);
        }

        // Проверка паттерна (регулярного выражения)
        if (field.pattern) {
          const regex = new RegExp(field.pattern);
          rules.push(v => !v || regex.test(v) ||
              `Неверный формат. Пример: ${field.patternDescription || field.pattern}`);
        }
      }

      // Валидация для числовых полей
      if (field.type === 'number' || field.type === 'integer') {
        // Минимальное значение
        if (field.minimum !== undefined) {
          rules.push(v => v === '' || v === null || v >= field.minimum ||
              `Минимальное значение: ${field.minimum}`);
        }

        // Максимальное значение
        if (field.maximum !== undefined) {
          rules.push(v => v === '' || v === null || v <= field.maximum ||
              `Максимальное значение: ${field.maximum}`);
        }

        // Проверка на целое число для integer
        if (field.type === 'integer') {
          rules.push(v => v === '' || v === null || Number.isInteger(Number(v)) ||
              'Должно быть целое число');
        }
      }

      // Специальная валидация для VIN (17 символов)
      if (fieldKey === 'vin') {
        rules.push(v => !v || v.length === 17 ||
            'VIN номер должен содержать ровно 17 символов');
      }

      return rules;
    },
    getFieldAttrs(field, fieldKey) {
      const attrs = {};

      // Плейсхолдер
      if (field.placeholder) {
        attrs.placeholder = field.placeholder;
      }

      // Для текстовых полей
      if (field.type === 'string') {
        if (field.maxLength !== undefined) {
          attrs.counter = field.maxLength;
        }

        // Маска для VIN номера
        if (fieldKey === 'vin') {
          attrs.mask = 'XXXXXXXXXXXXXXXXX';
          attrs.hint = 'Введите 17-значный VIN номер';
          attrs.persistentHint = true;
        }
      }

      // Для числовых полей
      if (field.type === 'number' || field.type === 'integer') {
        attrs.type = 'number';

        // Атрибуты min/max для HTML5 валидации
        if (field.minimum !== undefined) {
          attrs.min = field.minimum;
        }
        if (field.maximum !== undefined) {
          attrs.max = field.maximum;
        }

        // Шаг для числовых полей
        if (field.type === 'integer') {
          attrs.step = 1;
        }
      }

      // Для полей с перечислением
      if (field.enum && field.enum.length > 0) {
        attrs.items = field.enum;
      }

      // Для булевых полей
      if (field.type === 'boolean') {
        attrs.dense = true;
      }

      // Для полей с форматом даты
      if (field.format === 'date' || field.type === 'date') {
        attrs.valueType = 'format';
        attrs.format = 'DD.MM.YYYY';
      }
      return attrs;
    },
    initAssetDetails(asset) {
      // Создаем объект details, если его нет
      if (!asset.details) {
        asset.details = {};
      }

      // Если тип уже выбран, инициализируем поля из схемы
      if (asset.asset_type && AssetSchemas[asset.asset_type]) {
        const schema = AssetSchemas[asset.asset_type];

        if (schema.properties) {
          Object.keys(schema.properties).forEach(key => {
            // Инициализируем только если поле еще не существует
            if (asset.details[key] === undefined) {
              const field = schema.properties[key];

              if (field.type === 'boolean') {
                asset.details[key] = field.default !== undefined ? field.default : false;
              } else if (field.type === 'number' || field.type === 'integer') {
                asset.details[key] = field.default !== undefined ? field.default : 0;
              } else if (field.type === 'string') {
                asset.details[key] = field.default !== undefined ? field.default : '';
              }
            }
          });
        }
      }
    },
    triggerJsonUpload() {
      this.$refs.jsonFileInput.click();
    },
    async handleJsonFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const jsonData = await this.readJsonFile(file);
        await this.processJsonAssets(jsonData);
        this.showNotificationMessage('Имущество успешно загружено из JSON', 'success');
      } catch (error) {
        console.error('Ошибка при загрузке JSON:', error);
        this.showNotificationMessage(`Ошибка при загрузке JSON: ${error.message}`, 'error');
      } finally {
        // Сброс input для возможности повторной загрузки
        event.target.value = '';
      }
    },
    readJsonFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target.result);
            resolve(jsonData);
          } catch (error) {
            reject(new Error('Неверный формат JSON файла'));
          }
        };

        reader.onerror = () => {
          reject(new Error('Ошибка чтения файла'));
        };

        reader.readAsText(file);
      });
    },
    processJsonAssets(jsonData) {
      if (!jsonData.assets || !Array.isArray(jsonData.assets)) {
        throw new Error('В JSON отсутствует массив assets');
      }

      const processedAssets = jsonData.assets.map((jsonAsset, index) => {
        // Преобразование JSON актива в формат компонента
        const asset = this.transformJsonAsset(jsonAsset);

        // Добавляем индекс к заголовку для удобства
        asset.originalIndex = index;

        return asset;
      });

      // Добавляем все обработанные активы
      const startIndex = this.editedItem.assets.length;
      this.editedItem.assets.push(...processedAssets);

      // Разворачиваем панели для новых активов
      processedAssets.forEach((_, i) => {
        this.expandedAssetPanels.push(startIndex + i);
      });

      return processedAssets.length;
    },
    transformJsonAsset(jsonAsset) {
      // Сопоставление категорий из JSON с категориями в компоненте
      const categoryMapping = {
        'движимое имущество': 'Движимое имущество',
        'недвижимое имущество': 'Недвижимое имущество',
        'денежные средства': 'Денежные средства',
        'иное имущество': 'Иное имущество'
      };

      // Сопоставление статусов
      const statusMapping = {
        'active': 'active',
        'inactive': 'inactive',
        'leased': 'leased'
      };

      // Проверяем и преобразуем тип актива
      let assetType = jsonAsset.type;
      if (!AssetSchemas[assetType]) {
        // Пытаемся найти похожий тип
        const similarType = Object.keys(AssetSchemas).find(key =>
            key.toLowerCase() === assetType.toLowerCase()
        );
        if (similarType) {
          assetType = similarType;
        } else {
          throw new Error(`Неизвестный тип имущества: ${assetType}`);
        }
      }

      // Преобразование дат в формат DD.MM.YYYY
      const formatDate = (dateString) => {
        if (!dateString) return null;
        try {
          return moment(dateString, 'YYYY-MM-DD').format('DD.MM.YYYY');
        } catch (error) {
          return dateString; // Возвращаем как есть, если не удалось преобразовать
        }
      };

      // Создаем объект актива в формате компонента
      const asset = {
        id: null,
        category: categoryMapping[jsonAsset.category] || jsonAsset.category,
        asset_type: assetType,
        acquisition_date: formatDate(jsonAsset.acquisition_date),
        disposal_date: formatDate(jsonAsset.disposal_date),
        status: statusMapping[jsonAsset.status] || jsonAsset.status,
        details: {}
      };

      // Обрабатываем детали
      if (jsonAsset.details) {
        const schema = AssetSchemas[assetType];

        // Преобразуем все поля из JSON в соответствии со схемой
        Object.keys(jsonAsset.details).forEach(key => {
          const value = jsonAsset.details[key];

          // Если есть схема для этого поля, используем правильный тип
          if (schema.properties && schema.properties[key]) {
            const fieldSchema = schema.properties[key];

            // Преобразование значений в зависимости от типа
            switch (fieldSchema.type) {
              case 'boolean':
                asset.details[key] = Boolean(value);
                break;
              case 'number':
              case 'integer':
                asset.details[key] = Number(value) || 0;
                break;
              case 'string':
                asset.details[key] = String(value);
                break;
              default:
                asset.details[key] = value;
            }
          } else {
            // Для полей, не описанных в схеме, сохраняем как есть
            asset.details[key] = value;
          }
        });
      }

      // Инициализируем детали по схеме (заполняем недостающие поля значениями по умолчанию)
      this.initAssetDetails(asset);

      return asset;
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
        is_main_phone: false
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
        "special_statuses": 'Ошибка спец статуса',
        "assets": 'Имущество'
        // Другие поля по мере необходимости
      };

      if (error.isValidationError) {
        return error.message;
      }
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const messages = [];

        const processErrors = (errorObj, prefix = '') => {
          if (Array.isArray(errorObj)) {
            errorObj.forEach((item, index) => {
              if (typeof item === 'string') {
                messages.push(`<b>${prefix}</b>: ${item}`);
              } else if (typeof item === 'object' && item !== null) {
                // Обрабатываем вложенные объекты
                processErrors(item, `${prefix}[${index}]`);
              }
            });
          } else if (typeof errorObj === 'object' && errorObj !== null) {
            for (const [field, errorsList] of Object.entries(errorObj)) {
              const fieldName = fieldLabels[field] || field;
              const fullPath = prefix ? `${prefix}.${fieldName}` : fieldName;

              if (Array.isArray(errorsList)) {
                errorsList.forEach(errorMsg => {
                  if (typeof errorMsg === 'string') {
                    messages.push(`<b>${fullPath}</b>: ${errorMsg}`);
                  } else if (typeof errorMsg === 'object' && errorMsg !== null) {
                    // Рекурсивная обработка вложенных объектов
                    processErrors(errorMsg, fullPath);
                  }
                });
              } else if (typeof errorsList === 'string') {
                messages.push(`<b>${fullPath}</b>: ${errorsList}`);
              }
            }
          }
        };

        processErrors(errors);

        if (messages.length === 0) {
          // Если не удалось извлечь сообщения стандартным способом
          return 'Произошла ошибка при сохранении';
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
            const currentPersonId = this.editedItem.id;

            // Фильтруем активы: оставляем только те, которые принадлежат текущему лицу
            const filteredAssets = this.editedItem.assets.filter(asset => {
              // Если актив новый (нет id) или принадлежит текущему лицу
              if (!asset.id) return true;
              if (asset.owner === currentPersonId) return true;
              return false;
            });

            const dataToSave = {
              ...this.editedItem,
              assets: filteredAssets, // Используем отфильтрованные активы
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
                date_start: member.date_start,
                date_end: member.date_end,
              })),
              user: this.editedItem.user?.id
            };

            const savedPerson = await this.$store.dispatch('savePerson', dataToSave)
            this.showNotificationMessage('Данные успешно сохранены', 'success');
            this.$emit('save', savedPerson);
            this.$emit('closeModal', savedPerson);
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
    },
    async checkDuplicates() {
      // Проверяем, что есть хотя бы фамилия и имя
      if (!this.editedItem.last_name) {
        return;
      }

      try {
        const duplicates = await this.$store.dispatch('checkPersonDuplicates', {
          last_name: this.editedItem.last_name,
        });
        console.log(duplicates)
        if (duplicates.length > 0) {
          this.duplicates = duplicates;
          this.duplicateDialog = true;
        }
      } catch (error) {
        console.error('Ошибка при проверке дубликатов:', error);
      }
    },
    useDuplicate(duplicate) {
      console.log(duplicate)
      this.$emit('duplicate-selected', duplicate);
      this.duplicateDialog = false;
    },
  },
  created() {
    this.resetForm()
    if (this.countries.length === 0) {
      this.$store.dispatch('getCountry')
    }
    if (!this.$store.getters.legalEntityData?.length) {
      this.$store.dispatch('getLegalEntity');
    }
    this.debouncedCheckDuplicates = debounce(this.checkDuplicates, 500);
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


.identifier-panel {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

/* Стили для панелей имущества */
.v-expansion-panel-header--active .asset-title {
  font-weight: 600;
}

.v-expansion-panel-content__wrap {
  padding: 16px;
}

.success--text {
  color: #4caf50 !important;
  font-weight: 500;
}

.error--text {
  color: #f44336 !important;
  font-weight: 500;
}

.warning--text {
  color: #ff9800 !important;
  font-weight: 500;
}

.info--text {
  color: #2196f3 !important;
  font-weight: 500;
}

/* Стили для совместного имущества */
.joint-asset-panel {
  border-left: 3px solid #1976d2 !important;
}

.joint-asset-panel .v-expansion-panel-header {
  background-color: rgba(25, 118, 210, 0.04) !important;
}

/* Стили для чипсов */
.v-chip--x-small {
  height: 16px;
  font-size: 10px;
}

/* Стили для фильтров */
.v-chip-group .v-chip {
  margin: 2px;
}

>>> div.v-input__append-outer {
  margin-top: 0 !important;
}

/* Адаптивные стили */
@media (max-width: 960px) {
  .identifier-card .v-col {
    padding-top: 8px;
    padding-bottom: 8px;
  }
}

@media (max-width: 600px) {
  .v-expansion-panel-header .caption {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .v-expansion-panel-header .caption .ml-1,
  .v-expansion-panel-header .caption .ml-2 {
    margin-left: 0 !important;
    margin-top: 2px;
  }
}

</style>