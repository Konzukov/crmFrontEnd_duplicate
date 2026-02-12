<template>
  <v-dialog v-model="dialog" max-width="700" persistent scrollable>
    <v-card>
      <v-card-title class="primary white--text">
        Создать корреспонденцию
        <v-spacer></v-spacer>
        <v-btn icon color="white" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-form ref="form" v-model="valid">
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
                v-model="formData.delivery_method"
                :items="deliveryMethodOptions"
                label="Способ доставки *"
                :rules="[v => !!v || 'Выберите способ доставки']"
                outlined
                dense
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.subject"
                label="Тема *"
                :rules="[v => !!v || 'Тема обязательна']"
                outlined
                dense
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="formData.sender_legal"
                :items="[]"
                label="Отправитель (юр. лицо)"
                outlined
                dense
                clearable
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="formData.sender_physical"
                :items="[]"
                label="Отправитель (физ. лицо)"
                outlined
                dense
                clearable
              ></v-autocomplete>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.sender_text"
                label="Отправитель (текст)"
                outlined
                dense
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="formData.recipient_legal"
                :items="[]"
                label="Получатель (юр. лицо)"
                outlined
                dense
                clearable
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="formData.recipient_physical"
                :items="[]"
                label="Получатель (физ. лицо)"
                outlined
                dense
                clearable
              ></v-autocomplete>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.recipient_text"
                label="Получатель (текст)"
                outlined
                dense
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.mail_account"
                :items="mailAccounts"
                item-text="email"
                item-value="id"
                label="Почтовый аккаунт"
                outlined
                dense
                clearable
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.message_id"
                label="Message ID"
                outlined
                dense
              ></v-text-field>
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
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close">Отмена</v-btn>
        <v-btn color="primary" @click="save" :loading="loading" :disabled="!valid">
          Создать
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'CorrespondenceForm',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      valid: false,
      loading: false,
      formData: {
        direction: null,
        delivery_method: null,
        subject: '',
        sender_legal: null,
        sender_physical: null,
        sender_text: '',
        recipient_legal: null,
        recipient_physical: null,
        recipient_text: '',
        mail_account: null,
        message_id: '',
        description: ''
      },
      directionOptions: [
        { text: 'Входящая', value: 'incoming' },
        { text: 'Исходящая', value: 'outgoing' },
        { text: 'Внутренняя', value: 'internal' }
      ],
      deliveryMethodOptions: [
        { text: 'Почта', value: 'mail' },
        { text: 'Email', value: 'email' },
        { text: 'Курьер', value: 'courier' },
        { text: 'ЭДО', value: 'edm' },
        { text: 'Факс', value: 'fax' },
        { text: 'Другое', value: 'other' }
      ]
    }
  },
  computed: {
    ...mapGetters('documentFlow', ['getMailAccounts']),
    dialog: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    },
    mailAccounts() {
      return this.getMailAccounts || []
    }
  },
  watch: {
    async dialog(val) {
      if (val) {
        await this.fetchMailAccounts()
        this.resetForm()
      }
    }
  },
  methods: {
    ...mapActions('documentFlow', ['createCorrespondence', 'fetchMailAccounts']),
    async save() {
      if (this.$refs.form.validate()) {
        this.loading = true
        try {
          await this.createCorrespondence(this.formData)
          this.$store.commit('snackbar/showSnackbar', {
            message: 'Корреспонденция создана',
            color: 'success'
          })
          this.$emit('saved')
          this.close()
        } catch (error) {
          console.error('Error creating correspondence:', error)
          this.$store.commit('snackbar/showSnackbar', {
            message: 'Ошибка при создании корреспонденции',
            color: 'error'
          })
        } finally {
          this.loading = false
        }
      }
    },
    resetForm() {
      this.formData = {
        direction: null,
        delivery_method: null,
        subject: '',
        sender_legal: null,
        sender_physical: null,
        sender_text: '',
        recipient_legal: null,
        recipient_physical: null,
        recipient_text: '',
        mail_account: null,
        message_id: '',
        description: ''
      }
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
