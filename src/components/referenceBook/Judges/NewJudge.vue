<template>
  <v-container>
    <v-dialog v-model="show" width="500">
      <v-card>
        <v-card-title>
          <h2>Новый судья</h2>
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="judge.full_name" outlined dense label="ФИО судьи"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field outlined dense v-model="judge.court_code" label="Код суда"></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field outlined dense v-model="judge.office_room" label="Номер кабинета"></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field outlined dense v-model="judge.phone_number" label="Номер телефона"></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-space-between">
          <v-btn color="error" @click="show = false">Закрыть</v-btn>
          <v-btn color="success" @click="save">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <SaveProcessed @saved="close()"></SaveProcessed>
  </v-container>
</template>

<script>
import SaveProcessed from "@/components/UI/SaveProcessed";


export default {
  name: "NewJudge",
  data: () => ({
    show: false,
    judge: {
      full_name: '',
      court_code: '',
      office_room: '',
      phone_number: ''
    }
  }),
  methods: {
    save() {
      let formData = new FormData();
      for (let [key, val] of Object.entries(this.judge)) {
        formData.set(key, val)
      }
      new Promise(resolve => {
        this.$emit('saveInProcess')
        resolve()
      }).then(() => {
        this.$store.dispatch('createJudge', formData).then(res => {
          this.$emit('saveDone')
        }).catch(()=>{
          this.$emit('saveError')
        })
      })

    },
    close(){
      this.show = false;
      Object.assign(this.$data, this.$options.data())
    }
  },
  mounted() {
    this.$parent.$on('newJudge', () => {
      this.show = true
    })
  },
  components: {
    SaveProcessed
  }
}
</script>

<style scoped>

</style>