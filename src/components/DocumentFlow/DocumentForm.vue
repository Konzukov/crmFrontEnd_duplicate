<template>
  <v-dialog v-model="dialog" max-width="900" persistent scrollable>
    <v-card>
      <v-card-title class="primary white--text">
        {{ isEdit ? 'Редактировать документ' : 'Создать документ' }}
        <v-spacer></v-spacer>
        <v-btn icon color="white" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.title"
                label="Название *"
                :rules="[v => !!v || 'Название обязательно']"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.out_number"
                label="Исходящий номер"
                outlined
                dense
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.direction"
                :items="directionOptions"
                label="Направление *"
                :rules="[v => !!v || 'Выберите направление']"
                outlined
                dense
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.document_type"
                :items="documentTypes"
                item-text="name"
                item-value="id"
                label="Тип документа *"
                :rules="[v => !!v || 'Выберите тип документа']"
                outlined
                dense
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="formData.executor"
                :items="[]"
                label="Исполнитель"
                outlined
                dense
                clearable
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="formData.project"
                :items="[]"
                label="Проект"
                outlined
                dense
                clearable
              ></v-autocomplete>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="formData.issuer_legal"
                :items="[]"
                label="Издатель (юр. лицо)"
                outlined
                dense
                clearable
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="formData.issuer_physical"
                :items="[]"
                label="Издатель (физ. лицо)"
                outlined
                dense
                clearable
              ></v-autocomplete>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="formData.owner_legal"
                :items="[]"
                label="Владелец (юр. лицо)"
                outlined
                dense
                clearable
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="formData.owner_physical"
                :items="[]"
                label="Владелец (физ. лицо)"
                outlined
                dense
                clearable
              ></v-autocomplete>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.amount"
                label="Сумма"
                type="number"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.currency"
                :items="currencyOptions"
                label="Валюта"
                outlined
                dense
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="formData.description"
                label="Описание"
                outlined
                dense
                rows="3"
              ></v-textarea>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-file-input
                v-model="newFiles"
                label="Загрузить файлы"
                multiple
                outlined
                dense
                prepend-icon="mdi-paperclip"
                show-size
              ></v-file-input>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close">Отмена</v-btn>
        <v-btn color="primary" @click="save" :loading="loading" :disabled="!valid">
          {{ isEdit ? 'Сохранить' : 'Создать' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'DocumentForm',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    documentId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      valid: false,
      loading: false,
      newFiles: [],
      formData: {
        title: '',
        out_number: '',
        direction: null,
        document_type: null,
        executor: null,
        project: null,
        issuer_legal: null,
        issuer_physical: null,
        owner_legal: null,
        owner_physical: null,
        amount: null,
        currency: 'RUB',
        description: ''
      },
      directionOptions: [
        { text: 'Входящий', value: 'incoming' },
        { text: 'Исходящий', value: 'outgoing' },
        { text: 'Внутренний', value: 'internal' }
      ],
      currencyOptions: ['RUB', 'USD', 'EUR']
    }
  },
  computed: {
    ...mapGetters('documentFlow', ['getDocumentTypes', 'getCurrentDocument']),
    dialog: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    },
    documentTypes() {
      return this.getDocumentTypes || []
    },
    isEdit() {
      return !!this.documentId
    }
  },
  watch: {
    async dialog(val) {
      if (val) {
        await this.fetchDocumentTypes()
        if (this.isEdit) {
          await this.loadDocument()
        } else {
          this.resetForm()
        }
      }
    }
  },
  methods: {
    ...mapActions('documentFlow', [
      'createDocument',
      'updateDocument',
      'fetchDocument',
      'fetchDocumentTypes'
    ]),
    async loadDocument() {
      if (this.documentId) {
        try {
          await this.fetchDocument(this.documentId)
          const doc = this.getCurrentDocument
          if (doc) {
            this.formData = {
              title: doc.title,
              out_number: doc.out_number,
              direction: doc.direction,
              document_type: doc.document_type ? doc.document_type.id : null,
              executor: doc.executor ? doc.executor.id : null,
              project: doc.project ? doc.project.id : null,
              issuer_legal: doc.issuer_legal ? doc.issuer_legal.id : null,
              issuer_physical: doc.issuer_physical ? doc.issuer_physical.id : null,
              owner_legal: doc.owner_legal ? doc.owner_legal.id : null,
              owner_physical: doc.owner_physical ? doc.owner_physical.id : null,
              amount: doc.amount,
              currency: doc.currency || 'RUB',
              description: doc.description
            }
          }
        } catch (error) {
          console.error('Error loading document:', error)
        }
      }
    },
    async save() {
      if (this.$refs.form.validate()) {
        this.loading = true
        try {
          const data = { ...this.formData }
          if (this.newFiles.length) {
            data.new_files = this.newFiles
          }

          if (this.isEdit) {
            await this.updateDocument({ id: this.documentId, data })
            this.$store.commit('snackbar/showSnackbar', {
              message: 'Документ обновлен',
              color: 'success'
            })
          } else {
            await this.createDocument(data)
            this.$store.commit('snackbar/showSnackbar', {
              message: 'Документ создан',
              color: 'success'
            })
          }
          this.$emit('saved')
          this.close()
        } catch (error) {
          console.error('Error saving document:', error)
          this.$store.commit('snackbar/showSnackbar', {
            message: `Ошибка при ${this.isEdit ? 'обновлении' : 'создании'} документа`,
            color: 'error'
          })
        } finally {
          this.loading = false
        }
      }
    },
    resetForm() {
      this.formData = {
        title: '',
        out_number: '',
        direction: null,
        document_type: null,
        executor: null,
        project: null,
        issuer_legal: null,
        issuer_physical: null,
        owner_legal: null,
        owner_physical: null,
        amount: null,
        currency: 'RUB',
        description: ''
      }
      this.newFiles = []
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
    },
    close() {
      this.resetForm()
      this.dialog = false
    }
  }
}
</script>
