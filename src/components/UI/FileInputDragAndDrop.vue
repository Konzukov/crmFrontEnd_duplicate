<template>
  <v-row id="upload-container" @click="openFileLoad" justify="center"
         @mouseover="hovered = !hovered"
         @mouseout="hovered = !hovered"
         @drop="dropFile"
         @dragover="dragover"
         @dragleave="dragleave"
         :class="hovered? 'hover': ''"
  >
    <v-file-input v-model="filesUpload" multiple ref="file" class="file-input" id="file-input"></v-file-input>
    <v-icon size="95" :class="hovered ? 'hover': ''">mdi-cloud-upload-outline</v-icon>
  </v-row>
</template>

<script>
export default {
  name: "FileInputDragAndDrop",
  data: () => ({
    filesUpload: [],
    hovered: false,
  }),
  methods: {
    openFileLoad() {
      const fileInput = document.getElementById('file-input')
      fileInput.click()
    },
    dropFile(event) {
      event.preventDefault()
      let files = event.dataTransfer.files;
      this.filesUpload.push(...files)
    },
    dragover(event) {
      event.preventDefault()
      this.hovered = true
    },
    dragleave(event) {
      event.preventDefault()
      this.hovered = false
    }
  },
  watch: {
    filesUpload(files) {
      this.$emit('syncFile', files)
    }
  }
}
</script>

<style scoped>
#upload-container {
  height: 250px;
  width: 250px;
  border: 1px dashed darkgrey;
  position: absolute;
  right: 30px;
  bottom: 50px;
}

#upload-container.hover {
  border: 2px dashed black;
}

.file-input {
  display: none;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.mdi-cloud-upload-outline {
  opacity: 0.4;
}

.mdi-cloud-upload-outline.hover {
  opacity: 1;
  color: #2196F3;
}
</style>