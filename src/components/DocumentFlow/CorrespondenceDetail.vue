<template>
  <v-container fluid v-if="correspondence">
    <v-card>
      <v-card-title class="primary white--text">
        <v-icon left color="white">mdi-email-multiple</v-icon>
        {{ correspondence.subject || 'Корреспонденция' }}
        <v-spacer></v-spacer>
        <v-btn icon color="white" @click="$router.back()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-row>
          <v-col cols="12" md="6">
            <div class="mb-2">
              <strong>Направление:</strong>
              <v-icon class="ml-2">{{ getDirectionIcon(correspondence.direction) }}</v-icon>
              {{ getDirectionText(correspondence.direction) }}
            </div>
            <div class="mb-2">
              <strong>Способ доставки:</strong> {{ getDeliveryMethodText(correspondence.delivery_method) }}
            </div>
            <div class="mb-2" v-if="correspondence.sender_legal">
              <strong>Отправитель (юр. лицо):</strong> {{ correspondence.sender_legal.name }}
            </div>
            <div class="mb-2" v-if="correspondence.sender_physical">
              <strong>Отправитель (физ. лицо):</strong> {{ correspondence.sender_physical.name }}
            </div>
            <div class="mb-2" v-if="correspondence.sender_text">
              <strong>Отправитель (текст):</strong> {{ correspondence.sender_text }}
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="mb-2" v-if="correspondence.recipient_legal">
              <strong>Получатель (юр. лицо):</strong> {{ correspondence.recipient_legal.name }}
            </div>
            <div class="mb-2" v-if="correspondence.recipient_physical">
              <strong>Получатель (физ. лицо):</strong> {{ correspondence.recipient_physical.name }}
            </div>
            <div class="mb-2" v-if="correspondence.recipient_text">
              <strong>Получатель (текст):</strong> {{ correspondence.recipient_text }}
            </div>
            <div class="mb-2" v-if="correspondence.received_date">
              <strong>Дата получения:</strong> {{ formatDate(correspondence.received_date) }}
            </div>
            <div class="mb-2" v-if="correspondence.sent_date">
              <strong>Дата отправки:</strong> {{ formatDate(correspondence.sent_date) }}
            </div>
            <div class="mb-2" v-if="correspondence.registered_at">
              <strong>Дата регистрации:</strong> {{ formatDate(correspondence.registered_at) }}
            </div>
          </v-col>
        </v-row>

        <v-row v-if="correspondence.description">
          <v-col cols="12">
            <div class="mb-2">
              <strong>Описание:</strong>
              <div class="mt-1">{{ correspondence.description }}</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="mt-4">
      <v-card-title>
        <v-icon left>mdi-file-document-multiple</v-icon>
        Документы
        <v-spacer></v-spacer>
        <v-btn small color="primary" @click="showAddDocumentsDialog = true">
          <v-icon small left>mdi-plus</v-icon>
          Добавить
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-list v-if="correspondence.documents && correspondence.documents.length">
          <v-list-item
            v-for="doc in correspondence.documents"
            :key="doc.id"
            @click="viewDocument(doc)"
          >
            <v-list-item-content>
              <v-list-item-title>{{ doc.title }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ doc.out_number ? `№ ${doc.out_number}` : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon small @click.stop="removeDocument(doc)">
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <div v-else class="text-center grey--text">
          Нет прикрепленных документов
        </div>
      </v-card-text>
    </v-card>

    <!-- Add Documents Dialog -->
    <v-dialog v-model="showAddDocumentsDialog" max-width="500">
      <v-card>
        <v-card-title>Добавить документы</v-card-title>
        <v-card-text>
          <p>Функция добавления документов будет реализована</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showAddDocumentsDialog = false">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  <v-container v-else fluid class="text-center">
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'

export default {
  name: 'CorrespondenceDetail',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      showAddDocumentsDialog: false
    }
  },
  computed: {
    ...mapGetters('documentFlow', ['getCurrentCorrespondence']),
    correspondence() {
      return this.getCurrentCorrespondence
    }
  },
  async mounted() {
    await this.loadCorrespondence()
  },
  methods: {
    ...mapActions('documentFlow', [
      'fetchCorrespondenceDetail',
      'removeDocumentsFromCorrespondence'
    ]),
    async loadCorrespondence() {
      try {
        await this.fetchCorrespondenceDetail(this.id)
      } catch (error) {
        console.error('Error loading correspondence:', error)
        this.$store.commit('snackbar/showSnackbar', {
          message: 'Ошибка при загрузке корреспонденции',
          color: 'error'
        })
      }
    },
    viewDocument(doc) {
      this.$router.push({ name: 'doc-flow-detail', params: { id: doc.id } })
    },
    async removeDocument(doc) {
      if (confirm('Удалить документ из корреспонденции?')) {
        try {
          await this.removeDocumentsFromCorrespondence({
            correspondenceId: this.correspondence.id,
            documentIds: [doc.id]
          })
          this.$store.commit('snackbar/showSnackbar', {
            message: 'Документ удален',
            color: 'success'
          })
        } catch (error) {
          console.error('Error removing document:', error)
          this.$store.commit('snackbar/showSnackbar', {
            message: 'Ошибка при удалении документа',
            color: 'error'
          })
        }
      }
    },
    getDirectionIcon(direction) {
      const icons = {
        incoming: 'mdi-arrow-left',
        outgoing: 'mdi-arrow-right',
        internal: 'mdi-arrow-left-right'
      }
      return icons[direction] || 'mdi-help'
    },
    getDirectionText(direction) {
      const texts = {
        incoming: 'Входящая',
        outgoing: 'Исходящая',
        internal: 'Внутренняя'
      }
      return texts[direction] || direction
    },
    getDeliveryMethodText(method) {
      const texts = {
        mail: 'Почта',
        email: 'Email',
        courier: 'Курьер',
        edm: 'ЭДО',
        fax: 'Факс',
        other: 'Другое'
      }
      return texts[method] || method
    },
    formatDate(date) {
      return date ? moment(date).format('DD.MM.YYYY HH:mm') : '-'
    }
  }
}
</script>
