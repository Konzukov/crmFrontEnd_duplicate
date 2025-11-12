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
        <v-autocomplete outlined dense :items='allRefData' item-value="uuid" item-text="fullName" return-object
                        v-model="refFilter" clearable label="Фильтр по отправителю"></v-autocomplete>
        <v-list-item-group>
          <v-list-item v-for="(doc, i) in filteredDocuments" :key="i">
            <v-list-item-action>
              <v-checkbox
                  :input-value="isDocSelected(doc.id)"
                  @change="toggleDocSelection(doc)"
                  :disabled="existDoc.includes(doc.id) || !multiply"
              ></v-checkbox>
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
    refFilter: null,
    dialog: false,
    loading: false,
    existDoc: [],
    multiply: true,
    selectedDoc: [],
    choosedDocs: []
  }),
  computed: {
    ...mapGetters({
      projectDocumentList: 'projectDocumentListData',
      allRefData: 'allRefData'
    }),
    filteredDocuments() {
      if (!this.refFilter) {
        return this.projectDocumentList;
      }
      return this.projectDocumentList.filter(doc => {
        return !!(doc.fromWho && doc.fromWho.uuid === this.refFilter.uuid);
      });
    }
  },
  methods: {
    isDocSelected(docId) {
      return this.selectedDoc.includes(docId);
    },

    toggleDocSelection(doc) {
      const docId = doc.id;
      const isCurrentlySelected = this.isDocSelected(docId);

      if (isCurrentlySelected) {
        // Удаляем документ из выбранных
        this.selectedDoc = this.selectedDoc.filter(id => id !== docId);
        this.choosedDocs = this.choosedDocs.filter(d => d.id !== docId);
      } else {
        // Добавляем документ в выбранные
        this.selectedDoc.push(docId);
        this.choosedDocs.push(doc);
      }

      // Обновляем состояние multiply в зависимости от количества выбранных документов
      if (this.solo && this.selectedDoc.length >= 1) {
        this.multiply = false;
      } else {
        this.multiply = true;
      }
    },

    async open(project, existDoc, departure_date, from_who) {
      this.refFilter = null;
      this.selectedDoc = [];
      this.choosedDocs = [];

      if (Array.isArray(project)) {
        project = project.toString()
      }
      this.dialog = true
      this.loading = true
      if (project) {
        console.log(project)
        await this.$store.dispatch('getProjectDocument', {project}).then(() => {
          if (existDoc) {
            this.existDoc = existDoc
          }
          this.loading = false
        })
      } else {
        await this.$store.dispatch('getProjectDocument',
            {project, departure_date, from_type: from_who?.type, from_uuid: from_who?.uuid}
        ).then(() => {
          if (existDoc) {
            this.existDoc = existDoc
          }
          this.loading = false
        })
      }
    },

    close() {
      this.dialog = false;
      Object.assign(this.$data, this.$options.data())
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
      } else {
        this.$emit('chooseDocs', {formData, "chooseDocs": this.choosedDocs})
        this.close()
      }
    }
  },
  watch: {
    // Убираем старый watcher для choosedDocs, так как теперь управляем multiply в toggleDocSelection
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
    this.$parent.$on('chooseDocs', ({project, existDoc, departure_date, from_who}) => {
      console.log(project, existDoc, departure_date, from_who)
      this.open(project, existDoc, departure_date, from_who)
    })
  }
}
</script>

<style scoped>
* {
  margin: 0;
}
</style>