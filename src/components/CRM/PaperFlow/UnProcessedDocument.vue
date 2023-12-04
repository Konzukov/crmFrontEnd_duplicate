<template>
  <v-container fluid>
    <v-data-table
        show-select
        @contextmenu:row.prevent="openContextMenu"
        v-model="editableItem"
        :headers="headers"
        :items="unProcessesDocumentList"
        :page.sync="page"
        :items-per-page="15"
        hide-default-footer
        class="elevation-1"
        height="75vh"
        @page-count="pageCount = $event"
    >
      <template v-slot:item.actions="{ item }">
        <v-icon class="mr-2" color="primary" @click="downloadDoc(item)">mdi-download</v-icon>
        <v-icon class="mr-2" color="success" @click="editItem(item)">mdi-pencil</v-icon>
        <v-icon color="error" @click="deleteItem(item)">mdi-delete</v-icon>
      </template>
    </v-data-table>
    <div class="text-center pt-2">
      <v-pagination v-model="page" :length="pageCount" :total-visible="7"></v-pagination>
    </div>
    <editDocument></editDocument>
    <deleteDocument></deleteDocument>
    <massEdit item-type="document"></massEdit>
    <MouseContextMenu :display="false"  ref="contextMenu">
      <li @click="massEdit">Редактировать выбранные</li>
      <!--      <li >Скачать выбранные</li>-->
    </MouseContextMenu>
  </v-container>
</template>

<script>
import editDocument from "./modal/editDocument";
import deleteDocument from "./modal/deleteDocument"
import MouseContextMenu from "@/components/UI/MouseContextMenu";
import massEdit from "@/components/CRM/PaperFlow/Post/modal/massEdit";



export default {
  name: "UnProcessedDocument",
  data() {
    return {
      page: 1,
      pageCount: 0,
      editableItem: [],
      headers: [
        {text: 'Документ', value: 'fileName'},
        {text: 'Дата получения', value: 'receiving_date'},
        {text: 'Автор', value: 'author.fullName'},
        {text: 'От кого', value: 'fromWho.fullName'},
        {text: 'Кому', value: 'to.fullName'},
        {text: 'Проект', value: 'project.name'},
        {text: 'Действия', value: 'actions'},
      ]
    }
  },
  methods: {
    getFromFile(obj) {

    },
    editItem(doc) {
      this.$emit('editDoc', doc.pk)
    },
    downloadDoc(doc) {
      this.$store.dispatch('downloadDocument', {'pk': doc.pk, 'fileName': doc.fileName})
    },
    deleteItem(doc) {
      this.$emit('delDoc', doc)
    },
    openContextMenu(e) {
      if (this.editableItem.length > 0) {
        this.$refs.contextMenu.open(e)
      }
    },
    massEdit() {
      this.$emit('massEdit', this.editableItem)
    }
  },
  computed: {
    unProcessesDocumentList: {
      get() {
        let data = this.$store.getters.unProcessedDocumentListData
        if (data) {
          return this.$store.getters.unProcessedDocumentListData
        }
        return new Array()
      }
    }
  },
  created() {
    this.$store.dispatch('getUnProcessedDocument')
  },
  components: {
    editDocument,
    deleteDocument,
    MouseContextMenu,
    massEdit
  }
}
</script>

<style scoped>

</style>