<template>
  <v-container>
    <v-snackbar absolute v-model="snackbar.show" left top :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>
    <v-dialog v-model="dialog" width="700px">
      <v-card height="90%" width="700">
        <v-card-title class="justify-center">
          Решение задачи
        </v-card-title>
        <v-card-text>
          <v-form lazy-validation v-model="valid" ref="closeTask">
            <v-textarea label="Решение задачи" rows="5" :rules="required" outlined dense
                        v-model="solution"></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-row justify="space-around">
            <v-col cols="auto">
              <v-btn color="error" @click="close">Отмена</v-btn>
            </v-col>
            <!--            <v-col cols="auto">-->
            <!--              <v-btn color="warning" @click="addDoc">Добавить файл</v-btn>-->
            <!--            </v-col>-->
            <v-col cols="auto">
              <v-btn color="success" @click="save">Сохранить</v-btn>
            </v-col>
            <v-col cols="auto"></v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <createDocument></createDocument>
  </v-container>
</template>

<script>
import createDocument from "../../PaperFlow/modal/createDocument";
import {eventBus} from "@/bus";

export default {
  name: "TaskDone",
  data() {
    return {
      dialog: false,
      valid: false,
      pk: '',
      solution: '',
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      required: [
        v => !!v || "Данное поле обязательно"
      ]
    }
  },
  methods: {
    close() {
      this.dialog = false
    },
    open() {
      this.dialog = true
    },
    save() {
      if (this.$refs.closeTask.validate()) {
        let formData = new FormData()
        formData.set('solution', this.solution)
        formData.set('task', this.pk)
        this.$store.dispatch('createTaskCloseEvent', formData).then(() => {
          this.snackbar.show = true
          this.snackbar.text = 'Задача закрыта. Окно будет закрыто автоматически'
          setTimeout(()=>{
            this.close()
            this.$emit('taskDoneEventCreate')
          }, 1500)
        }).catch(err => {
          this.snackbar.show = true
          this.snackbar.text = err.response.data.errors.errors
          this.snackbar.color = 'error'
        })
      }


    },
    async addDoc() {
      this.$emit('newEventDocument', null)
    }

  },
  created() {
    eventBus.$on('taskDone', (pk) => {
      this.pk = pk
      this.open()
    })
  },
  components: {
    createDocument
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

.v-dialog {
  overflow: hidden;
}
</style>