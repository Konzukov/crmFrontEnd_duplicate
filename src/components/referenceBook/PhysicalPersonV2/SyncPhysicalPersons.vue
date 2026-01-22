<template>
  <v-container fluid class="sync-container">
    <v-row no-gutters>
      <v-col cols="12">
        <v-card class="sync-card">
          <!-- Заголовок с информацией об организации -->
          <v-card-title class="sync-title d-flex flex-column flex-sm-row align-start align-sm-center">
            <div class="d-flex align-center mb-2 mb-sm-0">
              <v-icon left class="mr-2">mdi-database-sync</v-icon>
              <span class="title-text">Синхронизация физических лиц</span>
            </div>
            <v-spacer></v-spacer>
            <div v-if="currentOrganization" class="current-org-info text-caption text-sm-body-2">
              <v-chip x-small color="info" class="mr-1">Текущая:</v-chip>
              {{ currentOrganization.name }}
            </div>
          </v-card-title>

          <!-- Основное содержимое -->
          <v-card-text class="sync-content pa-3">
            <!-- Выбор целевой базы данных -->
            <v-autocomplete
                dense
                v-model="selectedTargetDb"
                :items="availableDatabases"
                item-text="name"
                item-value="db_name"
                label="Целевая база данных"
                outlined
                hide-details
                :loading="loading"
                :disabled="availableDatabases.length === 0"
                @change="onTargetDbChange"
                class="mb-3"
            >
              <template v-slot:prepend-inner>
                <v-icon small>mdi-database</v-icon>
              </template>
            </v-autocomplete>

            <!-- Статус проверки дубликатов -->
            <v-alert
                v-if="duplicateCheckStatus"
                :type="duplicateCheckStatus.type"
                dense
                class="mb-3"
                dismissible
                @input="duplicateCheckStatus = null"
            >
              {{ duplicateCheckStatus.message }}
            </v-alert>

            <!-- Панель инструментов таблицы -->
            <v-card class="mb-3" outlined>
              <v-card-text class="py-2 px-3 d-flex flex-column flex-sm-row align-start align-sm-center">
                <div class="d-flex align-center mb-2 mb-sm-0">
                  <v-icon small class="mr-2">mdi-account-group</v-icon>
                  <span class="text-body-2 font-weight-medium">Физические лица</span>
                  <span v-if="filteredPersons.length > 0" class="text-caption ml-1">
                    ({{ filteredPersons.length }})
                  </span>
                </div>
                <v-spacer></v-spacer>
                <div class="d-flex align-center flex-wrap">
                  <v-text-field
                      v-model="search"
                      label="Поиск"
                      prepend-inner-icon="mdi-magnify"
                      single-line
                      hide-details
                      outlined
                      dense
                      class="search-field mr-2 mb-2 mb-sm-0"
                      @input="handleSearch"
                  ></v-text-field>
                  <v-btn
                      small
                      color="primary"
                      @click="checkDuplicates(selected, { showDialog: false })"
                      :loading="checkingAllDuplicates"
                      :disabled="!selectedTargetDb || selected.length === 0"
                      class="mb-2 mb-sm-0"
                  >
                    <v-icon small left>mdi-magnify</v-icon>
                    Проверить все
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- Таблица физических лиц -->
            <v-card class="persons-table-card" outlined>
              <div class="persons-table-wrapper">
                <v-data-table
                    v-model="selected"
                    :headers="headers"
                    :items="filteredPersons"
                    :loading="loadingPersons"
                    :items-per-page="10"
                    :page.sync="page"
                    show-select
                    item-key="id"
                    class="elevation-0 persons-table"
                    fixed-header
                    :height="tableHeight"
                    dense
                >
                  <template v-slot:item.fullName="{ item }">
                    <div class="d-flex align-center person-name-cell">
                      {{ item.fullName }}
                      <v-chip
                          v-if="item.duplicate_count && item.duplicate_count > 0"
                          x-small
                          :color="item.duplicate_count > 0 ? 'warning' : 'success'"
                          class="ml-1 duplicate-chip"
                      >
                        {{ item.duplicate_count }}
                      </v-chip>
                    </div>
                  </template>

                  <template v-slot:item.birthday="{ item }">
                    <div class="text-no-wrap text-caption">
                      {{ formatDate(item.birthday) }}
                    </div>
                  </template>

                  <template v-slot:item.birthplace="{ item }">
                    <div class="birthplace-cell text-caption">
                      {{ truncateText(item.birthplace, 25) }}
                    </div>
                  </template>

                  <template v-slot:item.identifiers="{ item }">
                    <div v-if="item.identifiers && item.identifiers.length > 0" class="identifiers-cell">
                      <div v-for="(ident, idx) in item.identifiers.slice(0, 1)" :key="idx" class="text-caption">
                        <div v-for="(idItem, idx2) in ident.identifier.slice(0, 2)" :key="idx2" class="identifier-item">
                          <span class="text--secondary">{{ idItem.type }}:</span> {{ idItem.value }}
                        </div>
                      </div>
                      <div v-if="item.identifiers.length > 1" class="text-caption text--secondary">
                        +{{ item.identifiers.length - 1 }} еще
                      </div>
                    </div>
                    <span v-else class="text--disabled text-caption">—</span>
                  </template>

                  <template v-slot:item.actions="{ item }">
                    <v-btn
                        x-small
                        icon
                        @click="checkDuplicates(item, { showDialog: true })"
                        :loading="checkingDuplicates === item.id"
                        :disabled="!selectedTargetDb"
                        class="action-btn"
                    >
                      <v-icon x-small>mdi-alert-circle</v-icon>
                    </v-btn>
                  </template>

                  <template v-slot:no-data>
                    <div class="text-center py-4">
                      <v-icon size="48" color="grey lighten-2">mdi-account-off</v-icon>
                      <div class="text-body-2 grey--text mt-2">Нет данных</div>
                    </div>
                  </template>

                  <template v-slot:loading>
                    <div class="text-center py-4">
                      <v-progress-circular
                          indeterminate
                          size="24"
                          color="primary"
                      ></v-progress-circular>
                      <div class="mt-2 text-caption">Загрузка данных...</div>
                    </div>
                  </template>
                </v-data-table>
              </div>
            </v-card>
          </v-card-text>

          <!-- Кнопка синхронизации -->
          <v-card-actions class="sync-actions pa-3">
            <v-spacer></v-spacer>
            <v-btn
                :disabled="!canSync"
                color="primary"
                @click="startSync"
                :loading="syncing"
                class="sync-btn"
            >
              <v-icon left>mdi-database-export</v-icon>
              Начать синхронизацию
              <span v-if="selected.length > 0" class="ml-1 font-weight-bold">
                ({{ selected.length }})
              </span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог с дубликатами -->
    <v-dialog v-model="duplicateDialog" max-width="800">
      <v-card>
        <v-card-title class="duplicate-dialog-title">
          <v-icon left>mdi-alert-circle</v-icon>
          Возможные дубликаты в целевой базе
          <v-spacer></v-spacer>
          <v-btn icon @click="duplicateDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="duplicate-dialog-content">
          <v-row class="mb-3">
            <v-col cols="12">
              <v-card outlined class="source-person-card">
                <v-card-title class="py-2 source-person-title">
                  Исходное лицо
                </v-card-title>
                <v-card-text>
                  <div class="source-person-info">
                    <div><strong>ФИО:</strong> {{ currentPerson && currentPerson.fullName }}</div>
                    <div v-if="currentPerson && currentPerson.birthday">
                      <strong>Дата рождения:</strong> {{ formatDate(currentPerson.birthday) }}
                    </div>
                    <div v-if="currentPerson && currentPerson.birthplace">
                      <strong>Место рождения:</strong> {{ currentPerson.birthplace }}
                    </div>
                    <div v-if="currentPerson && currentPerson.identifiers">
                      <strong>Идентификаторы:</strong>
                      <div v-for="(ident, idx) in currentPerson.identifiers" :key="idx" class="ml-3">
                        <div v-for="(idItem, idx2) in ident.identifier" :key="idx2">
                          {{ idItem.type }}: {{ idItem.value }}
                        </div>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-alert v-if="currentDuplicates.length === 0" type="success" dense>
            <v-icon left>mdi-check-circle</v-icon>
            Дубликатов не найдено. Можно безопасно синхронизировать.
          </v-alert>

          <div v-else>
            <v-alert type="warning" dense class="mb-3">
              <v-icon left>mdi-alert</v-icon>
              Найдено {{ currentDuplicates.length }} возможных дубликатов
            </v-alert>

            <v-list subheader two-line class="duplicates-list">
              <v-subheader>Найденные совпадения:</v-subheader>
              <v-divider></v-divider>
              <v-list-item
                  v-for="duplicate in currentDuplicates"
                  :key="duplicate.id"
                  class="duplicate-item"
              >
                <v-list-item-avatar>
                  <v-chip :color="duplicate.similarity >= 90 ? 'error' : 'warning'" class="similarity-chip">
                    {{ duplicate.similarity }}%
                  </v-chip>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title class="duplicate-name">
                    {{ duplicate.fullName || duplicate.full_name }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="duplicate-details">
                    <div class="duplicate-detail-item">
                      <v-icon x-small class="mr-1">mdi-identifier</v-icon>
                      ID: {{ duplicate.id }}
                    </div>
                    <div v-if="duplicate.birthday" class="duplicate-detail-item">
                      <v-icon x-small class="mr-1">mdi-calendar</v-icon>
                      Дата рождения: {{ formatDate(duplicate.birthday) }}
                    </div>
                    <div v-if="duplicate.birthplace" class="duplicate-detail-item">
                      <v-icon x-small class="mr-1">mdi-map-marker</v-icon>
                      Место рождения: {{ truncateText(duplicate.birthplace, 40) }}
                    </div>
                    <v-chip
                        v-if="duplicate.similarity >= 90"
                        x-small
                        color="error"
                        class="mt-1"
                    >
                      <v-icon x-small left>mdi-alert</v-icon>
                      Высокая вероятность дублирования
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn
                      small
                      color="primary"
                      @click="viewDuplicate(duplicate.id)"
                  >
                    <v-icon left small>mdi-eye</v-icon>
                    Посмотреть
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
        <v-card-actions class="duplicate-dialog-actions">
          <v-spacer></v-spacer>
          <v-btn @click="duplicateDialog = false">Закрыть</v-btn>
          <v-btn
              v-if="currentDuplicates.length > 0"
              color="warning"
              @click="handleDuplicateAction"
          >
            <v-icon left>mdi-alert</v-icon>
            Всё равно синхронизировать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог результатов -->
    <v-dialog v-model="resultDialog" max-width="800">
      <v-card>
        <v-card-title class="result-dialog-title">
          <v-icon left>mdi-check-circle</v-icon>
          Результаты синхронизации
          <v-spacer></v-spacer>
          <v-chip :color="getStatusColor(syncResult.status)" class="status-chip">
            {{ getStatusText(syncResult.status) }}
          </v-chip>
        </v-card-title>
        <v-card-text class="result-dialog-content">
          <!-- Статистика -->
          <v-row class="mb-4">
            <v-col v-for="stat in syncStats" :key="stat.label" cols="6" sm="3">
              <v-card outlined class="stat-card">
                <v-card-text class="text-center pa-3">
                  <div class="text-h5 font-weight-bold" :class="stat.color">
                    {{ stat.value }}
                  </div>
                  <div class="text-caption grey--text">{{ stat.label }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <!-- Детальные результаты -->
          <h4 class="mb-2 font-weight-medium">Детали операций:</h4>
          <div class="results-list">
            <v-expansion-panels accordion>
              <v-expansion-panel
                  v-for="(result, index) in syncResult.results"
                  :key="index"
                  class="result-item"
              >
                <v-expansion-panel-header>
                  <template v-slot:default="{ open }">
                    <v-row no-gutters class="align-center">
                      <v-col cols="2" class="d-flex align-center">
                        <v-chip
                            x-small
                            :color="getActionColor(result.action)"
                            class="mr-2 action-chip"
                        >
                          {{ getActionText(result.action) }}
                        </v-chip>
                      </v-col>
                      <v-col cols="3" class="text-truncate">
                        <span class="source-id">ID: {{ result.source_id }}</span>
                      </v-col>
                      <v-col cols="5" class="text--secondary text-truncate">
                        <v-fade-transition leave-absolute>
                          <span v-if="open" key="0" class="result-message">
                            {{ result.message }}
                          </span>
                          <span v-else key="1" class="result-message-truncated">
                            {{ truncateText(result.message, 40) }}
                          </span>
                        </v-fade-transition>
                      </v-col>
                      <v-col cols="2" class="text-right">
                        <v-chip
                            x-small
                            :color="result.success ? 'success' : 'error'"
                            class="status-chip-small"
                        >
                          {{ result.success ? 'Успешно' : 'Ошибка' }}
                        </v-chip>
                      </v-col>
                    </v-row>
                  </template>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-simple-table dense class="details-table">
                    <template v-slot:default>
                      <tbody>
                      <tr>
                        <td class="font-weight-medium">Сообщение:</td>
                        <td>{{ result.message }}</td>
                      </tr>
                      <tr v-if="result.target_id">
                        <td class="font-weight-medium">ID в целевой БД:</td>
                        <td>{{ result.target_id }}</td>
                      </tr>
                      <tr v-if="result.details">
                        <td class="font-weight-medium">Детали:</td>
                        <td>
                          <pre class="details-pre">{{ formatDetails(result.details) }}</pre>
                        </td>
                      </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-card-text>
        <v-card-actions class="result-dialog-actions">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="resultDialog = false">Закрыть</v-btn>
          <v-btn
              v-if="syncResult.log_id"
              color="success"
              @click="viewSyncLog(syncResult.log_id)"
          >
            <v-icon left small>mdi-history</v-icon>
            Посмотреть в истории
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import customConst from "@/const/customConst";

export default {
  name: 'SyncPhysicalPersons',
  data() {
    return {
      // Данные
      availableDatabases: [],
      physicalPersons: [],
      filteredPersons: [],
      selected: [],
      selectedTargetDb: null,

      // Текущий пользователь и организация
      currentOrganization: null,
      currentDatabase: null,

      // Пагинация
      page: 1,
      tableHeight: 400,

      // Поиск дубликатов
      duplicateDialog: false,
      currentDuplicates: [],
      currentPerson: null,
      checkingDuplicates: null,
      checkingAllDuplicates: false,
      duplicateCheckStatus: null,

      // Синхронизация
      syncing: false,
      resultDialog: false,
      syncResult: {
        log_id: null,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        total: 0,
        status: '',
        results: []
      },

      // UI состояния
      loading: false,
      loadingPersons: false,
      search: '',

      // Заголовки таблицы
      headers: [
        {text: 'ФИО', value: 'fullName', sortable: true, width: 200},
        {text: 'Дата рождения', value: 'birthday', sortable: true, width: 100},
        {text: 'Место рождения', value: 'birthplace', sortable: true, width: 150},
        {text: 'Идентификаторы', value: 'identifiers', sortable: false, width: 150},
        {text: '', value: 'actions', sortable: false, width: 60, align: 'center'},
      ]
    }
  },

  computed: {
    ...mapGetters({
      userData: 'authUserData',
      physicalPersonList: 'physicalPersonListDataV2'
    }),

    // Упрощенный computed - проверяем только selected
    canSync() {
      return (
          this.selected.length > 0 &&
          this.selectedTargetDb &&
          !this.syncing &&
          this.availableDatabases.length > 0
      );
    },

    syncStats() {
  return [
    {
      label: 'Всего',
      value: this.syncResult.total || 0,
      color: 'primary--text'
    },
    {
      label: 'Создано',
      value: this.syncResult.created || 0,
      color: this.syncResult.created > 0 ? 'success--text' : 'grey--text'
    },
    {
      label: 'Обновлено',
      value: this.syncResult.updated || 0,
      color: this.syncResult.updated > 0 ? 'info--text' : 'grey--text'
    },
    {
      label: 'Пропущено',
      value: this.syncResult.skipped || 0,
      color: this.syncResult.skipped > 0 ? 'warning--text' : 'grey--text'
    },
    {
      label: 'Ошибки',
      value: this.syncResult.errors || 0,
      color: (this.syncResult.errors || 0) > 0 ? 'error--text' : 'grey--text'
    }
  ]
}
  },

  methods: {
    ...mapActions([
      'fetchPhysicalPersons'
    ]),

    // Универсальная функция для проверки дубликатов
    async checkDuplicates(personOrArray, options = {}) {
  const { showDialog = false } = options;

  // Определяем, что передали: массив ID, объект person или массив объектов
  let personIds = [];
  let isSingle = false;

  if (Array.isArray(personOrArray)) {
    // Если передали массив - извлекаем ID
    personIds = personOrArray.map(item =>
      typeof item === 'object' ? item.id : item
    ).filter(id => id !== undefined);

    if (personIds.length === 0) {
      await this.$store.dispatch('snackbar/showError', 'Не выбрано ни одного лица для проверки');
      return;
    }
    isSingle = personIds.length === 1;
  } else if (personOrArray && typeof personOrArray === 'object') {
    // Если передали один объект
    personIds = [personOrArray.id];
    isSingle = true;
  } else {
    console.error('Неподдерживаемый формат данных:', personOrArray);
    return;
  }

  if (!this.selectedTargetDb) {
    this.$store.dispatch('snackbar/showError', 'Сначала выберите целевую базу данных');
    return;
  }

  // Устанавливаем состояние загрузки
  if (isSingle) {
    this.checkingDuplicates = personIds[0];
  } else {
    this.checkingAllDuplicates = true;
  }

  this.duplicateCheckStatus = null;

  try {
    const response = await this.$http.post(customConst.REFERENCE_BOOK_API + 'sync/find_duplicates/', {
      target_db: this.selectedTargetDb,
      current_db: this.userData.profile.active_organization.db_name,
      person_ids: personIds
    });

    // Извлекаем данные из правильного места
    const responseData = response.data?.data || response.data;

    // Если ответ пустой или содержит ошибку
    if (!responseData) {
      this.$store.dispatch('snackbar/showError', 'Некорректный ответ от сервера');
      return;
    }

    // Устанавливаем флаг диалога для одиночной проверки
    if (isSingle && showDialog) {
      this.duplicateDialog = true;
    }

    this.processDuplicateResults(responseData, personIds, isSingle, showDialog);

  } catch (error) {
    console.error('Ошибка проверки дубликатов:', error);
    await this.$store.dispatch('snackbar/showError', 'Ошибка проверки дубликатов');
  } finally {
    if (isSingle) {
      this.checkingDuplicates = null;
    } else {
      this.checkingAllDuplicates = false;
    }
  }
},

    // Вспомогательный метод для обработки результатов
    processDuplicateResults(data, personIds, isSingle, showDialog) {
  // Проверяем структуру данных
  if (!data) {
    console.error('Нет данных для обработки');
    return;
  }

  const results = data.results || [];
  const totalWithDuplicates = data.total_with_duplicates || 0;

  // Обновляем счетчики дубликатов
  results.forEach(result => {
    if (result && result.source_person && result.source_person.id) {
      this.updatePersonDuplicateCount(
        result.source_person.id,
        result.total_duplicates || (result.duplicates ? result.duplicates.length : 0)
      );
    }
  });

  // Обрабатываем в зависимости от контекста
  if (isSingle && showDialog) {
    this.handleSingleDuplicateResult(results[0], personIds[0]);
  } else if (!isSingle) {
    this.handleBulkDuplicateResult({ total_with_duplicates: totalWithDuplicates }, personIds.length);
  } else {
    // Для одиночной проверки без диалога показываем snackbar
    this.handleSingleDuplicateResult(results[0], personIds[0]);
  }
},

    // Обновление счетчика дубликатов для лица
    updatePersonDuplicateCount(personId, duplicateCount) {
      const personIndex = this.physicalPersons.findIndex(p => p.id === personId);
      if (personIndex !== -1) {
        this.$set(this.physicalPersons[personIndex], 'duplicate_count', duplicateCount);
        const filteredIndex = this.filteredPersons.findIndex(p => p.id === personId);
        if (filteredIndex !== -1) {
          this.$set(this.filteredPersons[filteredIndex], 'duplicate_count', duplicateCount);
        }
      }
    },

    // Обработка результата для одного лица с диалогом
    handleSingleDuplicateResult(result, personId) {
      if (!result) return;

      if (result.error) {
        this.$store.dispatch('snackbar/showError', result.error);
        return;
      }

      const duplicateCount = result.total_duplicates || 0;

      // Всегда показываем snackbar с результатом
      if (duplicateCount > 0) {
        const highRisk = (result.duplicates || []).some(d => d.similarity >= 90);
        const message = highRisk
            ? `Обнаружены ${duplicateCount} возможных дубликатов с высокой степенью совпадения!`
            : `Обнаружены ${duplicateCount} возможных дубликатов в целевой БД`;

        this.$store.dispatch('snackbar/showWarning', message);
      } else {
        this.$store.dispatch('snackbar/showSuccess', 'Дубликаты в целевой БД не обнаружены');
      }

      // Если нужно показать диалог
      if (this.duplicateDialog) {
        this.currentPerson = this.getPersonById(personId);
        this.currentDuplicates = result.duplicates || [];

        if (duplicateCount > 0) {
          const highRisk = (result.duplicates || []).some(d => d.similarity >= 90);
          this.duplicateCheckStatus = {
            type: highRisk ? 'error' : 'warning',
            message: `Найдено ${duplicateCount} возможных дубликатов`
          };
        } else {
          this.duplicateCheckStatus = {
            type: 'success',
            message: 'Дубликатов не найдено'
          };
        }
      }
    },

    // Обработка массового результата без диалога
    handleBulkDuplicateResult(data, totalCount) {
      const totalWithDuplicates = data.total_with_duplicates || 0;

      // Всегда показываем snackbar с результатом
      if (totalWithDuplicates > 0) {
        const message = `У ${totalWithDuplicates} из ${totalCount} лиц обнаружены возможные дубликаты в целевой БД`;
        this.$store.dispatch('snackbar/showWarning', message);
      } else {
        this.$store.dispatch('snackbar/showSuccess', 'Дубликаты не обнаружены ни у одного из проверенных лиц');
      }

      this.duplicateCheckStatus = totalWithDuplicates > 0 ? {
        type: 'warning',
        message: `У ${totalWithDuplicates} из ${totalCount} лиц найдены возможные дубликаты`
      } : {
        type: 'success',
        message: 'Дубликатов не найдено ни у одного из проверенных лиц'
      };
    },

    // Вспомогательный метод для получения объекта по ID
    getPersonById(id) {
      return this.physicalPersons.find(p => p.id === id);
    },

    async startSync() {
  if (!this.canSync) return;

  this.syncing = true;

  try {
    // Извлекаем ID из выбранных объектов
    const personIds = this.selected.map(person => person.id);

    const response = await this.$http.post(customConst.REFERENCE_BOOK_API + 'sync/sync_physical_persons/', {
      target_db: this.selectedTargetDb,
      current_db: this.userData.profile.active_organization.db_name,
      person_ids: personIds
    });

    // Извлекаем данные из правильного места - response.data.data
    const responseData = response.data?.data || response.data;

    // Создаем корректный объект syncResult на основе ответа сервера
    this.syncResult = {
      log_id: responseData?.log_id || null,
      created: responseData?.created || 0,
      updated: responseData?.updated || 0,
      skipped: responseData?.skipped || 0,
      errors: responseData?.errors || 0,
      total: responseData?.total || personIds.length,
      status: responseData?.status || 'success',
      results: responseData?.results || []
    };

    this.resultDialog = true;

    await this.loadPhysicalPersons();

    const created = this.syncResult.created || 0;
    const updated = this.syncResult.updated || 0;
    const skipped = this.syncResult.skipped || 0;

    let successMessage = '';

    if (created > 0 && updated === 0 && skipped === 0) {
      successMessage = `Синхронизация завершена: ${created} создано`;
    } else if (created === 0 && updated > 0 && skipped === 0) {
      successMessage = `Синхронизация завершена: ${updated} обновлено`;
    } else if (created > 0 && updated > 0 && skipped === 0) {
      successMessage = `Синхронизация завершена: ${created} создано, ${updated} обновлено`;
    } else if (skipped > 0) {
      successMessage = `Синхронизация завершена: ${created} создано, ${updated} обновлено, ${skipped} пропущено (данные актуальны)`;
    } else {
      successMessage = 'Синхронизация завершена';
    }

    if (this.syncResult.errors > 0) {
      this.$store.dispatch('snackbar/showWarning',
        `${successMessage}, ${this.syncResult.errors} с ошибками`);
    } else if (this.syncResult.status === 'Конфликт' || this.syncResult.status === 'conflict') {
      this.$store.dispatch('snackbar/showInfo',
        `${successMessage} (статус: ${this.syncResult.status})`);
    } else {
      this.$store.dispatch('snackbar/showSuccess', successMessage);
    }

  } catch (error) {
    console.error('Ошибка синхронизации:', error);
    this.$store.dispatch('snackbar/showError', 'Ошибка синхронизации');

    // В случае ошибки показываем базовый результат
    this.syncResult = {
      log_id: null,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 1,
      total: this.selected.length,
      status: 'failed',
      results: []
    };
    this.resultDialog = true;
  } finally {
    this.syncing = false;
    this.selected = [];
  }
},

    loadDatabases() {
      this.loading = true

      try {
        const userProfile = this.userData && this.userData.profile
        const availableOrganizations = userProfile && userProfile.available_organization ? userProfile.available_organization : []

        this.currentOrganization = userProfile && userProfile.active_organization ? userProfile.active_organization : null

        if (this.currentOrganization && this.currentOrganization.db_name) {
          this.currentDatabase = this.currentOrganization.db_name
        } else {
          this.currentDatabase = null
        }

        this.availableDatabases = availableOrganizations
            .filter(org => {
              const dbName = org && org.db_name
              return dbName && dbName !== this.currentDatabase
            })
            .map(org => ({
              id: org.id,
              name: org.name || org.full_name || 'Без названия',
              db_name: org.db_name || '',
              description: org.full_name || org.name || '',
              full_name: org.full_name || ''
            }))

        if (this.availableDatabases.length === 0) {
          console.warn('Нет доступных баз данных для синхронизации')
        }

      } catch (error) {
        console.error('Ошибка загрузки списка баз данных:', error)
        this.$store.dispatch('snackbar/showError', 'Ошибка загрузки списка баз данных')
      } finally {
        this.loading = false
      }
    },

    async loadPhysicalPersons() {
      this.loadingPersons = true
      try {
        await this.fetchPhysicalPersons()
        this.physicalPersons = (this.physicalPersonList || []).map(person => ({
          ...person,
          duplicate_count: 0
        }))
        this.filteredPersons = [...this.physicalPersons]
      } catch (error) {
        console.error('Ошибка загрузки физических лиц:', error)
        this.$store.dispatch('snackbar/showError', 'Ошибка загрузки физических лиц')
      } finally {
        this.loadingPersons = false
      }
    },

    handleSearch() {
      const searchTerm = this.search.toLowerCase().trim()
      if (!searchTerm) {
        this.filteredPersons = [...this.physicalPersons]
        return
      }

      this.filteredPersons = this.physicalPersons.filter(person => {
        if (person.fullName && person.fullName.toLowerCase().includes(searchTerm)) {
          return true
        }

        if (person.birthday && this.formatDate(person.birthday).toLowerCase().includes(searchTerm)) {
          return true
        }

        if (person.birthplace && person.birthplace.toLowerCase().includes(searchTerm)) {
          return true
        }

        if (person.identifiers && person.identifiers.length > 0) {
          for (const ident of person.identifiers) {
            if (ident.identifier && ident.identifier.length > 0) {
              for (const idItem of ident.identifier) {
                if (
                    (idItem.type && idItem.type.toLowerCase().includes(searchTerm)) ||
                    (idItem.value && idItem.value.toLowerCase().includes(searchTerm))
                ) {
                  return true
                }
              }
            }
          }
        }

        return false
      })
    },

    onTargetDbChange() {
      this.physicalPersons.forEach(person => {
        if (person.duplicate_count) {
          person.duplicate_count = 0
        }
      })
      this.filteredPersons.forEach(person => {
        if (person.duplicate_count) {
          person.duplicate_count = 0
        }
      })
      this.duplicateCheckStatus = null
    },

    clearSelection() {
      this.selected = []
    },

    removePerson(personId) {
      this.selected = this.selected.filter(person => person.id !== personId)
    },

    viewDuplicate(duplicateId) {
      const targetDb = this.selectedTargetDb
      const routeData = this.$router.resolve({
        name: 'physicalPersonV2',
        query: {
          personId: duplicateId,
          db: targetDb,
          readonly: true
        }
      })
      window.open(routeData.href, '_blank')
    },

    handleDuplicateAction() {
      if (this.currentPerson && !this.selected.some(p => p.id === this.currentPerson.id)) {
        // Добавляем объект целиком, а не только ID
        this.selected.push(this.currentPerson);
        this.duplicateDialog = false;
        this.$store.dispatch('snackbar/showWarning', 'Лицо добавлено в список синхронизации. Будьте осторожны с возможными дубликатами.');
      }
    },

    viewSyncLog(logId) {
      this.$router.push({
        name: 'syncLogs',
        params: {logId}
      })
      this.resultDialog = false
    },

    formatDate(date) {
      if (!date) return '—'
      if (typeof date === 'string' && date.includes('.')) {
        return date
      }
      try {
        return new Date(date).toLocaleDateString('ru-RU')
      } catch (e) {
        return String(date)
      }
    },

    truncateText(text, length) {
      if (!text || text.length <= length) return text
      return text.substring(0, length) + '...'
    },

    formatDetails(details) {
      if (!details) return ''
      try {
        return JSON.stringify(details, null, 2)
      } catch (e) {
        return String(details)
      }
    },

    getStatusColor(status) {
      const colorMap = {
        success: 'success',
        partial: 'warning',
        failed: 'error',
        conflict: 'error'
      }
      return colorMap[status] || 'grey'
    },

    getStatusText(status) {
  const statusMap = {
    success: 'Успешно',
    partial: 'Частично',
    failed: 'Ошибка',
    conflict: 'Конфликт',
    'Успешно': 'Успешно',
    'Частично': 'Частично',
    'Ошибка': 'Ошибка',
    'Конфликт': 'Конфликт'
  }
  return statusMap[status] || status
},

    getActionColor(action) {
      const colorMap = {
        created: 'success',
        updated: 'info',
        skipped: 'grey',
        error: 'error'
      }
      return colorMap[action] || 'grey'
    },

    getActionText(action) {
      const actionMap = {
        created: 'Создано',
        updated: 'Обновлено',
        skipped: 'Пропущено',
        error: 'Ошибка'
      }
      return actionMap[action] || action
    }
  },

  watch: {
    userData: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadDatabases()
        }
      }
    },

    '$vuetify.breakpoint.name': {
      immediate: true,
      handler(breakpointName) {
        switch (breakpointName) {
          case 'xs':
          case 'sm':
            this.tableHeight = 350
            break
          case 'md':
            this.tableHeight = 400
            break
          default:
            this.tableHeight = 450
        }
      }
    }
  },

  async created() {
    await this.loadPhysicalPersons()
  }
}
</script>

<style scoped>
.sync-container {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  padding: 8px;
  overflow: hidden;
}

.sync-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.sync-title {
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.title-text {
  font-size: 1.1rem;
  font-weight: 500;
}

.current-org-info {
  background: rgba(33, 150, 243, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(33, 150, 243, 0.2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}

.sync-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px !important;
  min-height: 0;
}

.sync-actions {
  flex-shrink: 0;
  padding: 12px 16px !important;
  background-color: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.sync-btn {
  min-width: 180px;
}

.selected-persons-chips {
  max-height: 60px;
  overflow-y: auto;
  padding: 2px 0;
}

.persons-table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.persons-table-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.persons-table {
  flex: 1;
  border: none;
}

.persons-table >>> .v-data-table__wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
}

.persons-table >>> .v-data-table-header {
  background-color: #f9f9f9;
  position: sticky;
  top: 0;
  z-index: 2;
}

.persons-table >>> th {
  background-color: #f9f9f9 !important;
  font-weight: 600 !important;
  color: #333 !important;
  font-size: 0.8rem !important;
  height: 36px !important;
  padding: 0 8px !important;
}

.persons-table >>> td {
  font-size: 0.8rem !important;
  height: 40px !important;
  padding: 0 8px !important;
}

.person-name-cell {
  min-height: 32px;
  align-items: center;
  font-size: 0.9rem;
}

.duplicate-chip {
  min-width: 20px;
  height: 18px;
  font-size: 0.7rem;
  justify-content: center;
}

.birthplace-cell {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.identifiers-cell {
  max-width: 150px;
}

.identifier-item {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  line-height: 1.2;
  margin-bottom: 1px;
}

.search-field {
  max-width: 200px;
  min-width: 150px;
}

/* Адаптивность */
@media (max-width: 960px) {
  .sync-container {
    padding: 4px;
    height: calc(100vh - 56px);
  }

  .sync-title {
    padding: 8px 12px;
  }

  .current-org-info {
    max-width: 300px;
    font-size: 0.75rem;
  }

  .search-field {
    max-width: 180px;
    min-width: 120px;
  }
}

@media (max-width: 600px) {
  .sync-title {
    flex-direction: column;
    align-items: flex-start;
  }

  .current-org-info {
    max-width: 100%;
    margin-top: 4px;
  }

  .sync-content {
    padding: 12px !important;
  }

  .search-field {
    max-width: 100%;
    margin-bottom: 8px;
  }

  .persons-table >>> th,
  .persons-table >>> td {
    padding: 0 4px !important;
    font-size: 0.75rem !important;
  }

  .sync-btn {
    width: 100%;
    min-width: unset;
  }
}
</style>