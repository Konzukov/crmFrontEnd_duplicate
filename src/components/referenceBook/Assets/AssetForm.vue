<template>
  <v-form ref="form" v-model="valid">
    <v-row>
      <!-- Категория -->
      <v-col cols="12" md="5">
        <v-autocomplete
            hide-details
            outlined dense
            v-model="editedAsset.category"
            :items="assetCategories"
            item-text="text"
            item-value="value"
            label="Категория*"
            :rules="requiredRules"
            :disabled="disabled"
        />
      </v-col>

      <!-- Тип имущества -->
      <v-col cols="12" md="5">
        <v-autocomplete
            hide-details
            outlined dense
            v-model="editedAsset.asset_type"
            :items="assetTypes"
            label="Тип*"
            :rules="requiredRules"
            :disabled="disabled"
            @change="onAssetTypeChange"
        />
      </v-col>
      <!-- Дата приобретения -->
      <v-col cols="12" md="4">
        <DatePicker
            hide-details
            v-model="editedAsset.acquisition_date"
            value-type="format"
            format="DD.MM.YYYY"
            placeholder="Дата приобретения"
            :clearable="false"
            :disabled="disabled"
        />
      </v-col>
      <!-- Дата выбытия -->
      <v-col cols="12" md="4">
        <DatePicker
            hide-details
            v-model="editedAsset.disposal_date"
            value-type="format"
            format="DD.MM.YYYY"
            placeholder="Дата выбытия"
            :clearable="false"
            :disabled="disabled"
        />
      </v-col>
      <!-- Статус -->
      <v-col cols="12" md="4">
        <v-autocomplete
            hide-details
            outlined dense
            v-model="editedAsset.status"
            :items="assetStatuses"
            label="Статус*"
            :rules="requiredRules"
            :disabled="disabled"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
            type="number"
            step="0.1"
            hide-details
            outlined dense
            v-model="editedAsset.carrying_cost"
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
            v-model="editedAsset.market_cost"
            label="Рыночная стоимость"
            :rules="requiredRules"
        />
      </v-col>
    </v-row>

    <!-- ДИНАМИЧЕСКИЕ ПОЛЯ ПО JSON СХЕМЕ -->
    <v-divider class="my-4" v-if="editedAsset.asset_type && getSchemaFields()"></v-divider>
    <strong v-if="editedAsset.asset_type && getSchemaFields()">Характеристики</strong>

    <v-row class="mt-2" v-if="editedAsset.asset_type && getSchemaFields()">
      <v-col cols="12" :md="field.type === 'boolean' ? 12 : 6"
             v-for="(field, key) in getSchemaFields()" :key="key">
        <component
            :is="resolveFieldComponent(field)"
            v-model="editedAsset.details[key]"
            :label="field.label"
            :rules="getFieldRules(field)"
            v-bind="getFieldAttrs(field, key)"
            :disabled="disabled"
            outlined dense
        />
      </v-col>
    </v-row>

    <!-- Раздел залогов и арестов -->
    <v-divider class="my-4"></v-divider>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-2">
          <h4 class="text-h6">Залоги и аресты</h4>
          <v-btn
              color="primary"
              small
              @click="openPledgeArrestDialog"
              :disabled="disabled"
          >
            <v-icon left small>mdi-plus</v-icon>
            Добавить
          </v-btn>
        </div>

        <!-- Карточки существующих залогов -->
        <v-card v-if="hasPledges" class="mb-4"
                :key="'pledges-' + (editedAsset.pledges ? editedAsset.pledges.length : 0)">
          <v-card-title class="py-2 text-h8">
            <v-icon left small>mdi-handshake</v-icon>
            Залоги ({{ editedAsset.pledges.length }})
          </v-card-title>
          <v-card-text class="pt-0">
            <v-list dense>
              <v-list-item
                  v-for="(pledge, index) in editedAsset.pledges"
                  :key="`pledge-${index}-${pledge.pledge_number || ''}-${pledge.pledge_date || ''}`"
                  class="mb-2"
              >
                <v-list-item-content>
                  <div class="d-flex justify-space-between">
                    <div>
                      <strong>{{ getPledgeeName(pledge) }}</strong> •
                      {{ getPledgeTypeText(pledge.pledge_type) }}
                      <v-chip x-small :color="pledge.is_active ? 'warning' : 'success'" class="ml-2">
                        {{ pledge.is_active ? 'Активен' : 'Завершен' }}
                      </v-chip>
                    </div>
                    <div>
                      <v-btn icon small @click="editPledge(index)">
                        <v-icon small>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon small @click="removePledge(index)" color="error">
                        <v-icon small>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>
                  <div v-if="pledge.amount" class="text-caption mt-1">
                    Сумма: {{ formatCurrency(pledge.amount) }}
                  </div>
                  <div v-if="pledge.description" class="text-caption text--secondary mt-1">
                    {{ pledge.description.substring(0, 100) }}...
                  </div>
                  <div class="text-caption mt-1">
                    Период: {{ formatDate(pledge.start_date) }} - {{ formatDate(pledge.end_date) || 'н/д' }}
                  </div>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
        <!-- Карточки существующих арестов -->
        <v-card v-if="hasArrests" :key="'arrests-' + (editedAsset.arrests ? editedAsset.arrests.length : 0)">
          <v-card-title class="py-2">
            <v-icon left small>mdi-gavel</v-icon>
            Аресты ({{ editedAsset.arrests.length }})
          </v-card-title>
          <v-card-text class="pt-0">
            <v-list dense>
              <v-list-item
                  v-for="(arrest, index) in editedAsset.arrests"
                  :key="`arrest-${index}-${arrest.arrest_date || ''}-${arrest.arresting_organization || ''}`"
                  class="mb-2"
              >
                <v-list-item-content>
                  <div class="d-flex justify-space-between">
                    <div>
                      <strong>{{ getArrestingOrganization(arrest) }}</strong> •
                      {{ formatDate(arrest.arrest_date) }}
                      <v-chip x-small :color="arrest.is_active ? 'error' : 'success'" class="ml-2">
                        {{ arrest.is_active ? 'Активен' : 'Снят' }}
                      </v-chip>
                    </div>
                    <div>
                      <v-btn icon small @click="editArrest(index)">
                        <v-icon small>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon small @click="removeArrest(index)" color="error">
                        <v-icon small>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>
                  <div v-if="arrest.reason" class="text-caption text--secondary">
                    {{ arrest.reason.substring(0, 100) }}...
                  </div>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <v-alert v-if="!hasPledges && !hasArrests"
                 type="info" outlined dense>
          Нет добавленных залогов или арестов
        </v-alert>
      </v-col>
    </v-row>

    <!-- Раздел конкурсной массы -->
    <v-divider class="my-4"></v-divider>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-2">
          <h4 class="text-h6">Конкурсная масса</h4>
          <v-btn
              color="primary"
              small
              @click="openEstateProcessDialog"
              :disabled="disabled"
          >
            <v-icon left small>mdi-scale-balance</v-icon>
            {{ editedAsset.estate_process ? 'Изменить решение' : 'Добавить решение' }}
          </v-btn>
        </div>

        <!-- Карточка текущего решения по конкурсной массе -->
        <v-card v-if="editedAsset.estate_process" class="mb-4"
                :key="'estate-' + (editedAsset.estate_process ? editedAsset.estate_process.id : '')">
          <v-card-title class="py-2 text-h8">
            <v-icon left small>mdi-scale-balance</v-icon>
            Решение по конкурсной массе
          </v-card-title>
          <v-card-text class="pt-0">
            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <strong>{{ getEstateDecisionText(editedAsset.estate_process.decision) }}</strong>
                      <v-chip x-small :color="getEstateColor(editedAsset.estate_process.decision)" class="ml-2">
                        {{ editedAsset.estate_process.is_active ? 'Актуально' : 'Устарело' }}
                      </v-chip>
                    </div>
                    <div>
                      <!-- Кнопка истории изменений -->
                      <v-btn
                          icon small
                          @click="openHistoryDialog"
                          :disabled="!hasHistory"
                          title="История изменений"
                      >
                        <v-icon small>mdi-history</v-icon>
                      </v-btn>

                      <v-btn icon small @click="editEstateProcess" :disabled="disabled">
                        <v-icon small>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon small @click="removeEstateProcess" color="error" :disabled="disabled">
                        <v-icon small>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>

                  <div v-if="editedAsset.estate_process.exclusion_ground" class="text-caption mt-1">
                    <strong>Основание:</strong> {{
                      getExclusionGroundText(editedAsset.estate_process.exclusion_ground)
                    }}
                  </div>

                  <div v-if="editedAsset.estate_process.legal_reference" class="text-caption mt-1">
                    <strong>Правовое обоснование:</strong>
                    {{
                      editedAsset.estate_process.legal_reference.substring(0, 100)
                    }}{{ editedAsset.estate_process.legal_reference.length > 100 ? '...' : '' }}
                  </div>

                  <div class="text-caption mt-1">
                    <strong>Дата решения:</strong> {{ formatDate(editedAsset.estate_process.decision_date) }}
                  </div>

                  <div v-if="editedAsset.estate_process.decided_by_name" class="text-caption mt-1">
                    <strong>Принял:</strong> {{ editedAsset.estate_process.decided_by_name }}
                  </div>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <v-alert v-else type="info" outlined dense>
          Решение по конкурсной массе не принято
        </v-alert>
      </v-col>
    </v-row>

    <!-- Раздел оспаривания сделок -->
    <v-divider class="my-4"></v-divider>
    <!-- Раздел оспаривания сделок (используем новый компонент) -->
    <DisputeTransactionsList
        :dispute="editedAsset.dispute_transaction || null"
        :disabled="disabled"
        :disposal-date="editedAsset.disposal_date"
        :all-ref-data="allRefData"
        :legal-entities="legalEntities"
        @open-dialog="openDisputeDialog"
        @edit-dispute="editDispute"
        @remove-dispute="removeDispute"
    />

    <!-- Модальное окно для оспаривания (новый компонент) -->
    <DisputeDialog
        v-model="disputeDialog"
        :dispute="currentDispute"
        :is-editing="isEditingDispute"
        :projects="filteredProjects"
        :physical-persons="physicalPersons"
        :legal-entities="legalEntities"
        :creditors-list="availableCreditors"
        @cancel="closeDisputeDialog"
        @save="saveDispute"
    />
    <!-- Модальное окно для добавления/редактирования залогов и арестов -->
    <v-dialog v-model="pledgeArrestDialog" max-width="800" persistent>
      <v-card>
        <v-card-title>
          <v-tabs v-model="dialogTab" grow>
            <v-tab>Залог</v-tab>
            <v-tab>Арест</v-tab>
          </v-tabs>
        </v-card-title>

        <v-card-text>
          <v-tabs-items v-model="dialogTab">
            <v-tab-item>
              <v-form ref="pledgeForm" v-model="pledgeValid">
                <v-row class="mt-0">
                  <v-col cols="12" md="6">
                    <v-autocomplete
                        v-model="currentPledge.pledge_type"
                        :items="pledgeTypes"
                        label="Тип залога*"
                        :rules="requiredRules"
                        outlined dense
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                        v-model="currentPledge.amount"
                        label="Сумма залога"
                        type="number"
                        :rules="pledgeRules.amount"
                        outlined dense
                        prefix="₽"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-autocomplete
                        v-model="pledgeePledgor"
                        @change="setPledgee"
                        :items="allRefData"
                        return-object
                        item-text="name"
                        item-value="id"
                        label="Залогодержатель*"
                        :rules="requiredRules"
                        outlined dense
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                        v-model="currentPledge.pledge_number"
                        label="Номер договора*"
                        outlined dense
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <DatePicker
                        v-model="currentPledge.pledge_date"
                        value-type="format"
                        format="DD.MM.YYYY"
                        placeholder="Дата договора*"
                        :clearable="false"
                        outlined
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <DatePicker
                        v-model="currentPledge.start_date"
                        value-type="format"
                        format="DD.MM.YYYY"
                        placeholder="Дата начала залога*"
                        :clearable="false"
                        outlined
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <DatePicker
                        v-model="currentPledge.end_date"
                        value-type="format"
                        format="DD.MM.YYYY"
                        placeholder="Дата окончания залога"
                        :clearable="true"
                        outlined
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                        v-model="currentPledge.description"
                        label="Описание условий залога"
                        outlined dense
                        rows="3"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-switch
                        v-model="currentPledge.is_active"
                        label="Активный залог"
                        hide-details
                    />
                  </v-col>
                </v-row>
              </v-form>
            </v-tab-item>

            <!-- Форма ареста -->
            <v-tab-item>
              <v-form ref="arrestForm" v-model="arrestValid">
                <v-row class="mt-0">
                  <v-col cols="12" md="6">
                    <v-autocomplete
                        v-model="currentArrest.arresting_organization"
                        :items="legalEntities"
                        item-text="name"
                        item-value="id"
                        label="Организация*"
                        :rules="arrestRules.arresting_organization"
                        outlined dense
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <DatePicker
                        v-model="currentArrest.arrest_date"
                        value-type="format"
                        format="DD.MM.YYYY"
                        placeholder="Дата наложения ареста*"
                        :clearable="false"
                        :rules="arrestRules.arrest_date"
                        outlined
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                        v-model="currentArrest.reason"
                        label="Основание для ареста*"
                        :rules="arrestRules.reason"
                        outlined dense
                        rows="3"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-switch
                        v-model="currentArrest.is_active"
                        label="Активный арест"
                        hide-details
                        @change="toggleArrestDates"
                    />
                  </v-col>

                  <v-col cols="12" md="6" v-if="!currentArrest.is_active">
                    <DatePicker
                        v-model="currentArrest.lifting_date"
                        value-type="format"
                        format="DD.MM.YYYY"
                        placeholder="Дата снятия ареста"
                        :clearable="true"
                        outlined
                    />
                  </v-col>

                  <v-col cols="12" v-if="!currentArrest.is_active">
                    <v-textarea
                        v-model="currentArrest.lifting_reason"
                        label="Причина снятия ареста"
                        outlined dense
                        rows="2"
                    />
                  </v-col>
                </v-row>
              </v-form>
            </v-tab-item>
          </v-tabs-items>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closePledgeArrestDialog">Отмена</v-btn>
          <v-btn
              color="primary"
              @click="savePledgeOrArrest"
              :disabled="dialogTab === 0 ? !pledgeValid : !arrestValid"
          >
            {{ isEditingPledgeOrArrest ? 'Сохранить' : 'Добавить' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Модальное окно для конкурсной массы -->
    <EstateProcessDialog
        ref="estateDialog"
        v-model="estateProcessDialog"
        :estate-process="currentEstateProcess"
        :is-editing="isEditingEstateProcess"
        :project-id="editedAsset.owner_project"
        @cancel="closeEstateProcessDialog"
        @save="saveEstateProcess"
    />

    <!-- Модальное окно для истории изменений конкурсной массы -->
    <v-dialog v-model="historyDialog" max-width="900" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div>
            <v-icon left>mdi-history</v-icon>
            История изменений конкурсной массы
          </div>
          <v-btn icon @click="closeHistoryDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-0">

          <!-- Таблица истории изменений -->
          <v-data-table
              :headers="historyHeaders"
              :items="filteredHistory"
              :search="historySearch"
              :items-per-page="10"
              :footer-props="{
                'items-per-page-options': [5, 10, 20, 50]
              }"
              dense
              class="history-table"
          >
            <!-- Дата изменения -->
            <template v-slot:item.change_date="{ item }">
              <div class="text-caption">{{ formatDateTime(item.change_date) }}</div>
            </template>

            <!-- Кто изменил -->
            <template v-slot:item.changed_by_name="{ item }">
              <div class="d-flex align-center">
                <span>{{ item.changed_by_name }}</span>
              </div>
            </template>

            <!-- Решение -->
            <template v-slot:item.decision_change="{ item }">
              <div class="d-flex align-center">
                <v-chip
                    x-small
                    :color="getDecisionColor(item.previous_decision)"
                    class="mr-1"
                    outlined
                >
                  {{ getEstateDecisionText(item.previous_decision) || 'Не указано' }}
                </v-chip>
                <v-icon x-small color="grey">mdi-arrow-right</v-icon>
                <v-chip
                    x-small
                    :color="getDecisionColor(item.new_decision)"
                    class="ml-1"
                >
                  {{ getEstateDecisionText(item.new_decision) }}
                </v-chip>
              </div>
            </template>

            <!-- Основание исключения -->
            <template v-slot:item.exclusion_ground_change="{ item }">
              <div v-if="item.previous_exclusion_ground || item.new_exclusion_ground" class="d-flex align-center">
                <span class="text-caption text-truncate mr-1" style="max-width: 120px">
                  {{ getExclusionGroundText(item.previous_exclusion_ground) || '—' }}
                </span>
                <v-icon x-small color="grey">mdi-arrow-right</v-icon>
                <span class="text-caption text-truncate ml-1" style="max-width: 120px">
                  {{ getExclusionGroundText(item.new_exclusion_ground) || '—' }}
                </span>
              </div>
              <div v-else class="text-caption text--secondary">—</div>
            </template>

            <!-- Действия -->
            <template v-slot:item.actions="{ item }">
              <v-btn
                  icon x-small
                  @click="showHistoryDetails(item)"
                  title="Подробности"
              >
                <v-icon x-small>mdi-eye</v-icon>
              </v-btn>
            </template>

            <!-- Слот для пустой таблицы -->
            <template v-slot:no-data>
              <div class="text-center py-4">
                <v-icon size="48" color="grey lighten-1" class="mb-2">mdi-history-off</v-icon>
                <div class="text-h6 grey--text">История изменений отсутствует</div>
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Диалог с подробностями изменения -->
    <v-dialog v-model="historyDetailDialog" max-width="700">
      <v-card v-if="selectedHistoryItem">
        <v-card-title class="d-flex justify-space-between align-center">
          <div>
            <v-icon left>mdi-information</v-icon>
            Подробности изменения
          </div>
          <v-btn icon @click="historyDetailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <!-- Основная информация -->
          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <div class="text-caption text--secondary">Дата изменения</div>
              <div class="text-body-1">{{ formatDateTime(selectedHistoryItem.change_date) }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-caption text--secondary">Кто изменил</div>
              <div class="d-flex align-center">
                <v-avatar size="32" color="primary" class="mr-2">
                  <span class="white--text">{{ getInitials(selectedHistoryItem.changed_by_name) }}</span>
                </v-avatar>
                <div>
                  <div class="text-body-1">{{ selectedHistoryItem.changed_by_name }}</div>
                  <div class="text-caption text--secondary">
                    ID пользователя: {{ selectedHistoryItem.changed_by }}
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Детали изменений -->
          <v-divider class="my-4"></v-divider>

          <!-- Решение -->
          <v-row>
            <v-col cols="12">
              <div class="text-h6 mb-2">Решение</div>
              <v-card outlined class="pa-3">
                <div class="d-flex justify-space-between align-center">
                  <div class="text-center" style="flex: 1">
                    <div class="text-caption text--secondary mb-1">Было</div>
                    <v-chip :color="getDecisionColor(selectedHistoryItem.previous_decision)" outlined>
                      {{ getEstateDecisionText(selectedHistoryItem.previous_decision) || 'Не указано' }}
                    </v-chip>
                  </div>
                  <v-icon color="grey">mdi-arrow-right</v-icon>
                  <div class="text-center" style="flex: 1">
                    <div class="text-caption text--secondary mb-1">Стало</div>
                    <v-chip :color="getDecisionColor(selectedHistoryItem.new_decision)">
                      {{ getEstateDecisionText(selectedHistoryItem.new_decision) }}
                    </v-chip>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Основание исключения -->
          <v-row v-if="selectedHistoryItem.previous_exclusion_ground || selectedHistoryItem.new_exclusion_ground"
                 class="mt-4">
            <v-col cols="12">
              <div class="text-h6 mb-2">Основание исключения</div>
              <v-card outlined class="pa-3">
                <div class="d-flex justify-space-between align-center">
                  <div class="text-center" style="flex: 1">
                    <div class="text-caption text--secondary mb-1">Было</div>
                    <div class="text-body-1">
                      {{ getExclusionGroundText(selectedHistoryItem.previous_exclusion_ground) || 'Не указано' }}
                    </div>
                  </div>
                  <v-icon color="grey">mdi-arrow-right</v-icon>
                  <div class="text-center" style="flex: 1">
                    <div class="text-caption text--secondary mb-1">Стало</div>
                    <div class="text-body-1">
                      {{ getExclusionGroundText(selectedHistoryItem.new_exclusion_ground) || 'Не указано' }}
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Правовое обоснование -->
          <v-row v-if="selectedHistoryItem.previous_legal_reference || selectedHistoryItem.new_legal_reference"
                 class="mt-4">
            <v-col cols="12">
              <div class="text-h6 mb-2">Правовое обоснование</div>
              <v-card outlined class="pa-3">
                <div class="d-flex">
                  <div class="mr-4" style="flex: 1">
                    <div class="text-caption text--secondary mb-1">Было</div>
                    <div class="text-body-1 pre-wrap">
                      {{ selectedHistoryItem.previous_legal_reference || 'Не указано' }}
                    </div>
                  </div>
                  <v-divider vertical></v-divider>
                  <div class="ml-4" style="flex: 1">
                    <div class="text-caption text--secondary mb-1">Стало</div>
                    <div class="text-body-1 pre-wrap">
                      {{ selectedHistoryItem.new_legal_reference || 'Не указано' }}
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Описание изменения -->
          <v-row v-if="selectedHistoryItem.change_description" class="mt-4">
            <v-col cols="12">
              <div class="text-h6 mb-2">Комментарий к изменению</div>
              <v-card outlined class="pa-3">
                <div class="text-body-1 pre-wrap">
                  {{ selectedHistoryItem.change_description }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="historyDetailDialog = false">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-form>
</template>

<script>
import {AssetSchemas} from '@/const/dataTypes'
import EstateProcessDialog from "@/components/referenceBook/Assets/EstateProcessDialog.vue";
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'
import {
  VAlert,
  VAutocomplete,
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VCheckbox,
  VChip,
  VDialog,
  VForm,
  VIcon,
  VList,
  VListItem,
  VListItemContent,
  VSelect,
  VSwitch,
  VTab,
  VTabItem,
  VTabs,
  VTabsItems,
  VTextarea,
  VTextField
} from 'vuetify/lib'
import {mapGetters} from "vuex";
import DisputeTransactionsList from "@/components/referenceBook/Assets/DisputeTransactionsList.vue";
import DisputeDialog from "@/components/referenceBook/Assets/DisputeDialog.vue";
import moment from "moment";

export default {
  name: "AssetForm",
  components: {
    DisputeTransactionsList,
    DisputeDialog,
    DisputeList: DisputeTransactionsList,
    EstateProcessDialog,
    DatePicker,
    VForm,
    VTextField,
    VAutocomplete,
    VCheckbox,
    VSelect,
    VTextarea,
    VBtn,
    VIcon,
    VCard,
    VCardTitle,
    VCardText,
    VList,
    VListItem,
    VListItemContent,
    VAlert,
    VDialog,
    VCardActions,
    VTab,
    VTabs,
    VTabItem,
    VTabsItems,
    VSwitch,
    VChip
  },
  props: {
    asset: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      pledgeePledgor: null,
      valid: false,
      editedAsset: {
        details: {},
        pledges: [],
        arrests: [],
        category: '',
        asset_type: '',
        acquisition_date: null,
        disposal_date: null,
        status: '',
        carrying_cost: '',
        market_cost: ''
      },
      requiredRules: [v => !!v || 'Обязательное поле'],
      assetCategories: [
        {value: "Недвижимое имущество", text: "Недвижимое имущество"},
        {value: "Движимое имущество", text: "Движимое имущество"},
        {value: "Денежные средства", text: "Денежные средства"},
        {value: "Дебиторская задолженность", text: "Дебиторская задолженность"},
        {value: "Ценные бумаги и прочие финансовые инструменты", text: "Ценные бумаги"},
        {value: "Акции и иное участие в коммерческих организациях", text: "Акции и участие"},
        {value: "Иное имущество", text: "Иное имущество"}
      ],
      assetTypes: Object.keys(AssetSchemas),
      assetStatuses: [
        {value: "active", text: "Активный"},
        {value: "inactive", text: "Неактивный"},
        {value: "disputed", text: "Оспаривается"},
        {value: "leased", text: "В аренде"},
        {value: "under repair", text: "На ремонте"},
        {value: "outstanding", text: "Просрочен"},
        {value: "pledged", text: "В залоге"},
        {value: "arrested", text: "Арестован"},
        {value: "pledged_arrested", text: "В залоге и арестован"}
      ],

      // Диалог залогов/арестов
      pledgeArrestDialog: false,
      dialogTab: 0,
      pledgeValid: false,
      arrestValid: false,
      isEditingPledgeOrArrest: false,
      editingIndex: -1,
      editingType: '', // 'pledge' или 'arrest'
      currentPledge: {
        id: null,
        legal_pledgee: null,
        physical_pledgee: null,
        pledge_type: 'mortgage',
        pledge_date: null,
        pledge_number: '',
        amount: '',
        start_date: null,
        end_date: null,
        description: '',
        is_active: true
      },
      currentArrest: {
        id: null,
        arresting_organization: null,
        arrest_date: null,
        reason: '',
        is_active: true,
        lifting_date: null,
        lifting_reason: ''
      },
      // Списки для выбора
      pledgeTypes: [
        {value: 'mortgage', text: 'Ипотека'},
        {value: 'pawn', text: 'Залог движимого имущества'},
        {value: 'pledge_of_rights', text: 'Залог прав'},
        {value: 'other', text: 'Другой вид залога'}
      ],
      loadingLegalEntities: false,
      loadingPhysicalPersons: false,
      pledgeRules: {
        pledge_number: [v => !!v || 'Номер договора обязателен'],
        pledge_date: [v => !!v || 'Дата договора обязательна'],
        start_date: [v => !!v || 'Дата начала обязательна'],
        amount: [v => !v || !isNaN(parseFloat(v)) || 'Сумма должна быть числом']
      },
      arrestRules: {
        arresting_organization: [v => !!v || 'Организация обязательна'],
        arrest_date: [v => !!v || 'Дата ареста обязательна'],
        reason: [v => !!v || 'Основание для ареста обязательно']
      },
      estateProcessDialog: false,
      estateValid: false,
      isEditingEstateProcess: false,
      currentEstateProcess: {
        decision: 'IN',
        exclusion_ground: null,
        legal_reference: '',
        document_reference: null,
        decision_date: null,
        is_active: true
      },
      estateDecisions: [
        {value: 'IN', text: 'Включается в конкурсную массу'},
        {value: 'OUT', text: 'Исключается из конкурсной массы'}
      ],
      exclusionGrounds: [
        {value: 'gpk_446', text: 'Ст. 446 ГПК РФ (единственное жильё)'},
        {value: 'court_definition', text: 'Определение Арбитражного суда'},
        {value: 'trustee_decision', text: 'Решение арбитражного управляющего'},
        {value: 'legal_position', text: 'Аналогичная правовая позиция'}
      ],
      estateRules: {
        decision: [v => !!v || 'Решение обязательно'],
        exclusion_ground: [
          v => {
            // Если решение OUT, то основание обязательно
            if (this.currentEstateProcess.decision === 'OUT') {
              return !!v || 'Основание исключения обязательно при исключении из конкурсной массы'
            }
            return true
          }
        ],
        legal_reference: [
          v => {
            // Если решение OUT, то правовое обоснование обязательно
            if (this.currentEstateProcess.decision === 'OUT') {
              return !!v || 'Правовое обоснование обязательно при исключении из конкурсной массы'
            }
            return true
          }
        ],
        decision_date: [v => !!v || 'Дата решения обязательна']
      },
      documentFilter: null,
      documentFilters: [
        {text: 'Все документы', value: null},
        {text: 'Входящие', value: 'incoming'},
        {text: 'Исходящие', value: 'outgoing'},
      ],
      // История изменений
      historyDialog: false,
      historyDetailDialog: false,
      historySearch: '',
      historyFilter: {
        decision: null,
        changed_by: null
      },
      historyHeaders: [
        {text: 'Дата изменения', value: 'change_date', width: '150px'},
        {text: 'Кто изменил', value: 'changed_by_name', width: '200px'},
        {text: 'Решение', value: 'decision_change', width: '250px'},
        {text: 'Основание исключения', value: 'exclusion_ground_change', width: '250px'},
        {text: 'Действия', value: 'actions', width: '80px', sortable: false}
      ],
      selectedHistoryItem: null,
      // Оспаривание сделок
      disputeDialog: false,
      isEditingDispute: false,
      editingDisputeIndex: -1,
      currentDispute: {
        project: null,
        disposition_reason: '',
        disposition_contract: '',
        contract_value: null,
        bankruptcy_application_date: null,
        transaction_period: null,
        main_insolvency_date: null,
        statistical_value: null,
        market_value_sources: [],
        counterparty_person: null,
        counterparty_legal: null,
        counterparty_interest_type: null,
        counterparty_interest_details: '',
        disputing_articles: [],
        legal_justification: '',
        dispute_status: 'analysis',
        notes: '',
        is_active: true
      },
    }
  },
  computed: {
    ...mapGetters({
      allRefData: "allRefData",
      legalEntities: 'legalEntityData',
      documents: 'projectDocumentListData',
      projects: 'projectListData',
      physicalPersons: 'physicalPersonListDataV2',
      creditorClaims: 'creditorClaimRegisterData'
    }),
    hasPledges() {
      return Array.isArray(this.editedAsset.pledges) &&
          this.editedAsset.pledges.length > 0;
    },
    hasArrests() {
      return Array.isArray(this.editedAsset.arrests) &&
          this.editedAsset.arrests.length > 0;
    },
    hasHistory() {
      return this.editedAsset.estate_process &&
          this.editedAsset.estate_process.history &&
          Array.isArray(this.editedAsset.estate_process.history) &&
          this.editedAsset.estate_process.history.length > 0;
    },
    filteredHistory() {
      if (!this.editedAsset.estate_process || !this.editedAsset.estate_process.history) {
        return [];
      }

      let history = [...this.editedAsset.estate_process.history];

      // Фильтр по решению
      if (this.historyFilter.decision) {
        history = history.filter(item => item.new_decision === this.historyFilter.decision);
      }

      // Фильтр по пользователю
      if (this.historyFilter.changed_by) {
        history = history.filter(item => item.changed_by === this.historyFilter.changed_by);
      }

      // Поиск
      if (this.historySearch) {
        const search = this.historySearch.toLowerCase();
        history = history.filter(item => {
          return (
              (item.changed_by_name && item.changed_by_name.toLowerCase().includes(search)) ||
              (item.change_description && item.change_description.toLowerCase().includes(search)) ||
              (this.getEstateDecisionText(item.new_decision).toLowerCase().includes(search)) ||
              (item.new_legal_reference && item.new_legal_reference.toLowerCase().includes(search))
          );
        });
      }

      // Сортируем по дате (новые сверху)
      return history.sort((a, b) => {
        const dateA = new Date(a.change_date);
        const dateB = new Date(b.change_date);
        return dateB - dateA;
      });
    },
    filteredProjects() {
      if (!this.projects || this.projects.length === 0) {
        return [];
      }

      // Получаем ID проектов из owner_project
      const ownerProjectIds = this.editedAsset.owner_project || [];

      if (!ownerProjectIds || ownerProjectIds.length === 0) {
        console.warn('У владельца имущества нет связанных проектов');
        return [];
      }

      // Фильтруем проекты по ID
      return this.projects.filter(project =>
          ownerProjectIds.includes(project.id)
      );
    },
    availableCreditors() {
      if (!this.creditorClaims || this.creditorClaims.length === 0) {
        return [];
      }

      // Собираем уникальных кредиторов из creditorClaims
      const creditorMap = new Map();

      this.creditorClaims.forEach(claim => {
        let creditor = null;
        let type = null;
        let id = null;
        let name = '';

        if (claim.physical_creditor) {
          // Если это физическое лицо
          creditor = typeof claim.physical_creditor === 'object'
              ? claim.physical_creditor
              : this.allRefData.find(ref => ref.id === claim.physical_creditor && ref.type === "PhysicalPerson");

          if (creditor) {
            type = 'PhysicalPerson';
            id = creditor.id;
            name = creditor.fullName || creditor.name || 'Неизвестное физ. лицо';
          }
        } else if (claim.legal_creditor) {
          // Если это юридическое лицо
          creditor = typeof claim.legal_creditor === 'object'
              ? claim.legal_creditor
              : this.allRefData.find(ref => ref.id === claim.legal_creditor && ref.type === "LegalEntity");

          if (creditor) {
            type = 'LegalEntity';
            id = creditor.id;
            name = creditor.name || 'Неизвестное юр. лицо';
          }
        }

        // Добавляем в Map по ID, чтобы избежать дубликатов
        if (id && !creditorMap.has(id)) {
          creditorMap.set(id, {
            id: id,
            name: name,
            type: type,
            original: creditor
          });
        }
      });

      // Преобразуем Map в массив
      return Array.from(creditorMap.values());
    },
    historyUsers() {
      if (!this.editedAsset.estate_process || !this.editedAsset.estate_process.history) {
        return [];
      }

      const usersMap = new Map();
      this.editedAsset.estate_process.history.forEach(item => {
        if (item.changed_by && item.changed_by_name) {
          usersMap.set(item.changed_by, {
            id: item.changed_by,
            full_name: item.changed_by_name
          });
        }
      });

      return Array.from(usersMap.values());
    },
  },
  watch: {
    'editedAsset.details': {
      deep: true,
      handler() {
        this.emitAssetChange();
      }
    },
    asset: {
      immediate: true,
      handler(newVal) {
        if (!newVal) return
        if (this.editedAsset && this.editedAsset.id === newVal.id) {
          return
        }

        this.editedAsset = JSON.parse(JSON.stringify({
          ...newVal,
          pledges: newVal.pledges || [],
          arrests: newVal.arrests || [],
          details: newVal.details || {},
          estate_process: newVal.estate_process || null,
          dispute_transaction: newVal.dispute_transaction || null
        }))

        // Преобразуем organization из строки в число, если нужно
        if (this.editedAsset.details && this.editedAsset.details.organization) {
          const orgValue = this.editedAsset.details.organization;
          if (typeof orgValue === 'string' && !isNaN(parseInt(orgValue))) {
            this.editedAsset.details.organization = parseInt(orgValue);
          }
        }
      }
    },
    legalEntities: {
      immediate: true,
      handler(newVal) {
        if (newVal && newVal.length > 0 && this.editedAsset.details && this.editedAsset.details.organization) {
          // Если organization это ID (число), убедимся что оно остается числом
          const orgId = this.editedAsset.details.organization;
          const orgExists = newVal.some(org => org.id === orgId);
          if (!orgExists && orgId) {
            console.warn(`Организация с ID ${orgId} не найдена в списке legalEntities`);
          }
        }
      }
    },
    value: {
      handler(newVal) {
        this.internalSelected = [...newVal];
      },
      immediate: true
    },
  },
  mounted() {
    this.$store.dispatch('fetchPhysicalPersons')
    this.$store.dispatch('getLegalEntity')
    this.$store.dispatch('getProjectDocument', {project: this.editedAsset.owner_project.toString()})
    if (this.editedAsset.owner_project) {
      this.loadCreditorsForProject()
    }

  },
  methods: {
    setPledgee(item) {
      console.log('Setting pledgee:', item);

      if (!item) {
        this.currentPledge.legal_pledgee = null;
        this.currentPledge.physical_pledgee = null;
        return;
      }

      if (item.type === "LegalEntity") {
        this.currentPledge.legal_pledgee = item.id;
        this.currentPledge.physical_pledgee = null;
        this.currentPledge.pledgor_type = 'legal';
      } else if (item.type === "PhysicalPerson") {
        this.currentPledge.physical_pledgee = item.id;
        this.currentPledge.legal_pledgee = null;
        this.currentPledge.pledgor_type = 'physical';
      }
    },
    getPledgeeName(pledge) {
      if (pledge.legal_pledgee) {
        const legalEntity = this.legalEntities.find(le => le.id === pledge.legal_pledgee);
        return legalEntity ? legalEntity.name : 'Неизвестное юр. лицо';
      } else if (pledge.physical_pledgee) {
        // Ищем физическое лицо в allRefData
        const physicalPerson = this.allRefData.find(p =>
            p.id === pledge.physical_pledgee && p.type === "PhysicalPerson"
        );
        return physicalPerson ? physicalPerson.fullName || 'Неизвестное физ. лицо' : 'Неизвестное физ. лицо';
      }
      return 'Не указан';
    },
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    emitAssetChange() {
      // Используем debounce для предотвращения множественных вызовов
      if (!this.debouncedEmit) {
        this.debouncedEmit = this.debounce(() => {
          console.log('Emitting asset change with details:', this.editedAsset.details);

          // Убедимся, что details есть и это объект
          const assetData = JSON.parse(JSON.stringify({
            ...this.editedAsset,
            details: this.editedAsset.details || {},
            pledges: this.editedAsset.pledges || [],
            arrests: this.editedAsset.arrests || [],
            estate_process: this.editedAsset.estate_process || null,
            dispute_transaction: this.editedAsset.dispute_transaction || null
          }));

          this.$emit('asset-change', assetData);
        }, 100);
      }
      this.debouncedEmit();
    },
    validate() {
      return this.$refs.form.validate();
    },
    getAssetData() {
      return this.editedAsset;
    },
    onAssetTypeChange() {
      if (!this.disabled) {
        this.$set(this.editedAsset, 'details', {});
        const schema = AssetSchemas[this.editedAsset.asset_type];
        if (schema && schema.properties) {
          Object.keys(schema.properties).forEach(key => {
            const field = schema.properties[key];
            let defaultValue;
            if (field.type === 'boolean') {
              defaultValue = field.default !== undefined ? field.default : false;
            } else if (field.type === 'number' || field.type === 'integer') {
              defaultValue = field.default !== undefined ? field.default : 0;
            } else if (field.type === 'string') {
              defaultValue = field.default !== undefined ? field.default : '';
            } else {
              defaultValue = null;
            }
            // Используем Vue.set для реактивности
            this.$set(this.editedAsset.details, key, defaultValue);
          });
        }
      }
      this.$nextTick(() => {
        this.emitAssetChange();
      });
    },
    getSchemaFields() {
      if (!this.editedAsset.asset_type || !AssetSchemas[this.editedAsset.asset_type]) {
        return {};
      }
      const schema = AssetSchemas[this.editedAsset.asset_type];
      return schema?.properties || {};
    },
    resolveFieldComponent(field) {
      switch (field.type) {
        case "boolean":
          return "v-checkbox";
        case "date":
          return "DatePicker";
        case "string":
          if ((field.enum && field.enum.length > 0) || typeof field.enum === 'string') {
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
    getFieldRules(field) {
      const rules = [];
      if (field.required) {
        rules.push(v => !!v || 'Обязательное поле');
      }
      if (field.type === 'string') {
        if (field.minLength !== undefined) {
          rules.push(v => !v || v.length >= field.minLength ||
              `Минимальная длина: ${field.minLength} символов`);
        }
        if (field.maxLength !== undefined) {
          rules.push(v => !v || v.length <= field.maxLength ||
              `Максимальная длина: ${field.maxLength} символов`);
        }
      }
      if (field.type === 'number' || field.type === 'integer') {
        if (field.minimum !== undefined) {
          rules.push(v => v === '' || v === null || v >= field.minimum ||
              `Минимальное значение: ${field.minimum}`);
        }
        if (field.maximum !== undefined) {
          rules.push(v => v === '' || v === null || v <= field.maximum ||
              `Максимальное значение: ${field.maximum}`);
        }
        if (field.type === 'integer') {
          rules.push(v => v === '' || v === null || Number.isInteger(Number(v)) ||
              'Должно быть целое число');
        }
      }
      return rules;
    },
    getFieldAttrs(field, fieldKey) {
      const attrs = {};
      if (field.placeholder) {
        attrs.placeholder = field.placeholder;
      }
      if (field.type === 'string') {
        if (field.maxLength !== undefined) {
          attrs.counter = field.maxLength;
        }
        if (fieldKey === 'vin') {
          attrs.mask = 'XXXXXXXXXXXXXXXXX';
          attrs.hint = 'Введите 17-значный VIN номер';
          attrs.persistentHint = true;
        }
      }
      if (field.type === 'number' || field.type === 'integer') {
        attrs.type = 'number';
        if (field.minimum !== undefined) {
          attrs.min = field.minimum;
        }
        if (field.maximum !== undefined) {
          attrs.max = field.maximum;
        }
        if (field.type === 'integer') {
          attrs.step = 1;
        }
      }
      if (field.enum) {
        if (Array.isArray(field.enum) && field.enum.length > 0) {
          // Если enum - статический массив
          attrs.items = field.enum;
        } else if (typeof field.enum === 'string') {
          // Если enum - строка (ключ для computed свойства)
          switch (field.enum) {
            case 'legalEntities':
              attrs.items = this.legalEntities;
              attrs['item-text'] = 'name';
              attrs['item-value'] = 'id';
              // Не используем return-object, чтобы сохранялось только ID
              break;
            default:
              // Если это computed свойство существует
              if (this[field.enum]) {
                attrs.items = this[field.enum];
              }
          }
        }
      }
      if (field.type === 'boolean') {
        attrs.dense = true;
      }
      if (field.format === 'date' || field.type === 'date') {
        attrs.valueType = 'format';
        attrs.format = 'DD.MM.YYYY';
      }
      return attrs;
    },
    openPledgeArrestDialog(type = 'pledge', index = -1) {
      console.log('Opening dialog for', type, 'at index:', index);

      this.pledgeArrestDialog = true;
      this.isEditingPledgeOrArrest = index !== -1;
      this.editingIndex = index;
      this.editingType = type;

      // Сбрасываем валидацию форм
      if (this.$refs.pledgeForm) {
        this.$refs.pledgeForm.resetValidation();
      }
      if (this.$refs.arrestForm) {
        this.$refs.arrestForm.resetValidation();
      }

      if (type === 'pledge') {
        this.dialogTab = 0;
        if (index !== -1) {
          // Редактирование существующего залога
          const pledge = this.editedAsset.pledges[index];
          console.log('Editing existing pledge:', pledge);

          // Создаем копию залога
          this.currentPledge = {
            ...pledge,
            // Определяем тип залогодержателя
            pledgor_type: pledge.legal_pledgee ? 'legal' : 'physical'
          };

          // Устанавливаем pledgeePledgor в зависимости от типа
          if (pledge.legal_pledgee) {
            // Ищем юридическое лицо
            const legalEntity = this.legalEntities.find(le => le.id === pledge.legal_pledgee);
            this.pledgeePledgor = legalEntity || null;
          } else if (pledge.physical_pledgee) {
            // Ищем физическое лицо
            const physicalPerson = this.allRefData.find(p =>
                p.id === pledge.physical_pledgee && p.type === "PhysicalPerson"
            );
            this.pledgeePledgor = physicalPerson || null;
          } else {
            this.pledgeePledgor = null;
          }

          console.log('Current pledge after setup:', this.currentPledge);
          console.log('Pledgee/Pledgor after setup:', this.pledgeePledgor);
        } else {
          // Новый залог
          this.currentPledge = {
            pledgor_type: 'legal',
            legal_pledgee: null,
            physical_pledgee: null,
            pledge_type: 'mortgage',
            pledge_date: null,
            pledge_number: '',
            amount: '',
            start_date: null,
            end_date: null,
            description: '',
            is_active: true
          };
          this.pledgeePledgor = null;
        }
      } else {
        this.dialogTab = 1;
        if (index !== -1) {
          // Редактирование существующего ареста
          const arrest = this.editedAsset.arrests[index];
          console.log('Editing existing arrest:', arrest);

          this.currentArrest = {...arrest};

          // Если arresting_organization это объект, берем только id
          if (this.currentArrest.arresting_organization &&
              typeof this.currentArrest.arresting_organization === 'object') {
            this.currentArrest.arresting_organization = this.currentArrest.arresting_organization.id;
          }
        } else {
          // Новый арест
          this.currentArrest = {
            arresting_organization: null,
            arrest_date: null,
            reason: '',
            is_active: true,
            lifting_date: null,
            lifting_reason: ''
          };
        }
      }
    },
    closePledgeArrestDialog() {
      this.pledgeArrestDialog = false;
      this.isEditingPledgeOrArrest = false;
      this.editingIndex = -1;
      this.editingType = '';
      this.resetPledgeArrestForms();

      // Сбрасываем валидацию
      if (this.$refs.pledgeForm) {
        this.$refs.pledgeForm.resetValidation();
      }
      if (this.$refs.arrestForm) {
        this.$refs.arrestForm.resetValidation();
      }
    },
    resetPledgeArrestForms() {
      this.currentPledge = {
        pledgor_type: 'legal',
        legal_pledgee: null,
        physical_pledgee: null,
        pledge_type: 'mortgage',
        pledge_date: null,
        pledge_number: '',
        amount: '',
        start_date: null,
        end_date: null,
        description: '',
        is_active: true
      };

      this.currentArrest = {
        arresting_organization: null,
        arrest_date: null,
        reason: '',
        is_active: true,
        lifting_date: null,
        lifting_reason: ''
      };
    },
    toggleArrestDates() {
      if (this.currentArrest.is_active) {
        this.currentArrest.lifting_date = null;
        this.currentArrest.lifting_reason = '';
      }
    },
    async savePledgeOrArrest() {
      try {
        if (this.dialogTab === 0) {
          console.log('Saving pledge, current data:', this.currentPledge);

          // Валидация формы залога
          const pledgeFormValid = await this.$refs.pledgeForm.validate();
          if (!pledgeFormValid) {
            console.log('Форма залога не валидна');
            return;
          }

          // Преобразуем данные залога
          const pledgeData = {
            ...this.currentPledge,
            pledge_date: this.currentPledge.pledge_date,
            start_date: this.currentPledge.start_date,
            end_date: this.currentPledge.end_date || null,
            amount: this.currentPledge.amount ? parseFloat(this.currentPledge.amount) : null
          };

          // Убираем лишние поля
          delete pledgeData.pledgor_type;

          console.log('Processed pledge data:', pledgeData);

          // Создаем новый массив залогов
          let newPledges;
          if (this.isEditingPledgeOrArrest && this.editingType === 'pledge') {
            newPledges = [...this.editedAsset.pledges];
            newPledges[this.editingIndex] = pledgeData;
          } else {
            newPledges = [...this.editedAsset.pledges, pledgeData];
          }

          // Используем Vue.set для реактивного обновления
          this.$set(this.editedAsset, 'pledges', newPledges);
        } else {
          console.log('Saving arrest, current data:', this.currentArrest);

          // Валидация формы ареста
          const arrestFormValid = await this.$refs.arrestForm.validate();
          if (!arrestFormValid) {
            console.log('Форма ареста не валидна');
            return;
          }

          // Преобразуем данные ареста
          const arrestData = {
            ...this.currentArrest,
            arrest_date: this.currentArrest.arrest_date,
            lifting_date: this.currentArrest.lifting_date || null
          };

          console.log('Processed arrest data:', arrestData);

          // Создаем новый массив арестов
          let newArrests;
          if (this.isEditingPledgeOrArrest && this.editingType === 'arrest') {
            newArrests = [...this.editedAsset.arrests];
            newArrests[this.editingIndex] = arrestData;
          } else {
            newArrests = [...this.editedAsset.arrests, arrestData];
          }

          // Используем Vue.set для реактивного обновления
          this.$set(this.editedAsset, 'arrests', newArrests);
        }

        // Закрываем диалог
        this.closePledgeArrestDialog();

        // Обновляем computed свойства
        this.$nextTick(() => {
          console.log('Обновляю список залогов/арестов');
          this.emitAssetChange();
        });

        console.log('Залог/арест успешно сохранен');
        console.log('Текущие залоги:', this.editedAsset.pledges);
        console.log('Текущие аресты:', this.editedAsset.arrests);
      } catch (error) {
        console.error('Ошибка при сохранении залога/ареста:', error);
      }
    },
    async saveEstateProcess(estateData) {
      try {
        // estateData уже прошла валидацию в дочернем компоненте
        this.$set(this.editedAsset, 'estate_process', estateData);

        this.closeEstateProcessDialog();

        this.$nextTick(() => {
          this.emitAssetChange();
        });

        console.log('Решение по конкурсной массе успешно сохранено');

      } catch (error) {
        console.error('Ошибка при сохранении решения по конкурсной массы:', error);
      }
    },
    editPledge(index) {
      console.log('Editing pledge at index:', index);
      this.openPledgeArrestDialog('pledge', index);
    },
    editArrest(index) {
      console.log('Editing arrest at index:', index);
      this.openPledgeArrestDialog('arrest', index);
    },
    removePledge(index) {
      if (confirm('Вы уверены, что хотите удалить этот залог?')) {
        // Создаем новый массив без удаленного элемента
        const newPledges = this.editedAsset.pledges.filter((_, i) => i !== index);
        this.$set(this.editedAsset, 'pledges', newPledges);

        this.$nextTick(() => {
          this.emitAssetChange();
        });
      }
    },
    removeArrest(index) {
      if (confirm('Вы уверены, что хотите удалить этот арест?')) {
        // Создаем новый массив без удаленного элемента
        const newArrests = this.editedAsset.arrests.filter((_, i) => i !== index);
        this.$set(this.editedAsset, 'arrests', newArrests);

        this.$nextTick(() => {
          this.emitAssetChange();
        });
      }
    },
    getPledgeTypeText(type) {
      const typeMap = {
        'mortgage': 'Ипотека',
        'pawn': 'Залог движимого имущества',
        'pledge_of_rights': 'Залог прав',
        'other': 'Другой вид залога'
      };
      return typeMap[type] || type;
    },
    getArrestingOrganization(arrest) {
      const org = this.legalEntities.find(e => e.id === arrest.arresting_organization);
      return org ? org.name : 'Неизвестная организация';
    },
    formatDate(date) {
      if (!date) return '—';
      if (typeof date === 'string') return date;
      return date;
    },
    formatCurrency(amount) {
      if (!amount) return '0 ₽';
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(amount);
    },
    openEstateProcessDialog() {
      this.estateProcessDialog = true;
      this.isEditingEstateProcess = !!this.editedAsset.estate_process;

      if (this.editedAsset.estate_process) {
        // Копируем существующий процесс
        this.currentEstateProcess = {...this.editedAsset.estate_process};

        // Преобразуем дату в правильный формат
        if (this.currentEstateProcess.decision_date) {
          this.currentEstateProcess.decision_date = this.formatDateForPicker(this.currentEstateProcess.decision_date);
        }
      } else {
        // Новый процесс
        this.currentEstateProcess = {
          decision: 'IN',
          exclusion_ground: null,
          legal_reference: '',
          document_reference: null,
          decision_date: this.getTodayDate(),
          is_active: true
        };
      }

      // Сбрасываем валидацию
      if (this.$refs.estateForm) {
        this.$refs.estateForm.resetValidation();
      }
    },
    closeEstateProcessDialog() {
      this.estateProcessDialog = false;
      this.isEditingEstateProcess = false;
      this.resetEstateProcessForm();
    },
    resetEstateProcessForm() {
      this.currentEstateProcess = {
        decision: 'IN',
        exclusion_ground: null,
        legal_reference: '',
        document_reference: null,
        decision_date: null,
        is_active: true
      };
    },
    editEstateProcess() {
      this.openEstateProcessDialog();
    },
    formatDateForPicker(dateString) {
      if (!dateString) return null;
      if (typeof dateString === 'string' && dateString.includes('.')) {
        return dateString;
      }
      if (typeof dateString === 'string' && dateString.includes('-')) {
        const [year, month, day] = dateString.split('-');
        return `${day}.${month}.${year}`;
      }
      return dateString;
    },
    removeEstateProcess() {
      if (confirm('Вы уверены, что хотите удалить решение по конкурсной массе?')) {
        this.$set(this.editedAsset, 'estate_process', null);

        this.$nextTick(() => {
          this.emitAssetChange();
        });
      }
    },
    getEstateDecisionText(decision) {
      if (!decision) return 'Не указано';

      const decisionMap = {
        'IN': 'Включается в конкурсную массу',
        'OUT': 'Исключается из конкурсной массы'
      };
      return decisionMap[decision] || decision;
    },
    getExclusionGroundText(ground) {
      const groundMap = {
        'gpk_446': 'Ст. 446 ГПК РФ (единственное жильё)',
        'court_definition': 'Определение Арбитражного суда',
        'trustee_decision': 'Решение арбитражного управляющего',
        'legal_position': 'Аналогичная правовая позиция'
      };
      return groundMap[ground] || ground;
    },
    getEstateColor(decision) {
      return decision === 'IN' ? 'success' : 'error';
    },
    getDecisionColor(decision) {
      if (!decision) return 'grey';
      return decision === 'IN' ? 'success' : 'error';
    },
    getTodayDate() {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      return `${day}.${month}.${year}`;
    },
    openHistoryDialog() {
      if (this.hasHistory) {
        this.historyDialog = true;
        // Сбрасываем фильтры при открытии
        this.historySearch = '';
        this.historyFilter = {
          decision: null,
          changed_by: null
        };
      }
    },
    closeHistoryDialog() {
      this.historyDialog = false;
      this.historySearch = '';
      this.historyFilter = {
        decision: null,
        changed_by: null
      };
    },
    showHistoryDetails(item) {
      this.selectedHistoryItem = item;
      this.historyDetailDialog = true;
    },
    getInitials(name) {
      if (!name) return '?';
      return name
          .split(' ')
          .map(word => word.charAt(0))
          .join('')
          .toUpperCase()
          .substring(0, 2);
    },
    formatDateTime(dateTime) {
      if (!dateTime) return '—';
      try {
        const date = new Date(dateTime);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
      } catch (e) {
        return dateTime;
      }
    },
    async loadCreditorsForProject() {
      try {
        const projectIds = this.editedAsset.owner_project
        if (projectIds && projectIds.length > 0) {
          const projectId = projectIds[0]
          await this.$store.dispatch('getCreditorClaim', projectId)
        }
      } catch (error) {
        console.error('Ошибка загрузки кредиторов:', error)
      }
    },
    async loadHistory() {
      try {
        if (this.editedAsset.estate_process && this.editedAsset.estate_process.id) {
          // Загрузите историю с сервера
          const response = await this.$store.dispatch('getEstateProcessHistory', {
            estateProcessId: this.editedAsset.estate_process.id
          });

          // Обновите историю в estate_process
          if (response && response.data) {
            this.$set(this.editedAsset.estate_process, 'history', response.data);
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки истории:', error);
      }
    },
    openDisputeDialog() {
      this.disputeDialog = true;
      this.isEditingDispute = !!this.editedAsset.dispute_transaction;

      if (this.editedAsset.dispute_transaction) {
        // Копируем существующую сделку
        this.currentDispute = JSON.parse(JSON.stringify(this.editedAsset.dispute_transaction));
      } else {
        this.currentDispute = {
          project: this.filteredProjects.length === 1 ? this.filteredProjects[0].id : null,
          disposition_reason: '',
          disposition_contract: '',
          contract_value: null,
          bankruptcy_application_date: this.filteredProjects.length === 1 ?
              moment(this.filteredProjects[0].bankruptcy_application_date).format('DD.MM.YYYY') : null,
          transaction_period: null,
          main_insolvency_date: null,
          statistical_value: null,
          market_value_sources: [],
          counterparty_person: null,
          counterparty_legal: null,
          counterparty_interest_type: null,
          counterparty_interest_details: '',
          disputing_articles: [],
          legal_justification: '',
          dispute_status: 'analysis',
          notes: '',
          is_active: true
        };
      }
    },
    closeDisputeDialog() {
      this.disputeDialog = false;
      this.isEditingDispute = false;
      this.currentDispute = {
        project: null,
        disposition_reason: '',
        disposition_contract: '',
        contract_value: null,
        bankruptcy_application_date: null,
        transaction_period: null,
        main_insolvency_date: null,
        statistical_value: null,
        market_value_sources: [],
        counterparty_person: null,
        counterparty_legal: null,
        counterparty_interest_type: null,
        counterparty_interest_details: '',
        disputing_articles: [],
        legal_justification: '',
        dispute_status: 'analysis',
        notes: '',
        is_active: true
      };
    },
    saveDispute(disputeData) {
      // Обновляем свойство как один объект
      this.$set(this.editedAsset, 'dispute_transaction', disputeData);

      this.closeDisputeDialog();

      this.$nextTick(() => {
        this.emitAssetChange();
      });
    },
    editDispute() {
      this.openDisputeDialog();
    },
    removeDispute() {
      if (confirm('Вы уверены, что хотите удалить оспариваемую сделку?')) {
        this.$set(this.editedAsset, 'dispute_transaction', null);

        this.$nextTick(() => {
          this.emitAssetChange();
        });
      }
    },
    resetSelection() {
      this.internalSelected = [];
      this.selectedItems = [];
    }
  }
}
</script>

<style scoped>
.v-list-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.v-list-item:hover {
  background-color: #f5f5f5;
}

.v-tab {
  min-width: 120px;
}

.text-caption {
  font-size: 12px;
  line-height: 1.2;
}

.v-chip--x-small {
  height: 16px;
  font-size: 10px;
}

.compact-document-selection {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.compact-document-selection .document-type {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
}

.compact-document-selection .document-name {
  font-weight: 500;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compact-document-selection .document-from {
  color: #666;
  font-size: 0.8rem;
  font-style: italic;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Стили для элементов списка */
.document-compact-title {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.document-compact-name {
  flex: 1;
  font-weight: 500;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-compact-subtitle {
  font-size: 0.75rem;
  color: #666;
  line-height: 1.3;
}

.document-compact-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 2px;
}

.document-compact-direction {
  display: flex;
  align-items: center;
  font-size: 0.7rem;
  color: #1976d2;
  background-color: #e3f2fd;
  padding: 1px 4px;
  border-radius: 3px;
}

.document-compact-date,
.document-compact-from {
  display: flex;
  align-items: center;
  font-size: 0.7rem;
}

.document-compact-correspondence {
  display: flex;
  align-items: center;
  font-size: 0.7rem;
  color: #666;
  margin-top: 2px;
}

/* Стили для иконок */
.document-compact-info .v-icon,
.document-compact-correspondence .v-icon {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* Стили для таблицы истории */
.history-table {
  max-height: 500px;
  overflow-y: auto;
}

.history-table .v-data-table__wrapper {
  max-height: 400px;
}

/* Стили для подробного просмотра */
.pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}

/* Стили для аватаров */
.v-avatar {
  font-size: 0.75rem;
}

@media (max-width: 960px) {
  .history-table .v-data-table__wrapper {
    max-height: 300px;
  }

  .v-data-table__mobile-row {
    min-height: 48px;
  }
}

/* Стили для чипов с решениями */
.v-chip--outlined {
  background-color: transparent !important;
}

/* Анимация появления */
.v-dialog {
  transition: all 0.3s ease;
}

/* Стили для разделителей */
.v-divider--vertical {
  margin: 0 16px;
}

@media (max-width: 600px) {
  .compact-document-selection {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .document-compact-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .document-compact-direction,
  .document-compact-date,
  .document-compact-from {
    margin-bottom: 2px;
  }
}
</style>