<template>
  <v-dialog v-model="dialog" width="60vw">
    <v-card width="60vw" height="70vh">
      <v-card-text style="height: 65vh; overflow: auto;" class="pt-8">
        <v-row justify="start">
          <v-autocomplete dense label="Проект" outlined v-model="project"
                          @change="getDocument"
                          :items="projectList" item-text="name" item-value="id">
          </v-autocomplete>
        </v-row>
        <v-row justify="start">
          <v-list-item-group multiple v-model="docsList">
            <v-list-item v-for="(doc, i) in availableDoc " :key="i">
              <template v-slot:default="{ active }">
                <v-list-item-action>
                  <v-checkbox :input-value="active" v-model="selectedDoc" :value="doc"></v-checkbox>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>{{ doc.correspondence_type }}</v-list-item-title>
                  <v-list-item-subtitle><a :href=doc.file target="_blank">{{ doc.file }}</a>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </template>
            </v-list-item>
          </v-list-item-group>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-row justify="space-around">
          <v-btn @click="close()" color="error">Закрыть</v-btn>
          <v-btn color="success" @click="addDocToPost">Добавить</v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "PostOrderAddDocument",
  data: () => ({
    dialog: false,
    project: null,
    docsList: [],
    selectedDoc: []
  }),
  methods: {
    close: function () {
      this.dialog = false
      Object.assign(this.$data, this.$options.data())
    },
    getDocument(id) {
      this.$store.dispatch('getProjectDocument', id)
    },
    addDocToPost(){
      this.$emit('addDocToPost', this.selectedDoc)
      this.close()
    }
  },
  computed: {
    projectList() {
      return this.$store.getters.projectListData
    },
    availableDoc() {
      return this.$store.getters.projectDocumentListData
    }
  },
  created() {
    this.$parent.$on('attachDoc', () => {
      this.$store.dispatch('getProjectList')
      this.dialog = true
    })
  }
}
</script>

<style scoped>

</style>