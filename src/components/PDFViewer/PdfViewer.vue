<template>
  <v-dialog
    v-model="dialog"
    max-width="1400"
    fullscreen
    persistent
  >
    <v-card class="d-flex flex-column pdf-viewer-wrapper" style="height: 100vh;">
      <!-- Заголовок -->
      <v-card-title class="pdf-header primary darken-2 white--text py-1 flex-grow-0">
        <v-icon left color="white" small>mdi-file-pdf-box</v-icon>
        <span class="text-subtitle-2 font-weight-medium">{{ fileName }}</span>
        <v-spacer></v-spacer>
        <v-btn icon dark x-small @click="close">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Основной контент -->
      <div class="main-content flex-grow-1 d-flex" style="overflow: hidden;">
        <!-- Боковая панель с превью страниц -->
        <div class="thumbnail-sidebar" v-if="totalPages > 0">
          <div class="thumbnail-header pa-2">
            <span class="text-caption font-weight-medium">Страницы</span>
            <v-spacer></v-spacer>
            <span class="text-caption text--secondary">{{ totalPages }}</span>
          </div>
          <div class="thumbnail-list">
            <div
              v-for="page in totalPages"
              :key="page"
              @click="goToPage(page)"
              :class="{ 'active-thumbnail': page === pageNumber }"
              class="thumbnail-item"
            >
              <div class="thumbnail-canvas-container">
                <canvas
                  :ref="`thumbnailCanvas-${page}`"
                  class="thumbnail-canvas"
                ></canvas>
                <div class="thumbnail-page-number">{{ page }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Основная область просмотра -->
        <div class="pdf-content flex-grow-1 d-flex flex-column">
          <!-- Панель инструментов -->
          <v-card-text class="pa-1 flex-grow-0 adobe-toolbar">
            <v-row align="center" no-gutters>
              <!-- Навигация по страницам -->
              <v-col cols="auto" class="toolbar-section">
                <v-btn
                  icon
                  small
                  :disabled="pageNumber <= 1"
                  @click="previousPage"
                  class="toolbar-btn"
                >
                  <v-icon small>mdi-chevron-left</v-icon>
                </v-btn>
                <v-text-field
                  v-model="pageInput"
                  type="number"
                  min="1"
                  :max="totalPages"
                  hide-details
                  dense
                  single-line
                  style="max-width: 50px; margin: 0 4px;"
                  class="page-input"
                  @change="goToPageInput"
                  @keyup.enter="goToPageInput"
                ></v-text-field>
                <span class="text-caption mx-1">из {{ totalPages }}</span>
                <v-btn
                  icon
                  small
                  :disabled="pageNumber >= totalPages"
                  @click="nextPage"
                  class="toolbar-btn"
                >
                  <v-icon small>mdi-chevron-right</v-icon>
                </v-btn>
              </v-col>

              <v-divider vertical class="mx-2"></v-divider>

              <!-- Масштаб -->
              <v-col cols="auto" class="toolbar-section">
                <v-btn
                  icon
                  small
                  :disabled="currentScale <= 0.25"
                  @click="zoomOut"
                  class="toolbar-btn"
                >
                  <v-icon small>mdi-magnify-minus</v-icon>
                </v-btn>
                <div class="zoom-display text-caption mx-2" style="min-width: 60px; text-align: center;">
                  {{ Math.round(currentScale * 100) }}%
                </div>
                <v-btn
                  icon
                  small
                  :disabled="currentScale >= 4"
                  @click="zoomIn"
                  class="toolbar-btn"
                >
                  <v-icon small>mdi-magnify-plus</v-icon>
                </v-btn>
              </v-col>

              <v-divider vertical class="mx-2"></v-divider>

              <!-- Режимы отображения -->
              <v-col cols="auto" class="toolbar-section">
                <v-btn
                  small
                  text
                  @click="setScaleMode('auto')"
                  :class="{ 'active-mode': scaleMode === 'auto' }"
                  class="mode-btn"
                >
                  По ширине
                </v-btn>
                <v-btn
                  small
                  text
                  @click="setScaleMode('page')"
                  :class="{ 'active-mode': scaleMode === 'page' }"
                  class="mode-btn"
                >
                  По странице
                </v-btn>
                <v-btn
                  small
                  text
                  @click="setScaleTo100"
                  :class="{ 'active-mode': scaleMode === 'custom' && currentScale === 1 }"
                  class="mode-btn"
                >
                  100%
                </v-btn>
              </v-col>

              <v-spacer></v-spacer>

              <!-- Дополнительные инструменты -->
              <v-col cols="auto" class="toolbar-section">
                <v-btn
                  icon
                  small
                  @click="rotate(-90)"
                  class="toolbar-btn"
                  title="Повернуть против часовой стрелки"
                >
                  <v-icon small>mdi-rotate-left</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  @click="rotate(90)"
                  class="toolbar-btn"
                  title="Повернуть по часовой стрелки"
                >
                  <v-icon small>mdi-rotate-right</v-icon>
                </v-btn>

                <v-progress-circular
                  v-if="loading"
                  indeterminate
                  size="16"
                  width="2"
                  color="primary"
                  class="ml-2"
                ></v-progress-circular>
              </v-col>
            </v-row>
          </v-card-text>

          <!-- Область просмотра PDF -->
          <div class="pdf-viewport-container flex-grow-1" ref="pdfViewportContainer">
            <div class="pdf-viewport" ref="pdfViewport" @wheel="onWheel">
              <div class="pdf-container" ref="pdfContainer">
                <div class="pdf-page-wrapper" :style="pageWrapperStyle">
                  <div class="pdf-page-container" :style="pageContainerStyle">
                    <canvas
                      ref="pdfCanvas"
                      class="pdf-canvas"
                    ></canvas>
                    <div
                      ref="textLayer"
                      class="textLayer"
                      :style="textLayerStyle"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Статус бар -->
      <v-card-actions class="pa-1 flex-grow-0 status-bar">
        <div class="text-caption status-text">
          Страница {{ pageNumber }} из {{ totalPages }} • {{ Math.round(currentScale * 100) }}%
        </div>
        <v-spacer></v-spacer>
        <div class="text-caption status-text" v-if="fileSize > 0">
          {{ fileSizeInfo }}
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import 'pdfjs-dist/legacy/build/pdf.worker.entry'

// Импортируем необходимые компоненты из PDF.js
const pdfjsViewer = require('pdfjs-dist/legacy/web/pdf_viewer');
const { TextLayerBuilder, EventBus } = pdfjsViewer;

pdfjsLib.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/legacy/build/pdf.worker.entry')

export default {
  name: 'PdfViewer',

  props: {
    value: {
      type: Boolean,
      default: false
    },
    src: {
      type: [String, File, Blob],
      required: true
    },
    fileName: {
      type: String,
      default: 'document.pdf'
    }
  },

  data: () => ({
    pdfDoc: null,
    pageNumber: 1,
    totalPages: 0,
    scaleMode: 'page',
    currentScale: 1,
    loading: false,
    canvas: null,
    ctx: null,
    renderTask: null,
    isInitialized: false,
    pageInput: 1,
    rotation: 0,
    fileSize: 0,
    thumbnailRenderTasks: [],
    resizeObserver: null,
    viewport: null,
    textLayerBuilder: null,
    pageWidth: 0,
    pageHeight: 0,
    textLayerDiv: null,
    eventBus: null
  }),

  computed: {
    dialog: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },

    pageWrapperStyle() {
      return {
        transform: `rotate(${this.rotation}deg)`
      }
    },

    pageContainerStyle() {
      return {
        width: `${this.pageWidth}px`,
        height: `${this.pageHeight}px`
      }
    },

    textLayerStyle() {
      return {
        width: `${this.pageWidth}px`,
        height: `${this.pageHeight}px`
      }
    },

    fileSizeInfo() {
      if (this.fileSize === 0) return ''
      const units = ['Б', 'КБ', 'МБ', 'ГБ']
      let size = this.fileSize
      let unitIndex = 0
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      return `${size.toFixed(1)} ${units[unitIndex]}`
    }
  },

  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            this.initializeComponents()
            this.loadPdf()
            this.setupResizeObserver()
          })
        } else {
          this.cleanup()
        }
      }
    },
    pageNumber(newVal) {
      this.pageInput = newVal
      if (this.isInitialized) {
        this.renderCurrentPage()
      }
    },
    currentScale() {
      if (this.isInitialized && this.scaleMode === 'custom') {
        this.renderCurrentPage()
      }
    },
    scaleMode() {
      if (this.isInitialized) {
        this.renderCurrentPage()
      }
    },
    rotation() {
      if (this.isInitialized) {
        this.renderCurrentPage()
      }
    }
  },

  methods: {
    initializeComponents() {
      if (this.$refs.pdfCanvas) {
        this.canvas = this.$refs.pdfCanvas
        this.ctx = this.canvas.getContext('2d')
        this.textLayerDiv = this.$refs.textLayer
        // Создаем eventBus для TextLayerBuilder
        this.eventBus = new EventBus()
        this.isInitialized = true
      }
    },

    setupResizeObserver() {
      if (this.$refs.pdfViewportContainer && 'ResizeObserver' in window) {
        this.resizeObserver = new ResizeObserver(() => {
          if (this.isInitialized && this.pdfDoc && (this.scaleMode === 'auto' || this.scaleMode === 'page')) {
            this.renderCurrentPage()
          }
        })
        this.resizeObserver.observe(this.$refs.pdfViewportContainer)
      }
    },

    async loadPdf() {
      if (!this.isInitialized) {
        setTimeout(() => this.loadPdf(), 100)
        return
      }

      this.loading = true
      try {
        let pdfSource
        this.fileSize = 0

        if (this.src instanceof File || this.src instanceof Blob) {
          const arrayBuffer = await this.readFileAsArrayBuffer(this.src)
          pdfSource = {data: arrayBuffer}
          this.fileSize = this.src.size || arrayBuffer.byteLength
        } else if (typeof this.src === 'string') {
          pdfSource = this.src
        }

        const loadingTask = pdfjsLib.getDocument(pdfSource)
        this.pdfDoc = await loadingTask.promise
        this.totalPages = this.pdfDoc.numPages
        this.pageNumber = 1
        this.pageInput = 1

        await this.renderCurrentPage()
        this.renderThumbnails()

        this.$emit('loaded', {totalPages: this.totalPages})
      } catch (error) {
        console.error('Ошибка загрузки PDF:', error)
        this.$emit('error', error)
        this.$store.dispatch('snackbar/showSnackbar', {
          text: 'Ошибка загрузки PDF файла',
          color: 'error'
        }, {root: true})
      } finally {
        this.loading = false
      }
    },

    async renderCurrentPage() {
      if (!this.pdfDoc || !this.isInitialized || this.loading) return

      if (this.renderTask) {
        this.renderTask.cancel()
      }

      // Очищаем предыдущий текстовый слой
      if (this.textLayerDiv) {
        this.textLayerDiv.innerHTML = ''
      }

      this.loading = true

      try {
        const page = await this.pdfDoc.getPage(this.pageNumber)

        // Рассчитываем масштаб
        let scale = this.currentScale
        if (this.scaleMode === 'auto') {
          const container = this.$refs.pdfViewportContainer
          if (container) {
            const containerWidth = container.clientWidth - 80
            const pageViewport = page.getViewport({scale: 1})
            scale = containerWidth / pageViewport.width
          }
        } else if (this.scaleMode === 'page') {
          const container = this.$refs.pdfViewportContainer
          if (container) {
            const containerWidth = container.clientWidth - 80
            const containerHeight = container.clientHeight - 80
            const pageViewport = page.getViewport({scale: 1})
            scale = Math.min(
                containerWidth / pageViewport.width,
                containerHeight / pageViewport.height
            )
          }
        }

        // Получаем viewport
        this.viewport = page.getViewport({
          scale: scale,
          rotation: this.rotation
        })

        if (this.scaleMode !== 'custom') {
          this.currentScale = scale
        }

        // Устанавливаем размеры страницы
        this.pageWidth = this.viewport.width
        this.pageHeight = this.viewport.height

        // Настраиваем canvas
        const pixelRatio = window.devicePixelRatio || 1
        this.canvas.width = Math.floor(this.viewport.width * pixelRatio)
        this.canvas.height = Math.floor(this.viewport.height * pixelRatio)
        this.canvas.style.width = `${this.viewport.width}px`
        this.canvas.style.height = `${this.viewport.height}px`

        // Рендерим страницу
        this.ctx.save()
        this.ctx.scale(pixelRatio, pixelRatio)
        this.ctx.imageSmoothingEnabled = false

        const renderContext = {
          canvasContext: this.ctx,
          viewport: this.viewport,
        }

        this.renderTask = page.render(renderContext)
        await this.renderTask.promise
        this.ctx.restore()

        // Рендерим текстовый слой
        await this.renderTextLayer(page)

      } catch (error) {
        if (error.name !== 'RenderingCancelled') {
          console.error('Ошибка рендеринга страницы:', error)
        }
      } finally {
        this.loading = false
        this.renderTask = null
      }
    },

    async renderTextLayer(page) {
      if (!this.textLayerDiv || !this.eventBus) return

      try {
        // Получаем текстовое содержимое
        const textContent = await page.getTextContent()

        // Очищаем текстовый слой
        this.textLayerDiv.innerHTML = ''

        // Создаем текстовый слой с правильными параметрами
        const textLayerOptions = {
          textLayerDiv: this.textLayerDiv,
          pageIndex: page.pageIndex,
          viewport: this.viewport,
          // Убрали enhanceTextSelection так как он deprecated
          eventBus: this.eventBus // Добавили обязательный eventBus
        }

        this.textLayerBuilder = new TextLayerBuilder(textLayerOptions)
        this.textLayerBuilder.setTextContent(textContent)
        this.textLayerBuilder.render()

        // Ждем пока текстовый слой полностью отрендерится
        await new Promise(resolve => setTimeout(resolve, 50))

        // Применяем CSS стили для правильного отображения
        this.applyTextLayerStyles()

      } catch (error) {
        console.error('Ошибка рендеринга текстового слоя:', error)
      }
    },

    applyTextLayerStyles() {
      if (!this.textLayerDiv) return

      // Применяем стили ко всем span элементам в текстовом слое
      const spans = this.textLayerDiv.querySelectorAll('span')
      spans.forEach(span => {
        span.style.color = 'transparent'
        span.style.position = 'absolute'
        span.style.whiteSpace = 'pre'
        span.style.cursor = 'text'
        span.style.transformOrigin = '0% 0%'
        span.style.pointerEvents = 'auto'
        span.style.fontSize = '0' // Важно для правильного позиционирования
      })
    },

    async renderThumbnails() {
      if (!this.pdfDoc) return

      this.thumbnailRenderTasks.forEach(task => {
        if (task && task.cancel) task.cancel()
      })
      this.thumbnailRenderTasks = []

      for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
        try {
          const page = await this.pdfDoc.getPage(pageNum)
          const thumbnailCanvas = this.$refs[`thumbnailCanvas-${pageNum}`]?.[0]

          if (!thumbnailCanvas) continue

          const viewport = page.getViewport({scale: 0.15})
          const ctx = thumbnailCanvas.getContext('2d')

          ctx.imageSmoothingEnabled = false

          thumbnailCanvas.height = viewport.height
          thumbnailCanvas.width = viewport.width
          thumbnailCanvas.style.height = `${viewport.height}px`
          thumbnailCanvas.style.width = `${viewport.width}px`

          const renderContext = {
            canvasContext: ctx,
            viewport: viewport
          }

          const renderTask = page.render(renderContext)
          this.thumbnailRenderTasks.push(renderTask)
          await renderTask.promise

        } catch (error) {
          if (error.name !== 'RenderingCancelled') {
            console.error(`Ошибка рендеринга превью страницы ${pageNum}:`, error)
          }
        }
      }
    },

    onWheel(event) {
      if (event.ctrlKey) {
        event.preventDefault()
        const delta = -Math.sign(event.deltaY)

        if (delta > 0) {
          this.zoomIn()
        } else {
          this.zoomOut()
        }
      }
    },

    readFileAsArrayBuffer(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
      })
    },

    previousPage() {
      if (this.pageNumber > 1) {
        this.pageNumber--
      }
    },

    nextPage() {
      if (this.pageNumber < this.totalPages) {
        this.pageNumber++
      }
    },

    goToPage(page) {
      const pageNum = parseInt(page)
      if (pageNum >= 1 && pageNum <= this.totalPages) {
        this.pageNumber = pageNum
      }
    },

    goToPageInput() {
      this.goToPage(this.pageInput)
    },

    zoomIn() {
      this.scaleMode = 'custom'
      const newScale = Math.min(this.currentScale + 0.25, 4)
      this.currentScale = Math.round(newScale * 100) / 100
    },

    zoomOut() {
      this.scaleMode = 'custom'
      const newScale = Math.max(this.currentScale - 0.25, 0.25)
      this.currentScale = Math.round(newScale * 100) / 100
    },

    setScaleMode(mode) {
      this.scaleMode = mode
    },

    setScaleTo100() {
      this.scaleMode = 'custom'
      this.currentScale = 1
    },

    rotate(degrees) {
      this.rotation = (this.rotation + degrees) % 360
    },

    close() {
      this.dialog = false
      this.$emit('close')
    },

    cleanup() {
      if (this.renderTask) {
        this.renderTask.cancel()
      }

      this.thumbnailRenderTasks.forEach(task => {
        if (task && task.cancel) task.cancel()
      })
      this.thumbnailRenderTasks = []

      if (this.textLayerBuilder) {
        this.textLayerBuilder = null
      }

      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
      }

      if (this.pdfDoc) {
        this.pdfDoc.destroy()
        this.pdfDoc = null
      }

      this.pageNumber = 1
      this.pageInput = 1
      this.totalPages = 0
      this.scaleMode = 'page'
      this.currentScale = 1
      this.rotation = 0
      this.isInitialized = false
      this.fileSize = 0
      this.viewport = null
      this.pageWidth = 0
      this.pageHeight = 0
      this.textLayerDiv = null
      this.eventBus = null
    }
  },

  beforeDestroy() {
    this.cleanup()
  }
}
</script>

<style scoped>
.pdf-viewer-wrapper {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.pdf-header {
  background: linear-gradient(135deg, #1565C0, #0D47A1) !important;
  border-bottom: 1px solid #0D47A1;
  min-height: 36px !important;
}

.thumbnail-sidebar {
  width: 160px;
  background: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.thumbnail-header {
  background: #e9ecef;
  border-bottom: 1px solid #dee2e6;
  min-height: 40px;
  display: flex;
  align-items: center;
}

.thumbnail-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.thumbnail-item {
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  background: white;
}

.thumbnail-item:hover {
  border-color: #2196F3;
}

.thumbnail-item.active-thumbnail {
  border-color: #2196F3;
  background: #e3f2fd;
}

.thumbnail-canvas-container {
  position: relative;
  width: 100%;
  padding-bottom: 141.4%;
  background: white;
}

.thumbnail-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 1px solid #ddd;
}

.thumbnail-page-number {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 1px 4px;
  font-size: 9px;
  line-height: 1;
}

.adobe-toolbar {
  background: #f1f3f4 !important;
  border-bottom: 1px solid #dadce0;
  min-height: 48px !important;
}

.toolbar-section {
  display: flex;
  align-items: center;
  padding: 0 4px;
}

.toolbar-btn {
  margin: 0 2px;
  color: #5f6368 !important;
}

.toolbar-btn:hover {
  background: #e8f0fe !important;
  color: #1967d2 !important;
}

.mode-btn {
  margin: 0 2px;
  color: #5f6368 !important;
  font-size: 12px !important;
  min-width: auto !important;
  padding: 0 8px !important;
}

.mode-btn.active-mode {
  background: #e8f0fe !important;
  color: #1967d2 !important;
}

.page-input {
  font-size: 12px !important;
}

.pdf-viewport-container {
  background: #525659;
  position: relative;
  overflow: auto;
}

.pdf-viewport {
  min-height: 100%;
  min-width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px;
}

.pdf-container {
  display: inline-block;
  position: relative;
}

.pdf-page-wrapper {
  position: relative;
  transition: transform 0.2s ease;
}

.pdf-page-container {
  position: relative;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  background: white;
}

.pdf-canvas {
  display: block;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

/* Текстовый слой - КРИТИЧЕСКИ ВАЖНЫЕ СТИЛИ */
.textLayer {
  position: absolute;
  left: 0;
  top: 0;
  overflow: hidden;
  line-height: 1.0;
  pointer-events: none;
  font-size: 0;
  z-index: 2;
}

/* Стили для span элементов внутри текстового слоя */
.textLayer ::v-deep span {
  color: transparent !important;
  position: absolute !important;
  white-space: pre !important;
  cursor: text !important;
  transform-origin: 0% 0% !important;
  pointer-events: auto !important;
  font-size: 0 !important;
  line-height: 1 !important;
}

.textLayer ::v-deep span::selection {
  background: rgba(0, 0, 255, 0.3) !important;
}

.textLayer ::v-deep span::-moz-selection {
  background: rgba(0, 0, 255, 0.3) !important;
}

.status-bar {
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  min-height: 32px !important;
}

.status-text {
  color: #5f6368;
  font-size: 11px;
}

.thumbnail-list::-webkit-scrollbar {
  width: 6px;
}

.thumbnail-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.thumbnail-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
}

.thumbnail-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.pdf-viewport-container::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.pdf-viewport-container::-webkit-scrollbar-track {
  background: #424242;
}

.pdf-viewport-container::-webkit-scrollbar-thumb {
  background: #686868;
  border-radius: 6px;
}

.pdf-viewport-container::-webkit-scrollbar-thumb:hover {
  background: #7e7e7e;
}

@media (max-width: 960px) {
  .thumbnail-sidebar {
    width: 140px;
  }
}

@media (max-width: 768px) {
  .thumbnail-sidebar {
    width: 120px;
  }

  .adobe-toolbar .toolbar-section {
    padding: 0 2px;
  }

  .mode-btn {
    font-size: 11px !important;
    padding: 0 4px !important;
  }

  .pdf-viewport {
    padding: 20px;
  }
}

:deep(.v-text-field__details) {
  display: none;
}

:deep(.v-input__control) {
  min-height: auto !important;
}

:deep(.v-text-field.v-text-field--enclosed .v-input__prepend-inner,
       .v-text-field.v-text-field--enclosed .v-input__prepend-outer,
       .v-text-field.v-text-field--enclosed .v-input__append-inner,
       .v-text-field.v-text-field--enclosed .v-input__append-outer) {
  margin-top: 0;
}
</style>