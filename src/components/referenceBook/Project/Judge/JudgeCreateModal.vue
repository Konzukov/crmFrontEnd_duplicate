<template>
  <v-dialog v-model="show" width="60vw">
    <v-card>
      <v-card-title>Добавить судью</v-card-title>
      <v-card-text>
        <v-form v-model="valid">
          <v-row justify="start">
            <v-col lg="6" md="6" sm="12" xs="12">
              <v-autocomplete dense outlined label="Суд" :items="courtList" item-value="pk"
                              item-text="name" v-model="form.court"></v-autocomplete>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col lg="8" md="8" sm="12" xs="12">
              <v-text-field dense outlined label="Судья" v-model="form.full_name"></v-text-field>
            </v-col>
            <v-col lg="4" md="4" sm="12" xs="12">
              <v-text-field dense outlined label="Кабинет" v-model="form.office_room"></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-row justify="end">
          <v-col cols="4">
            <v-btn color="error" @click="close()">Закрыть</v-btn>
          </v-col>
          <v-col cols="4">
            <v-btn color="success" @click="save">Добивать</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: "JudgeCreateModal",
  data: () => ({
    show: false,
    valid: false,
    form: {
      court: null,
      office_room: null,
      full_name: null
    }
  }),
  computed: {
    ...mapGetters({
      courtList: 'courtListData',
    })
  },
  methods: {
    ...mapActions({
      fetchCurtList: 'getCourtList',
    }),
    close(){
      this.show = false
      Object.assign(this.$data, this.$options.data())
    },
    save(){
      let formData = new FormData()
      for (let [key, val] of Object.entries(this.form)){
        formData.set(key, val)
      }
      this.$store.dispatch('createJudge', formData).then(data=>{
        this.$emit('judgeCreate', data)
        this.close()
      })
    }
  },
  mounted() {
    if (!this.courtList || this.courtList.length === 0) {
      this.fetchCurtList()
    }
  },
  created() {
    this.$parent.$on('createJudge', ({court, judge}) => {
      if (!this.courtList || this.courtList.length === 0) {
        this.fetchCurtList()
      }
      let filteredCourt = this.courtList.filter(obj => {
        return obj.name === court
      })[0]
      if (filteredCourt){
        this.form.court = filteredCourt.id
      }

      this.form.full_name = judge
      this.show = true
      console.log(this.curt, this.judge)
    })
  }
}

</script>

<style scoped>

</style>