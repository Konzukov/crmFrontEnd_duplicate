<template>
  <v-container>
    <v-data-table
        :headers="headers"
        :items="trashPostList"
        :page.sync="page"
        :laoding="loading"
        :items-per-page="15"
        hide-default-footer
        class="elevation-1"
        @page-count="pageCount = $event"
    >
<!--      <template v-slot:item.actions="{ item }">-->
<!--        <v-icon class="mr-2" color="primary" @click="restoreDocument(item)">mdi-backup-restore</v-icon>-->
<!--        <v-icon color="error" @click="deleteDocument(item)">mdi-delete</v-icon>-->
<!--      </template>-->
    </v-data-table>
    <div class="text-center pt-2">
      <v-pagination v-model="page" :length="pageCount"></v-pagination>
    </div>
  </v-container>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'

export default {
  name: "TrashPostList",
  data: () => ({
    loading: true,
    page: 1,
    pageCount: 0,
    headers: [
      {text: 'Почта', value: 'post.rpo'},
      {text: 'Дата удаления', value: 'date'},
      {text: 'Удалил', value: 'user.fullName'},
      {text: 'Проект', value: 'post.project.name'},
      {text: 'Причина удаления', value: 'reason'},
      {text: 'Действия', value: 'actions'},
    ]
  }),
  computed: {
    ...mapGetters({
      trashPostList: 'allTrashPostListData'
    })
  },
  methods: {
    ...mapActions(['getTrashPost'])
  },
  created() {
    this.getTrashPost()
  }
}
</script>

<style scoped>

</style>