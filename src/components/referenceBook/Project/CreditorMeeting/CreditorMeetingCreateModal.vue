<template>
  <v-dialog v-model="dialog" width="70vw">
    <v-toolbar color="primary" dark dense flat>
      <v-row justify="center">
        <v-toolbar-title>Добавление собрания кредиторов</v-toolbar-title>
      </v-row>
    </v-toolbar>
    <v-card height="55vh" class="pt-6">
      <v-card-text style="height: 80%; overflow: scroll">
        <v-form lazy-validation class="pt-4">
          <v-row justify="start">
            <v-col cols="auto">
              <v-text-field flat dense
                            outlined
                            type="datetime-local"
                            label="Дата проведения"
                            v-model="form.date"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="12">
              <label>Повестка дня</label>
              <VueEditor class="comment" v-model="form.agendas"></VueEditor>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="12">
              <label>Принятые решения</label>
              <VueEditor class="comment" v-model="form.resolutions"></VueEditor>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-row justify="center">
          <v-col cols="auto">
            <v-btn @click="close" color="error">Отмена</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn @click="save" color="success">Сохранить</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

// import {eventBus} from "@/bus";
import {VueEditor} from "vue2-editor";
import {eventBus} from "@/bus";

export default {
  props: ['creditorMeeting', 'project'],
  name: "CreditorMeetingCreateModal",
  data: () => ({
    dialog: false,
    form: {
      id: '',
      project: null,
      date: null,
      agendas: '',
      resolutions: '',
    }
  }),
  methods: {
    close() {
      Object.assign(this.$data, this.$options.data())
      this.dialog = false
    },
    save() {
      let formData = new FormData()
      Object.keys(this.form).forEach(key => {
        formData.append(key, this.form[key])
      })
      if (this.form.id) {
        this.$store.dispatch('editCreditorMeeting', {formData, 'id': this.form.id}).then(() => {
          this.close()
        })
      } else {
        this.$store.dispatch('addCreditorMeeting', formData).then(() => {
          this.close()
        })
      }

    }
  },
  created() {
    eventBus.$on('editCreditorMeeting', item => {
      this.form = {...item}
      this.dialog = true
    })
    this.$parent.$on('addCreditorMeeting', () => {
      this.form.project = this.project
      this.dialog = true
    })
  },
  components: {
    VueEditor
  }
}
</script>

<style scoped>
.v-card {
  height: 70vh;
}

.v-card__text {
  height: 65%;
}
</style>