<template>
  <v-app class="main-app">
    <SystemUpdateNotice></SystemUpdateNotice>
    <v-navigation-drawer
        app
        v-model="drawer"
        mini-variant
        height="95vh"
        permanent
        expand-on-hover
        mini-variant-width="50"
        :clipped="$vuetify.breakpoint.mdAndUp"
    >
      <v-list rounded>
        <v-list-item>
          <v-list-item-content v-if="userData.profile">
            <v-select
                :items="userData.profile['available_organization']"
                item-text="name"
                item-value="uuid"
                v-model="activeOrganization"
                @change="changeActiveOrganization"
            ></v-select>
          </v-list-item-content>
        </v-list-item>
        <v-list-item-group color="primary" v-if="userData.profile">
          <template v-for="(system, id) in userData.profile.service">
            <v-list-item v-if="system.app_name"
                         :key="id"
                         :to="{name: system.app_name}"
            >
              <v-list-item-icon v-if="system.app_name === 'money'">
                <span class="money-icon"></span>
              </v-list-item-icon>
              <v-list-item-icon v-else>
                <v-icon v-text="system.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="system.name"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-else
                         :key="id"
            >
              <v-list-item-icon>
                <v-icon v-text="system.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="system.name"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <v-list-item :to="{name: 'event-calendar'}">
            <v-list-item-icon>
              <v-icon>mdi-calendar-clock</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Календарь</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <!--          <v-list-item :to="{name: 'background-task'}">-->
          <!--            <v-list-item-icon>-->
          <!--              <v-icon>mdi-view-list</v-icon>-->
          <!--            </v-list-item-icon>-->
          <!--            <v-list-item-content>-->
          <!--              <v-list-item-title>Фоновые задания</v-list-item-title>-->
          <!--            </v-list-item-content>-->
          <!--          </v-list-item>-->
          <v-list-item :to="{name: 'documentGenerator'}">
            <v-list-item-icon>
              <v-icon>mdi-file-document-edit</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Документы</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item :to="{name: 'wiki'}">
            <v-list-item-icon>
              <v-icon>mdi-wikipedia</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Вики</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item :to="{name: 'syncMain'}">
            <v-list-item-icon>
              <v-icon left>mdi-database-sync</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Синхронизация</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <!--          <v-list-item :to="{name: 'document-flow'}">-->
          <!--            <v-list-item-icon>-->
          <!--              <v-icon>mdi-file-document-edit</v-icon>-->
          <!--            </v-list-item-icon>-->
          <!--            <v-list-item-content>-->
          <!--              <v-list-item-title>Документы (v2)</v-list-item-title>-->
          <!--            </v-list-item-content>-->
          <!--          </v-list-item>-->
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app dense height="35px">
      <v-row justify="end">
        <v-col md="3">{{ new Date().toLocaleDateString() }}</v-col>
        <v-col md="3" id="user-info">
          <v-menu
              open-on-hover
              top
              offset-y
          >
            <template v-slot:activator="{ on, attrs }">
              <span v-bind="attrs" v-on="on" v-if="userData.first_name && userData.last_name">
                {{ userData.first_name }} {{ userData.last_name }}
              </span>
              <span v-bind="attrs" v-on="on" v-else> {{ userData.username }} </span>
            </template>
          </v-menu>
          <span> | <a @click="logout">Выход</a></span>
        </v-col>
      </v-row>
    </v-app-bar>

    <v-main class="main-content">
      <router-view></router-view>

      <!-- Основная панель Dashboard -->
      <v-container v-if="$route.name === 'crm' || $route.name === 'dashboard'" fluid class="dashboard-container">
        <v-row class="dashboard-row">
          <!-- Левая колонка: Краткая информация -->
          <v-col cols="12" md="4" class="sidebar-column">
            <v-card class="dashboard-card sidebar-card" elevation="2">
              <v-card-title class="card-title">
                <v-icon left>mdi-clipboard-list-outline</v-icon>
                <span class="title-text">Задачи</span>
              </v-card-title>
              <v-card-text class="sidebar-content">
                <div class="empty-section">
                  <v-icon class="empty-icon">mdi-clipboard-text-outline</v-icon>
                  <p class="empty-text">Нет активных задач</p>
                </div>
              </v-card-text>
            </v-card>

            <v-card class="dashboard-card sidebar-card mt-4" elevation="2">
              <v-card-title class="card-title">
                <v-icon left>mdi-calendar-clock</v-icon>
                <span class="title-text">События</span>
              </v-card-title>
              <v-card-text class="sidebar-content">
                <div class="empty-section">
                  <v-icon class="empty-icon">mdi-calendar-blank</v-icon>
                  <p class="empty-text">Нет предстоящих событий</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Правая колонка: Вкладки "Имущество и сделки" -->
          <v-col cols="12" md="8" class="main-column">
            <v-card class="dashboard-card assets-card" elevation="2">
              <!-- Вкладки -->
              <v-tabs v-model="activeTab" background-color="#f5f5f5" grow>
                <v-tab>
                  <v-icon left>mdi-home-analytics</v-icon>
                  Имущество
                </v-tab>
                <v-tab>
                  <v-icon left>mdi-handshake</v-icon>
                  Сделки
                </v-tab>
                <v-tabs-items v-model="activeTab" class="tabs-content">
                  <v-tab-item>
                    <div class="tab-pane">
                      <!-- Фильтры и поиск для имущества -->
                      <v-row class="ma-2 filters-row">
                        <v-col cols="12" md="4">
                          <v-autocomplete
                              v-model="assetFilter"
                              :items="assetFilters"
                              label="Фильтр по типу"
                              dense
                              outlined
                              hide-details
                              clearable
                          ></v-autocomplete>
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-autocomplete
                              v-model="categoryFilter"
                              :items="assetCategories"
                              label="Фильтр по категории"
                              dense
                              outlined
                              hide-details
                              clearable
                          ></v-autocomplete>
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-text-field
                              v-model="searchQuery"
                              label="Поиск имущества"
                              prepend-inner-icon="mdi-magnify"
                              dense
                              outlined
                              hide-details
                              clearable
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <!-- Кнопки действий для имущества -->
                      <v-row class="mb-2 mr-2">
                        <v-col cols="12" class="d-flex align-center">
                          <v-spacer></v-spacer>
                          <v-btn small color="primary" @click="refreshAssets" :loading="loadingAssets" class="mr-2">
                            <v-icon left>mdi-refresh</v-icon>
                            Обновить
                          </v-btn>
                          <v-btn small color="primary" @click="addAsset">
                            <v-icon left>mdi-plus</v-icon>
                            Добавить имущество
                          </v-btn>
                        </v-col>
                      </v-row>

                      <!-- Таблица имущества с пагинацией -->
                      <AssetsTable
                          :items="assets"
                          :headers="assetHeaders"
                          :loading="loadingAssets"
                          :search="searchQuery"
                          :filter-type="assetFilter"
                          :filter-category="categoryFilter"
                          :page.sync="assetPage"
                          :items-per-page.sync="assetItemsPerPage"
                          @edit="showAssetDetails"
                          @delete="deleteAsset"
                          @estate-process="openEstateProcessDialog"
                          @add="addAsset"
                      />
                    </div>
                  </v-tab-item>

                  <!-- Контент вкладки "Сделки" -->
                  <v-tab-item>
                    <div class="tab-pane">
                      <!-- Фильтры и поиск для сделок -->
                      <v-row class="ma-2 filters-row">
                        <v-col cols="12" md="4">
                          <v-autocomplete
                              v-model="dealFilter"
                              :items="dealFilters"
                              label="Фильтр по типу"
                              dense
                              outlined
                              hide-details
                              clearable
                          ></v-autocomplete>
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-autocomplete
                              v-model="dealCategoryFilter"
                              :items="assetCategories"
                              label="Фильтр по категории"
                              dense
                              outlined
                              hide-details
                              clearable
                          ></v-autocomplete>
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-text-field
                              v-model="dealSearchQuery"
                              label="Поиск сделок"
                              prepend-inner-icon="mdi-magnify"
                              dense
                              outlined
                              hide-details
                              clearable
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <!-- Кнопки для сделок -->
                      <v-row class="mb-2 mr-2">
                        <v-col cols="12" class="d-flex align-center">
                          <v-spacer></v-spacer>
                          <v-btn small color="primary" @click="refreshAssets" :loading="loadingAssets" class="mr-2">
                            <v-icon left>mdi-refresh</v-icon>
                            Обновить
                          </v-btn>
                        </v-col>
                      </v-row>

                      <!-- Таблица сделок -->
                      <AssetsTable
                          :items="disposalAssets"
                          :headers="dealHeaders"
                          :loading="loadingAssets"
                          :search="dealSearchQuery"
                          :filter-type="dealFilter"
                          :filter-category="dealCategoryFilter"
                          :page.sync="dealPage"
                          :items-per-page.sync="dealItemsPerPage"
                          @edit="showAssetDetails"
                          :hide-actions="true"
                      />
                    </div>
                  </v-tab-item>
                </v-tabs-items>
              </v-tabs>

              <!-- Контент вкладок -->

            </v-card>

            <!-- Модальное окно деталей имущества -->
            <v-dialog v-model="showAssetDialog" max-width="800px" persistent>
              <v-card v-if="selectedAsset">
                <v-card-title>
                  <span class="headline">Редактирование имущества</span>
                  <v-spacer></v-spacer>
                  <v-chip :color="getStatusColor(selectedAsset.status)" small>
                    {{ getStatusDisplay(selectedAsset.status) }}
                  </v-chip>
                </v-card-title>
                <v-card-text>
                  <AssetForm
                      ref="assetForm"
                      :asset="selectedAsset"
                      :disabled="isJointAsset(selectedAsset)"
                  />
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" text @click="showAssetDialog = false">Закрыть</v-btn>
                  <v-btn
                      color="primary"
                      @click="saveAsset"
                      :disabled="isJointAsset(selectedAsset) || savingAsset"
                      :loading="savingAsset"
                  >
                    Сохранить
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
        </v-row>
      </v-container>
      <createDocument></createDocument>
      <v-dialog v-model="showDeleteDialog" max-width="500px" persistent>
        <v-card>
          <v-card-title class="headline">Подтверждение удаления</v-card-title>
          <v-card-text v-if="assetToDelete">
            Вы уверены, что хотите удалить имущество:
            <strong>{{ assetToDelete.asset_type }} ({{
                assetToDelete.formatted_description || assetToDelete.details.address || assetToDelete.details.brand_model || 'Без названия'
              }})</strong>?
            <br><br>
            <v-alert type="warning" dense outlined class="mt-2">
              Это действие нельзя отменить. Все связанные данные (залоги, аресты) также будут удалены.
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" text @click="cancelDelete" :disabled="deletingAsset">
              Отмена
            </v-btn>
            <v-btn color="error" @click="confirmDeleteAsset" :loading="deletingAsset" :disabled="deletingAsset">
              <v-icon left>mdi-delete</v-icon>
              Удалить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <EstateProcessDialog
          v-if="assetForEstateProcess"
          v-model="showEstateProcessDialog"
          :estate-process="estateProcessData"
          :is-editing="isEditingEstateProcess"
          :project-id="assetForEstateProcess.owner_project"
          @cancel="closeEstateProcessDialog"
          @save="saveEstateProcess"
      />
    </v-main>
  </v-app>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import SystemUpdateNotice from "@/components/UI/SystemUpdateNotice.vue";
import createDocument from "@/components/CRM/PaperFlow/modal/createDocument.vue";
import AssetForm from "@/components/referenceBook/Assets/AssetForm.vue";
import {eventBus} from "@/bus";
import EstateProcessDialog from "@/components/referenceBook/Assets/EstateProcessDialog.vue";
import AssetsTable from "@/components/referenceBook/Assets/AssetsTable.vue";

export default {
  name: "Dashboard",
  components: {AssetsTable, SystemUpdateNotice, createDocument, AssetForm, EstateProcessDialog},
  data() {
    return {
      activeTab: 0,
      loadingAssets: false,
      drawer: null,
      activeOrganization: '',
      // Для вкладки "Имущество"
      searchQuery: '',
      assetFilter: null,
      categoryFilter: null,
      assetPage: 1,
      assetItemsPerPage: 10,
      // Для вкладки "Сделки"
      dealSearchQuery: '',
      dealFilter: null,
      dealCategoryFilter: null,
      dealPage: 1,
      dealItemsPerPage: 10,

      deals: [],
      // Фильтры
      assetFilters: [
        {text: 'Все', value: null},
        {text: 'Личное', value: 'personal'},
        {text: 'Совместное', value: 'joint'},
        {text: 'Отчужденное', value: 'disposal'},
      ],
      dealFilters: [
        {text: 'Все сделки', value: null},
        {text: 'Личное', value: 'personal'},
        {text: 'Совместное', value: 'joint'},
      ],

      // Заголовки таблицы
      assetHeaders: [
        {text: 'Тип имущества', value: 'asset_type', sortable: true, width: '25%'},
        {text: 'Доля владения', value: 'is_joint_property', sortable: true, width: '18%'},
        {text: 'Дата приобретения', value: 'acquisition_date', sortable: true, width: '15%'},
        {text: 'Владелец', value: 'owner_name', sortable: true, width: '22%'},
        {text: 'Действия', value: 'actions', sortable: false, align: 'center', width: '8%'}
      ],
      dealHeaders: [
        {text: 'Тип имущества', value: 'asset_type', sortable: true, width: '25%'},
        {text: 'Доля владения', value: 'is_joint_property', sortable: true, width: '18%'},
        {text: 'Статус сделки', value: 'dispute_status', width: '15%', getter: item => item.dispute_transactions},
        {text: 'Дата приобретения', value: 'acquisition_date', sortable: true, width: '15%'},
        {text: 'Дата отчуждения', value: 'disposal_date', sortable: true, width: '15%'},
        {text: 'Владелец', value: 'owner_name', sortable: true, width: '22%'},
        {text: 'Действия', value: 'actions', sortable: false, align: 'center', width: '8%'}
      ],
      // Modal Asset
      showAssetDialog: false,
      selectedAsset: null,
      savingAsset: false,
      showDeleteDialog: false,
      assetToDelete: null,
      deletingAsset: false,
      showEstateProcessDialog: false,
      assetForEstateProcess: null,
      estateProcessData: {
        decision: 'IN',
        exclusion_ground: null,
        legal_reference: '',
        document_reference: null,
        decision_date: null,
        is_active: true
      },
      isEditingEstateProcess: false
    }
  },
  computed: {
    ...mapGetters({
      userData: 'authUserData',
      dashboardTaskList: 'dashboardUserTaskList',
      assets: 'assetsList',
      disposalAssets: 'disposalAssetsList'
    }),

    // Категории имущества из dataTypes.js
    assetCategories() {
      return [
        "Недвижимое имущество",
        "Движимое имущество",
        "Денежные средства",
        "Дебиторская задолженность",
        "Ценные бумаги",
        "Акции и участие",
        "Иное имущество"
      ]
    },

    filteredAssets() {
      let filtered = [...this.assets]

      // Фильтр по типу (личное/совместное)
      if (this.assetFilter === 'personal') {
        filtered = filtered.filter(asset => !asset.is_joint_property && asset.ownership_type === 'personal')
      } else if (this.assetFilter === 'joint') {
        filtered = filtered.filter(asset => asset.is_joint_property || asset.ownership_type === 'joint')
      } else if (this.assetFilter === 'disposal') {
        filtered = filtered.filter(asset => asset.disposal_date)
      }

      // Фильтр по категории
      if (this.categoryFilter) {
        filtered = filtered.filter(asset => asset.category_display === this.categoryFilter)
      }

      return filtered
    },
    filteredDeals() {
      let filtered = [...this.disposalAssets]

      // Фильтр по типу (личное/совместное)
      if (this.dealFilter === 'personal') {
        filtered = filtered.filter(asset => !asset.is_joint_property && asset.ownership_type === 'personal')
      } else if (this.dealFilter === 'joint') {
        filtered = filtered.filter(asset => asset.is_joint_property || asset.ownership_type === 'joint')
      }

      // Фильтр по категории
      if (this.dealCategoryFilter) {
        filtered = filtered.filter(asset => asset.category_display === this.dealCategoryFilter)
      }

      return filtered
    },

    // Статистика по имуществу
    assetStats() {
      const total = this.assets.length
      const active = this.assets.filter(a => a.status === 'active').length
      const joint = this.assets.filter(a => a.is_joint_property || a.ownership_type === 'joint').length
      const realEstate = this.assets.filter(a => [
        'квартира', 'дом', 'земельный участок', 'гараж'
      ].includes(a.asset_type)).length

      return [
        {title: 'Всего имущества', value: total, percentage: 100, color: 'primary'},
        {title: 'Активное', value: active, percentage: total > 0 ? (active / total) * 100 : 0, color: 'success'},
        {title: 'Совместное', value: joint, percentage: total > 0 ? (joint / total) * 100 : 0, color: 'info'},
        {
          title: 'Недвижимость',
          value: realEstate,
          percentage: total > 0 ? (realEstate / total) * 100 : 0,
          color: 'orange'
        }
      ]
    }
  },
  methods: {
    ...mapActions({
      getDashboardTaskList: 'getDashboardTaskList',
      fetchAssets: 'fetchAssets',
    }),

    logout() {
      this.$store.dispatch('logout', this.userData.pk)
          .then(() => {
            this.$router.push('/login')
          })
    },

    changeActiveOrganization(item) {
      let formData = new FormData()
      formData.set('uuid', item)
      this.$store.dispatch('changeOrganization', formData).then(() => {
        location.reload()
      })
    },

    async loadAssets() {
      try {
        this.loadingAssets = true
        await this.fetchAssets()
      } catch (error) {
        console.error('Ошибка при загрузке имущества:', error)
      } finally {
        this.loadingAssets = false
      }
    },

    refreshAssets() {
      this.loadAssets()
    },

    addAsset() {
      eventBus.$emit('newDocument', {useTemplate: true, templateId: 6})
    },

    async saveAsset() {
      if (this.$refs.assetForm && this.$refs.assetForm.validate()) {
        this.savingAsset = true;
        try {
          const updatedAsset = this.$refs.assetForm.getAssetData();

          // Вызовите действие Vuex для обновления имущества
          await this.$store.dispatch('updateAsset', updatedAsset);

          // Обновите список имущества
          await this.loadAssets();

          this.showAssetDialog = false;

          await this.$store.dispatch('snackbar/showSuccess', 'Имущество успешно обновлено');

        } catch (error) {
          console.error('Ошибка при сохранении имущества:', error);

          // Вариант 1: используем хелпер showError
          let errorMessage = 'Ошибка при сохранении имущества';
          if (error.response && error.response.data) {
            const data = error.response.data;
            if (data.error) {
              errorMessage = data.error;
            } else if (data.details) {
              errorMessage = typeof data.details === 'string'
                  ? data.details
                  : JSON.stringify(data.details);
            }
          }

          await this.$store.dispatch('snackbar/showError', errorMessage);

        } finally {
          this.savingAsset = false;
        }
      }
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

    hasActiveStatuses(asset) {
      const hasArrests = asset.arrest_status_info && asset.arrest_status_info.arrest_count > 0;
      const hasPledges = asset.pledge_status_info && asset.pledge_status_info.pledge_count > 0;
      return hasArrests || hasPledges;
    },

    showAssetDetails(asset) {
      this.selectedAsset = {...asset};
      this.showAssetDialog = true;
    },

    async deleteAsset(asset) {
      // Сохраняем актив для удаления и показываем диалог
      this.assetToDelete = {...asset};
      this.showDeleteDialog = true;
    },

    async confirmDeleteAsset() {
      if (!this.assetToDelete) return;

      this.deletingAsset = true;
      try {
        await this.$store.dispatch('deleteAsset', this.assetToDelete);
        await this.loadAssets();

        await this.$store.dispatch('snackbar/showSuccess', 'Имущество успешно удалено');
        this.showDeleteDialog = false;
        this.assetToDelete = null;
      } catch (error) {
        console.error('Ошибка при удалении имущества:', error);

        let errorMessage = 'Ошибка при удалении имущества';
        if (error.response && error.response.data) {
          const data = error.response.data;
          if (data.error) {
            errorMessage = data.error;
          } else if (data.details) {
            errorMessage = typeof data.details === 'string'
                ? data.details
                : JSON.stringify(data.details);
          }
        }

        await this.$store.dispatch('snackbar/showError', errorMessage);
      } finally {
        this.deletingAsset = false;
      }
    },

    cancelDelete() {
      this.showDeleteDialog = false;
      this.assetToDelete = null;
      this.deletingAsset = false;
    },

    isJointAsset(asset) {
      return asset.is_joint_property || asset.ownership_type === 'joint';
    },

    getAssetPaginationInfo() {
      const start = (this.assetPage - 1) * this.assetItemsPerPage + 1
      const end = Math.min(this.assetPage * this.assetItemsPerPage, this.filteredAssets.length)
      return `${start}-${end} из ${this.filteredAssets.length}`
    },

    truncateDescription(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    openEstateProcessDialog(asset) {
      this.assetForEstateProcess = {...asset};
      this.isEditingEstateProcess = !!asset.estate_process;

      if (asset.estate_process) {
        this.estateProcessData = {...asset.estate_process};
      } else {
        this.estateProcessData = {
          decision: 'IN',
          exclusion_ground: null,
          legal_reference: '',
          document_reference: null,
          decision_date: new Date().toLocaleDateString('ru-RU'),
          is_active: true
        };
      }

      this.showEstateProcessDialog = true;
    },

    closeEstateProcessDialog() {
      this.showEstateProcessDialog = false;
      this.assetForEstateProcess = null;
    },
    async saveEstateProcess(estateData) {
      try {
        const updatedAsset = {
          ...this.assetForEstateProcess,
          estate_process: estateData
        };

        await this.$store.dispatch('updateAsset', updatedAsset);
        await this.loadAssets();

        this.closeEstateProcessDialog();
        await this.$store.dispatch('snackbar/showSuccess', 'Решение по конкурсной массе успешно сохранено');

      } catch (error) {
        console.error('Ошибка при сохранении решения по конкурсной массе:', error);

        let errorMessage = 'Ошибка при сохранении решения по конкурсной массе';
        if (error.response && error.response.data) {
          const data = error.response.data;
          if (data.error) {
            errorMessage = data.error;
          } else if (data.details) {
            errorMessage = typeof data.details === 'string'
                ? data.details
                : JSON.stringify(data.details);
          }
        }

        await this.$store.dispatch('snackbar/showError', errorMessage);
      }
    }

  },
  async created() {
    await this.$store.dispatch('getProjectList')
    await this.$store.dispatch('checkAuth').then(async (data) => {
      await this.$store.dispatch('getSystemUpdateNotice').then(notice => {
        let showNotice = notice['display_user'].filter(obj => obj.uuid === this.userData.uuid)
        if (showNotice && showNotice.length) {
          eventBus.$emit('showSystemUpdateMessage', {notice, uuid: this.userData.uuid})
        }
      })
    })
    await this.getDashboardTaskList()
    await this.loadAssets()

    // Безопасный доступ к данным профиля
    if (this.userData && this.userData.profile && this.userData.profile.active_organization) {
      this.activeOrganization = this.userData.profile.active_organization.uuid
    }
  }
}
</script>

<style scoped>
/* Уменьшаем высоту контейнеров и карточек */
.dashboard-container {
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.dashboard-row {
  min-height: calc(100vh - 120px);
}

/* Уменьшаем высоту боковых карточек */
.sidebar-card {
  max-height: 28%;
  min-height: 180px;
}

/* Уменьшаем заголовки карточек */
.card-title {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.9rem !important; /* Уменьшаем шрифт */
  font-weight: 600;
  padding: 10px 16px !important; /* Уменьшаем отступы */
  min-height: 40px !important; /* Фиксируем высоту */
}

/* Уменьшаем размер иконок в заголовках */
.card-title .v-icon {
  font-size: 1.2rem !important;
}

/* Уменьшаем текст заголовков */
.title-text {
  font-size: 0.875rem !important;
  font-weight: 600;
}

/* Таблица с фиксированной высотой и скроллом */
.assets-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  font-size: 0.7rem !important; /* Уменьшаем общий шрифт таблицы */
}

/* Фиксируем высоту таблицы для скролла */
.assets-table >>> .v-data-table__wrapper {
  max-height: calc(100vh - 450px) !important;
  overflow-y: auto;
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

/* Уменьшаем кнопки */
.details-btn {
  min-width: 28px !important;
  width: 28px !important;
  height: 28px !important;
}

.details-btn .v-icon {
  font-size: 1rem !important;
}

/* Уменьшаем элементы управления пагинацией */
.assets-table >>> .v-data-footer {
  padding: 8px 16px !important;
  min-height: 48px !important;
}

.assets-table >>> td {
  font-size: 0.8rem !important;
  height: 40px !important;
}

.assets-table >>> .v-data-footer__select {
  font-size: 0.7rem !important;
}

.assets-table >>> .v-data-footer__pagination {
  font-size: 0.8rem !important;
}


/* Уменьшаем кнопки действий */
.v-btn {
  font-size: 0.8rem !important;
  min-height: 32px !important;
  padding: 4px 12px !important;
}

.v-btn .v-icon {
  font-size: 1rem !important;
}

/* Уменьшаем вкладки */
.v-tab {
  font-size: 0.85rem !important;
  min-height: 42px !important;
}

.v-tab .v-icon {
  font-size: 1.2rem !important;
}

/* Уменьшаем чипы на вкладках */
.v-chip {
  font-size: 0.6rem !important;
  height: 18px !important;
}

/* Уменьшаем пустые секции */
.empty-section {
  padding: 20px;
}

.empty-icon {
  font-size: 2rem !important;
}

.empty-text {
  font-size: 0.85rem !important;
}

/* Уменьшаем содержимое сайдбара */
.sidebar-content {
  padding: 12px 16px !important;
}

.asset-type-with-description {
  display: flex;
  flex-direction: column;
  gap: 4px;
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


.asset-type-with-badges {
  display: flex;
  align-items: center;
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

.action .v-list-item__icon {
  margin-right: 8px;
  margin-left: -8px;
}

.action .v-list-item__title {
  font-size: 0.875rem;
}

/* Адаптивность для мобильных */
@media (max-width: 960px) {
  .dashboard-container {
    padding: 12px;
  }

  .card-title {
    padding: 8px 12px !important;
    font-size: 0.85rem !important;
  }

  .assets-table >>> .v-data-table__wrapper {
    max-height: calc(100vh - 500px) !important;
  }
}

@media (max-width: 600px) {
  .dashboard-container {
    padding: 8px;
  }

  .card-title {
    padding: 6px 10px !important;
    font-size: 0.8rem !important;
    min-height: 36px !important;
  }

  .v-btn {
    font-size: 0.75rem !important;
    padding: 2px 8px !important;
  }

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