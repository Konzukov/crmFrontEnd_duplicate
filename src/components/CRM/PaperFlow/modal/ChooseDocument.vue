<template>
  <v-dialog v-model="dialog" max-width="60%" scrollable>
    <v-card
        v-if="loading"
        color="primary"
        dark
    >
      <v-card-text>
        Загрузка данных....
        <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
        ></v-progress-linear>
      </v-card-text>
    </v-card>
    <v-card v-else>
      <v-card-title>Доступные документы</v-card-title>
      <v-card-text style="height: 40%;">
        <v-list-item-group>
          <v-list-item v-for="(doc, i) in projectDocumentList" :key="i">
            <v-list-item-action>
              <v-checkbox v-model="selectedDoc" :value="doc.id"
                          :disabled="existDoc.includes(doc.id) || !multiply"
                          @change="appendToChose(doc)"></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ doc.correspondence_type }}</v-list-item-title>
              <v-list-item-subtitle>{{ doc.fileName }} | {{ doc | nameFilter }} | {{ doc.route | routeFilter }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-card-text>
      <v-card-actions>
        <v-row justify="space-around">
          <v-col cols="auto">
            <v-btn color="error" @click="close()">Закрыть</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn color="success" @click="addDocs" :disabled="selectedDoc.length === 0">Добавить</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  props: ['taskPk', 'eventPk', 'solo'],
  name: "ChooseDocument",
  data: () => ({
    dialog: false,
    loading: false,
    existDoc: [],
    multiply: true,
    selectedDoc: [],
    choosedDocs: []
  }),
  computed: {
    ...mapGetters({
      projectDocumentList: 'projectDocumentListData'
    })
  },
  methods: {
    async open(project, existDoc) {
      if (Array.isArray(project)) {
        project = project.toString()
      }
      this.dialog = true
      if (project) {
        this.loading = true
        await this.$store.dispatch('getProjectDocument', project).then(() => {
          this.existDoc = existDoc
          this.loading = false
        })
      }

    },
    close() {
      this.dialog = false;
      Object.assign(this.$data, this.$options.data())
    },
    appendToChose(doc) {
      this.choosedDocs.push(doc)
    },
    addDocs() {
      let formData = new FormData()
      for (let doc of this.selectedDoc) {
        formData.append('docs', doc)
      }
      if (this.taskPk) {
        formData.append('task', this.taskPk)
        this.$store.dispatch('addDocsToTask', formData).then(res => {
          this.$emit('successAdded')
          this.close()
        })
      } else if (this.eventPk) {
        formData.append('event', this.eventPk)
        this.$store.dispatch('addDocsToEvent', formData).then(res => {
          this.$emit('successAdded')
          this.close()
        })
      }
      else {
        this.$emit('chooseDocs', {formData, "chooseDocs": this.choosedDocs})
        this.close()
      }

    }
  },
  watch: {
    choosedDocs(val){
      console.log(val)
      if (this.solo && val.length >= 1){
        this.multiply = false
      }
    }
  },
  filters: {
    nameFilter(obj) {
      if (obj.hasOwnProperty('fromWho') && obj.fromWho) return obj.fromWho.fullName
      return 'Не указано'
    },
    routeFilter(obj) {
      if (obj) return 'Входящее'
      else return 'Исходящее'
    }
  },
  created() {
    this.$parent.$on('chooseDocs', ({project, existDoc}) => {
      this.open(project, existDoc)
    })

  }

}
</script>

<style scoped>
* {
  margin: 0;
}
</style>