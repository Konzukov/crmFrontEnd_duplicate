[file name]: AssetManagement.vue
<template>
  <div>
    <v-chip-group v-model="assetFilter" mandatory class="mb-4">
      <v-chip filter value="all">Все</v-chip>
      <v-chip filter value="personal">Личное</v-chip>
      <v-chip filter value="joint">Совместное</v-chip>
    </v-chip-group>

    <v-expansion-panels multiple v-model="expandedAssetPanels" flat class="identifier-panel">
      <v-expansion-panel
          v-for="(asset, index) in filteredAssets"
          :key="asset.id || index"
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
                @click.stop="$emit('remove-asset', index)"
                class="mr-1"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>

            <v-icon>mdi-chevron-down</v-icon>
          </template>
        </v-expansion-panel-header>

        <v-expansion-panel-content>
          <AssetForm
              :asset="asset"
              :disabled="isJointAsset(asset) || !isAssetBelongsToCurrentPerson(asset)"
              @update:asset="onAssetUpdate(index, $event)"
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-btn @click="$emit('add-asset')" color="primary" class="mt-4">
      <v-icon left>mdi-plus</v-icon>
      Добавить имущество
    </v-btn>
    <v-btn @click="$emit('import-json')" color="primary" class="mt-4 ml-4">
      <v-icon left>mdi-file-upload</v-icon>
      Загрузить из JSON
    </v-btn>
  </div>
</template>

<script>
import moment from 'moment'
import AssetForm from './AssetForm.vue'

export default {
  name: 'AssetManagement',
  components: {
    AssetForm
  },
  props: {
    assets: {
      type: Array,
      default: () => []
    },
    currentPersonId: {
      type: [Number, String],
      default: null
    }
  },
  data: () => ({
    assetFilter: 'all',
    expandedAssetPanels: [],
    assetCategories: [
      "Недвижимое имущество",
      "Движимое имущество",
      "Денежные средства",
      "Дебиторская задолженность",
      "Ценные бумаги",
      "Акции и участие",
      "Иное имущество"
    ],
    assetStatuses: [
      { value: "active", text: "Активный" },
      { value: "inactive", text: "Неактивный" },
      { value: "disputed", text: "Оспаривается" },
      { value: "leased", text: "В аренде" },
      { value: "under repair", text: "На ремонте" },
      { value: "outstanding", text: "Просрочен" },
      { value: "pledged", text: "В залоге" },
      { value: "arrested", text: "Арестован" },
      { value: "pledged_arrested", text: "В залоге и арестован" }
    ]
  }),
  computed: {
    filteredAssets() {
      if (this.assetFilter === 'all') {
        return this.assets || [];
      } else if (this.assetFilter === 'personal') {
        return (this.assets || []).filter(asset =>
            asset.ownership_type === 'personal'
        );
      } else if (this.assetFilter === 'joint') {
        return (this.assets || []).filter(asset =>
            asset.ownership_type === 'joint'
        );
      }
      return [];
    }
  },
  watch: {
    assetFilter() {
      this.expandedAssetPanels = [];
    }
  },
  methods: {
    onAssetUpdate(index, updatedAsset) {
      this.$emit('update-asset', { index, asset: updatedAsset });
    },

    getAssetTitle(asset) {
      if (!asset) return "Имущество";
      const category = asset.category ? `${asset.category}` : "Без категории";
      const type = asset.asset_type ? `${asset.asset_type}` : "Без типа";
      return `${category} - ${type}`;
    },

    isJointAsset(asset) {
      return asset.ownership_type === 'joint' ||
          (asset.joint_property_info && asset.joint_property_info.is_joint) ||
          asset.is_joint_property;
    },

    isAssetBelongsToCurrentPerson(asset) {
      if (!asset.id) return true;
      if (asset.owner === this.currentPersonId) return true;
      return false;
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
        'outstanding': 'error--text',
        'pledged': 'error--text',
        'arrested': 'error--text',
        'pledged_arrested': 'error--text'
      };
      return statusClasses[status] || '';
    },

    formatDate(dateString) {
      if (!dateString) return '';
      if (dateString.includes('-')) {
        return moment(dateString, 'YYYY-MM-DD').format('DD.MM.YYYY');
      } else if (dateString.includes('.')) {
        return dateString;
      }
      return dateString;
    }
  }
}
</script>

<style scoped>
.identifier-panel {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.joint-asset-panel {
  border-left: 3px solid #1976d2 !important;
}

.joint-asset-panel .v-expansion-panel-header {
  background-color: rgba(25, 118, 210, 0.04) !important;
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

.v-chip--x-small {
  height: 16px;
  font-size: 10px;
}
</style>