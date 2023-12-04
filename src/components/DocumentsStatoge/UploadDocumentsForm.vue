<template>
  <v-dialog hide-overlay fullscreen v-model="dialog">
    <v-card height="100" width="100">
      <v-toolbar flat color="black" dark>
        <v-toolbar-title>Добавление документов</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn @click="close" icon>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-container fluid>
          <v-form>
            <FileInputDragAndDrop @syncFile="syncFileList"></FileInputDragAndDrop>
          </v-form>
        </v-container>
        <v-expansion-panels flat>
          <v-row justify="space-around">
            <template v-for="(file, index) in filesList">
              <v-col cols="4" :key="index">
                <v-expansion-panel>
                  <v-expansion-panel-header>
                    {{file.name}}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <h5>Форма</h5>
                    <v-form>
                      <v-row>
                        <v-col>
                          <v-text-field dense outlined></v-text-field>
                        </v-col>
                        <v-col>
                          <v-text-field dense outlined></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-text-field dense outlined></v-text-field>
                        </v-col>
                        <v-col>
                          <v-text-field dense outlined></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-text-field dense outlined></v-text-field>
                        </v-col>
                        <v-col>
                          <v-text-field dense outlined></v-text-field>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-col>
            </template>
          </v-row>
        </v-expansion-panels>
        <v-row>
          <v-col v-for="(file, index) in filesList" :key="index" cols="4">
            <v-card>
              <v-card-title>{{file.name}}</v-card-title>
              <v-card-actions>
                <v-btn icon>
                  <v-icon>mdi-cloud-upload-outline</v-icon>
                </v-btn>
                <v-btn icon>
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon>
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-container  class="actions">
      <v-row justify="start">
        <v-btn class="mr-4" @click="close" color="error">Закрыть</v-btn>
        <v-btn color="success" @click="saveAll">Сохранить все</v-btn>
      </v-row>
    </v-container>
  </v-dialog>
</template>

<script>
import FileInputDragAndDrop from "@/components/UI/FileInputDragAndDrop";


export default {
  name: "UploadDocumentsForm",
  data: () => ({
    dialog: false,
    filesList: []
  }),
  methods: {
    syncFileList(fileList) {
      this.filesList = fileList
      console.log(fileList)
    },
    close() {
      this.filesList = []
      this.dialog = false
    },
    saveAll(){

    }
  },
  components: {
    FileInputDragAndDrop
  },
  mounted() {
    this.$parent.$on('openDocumentUploadForm', () => {
      this.dialog = true
    })
  }
}
</script>

<style scoped>
.actions {
  position: absolute;
  bottom: 30px;
  left: 50px;
}

.v-card__title {
  font-size: 14px;
  font-weight: 300;
}

.form-control {
  font-size: 14px;
}

>>> .v-label {
  font-size: 14px;
}
</style>