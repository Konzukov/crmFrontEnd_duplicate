<template>
  <v-container fluid class="mt-4 mb-4">
    <form>
      <v-row justify="start">
        <v-col cols="4">
          <span v-if="judicialAct.document">
                      {{ judicialAct.document.author | getName }} | {{ judicialAct.document.entry_date | filterDate }} |
          {{ judicialAct.document.file }}
          </span>
        </v-col>
        <v-col cols="7">
          <v-text-field dense outlined label="Ссылка на судебный акт" v-model="judicialAct.url"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-btn small @click="chooseEventDoc">Выбрать документ</v-btn>
      </v-row>
    </form>
    <ChooseDocument @chooseDocs="appendDocs" :solo="true"></ChooseDocument>
  </v-container>
</template>

<script>
import ChooseDocument from "@/components/CRM/PaperFlow/modal/ChooseDocument";
import moment from "moment";
import customConst from "@/const/customConst";


export default {
  props: ['project', 'act'],
  name: "JudicialAct",
  data: () => ({
    judicialAct: {
      id: null,
      url: null,
      document: null,
    }
  }),
  filters: {
    filterDate: date => moment(new Date(date)).format('DD.MM.YYYY'),
    getName(obj) {
      if (obj && obj.hasOwnProperty('fullName')) {
        return obj.fullName
      }
      return '-------'
    },
  },
  methods: {
    appendDocs(doc) {
      this.judicialAct.document = doc.chooseDocs[0]
    },
    async chooseEventDoc() {
      let existDoc = []
      if (this.judicialAct.documents) {
        existDoc = this.judicialAct.documents.map(obj => {
          return obj.id
        })
      }
      this.$emit('chooseDocs', {project: this.project.id, existDoc: existDoc})
    },
    async save() {
      console.log('call')
      let formData = new FormData()
      if (!this.judicialAct.id) {
        formData.append('url', this.judicialAct.url)
        formData.append('project', this.project.pk)
        formData.append('document', this.judicialAct.document.pk)
        this.$http({
          method: "POST",
          url: customConst.PAPERFLOW_API + "judicial-act/",
          data: formData
        }).then(res => {
          console.log(res)
        }).catch(err => {
          console.log(err)
        })
      }
    }
  },
  created() {
    if (this.act) {
      Object.assign(this.judicialAct, this.act)
    }
  },
  components: {
    ChooseDocument
  }
}
</script>

<style scoped>

</style>