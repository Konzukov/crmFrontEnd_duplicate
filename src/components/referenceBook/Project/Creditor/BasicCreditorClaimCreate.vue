<template>
  <v-dialog v-model="dialog" width="50vw">
    <v-card>
      <v-card-title>
        <v-row justify="center" class="mt-3">
          {{ form.id ? 'Редактировать требование' : 'Добавить требование' }}
        </v-row>
      </v-card-title>
      <v-card-text>
        <v-form lazy-validation class="pt-4">
          <v-row>
            <v-col cols="7">
              <v-autocomplete dense outlined label="Кредитор" :items="allRefList" item-value="uuid" item-text="fullName"
                              v-model="creditor" @change="setCreditor" return-object></v-autocomplete>
            </v-col>
            <v-col>
              <v-text-field dense outlined label="Дата получения требования" v-model="form.date_receipt"
                            type="date"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-textarea rows="4" dense outlined label="Основание возникновения требования"
                          v-model="form.basis"></v-textarea>
            </v-col>
            <v-col class="6">
              <v-row>
                <v-col cols="12">
                  <v-text-field dense outlined type="date" label="Дата возникновения требования"
                                v-model="form.date_origin"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field dense outlined label="Сумма требования" v-model="form.claim_amount"
                                @input="handleInput"></v-text-field>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-row justify="center">
          <v-col cols="auto">
            <v-btn color="error" @click="close">Закрыть</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn color="success" @click="save">{{ form.id ? 'Сохранить' : 'Добавить' }}</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script>

import {mapGetters} from "vuex";

export default {
  name: "BasicCreditorClaimCreateModal",
  data: () => ({
    dialog: false,
    creditor: null,
    form: {
      id: null,
      legal_creditor: null,
      physical_creditor: null,
      project: null,
      date_receipt: null,
      claim_amount: null,
      basis: null,
      date_origin: null,
    }
  }),
  computed: {
    ...mapGetters({
      allRefList: 'allRefData',
    })
  },
  methods: {
    close() {
      Object.assign(this.$data, this.$options.data())
      this.dialog = false
    },
    save() {
      let formData = new FormData()
      Object.keys(this.form).forEach(key => {
        if (this.form[key]) {
          formData.set(key, this.form[key])
        }
      })
      if (this.form.id) {
        this.$store.dispatch('editBasicCreditorClaim', {formData: formData, id: this.form.id}).then(() => {
          this.$emit('updateBasicCreditorClaim')
          this.close()
        })

      } else {
        this.$store.dispatch('saveBasicCreditorClaim', formData).then(res => {
          this.$emit('updateBasicCreditorClaim', res)
          this.close()
        })
      }
    },
    setCreditor(item) {
      if (item['type'] === "LegalEntity") {
        this.form.legal_creditor = item.id
      } else {
        this.form.physical_creditor = item.id
      }
    },
    handleInput(value) {
      // Сохраняем сырое значение для обработки
      this.rawValue = value;

      // Обработка ввода
      let cleaned = value
          .replace(/,/g, '.')          // Замена запятых на точки
          .replace(/[^\d.]/g, '')      // Удаление нецифровых символов кроме точек
          .replace(/\.+/g, '.')        // Замена множественных точек на одну
          .replace(/(\.\d*)\./g, '$1'); // Удаление лишних точек после существующей

      // Разделение на целую и дробную части
      const parts = cleaned.split('.');
      let integerPart = parts[0].replace(/\D/g, '');
      let fractionalPart = parts[1] ? parts[1].substring(0, 2) : '';

      // Сборка значения
      let newValue = integerPart;
      if (fractionalPart) newValue += `.${fractionalPart}`;

      // Сохранение в модель
      this.form.claim_amount = newValue ? parseFloat(newValue) : null;
    },
  },
  created() {
    this.$parent.$on('createBasicCreditorClaim', (project) => {
      console.log(project)
      this.form.project = project.id
      this.dialog = true
    })
    this.$parent.$on('editBasicCreditorClaim', (item) => {
      this.dialog = true
      this.form = {...item}
      this.creditor = this.form.legal_creditor ? this.form.legal_creditor : this.form.physical_creditor
      this.setCreditor(this.creditor)
    })
  }

}

</script>


<style scoped>
.v-card {
  height: 60vh;
}

.v-card__text {
  height: 65%;
}
</style>