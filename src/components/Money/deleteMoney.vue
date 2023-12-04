<template>
  <v-dialog v-model="dialog" width="500" scrollable>
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
        <v-row justify="center">
          <v-col md="5" sm="5">
            <v-btn color="error" @click="close">Отменить удаление</v-btn>
          </v-col>
          <v-col md="5" sm="5">
            <v-btn color="darken-1 error" @click="save">Удалить</v-btn>
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
    rules: [
      v => !!v || 'Данное поле обязательно'
    ],
    form: {
      receipts: '',
      reason: '',
    }
  })
}
</script>

<style scoped>

</style>