<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="correspondence"
      :loading="loading.correspondence"
      class="elevation-1"
    >
      <template v-slot:item.direction="{ item }">
        <v-icon>{{ getDirectionIcon(item.direction) }}</v-icon>
        <span class="ml-2">{{ getDirectionText(item.direction) }}</span>
      </template>

      <template v-slot:item.delivery_method="{ item }">
        {{ getDeliveryMethodText(item.delivery_method) }}
      </template>

      <template v-slot:item.sender="{ item }">
        {{ getSenderText(item) }}
      </template>

      <template v-slot:item.recipient="{ item }">
        {{ getRecipientText(item) }}
      </template>

      <template v-slot:item.documents_count="{ item }">
        <v-chip small>
          {{ item.documents ? item.documents.length : 0 }}
        </v-chip>
      </template>

      <template v-slot:item.registered_at="{ item }">
        {{ formatDate(item.registered_at) }}
      </template>

      <template v-slot:item.response_indicator="{ item }">
        <v-chip
          v-if="item.sent_date && item.default_response_days"
          small
          :color="getResponseColor(item)"
        >
          {{ getResponseText(item) }}
        </v-chip>
        <span v-else>-</span>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon small class="mr-2" @click="viewCorrespondence(item)">
          mdi-eye
        </v-icon>
        <v-icon small @click="deleteCorrespondence(item)">
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
  name: 'CorrespondenceList',
  data() {
    return {
      headers: [
        { text: 'Направление', value: 'direction', sortable: false },
        { text: 'Способ доставки', value: 'delivery_method', sortable: false },
        { text: 'Тема', value: 'subject', sortable: true },
        { text: 'Отправитель', value: 'sender', sortable: false },
        { text: 'Получатель', value: 'recipient', sortable: false },
        { text: 'Документы', value: 'documents_count', sortable: false },
        { text: 'Дата регистрации', value: 'registered_at', sortable: true },
        { text: 'Срок ответа', value: 'response_indicator', sortable: false },
        { text: 'Действия', value: 'actions', sortable: false }
      ]
    }
  },
  computed: {
    ...mapGetters('documentFlow', ['getCorrespondence', 'getLoading']),
    correspondence() {
      return this.getCorrespondence || []
    },
    loading() {
      return this.getLoading || {}
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    ...mapActions('documentFlow', ['fetchCorrespondence']),
    async loadData() {
      try {
        await this.fetchCorrespondence()
      } catch (error) {
        console.error('Error loading correspondence:', error)
        this.$store.commit('snackbar/showSnackbar', {
          message: 'Ошибка при загрузке корреспонденции',
          color: 'error'
        })
      }
    },
    viewCorrespondence(item) {
      this.$router.push({ name: 'doc-flow-corr-detail', params: { id: item.id } })
    },
    async deleteCorrespondence(item) {
      if (confirm('Удалить эту корреспонденцию?')) {
        console.log('Delete correspondence:', item.id)
        // TODO: Implement delete action
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
    getSenderText(item) {
      if (item.sender_legal) return item.sender_legal.name
      if (item.sender_physical) return item.sender_physical.name
      if (item.sender_text) return item.sender_text
      return '-'
    },
    getRecipientText(item) {
      if (item.recipient_legal) return item.recipient_legal.name
      if (item.recipient_physical) return item.recipient_physical.name
      if (item.recipient_text) return item.recipient_text
      return '-'
    },
    getResponseColor(item) {
      const daysLeft = this.getDaysLeft(item)
      if (daysLeft < 0) return 'grey'
      if (daysLeft < 2) return 'red'
      if (daysLeft <= 5) return 'orange'
      return 'green'
    },
    getResponseText(item) {
      const daysLeft = this.getDaysLeft(item)
      if (daysLeft < 0) return 'Просрочено'
      return `${daysLeft} дн.`
    },
    getDaysLeft(item) {
      if (!item.sent_date || !item.default_response_days) return null
      const sentDate = moment(item.sent_date)
      const responseDate = sentDate.add(item.default_response_days, 'days')
      return responseDate.diff(moment(), 'days')
    },
    formatDate(date) {
      return date ? moment(date).format('DD.MM.YYYY HH:mm') : '-'
    }
  }
}
</script>
