<template>
  <v-container>
    <v-dialog v-model="dialog" width="500" scrollable>
      <v-card>
        <v-card-title>
          Удаление почты ({{form.post.route}})  РПО №{{ form.post.rpo }}
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
  </v-container>
</template>

<script>
export default {
  name: "DeletePost",
  data: () => ({
    dialog: false,
    delReason: ['Дубликат', 'Ошибочный файл', 'Кривые руки'],
    selectedReason: null,
    rules: [
      v => !!v || 'Данное поле обязательно'
    ],
    valid: false,
    form: {
      post: '',
      reason: ''
    }
  }),
  methods: {
    close() {
      this.dialog = false
      Object.assign(this.$data, this.$options.data())
    },
    save() {
      let formData = new FormData()
      formData.set('post', this.form.post['pk'])
      formData.set('reason', this.form.reason)
      this.$store.dispatch('trashPost', formData).then(()=>{
        this.close()
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
    this.$parent.$on('deletePost', (post) => {
      this.form['post'] = post
      this.dialog = true
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