<!-- AssetList.vue -->
<template>
  <div>
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
              :key="getAssetKey(asset, index)"
              :class="{'joint-asset-panel': isJointAsset(asset)}"
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
              <asset-form
                  :ref="`assetForm${getAssetKey(asset, index)}`"
                  :asset="asset"
                  :disabled="isJointAsset(asset) || !isAssetBelongsToCurrentPerson(asset)"
                  @update:asset="updateAsset(index, $event)"
              ></asset-form>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <slot name="actions" :addAsset="addAsset" :triggerJsonUpload="triggerJsonUpload">
          <v-btn @click="addAsset" color="primary" class="mt-4">
            <v-icon left>mdi-plus</v-icon>
            Добавить имущество
          </v-btn>
          <v-btn @click="triggerJsonUpload" color="primary" class="mt-4 ml-4">
            <v-icon left>mdi-file-upload</v-icon>
            Загрузить из JSON
          </v-btn>
        </slot>

        <input
            type="file"
            ref="jsonFileInput"
            accept=".json"
            style="display: none"
            @change="handleJsonFileUpload"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
import moment from 'moment';
import AssetForm from './AssetForm.vue';

export default {
  name: 'AssetList',
  components: {
    AssetForm
  },
  props: {
    assets: {
      type: Array,
      default: () => []
    },
    currentPersonId: {
      type: [String, Number],
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      assetFilter: 'all',
      expandedAssetPanels: [],
      editedAssets: []
    };
  },
  computed: {
    filteredAssets() {
      if (this.assetFilter === 'all') {
        return this.editedAssets;
      } else if (this.assetFilter === 'personal') {
        return this.editedAssets.filter(asset =>
            asset.ownership_type === 'personal'
        );
      } else if (this.assetFilter === 'joint') {
        return this.editedAssets.filter(asset =>
            asset.ownership_type === 'joint'
        );
      }
      return [];
    }
  },
  watch: {
    assets: {
      immediate: true,
      handler(newVal) {
        this.editedAssets = cloneDeep(newVal);
      }
    },
    editedAssets: {
      deep: true,
      handler(newVal) {
        this.$emit('update:assets', newVal);
      }
    },
    assetFilter() {
      this.expandedAssetPanels = [];
    }
  },
  methods: {
    getAssetKey(asset, index) {
      return asset.id ? `id-${asset.id}` : `index-${index}`;
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
      return !asset.id || asset.owner === this.currentPersonId;
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
      if (dateString.includes('-')) {
        return moment(dateString, 'YYYY-MM-DD').format('DD.MM.YYYY');
      } else if (dateString.includes('.')) {
        return dateString;
      }
      return dateString;
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
        ownership_type: 'personal'
      };

      this.editedAssets.push(newAsset);
      this.expandedAssetPanels.push(this.editedAssets.length - 1);
    },

    updateAsset(index, updatedAsset) {
      const asset = this.filteredAssets[index];
      const realIndex = this.editedAssets.findIndex(a =>
          (a.id && a.id === asset.id) || a === asset
      );

      if (realIndex !== -1) {
        this.$set(this.editedAssets, realIndex, updatedAsset);
      }
    },

    removeAsset(index) {
      const asset = this.filteredAssets[index];
      const originalIndex = this.editedAssets.findIndex(a =>
          (a.id && a.id === asset.id) || a === asset
      );

      if (originalIndex !== -1) {
        this.editedAssets.splice(originalIndex, 1);
        this.expandedAssetPanels = this.expandedAssetPanels
            .map(i => i > index ? i - 1 : i)
            .filter(i => i !== index);
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
        this.$emit('notification', {
          message: 'Имущество успешно загружено из JSON',
          type: 'success'
        });
      } catch (error) {
        console.error('Ошибка при загрузке JSON:', error);
        this.$emit('notification', {
          message: `Ошибка при загрузке JSON: ${error.message}`,
          type: 'error'
        });
      } finally {
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

    async processJsonAssets(jsonData) {
      if (!jsonData.assets || !Array.isArray(jsonData.assets)) {
        throw new Error('В JSON отсутствует массив assets');
      }

      const AssetSchemas = (await import('@/const/dataTypes')).AssetSchemas;

      const processedAssets = jsonData.assets.map((jsonAsset, index) => {
        return this.transformJsonAsset(jsonAsset, AssetSchemas, index);
      });

      const startIndex = this.editedAssets.length;
      this.editedAssets.push(...processedAssets);

      processedAssets.forEach((_, i) => {
        this.expandedAssetPanels.push(startIndex + i);
      });

      return processedAssets.length;
    },

    transformJsonAsset(jsonAsset, AssetSchemas, index) {
      const categoryMapping = {
        'движимое имущество': 'Движимое имущество',
        'недвижимое имущество': 'Недвижимое имущество',
        'денежные средства': 'Денежные средства',
        'иное имущество': 'Иное имущество'
      };

      const statusMapping = {
        'active': 'active',
        'inactive': 'inactive',
        'leased': 'leased'
      };

      let assetType = jsonAsset.type;
      if (!AssetSchemas[assetType]) {
        const similarType = Object.keys(AssetSchemas).find(key =>
            key.toLowerCase() === assetType.toLowerCase()
        );
        if (similarType) {
          assetType = similarType;
        } else {
          throw new Error(`Неизвестный тип имущества: ${assetType}`);
        }
      }

      const formatDate = (dateString) => {
        if (!dateString) return null;
        try {
          return moment(dateString, 'YYYY-MM-DD').format('DD.MM.YYYY');
        } catch (error) {
          return dateString;
        }
      };

      const asset = {
        id: null,
        category: categoryMapping[jsonAsset.category] || jsonAsset.category,
        asset_type: assetType,
        acquisition_date: formatDate(jsonAsset.acquisition_date),
        disposal_date: formatDate(jsonAsset.disposal_date),
        status: statusMapping[jsonAsset.status] || jsonAsset.status,
        carrying_cost: jsonAsset.carrying_cost || 0,
        market_cost: jsonAsset.market_cost || 0,
        details: {},
        ownership_type: jsonAsset.ownership_type || 'personal'
      };

      if (jsonAsset.details) {
        const schema = AssetSchemas[assetType];

        Object.keys(jsonAsset.details).forEach(key => {
          const value = jsonAsset.details[key];

          if (schema.properties && schema.properties[key]) {
            const fieldSchema = schema.properties[key];

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
            asset.details[key] = value;
          }
        });
      }

      asset.originalIndex = index;
      return asset;
    },

    validateAssets() {
      let isValid = true;
      const assetForms = this.$refs;

      Object.keys(assetForms).forEach(key => {
        if (assetForms[key] && assetForms[key][0] && typeof assetForms[key][0].validate === 'function') {
          const assetValid = assetForms[key][0].validate();
          if (!assetValid) {
            isValid = false;
          }
        }
      });

      return isValid;
    }
  }
}
</script>

<style scoped>
.joint-asset-panel {
  border-left: 4px solid #1976d2;
}
</style>