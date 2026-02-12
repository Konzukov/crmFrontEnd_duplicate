<template>
  <div class="pdf-viewer">
    <v-toolbar dense dark color="grey darken-3">
      <v-btn icon @click="previousPage" :disabled="currentPage <= 1">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-toolbar-title>
        Страница {{ currentPage }} из {{ pageCount }}
      </v-toolbar-title>
      <v-btn icon @click="nextPage" :disabled="currentPage >= pageCount">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn icon @click="zoomOut">
        <v-icon>mdi-magnify-minus</v-icon>
      </v-btn>
      <span class="mx-2">{{ Math.round(scale * 100) }}%</span>
      <v-btn icon @click="zoomIn">
        <v-icon>mdi-magnify-plus</v-icon>
      </v-btn>
      <v-btn icon @click="fitToPage">
        <v-icon>mdi-fit-to-page</v-icon>
      </v-btn>
      <v-btn icon @click="downloadPdf">
        <v-icon>mdi-download</v-icon>
      </v-btn>
      <v-btn icon @click="printPdf">
        <v-icon>mdi-printer</v-icon>
      </v-btn>
      <v-btn icon @click="toggleFullscreen">
        <v-icon>{{ fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}</v-icon>
      </v-btn>
    </v-toolbar>

    <div class="pdf-content" ref="pdfContent" :class="{ 'fullscreen': fullscreen }">
      <vue-pdf-app
        v-if="pdfUrl"
        :pdf="pdfUrl"
        @pages-rendered="onPagesRendered"
        :config="config"
      ></vue-pdf-app>
      <div v-else class="no-pdf">
        <v-icon size="64">mdi-file-pdf-box</v-icon>
        <p>PDF не выбран</p>
      </div>
    </div>
  </div>
</template>

<script>
import VuePdfApp from 'vue-pdf-app'
import 'vue-pdf-app/dist/icons/main.css'

export default {
  name: 'DocumentPdfViewer',
  components: {
    VuePdfApp
  },
  props: {
    pdfUrl: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      currentPage: 1,
      pageCount: 0,
      scale: 1.0,
      fullscreen: false,
      config: {
        sidebar: {
          viewThumbnail: true,
          viewOutline: true,
          viewAttachments: false
        },
        toolbar: false,
        secondaryToolbar: false
      }
    }
  },
  methods: {
    onPagesRendered(pdfApp) {
      this.pageCount = pdfApp.pagesCount
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    nextPage() {
      if (this.currentPage < this.pageCount) {
        this.currentPage++
      }
    },
    zoomIn() {
      this.scale += 0.1
    },
    zoomOut() {
      if (this.scale > 0.3) {
        this.scale -= 0.1
      }
    },
    fitToPage() {
      this.scale = 1.0
    },
    downloadPdf() {
      if (this.pdfUrl) {
        const link = document.createElement('a')
        link.href = this.pdfUrl
        link.download = 'document.pdf'
        link.click()
      }
    },
    printPdf() {
      if (this.pdfUrl) {
        window.print()
      }
    },
    toggleFullscreen() {
      this.fullscreen = !this.fullscreen
      if (this.fullscreen) {
        if (this.$refs.pdfContent.requestFullscreen) {
          this.$refs.pdfContent.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
    }
  }
}
</script>

<style scoped>
.pdf-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pdf-content {
  flex: 1;
  overflow: auto;
  background-color: #525659;
}

.pdf-content.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.no-pdf {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ccc;
}
</style>
