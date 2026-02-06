<template>
  <v-dialog :value="value" @input="$emit('input', $event)" max-width="700" persistent>
    <v-card>
      <v-card-title>
        {{ isEditing ? 'Редактирование решения' : 'Новое решение' }} по конкурсной массе
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12" md="6">
              <v-autocomplete
                  v-model="estateProcess.decision"
                  :items="estateDecisions"
                  item-text="text"
                  item-value="value"
                  label="Решение*"
                  :rules="rules.decision"
                  outlined dense
                  @change="onDecisionChange"
              />
            </v-col>

            <template v-if="estateProcess.decision">
              <v-col cols="12" md="6" v-if="estateProcess.decision === 'OUT'">
                <v-autocomplete
                    v-model="estateProcess.exclusion_ground"
                    :items="exclusionGrounds"
                    item-text="text"
                    item-value="value"
                    label="Основание исключения*"
                    :rules="rules.exclusion_ground"
                    outlined dense
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                    v-model="estateProcess.legal_reference"
                    label="Правовое обоснование*"
                    outlined dense
                    rows="3"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete
                    v-model="estateProcess.document_reference"
                    :items="documents"
                    item-text="title"
                    item-value="id"
                    label="Документ-основание"
                    outlined dense
                    clearable
                >
                  <!-- Кастомный шаблон для выбранного значения -->
                  <template v-slot:selection="{ item }">
                    <span class="compact-document-selection">
                      <span class="document-type">{{ getRouteText(item.route) }}</span>
                      <span class="document-name">{{ item.fileName }}</span>
                      <span class="document-from" v-if="getFromWhoName(item.fromWho)">
                        {{ getFromWhoName(item.fromWho) }}
                      </span>
                    </span>
                  </template>

                  <!-- Кастомный шаблон для элементов списка -->
                  <template v-slot:item="{ item }">
                    <v-list-item-content>
                      <v-list-item-title class="document-compact-title">
                        <div class="document-compact-name" v-if="item.correspondence_type">
                          <v-icon x-small class="mr-1">mdi-file-document</v-icon>
                          {{ item.correspondence_type }}
                        </div>
                      </v-list-item-title>
                      <span class="document-compact-correspondence">{{ item.fileName }}</span>
                      <v-list-item-subtitle class="document-compact-subtitle">
                        <div class="document-compact-info">
                          <span class="document-compact-direction">
                            {{ getRouteText(item.route) }}
                          </span>
                          <span class="document-compact-date" v-if="item.entry_date">
                            <v-icon x-small class="mr-1 ml-2">mdi-calendar</v-icon>
                            {{ formatDateShort(item.entry_date) }}
                          </span>
                          <span class="document-compact-from" v-if="getFromWhoName(item.fromWho)">
                            <v-icon x-small class="mr-1 ml-2">mdi-account</v-icon>
                            {{ getFromWhoName(item.fromWho) }}
                          </span>
                        </div>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </template>

                  <template v-slot:prepend-item v-if="documents.length > 0">
                    <v-list-item dense class="document-filter-header">
                      <v-list-item-content>
                        <v-list-item-subtitle class="text-caption">
                          Всего документов: {{ documents.length }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    <v-divider class="mt-1 mb-1"></v-divider>
                  </template>

                  <template v-slot:no-data>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title class="text-center">
                          Документы не найдены
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12" md="6">
                <DatePicker
                    v-model="estateProcess.decision_date"
                    value-type="format"
                    format="DD.MM.YYYY"
                    placeholder="Дата принятия решения*"
                    :clearable="false"
                    :rules="rules.decision_date"
                    outlined
                />
              </v-col>

              <v-col cols="12">
                <v-switch
                    v-model="estateProcess.is_active"
                    label="Актуальное решение"
                    :disabled="estateProcess.decision === 'OUT'"
                    hint="Для исключения из конкурсной массы решение всегда активно"
                    persistent-hint
                    hide-details
                />
              </v-col>
            </template>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="cancel">Отмена</v-btn>
        <v-btn
            color="primary"
            @click="save"
            :disabled="!valid"
        >
          {{ isEditing ? 'Сохранить' : 'Добавить' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'
import {
  VAutocomplete,
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VDialog,
  VForm,
  VSwitch,
  VTextarea
} from 'vuetify/lib'
import {mapGetters} from "vuex"

export default {
  name: "EstateProcessDialog",
  components: {
    DatePicker,
    VDialog,
    VCard,
    VCardTitle,
    VCardText,
    VForm,
    VAutocomplete,
    VTextarea,
    VSwitch,
    VCardActions,
    VBtn
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    estateProcess: {
      type: Object,
      default: () => ({
        decision: 'IN',
        exclusion_ground: null,
        legal_reference: '',
        document_reference: null,
        decision_date: null,
        is_active: true
      })
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: [String, Number, Array],
      required: true
    }
  },
  data() {
    return {
      valid: false,
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
      rules: {
        decision: [v => !!v || 'Решение обязательно'],
        exclusion_ground: [
          v => {
            if (this.estateProcess.decision === 'OUT') {
              return !!v || 'Основание исключения обязательно при исключении из конкурсной массы'
            }
            return true
          }
        ],
        legal_reference: [
          v => {
            if (this.estateProcess.decision === 'OUT') {
              return !!v || 'Правовое обоснование обязательно при исключении из конкурсной массы'
            }
            return true
          }
        ],
        decision_date: [v => !!v || 'Дата решения обязательна']
      }
    }
  },
  computed: {
    ...mapGetters({
      documents: 'projectDocumentListData'
    })
  },
  watch: {
    projectId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadDocuments()
        }
      }
    }
  },
  methods: {
    loadDocuments() {
      this.$store.dispatch('getProjectDocument', {project: this.projectId.toString()})
    },

    onDecisionChange() {
      if (this.estateProcess.decision === 'IN') {
        this.estateProcess.exclusion_ground = null
      }
      if (this.estateProcess.decision === 'OUT') {
        this.estateProcess.is_active = true
      }
    },

    getRouteText(route) {
      return route ? 'Исходящий' : 'Входящий'
    },

    getFromWhoName(fromWho) {
      if (!fromWho) return null

      if (typeof fromWho === 'string') {
        try {
          const parsed = JSON.parse(fromWho)
          if (parsed && typeof parsed === 'object') {
            return parsed.name || parsed.fullName || parsed.full_name || null
          }
        } catch (e) {
          return fromWho
        }
      }

      if (typeof fromWho === 'object') {
        return fromWho.name || fromWho.fullName || fromWho.full_name || null
      }

      return null
    },

    formatDateShort(dateString) {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}.${month}.${year}`
      } catch (e) {
        return dateString
      }
    },

    cancel() {
      this.$emit('cancel')
    },

    save() {
      if (this.$refs.form.validate()) {
        const estateData = {
          ...this.estateProcess,
          decision_date: this.estateProcess.decision_date
        }
        this.$emit('save', estateData)
      }
    },
  }
}
</script>

<style scoped>
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

.document-compact-info .v-icon,
.document-compact-correspondence .v-icon {
  font-size: 0.75rem;
  opacity: 0.7;
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