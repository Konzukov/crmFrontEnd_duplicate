<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="primary white--text">
            <v-icon left color="white">mdi-file-tree</v-icon>
            Типы документов
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="documentTypeHeaders"
              :items="documentTypes"
              :loading="loading.types"
              class="elevation-1"
            >
              <template v-slot:item.name="{ item }">
                <span :style="{ paddingLeft: (item.level || 0) * 20 + 'px' }">
                  {{ item.name }}
                </span>
              </template>
              <template v-slot:item.code="{ item }">
                <code>{{ item.code }}</code>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title class="primary white--text">
            <v-icon left color="white">mdi-state-machine</v-icon>
            Состояния документов
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="stateHeaders"
              :items="workflowStates"
              :loading="loading.states"
              class="elevation-1"
            >
              <template v-slot:item.name="{ item }">
                <v-chip :color="item.color" dark small>
                  {{ item.name }}
                </v-chip>
              </template>
              <template v-slot:item.code="{ item }">
                <code>{{ item.code }}</code>
              </template>
              <template v-slot:item.description="{ item }">
                {{ item.description || '-' }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title class="primary white--text">
            <v-icon left color="white">mdi-email-outline</v-icon>
            Почтовые аккаунты
            <v-spacer></v-spacer>
            <v-btn color="white" text @click="showMailAccountDialog = true">
              <v-icon left>mdi-plus</v-icon>
              Добавить
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="mailAccountHeaders"
              :items="mailAccounts"
              class="elevation-1"
            >
              <template v-slot:item.is_active="{ item }">
                <v-icon :color="item.is_active ? 'green' : 'grey'">
                  {{ item.is_active ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                </v-icon>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon small class="mr-2" @click="editMailAccount(item)">
                  mdi-pencil
                </v-icon>
                <v-icon small @click="deleteMailAccount(item)">
                  mdi-delete
                </v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mail Account Dialog -->
    <v-dialog v-model="showMailAccountDialog" max-width="500">
      <v-card>
        <v-card-title>
          {{ editingMailAccount ? 'Редактировать' : 'Добавить' }} почтовый аккаунт
        </v-card-title>
        <v-card-text>
          <p>Функция управления почтовыми аккаунтами будет реализована</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showMailAccountDialog = false">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'DocumentFlowSettings',
  data() {
    return {
      showMailAccountDialog: false,
      editingMailAccount: null,
      documentTypeHeaders: [
        { text: 'Название', value: 'name', sortable: true },
        { text: 'Код', value: 'code', sortable: true },
        { text: 'Описание', value: 'description', sortable: false }
      ],
      stateHeaders: [
        { text: 'Название', value: 'name', sortable: true },
        { text: 'Код', value: 'code', sortable: true },
        { text: 'Описание', value: 'description', sortable: false }
      ],
      mailAccountHeaders: [
        { text: 'Email', value: 'email', sortable: true },
        { text: 'Имя', value: 'display_name', sortable: true },
        { text: 'Активен', value: 'is_active', sortable: false },
        { text: 'Действия', value: 'actions', sortable: false }
      ]
    }
  },
  computed: {
    ...mapGetters('documentFlow', [
      'getDocumentTypes',
      'getWorkflowStates',
      'getMailAccounts',
      'getLoading'
    ]),
    documentTypes() {
      return this.getDocumentTypes || []
    },
    workflowStates() {
      return this.getWorkflowStates || []
    },
    mailAccounts() {
      return this.getMailAccounts || []
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
      'fetchDocumentTypes',
      'fetchWorkflowStates',
      'fetchMailAccounts'
    ]),
    async loadData() {
      try {
        await Promise.all([
          this.fetchDocumentTypes(),
          this.fetchWorkflowStates(),
          this.fetchMailAccounts()
        ])
      } catch (error) {
        console.error('Error loading settings:', error)
        this.$store.commit('snackbar/showSnackbar', {
          message: 'Ошибка при загрузке настроек',
          color: 'error'
        })
      }
    },
    editMailAccount(account) {
      this.editingMailAccount = account
      this.showMailAccountDialog = true
    },
    deleteMailAccount(account) {
      if (confirm('Удалить этот почтовый аккаунт?')) {
        console.log('Delete mail account:', account.id)
        // TODO: Implement delete action
      }
    }
  }
}
</script>
