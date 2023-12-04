<template>
  <v-row justify="space-around">
    <v-list-item-content>
      <v-list-item-title v-text="file.fileName"></v-list-item-title>
    </v-list-item-content>
    <v-list-item-icon>
      <v-btn icon @click="downloadFile(file)" :loading="fileDownload.status.downloading && !fileDownload.downloaded"
             plain>
        <template v-slot:loader>
          <v-progress-circular
              :rotate="-90"
              :size="100"
              :width="15"
              :value="fileDownload.progress"
              color="primary"
          >
            {{ fileDownload.progress }}
          </v-progress-circular>
        </template>
        <v-icon>mdi-file-download-outline</v-icon>
      </v-btn>
      <v-btn icon color="error" @click="addToTrash"><v-icon>mdi-delete</v-icon></v-btn>
      <trashFile :file.sync="file"></trashFile>
    </v-list-item-icon>

  </v-row>

</template>

<script>
import {mapActions} from "vuex";
import trashFile from "@/components/FileManager/trashFile";

export default {
  props: {
    file: {
      type: Object,
      require: true
    }
  },
  name: "SingleFile",
  data() {
    return {
      fileDownload: {
        file: {
          name: ''
        },
        status: {
          downloading: false,
          downloaded: false,
          message: null
        },
        process: null
      }
    }
  },
  methods: {
    ...mapActions(['downloadFile']),
    addToTrash(){
      this.$emit('trashFile')
    }
  },
  created() {
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'downloadProgress') {
        if(this.file['fileName'] === mutation.payload['file']){
          this.fileDownload = Object.assign({}, mutation.payload)
        }
      }
    })
  },
  beforeDestroy() {
    this.unsubscribe()
  },
  components: {
    trashFile
  }
}
</script>

<style scoped>

</style>