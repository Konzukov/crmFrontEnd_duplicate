<template>
  <v-dialog v-model="dialog" width="500" scrollable>
    <v-card>
      <v-card-title>
        Удаление документа {{fileName}}
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
  name: "deleteDocument",
  data() {
    return {
      dialog: false,
      fileName: '',
      delReason: ['Дубликат', 'Ошибочный файл', 'Кривые руки'],
      selectedReason: null,
      valid: true,
      rules: [
        v => !!v || 'Данное поле обязательно'
      ],
      form: {
        doc: '',
        reason: ''
      }
    }
  },
  computed: {
    systemUser: {
      get() {
        if (this.$store.getters.allSystemUsersData) {
          return this.$store.getters.allSystemUsersData
        }
        return new Array()
      }
    },
    currentUser() {
      return this.$store.getters.authUserData
    },
  },
  methods: {
    open() {
      this.dialog = true
    },
    close() {
      this.dialog = false
      Object.keys(this.form).forEach(key => {
        this.form[key] = ''
      })
    },
    save() {
      if (!this.$refs.delDoc.validate()) {
        return false
      }
      let formData = new FormData()
      Object.keys(this.form).forEach(key => {
        formData.set(key, this.form[key])
      })
      this.$store.dispatch('addTrashDocument', {'pk': this.form.doc, formData}).then(() => {
        this.$emit('docAddedToTrash', this.form.doc)
        this.close()
        this.$emit('finished')
      }).catch((err) => {
        console.log(err.response.data)
      })
    },
    addReason(val) {
      if (!val) {
        this.form.reason = ''
        this.selectedReason = null
      }
      this.form.reason = val
    }
  },
  created() {
    this.$parent.$on('delDoc', (doc) => {
      this.fileName = doc['fileName']
      this.form['doc'] = doc['pk']
      this.open()
    })
  }
}
</script>

<style scoped>
>>> .v-dialog {
  margin: 5px;
  padding: 0;
}

>>> .v-card {
  overflow: hidden;
}
</style>