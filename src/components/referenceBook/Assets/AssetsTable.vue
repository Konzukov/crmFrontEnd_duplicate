<template>
  <v-data-table
      :headers="headers"
      :items="filteredItems"
      :search="search"
      :loading="loading"
      :page.sync="currentPage"
      :items-per-page.sync="itemsPerPage"
      :footer-props="footerProps"
      class="elevation-1 assets-table"
      :dense="dense"
      @update:page="$emit('update:page', $event)"
      @update:items-per-page="$emit('update:items-per-page', $event)"
      :show-select="showSelect"
      v-model="selectedItems"
      item-key="id"
  >
    <template v-slot:header.data-table-select="{ on, props }">
      <v-checkbox
          dense
          v-bind="props"
          v-on="on"
          hide-details
          class="ma-0 pa-0 header-checkbox"
      ></v-checkbox>
    </template>

    <template v-slot:item.data-table-select="{ isSelected, select, item }">
      <v-checkbox
          :value="isSelected"
          @change="select($event)"
          :disabled="!canSelectItem(item)"
          hide-details
          dense
          class="ma-0 pa-0 row-checkbox"
      ></v-checkbox>
    </template>

    <!-- Слот для типа имущества -->
    <template v-slot:item.asset_type="{ item }">
      <div class="asset-type-with-description">
        <div class="asset-type-header">
          <div class="asset-type-content">
            <v-icon small class="mr-1">{{ getAssetIcon(item.asset_type) }}</v-icon>
            <span class="asset-type-text">{{ item.asset_type }}</span>

            <!-- Бейджи для арестов и залогов -->
            <div v-if="hasActiveStatuses(item)" class="asset-badges">
              <v-tooltip v-if="item.arrest_status_info && item.arrest_status_info.arrest_count > 0" top>
                <template v-slot:activator="{ on, attrs }">
                  <div class="arrest-badge" v-bind="attrs" v-on="on">
                    {{ item.arrest_status_info.arrest_count }}
                  </div>
                </template>
                <span>Активных арестов: {{ item.arrest_status_info.arrest_count }}</span>
              </v-tooltip>

              <v-tooltip v-if="item.pledge_status_info && item.pledge_status_info.pledge_count > 0" top>
                <template v-slot:activator="{ on, attrs }">
                  <div class="pledge-badge" v-bind="attrs" v-on="on">
                    {{ item.pledge_status_info.pledge_count }}
                  </div>
                </template>
                <span>Активных залогов: {{ item.pledge_status_info.pledge_count }}</span>
              </v-tooltip>
            </div>
          </div>
        </div>
        <div class="asset-description" v-if="item.formatted_description">
          <v-tooltip bottom max-width="400px">
            <template v-slot:activator="{ on, attrs }">
              <span v-bind="attrs" v-on="on" class="description-text">
                {{ truncateDescription(item.formatted_description, descriptionMaxLength) }}
              </span>
            </template>
            <span>{{ item.formatted_description }}</span>
          </v-tooltip>
        </div>
        <div class="asset-description" v-else-if="item.details && item.details.address">
          <span class="address-text">{{ truncateDescription(item.details.address, descriptionMaxLength) }}</span>
        </div>
      </div>
    </template>

    <!-- Слот для типа собственности -->
    <template v-slot:item.is_joint_property="{ item }">
      <v-chip small :color="getCategoryColor(item.is_joint_property)" dark class="category-chip">
        {{ item.is_joint_property ? "Совместное" : 'Личное' }}
      </v-chip>
    </template>

    <!-- Слот для статуса -->
    <template v-slot:item.status="{ item }">
      <v-chip
          small
          :color="getStatusColor(item.status)"
          text-color="white"
          class="status-chip"
      >
        {{ getStatusDisplay(item.status) }}
      </v-chip>
    </template>

    <!-- Слот для статуса оспаривания -->
    <template v-slot:item.dispute_status="{ item }">
      <div v-if="item.dispute_transaction">
        <v-chip
            small
            :color="getDisputeStatusColor(item.dispute_transaction.dispute_status)"
            text-color="white"
            class="status-chip"
        >
          {{ getDisputeStatusText(item.dispute_transaction.dispute_status) }}
        </v-chip>
      </div>
      <div v-else class="text-caption grey--text">—</div>
    </template>

    <!-- Слот для даты приобретения -->
    <template v-slot:item.acquisition_date="{ item }">
      <div class="date-cell">
        {{ item.acquisition_date || '-' }}
      </div>
    </template>

    <!-- Слот для даты отчуждения -->
    <template v-slot:item.disposal_date="{ item }">
      <div class="date-cell">
        {{ item.disposal_date || '-' }}
      </div>
    </template>

    <!-- Слот для владельца -->
    <template v-slot:item.owner_name="{ item }">
      <div class="owner-info">
        {{ item.owner_name || '-' }}
      </div>
    </template>

    <!-- Слот для действий -->
    <template v-slot:item.actions="{ item }">
      <v-menu>
        <template v-slot:activator="{attrs, on}">
          <v-icon size="15" v-bind="attrs" v-on="on">mdi-dots-vertical</v-icon>
        </template>
        <v-list class="action bg-grey" dense>
          <v-list-item link @click="$emit('edit', item)">
            <v-list-item-icon>
              <v-icon small>mdi-pencil</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Редактировать</v-list-item-title>
          </v-list-item>
          <v-list-item link @click="$emit('estate-process', item)" v-if="showEstateProcess">
            <v-list-item-icon>
              <v-icon small>mdi-scale-balance</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Конкурсная масса</v-list-item-title>
          </v-list-item>
          <v-list-item link @click="$emit('delete', item)" v-if="showDelete">
            <v-list-item-icon>
              <v-icon small color="error">mdi-delete</v-icon>
            </v-list-item-icon>
            <v-list-item-title style="color: #f44336;">Удалить</v-list-item-title>
          </v-list-item>
          <v-divider v-if="showCustomActions"></v-divider>
          <slot name="custom-actions" :item="item"></slot>
        </v-list>
      </v-menu>
    </template>

    <!-- Слот для пустой таблицы -->
    <template v-slot:no-data>
      <div class="text-center py-4">
        <v-icon class="mb-2">mdi-package-variant</v-icon>
        <p class="mb-2">Нет данных об имуществе</p>
        <v-btn v-if="showAddButton" color="primary" @click="$emit('add')">
          <v-icon left>mdi-plus</v-icon>
          Добавить имущество
        </v-btn>
      </div>
    </template>

    <!-- Слот для загрузки -->
    <template v-slot:loading>
      <v-row justify="center" align="center" class="py-4">
        <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
        <span class="ml-3">Загрузка имущества...</span>
      </v-row>
    </template>

    <!-- Слот для футера -->
    <template v-slot:footer>
      <template v-if="$scopedSlots['footer-actions'] && showFooterActions">
        <div class="selection-footer">
          <slot name="footer-actions" :selectedItems="selectedItems"></slot>
        </div>
        <v-divider></v-divider>
      </template>
      <div class="text-center py-2">
    <span class="text-caption grey--text">
      Показано {{ getPaginationInfo() }}
    </span>
      </div>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: 'AssetsTable',
  props: {
    // Основные пропсы
    items: {
      type: Array,
      default: () => []
    },
    headers: {
      type: Array,
      default: () => [
        {text: 'Тип имущества', value: 'asset_type', sortable: true, width: '25%'},
        {text: 'Доля владения', value: 'is_joint_property', sortable: true, width: '18%'},
        {text: 'Дата приобретения', value: 'acquisition_date', sortable: true, width: '15%'},
        {text: 'Дата отчуждения', value: 'disposal_date', sortable: true, width: '15%'},
        {text: 'Владелец', value: 'owner_name', sortable: true, width: '22%'},
        {text: 'Действия', value: 'actions', sortable: false, align: 'center', width: '8%'}
      ]
    },
    loading: {
      type: Boolean,
      default: false
    },
    search: {
      type: String,
      default: ''
    },
    // Фильтрация
    filterType: {
      type: String,
      default: null
    },
    filterCategory: {
      type: String,
      default: null
    },
    filterDealStatus: {
      type: String,
      default: null
    },
    // Пагинация
    page: {
      type: Number,
      default: 1
    },
    itemsPerPage: {
      type: Number,
      default: 10
    },
    // Настройки отображения
    dense: {
      type: Boolean,
      default: false
    },
    showEstateProcess: {
      type: Boolean,
      default: true
    },
    showDelete: {
      type: Boolean,
      default: true
    },
    showAddButton: {
      type: Boolean,
      default: true
    },
    descriptionMaxLength: {
      type: Number,
      default: 60
    },
    // Настройки футера
    footerItemsPerPageOptions: {
      type: Array,
      default: () => [10, 25, 50, 100]
    },
    showFooterActions: {
      type: Boolean,
      default: false
    },
    itemKey: {
      type: String,
      default: 'id'
    },
    showSelect: {
      type: Boolean,
      default: false
    },
    value: { // v-model для выбранных элементов
      type: Array,
      default: () => []
    },
    selectedOwner: { // текущий выбранный владелец для ограничения
      type: String,
      default: null
    },
    showGenerateDocument: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      currentPage: this.page,
      currentItemsPerPage: this.itemsPerPage,
      internalSelected: [...this.value]
    }
  },
  computed: {
    selectedItems: {
      get() {
        return this.internalSelected;
      },
      set(value) {
        this.internalSelected = value;
        this.$emit('input', value);
        this.$emit('selection-change', value);
      }
    },
    filteredItems() {
      let filtered = [...this.items]

      // Фильтр по типу (личное/совместное)
      if (this.filterType === 'personal') {
        filtered = filtered.filter(asset => !asset.is_joint_property && asset.ownership_type === 'personal')
      } else if (this.filterType === 'joint') {
        filtered = filtered.filter(asset => asset.is_joint_property || asset.ownership_type === 'joint')
      } else if (this.filterType === 'disposal') {
        filtered = filtered.filter(asset => asset.disposal_date)
      }

      // Фильтр по категории
      if (this.filterCategory) {
        filtered = filtered.filter(asset => asset.category_display === this.filterCategory)
      }

      // Новый фильтр по статусу сделки
      if (this.filterDealStatus) {
        filtered = filtered.filter(asset => {
          if (!asset.dispute_transaction) return false;
          return asset.dispute_transaction.dispute_status === this.filterDealStatus;
        });
      }

      return filtered
    },
    footerProps() {
      return {
        'items-per-page-options': this.footerItemsPerPageOptions,
        'items-per-page-text': 'Строк на странице:',
        'page-text': '{0}-{1} из {2}'
      }
    },
    showCustomActions() {
      return this.$scopedSlots['custom-actions']
    },
  },
  watch: {
    page(newVal) {
      this.currentPage = newVal
    },
    itemsPerPage(newVal) {
      this.currentItemsPerPage = newVal
    },
    currentPage(newVal) {
      this.$emit('update:page', newVal)
    },
    currentItemsPerPage(newVal) {
      this.$emit('update:items-per-page', newVal)
    },
    value: {
      handler(newVal) {
        this.internalSelected = newVal ? [...newVal] : [];
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    canSelectItem(item) {
      if (!this.showSelect) return false;
      if (!this.selectedOwner) return true; // Если владелец не выбран, можно выбрать любую
      return item.owner_name === this.selectedOwner;
    },
    getCategoryColor(is_joint_property) {
      return is_joint_property ? 'success' : 'grey'
    },

    getAssetIcon(assetType) {
      const icons = {
        'квартира': 'mdi-home',
        'дом': 'mdi-home-city',
        'земельный участок': 'mdi-map-marker',
        'гараж': 'mdi-garage',
        'автомобиль': 'mdi-car',
        'мотоцикл': 'mdi-motorbike',
        'яхта': 'mdi-sail-boat',
        'самолёт': 'mdi-airplane',
        'акции': 'mdi-chart-line',
        'облигации': 'mdi-chart-bar',
        'банковский вклад': 'mdi-bank',
        'банковский счёт': 'mdi-credit-card'
      }
      return icons[assetType] || 'mdi-package-variant'
    },

    getStatusColor(status) {
      const colors = {
        'active': 'green',
        'inactive': 'grey',
        'disputed': 'red',
        'leased': 'orange',
        'under repair': 'blue',
        'outstanding': 'red'
      }
      return colors[status] || 'grey'
    },

    getStatusDisplay(status) {
      const display = {
        'active': 'Активный',
        'inactive': 'Неактивный',
        'disputed': 'Оспаривается',
        'leased': 'В аренде',
        'under repair': 'На ремонте',
        'outstanding': 'Просрочен'
      }
      return display[status] || status
    },

    // Методы для статуса оспаривания
    getDisputeStatusText(status) {
      const statusMap = {
        'analysis': 'Анализ',
        'disputed': 'Оспаривается',
        'not_disputed': 'Не оспаривается',
        'completed': 'Завершено',
        'court_decision': 'Судебное решение',
        'settled': 'Урегулировано'
      }
      return statusMap[status] || status
    },

    getDisputeStatusColor(status) {
      const colorMap = {
        'analysis': 'info',
        'disputed': 'error',
        'not_disputed': 'success',
        'completed': 'success',
        'court_decision': 'warning',
        'settled': 'success'
      }
      return colorMap[status] || 'grey'
    },

    hasActiveStatuses(asset) {
      const hasArrests = asset.arrest_status_info && asset.arrest_status_info.arrest_count > 0
      const hasPledges = asset.pledge_status_info && asset.pledge_status_info.pledge_count > 0
      return hasArrests || hasPledges
    },

    getPaginationInfo() {
      const start = (this.currentPage - 1) * this.currentItemsPerPage + 1
      const end = Math.min(this.currentPage * this.currentItemsPerPage, this.filteredItems.length)
      return `${start}-${end} из ${this.filteredItems.length}`
    },

    truncateDescription(text, maxLength) {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }
  }
}
</script>

<style scoped>
/* Базовые стили таблицы */
.assets-table {
  --table-max-height: calc(100vh - 450px);
  --badge-height: 18px;
  --chip-height: 22px;
  --description-width: 250px;
}

/* Контейнер таблицы */
.assets-table :deep(.v-data-table__wrapper) {
  max-height: var(--table-max-height) !important;
  overflow-y: auto;
}

/* Группа типа имущества */
.asset-type-with-description {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.asset-type-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.asset-type-text {
  margin-right: 8px;
}

/* Описание и адрес */
.asset-description {
  font-size: 0.75rem;
  color: #666;
  line-height: 1.2;
  max-width: var(--description-width);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.description-text,
.address-text {
  cursor: help;
}

/* Бейджи */
.asset-badges {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.arrest-badge,
.pledge-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--badge-height);
  height: var(--badge-height);
  border-radius: calc(var(--badge-height) / 2);
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0 4px;
  cursor: default;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, background-color 0.2s;
}

.arrest-badge {
  background-color: #ff5252;
}

.pledge-badge {
  background-color: #4caf50;
}

.arrest-badge:hover {
  background-color: #ff1744;
  transform: scale(1.05);
}

.pledge-badge:hover {
  background-color: #388e3c;
  transform: scale(1.05);
}

/* Чипы */
.category-chip,
.status-chip {
  font-size: 0.75rem !important;
  height: var(--chip-height) !important;
}

/* Меню действий */
.action .v-list-item__icon {
  margin: 0 8px 0 -8px;
}

.action .v-list-item__title {
  font-size: 0.875rem;
}

/* Ячейки с текстом */
.date-cell,
.owner-info {
  font-size: 0.85rem;
}

/* Стили для чекбоксов */
.assets-table :deep(.v-data-table__checkbox) {
  padding: 0 12px;
}

.assets-table :deep(.v-data-table__selected) {
  background-color: rgba(33, 150, 243, 0.1) !important;
}

.assets-table :deep(.v-simple-checkbox) {
  margin: 0;
}

.assets-table :deep(.v-simple-checkbox--disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Футер с выделением */
.selection-footer {
  background-color: #e3f2fd;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
}

.selection-footer :deep(.v-chip) {
  font-size: 0.7rem !important;
  height: 20px !important;
}

.selection-footer :deep(.v-btn) {
  font-size: 0.7rem !important;
  min-height: 26px !important;
  padding: 0 8px !important;
}

.selection-footer :deep(.v-btn .v-icon) {
  font-size: 0.9rem !important;
}

/* Стандартный футер таблицы */
.assets-table :deep(.v-data-footer) {
  padding: 4px 8px !important;
  min-height: 36px !important;
}

/* Адаптивность */
@media (max-width: 960px) {
  .assets-table {
    --description-width: 200px;
  }

  .asset-type-content {
    flex-wrap: nowrap;
  }
}

@media (max-width: 600px) {
  .assets-table {
    --table-max-height: calc(100vh - 400px);
    --badge-height: 16px;
  }

  .asset-type-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .asset-badges {
    margin: 2px 0 0 0;
  }

  .arrest-badge,
  .pledge-badge {
    font-size: 0.6rem;
  }
}

/* Оптимизация для печати */
@media print {
  .assets-table :deep(.v-data-table__wrapper) {
    max-height: none !important;
    overflow: visible;
  }

  .arrest-badge,
  .pledge-badge,
  .action-menu {
    display: none !important;
  }
}
</style>