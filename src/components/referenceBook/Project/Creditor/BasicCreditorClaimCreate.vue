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
                                @keypress="isNumber($event)"></v-text-field>
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
          this.$emit('updateBasicCreditorClaim')
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
    isNumber: function (evt) {
      evt = (evt) ? evt : window.event;
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46 && charCode !== 44) {
        evt.preventDefault()
      } else {
        return true;
      }
    },
  },
  created() {
    this.$parent.$on('createBasicCreditorClaim', (project) => {
      this.form.project = project
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