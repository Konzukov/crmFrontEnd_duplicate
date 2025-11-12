<template>
  <v-dialog v-model="show" width="80vw" scrollable persistent>
    <v-card height="90vh" class="mx-auto">
      <v-toolbar color="primary" dark height="50">
        <v-toolbar-title>
          {{ isEditing ? 'Редактирование требования' : 'Добавление требований' }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="mt-2" style="height: 90%">
        <v-autocomplete
            class="mt-2"
            dense
            outlined
            :items="creditors"
            item-text="name"
            item-value="id"
            label="Кредитор"
            v-model="creditor"
            @change="setCreditor"
            return-object
            required
            :readonly="isEditing"
        ></v-autocomplete>

        <v-expansion-panels flat class="mt-4 mb-4 identifier-panel" multiple v-model="expandedPanels">
          <v-expansion-panel>
            <v-expansion-panel-header>
              Требования кредитора
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <div v-if="claimsList.length === 0" class="text-center py-4">
                <p>Нет добавленных требований</p>
              </div>

              <v-card
                  v-for="(claim, index) in claimsList"
                  :key="index"
                  class="claim-card"
                  :class="{ 'collapsed': claim.collapsed }"
              >
                <v-card-title class="py-1" @click="toggleClaim(index)">
                  <v-icon class="collapse-btn mr-2" :class="{ 'collapsed': claim.collapsed }">
                    mdi-chevron-down
                  </v-icon>
                  <span>Требование #{{ index + 1 }} - {{ claim.basis || 'Без основания' }}</span>
                  <v-spacer></v-spacer>
                  <span class="text-body-2 primary--text font-weight-bold mr-4">
                    Итого: {{ calculateTotal(claim).toLocaleString('ru') }} руб.
                  </span>
                  <v-btn icon small @click.stop="removeClaim(index)">
                    <v-icon color="error">mdi-delete</v-icon>
                  </v-btn>
                </v-card-title>
                <v-card-text v-if="!claim.collapsed">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                          dense
                          outlined
                          label="Основание возникновения требования"
                          v-model="claim.basis"
                          hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field
                          dense
                          outlined
                          label="Дата получения"
                          type="date"
                          v-model="claim.date_receipt"
                          hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field
                          dense
                          outlined
                          label="Дата возникновения"
                          type="date"
                          v-model="claim.date_origin"
                          hide-details
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row class="amount-fields">
                    <v-col cols="12" class="d-flex justify-space-between">
                      <span class="font-weight-medium">Детализация суммы</span>
                      <v-spacer></v-spacer>
                      <span class="text-body-2 primary--text font-weight-bold mr-2">
                        Итого:  {{ calculateTotal(claim).toLocaleString('ru') }} руб.
                      </span>
                    </v-col>
                    <v-col cols="12" sm="6" md="3" lg="2">
                      <v-text-field
                          dense
                          outlined
                          label="Основная сумма долга"
                          type="number"
                          v-model.number="claim.main_amount"
                          hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="3" md="2" lg="2">
                      <v-text-field
                          dense
                          outlined
                          label="Неустойка"
                          type="number"
                          v-model.number="claim.penalty_amount"
                          hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="2" lg="2">
                      <v-text-field
                          dense
                          outlined
                          label="Пени"
                          type="number"
                          v-model.number="claim.penni_amount"
                          hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="2" lg="2">
                      <v-text-field
                          dense
                          outlined
                          label="Штрафы"
                          type="number"
                          v-model.number="claim.fine_amount"
                          hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="2" lg="2">
                      <v-text-field
                          dense
                          outlined
                          label="Госпошлина"
                          type="number"
                          v-model.number="claim.duty_amount"
                          hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="2" lg="1">
                      <v-text-field
                          dense
                          outlined
                          label="Проценты"
                          type="number"
                          v-model.number="claim.percent_amount"
                          hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="2" lg="1">
                      <v-text-field
                          dense
                          outlined
                          label="Другое"
                          type="number"
                          v-model.number="claim.other_amount"
                          hide-details
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <!-- Уведомление для конкретного требования -->
                  <v-row class="mt-4">
                    <v-col cols="12">
                      <v-expansion-panels flat>
                        <v-expansion-panel>
                          <v-expansion-panel-header>
                            Уведомление для этого требования
                            <template v-slot:actions>
                              <v-icon color="primary">mdi-bell</v-icon>
                            </template>
                          </v-expansion-panel-header>
                          <v-expansion-panel-content>
                            <v-row>
                              <v-col cols="12" md="4">
                                <v-text-field
                                    dense
                                    outlined
                                    label="Дата уведомления"
                                    type="date"
                                    v-model="claim.notification_date"
                                    hide-details
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12" md="4">
                                <v-text-field
                                    dense
                                    outlined
                                    label="Идентификатор отправления"
                                    v-model="claim.notification_number"
                                    hide-details
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12" md="4">
                                <v-autocomplete
                                    dense
                                    outlined
                                    :items="availableNotificationOptions(claim)"
                                    item-text="displayText"
                                    item-value="id"
                                    label="Выбрать уведомление"
                                    v-model="claim.notification_id"
                                    @change="applyNotification(claim, $event)"
                                    clearable
                                    return-object
                                >
                                  <template v-slot:item="{ item }">
                                    <v-list-item-content>
                                      <v-list-item-title>{{ item.displayText }}</v-list-item-title>
                                      <v-list-item-subtitle v-if="item.date">
                                        Дата: {{ formatDate(item.date) }}, Номер: {{ item.number || 'не указан' }}
                                      </v-list-item-subtitle>
                                    </v-list-item-content>
                                  </template>
                                </v-autocomplete>
                              </v-col>
                            </v-row>
                            <v-row>
                              <v-col cols="12">
                                <v-textarea
                                    dense
                                    outlined
                                    label="Примечания"
                                    v-model="claim.notification_notes"
                                    rows="2"
                                    hide-details
                                ></v-textarea>
                              </v-col>
                            </v-row>
                          </v-expansion-panel-content>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-btn @click="addClaim" class="mb-4">Добавить требование</v-btn>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn color="error" @click="close">Отмена</v-btn>
        <v-btn color="success" @click="save">Сохранить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  props: {
    isEditing: Boolean,
    claimToEdit: Object,
    preselectedCreditor: Object,
    availableNotifications: Array // Существующие уведомления из БД
  },
  data: () => ({
    show: false,
    creditor: null,
    expandedPanels: [0], // По умолчанию открыта первая панель
    form: {
      creditor_id: null,
      creditor_type: null,
      debtor_id: null,
      debtor_type: null,
      claims: []
    }
  }),
  computed: {
    ...mapGetters({
      creditors: "allRefData"
    }),
    claimsList() {
      if (this.form.claims) {
        return this.form.claims
      }
      return []
    }
  },
  watch: {
    preselectedCreditor: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.creditor = this.creditors.find(c => c.id === newVal.id && c.type === newVal.type);
          this.setCreditor(this.creditor);
        }
      }
    }
  },
  methods: {
    open(debtor) {
      console.log(debtor)

      // Сначала сбрасываем форму
      this.resetForm();

      // Затем устанавливаем debtor, если он передан
      if (debtor) {
        if (debtor.type === "LegalEntity") {
          this.form.debtor_id = debtor.id;
          this.form.debtor_type = debtor.type;
        } else if (debtor.type === "PhysicalPerson") {
          this.form.debtor_id = debtor.id;
          this.form.debtor_type = debtor.type;
        }
      }
      // Если редактируем существующее требование
      if (this.isEditing && this.claimToEdit) {
        this.loadClaimData(this.claimToEdit);
      } else {
        // Если создаем новое требование
        if (this.preselectedCreditor) {
          this.creditor = this.creditors.find(c => c.id === this.preselectedCreditor.id && c.type === this.preselectedCreditor.type);
          this.setCreditor(this.creditor);
        }
      }
      this.show = true;
    },
    close() {
      this.show = false;
      this.$emit('close');
    },
    loadClaimData(claim) {
      // Заполняем форму данными из редактируемого требования
      this.form.creditor_id = claim.creditor_id;
      this.form.creditor_type = claim.creditor_type;
      this.form.debtor_id = claim.debtor_id;
      this.form.debtor_type = claim.debtor_type;

      // Находим кредитора в списке
      this.creditor = this.creditors.find(c => c.id === claim.creditor_id && c.type === claim.creditor_type);

      // Загружаем данные требования
      this.form.claims = [{
        id: claim.id,
        date_receipt: claim.date_receipt,
        basis: claim.basis,
        date_origin: claim.date_origin,
        main_amount: claim.main_amount,
        penalty_amount: claim.penalty_amount,
        penni_amount: claim.penni_amount,
        fine_amount: claim.fine_amount,
        duty_amount: claim.duty_amount,
        percent_amount: claim.percent_amount,
        other_amount: claim.other_amount,
        // Данные уведомления, если есть
        notification_id: claim.notification?.id || null,
        notification_date: claim.notification?.notification_date || null,
        notification_number: claim.notification?.notification_number || '',
        notification_notes: claim.notification?.notes || '',
        collapsed: false,
        temp_id: Date.now() // Временный идентификатор для новых требований
      }];
    },
    resetForm() {
      this.form = {
        creditor_id: null,
        creditor_type: null,
        debtor_id: null,
        debtor_type: null,
        claims: []
      };
      this.creditor = null;
    },
    toggleClaim(index) {
      const claim = this.form.claims[index];
      this.$set(this.form.claims, index, {
        ...claim,
        collapsed: !claim.collapsed
      });
    },
    setCreditor(item) {
      if (item) {
        this.form.creditor_id = item.id;
        this.form.creditor_type = item.type;
      }
    },
    addClaim() {
      const newClaim = {
        date_receipt: null,
        basis: '',
        date_origin: null,
        main_amount: 0,
        penalty_amount: 0,
        penni_amount: 0,
        fine_amount: 0,
        duty_amount: 0,
        percent_amount: 0,
        other_amount: 0,
        notification_id: null,
        notification_date: null,
        notification_number: '',
        notification_notes: '',
        collapsed: false,
        temp_id: Date.now() // Временный идентификатор
      };
      this.form.claims.push(newClaim);
    },
    removeClaim(index) {
      this.form.claims.splice(index, 1);
    },
    calculateTotal(claim) {
      return (claim.main_amount || 0) +
          (claim.penalty_amount || 0) +
          (claim.penni_amount || 0) +
          (claim.fine_amount || 0) +
          (claim.duty_amount || 0) +
          (claim.percent_amount || 0) +
          (claim.other_amount || 0);
    },
    availableNotificationOptions(currentClaim) {
      const options = [];
      const availableNotifications = this.availableNotifications || [];

      // Добавляем существующие уведомления из БД
      availableNotifications.forEach(notification => {
        options.push({
          id: notification.id,
          date: notification.notification_date,
          number: notification.notification_number,
          notes: notification.notes,
          displayText: `Уведомление #${notification.id} (${notification.notification_date})`,
          isExisting: true
        });
      });

      // Добавляем уведомления из других требований в этом диалоге
      this.claimsList.forEach(claim => {
        // Пропускаем текущее требование и требования без данных уведомления
        if (claim.temp_id === currentClaim.temp_id ||
            (!claim.notification_date && !claim.notification_number)) {
          return;
        }

        // Создаем временный идентификатор для несохраненного уведомления
        const tempId = `temp_${claim.temp_id}`;

        options.push({
          id: tempId,
          date: claim.notification_date,
          number: claim.notification_number,
          notes: claim.notification_notes,
          displayText: `Новое уведомление (${claim.notification_date || 'без даты'})`,
          isExisting: false,
          sourceClaim: claim
        });
      });

      return options;
    },
    applyNotification(claim, notification) {
      if (!notification) {
        // Сброс уведомления
        claim.notification_date = null;
        claim.notification_number = '';
        claim.notification_notes = '';
        claim.notification_id = null;
        return;
      }

      if (notification.isExisting) {
        // Существующее уведомление из БД
        claim.notification_id = notification.id;
        claim.notification_date = notification.date;
        claim.notification_number = notification.number;
        claim.notification_notes = notification.notes;
      } else {
        // Уведомление из другого требования в этом диалоге
        claim.notification_date = notification.date;
        claim.notification_number = notification.number;
        claim.notification_notes = notification.notes;
        // Для временных уведомлений не устанавливаем notification_id
        claim.notification_id = null;
      }
    },
    formatDate(date) {
      if (!date) return 'не указана';
      return new Date(date).toLocaleDateString('ru-RU');
    },
    async save() {
      try {
        // Подготавливаем данные для отправки
        const claimsToSave = this.form.claims.map(claim => {
          const claimData = {
            date_receipt: claim.date_receipt,
            basis: claim.basis,
            date_origin: claim.date_origin,
            main_amount: claim.main_amount || 0,
            penalty_amount: claim.penalty_amount || 0,
            penni_amount: claim.penni_amount || 0,
            fine_amount: claim.fine_amount || 0,
            duty_amount: claim.duty_amount || 0,
            percent_amount: claim.percent_amount || 0,
            other_amount: claim.other_amount || 0,
          };

          // Если есть ID (при редактировании), добавляем его
          if (claim.id) {
            claimData.id = claim.id;
          }

          // Добавляем данные уведомления, если они есть
          if (claim.notification_date || claim.notification_number) {
            claimData.notification_data = {
              notification_date: claim.notification_date,
              notification_number: claim.notification_number,
              notes: claim.notification_notes || ''
            };
          }

          return claimData;
        });

        // Формируем данные для отправки
        const requestData = {
          creditor_type: this.form.creditor_type,
          creditor_id: this.form.creditor_id,
          debtor_type: this.form.debtor_type,
          debtor_id: this.form.debtor_id,
          claims: claimsToSave
        };

        if (this.isEditing) {
          // Для редактирования отправляем каждый claim отдельно
          for (const claimData of claimsToSave) {
            const dataToSend = {
              ...requestData,
              claims: [claimData] // Отправляем массив с одним требованием
            };

            if (claimData.id) {
              // Для обновления существующего требования
              await this.$store.dispatch('creditorClaims/updateCreditorClaim', {
                id: claimData.id,
                data: dataToSend
              });
            } else {
              // Для создания нового требования в режиме редактирования
              console.log(dataToSend)
              await this.$store.dispatch('creditorClaims/saveCreditorClaim', dataToSend);
            }
          }
        } else {
          console.log(requestData)
          // Для создания отправляем все требования одним запросом
          await this.$store.dispatch('creditorClaims/saveCreditorClaim', requestData);
        }

        this.$emit('save');
        this.close();
      } catch (error) {
        console.error('Ошибка при сохранении требований:', error);
        this.$emit('error', error);
      }
    }
  }
};
</script>

<style scoped>
.identifier-panel {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.claim-card {
  margin-bottom: 16px;
  border-left: 4px solid #2196F3;
  transition: all 0.3s ease;
}

.claim-card.collapsed {
  opacity: 0.8;
  border-left: 4px solid #90CAF9;
}

.amount-fields {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
}

.collapse-btn {
  transition: transform 0.3s ease;
}

.collapse-btn.collapsed {
  transform: rotate(-90deg);
}

.summary-row {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 8px;
  margin: 8px 0;
}
</style>