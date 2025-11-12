<template>
  <v-container>
    <v-card>
      <v-card-title class="justify-center">Генерация документа</v-card-title>
      <v-card-text>
        <v-row justify="start">
          <v-col cols="4" class="mt-5 actions">
            <v-autocomplete
                v-if="template['name'] !== 'Сводный запрос в кредитную организацию'"
                dense
                outlined
                label="Выберете проект"
                v-model="project"
                :items="activeProjectList"
                item-text="name"
                item-value="id"
                @change="getProjectDetail"
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
            <v-autocomplete
                v-else
                dense
                outlined
                label="Выберете кредитную организацию"
                v-model="creditOrganization"
                :items="creditOrganizationList"
                item-text="name"
                item-value="id"
                return-object
                @change="getCreditOrganizationDetail"
            ></v-autocomplete>
            <v-checkbox v-model="useFacsimile" label="Использовать отдельный файл с факсимиле"></v-checkbox>
            <v-radio-group row dense v-model="docType">
              <v-radio
                  label="DOCX"
                  value="docx"
              ></v-radio>
              <v-radio
                  :disabled="!!!template['template_f']"
                  label="PDF"
                  value="pdf"
              ></v-radio>
              <v-radio
                  :disabled="!!!template['template_wf']"
                  label="PDF без факсимиле"
                  value="pdff"
              ></v-radio>
            </v-radio-group>
            <v-btn :disabled="!vueStore.valid" @click="generateDocument">Сформировать</v-btn>
            <v-row class="mt-4">
              <v-col v-if='template.name === "Публикация \"Коммерсант\""'>
                <v-btn color="success" :disabled="!verify || template.id !== 1" @click="sendMailKommersant">Отправить в
                  коммерсант
                </v-btn>
              </v-col>
              <v-col cols="12">
                <v-checkbox :disabled="!project" dense label="Данные сформированы правильно"
                            v-model="verify"></v-checkbox>
              </v-col>
              <!--              <v-col>-->
              <!--                <v-btn color="success" :disabled="!verify" @click="saveDoc">Сохранить документ в базу</v-btn>-->
              <!--              </v-col>-->
              <v-col>
                <v-btn color="success" :disabled="!verify || !!!sendEmailAddress" @click="sendEmail">Отправить на email
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="3">
                <v-btn color="success" :disabled="!verify" @click="sendPostMail">Создать почтовое
                  отправление
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="7">
            <h5>Список полей в шаблоне</h5>
            <v-form v-model="vueStore.valid" ref="generator" lazy-validation>
              <v-expansion-panels v-model="panel" multiple>
                <v-expansion-panel>
                  <v-expansion-panel-header>Данные должника</v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-list class="field__list" v-for="field in debtorFields" :key="field.id">
                      <template v-if="field['selected']">
                        <v-row v-if="field.value ==='BAILIFFS'" justify="start">
                          <v-col cols="4">
                            <v-autocomplete outlined dense label="Регион" :items="regionList" item-value="id"
                                            v-model="region"
                                            item-text="name"></v-autocomplete>
                          </v-col>
                          <v-col cols="8">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="bailiffsList"
                                            item-text="name"
                                            item-value="id"
                                            return-object
                                            :append-outer-icon="!bailiffs? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="bailiffs && !bailiffs.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(bailiffs)"
                                            :rules="rules.required"
                                            v-model="bailiffs"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  GIBDD-->
                        <v-row v-if="field.value ==='GIBDD'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="gibddList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!gibdd? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="gibdd && !gibdd.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(gibdd)"
                                            v-model="gibdd"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  OSFR-->
                        <v-row v-if="field.value ==='OSFR'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="osfrList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!osfr? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="osfr && !osfr.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(osfr)"
                                            v-model="osfr"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  TECHN-->
                        <v-row v-if="field.value ==='TECHN'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="technicalSupervisionList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!technicalSupervision? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="technicalSupervision && !technicalSupervision.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(technicalSupervision)"
                                            v-model="technicalSupervision"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--RECEIVED_CREDITOR_CLAIM-->
                        <v-row v-if="field.value ==='RECEIVED_CREDITOR_CLAIM'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="basicCreditorClaimLIst"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            multiple
                                            v-model="receivedCreditorClaim">

                              <template v-slot:selection="data">
                                <v-chip close>
                                  {{ data.item.basis }} от {{ data.item.date_origin }}
                                </v-chip>
                              </template>
                              <template v-slot:item="data">
                                <v-list-item-content>
                                  <v-list-item-title>{{ data.item.basis }} от {{
                                      data.item.date_origin
                                    }}
                                  </v-list-item-title>
                                </v-list-item-content>
                              </template>
                            </v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                 UFSVN -->
                        <v-row v-if="field.value ==='UFSVN'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="ufsvnList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!ufsvn? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="ufsvn && !ufsvn.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(ufsvn)"
                                            v-model="ufsvn"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  GIT-->
                        <v-row v-if="field.value ==='GIT'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="gitList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!git? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="git && !git.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(git)"
                                            v-model="git"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  GIMS-->
                        <v-row v-if="field.value ==='GIMS'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="gimsList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!gims? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="gims && !gims.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(gims)"
                                            v-model="gims"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  ADDRD-->
                        <v-row v-if="field.value ==='ADDRD'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="addressDeskList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!addressDesk? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="addressDesk && !addressDesk.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(addressDesk)"
                                            v-model="addressDesk"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  MVD-->
                        <v-row v-if="field.value ==='MVD'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="mvdList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!mvd? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="mvd && !mvd.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(mvd)"
                                            v-model="mvd"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  BTI-->
                        <v-row v-if="field.value ==='BTI'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="btiList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!bti? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="bti && !bti.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(bti)"
                                            v-model="bti"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  KIO-->
                        <v-row v-if="field.value ==='KIO'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="kioList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!kio? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="kio && !kio.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(kio)"
                                            v-model="kio"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  DIZO-->
                        <v-row v-if="field.value ==='DIZO'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="dizoList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!dizo? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="dizo && !dizo.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(dizo)"
                                            v-model="dizo"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row v-if="field.value ==='CURT_SELECT'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="curtList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!curt? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="curt && !curt.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(curt)"
                                            v-model="curt"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row v-if="field.value ==='FNS'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="fnsList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!fns? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="fns && !fns.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(fns)"
                                            v-model="fns"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row v-if="field.value ==='MARRIAGE_SERVICE'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="marriageServiceList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!marriageService? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="marriageService && !marriageService.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(marriageService)"
                                            v-model="marriageService"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row v-if="field.value ==='EMPLOYMENT_SERVICE'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="employmentServiceList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!employmentService? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="employmentService && !employmentService.legal_address ? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(employmentService)"
                                            v-model="employmentService"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--EMPLOYMENT_SERVICE-->
                        <v-row v-if="field.value ==='FROM_MONTH'" justify="start" class="mr-1 ml-1">
                          <v-autocomplete outlined dense :label="field.name" :items="monthList" item-value="text"
                                          item-text="text" v-model="templateFields[field.value]"></v-autocomplete>
                        </v-row>
                        <v-row v-if="field.value ==='CONTRACT'" justify="start" class="mr-1 ml-1">
                          <v-autocomplete outlined dense :label="field.name" :items="contractList" item-value="id"
                                          item-text="name" return-object v-model="contract"></v-autocomplete>
                        </v-row>
                        <v-row v-if="field.value ==='BANK'" justify="start" class="mr-1 ml-1">
                          <v-autocomplete outlined dense :label="field.name" :items="legalList" item-value="id"
                                          :append-outer-icon="!bank? 'mdi-plus': 'mdi-pencil'"
                                          :error-messages="bank && !bank.legal_address? 'Необходимо заполнить данные': ''"
                                          @click:append-outer="editContractor(bank)"
                                          item-text="name" return-object v-model="bank"></v-autocomplete>
                        </v-row>
                        <v-row v-if="field.value ==='CREDITOR'" justify="start" class="mr-1 ml-1">
                          <v-autocomplete outlined dense :label="field.name" :items="allRefList" item-value="uuid"
                                          :append-outer-icon="!creditor? 'mdi-plus': 'mdi-pencil'"
                                          @click:append-outer="editContractor(creditor)"
                                          :error-messages="!creditorErrorMessage(creditor)? '': 'Необходимо заполнить данные'"
                                          item-text="fullName" return-object v-model="creditor"></v-autocomplete>
                        </v-row>
                        <v-row v-if="field.value ==='BANK_ACCOUNT'" justify="start">
                          <v-autocomplete outlined dense :label="field.name" :items="bankAccountList" item-value="id"

                                          return-object v-model="bankAccount">
                            <template v-slot:selection="data">
                              <span style="font-size: 13px">{{ data.item.bank.name }} - {{ data.item.account }}</span>
                            </template>
                            <template v-slot:item="data">
                              <span style="font-size: 13px">{{ data.item.bank.name }} - {{ data.item.account }}</span>
                            </template>
                          </v-autocomplete>
                        </v-row>
                        <v-row v-if="field.value ==='BANK_CARD'" justify="start">
                          <v-autocomplete outlined dense :label="field.name" :items="bankCardList" item-value="id"
                                          multiple
                                          v-model="bankCard">
                            <template v-slot:selection="data">
                              <span style="font-size: 13px">{{ data.item.bank.name }} - {{
                                  data.item.card_number
                                }}</span>
                            </template>
                            <template v-slot:item="data">
                              <span style="font-size: 13px">{{ data.item.bank.name }} - {{
                                  data.item.card_number
                                }}</span>
                            </template>
                          </v-autocomplete>
                        </v-row>
                      </template>
                      <template v-else-if="field['is_date']">
                        <v-text-field type="date" :rules="field.required? rules.required: []"
                                      @change="checkForm"
                                      dense outlined v-model="templateFields[field.value]" :label="field.name">
                        </v-text-field>
                      </template>
                      <template v-else-if="field['is_datetime']">
                        <v-text-field type="datetime-local" :rules="field.required? rules.required: []"
                                      @change="checkForm"
                                      dense outlined v-model="templateFields[field.value]" :label="field.name">
                        </v-text-field>
                      </template>
                      <template v-else-if="field['is_file']">
                        <v-file-input :rules="field.required? rules.required: []"
                                      @change="checkForm"
                                      dense outlined v-model="dataFile" :label="field.name"></v-file-input>
                      </template>
                      <v-text-field v-else-if="!field['auto_generated']" :rules="getFieldRules(field)"
                                    @change="checkForm"
                                    dense outlined v-model="templateFields[field.value]"
                                    :label="field.name"></v-text-field>
                    </v-list>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel v-if="managerFields.length > 0">
                  <v-expansion-panel-header>Данные управляющего</v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-list class="field__list" v-for="field in managerFields" :key="field.id">
                      <template v-if="field['selected']">
                        <!--                        AY_CORRESPONDENCE-->
                        <v-row v-if="field.value ==='AY_CORRESPONDENCE'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="participatorCommunication"
                                            item-text="value"
                                            item-value="value"
                                            :rules="rules.required"
                                            v-model="templateFields[field.value]">
                            </v-autocomplete>
                          </v-col>
                        </v-row>
                      </template>
                    </v-list>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-header>Данные процедуры</v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-list class="field__list" v-for="field in procedureFields" :key="field.id">
                      <template v-if="field['selected']">
                        <v-row v-if="field.value ==='MANAGER_OR_REPRESENTATIVE'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name" :items="allSystemUsersList"
                                            item-value="id"
                                            v-model="templateFields[field.value]"
                                            item-text="fullName"></v-autocomplete>
                          </v-col>
                        </v-row>

                        <v-row v-if="field.value ==='BAILIFFS'" justify="start">
                          <v-col cols="4">
                            <v-autocomplete outlined dense label="Регион" :items="regionList" item-value="id"
                                            v-model="region"
                                            item-text="name"></v-autocomplete>
                          </v-col>
                          <v-col cols="8">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="bailiffsList"
                                            item-text="name"
                                            item-value="id"
                                            return-object
                                            :append-outer-icon="!bailiffs? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="bailiffs && !bailiffs.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(bailiffs)"
                                            :rules="rules.required"
                                            v-model="bailiffs"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  GIBDD-->
                        <v-row v-if="field.value ==='GIBDD'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="gibddList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!gibdd? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="gibdd && !gibdd.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(gibdd)"
                                            v-model="gibdd"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  OSFR-->
                        <v-row v-if="field.value ==='OSFR'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="osfrList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!osfr? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="osfr && !osfr.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(osfr)"
                                            v-model="osfr"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  TECHN-->
                        <v-row v-if="field.value ==='TECHN'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="technicalSupervisionList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!technicalSupervision? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="technicalSupervision && !technicalSupervision.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(technicalSupervision)"
                                            v-model="technicalSupervision"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--RECEIVED_CREDITOR_CLAIM-->
                        <v-row v-if="field.value ==='RECEIVED_CREDITOR_CLAIM'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="basicCreditorClaimLIst"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            append-outer-icon="mdi-plus"
                                            @click:append-outer="addCreditorClaim"
                                            @change="setCreditor"
                                            v-model="receivedCreditorClaim">

                              <template v-slot:selection="data">
                                <v-chip close>
                                  {{ data.item.basis }} от {{ data.item.date_origin }}
                                </v-chip>
                              </template>
                              <template v-slot:item="data">
                                <v-list-item-content>
                                  <v-list-item-title>{{ data.item.basis }} от {{
                                      data.item.date_origin
                                    }}
                                  </v-list-item-title>
                                </v-list-item-content>
                              </template>
                            </v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--CREDITOR_CLAIM_REGISTER-->
                        <v-row v-if="field.value ==='CREDITOR_CLAIM_REGISTER'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="creditorClaimRegisterList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            append-outer-icon="mdi-plus"
                                            @click:append-outer="addCreditorClaimRegister"
                                            @change="setRegisterCreditor"
                                            v-model="registerCreditorClaim">

                              <template v-slot:selection="data">
                                <v-chip close>
                                  {{ data.item | creditor }} - {{ data.item.claim_amount }}
                                </v-chip>
                              </template>
                              <template v-slot:item="data">
                                <v-list-item-content>
                                  <v-list-item-title>{{ data.item | creditor }} - {{ data.item.claim_amount }}
                                  </v-list-item-title>
                                </v-list-item-content>
                              </template>
                            </v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                 UFSVN -->
                        <v-row v-if="field.value ==='UFSVN'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="ufsvnList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!ufsvn? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="ufsvn && !ufsvn.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(ufsvn)"
                                            v-model="ufsvn"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  GIT-->
                        <v-row v-if="field.value ==='GIT'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="gitList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!git? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="git && !git.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(git)"
                                            v-model="git"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  GIMS-->
                        <v-row v-if="field.value ==='GIMS'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="gimsList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!gims? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="gims && !gims.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(gims)"
                                            v-model="gims"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  ADDRD-->
                        <v-row v-if="field.value ==='ADDRD'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="addressDeskList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!addressDesk? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="addressDesk && !addressDesk.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(addressDesk)"
                                            v-model="addressDesk"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  MVD-->
                        <v-row v-if="field.value ==='MVD'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="mvdList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!mvd? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="mvd && !mvd.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(mvd)"
                                            v-model="mvd"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  BTI-->
                        <v-row v-if="field.value ==='BTI'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="btiList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!bti? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="bti && !bti.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(bti)"
                                            v-model="bti"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  KIO-->
                        <v-row v-if="field.value ==='KIO'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="kioList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!kio? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="kio && !kio.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(kio)"
                                            v-model="kio"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  DIZO-->
                        <v-row v-if="field.value ==='DIZO'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="dizoList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!dizo? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="dizo && !dizo.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(dizo)"
                                            v-model="dizo"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row v-if="field.value ==='CURT_SELECT'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="curtList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!curt? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="curt && !curt.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(curt)"
                                            v-model="curt"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row v-if="field.value ==='FNS'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="fnsList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!fns? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="fns && !fns.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(fns)"
                                            v-model="fns"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row v-if="field.value ==='MARRIAGE_SERVICE'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="marriageServiceList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!marriageService? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="marriageService && !marriageService.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(marriageService)"
                                            v-model="marriageService"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row v-if="field.value ==='EMPLOYMENT_SERVICE'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="employmentServiceList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!employmentService? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="employmentService && !employmentService.legal_address ? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(employmentService)"
                                            v-model="employmentService"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  POST -->
                        <v-row v-if="field.value ==='OUT_POST'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="postList"
                                            item-text="name"
                                            item-value="pk"
                                            :rules="rules.required"
                                            :error-messages="gibdd && !gibdd.legal_address? 'Необходимо заполнить данные': ''"
                                            v-model="templateFields[field.value]">
                              <template v-slot:selection="data">
                                <v-chip>
                                  {{ data.item.rpo }}
                                </v-chip>
                              </template>
                              <template v-slot:item="data">
                                <v-list-item-content>
                                  <v-list-item-title>{{ data.item.from_who.fullName }}</v-list-item-title>
                                  <v-list-item-subtitle style="font-size: 10px; color: #00a6ee">
                                    {{ data.item.rpo }} - {{ data.item.departure_date }}
                                  </v-list-item-subtitle>
                                </v-list-item-content>
                              </template>
                            </v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--EMPLOYMENT_SERVICE-->
                        <v-row v-if="field.value ==='FROM_MONTH'" justify="start" class="mr-1 ml-1">
                          <v-autocomplete outlined dense :label="field.name" :items="monthList" item-value="text"
                                          item-text="text" v-model="templateFields[field.value]"></v-autocomplete>
                        </v-row>
                        <v-row v-if="field.value ==='CONTRACT'" justify="start" class="mr-1 ml-1">
                          <v-autocomplete outlined dense :label="field.name" :items="contractList" item-value="id"
                                          item-text="name" return-object v-model="contract"></v-autocomplete>
                        </v-row>
                        <v-row v-if="field.value ==='BANK'" justify="start" class="mr-1 ml-1">
                          <v-autocomplete outlined dense :label="field.name" :items="legalList" item-value="id"
                                          :append-outer-icon="!bank? 'mdi-plus': 'mdi-pencil'"
                                          :error-messages="bank && !bank.legal_address? 'Необходимо заполнить данные': ''"
                                          @click:append-outer="editContractor(bank)"
                                          item-text="name" return-object v-model="bank"></v-autocomplete>
                        </v-row>
                        <v-row v-if="field.value ==='CREDITOR'" justify="start" class="mr-1 ml-1">
                          <v-autocomplete outlined dense :label="field.name" :items="allRefList" item-value="uuid"
                                          :append-outer-icon="!creditor? 'mdi-plus': 'mdi-pencil'"
                                          @click:append-outer="editContractor(creditor)"
                                          :error-messages="!creditorErrorMessage(creditor)? '': 'Необходимо заполнить данные'"
                                          item-text="fullName" return-object v-model="creditor"></v-autocomplete>
                        </v-row>
                        <v-row v-if="field.value ==='BANK_ACCOUNT'" justify="start">
                          <v-autocomplete outlined dense :label="field.name" :items="bankAccountList" item-value="id"

                                          return-object v-model="bankAccount">
                            <template v-slot:selection="data">
                              <span style="font-size: 13px">{{ data.item.bank.name }} - {{ data.item.account }}</span>
                            </template>
                            <template v-slot:item="data">
                              <span style="font-size: 13px">{{ data.item.bank.name }} - {{ data.item.account }}</span>
                            </template>
                          </v-autocomplete>
                        </v-row>
                        <v-row v-if="field.value ==='BANK_CARD'" justify="start">
                          <v-autocomplete outlined dense :label="field.name" :items="bankCardList" item-value="id"
                                          multiple
                                          v-model="bankCard">
                            <template v-slot:selection="data">
                              <span style="font-size: 13px">{{ data.item.bank.name }} - {{
                                  data.item.card_number
                                }}</span>
                            </template>
                            <template v-slot:item="data">
                              <span style="font-size: 13px">{{ data.item.bank.name }} - {{
                                  data.item.card_number
                                }}</span>
                            </template>
                          </v-autocomplete>
                        </v-row>

                      </template>
                      <template v-else-if="field['is_date']">
                        <v-text-field type="date" :rules="field.required? rules.required: []"
                                      @change="checkForm"
                                      dense outlined v-model="templateFields[field.value]" :label="field.name">
                        </v-text-field>
                      </template>
                      <template v-else-if="field['is_datetime']">
                        <v-text-field type="datetime-local" :rules="field.required? rules.required: []"
                                      @change="checkForm"
                                      dense outlined v-model="templateFields[field.value]" :label="field.name">
                        </v-text-field>
                      </template>
                      <template v-else-if="field['is_file']">
                        <v-file-input :rules="field.required? rules.required: []"
                                      @change="checkForm"
                                      dense outlined v-model="dataFile" :label="field.name"></v-file-input>
                      </template>
                      <template v-else-if="field['is_textarea']">
                        <label>{{ field.name }}</label>
                        <VueEditor v-model="templateFields[field.value]"></VueEditor>
                      </template>
                      <template v-else-if="field['value']==='DEBT_OFF'">
                        <v-radio-group v-model="templateFields[field.value]">
                          <v-radio :value="true" label="Списание"></v-radio>
                          <v-radio :value="false" label="Не списание"></v-radio>
                        </v-radio-group>
                      </template>
                      <template v-else-if="field['value']==='FREE_PART_COMPLETION'">
                        <v-textarea dense outlined :label="field.name"
                                    v-model="templateFields[field.value]"></v-textarea>
                        <v-btn text @click="showEditor = true">Открыть окно редактора</v-btn>
                        <v-dialog v-model="showEditor" width="70vh">
                          <v-card height="80vh">
                            <v-toolbar dense>
                              <v-toolbar-title>Свободная часть (Ходатайство о завершении процедуры)</v-toolbar-title>
                              <v-spacer></v-spacer>
                              <v-btn color="primary" icon small @click="showEditor = false">
                                <v-icon>mdi-close</v-icon>
                              </v-btn>
                            </v-toolbar>
                            <v-card-text style="height: 70%">
                              <VueEditor v-model="templateFields[field.value]" class="comment"></VueEditor>
                            </v-card-text>
                          </v-card>
                        </v-dialog>
                      </template>
                      <v-text-field v-else-if="!field['auto_generated']" :rules="field.required? rules.required: []"
                                    @change="checkForm"
                                    dense outlined v-model="templateFields[field.value]"
                                    :label="field.name"></v-text-field>

                    </v-list>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-header>Другие поля</v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-list class="field__list" v-for="field in otherFields" :key="field.id">
                      <template v-if="field['selected']">
                        <v-row v-if="field.value === 'CREDITOR_POST_ADDRESS'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :disabled="!creditor"
                                            :items="creditor? creditor.communication : []"
                                            item-text="value"
                                            item-value="value"
                                            :rules="rules.required"
                                            v-model="templateFields[field.value]"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row v-if="field.value ==='BAILIFFS'" justify="start">
                          <v-col cols="4">
                            <v-autocomplete outlined dense label="Регион" :items="regionList" item-value="id"
                                            v-model="region"
                                            item-text="name"></v-autocomplete>
                          </v-col>
                          <v-col cols="8">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="bailiffsList"
                                            item-text="name"
                                            item-value="id"
                                            return-object
                                            :append-outer-icon="!bailiffs? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="bailiffs && !bailiffs.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(bailiffs)"
                                            :rules="rules.required"
                                            v-model="bailiffs"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  GIBDD-->
                        <v-row v-if="field.value ==='GIBDD'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="gibddList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!gibdd? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="gibdd && !gibdd.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(gibdd)"
                                            v-model="gibdd"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  OSFR-->
                        <v-row v-if="field.value ==='OSFR'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="osfrList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!osfr? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="osfr && !osfr.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(osfr)"
                                            v-model="osfr"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  TECHN-->
                        <v-row v-if="field.value ==='TECHN'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="technicalSupervisionList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!technicalSupervision? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="technicalSupervision && !technicalSupervision.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(technicalSupervision)"
                                            v-model="technicalSupervision"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--RECEIVED_CREDITOR_CLAIM-->
                        <v-row v-if="field.value ==='RECEIVED_CREDITOR_CLAIM'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="basicCreditorClaimLIst"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            multiple
                                            v-model="receivedCreditorClaim">

                              <template v-slot:selection="data">
                                <v-chip close>
                                  {{ data.item.basis }} от {{ data.item.date_origin }}
                                </v-chip>
                              </template>
                              <template v-slot:item="data">
                                <v-list-item-content>
                                  <v-list-item-title>{{ data.item.basis }} от {{
                                      data.item.date_origin
                                    }}
                                  </v-list-item-title>
                                </v-list-item-content>
                              </template>
                            </v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                 UFSVN -->
                        <v-row v-if="field.value ==='UFSVN'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="ufsvnList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!ufsvn? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="ufsvn && !ufsvn.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(ufsvn)"
                                            v-model="ufsvn"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  GIT-->
                        <v-row v-if="field.value ==='GIT'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="gitList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!git? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="git && !git.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(git)"
                                            v-model="git"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  GIMS-->
                        <v-row v-if="field.value ==='GIMS'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="gimsList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!gims? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="gims && !gims.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(gims)"
                                            v-model="gims"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  ADDRD-->
                        <v-row v-if="field.value ==='ADDRD'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="addressDeskList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!addressDesk? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="addressDesk && !addressDesk.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(addressDesk)"
                                            v-model="addressDesk"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  MVD-->
                        <v-row v-if="field.value ==='MVD'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="mvdList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!mvd? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="mvd && !mvd.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(mvd)"
                                            v-model="mvd"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  BTI-->
                        <v-row v-if="field.value ==='BTI'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="btiList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!bti? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="bti && !bti.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(bti)"
                                            v-model="bti"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  KIO-->
                        <v-row v-if="field.value ==='KIO'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="kioList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!kio? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="kio && !kio.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(kio)"
                                            v-model="kio"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--                  DIZO-->
                        <v-row v-if="field.value ==='DIZO'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="dizoList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!dizo? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="dizo && !dizo.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(dizo)"
                                            v-model="dizo"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row v-if="field.value ==='CURT_SELECT'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="curtList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!curt? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="curt && !curt.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(curt)"
                                            v-model="curt"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row v-if="field.value ==='FNS'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="fnsList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!fns? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="fns && !fns.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(fns)"
                                            v-model="fns"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row v-if="field.value ==='MARRIAGE_SERVICE'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="marriageServiceList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!marriageService? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="marriageService && !marriageService.legal_address? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(marriageService)"
                                            v-model="marriageService"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row v-if="field.value ==='EMPLOYMENT_SERVICE'" justify="start">
                          <v-col cols="12">
                            <v-autocomplete outlined dense :label="field.name"
                                            :items="employmentServiceList"
                                            item-text="name"
                                            item-value="id"
                                            :rules="rules.required"
                                            return-object
                                            :append-outer-icon="!employmentService? 'mdi-plus': 'mdi-pencil'"
                                            :error-messages="employmentService && !employmentService.legal_address ? 'Необходимо заполнить данные': ''"
                                            @click:append-outer="editContractor(employmentService)"
                                            v-model="employmentService"></v-autocomplete>
                          </v-col>
                        </v-row>
                        <!--EMPLOYMENT_SERVICE-->
                        <v-row v-if="field.value ==='FROM_MONTH'" justify="start" class="mr-1 ml-1">
                          <v-autocomplete outlined dense :label="field.name" :items="monthList" item-value="text"
                                          item-text="text" v-model="templateFields[field.value]"></v-autocomplete>
                        </v-row>
                        <v-row v-if="field.value ==='CONTRACT'" justify="start" class="mr-1 ml-1">
                          <v-autocomplete outlined dense :label="field.name" :items="contractList" item-value="id"
                                          item-text="name" return-object v-model="contract"></v-autocomplete>
                        </v-row>
                        <v-row v-if="field.value ==='BANK'" justify="start" class="mr-1 ml-1">
                          <v-autocomplete outlined dense :label="field.name" :items="legalList" item-value="id"
                                          :append-outer-icon="!bank? 'mdi-plus': 'mdi-pencil'"
                                          :error-messages="bank && !bank.legal_address? 'Необходимо заполнить данные': ''"
                                          @click:append-outer="editContractor(bank)"
                                          item-text="name" return-object v-model="bank"></v-autocomplete>
                        </v-row>
                        <v-row v-if="field.value ==='CREDITOR'" justify="start" class="mr-1 ml-1">
                          <v-autocomplete outlined dense :label="field.name" :items="allRefList" item-value="uuid"
                                          :append-outer-icon="!creditor? 'mdi-plus': 'mdi-pencil'"
                                          @click:append-outer="editContractor(creditor)"
                                          :error-messages="!creditorErrorMessage(creditor)? '': 'Необходимо заполнить данные'"
                                          item-text="fullName" return-object v-model="creditor"></v-autocomplete>
                        </v-row>
                        <v-row v-if="field.value ==='BANK_ACCOUNT'" justify="start">
                          <v-autocomplete outlined dense :label="field.name" :items="bankAccountList" item-value="id"

                                          return-object v-model="bankAccount">
                            <template v-slot:selection="data">
                              <span style="font-size: 13px">{{ data.item.bank.name }} - {{ data.item.account }}</span>
                            </template>
                            <template v-slot:item="data">
                              <span style="font-size: 13px">{{ data.item.bank.name }} - {{ data.item.account }}</span>
                            </template>
                          </v-autocomplete>
                        </v-row>
                        <v-row v-if="field.value ==='BANK_CARD'" justify="start">
                          <v-autocomplete outlined dense :label="field.name" :items="bankCardList" item-value="id"
                                          multiple
                                          v-model="bankCard">
                            <template v-slot:selection="data">
                              <span style="font-size: 13px">{{ data.item.bank.name }} - {{
                                  data.item.card_number
                                }}</span>
                            </template>
                            <template v-slot:item="data">
                              <span style="font-size: 13px">{{ data.item.bank.name }} - {{
                                  data.item.card_number
                                }}</span>
                            </template>
                          </v-autocomplete>
                        </v-row>
                      </template>
                      <template v-else-if="field['is_date']">
                        <v-text-field type="date" :rules="field.required? rules.required: []"
                                      @change="checkForm"
                                      dense outlined v-model="templateFields[field.value]" :label="field.name">
                        </v-text-field>
                      </template>
                      <template v-else-if="field['is_datetime']">
                        <v-text-field type="datetime-local" :rules="field.required? rules.required: []"
                                      @change="checkForm"
                                      dense outlined v-model="templateFields[field.value]" :label="field.name">
                        </v-text-field>
                      </template>
                      <template v-else-if="field['is_file']">
                        <v-file-input :rules="field.required? rules.required: []"
                                      @change="checkForm"
                                      dense outlined v-model="dataFile" :label="field.name"></v-file-input>
                      </template>
                      <v-text-field v-else-if="!field['auto_generated']" :rules="field.required? rules.required: []"
                                    @change="checkForm"
                                    dense outlined v-model="templateFields[field.value]"
                                    :label="field.name"></v-text-field>
                    </v-list>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-form>
          </v-col>
        </v-row>
      </v-card-text>
      <v-dialog v-model="overlay" width="25vw" scrollable persistent>
        <v-card width="25vw" height="25vh">
          <v-card-text v-if="loading" style="display:flex;">
            <v-row justify="center" align="center">
              Формирование и отправка данных. Ожидайте...
              <v-progress-circular
                  indeterminate
                  size="64"
              ></v-progress-circular>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-card>
    <CreatePostMail></CreatePostMail>
    <ContractorCreateModal></ContractorCreateModal>
    <LegalEntityCreateModal @contractorAdded="updateItem" @contractorUpdate="update"></LegalEntityCreateModal>
    <v-dialog v-model="confirmSave" width="40vw">
      <v-card class="confirm-window_container">
        <v-card-title class="mb-4">
          <v-row justify="center">Подтверждение сохранения документа</v-row>
        </v-card-title>
        <v-card-text class="mt-4 confirm-window" v-if="docErrors">
          <v-row justify="center">
            <h3 class="mb-4">
              {{ docErrors.subject }}
            </h3>
          </v-row>
          <v-row>{{ this.docErrors.text }}</v-row>
          <v-row v-if="docErrors.actions.action === 'openModal'">
            <v-col cols="12" md="8">
              <strong>{{ docErrors.actions.text }}</strong>
            </v-col>
            <v-col cols="12" md="4">
              <v-btn @click="openModal(docErrors.actions.object)">Редактировать</v-btn>
            </v-col>

          </v-row>
          <v-row v-else><strong>{{ docErrors.actions.text }}</strong></v-row>
          <v-row>
            <v-checkbox v-model="confirmData" label="Подтверждаю корректность данных"></v-checkbox>
          </v-row>
        </v-card-text>
        <v-card-text class="mt-4" v-else>
          <p>
            Сохранить документ {{ template.name }}_{{ fileName }}_{{ templateFields['DOC_NUMBER'] }}
            в базу с иходящим номером {{ templateFields['DOC_NUMBER'] }}.
            Текущий документ можно будет заменить.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-row justify="space-around" class="mb-0">
            <v-col cols="auto">
              <v-btn small color="error" @click="cancel">Отмена</v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn small color="success" :disabled="!confirmData" @click="download()">
                Скачать файл
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn small color="success" :disabled="!confirmData" @click="saveDoc(false)">Сохранить</v-btn>
            </v-col>
            <v-col cols="12" class="d-flex justify-center">
              <v-btn small color="success" :disabled="this.docType === 'docx' || !confirmData" @click="saveDoc(true)">
                Подготовить к отправке
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="komPreFormat" width="60vw">
      <v-card>
        <v-card-text style="overflow: hidden;">
          <v-textarea v-model="templateFields['preMessage']" rows="10">

          </v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-row justify="center" class="ma-0">
            <v-col cols="auto">
              <v-btn @click="confirmPreMessage">Сформировать</v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn @click="sendMailKommersant">Отправить в коммерсант</v-btn>
            </v-col>

          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <SystemMessage :state.sync="state" :project="project"/>
    <PhysicalPersonModalFormView></PhysicalPersonModalFormView>
    <!--    <CreateCreditorClaimNew></CreateCreditorClaimNew>-->
    <BasicCreditorClaimCreate @updateBasicCreditorClaim="updateBasicCreditorClaim"></BasicCreditorClaimCreate>
    <v-dialog persistent scrollable v-model="showCreditorClaimCreate" width="700">
      <v-card v-if="projectData">
        <creditor-claim-create :project="projectData.pk" @updateCreditorClaimList="updateCreditorClaimList"
                               @close="showCreditorClaimCreate = false"></creditor-claim-create>
      </v-card>

    </v-dialog>
  </v-container>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'
import {compareFields} from './functions'
import customConst from "@/const/customConst";
import {saveAs} from 'file-saver';
import CreatePostMail from "@/components/PostMail/CreatePostMail";
import ContractorCreateModal from "@/components/referenceBook/ContractorCreateModal";
import LegalEntityCreateModal from "@/components/referenceBook/LegalEntity/LegalEntityCreateModal.vue";
import SystemMessage from "@/components/UI/SystemMessage.vue";
import {ProcedureType} from "@/const/dataTypes";
import {VueEditor} from "vue2-editor";
import PhysicalPersonModalFormView from "@/views/PhysicalPersonV2/PhysicalPersonModalFormView.vue";
import BasicCreditorClaimCreate from "@/components/referenceBook/Project/Creditor/BasicCreditorClaimCreate.vue";
import CreditorClaimCreate from "@/components/referenceBook/Project/Creditor/CreditorClaimCreate.vue";


let vueStore = {
  valid: false
}

export default {
  name: "DocumentGenerator",
  props: {
    template: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    showCreditorClaimCreate: false,
    participator: null,
    useFacsimile: false,
    komPreFormat: false,
    duplicatError: false,
    showEditor: false,
    docErrors: null,
    confirmData: true,
    panel: [0, 1, 2],
    project: null,
    creditOrganization: null,
    confirmSave: false,
    projectData: null,
    docType: 'docx',
    verify: false,
    loading: false,
    overlay: false,
    error: false,
    region: null,
    outPost: null,
    loadDataFromTable: false,
    dataFile: null,
    vueStore: vueStore,
    templateFields: {},
    fileName: null,
    contract: null,
    creditor: null,
    bank: null,
    fns: null,
    employmentService: null,
    bailiffs: null,
    marriageService: null,
    curt: null,
    gibdd: null,
    osfr: null,
    ufsvn: null,
    git: null,
    gims: null,
    bti: null,
    technicalSupervision: null,
    mvd: null,
    kio: null,
    dizo: null,
    receivedCreditorClaim: null,
    registerCreditorClaim: null,
    addressDesk: null,
    docId: null,
    legalContractor: null,
    sendEmailAddress: '',
    bankAccountList: null,
    bankCardList: null,
    bankAccount: null,
    bankCard: [],
    postList: [],
    contractList: null,
    state: '',
    rules: {
      required: [v => !!v || 'Не удалось сапоставить значение'],
      arbitrary: [v => v || v]
    },
    monthList: [
      {value: '1', text: 'Январь'},
      {value: '2', text: 'Февраль'},
      {value: '3', text: 'Март'},
      {value: '4', text: 'Апрель'},
      {value: '5', text: 'Май'},
      {value: '6', text: 'Июнь'},
      {value: '7', text: 'Июль'},
      {value: '8', text: 'Август'},
      {value: '9', text: 'Сентябрь'},
      {value: '10', text: 'Октябрь'},
      {value: '11', text: 'Ноябрь'},
      {value: '12', text: 'Декабрь'},
    ]
  }),
  computed: {
    ...mapGetters({
      projectList: 'projectListData',
      activeProjectList: 'activeProjectListData',
      regionList: 'regionListData',
      participantDetail: 'participantFullDetail',
      participatorList: 'participatorList',
      currentUser: 'authUserData',
      allRefList: 'allRefData',
      allSystemUsersList: 'allSystemUsersData',
      currentUserData: 'currentUserData',
      legalList: 'legalEntityData',
      creditOrganizationList: 'creditOrganizationListData',
      fnsList: 'fnsListData',
      employmentServiceList: 'employmentServiceListData',
      bailiffsList: 'bailiffsListData',
      marriageServiceList: 'marriageServiceListData',
      curtList: 'curtListData',
      gibddList: 'gibddListData',
      osfrList: 'osfrListData',
      ufsvnList: 'ufsvnListData',
      gitList: 'gitListData',
      gimsList: 'gimsListData',
      technicalSupervisionList: 'technicalSupervisionListData',
      addressDeskList: 'addressDeskListData',
      mvdList: 'mvdListData',
      btiList: 'btiListData',
      kioList: 'kioListData',
      dizoList: 'dizoListData',
      basicCreditorClaimLIst: 'basicCreditorClaimData',
      creditorClaimRegisterList: 'creditorClaimRegisterData'
    }),
    debtorFields() {
      return this.template.fields.filter(obj => obj['field_type'] === "Debtor")
    },
    procedureFields() {
      return this.template.fields.filter(obj => obj['field_type'] === "Procedure")
    },
    managerFields() {
      return this.template.fields.filter(obj => obj['field_type'] === "AY")
    },
    otherFields() {
      return this.template.fields.filter(obj => !obj['field_type'])
    },
    participatorCommunication() {
      if (this.projectData) {
        console.log(this.projectData)
        return this.projectData.participant.participator.communication.filter(obj => obj.communication_type !== 'Email' && obj.communication_type !== "Phone")
      } else if (this.participatorList.length > 0) {
        console.log(this.participatorList)
        return this.participatorList[0].participator.communication.filter(obj => obj.communication_type !== 'Email' && obj.communication_type !== "Phone")
      } else {
        return []
      }
    }
  },
  watch: {
    template() {
      this.$forceUpdate();
    },
    templateFields(val) {
      if ('CREDITOR_NOTICE' in val) {
        this.getNoticeDocs()
      }
      if ('POST_TOTAL_PRICE' in val) {
        this.getPostPrice()
      }
      if ('DOC_TOTAL_PRICE' in val) {
        this.getDocPrice()
      }

    }
  },
  methods: {
    ...mapActions({
      getCreditorClaim: "getCreditorClaim"
    }),
    cancel() {
      this.confirmSave = false
      this.templateFields['preMessage'] = ''
    },
    updateCreditorClaimList() {
      this.getCreditorClaim(this.projectData.pk)
      this.showCreditorClaimCreate = false
    },
    confirmPreMessage() {
      this.komPreFormat = false
      this.generateDocument()
    },
    updateBasicCreditorClaim() {
      this.$store.dispatch('getBasicCreditorClaim', this.projectData.id).then(res => {
        this.receivedCreditorClaim = res.at(-1)['id']
        this.setCreditor(res.at(-1)['id'])
      })
    },
    setCreditor(item) {
      const creditorClaim = this.basicCreditorClaimLIst.find(obj => obj.id === item)
      if (creditorClaim && creditorClaim.legal_creditor) {
        this.creditor = creditorClaim.legal_creditor
      } else if (creditorClaim && creditorClaim.physical_creditor) {
        this.creditor = creditorClaim.physical_creditor
      }
    },
    setRegisterCreditor(item) {
      const creditorClaim = this.creditorClaimRegisterList.find(obj => obj.id === item)
      if (creditorClaim && creditorClaim.legal_creditor) {
        this.creditor = creditorClaim.legal_creditor
      } else if (creditorClaim && creditorClaim.physical_creditor) {
        this.creditor = creditorClaim.physical_creditor
      }
    },
    getDocs() {

    },
    openModal({objType, id}) {
      let item;
      if (objType === 'LegalEntity') {
        item = this.allRefList.filter(obj => obj.id === id)[0]
      }
      switch (objType) {
        case 'PhysicalPerson':
          this.$emit('showModalPerson', id)
          break
        case 'LegalEntity':
          this.$emit('legalEntityModal', item)
      }
    },
    update(item) {
      this.$store.dispatch('getLegalEntity')
    },
    updateItem(item) {
      if (item['org_type'] === 'EMPLS') {
        this.employmentService = item
      } else if (item['org_type'] === 'BANK' || item['org_type'] === 'EMPTY') {
        this.bank = item
      } else if (item['org_type'] === 'FNS') {
        this.fns = item
      } else if (item['org_type'] === 'FSSP') {
        this.bailiffs = item
      } else if (item['org_type'] === 'GIBDD') {
        this.gibdd = item
      } else if (item['org_type'] === 'OSFR') {
        this.osfr = item
      } else if (item['org_type'] === 'TECHN') {
        this.technicalSupervision = item
      } else if (item['org_type'] === 'GIT') {
        this.git = item
      } else if (item['org_type'] === 'GIMS') {
        this.gims = item
      } else if (item['org_type'] === 'ADDRD') {
        this.addressDesk = item
      } else if (item['org_type'] === 'MVD') {
        this.mvd = item
      } else if (item['org_type'] === 'UFSVN') {
        this.ufsvn = item
      } else if (item['org_type'] === 'BTI') {
        this.bti = item
      } else if (item['org_type'] === 'KIO') {
        this.kio = item
      } else if (item['org_type'] === 'DIZO') {
        this.dizo = item
      } else if (item['org_type'] === 'ZAGS') {
        this.marriageService = item
      } else if (item['org_type'] === 'ARBCR' || item['org_type'] === 'GEJRD' || item['org_type'] === 'MGSCR' || item['org_type'] === 'MOSC') {
        this.curt = item
      }

    },
    checkForm() {
      this.$refs.generator.validate()

    },
    validateInn(value) {
      if (!value) return true;
      const cleanValue = value.replace(/\D/g, '');
      return cleanValue.length === 12 || 'ИНН должен содержать 12 цифр';
    },
    getDocumentNumber() {
      console.log(this.templateFields['OUT_NUMBER'] || this.templateFields['NUMBER'] || '')
      return this.templateFields['OUT_NUMBER'] || this.templateFields['NUMBER'] || '';
    },
    validateSnils(value) {
      if (!value) return true;
      const cleanValue = value.replace(/\D/g, '');
      const isValidLength = cleanValue.length === 11;
      const isValidFormat = /^\d{3}-\d{3}-\d{3} \d{2}$/.test(value);
      return (isValidLength && isValidFormat) || 'Неверный формат СНИЛС (XXX-XXX-XXX XX)';
    },
    getFieldRules(field) {
      const rules = [];
      if (field.required) {
        rules.push(v => !!v || 'Обязательное поле');
      }

      const fieldName = field.name.toLowerCase();
      if (fieldName.includes('инн')) {
        rules.push(v => this.validateInn(v));
      } else if (fieldName.includes('снилс')) {
        rules.push(v => this.validateSnils(v));
      }

      return rules;
    },
    getProjectDetail(item) {
      this.$store.dispatch('getProjectDetail', item).then(data => {
        this.projectData = data
        this.participator = data.participant.participator
        console.log(this.projectData)
        this.$store.dispatch('getBasicCreditorClaim', this.projectData.id)
        if (data.legal_contractor) {
          this.legalContractor = data.legal_contractor
          this.sendEmailAddress = data.legal_contractor.contact_email
        } else {
          this.legalContractor = null
          this.sendEmailAddress = null
        }
        console.log(data)
        this.$store.dispatch('getOrganizationBankAccount', data.participant.participator.uuid).then(bankAccount => {
          this.bankAccountList = bankAccount
        })
        this.$store.dispatch('getBankCardList', data.id).then(cardList => {
          this.bankCardList = cardList
        })
        this.contractList = data.contract
        this.fileName = data['name'].split(' ')[0]
        this.$store.dispatch('getProjectAct', data['id']).then(res => {
          data['act'] = res.data.data.data
          compareFields(this.template.fields, data).then(async (data) => {
            this.templateFields = data
          })
        })
        this.$store.dispatch('getProjectPost', this.projectData.pk).then(res => {
          this.postList = [...res]
        })
        this.getCreditorClaim(this.projectData.pk)
        this.$refs.generator.validate()
      })
    },
    creditorErrorMessage(item) {
      if (item) {
        if (item.type === "LegalEntity") {
          return !item.legal_address;
        }
      }
    },
    getCreditOrganizationDetail(item) {
      console.log('this.currentUserData', this.currentUserData)
      let db = 36
      if (this.currentUserData.length > 0) {
        let db_name = this.currentUserData[0].db_name
        if (db_name === 'test-tkachenko' || db_name === 'crm_tkachenko') {
          db = 23
        } else if (db_name === 'test-gushcha' || db_name === 'crm_gushcha') {
          db = 35
        }
      }
      this.project = db
      this.bank = item
      this.$store.dispatch('getProjectDetail', db).then(data => {
        this.projectData = data
        compareFields(this.template.fields, data).then(async (data) => {
          this.templateFields = data
        })
      })

    },
    setFormData() {
      let formData = new FormData()
      if (this.templateFields['preMessage']) {
        formData.append('project', this.templateFields['preMessage'])
      }
      formData.append('useFacsimile', this.useFacsimile)
      formData.append('template', this.template.id)
      formData.append('project', this.project)
      formData.append('docType', this.docType)
      formData.append('sendMailAddress', this.sendEmailAddress)
      formData.append('filename', `${this.template.name}_${this.fileName}`)
      if (this.contract) {
        formData.append('contract', this.contract.pk)
      }
      if (this.fns) {
        formData.append('FNS', this.fns.id)
      }
      if (this.bailiffs) {
        formData.append('BAILIFFS', this.bailiffs.id)
      }
      if (this.employmentService) {
        formData.append('EMPLOYMENT_SERVICE', this.employmentService.id)
      }
      if (this.receivedCreditorClaim) {
        formData.append('received_claim', this.receivedCreditorClaim)
      }
      if (this.registerCreditorClaim) {
        formData.append('register_creditor_claim', this.registerCreditorClaim)
      }
      if (this.marriageService) {
        formData.append('MARRIAGE_SERVICE', this.marriageService.id)
      }
      if (this.git) {
        formData.append('GIT', this.git.id)
      }
      if (this.curt) {
        formData.append('CURT_SELECT', this.curt.id)
      }
      if (this.gibdd) {
        formData.append('GIBDD', this.gibdd.id)
      }
      if (this.ufsvn) {
        formData.append('UFSVN', this.ufsvn.id)
      }
      if (this.osfr) {
        formData.append('OSFR', this.osfr.id)
      }
      if (this.gims) {
        formData.append('GIMS', this.gims.id)
      }
      if (this.technicalSupervision) {
        formData.append('TECHN', this.technicalSupervision.id)
      }
      if (this.addressDesk) {
        formData.append('ADDRD', this.addressDesk.id)
      }
      if (this.mvd) {
        formData.append('MVD', this.mvd.id)
      }
      if (this.bti) {
        formData.append('BTI', this.bti.id)
      }
      if (this.kio) {
        formData.append('KIO', this.kio.id)
      }
      if (this.dizo) {
        formData.append('DIZO', this.dizo.id)
      }
      if (this.bankAccount) {
        formData.append('BANK_NAME', this.bankAccount.bank.name)
        formData.append('BANK_BIK', this.bankAccount.bank.bik)
        formData.append('BANK_COR_ACCOUNT', this.bankAccount.bank.correspondent_account)
        formData.append('BANK_ACCOUNT', this.bankAccount.account)
      }
      if (this.creditor) {
        if (this.creditor.type === 'LegalEntity') {
          console.log(this.creditor)
          formData.append('CREDITOR', this.creditor.name)
          formData.append('CREDITOR_UUID', this.creditor.uuid)
          formData.append('CREDITOR_ADDRESS', this.creditor?.legal_address || this.creditor?.postal_address)
        } else {
          formData.append('CREDITOR_UUID', this.creditor.uuid)
          formData.append('CREDITOR', this.creditor.fullName)
          console.log(this.creditor)
          const russianCitizenship = this.creditor.citizenships?.find(c => c.country.id === 1);
          const citizenshipId = russianCitizenship?.id ||
              (this.creditor.citizenships?.length > 0 ? this.creditor.citizenships[0].id : null);
          if (this.creditor?.identifiers?.length > 0) {
            // Находим блок идентификаторов для нужного гражданства
            const identifierBlock = citizenshipId
                ? this.creditor.identifiers.find(block => block.citizenship === citizenshipId)
                : this.creditor.identifiers[0];
            const registrationBlock = citizenshipId
                ? this.creditor.registration.find(block => block.citizenship === citizenshipId)
                : this.creditor.registration[0];
            console.log(registrationBlock)
            if (identifierBlock?.identifier) {
              // Ищем конкретные идентификаторы внутри блока
              const innIdentifier = identifierBlock.identifier.find(id => id.type === 'INN');
              const snilsIdentifier = identifierBlock.identifier.find(id => id.type === 'SNILS');
              formData.append('CREDITOR_INN', innIdentifier?.value || null)
              formData.append('CREDITOR_OGRN', snilsIdentifier?.value || null)
            }
            if (registrationBlock) {
              let address = registrationBlock.address
              if (registrationBlock?.postcode) {
                address = registrationBlock?.postcode + ', ' + address
              }
              formData.append('CREDITOR_ADDRESS', address)
            } else {
              formData.append('CREDITOR_ADDRESS', " ")
            }
          }
          // formData.append('CREDITOR_ADDRESS', this.templateFields['CREDITOR_POST_ADDRESS'])
        }

      }
      if (this.bank) {
        formData.append('BANK', this.bank.name)
        formData.append('BANK_ID', this.bank.id)
        formData.append('BANK_ADDRESS', this.bank?.legal_address)
      }

      Object.keys(this.templateFields).forEach(key => {
        formData.append(key, this.templateFields[key])
      })
      if (this.dataFile) {
        formData.append('dataFile', this.dataFile)
      }
      if (this.bankCard) {
        this.bankCard.forEach(item => formData.append('BANK_CARD', item))
        // formData.append('BANK_CARD', this.bankCard)
      }
      return formData
    },
    generateDocument() {
      this.docErrors = null
      this.confirmData = true
      this.overlay = true
      this.loading = true
      let formData = this.setFormData()
      let responseType = 'blob'
      if (!this.templateFields['preMessage']) {
        if (this.template.name === 'Публикация "Коммерсант"') {
          formData.append('preRenderMessage', true)
          responseType = 'json'
        }
      }
      this.$http({
        method: "POST",
        url: customConst.GENERATOR + 'document-template/generate/',
        data: formData,
        responseType: responseType
      }).then(res => {
        console.log(res.headers)
        if (responseType === 'json') {
          this.templateFields['preMessage'] = res.data.data.message
          this.confirmSave = false
          this.komPreFormat = true
        } else {
          let fileExtension = this.docType === 'docx' ? '.docx' : '.pdf';
          if (res.headers['content-type'] === 'application/zip') {
            fileExtension = '.zip'
          }
          let fileName;
          if (this.template.category === "Судебное делопроизводство") {
            fileName = `${this.projectData.code}-${this.getDocumentNumber()}_${this.template.name.replace(/\s+/g, '_')}`
            const pageCount = res.headers['x-page-count'] || '';
            if (pageCount) {
              fileName += `_${pageCount}л`;
            }
          } else if (this.template.name.startsWith('Промежуточный отчет')) {
            let contractorName;
            if (this.projectData.physical_contractor) {
              contractorName = this.projectData.physical_contractor.last_name
            } else {
              contractorName = this.projectData.legal_contractor.full_name
            }
            fileName = `${this.projectData.code}_${contractorName.replace(/\s+/g, '_')}_${"Промежуточный отчет".replace(/\s+/g, '_')}`
          } else {
            if (this.template.name.startsWith('Счет') || this.template.name.startsWith('Акт')) {
              fileName = `${this.fileName}_${this.template.name.replaceAll(' ', '_')}-${this.getDocumentNumber()}`
            } else {
              fileName = `${this.projectData.code}-${this.getDocumentNumber()}`
            }
          }
          fileName += fileExtension;
          saveAs(res.data, fileName)
        }
        this.overlay = false
        this.loading = false
      }).then(() => {
        if (responseType !== 'json') {
          this.confirmSave = true
        }
        if (!this.template.name.includes('ЕФРСБ') && responseType !== 'json') {
          this.confirmSave = true
        }
      }).catch(async (err) => {
        if (err.response.status === 409) {
          this.duplicatError = true
          const errorText = await err.response.data.text();
          const errorData = JSON.parse(errorText);
          this.docErrors = errorData.errors.data
          this.confirmSave = true
          this.confirmData = false
          this.overlay = false
          this.loading = false
        } else {
          this.overlay = false
          this.loading = false
          this.duplicatError = false
          this.state = 'error'
          this.$emit('showSystemMessage', {response: err, state: this.state})
        }
      }).finally(() => {
        this.overlay = false
        this.loading = false
      })
    },
    async download() {
      let formData = this.setFormData()
      formData.append('confirmSave', this.confirmSave)
      await this.$http({
        method: "POST",
        url: customConst.GENERATOR + 'document-template/download-file/',
        data: formData,
        responseType: 'blob'
      }).then(async res => {
        let fileExtension = this.docType === 'docx' ? '.docx' : '.pdf';
        if (res.headers['content-type'] === 'application/zip') {
          fileExtension = '.zip'
        }
        let fileName;
        if (this.template.category === "Судебное делопроизводство") {
          fileName = `${this.projectData.code}_${this.getDocumentNumber()}_${this.template.name.replace(/\s+/g, '_')}`
          const pageCount = res.headers['x-page-count'] || '';
          if (pageCount) {
            fileName += `_${pageCount}л`;
          }
        } else if (this.template.name.startsWith('Промежуточный отчет')) {
          let contractorName;
          if (this.projectData.physical_contractor) {
            contractorName = this.projectData.physical_contractor.last_name
          } else {
            contractorName = this.projectData.legal_contractor.full_name
          }
          fileName = `${this.projectData.code}_${contractorName.replace(/\s+/g, '_')}_${"Промежуточный отчет".replace(/\s+/g, '_')}`
        } else {
          if (this.template.name.startsWith('Счет') || this.template.name.startsWith('Акт')) {
            fileName = `${this.fileName}_${this.template.name.replaceAll(' ', '_')}-${this.getDocumentNumber()}`
          } else {
            fileName = `${this.projectData.code}-${this.getDocumentNumber()}`
          }
        }
        fileName += fileExtension;
        await saveAs(res.data, fileName)
        this.overlay = false
        this.loading = false
      })
    },
    async saveDoc(readyToSend = false, postOrder = false) {
      this.overlay = true
      this.loading = true
      let formData = this.setFormData()
      formData.append('project', this.project)
      formData.append('confirmSave', this.confirmData)
      formData.append('docType', this.docType)
      formData.append('docSend', readyToSend.toString())
      return new Promise((resolve, reject) => {
        this.$http({
          method: "POST",
          url: customConst.GENERATOR + 'document-template/save-doc/',
          data: formData,
        }).then(async (res) => {
          this.loading = false
          if (this.duplicatError) {
            await this.download()
          }
          setTimeout(() => {
            this.error = false
            this.overlay = false
            this.confirmSave = false
            this.docId = res.data.data.data
            this.overlay = false
            this.loading = false
            this.state = 'success'
            if (!postOrder) {
              this.$emit('showSystemMessage', {response: res, state: this.state, send: readyToSend})
            } else {
              this.$emit('showSystemMessage', {response: res, state: this.state, send: readyToSend})
            }
            this.duplicatError = false
            resolve()
          }, 1000)
        }).then(() => {
          if (this.templateFields['OUT_NUMBER']) {
            this.templateFields['OUT_NUMBER'] = Number(this.templateFields['OUT_NUMBER']) + 1
          }

        }).catch(err => {
          this.overlay = false
          this.loading = false
          this.state = 'error'
          this.$emit('showSystemMessage', {
            response: err,
            state: this.state,
          })
        })
      })
    },
    sendMailKommersant() {
      this.overlay = true
      this.loading = true
      let formData = this.setFormData()
      formData.append('project', this.project)
      this.$http({
        method: "POST",
        url: customConst.GENERATOR + 'document-template/send_mail_to_kommersant/',
        data: formData,
      }).then(res => {
        this.overlay = false
        this.loading = false
        this.state = 'success'
        this.$emit('showSystemMessage', {response: res, state: this.state})
      }).catch(err => {
        this.overlay = false
        this.loading = false
        this.state = 'error'
        this.$emit('showSystemMessage', {response: err, state: this.state})
      })
    },
    sendEmail() {
      this.overlay = true
      this.loading = true
      let formData = this.setFormData()
      formData.append('project', this.project)
      this.$http({
        method: "POST",
        url: customConst.GENERATOR + 'document-template/send_mail/',
        data: formData,
      }).then(res => {
        this.loading = false
        setTimeout(() => {
          this.error = false
          this.overlay = false
        }, 1000)
      }).catch(err => {
        this.loading = false
        setTimeout(() => {
          this.error = true
          this.overlay = false
        }, 1000)
      })
    },
    async runSelenium() {
      let formData = this.setFormData()
      this.$http({
        method: "POST",
        url: customConst.GENERATOR + 'document-template/fill-fssp/',
        data: formData,
      })
    },
    async sendPostMail() {
      await this.saveDoc(false, true)
      this.$emit('createPostMail', {
        legalData: this.legalContractor,
        project: this.projectData,
        number: this.templateFields['NUMBER'],
        doc: this.docId
      })
    },
    save(name, field) {
      console.log(name, field)
    },
    getNoticeDocs() {
      return new Promise(resolve => {
        this.$http({
          method: 'GET',
          url: customConst.PAPERFLOW_API + 'get-notice-docs',
          params: {
            project: this.project
          }
        }).then(res => {
          console.log(res.data.data.data)
          this.templateFields['CREDITOR_NOTICE'] = res.data.data.data
          resolve()
        })
      })
    },
    getPostPrice() {
      return new Promise(resolve => {
        this.$http({
          method: 'GET',
          url: customConst.PAPERFLOW_API + 'get-post-price',
          params: {
            project: this.project
          }
        }).then(res => {
          console.log(res.data.data.data)
          this.templateFields['POST_TOTAL_PRICE'] = res.data.data.data
          resolve()
        })
      })
    },
    getDocPrice() {
      return new Promise(resolve => {
        this.$http({
          method: 'GET',
          url: customConst.PAPERFLOW_API + 'get-doc-price',
          params: {
            project: this.project
          }
        }).then(res => {
          console.log(res.data.data.data)
          this.templateFields['DOC_TOTAL_PRICE'] = res.data.data.data
          resolve()
        })
      })
    },
    editContractor(item) {
      console.log(item)
      if (item) {
        if (item.type !== "PhysicalPerson") {
          this.$emit('legalEntityModal', item)
        } else {
          this.$emit('showModals')
        }
      } else {
        this.$emit('addContractor')
      }
    },
    addCreditorClaim() {
      this.$emit('createBasicCreditorClaim', this.projectData)
    },
    addCreditorClaimRegister() {
      this.showCreditorClaimCreate = true
    }
  },
  filters: {
    getProcedure(item) {
      let legal = ProcedureType.Legal
      let physical = ProcedureType.Physical
      let physicalVal = physical.filter(obj => {
        if (obj.value === item) {
          return obj
        }
      })[0]
      let legalVal = legal.filter(obj => {
        if (obj.value === item) {
          return obj
        }
      })[0]
      if (physicalVal) {
        return physicalVal.text
      } else if (legalVal) {
        return legalVal.text
      }
    },
    creditor(item) {
      return item.legal_creditor ? item.legal_creditor.name : item.physical_creditor.fullName
    }
  },
  async created() {
    await this.$store.dispatch('allSystemUser')
    await this.$store.dispatch('getBasicCreditorClaim')
    await this.$store.dispatch('getParticipator')
    await this.$store.dispatch('getCreditorOrganization')
    await this.$store.dispatch('getProjectList')
    await this.$store.dispatch('getRegion')
    // await this.$store.dispatch('getBailiffs')
    await this.$store.dispatch('getContractList')
    await this.$store.dispatch('fetchPhysicalPersons')
    await this.$store.dispatch('getLegalEntity')

  },
  components: {
    CreditorClaimCreate,
    BasicCreditorClaimCreate,
    // CreateCreditorClaimNew,
    SystemMessage,
    CreatePostMail,
    ContractorCreateModal,
    LegalEntityCreateModal,
    VueEditor,
    PhysicalPersonModalFormView,
  }
};
</script>

<style scoped>
.confirm-window_container {
  min-height: 35vh;
  max-height: 55vh;
}

.confirm-window {
  min-height: 40%;
  max-height: 60%;
  overflow: auto !important;
}

.confirm-window .row {
  margin: 0;
}

>>> .v-list {
  padding: 0 !important;
}

>>> .v-card__text {
  max-height: 80vh;
  overflow-y: scroll;
}

>>> .mdi-content-save {
  color: green;
}
</style>