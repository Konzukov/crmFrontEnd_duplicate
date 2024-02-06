<template>
  <v-container>
    <v-dialog v-model="dialog" width="45vw">
      <v-card height="70vh">
        <v-card-text style="height: 40%; align-items: center; display: flex;">
          <v-container>
            <v-row justify="center">
              <v-btn
                  color="primary"
                  rounded
                  dark
                  @click="handleFileImport"
              >
                Загрузить XLS-файл
              </v-btn>

              <!-- Create a File Input that will be hidden but triggered with JavaScript -->
              <input
                  ref="uploader"
                  class="d-none"
                  type="file"
                  accept="application/vnd.sealed.xls"
                  @change="onFileChanged"
              >
            </v-row>
            <v-row justify="center" class="mt-10" align="center">
              <a v-if="dataType === 'bankAccount'" :href="exampleAccountUrl">Пример файла для загрузки счетов</a>
              <a v-else :href="exampleBankCardUrl">Пример файла для загрузки данных карт</a>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-text>
          <v-row>
            <h4 v-if="selectedFile">
              Загруженный файл: {{ selectedFile.name }}
            </h4>
          </v-row>
        </v-card-text>
        <v-card-text style="height: 50%; overflow-y: scroll">
          <v-row v-if="errorMessage" class="error_container mt-4" justify="center">
            <h3>Ошибка</h3>
            {{ errorMessage }}
          </v-row>
          <v-row justify="center" v-if="successMessages" class="mt-4">
            <h4>Обработано: {{ successMessages.length }} счетов</h4>
          </v-row>
          <v-row v-if="successMessages" justify="center">
            <v-data-table :items="successMessages" :headers="headers" hide-default-footer :items-per-page="999">
              <template v-slot:item.added="{item}">
                <span v-if="item.added">Да</span>
                <span v-else>Нет
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
        <v-icon
            color="error"
            v-bind="attrs"
            v-on="on"
        >
          mdi-information
        </v-icon>
      </template>
      <span>{{item.comment}}</span>
    </v-tooltip></span>
              </template>
            </v-data-table>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-row justify="center">
            <v-col cols="auto">
              <v-btn color="error" @click="close()">Закрыть</v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>


<script>
import customConst from "@/const/customConst";

export default {
  name: 'LoadAccountXlsx',
  data: () => ({
    dialog: false,
    headers: [
      {text: '№', value: 'num'},
      {text: 'Банк', value: 'bank'},
      {text: 'Номер счета', value: 'account'},
      {text: 'Загружен', value: 'added'},
    ],
    project: null,
    dataType: null,
    exampleAccountUrl: customConst.BASE_URL + '/media/bank_account_example.xlsx',
    exampleBankCardUrl: customConst.BASE_URL + '/media/bank_card_example.xlsx',
    selectedFile: null,
    isSelecting: false,
    errorMessage: null,
    successMessages: null
  }),
  methods: {
    close() {
      if (this.dataType === 'bankAccount') {
        this.$emit('updateAccountList')
      } else if (this.dataType === 'bankCard') {
        this.$emit('updateBankCardList')
      }
      Object.assign(this.$data, this.$options.data())
      this.selectedFile = null
      this.isSelecting = null
      this.dialog = false
    },
    handleFileImport() {
      this.isSelecting = true;

      // // After obtaining the focus when closing the FilePicker, return the button state to normal
      // window.addEventListener('focus', () => {
      //   this.isSelecting = false
      // }, {once: false});

      // Trigger click on the FileInput
      this.$refs.uploader.click();
    },
    onFileChanged(e) {
      console.log(e.target.files[0])
      this.selectedFile = e.target.files[0];
      let formData = new FormData()
      formData.set('file', e.target.files[0])
      formData.set('project', this.project)
      formData.set('dataType', this.dataType)
      this.$http({
        method: "POST",
        url: customConst.REFERENCE_BOOK_API + 'load-bank-account',
        data: formData
      }).then(res => {
        this.errorMessage = null
        this.successMessages = res.data.data.data
        this.selectedFile = null
        this.isSelecting = null
      }).catch(err => {
        this.errorMessage = err.response.data.errors.data
        this.selectedFile = null
        this.isSelecting = null
      })
      // Do whatever you need with the file, liek reading it with FileReader
    },
  },
  created() {
    this.$parent.$on('addXlsxAccount', ({project, dataType}) => {
      this.dataType = dataType
      this.project = project
      this.dialog = true
    })
    this.$parent.$on('addXlsxBankCard', ({project, dataType}) => {
      this.dataType = dataType
      this.project = project
      this.dialog = true
    })
  }
}
</script>

<style scoped>
.error_container {
  font-size: 16px;
  color: red;
}
</style>