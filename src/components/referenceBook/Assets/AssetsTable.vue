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
  >
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
      <v-chip
          small
          :color="getStatusColor(item.status)"
          text-color="white"
          class="status-chip"
      >
        {{item}}
<!--        {{ getDealStatusText(item.dispute_status) }}-->
      </v-chip>
    </template>

    <!-- Слот для даты приобретения -->
    <template v-slot:item.acquisition_date="{ item }">
      <div class="date-cell">
        {{ item.acquisition_date || '-' }}
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
      <v-divider></v-divider>
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
    }
  },
  data() {
    return {
      currentPage: this.page,
      currentItemsPerPage: this.itemsPerPage,
      disputeStatuses: [
        {value: 'analysis', text: 'Анализ'},
        {value: 'disputed', text: 'Оспаривается'},
        {value: 'not_disputed', text: 'Не оспаривается'},
        {value: 'completed', text: 'Завершено'},
        {value: 'court_decision', text: 'Судебное решение вынесено'},
        {value: 'settled', text: 'Урегулировано'}
      ],
    }
  },
  computed: {
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
    }
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
    }
  },
  methods: {
    // Методы форматирования
    getCategoryColor(is_joint_property) {
      return is_joint_property ? 'success' : 'grey'
    },
    getDealStatusText(status){
      return this.disputeStatuses.find(obj=> obj.value === status).text
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
.assets-table >>> .v-data-table__wrapper {
  max-height: calc(100vh - 450px) !important;
  overflow-y: auto;
}

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

.asset-description {
  font-size: 0.75rem;
  color: #666;
  line-height: 1.2;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.description-text, .address-text {
  cursor: help;
}

.asset-badges {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

/* Бейджи для арестов и залогов */
.arrest-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background-color: #ff5252;
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0 4px;
  cursor: default;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.pledge-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background-color: #4caf50;
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0 4px;
  cursor: default;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Эффекты при наведении */
.arrest-badge:hover {
  background-color: #ff1744;
  transform: scale(1.05);
}

.pledge-badge:hover {
  background-color: #388e3c;
  transform: scale(1.05);
}

/* Уменьшаем размеры чипов */
.category-chip {
  font-size: 0.75rem !important;
  height: 22px !important;
}

.status-chip {
  font-size: 0.75rem !important;
  height: 22px !important;
}

.action .v-list-item__icon {
  margin-right: 8px;
  margin-left: -8px;
}

.action .v-list-item__title {
  font-size: 0.875rem;
}

.date-cell, .owner-info {
  font-size: 0.85rem;
}

/* Адаптивность для мобильных */
@media (max-width: 600px) {
  .asset-type-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .asset-badges {
    margin-left: 0;
    margin-top: 2px;
  }

  .arrest-badge,
  .pledge-badge {
    min-width: 16px;
    height: 16px;
    font-size: 0.6rem;
  }
}
</style>