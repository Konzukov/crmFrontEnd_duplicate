<template>
  <v-container>
    <v-dialog
        hide-overlay
        persistent
        width="50%"
        transition="dialog-bottom-transition"
        scrollable
        v-model="drawer"
    >
      <v-card>
        <v-form lazy-validation v-model="valid" ref="setProject">
          <v-row justify="start" class="ma-12">
            <v-autocomplete outlined multiple dense clearable v-model="projects" label="Выберите проект"
                            :items="projectList" item-text="name" item-value="id" :rules="required">

            </v-autocomplete>
          </v-row>
        </v-form>
        <v-card-actions>
          <v-row justify="space-between" class="ma-5">
            <v-btn color="error" @click="close" :disabled="loader">Закрыть</v-btn>
            <v-btn color="success" @click="validate" :disabled="loader">Применить к выбранным</v-btn>
          </v-row>
        </v-card-actions>
        <v-progress-linear
            v-if="loader"
            v-model="value"
            :active="true"
            :indeterminate="loader"
            :query="true"
        >
          <slot v-if="loader"> Сохранение данных. Ожидайте...</slot>
        </v-progress-linear>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import {mapGetters} from 'vuex'
import customConst from "@/const/customConst";

export default {
  props: ['itemType'],
  name: "PostMassEdit",
  data: () => ({
    drawer: false,
    value: 0,
    loader: false,
    valid: false,
    itemList: [],
    projects: [],
    required: [
      v => !!v || 'Проект не может быть пустым',
    ]
  }),
  computed: {
    ...mapGetters({
      projectList: 'projectListData'
    })
  },
  methods: {
    close() {
      this.drawer = false
      Object.assign(this.$data, this.$options.data());
    },
    validate() {
      if (this.$refs.setProject.validate()) {
        this.save()
      }
    },
    save() {
      this.loader = true
      let formData = new FormData;
      this.postList.forEach(post => {
        formData.append(`${this.itemType}`, post.pk)
      })
      this.projects.forEach(project => {
        formData.append('projects', project)
      })
      let url = '';
      switch (this.itemType) {
        case 'posts':
          url = customConst.PAPERFLOW_API + 'mass-post-edit'
          break
        case 'document':
          url = customConst.PAPERFLOW_API + 'mass-document-edit'
          break
        default:
          console.log('Unknown item type ')
      }
      this.$http({
        method: "POST",
        url: url,
        headers: {
          'Content-Type': 'application/json'
        },
        data: formData
      }).then(res => {
        if (this.itemType === 'post') {
          res.data.data.postList.forEach(post => {
            this.$store.commit('updateOutgoingPost', post)
          })
        } else if (this.itemType === 'document') {
          this.$store.dispatch('getProcessedDocument')
          this.$store.dispatch('getUnProcessedDocument')
          // res.data.data.postList.forEach(document => {
          //   this.$store.commit('updateDocument', document)
          // })
        }
      }).catch(err => {
        console.log(err)
        this.close()
      })
    }
  },
  created() {
    this.$parent.$on('massEdit', (postItem) => {
      this.$store.dispatch('getProjectList')
      this.drawer = true;
      this.postList = postItem
    })
  }
}
</script>

<style scoped>
.v-progress-linear {
  height: 18px !important;
}
</style>