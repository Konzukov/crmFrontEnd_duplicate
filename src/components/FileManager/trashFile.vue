<template>
  <v-container>
    <v-dialog v-model="dialog" width="500" scrollable>
      <v-card>
        <v-card-title>
          Удаление документа {{ fileName }}
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
import {mapGetters} from 'vuex'
import {eventBus} from "@/bus";

export default {
  props: ['file'],
  name: "trashFile",
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
        file: '',
        user: '',
        reason: '',
      }
    }
  },
  methods: {
    save() {
      let formData = new FormData()
      Object.keys(this.form).forEach(key => {
        if (this.form[key]) {
          formData.append(key, this.form[key])
        }
      })
      for (let pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
      }
      this.$store.dispatch('createTrashFile', formData).then((trashFile)=>{
        eventBus.$on('fileDeleted', trashFile)
        this.close()
      })
    },
    close() {
      this.dialog = false
      Object.assign(this.$data, this.$options.data())
    },
    addReason(val) {
      if (!val) {
        this.form.reason = ''
        this.selectedReason = null
      }
      this.form.reason = val
    }
  },
  computed: {
    ...mapGetters({
      curUser: 'currentUserData'
    })

  },
  created() {
    this.$parent.$on('trashFile', () => {
      this.form.file = this.file['pk']
      if (this.curUser.length > 0) {
        this.form['user'] = this.curUser[0]['pk']
      }
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