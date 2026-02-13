<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-select
          v-model="filters.direction"
          :items="directionOptions"
          label="Направление"
          clearable
          outlined
          dense
          @change="applyFilters"
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="filters.current_state"
          :items="workflowStates"
          item-text="name"
          item-value="id"
          label="Состояние"
          clearable
          outlined
          dense
          @change="applyFilters"
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="filters.document_type"
          :items="documentTypes"
          item-text="name"
          item-value="id"
          label="Тип документа"
          clearable
          outlined
          dense
          @change="applyFilters"
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-autocomplete
          v-model="filters.project"
          :items="[]"
          label="Проект"
          clearable
          outlined
          dense
          @change="applyFilters"
        ></v-autocomplete>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="documents"
      :loading="loading.documents"
      class="elevation-1"
      :options.sync="options"
      :server-items-length="totalItems"
      @click:row="viewDocument"
    >
      <template v-slot:item.direction="{ item }">
        <v-chip small :color="getDirectionColor(item.direction)">
          {{ getDirectionText(item.direction) }}
        </v-chip>
      </template>

      <template v-slot:item.current_state="{ item }">
        <v-chip
          small
          color="grey"
          dark
        >
          {{ item.current_state || 'Не указано' }}
        </v-chip>
      </template>

      <template v-slot:item.document_type="{ item }">
        {{ item.document_type || '-' }}
      </template>

      <template v-slot:item.executor="{ item }">
        {{ item.executor || '-' }}
      </template>

      <template v-slot:item.project="{ item }">
        {{ item.project ? item.project.name : '-' }}
      </template>

      <template v-slot:item.files="{ item }">
        <div v-if="item.file_count || item.files_count" class="d-flex align-center">
          <v-chip x-small color="primary" outlined class="mr-1">
            <v-icon x-small left>mdi-paperclip</v-icon>
            {{ item.file_count || item.files_count || 0 }}
          </v-chip>
        </div>
        <span v-else class="text--secondary">-</span>
      </template>

      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon small class="mr-2" @click.stop="viewDocument(item)">
          mdi-eye
        </v-icon>
        <v-icon small class="mr-2" @click.stop="editDocument(item)">
          mdi-pencil
        </v-icon>
        <v-icon small @click.stop="deleteDocument(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'

export default {
  name: 'DocumentList',
  data() {
    return {
      headers: [
        { text: 'Название', value: 'title', sortable: true },
        { text: 'Исх. №', value: 'out_number', sortable: true },
        { text: 'Тип документа', value: 'document_type', sortable: false },
        { text: 'Направление', value: 'direction', sortable: false },
        { text: 'Статус', value: 'current_state', sortable: false },
        { text: 'Исполнитель', value: 'executor', sortable: false },
        { text: 'Проект', value: 'project', sortable: false },
        { text: 'Файлы', value: 'files', sortable: false },
        { text: 'Дата создания', value: 'created_at', sortable: true },
        { text: 'Действия', value: 'actions', sortable: false }
      ],
      directionOptions: [
        { text: 'Входящий', value: 'incoming' },
        { text: 'Исходящий', value: 'outgoing' },
        { text: 'Внутренний', value: 'internal' }
      ],
      filters: {
        direction: null,
        current_state: null,
        document_type: null,
        project: null
      },
      options: {},
      totalItems: 0
    }
  },
  computed: {
    ...mapGetters('documentFlow', [
      'getDocuments',
      'getDocumentTypes',
      'getWorkflowStates',
      'getLoading'
    ]),
    documents() {
      return this.getDocuments || []
    },
    documentTypes() {
      return this.getDocumentTypes || []
    },
    workflowStates() {
      return this.getWorkflowStates || []
    },
    loading() {
      return this.getLoading || {}
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    ...mapActions('documentFlow', [
      'fetchDocuments',
      'fetchDocumentTypes',
      'fetchWorkflowStates',
      'deleteDocument'
    ]),
    async loadData() {
      try {
        await Promise.all([
          this.fetchDocuments(),
          this.fetchDocumentTypes(),
          this.fetchWorkflowStates()
        ])
      } catch (error) {
        console.error('Error loading data:', error)
        this.$store.commit('snackbar/showSnackbar', {
          message: 'Ошибка при загрузке данных',
          color: 'error'
        })
      }
    },
    applyFilters() {
      this.$store.commit('documentFlow/SET_FILTERS', this.filters)
      this.fetchDocuments()
    },
    viewDocument(item) {
      this.$router.push({ name: 'doc-flow-detail', params: { id: item.id } })
    },
    editDocument(item) {
      this.$router.push({ name: 'doc-flow-edit', params: { id: item.id } })
    },
    async deleteDocument(item) {
      if (confirm('Вы уверены, что хотите удалить этот документ?')) {
        try {
          await this.$store.dispatch('documentFlow/deleteDocument', item.id)
          this.$store.commit('snackbar/showSnackbar', {
            message: 'Документ удален',
            color: 'success'
          })
        } catch (error) {
          console.error('Error deleting document:', error)
          this.$store.commit('snackbar/showSnackbar', {
            message: 'Ошибка при удалении документа',
            color: 'error'
          })
        }
      }
    },
    getDirectionColor(direction) {
      const colors = {
        incoming: 'blue',
        outgoing: 'green',
        internal: 'orange'
      }
      return colors[direction] || 'grey'
    },
    getDirectionText(direction) {
      const texts = {
        incoming: 'Входящий',
        outgoing: 'Исходящий',
        internal: 'Внутренний'
      }
      return texts[direction] || direction
    },
    formatDate(date) {
      return date ? moment(date).format('DD.MM.YYYY HH:mm') : '-'
    }
  }
}
</script>

<style scoped>
.v-data-table >>> tbody tr {
  cursor: pointer;
}

.v-data-table >>> tbody tr:hover {
  background-color: #f5f5f5 !important;
}
</style>
