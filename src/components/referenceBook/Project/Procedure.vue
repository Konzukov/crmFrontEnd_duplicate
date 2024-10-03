<template>
  <v-container fluid>

    <v-expansion-panels focusable>
      <InvolvedPersons :collapsed="collapsed"></InvolvedPersons>
      <Complaint :collapsed="collapsed"></Complaint>
      <template v-if="procedureType === 'SDP'">
        <v-expansion-panel> <!-- Счета-->
          <v-expansion-panel-header class="pr-5 pl-5">4.1. Сведения о счетах должника в банках и иных кредитных
            организациях (Счета)
            <v-spacer></v-spacer>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn class="mr-6" icon small v-bind="attrs"
                       v-on="on" color="success" @click.native.stop="addAccountXlsx">
                  <v-icon>mdi-table-large-plus</v-icon>
                </v-btn>
              </template>
              <span>Загрузка счетов из xlsx</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn small icon v-bind="attrs"
                       v-on="on" color="success" @click.native.stop="addAccount">
                  <v-icon>mdi-plus-thick</v-icon>
                </v-btn>
              </template>
              <span>Добавить счет</span>
            </v-tooltip>
          </v-expansion-panel-header>
          <v-expansion-panel-content class="procedure_content" :style="collapsed? 'height: 50vh': 'height: 41vh'">
            <v-row justify="start" style="height: 80%">
              <v-col :cols="selectedAccount? '8': '12' ">
                <v-card flat>
                  <v-card-text style="height: 80%">
                    <v-data-table
                        :items="bankAccountList"
                        :headers="headers"
                        :items-per-page="50"
                        dense
                        height="50%"
                        @dblclick:row="editItem"
                        :item-class="accountRowClass"
                    >
                      <template v-slot:item.account="{item}">
                        {{ item.account }}
                        <v-menu
                            open-on-hover
                            right
                            offset-x
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                :color="item.account_statement.length > 0? 'primary': 'grey darken-1 '"
                                dark
                                icon
                                v-bind="attrs"
                                v-on="on"
                            >
                              <svg-icon type="mdi" :path="fileIcon"></svg-icon>
                            </v-btn>
                          </template>
                          <v-list v-if="item.account_statement.length > 0">
                            <v-list-item
                                @click="editStatement(item)"
                                v-for="(item, index) in item.account_statement"
                                :key="index"
                                link
                            >

                              <v-list-item-subtitle>{{ item.date_from }} - {{
                                  item.date_to
                                }}
                              </v-list-item-subtitle>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </template>
                      <template v-slot:item.actions="{ item }">
                        <v-icon
                            small
                            class="mr-2"
                            @click="editItem($event, {item})"
                        >
                          mdi-pencil
                        </v-icon>
                      </template>
                    </v-data-table>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col :cols="selectedAccount? '4': '0'" v-if="selectedAccount">
                <bankAccountCreate :bank-data="selectedAccount" :project="project"
                                   @updateAccountList="updateAccountList"
                                   @resetForm="closeTab"></bankAccountCreate>
              </v-col>
            </v-row>

          </v-expansion-panel-content>
        </v-expansion-panel>
      </template>
      <template v-if="procedureType === 'RCP'">
        <v-expansion-panel>
          <!-- 4.1.	Отчет о результатах исполнения гражданином утвержденного арбитражным судом плана реструктуризации долгов гражданина -->
          <v-expansion-panel-header class="pr-5 pl-5">4.1. Отчет о результатах исполнения гражданином утвержденного
            арбитражным судом плана реструктуризации долгов гражданина
            <v-spacer></v-spacer>
          </v-expansion-panel-header>
          <v-expansion-panel-content class="procedure_content">
            <v-row justify="center">
              <v-card flat>
                <v-card-text>
                </v-card-text>
              </v-card>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </template>
      <v-expansion-panel>
        <!-- Собрания кредиторов -->
        <v-expansion-panel-header class="pr-5 pl-5">4.2. Сведения о решениях, принятых на собраниях кредиторов
          <v-spacer></v-spacer>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn small icon v-bind="attrs"
                     v-on="on" color="success" @click.native.stop="addCreditorMeeting">
                <v-icon>mdi-plus-thick</v-icon>
              </v-btn>
            </template>
            <span>Добавить собрание</span>
          </v-tooltip>
        </v-expansion-panel-header>
        <CreditorMeeting :collapsed="collapsed" :project="project"></CreditorMeeting>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header class="pr-5 pl-5">
          4.3. Сведения о составе и стоимости имущества должника
          <v-spacer></v-spacer>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn small icon v-bind="attrs"
                     v-on="on" color="success" @click.native.stop="addEstate">
                <v-icon>mdi-plus-thick</v-icon>
              </v-btn>
            </template>
            <span>Добавить имущество</span>
          </v-tooltip>
        </v-expansion-panel-header>
        <BankruptcyEstate :collapsed="collapsed" :project="project"></BankruptcyEstate>
      </v-expansion-panel>
      <template v-if="procedureType === 'SDP'">
        <v-expansion-panel> <!-- реализация имущества -->
          <v-expansion-panel-header class="pr-5 pl-5">
            4.4. Сведения о решениях касающихся оценки и реализации имущества должника
            <v-spacer></v-spacer>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn small icon v-bind="attrs"
                       v-on="on" color="success" @click.native.stop="addEstateSale">
                  <v-icon>mdi-plus-thick</v-icon>
                </v-btn>
              </template>
              <span>Добавить реализацию имущества</span>
            </v-tooltip>
          </v-expansion-panel-header>
          <EstateSaleProgress :collapsed="collapsed" :project="project"></EstateSaleProgress>
        </v-expansion-panel>
      </template>
      <v-expansion-panel> <!-- 4.5. / 4.4(РД)	Меры по обеспечению сохранности имущества должника -->
        <v-expansion-panel-header class="pr-5 pl-5">
          <template v-if="procedureType === 'SDP'">4.5.</template>
          <template v-else>4.4.</template>
          Меры по обеспечению сохранности имущества должника
        </v-expansion-panel-header>
        <v-expansion-panel-content class="procedure_content">
          <v-row justify="center">
            <v-card flat>
              <v-card-text><h4>Формируется автоматически</h4></v-card-text>
            </v-card>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <template v-if="procedureType === 'SDP'">
        <v-expansion-panel>
          <!-- 4.5.1.	Сведения о количестве и об общем размере требований о взыскании задолженности, предъявленных финансовым управляющим к третьим лицам -->
          <v-expansion-panel-header class="pr-5 pl-5">4.5.1. Сведения о количестве и об общем размере требований о
            взыскании задолженности, предъявленных финансовым управляющим к третьим лицам
          </v-expansion-panel-header>
          <v-expansion-panel-content class="procedure_content">
            <v-row justify="center">
              <v-card flat>
              </v-card>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </template>
      <v-expansion-panel>
        <!-- 4.6. Сведения о ведении реестра требований кредиторов -->
        <v-expansion-panel-header class="pr-5 pl-5">
          <template v-if="procedureType === 'SDP'">4.6.</template>
          <template v-else>4.5.</template>
          Сведения о ведении реестра требований кредиторов
          <v-spacer></v-spacer>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="procedure_content">
          <v-row justify="center">
            <v-card flat>
              <v-card-text>
                <h4>Формируется автоматически</h4>
              </v-card-text>
            </v-card>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <!-- 4.6.1.	Формирование реестра требований кредиторов -->
        <v-expansion-panel-header class="pr-5 pl-5">
          <template v-if="procedureType === 'SDP'">4.6.1.</template>
          <template v-else>4.5.1.</template>
          Формирование реестра требований кредиторов
          <v-spacer></v-spacer>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="procedure_content">
          <v-row justify="center">
            <v-card flat>
              <v-card-text>
                <h4>Формируется автоматически</h4>
              </v-card-text>
            </v-card>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header class="pr-5 pl-5">
          <template v-if="procedureType === 'SDP'">4.6.2.</template>
          <template v-else>4.5.2.</template>
          Сведения о размере требований кредиторов, включенных в
          реестр требований кредиторов
          <v-spacer></v-spacer>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn small v-bind="attrs"
                     v-on="on" icon color="success" @click.native.stop="addCreditorClaim">
                <v-icon>mdi-plus-thick</v-icon>
              </v-btn>
            </template>
            <span>Добавить требование</span>
          </v-tooltip>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="procedure_content" :style="collapsed? 'height: 50vh': 'height: 41%'">
          <v-row justify="start" style="height: 80%">
            <v-col :cols="selectedCreditorClaim? '8': '12' ">
              <v-card flat>
                <v-card-text style="height: 80%">
                  <v-data-table
                      :items="creditorClaims"
                      :headers="creditorClaimHeaders"
                      :items-per-page="50"
                      dense
                      height="50%"
                  >
                    <template v-slot:item.creditor="{item}">
                      {{ item | getCreditor }}
                    </template>
                    <template v-slot:item.third_stage_type="{item}">
                      {{ item | getType }}
                    </template>
                    <template v-slot:item.actions="{ item }">

                      <v-icon
                          small
                          class="mr-2"
                          color="primary"
                          @click="editCreditorClaim($event, {item})"
                      >
                        mdi-pencil
                      </v-icon>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col :cols="selectedCreditorClaim? '4': '0'" v-if="selectedCreditorClaim">
              <CreditorClaimCreate :creditor-claim-data="selectedCreditorClaim" :project="project"
                                   @resetForm="closeTab"
                                   @updateCreditorClaimList="updateCreditorClaims"></CreditorClaimCreate>
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <!-- 4.7.	Сведения о наличии и об исполнении гражданином требований кредиторов по текущим платежам -->
        <v-expansion-panel-header class="pr-5 pl-5">
          <template v-if="procedureType === 'SDP'">4.7.</template>
          <template v-else>4.6.</template>
          Сведения о наличии и об исполнении гражданином требований
          кредиторов по текущим платежам
          <v-spacer></v-spacer>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="procedure_content">
          <v-row justify="center">
            <v-card flat>
              <v-card-text>
                <h4>Формируется автоматически</h4>
              </v-card-text>
            </v-card>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <!-- 4.8.	Сведения о наличии и об исполнении гражданином требований кредиторов по текущим платежам -->
        <v-expansion-panel-header class="pr-5 pl-5">
          <template v-if="procedureType === 'SDP'">4.8.</template>
          <template v-else>4.7.</template>
          Сведения о проведении анализа финансового состояния должника
          <v-spacer></v-spacer>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="procedure_content">
          <v-row justify="center">
            <v-card flat>
              <v-card-text>
                <h4>Формируется автоматически</h4>
              </v-card-text>
            </v-card>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel> <!-- 4.9.	Сведения о работниках (бывших работниках) должника -->
        <v-expansion-panel-header class="pr-5 pl-5">
          <template v-if="procedureType === 'SDP'">4.9.</template>
          <template v-else>4.8.</template>
          Сведения о работниках (бывших работниках) должника
          <v-spacer></v-spacer>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="procedure_content">
          <v-row justify="center">
            <v-card flat>
              <v-card-text>
              </v-card-text>
            </v-card>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel> <!-- 5. Иные сведения о ходе реализации имущества гражданина (Произвольная часть) -->
        <v-expansion-panel-header class="pr-5 pl-5">5. Иные сведения о ходе реализации имущества гражданина
          (Произвольная часть)
        </v-expansion-panel-header>
        <v-expansion-panel-content :style="collapsed? 'height: 63vh': 'height: 41vh'">
          <VueEditor class="comment" v-model="projectFreePart"></VueEditor>
          <v-btn @click=saveProjectFreePart>Сохранить</v-btn>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <hr>
      <v-expansion-panel> <!-- Счета-->
        <v-expansion-panel-header class="pr-5 pl-5">Счета
          <v-spacer></v-spacer>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="mr-6" icon small v-bind="attrs"
                     v-on="on" color="success" @click.native.stop="addAccountXlsx">
                <v-icon>mdi-table-large-plus</v-icon>
              </v-btn>
            </template>
            <span>Загрузка счетов из xlsx</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn small icon v-bind="attrs"
                     v-on="on" color="success" @click.native.stop="addAccount">
                <v-icon>mdi-plus-thick</v-icon>
              </v-btn>
            </template>
            <span>Добавить счет</span>
          </v-tooltip>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="procedure_content" :style="collapsed? 'height: 50vh': 'height: 41vh'">
          <v-row justify="start" style="height: 80%">
            <v-col :cols="selectedAccount? '8': '12' ">
              <v-card flat>
                <v-card-text style="height: 80%">
                  <v-data-table
                      :items="bankAccountList"
                      :headers="headers"
                      :items-per-page="50"
                      dense
                      height="50%"
                      @dblclick:row="editItem"
                      :item-class="accountRowClass"
                  >
                    <template v-slot:item.account="{item}">
                      {{ item.account }}
                      <v-menu
                          open-on-hover
                          right
                          offset-x
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                              :color="item.account_statement.length > 0? 'primary': 'grey darken-1 '"
                              dark
                              icon
                              v-bind="attrs"
                              v-on="on"
                          >
                            <svg-icon type="mdi" :path="fileIcon"></svg-icon>
                          </v-btn>
                        </template>
                        <v-list v-if="item.account_statement.length > 0">
                          <v-list-item
                              @click="editStatement(item)"
                              v-for="(item, index) in item.account_statement"
                              :key="index"
                              link
                          >

                            <v-list-item-subtitle>{{ item.date_from }} - {{
                                item.date_to
                              }}
                            </v-list-item-subtitle>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <v-icon
                          small
                          class="mr-2"
                          @click="editItem($event, {item})"
                      >
                        mdi-pencil
                      </v-icon>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col :cols="selectedAccount? '4': '0'" v-if="selectedAccount">
              <bankAccountCreate :bank-data="selectedAccount" :project="project"
                                 @updateAccountList="updateAccountList"
                                 @resetForm="closeTab"></bankAccountCreate>
            </v-col>
          </v-row>

        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>Торги
          <v-spacer></v-spacer>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn small v-bind="attrs"
                     v-on="on" icon color="success" @click.native.stop="addBargaining">
                <v-icon>mdi-plus-thick</v-icon>
              </v-btn>
            </template>
            <span>Добавить торги</span>
          </v-tooltip>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-row justify="start" style="height: 80%">
            <v-col :cols="selectedBargaining? '8': '12' ">
              <v-card flat>
                <v-card-text style="height: 80%">
                  <v-data-table
                      :headers="bargainingClaimHeaders"
                      :items="bargainingList"
                      show-expand
                  >
                    <template v-slot:item.lot="{item}">
                      <div v-for="lot in item.lot" :key="lot.id">
                        Лот №{{ lot.number }} - {{ lot.name }}
                      </div>
                    </template>
                    <template v-slot:item.actions="{item}">
                      <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn small v-bind="attrs"
                                 v-on="on" icon color="success" @click.native.stop="addApplicant(item)">
                            <v-icon>mdi-plus-thick</v-icon>
                          </v-btn>
                        </template>
                        <span>Добавить заявителя</span>
                      </v-tooltip>
                      <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn small v-bind="attrs"
                                 v-on="on" icon color="primary" @click.native.stop="editBargaining(item)">
                            <v-icon>mdi-pencil</v-icon>
                          </v-btn>
                        </template>
                        <span>Редактировать лот</span>
                      </v-tooltip>
                      <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn small v-bind="attrs"
                                 v-on="on" icon color="warning" @click.native.stop="createTradingProtocol(item)">
                            <v-icon>mdi-file-document-arrow-right-outline</v-icon>
                          </v-btn>
                        </template>
                        <span>Сформировать протокол торгов</span>
                      </v-tooltip>
                    </template>

                    <template v-slot:expanded-item="{ headers, item }">
                      <td :colspan="headers.length" class="pl-0 pr-0">
                        <v-data-table :headers="applicantHeaders" hide-default-footer
                                      :items="item.applicant"></v-data-table>
                      </td>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>
          Банковские карты
          <v-spacer></v-spacer>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="mr-6" icon small v-bind="attrs"
                     v-on="on" color="success" @click.native.stop="createCardAcceptance">
                <v-icon>mdi-file-document-plus-outline</v-icon>
              </v-btn>
            </template>
            <span>Сформировать акт приема карт</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="mr-6" icon small v-bind="attrs"
                     v-on="on" color="success" @click.native.stop="addBankCardXlsx">
                <v-icon>mdi-table-large-plus</v-icon>
              </v-btn>
            </template>
            <span>Загрузить данные карт из xlsx</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn small icon v-bind="attrs"
                     v-on="on" color="success" @click.native.stop="addBankCard">
                <v-icon>mdi-card-plus-outline</v-icon>
              </v-btn>
            </template>
            <span>Добавить карту</span>
          </v-tooltip>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="procedure_content" :style="collapsed? 'height: 50vh': 'height: 41%'">
          <v-row justify="start" style="height: 80%">
            <v-col :cols="selectedBackCard? '8': '12' ">
              <v-card flat>
                <v-card-text style="height: 80%">
                  <v-data-table
                      :items="bankCardList"
                      :headers="bankCardHeaders"
                      :items-per-page="50"
                      dense
                      height="50%"
                      @dblclick:row="editItem"
                      :item-class="hasStatement"
                  >
                    <template v-slot:item.actions="{item}">
                      <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn small v-bind="attrs"
                                 v-on="on" icon color="primary" @click.native.stop="editBankCard($event, {item})">
                            <v-icon>mdi-pencil</v-icon>
                          </v-btn>
                        </template>
                        <span>Редактировать карту</span>
                      </v-tooltip>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col :cols="selectedBackCard? '4': '0'" v-if="selectedBackCard">
              <BankCardCreate :bank-card-data="selectedBackCard" :project="project"
                              @updateBankCardList="updateBankCardList"
                              @resetForm="closeTab"></BankCardCreate>
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <ReceivedFunds :collapsed="collapsed"></ReceivedFunds>
      <v-expansion-panel>
        <v-expansion-panel-header class="pr-5 pl-5">Исполнительные производства
        </v-expansion-panel-header>
        <v-expansion-panel-content class="procedure_content" :style="collapsed? 'height: 63vh': 'height: 41vh'">
          <v-card flat>
            <template v-for="(item, i) in enforcementProceedings">
              <v-card-text :key="i">
                <h4>{{ item.number }} от {{ item.initiation_date }} </h4>
                <p>{{ item.fssp_text }}</p>
                <p>{{ item.fssp_info }}</p>
                <v-divider></v-divider>
              </v-card-text>

            </template>
            <v-card-actions>
              <v-btn @click="loadEnforcementProceedings">Загрузить</v-btn>
            </v-card-actions>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>Требования кредиторов
          <v-spacer></v-spacer>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn small v-bind="attrs"
                     v-on="on" icon color="success" @click.native.stop="addBasicCreditorClaim">
                <v-icon>mdi-plus-thick</v-icon>
              </v-btn>
            </template>
            <span>Добавить требования</span>
          </v-tooltip>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-row justify="start" style="height: 80%">
            <v-col :cols="selectedBargaining? '8': '12' ">
              <v-card flat>
                <v-card-text style="height: 80%">
                  <v-data-table
                      :headers="basicCreditorClaimHeaders"
                      :items="basicCreditorClaim"
                      :items-per-page="50"
                      dense
                      height="50%"
                  >
                    <template v-slot:item.creditor="{item}">
                      {{ item | getCreditor }}
                    </template>
                    <template v-slot:item.actions="{ item }">

                      <v-icon
                          small
                          class="mr-2"
                          color="primary"
                          @click="editBasicCreditorClaim($event, {item})"
                      >
                        mdi-pencil
                      </v-icon>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <loadAccountXlsx></loadAccountXlsx>
    <AccountStatementModal></AccountStatementModal>
    <BargainingCreateModal></BargainingCreateModal>
    <ApplicantCreateModal></ApplicantCreateModal>
    <BankruptcyEstateCreateModal :project="project"
                                 @updateBankruptcyEstate="updateEstate"></BankruptcyEstateCreateModal>
    <EstateSaleProgressCreateModal :project="project"
                                   @updateEstateSaleProgress="updateEstateSale"></EstateSaleProgressCreateModal>
    <DocumentGeneratorModal :project="project"></DocumentGeneratorModal>
    <CreditorMeetingCreateModal :project="project"></CreditorMeetingCreateModal>
    <BasicCreditorClaimCreateModal @updateBasicCreditorClaim="updateBasicCreditorClaim"></BasicCreditorClaimCreateModal>
  </v-container>
</template>

<script>
import {VueEditor} from "vue2-editor";
import customConst from "@/const/customConst";
import bankAccountCreate from "@/components/referenceBook/Bank/BankAccountCreate.vue";
import loadAccountXlsx from "@/components/referenceBook/Bank/LoadAccountXlsx.vue";
import {isEmpty} from 'lodash'
import {ThirdStageType} from '@/const/dataTypes'
import SvgIcon from '@jamescoyle/vue-icon';
import {mdilFile} from '@mdi/light-js';
import moment from "moment";
import AccountStatementModal from "@/components/referenceBook/Bank/AccountStatementModal.vue";
import BargainingCreateModal from "@/components/referenceBook/Project/Bargaining/BargainingCreateModal.vue";
import ApplicantCreateModal from "@/components/referenceBook/Project/Applicant/ApplicantCreateModal.vue";
import {saveAs} from 'file-saver';
import {mapGetters} from "vuex";
import {compareFields} from "@/components/DocumentGeneration/functions";
import BankCardCreate from "@/components/referenceBook/Bank/BankCardCreate.vue";
import CreditorClaimCreate from "@/components/referenceBook/Project/Creditor/CreditorClaimCreate.vue";
import DocumentGeneratorModal from "@/components/DocumentGeneration/DocumentGeneratorModal.vue";
import InvolvedPersons from "@/components/referenceBook/Project/Procedure/InvolvedPersons.vue";
import Complaint from "@/components/referenceBook/Project/Procedure/Complaint.vue";
import BankruptcyEstate from "@/components/referenceBook/Project/Procedure/BankruptcyEstate.vue";
import BankruptcyEstateCreateModal
  from "@/components/referenceBook/Project/BankruptcyEstate/BankruptcyEstateCreateModal.vue";
import {eventBus} from "@/bus";
import EstateSaleProgress from "@/components/referenceBook/Project/Procedure/EstateSaleProgress.vue";
import EstateSaleProgressCreateModal
  from "@/components/referenceBook/Project/EstateSaleProgress/EstateSaleProgressCreateModal.vue";
import CreditorMeeting from "@/components/referenceBook/Project/Procedure/CreditorMeeting.vue";
import CreditorMeetingCreateModal
  from "@/components/referenceBook/Project/CreditorMeeting/CreditorMeetingCreateModal.vue";
import BasicCreditorClaimCreateModal from "@/components/referenceBook/Project/Creditor/BasicCreditorClaimCreate.vue";

export default {
  props: ['project', 'collapsed', 'act', 'freePart'],
  name: 'Procedure',
  data: () => ({
    procedureType: '',
    enforcementProceedings: [],
    bankAccountList: [],
    bankCardList: [],
    creditorClaims: [],
    bargainingList: [],
    selectedAccount: null,
    selectedBackCard: null,
    selectedCreditorClaim: null,
    selectedBargaining: null,
    fileIcon: mdilFile,
    selectedStatement: null,
    headers: [
      {text: 'Номер счета', value: 'account'},
      {text: 'Банк', value: 'bank.name'},
      {text: 'Дата открытия', value: 'opening_date'},
      {text: 'Дата закрытия', value: 'closing_date'},
      {text: 'Действия', value: 'actions'},
    ],
    creditorClaimHeaders: [
      {text: 'Кредитор', value: 'creditor'},
      {text: 'Вид требования', value: 'third_stage_type'},
      {text: 'Сумма требования', value: 'claim_amount'},
      {text: 'Сумма погашения', value: 'satisfied_claim_amount'},
      {text: '% удовлетворения требований', value: 'percent_claim_amount'},
      {text: 'Действия', value: 'actions'},
    ],
    bargainingClaimHeaders: [
      {text: 'Номер ЕФРСБ', value: 'efrsb_number'},
      {text: 'Вид торгов', value: 'lot_type'},
      {text: 'Начало приема заявок', value: 'application_start_date'},
      {text: 'Окончание приема заявок', value: 'application_end_date'},
      {text: 'Окончание торгов', value: 'bidding_end_date'},
      {text: 'Лот', value: 'lot'},
      {text: 'Действия', value: 'actions'},
    ],
    basicCreditorClaimHeaders: [
      {text: 'Кредитор', value: 'creditor'},
      {text: 'Дата получения требования', value: 'date_receipt'},
      {text: 'Основание возникновения требования', value: 'basis'},
      {text: 'Дата возникновения требования', value: 'date_origin'},
      {text: 'Сумма требования', value: 'claim_amount'},
      {text: 'Действия', value: 'actions'},
    ],
    applicantHeaders: [
      {text: 'Заявитель', value: 'applicant'},
      {text: 'Дата подачи заявки', value: 'application_date'},
      {text: 'Лот', value: 'lot.name'},
      {text: 'Сумма', value: 'lot_price'},
      {text: 'Действия', value: 'actions'},
    ],
    bankCardHeaders: [
      {text: 'Номер карты', value: 'card_number'},
      {text: 'Срок действия', value: 'validity'},
      {text: 'Банк', value: 'bank.name'},
      {text: 'Действия', value: 'actions'},
    ],
    template: null,
    templateFields: {},
    projectFreePart: null,
  }),
  computed: {
    ...mapGetters({
      currentUser: 'authUserData',
      documentTemplate: "docTemplateData",
      basicCreditorClaim: 'basicCreditorClaimData'
    }),
  },
  methods: {
    saveProjectFreePart() {
      console.log(this.project)
      let formData = new FormData()
      formData.append('procedure_free_part', this.projectFreePart)
      this.$http({
        method: "POST",
        url: customConst.REFERENCE_BOOK_API + "save-project-free-part/" + this.project,
        data: formData
      }).then(res => {
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
    },
    addEstate() {
      this.$emit('addEstate')
    },
    addCreditorMeeting() {
      this.$emit('addCreditorMeeting')
    },
    addEstateSale() {
      this.$emit('addEstateSale')
    },
    updateEstate() {
      eventBus.$emit('updateBankruptcyEstate')
    },
    updateEstateSale() {
      eventBus.$emit('updateEstateSaleProgress')
    },
    addCreditorClaim() {
      this.selectedCreditorClaim = {}
    },
    updateBasicCreditorClaim() {
      this.$store.dispatch('getBasicCreditorClaim', this.project)
    },
    editCreditorClaim(event, {item}) {
      console.log(item)
      this.selectedCreditorClaim = null
      setTimeout(() => {
        this.selectedCreditorClaim = item
      }, 150)
    },
    accountRowClass(item) {
      if (item.closing_date && this.act) {
        let close_date = moment(item.closing_date, 'DD.MM.YYYY')
        let act_date = moment(this.act, 'YYYY-MM-DD')
        let year_count = act_date.diff(close_date, 'years')
        if (year_count >= 3) {
          return 'expired'
        }
      }
    },
    hasStatement(item) {
      if (item.document) {
        return 'has-statement'
      }
    },
    updateAccountList() {
      this.bankAccountList = []
      this.selectedAccount = null
      setTimeout(() => {
        this.selectedAccount = {}
      }, 100)
      this.$store.dispatch('getBankAccountList', this.$route.params['pk']).then(data => {
        console.log(data)
        this.bankAccountList.push(...data)
      })
    },
    updateBankCardList() {
      this.bankCardList = []
      this.$store.dispatch('getBankCardList', this.$route.params['pk']).then(data => {
        console.log(data)
        this.bankCardList.push(...data)
      })
    },
    updateCreditorClaims() {
      this.creditorClaims = []
      this.$http({
        method: "GET",
        url: customConst.REFERENCE_BOOK_API + 'creditors-claims',
        params: {project: this.$route.params['pk']}
      }).then(res => {
        console.log(res.data.data.data)
        let claims = res.data.data.data
        this.creditorClaims.push(...claims)
      })
    },
    updateBargaining() {
      this.$http({
        method: "GET",
        url: customConst.REFERENCE_BOOK_API + 'bargaining',
        params: {project: this.$route.params['pk']}
      }).then(res => {
        console.log(res.data.data.data)
        let bargaining = res.data.data.data
        this.bargainingList.push(...bargaining)
      })
    },
    loadEnforcementProceedings() {
      let formData = new FormData()
      formData.append('project', this.project)
      this.$http({
        method: "POST",
        url: customConst.REFERENCE_BOOK_API + `enforcement-proceedings/check-proceedings/`,
        data: formData
      })
    },
    addAccount() {
      this.selectedAccount = null
      setTimeout(() => {
        this.selectedAccount = {}
      }, 100)

    },
    addAccountXlsx() {
      this.$emit('addXlsxAccount', {project: this.$route.params['pk'], dataType: 'bankAccount'})
    },
    addBankCardXlsx() {
      this.$emit('addXlsxBankCard', {project: this.$route.params['pk'], dataType: 'bankCard'})
    },
    createCardAcceptance() {
      this.$emit('generateDocument', 12)
    },
    addBargaining() {
      this.$emit('addBargaining', this.$route.params['pk'])
    },
    addBasicCreditorClaim() {
      this.$emit('createBasicCreditorClaim', this.$route.params['pk'])
    },
    editBasicCreditorClaim(event, {item}){
      this.$emit('editBasicCreditorClaim', item)
    },
    editBargaining(item) {
      this.$emit('editBargaining', item)
    },
    addApplicant(item) {
      this.$emit('addApplicant', item)
    },
    addBankCard(item) {
      this.selectedBackCard = {}
    },
    async createTradingProtocol(item) {
      console.log(this.documentTemplate)
      this.template = this.documentTemplate.filter(obj => obj.name === "Протокол_торгов")[0]
      await this.$store.dispatch('getProjectDetail', this.project).then(async data => {
        await compareFields(this.template.fields, data).then(async (data) => {
          this.templateFields = data
        })
        console.log(this.templateFields)
      })
      let formData = new FormData()
      formData.append('template', this.template.id)
      formData.append('project', this.project)
      formData.append('docType', 'docx')
      formData.append('BARGAINING', item.id)
      formData.append('BARGAINING_EFRSB_NUMBER', item.efrsb_number)
      formData.append('filename', `${this.template.name}_${this.fileName}_${this.currentUser.id}`)
      Object.keys(this.templateFields).forEach(key => {
        formData.append(key, this.templateFields[key])
      })
      this.$http({
        method: "POST",
        url: customConst.GENERATOR + 'document-template/generate/',
        data: formData,
        responseType: 'blob'
      }).then(res => {
        let fileName;
        if (this.templateFields['OUT_NUMBER']) {
          fileName = `${this.fileName}_${this.template.name.replaceAll(' ', '_')}_${this.templateFields['OUT_NUMBER']}`
        } else {
          fileName = `asfdasfASF`
        }
        if (this.template.name === 'ходатайтсво об ознакомлении с материалами дела') {
          fileName += '_1л'
        }
        saveAs(res.data, fileName)
        this.overlay = false
        this.loading = false
      })
    },
    editItem(event, {item}) {
      this.selectedAccount = null
      setTimeout(() => {
        this.selectedAccount = item
      }, 150)
    },
    editBankCard(event, {item}) {
      this.selectedBackCard = null
      setTimeout(() => {
        this.selectedBackCard = item
      }, 150)
    },
    editStatement(item) {
      this.$emit('editAccountStatement', {'statement': item, 'project': this.$route.params['pk']})
    },
    closeTab() {
      this.selectedAccount = null
      this.selectedBackCard = null
      this.selectedCreditorClaim = null
    }
  },
  filters: {
    getCreditor(item) {
      console.log(item)
      if (!isEmpty(item.physical_creditor)) {
        return item.physical_creditor?.fullName
      } else if (!isEmpty(item.legal_creditor)) {
        return item.legal_creditor?.name
      }
      return 'Не указан'
    },
    getType(item) {
      return ThirdStageType.filter(obj => {
        if ((obj.value === item.third_stage_type) && obj['text']) {
          return obj
        }
      })[0]?.text
    }
  },
  created() {
    this.$store.dispatch('getBasicCreditorClaim', this.project)
    this.$store.dispatch('getProjectDetail', this.project).then(res => {
      this.procedureType = res.procedure
    })
    this.$store.dispatch('getDocTemplate')
    if (this.freePart) {
      this.projectFreePart = this.freePart
    }
    this.$store.dispatch('getEnforcementProceedings', this.$route.params['pk']).then(data => {
      this.enforcementProceedings.push(...data)
    }).then(() => {
      this.updateAccountList()
      this.updateCreditorClaims()
      this.updateBargaining()
      this.updateBankCardList()
    })
  },
  components: {
    BasicCreditorClaimCreateModal,
    CreditorMeetingCreateModal,
    CreditorMeeting,
    EstateSaleProgressCreateModal,
    EstateSaleProgress,
    BankruptcyEstateCreateModal,
    DocumentGeneratorModal,
    CreditorClaimCreate,
    bankAccountCreate,
    loadAccountXlsx,
    SvgIcon,
    AccountStatementModal,
    BargainingCreateModal,
    ApplicantCreateModal,
    BankCardCreate,
    // ArbitrationManagerInfo,
    InvolvedPersons,
    Complaint,
    BankruptcyEstate,
    // ReceivedFunds,
    VueEditor
  }
}
</script>

<style scoped>
>>> .ql-editor {
  min-height: 400px;
  max-height: 400px;
  overflow: scroll;
}

.v-expansion-panel-header {
  height: 45px;
}

.procedure_content {
  overflow-y: scroll;
}

.procedure_content .v-card {
  height: 80%;
}

.v-expansion-panel-header > *:not(.v-expansion-panel-header__icon) {
  flex: 0 0 auto;
}

.v-list-item {
  font-size: 10px;
  min-height: 30px;
}

>>> .expired {
  color: #a0a0a0 !important;
}

>>> .has-statement {
  background-color: rgba(21, 239, 11, 0.18);
}
</style>