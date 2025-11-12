<template>
  <v-dialog v-model="show" width="50vw">

    <v-card height="40vh">
      <v-card-title>
        <v-row justify="center">
          {{ !form.id ? 'Добавления способа коммуникации' : 'Редактирование способа коммуникации' }}
        </v-row>
      </v-card-title>
      <v-card-text style="height: 60%">
        <v-row justify="start" class="mt-4">
          <v-col md="4" lg="4" sm="12" xs="12">
            <v-autocomplete outlined dense label="Способ коммуникации" :items="communicationMethod"
                            v-model="form.communication_type"></v-autocomplete>
          </v-col>
          <v-col md="8" lg="8" sm="12" xs="12">
            <template v-if="form.communication_type === 'Email'">
              <v-text-field dense outlined :rules="emailRules" label="Email" v-model="form.value"></v-text-field>
            </template>
            <template v-else-if="form.communication_type === 'Phone'">
              <v-text-field dense outlined :rules="emailRules" label="Номер телефона"
                            v-mask="'+#(###)###-##-##'"
                            v-model="form.value"></v-text-field>
            </template>
            <template v-else>
              <v-textarea dense outlined :rules="addressRules" label="Почтовый адрес" rows="2"
                          v-model="form.value"></v-textarea>
            </template>
          </v-col>
        </v-row>
        <v-row justify="start" v-if="form.communication_type !== 'Phone'">
          <v-checkbox v-model="form.is_main" dense label="Является основным"></v-checkbox>
        </v-row>
        <v-row justify="start" v-else>
          <v-checkbox v-model="form.is_main_phone" dense label="Является основным телефоном"></v-checkbox>
        </v-row>
      </v-card-text>
      <v-card-actions class="flex justify-end">
        <v-btn
            color="error"
            text
            @click="close"
        >
          Закрыть
        </v-btn>

        <v-btn
            color="success"
            text
            @click="create"
        >
          {{ !form.id ? 'Добавить' : 'Сохранить' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {CommunicationMethodType} from '@/const/dataTypes'
import {eventBus} from "@/bus";

export default {
  props: ['communicationItem'],
  name: "CommunicationForm",
  data: () => ({
    show: false,
    communicationMethod: CommunicationMethodType,
    emailRules: [
      v => !!v || 'Email обязателен',
      v => /.+@.+\..+/.test(v) || 'Email должен быть действительным'
    ],
    addressRules: [
      v => !!v || 'Адрес обязателен',
      v => /^\d{6}.*/.test(v) || 'Адрес должен начинаться с почтового индекса (6 цифр)'
    ],
    form: {
      communication_type: null,
      value: null,
      legal: null,
      person: null,
      is_main: false,
      is_main_phone: false
    }
  }),
  methods: {
    close() {
      Object.assign(this.$data, this.$options.data());
      this.show = false
    },
    getFormData() {
      let formData = new FormData()
      Object.entries(this.form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value)
        }
      })
      return formData
    },
    create() {
      const formData = this.getFormData()
      if (!this.form.id) {
        this.$store.dispatch('addCommunication', formData).then(res => {
          this.$emit('update', res)
          this.close()
        })
      } else {
        this.$store.dispatch('editCommunication', {formData: formData, id: this.form.id}).then(res => {
          this.$emit('update', res)
          this.close()
        })
      }
    },
  },
  created() {
    this.$parent.$on('editCommunication', (item) => {
      Object.entries(item).forEach(([key, val]) => {
        this.form[key] = val
      })
      this.show = true
    })
    eventBus.$on('editCommunication', (item) => {
      Object.entries(item).forEach(([key, val]) => {
        this.form[key] = val
      })
      this.show = true
    })
    eventBus.$on('addCommunication', (item) => {
      Object.entries(item).forEach(([key, val]) => {
        this.form[key] = val
      })
      this.show = true
    })
    if (!this.communicationItem) {
      this.form.communication_type = "ElectronicMail"
    }
  }
}
</script>

<style scoped>

</style>