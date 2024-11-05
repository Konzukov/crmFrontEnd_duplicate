<template>
  <v-container fluid>
    <v-row justify="end" class="mt-4 mr-4">
      <v-btn icon @click="view='list'">
        <v-icon>mdi-view-list</v-icon>
      </v-btn>
      <v-btn icon @click="view='table'">
        <v-icon>mdi-table</v-icon>
      </v-btn>
    </v-row>
    <v-row class="ml-4 mr-4">
      <template v-for="(file, i) in fileList">
        <template v-if="view==='table'">
          <v-col lg="2" md="3" sm="4" xs="6" :key="i" class="file">
            <v-card height="250px" width="100%">
              <v-card-text :class="['file-type', file['extension']]">
                <v-row justify="start" class="pl-15">
                  Дата: {{ file['entry_date'] | dateFormat }}
                </v-row>
                <v-row justify="start" class="pl-15">
                  Размер: {{ file['size'] | sizeFormat }}
                </v-row>
              </v-card-text>
              <v-card-text class="file-name" style="height: 50%;">
                {{ file.file }}
              </v-card-text>
              <v-card-actions>
                <v-row justify="center" class="pb-3">
                  <v-btn icon @click="downloadDocument(file)">
                    <v-icon>mdi-download</v-icon>
                  </v-btn>
                  <v-btn icon @click="showDocument(file)">
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>

                </v-row>
              </v-card-actions>
            </v-card>
          </v-col>
        </template>
        <template v-else-if="view==='list'">
          <v-col cols="12" :key="i">
            <v-row justify="start" class="list-view">
              <v-col cols="1" :class="['file-type', 'small', file['extension']]"></v-col>
              <v-col cols="5">{{ file['file'] }}</v-col>
              <v-col cols="2">{{ file['entry_date'] | dateFormat }}</v-col>
              <v-col cols="2">{{ file['size'] | sizeFormat }}</v-col>
              <v-col cols="2">
                <v-btn icon>
                  <v-icon size="16" @click="downloadDocument(file)">mdi-download</v-icon>
                </v-btn>
                <v-btn icon @click="showDocument(file)">
                  <v-icon size="16">mdi-eye</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </template>
      </template>
    </v-row>

    <v-dialog fullscreen v-model="show">
      <v-card height="100vh">
        <v-toolbar>
          <v-toolbar-title>Документ {{ currentDoc.filename }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text style=" height: calc(85vh); overflow-y: scroll">
          <template v-if="currentDoc.ext === 'pdf'">
            <vue-pdf-app
                :pdf="currentDoc.url"></vue-pdf-app>
          </template>
          <template v-else-if="currentDoc.ext === 'zip'">
            <ZipViewer :zip-data="currentDoc.data"></ZipViewer>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-container>
</template>


<script>
import {mapGetters} from 'vuex'
import moment from "moment";
import VuePdfApp from "vue-pdf-app";
import "vue-pdf-app/dist/icons/main.css";
import customConst from "@/const/customConst";
import ZipViewer from "@/components/ZipViewer/ZipViewer.vue";

export default {
  props: ['project'],
  name: "FileView",
  data: () => ({
    view: 'list',
    show: false,
    currentDoc: {
      filename: null,
      ext: null,
      url: null,
      data: null
    }
  }),
  computed: {
    ...mapGetters({
      fileList: "projectDocumentListData"
    })
  },
  methods: {
    fileExtensionClass(ext) {
      if (ext === 'pdf') return '/icons/pdf-file.svg'.toString()
      else if (ext === 'docx' || ext === 'doc') return 'doc'
      else if (ext === 'docx' || ext === 'doc') return 'doc'
    },
    downloadDocument(item){
      console.log({'pk': item.pk, 'fileName': item.fileName})
      this.$store.dispatch('downloadDocument', {'pk': item.pk, 'fileName': item.fileName})
    },
    async showDocument(item) {
      this.currentDoc.filename = item?.fileName || item?.file
      if (item.extension === 'pdf') {
        this.show = true
        this.currentDoc.ext = item.extension
        this.currentDoc.url = item.url
      } else if (item.extension.startsWith('doc')) {
        await this.$http({
          method: 'GET',
          url: customConst.PAPERFLOW_API + 'convert-to-pdf',
          params: {id: item.id},
          responseType: "arraybuffer"
        }).then(res => {
          this.show = true
          this.currentDoc.ext = 'pdf'
          this.currentDoc.url = res.data
        })
      } else if (item.extension === 'zip') {
        // this.show = true
        // this.$emit('showZip', item.url)
        // this.currentDoc.ext = item.extension
        // this.currentDoc.url = item.url
        await this.$http({
          method: "GET",
          url: customConst.PAPERFLOW_API + 'show-zip',
          params: {id: item.id}
        }).then(res => {
          let data = res.data.data.data
          this.show = true
          this.currentDoc.ext = item.extension
          this.currentDoc.data = [...data]

        })
      }
    }
  },
  filters: {
    dateFormat(date) {
      return moment(date).format('Y.MM.DD HH:MM')
    },
    sizeFormat(size) {
      if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} Кб`;
      } else if (size < 1024 * 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(2)} Мб`;
      } else {
        return `${(size / (1024 * 1024 * 1024)).toFixed(2)} Гб`;
      }
    }
  },
  created() {
    this.$store.dispatch('getProjectDocument', this.project)
  },
  components: {
    ZipViewer,
    VuePdfApp,
  }
}
</script>


<style scoped>

.file {
  text-align: center;
}

.file-type {
  padding-bottom: 0 !important;
  height: 30%;
  background-size: 50px auto !important;
  background-position: 0 10% !important;
  font-size: 12px;
}

.list-view {
  font-size: 12px;
}

.file-type.small {
  height: 50px;
  align-self: center;
  background-size: 25px auto !important;
  background-position: 0 10% !important;
  padding: 0 !important;
}

.file-type.pdf {
  background: url("./icons/pdf-file.svg") no-repeat;

}

.file-type.zip {
  background: url("./icons/zip-file.svg") no-repeat;
}

.file-type.xls, .file-type.xlsx {
  background: url("./icons/excel-file.svg") no-repeat;
}

.file-type.doc, .file-type.docx {
  background: url("./icons/microsoft-word.svg") no-repeat;
}

.file-name {
  -webkit-line-clamp: 3;
  word-wrap: break-word;
  overflow-wrap: break-word;
}


</style>