<template>
  <v-dialog v-model="dialog" width="600" scrollable>
    <v-card>
      <v-card-title>
        Удаление поступления
      </v-card-title>
      <v-card-text>
        <v-form lazy-validation v-model="valid" ref="delDoc">
          <v-select :items="delReason"
                    v-model="selectedReason"
                    @change="addReason"
                    label="Причина удаления"
                    clearable></v-select>
          <v-textarea label="Произвольная причина" outlined row-height="5"
                      :rules="rules"
                      v-model="form.reason"
                      v-if="!selectedReason"
          >
          </v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-row justify="space-around">
          <v-col md="5" sm="5">
            <v-btn color="error" @click="close()">Отменить удаление</v-btn>
          </v-col>
          <v-col md="5" sm="5">
            <v-btn color="darken-1 error" @click="save()">Удалить</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "deleteMoney",
  data: () => ({
    delReason: ['Дубликат', 'Ошибочный файл', 'Кривые руки'],
    selectedReason: null,
    valid: true,
    dialog: false,
    rules: [
      v => !!v || 'Данное поле обязательно'
    ],
    form: {
      receipts: '',
      reason: '',
    },
  }),
  methods: {
    addReason(reason) {
      this.form.reason = reason
    },
    close() {
      Object.assign(this.$data, this.$options.data())
      this.dialog = false
    },
    save() {
      let formData = new FormData()
      console.log(this.form.receipts)
      formData.set('money', this.form.receipts['pk'])
      formData.set('reason', this.form.reason)
      this.$store.dispatch('toTrashMoney', formData).then(()=>{
        this.close()
      })
    }
  },
  created() {
    this.$parent.$on('deleteReceipt', item => {
      console.log(item)
      this.form.receipts = Object.assign({}, item)
      this.dialog = true
    })
  }
}
</script>

<style scoped>
>>>.v-dialog {
  overflow: hidden;
}
</style>