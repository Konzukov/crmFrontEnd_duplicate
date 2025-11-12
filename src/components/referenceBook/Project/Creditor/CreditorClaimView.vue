<template>
  <v-card :style="collapsed? 'height: 75vh': 'height: 55vh'">
    <v-card-title class="py-2">
      <span class="text-h6">Требования кредиторов</span>
      <v-spacer></v-spacer>
      <v-btn color="primary" small @click="showCreateForm">
        <v-icon small left>mdi-plus</v-icon>
        Добавить
      </v-btn>
    </v-card-title>

    <v-card-text class="py-1">
      <!-- Индикатор загрузки -->
      <div v-if="loading" class="text-center py-2">
        <v-progress-circular indeterminate color="primary" size="20"></v-progress-circular>
        <div class="mt-1">Загрузка данных...</div>
      </div>

      <!-- Сообщение, если данных нет -->
      <div v-else-if="!creditorClaims || creditorClaims.length === 0" class="text-center py-3">
        Нет данных о требованиях кредиторов
      </div>

      <v-expansion-panels v-else multiple v-model="expandedPanels">
        <v-expansion-panel v-for="(group, index) in groupedClaims" :key="index">
          <v-expansion-panel-header class="py-1" disable-icon-rotate>
            <template v-slot:default="{ open }">
              <div class="d-flex align-center">
                <div class="text-body-1 font-weight-medium">{{ group.creditorName }}</div>
                <v-spacer></v-spacer>
                <div class="text-body-2 primary--text mr-2">
                  {{ group.claims.length }} шт.
                </div>
                <div class="text-body-1 primary--text font-weight-bold">
                  {{ group.totalAmount.toLocaleString('ru-RU') }} ₽
                </div>
              </div>
            </template>
          </v-expansion-panel-header>

          <v-expansion-panel-content class="py-0">
            <v-list dense class="py-0">
              <v-list-item v-for="claim in group.claims" :key="claim.id" class="py-1">
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-body-4 ml-5">
                    {{ claim.basis }} ({{ formatDate(claim.date_receipt) }})
                  </v-list-item-title>
                  <!-- Отображение информации об уведомлении -->
                  <div v-if="claim.notification" class="ml-5 mt-1">
                    <v-chip small color="green" text-color="white">
                      <v-icon small left>mdi-bell</v-icon>
                      Уведомление: {{ formatDate(claim.notification.notification_date) }}
                      <span v-if="claim.notification.notification_number">({{ claim.notification.notification_number }})</span>
                    </v-chip>
                  </div>
                </v-list-item-content>

                <v-list-item-action class="my-0 mr-2">
                  <div class="text-body-2 font-weight-medium">{{ claim.claim_amount.toLocaleString('ru-RU') }} ₽</div>
                </v-list-item-action>

                <v-list-item-action class="my-0">
                  <v-btn icon x-small @click="editClaim(claim)">
                    <v-icon x-small>mdi-pencil</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>

              <!-- Кнопка добавления требования для конкретного кредитора -->
              <v-list-item class="py-1">
                <v-list-item-content class="py-0">
                  <v-btn
                      small
                      color="primary"
                      text
                      @click="showCreateFormForCreditor(group.creditorId, group.creditorType, group.creditorName)"
                      class="ml-5"
                  >
                    <v-icon small left>mdi-plus</v-icon>
                    Добавить требование
                  </v-btn>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>

    <!-- Диалог для создания/редактирования требования -->
    <CreateCreditorClaimNew
        ref="createClaimDialog"
        :isEditing="!!selectedClaim"
        :claimToEdit="selectedClaim"
        :preselectedCreditor="preselectedCreditor"
        :availableClaims="creditorClaims"
        @save="onSaveClaim"
        @close="resetDialogState"
    ></CreateCreditorClaimNew>
  </v-card>
</template>

<script>
import {mapGetters, mapActions} from "vuex";
import CreateCreditorClaimNew from "@/components/referenceBook/Project/Creditor/CreateCreditorClaimNew.vue";

export default {
  components: {
    CreateCreditorClaimNew,
  },
  props: ['project', 'collapsed', 'debtor'],
  name: 'CreditoClaimView',
  data: () => ({
    selectedClaim: null,
    expandedPanels: [],
    loading: false,
    preselectedCreditor: null
  }),
  computed: {
    ...mapGetters({
      creditorClaims: 'creditorClaims/creditorClaimsData',
    }),
    groupedClaims() {
      const groups = {};

      if (this.creditorClaims && this.creditorClaims.length > 0) {
        this.creditorClaims.forEach(claim => {
          const creditor = claim.creditor;

          let creditorId, creditorName, creditorType;

          if (creditor && creditor.type === 'LegalEntity') {
            creditorId = `legal_${creditor.id}`;
            creditorName = creditor.name || creditor.fullName || 'Неизвестный кредитор';
            creditorType = 'LegalEntity';
          } else if (creditor && creditor.type === 'PhysicalPerson') {
            creditorId = `physical_${creditor.id}`;
            creditorName = creditor.fullName ||
                `${creditor.last_name || ''} ${creditor.first_name || ''} ${creditor.middle_name || ''}`.trim() ||
                'Неизвестный кредитор';
            creditorType = 'PhysicalPerson';
          } else {
            creditorId = 'unknown';
            creditorName = 'Неизвестный кредитор';
            creditorType = 'unknown';
          }

          if (!groups[creditorId]) {
            groups[creditorId] = {
              creditorId,
              creditorName,
              creditorType,
              claims: [],
              totalAmount: 0
            };
          }

          groups[creditorId].claims.push(claim);
          groups[creditorId].totalAmount += parseFloat(claim.claim_amount) || 0;
        });

        return Object.values(groups).sort((a, b) => b.totalAmount - a.totalAmount);
      }

      return [];
    }
  },
  methods: {
    ...mapActions({
      fetchCreditorClaims: 'creditorClaims/fetchCreditorClaims',
      saveCreditorClaim: 'creditorClaims/saveCreditorClaim'
    }),
    formatDate(date) {
      if (!date) return 'не указана';
      return new Date(date).toLocaleDateString('ru');
    },
    showCreateForm() {
      this.selectedClaim = null;
      this.preselectedCreditor = null;
      this.$refs.createClaimDialog.open(this.debtor);
    },
    showCreateFormForCreditor(creditorId, creditorType, creditorName) {
      this.selectedClaim = null;

      const [, id] = creditorId.split('_');

      this.preselectedCreditor = {
        id: parseInt(id),
        type: creditorType,
        name: creditorName
      };

      this.$refs.createClaimDialog.open(this.debtor);
    },
    editClaim(claim) {
      this.selectedClaim = claim;
      this.preselectedCreditor = null;
      this.$refs.createClaimDialog.open(this.debtor);
    },
    async onSaveClaim() {
      try {
        await this.fetchCreditorClaims(this.project);
        this.resetDialogState();
      } catch (error) {
        console.error('Ошибка при сохранении требования:', error);
      }
    },
    resetDialogState() {
      this.selectedClaim = null;
      this.preselectedCreditor = null;
    }
  },
  async created() {
    if (this.project) {
      this.loading = true;
      try {
        await this.fetchCreditorClaims(this.project);
      } catch (error) {
        console.error('Ошибка загрузки требований:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
>>> .v-expansion-panel-header {
  min-height: 40px !important;
}

>>> .v-expansion-panel-content__wrap {
  padding: 0 8px 8px 8px;
}
</style>