<template>
  <v-container fluid>
    <v-dialog
        class="file-upload"
        style="background-color: white"
        persistent
        transition="backInRight"
        v-model="drawer">
      <v-card>
        <v-toolbar
            dark
            color="primary"
            max-height="60"
        >
          <v-toolbar-title>Добавление файлов</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
                icon
                dark
                @click="drawer = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-row justify="center" class="mr-0">

          <v-col md="10" sm="10" xl="10" lg="10" @drop.prevent="dropAddFile" @dragover.prevent>
            <v-form action="">
              <v-file-input v-model="fileList"
                            outlined multiple height="200" append-icon="" prepend-icon="">
                <template v-slot:label>
                  <i class="el-icon-upload"></i>
                  Перетащите файлы или <em>нажмите для загрузки</em>
                </template>
                <template v-slot:default>

                </template>
              </v-file-input>
            </v-form>
            <v-expansion-panels class="mb-6" focusable tile>
              <SingFileUploader v-for="(file, index) in fileList" :key="index"
                                :file.sync="file" :post.sync="object" @removeFile="removeFile"
                                @fileSaved="_fileSaved"></SingFileUploader>
            </v-expansion-panels>
          </v-col>
        </v-row>

        <v-card-actions>
          <v-row justify="center" class="mr-0">
            <v-btn @click="close" color="error" class="mr-3">
              Закрыть
            </v-btn>
            <v-btn @click="save" color="success" class="ml-3">
              Сохранить
            </v-btn>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>

</template>

<script>
import SingFileUploader from "@/components/FileManager/SingFileUploader";
import {eventBus} from "@/bus";


export default {
  props: {
    object: {
      type: Object,
      required: true,
    },
    objectType: {
      type: String,
      required: true,
    }
  },
  name: "FileUploader",
  data() {
    return {
      drawer: false,
      fileList: [],
    }
  },
  methods: {
    close() {
      this.$confirm('Закрыть окно?')
          .then(_ => {
            this.drawer = false
            Object.assign(this.$data, this.$options.data())
          })
          .catch(_ => {
          });

    },
    dropAddFile(e) {
      let droppedFiles = e.dataTransfer.files;
      if (!droppedFiles) return false;
      ([...droppedFiles]).forEach(file => {
        this.fileList.push(file)
      })
    },
    async save() {
      await eventBus.$emit('saveAllFile')
    },
    removeFile(file) {
      this.fileList = this.fileList.filter(obj => {
        if (obj !== file) {
          return obj
        }
      })
    },
    checkUploadFile(){
      let uploadedCount = 0
      this.fileList.forEach(obj=>{
        if(obj['uploaded']){
          ++uploadedCount
        }
      })
      if(uploadedCount === this.fileList.length){
        this.close()
      }
    },
    _fileSaved(file) {
      this.fileList = this.fileList.filter(obj => {
        if (obj === file) {
          obj['uploaded'] = true
        }
        return obj
      })
      this.checkUploadFile()
    }
  },
  created() {
    this.$parent.$on('addNewFiles', () => {
      this.drawer = true
    })
  },
  components: {
    SingFileUploader
  }
}
</script>

<style scoped>
>>> .v-dialog__content--active {
  background-color: #000000ad;
}

>>> .v-dialog {
  background-color: white !important;
  margin: 0;
  padding: 0;
  width: 90%;
  position: absolute;
  right: 0;
  top: 0;
}


>>> .el-upload, >>> .el-upload-dragger {
  width: 100%;
}
</style>