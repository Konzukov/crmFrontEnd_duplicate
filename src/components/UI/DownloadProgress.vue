<template>
  <v-card
    v-if="activeDownloads.length > 0"
    class="download-progress-container"
    :style="{ right: '20px', top: '70px', position: 'fixed', zIndex: 1000, width: '400px' }"
  >
    <v-card-title class="py-2">
      <span>Загрузки</span>
      <v-spacer></v-spacer>
      <v-btn icon small @click="clearCompleted">
        <v-icon small>mdi-check-all</v-icon>
      </v-btn>
      <v-btn icon small @click="clearAll">
        <v-icon small>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-divider></v-divider>

    <v-list dense class="py-0">
      <v-list-item v-for="download in activeDownloads" :key="download.id">
        <v-list-item-content>
          <v-list-item-title class="text-body-2">
            {{ download.fileName }}
            <v-icon
              small
              :color="downloadColor(download)"
              class="ml-1"
            >
              {{ downloadIcon(download) }}
            </v-icon>
          </v-list-item-title>

          <v-list-item-subtitle class="mt-1">
            <div class="d-flex justify-space-between">
              <span>{{ progressText(download) }}</span>
              <span v-if="download.status === 'downloading' && download.total > 0">
                {{ formatBytes(download.loaded) }} / {{ formatBytes(download.total) }}
              </span>
              <span v-else-if="download.status === 'downloading'">
                {{ formatBytes(download.loaded) }}
              </span>
            </div>

            <v-progress-linear
              :value="download.progress"
              height="8"
              :color="downloadColor(download)"
              :indeterminate="download.total === 0 && download.status === 'downloading'"
              class="mt-1"
            ></v-progress-linear>
          </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
          <v-btn
            icon
            small
            @click="removeDownload(download.id)"
            :color="download.status === 'error' ? 'error' : 'grey'"
          >
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'DownloadProgress',
  computed: {
    ...mapState('downloads', ['downloads']),
    activeDownloads() {
      return this.downloads.filter(d => d.status !== 'dismissed')
    }
  },
  methods: {
    ...mapActions('downloads', ['removeDownload']),
    downloadColor(download) {
      switch (download.status) {
        case 'downloading': return 'primary'
        case 'completed': return 'success'
        case 'error': return 'error'
        default: return 'info'
      }
    },
    downloadIcon(download) {
      switch (download.status) {
        case 'downloading': return 'mdi-download'
        case 'completed': return 'mdi-check'
        case 'error': return 'mdi-alert-circle'
        default: return 'mdi-clock'
      }
    },
    progressText(download) {
      switch (download.status) {
        case 'downloading':
          return download.total > 0 ? `Загрузка: ${download.progress}%` : 'Подготовка...'
        case 'completed': return 'Завершено'
        case 'error': return 'Ошибка'
        default: return 'Ожидание'
      }
    },
    formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return '0 Bytes'

      const k = 1024
      const dm = decimals < 0 ? 0 : decimals
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

      const i = Math.floor(Math.log(bytes) / Math.log(k))

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
    },
    clearCompleted() {
      // Удаляем все завершенные загрузки
      this.downloads
        .filter(d => d.status === 'completed' || d.status === 'error')
        .forEach(d => this.removeDownload(d.id))
    },
    clearAll() {
      // Удаляем все загрузки
      this.downloads.forEach(d => this.removeDownload(d.id))
    }
  }
}
</script>

<style scoped>
.download-progress-container {
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.v-list-item {
  border-bottom: 1px solid #eee;
}

.v-list-item:last-child {
  border-bottom: none;
}
</style>