<template>
  <v-container fluid>
    <v-card flat class="mt-4">
      <v-data-table :headers="fileHeaders" :items="getFileList" dense>
        <template v-slot:item.file_type="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                  :color="getFileTypeIcon(item.file_type).color"
                  v-bind="attrs"
                  v-on="on"
              >
                {{ getFileTypeIcon(item.file_type).icon }}
              </v-icon>
            </template>
            <span>{{ getFileTypeText(item.file_type) }}</span>
          </v-tooltip>
        </template>
        <template v-slot:item.file_size_display="{ item }">
          <span>{{ item.file_size_display }}</span>
        </template>
        <template v-slot:item.action="{ item }">
          <v-menu>
            <template v-slot:activator="{attrs, on}">
              <v-icon size="15" v-bind="attrs"
                      v-on="on">mdi-dots-vertical
              </v-icon>
            </template>
            <v-list dense flat>
              <v-list-item link @click="showDetail(item)">
                <v-list-item-title>
                  Информация
                </v-list-item-title>
              </v-list-item>
              <v-list-item link @click="downloadFile(item)">
                <v-list-item-title>
                  Скачать
                </v-list-item-title>
              </v-list-item>
              <v-list-item link @click="checkDelete(item)">
                <v-list-item-title>
                  Удалить
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

      </v-data-table>
    </v-card>
    <v-navigation-drawer
        v-model="detailDrawer"
        fixed
        right
        temporary
        width="400"
    >
      <v-card v-if="selectedFile" flat class="fill-height">
        <v-card-title class="d-flex justify-space-between align-center primary">
          <span class="white--text">Детали файла</span>
          <v-btn icon @click="detailDrawer = false">
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-list dense>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">ID</v-list-item-title>
                <v-list-item-subtitle>{{ selectedFile.id }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">Имя файла</v-list-item-title>
                <v-list-item-subtitle>{{ selectedFile.original_name }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">Тип файла</v-list-item-title>
                <v-list-item-subtitle class="d-flex align-center">
                  <v-icon
                      :color="getFileTypeIcon(selectedFile.file_type).color"
                      small
                      class="mr-2"
                  >
                    {{ getFileTypeIcon(selectedFile.file_type).icon }}
                  </v-icon>
                  {{ getFileTypeText(selectedFile.file_type) }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">Размер</v-list-item-title>
                <v-list-item-subtitle>{{ selectedFile.file_size_display }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">MIME-тип</v-list-item-title>
                <v-list-item-subtitle>{{ selectedFile.mime_type || 'Не указан' }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">Контрольная сумма</v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ selectedFile.checksum || 'Не рассчитана' }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">Автор</v-list-item-title>
                <v-list-item-subtitle>{{ selectedFile.author }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">Дата загрузки</v-list-item-title>
                <v-list-item-subtitle>{{ selectedFile.uploaded_at }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item v-if="selectedFile.description">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">Описание</v-list-item-title>
                <v-list-item-subtitle>{{ selectedFile.description }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="downloadFile(selectedFile)">
            <v-icon left>mdi-download</v-icon>
            Скачать
          </v-btn>
          <v-btn color="primary" @click="detailDrawer = false">
            <v-icon left>mdi-close</v-icon>
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-navigation-drawer>
    <v-dialog v-model="deleteDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="headline error--text">
          <v-icon color="error" class="mr-2">mdi-alert</v-icon>
          Подтверждение удаления
        </v-card-title>

        <v-card-text>
          <div v-if="fileToDelete && fileToDelete.can_be_deleted">
            <p class="font-weight-bold">Вы уверены, что хотите удалить файл?</p>
            <p><strong>Файл:</strong> {{ fileToDelete.original_name }}</p>
            <p class="error--text">
              <v-icon small color="error" class="mr-1">mdi-alert-circle</v-icon>
              Файл восстановлению не подлежит!
            </p>
          </div>

          <div v-else-if="fileToDelete">
            <p class="font-weight-bold error--text">Невозможно удалить файл!</p>
            <p><strong>Файл:</strong> {{ fileToDelete.original_name }}</p>
            <p>Файл используется в следующих документах:</p>
            <ul class="mt-2">
              <li v-for="(usage, index) in fileToDelete.usage_details" :key="index">
                {{ usage }}
              </li>
            </ul>
            <p class="warning--text mt-2">
              Для удаления файла необходимо сначала удалить все связи с документами.
            </p>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="grey"
              text
              @click="deleteDialog = false"
              :disabled="deleteInProgress"
          >
            Отмена
          </v-btn>
          <v-btn
              color="error"
              @click="confirmDelete"
              :loading="deleteInProgress"
              :disabled="!fileToDelete || !fileToDelete.can_be_deleted"
          >
            <v-icon left>mdi-delete</v-icon>
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: "DocumentFlowFiles",
  data: () => ({
    fileHeaders: [
      {text: 'ID', value: 'id', width: 70},
      {text: 'Имя', value: 'original_name'},
      {text: 'Тип', value: 'file_type', width: 120},
      {text: 'Размер', value: 'file_size_display', width: 140},
      {text: 'Автор', value: 'author', width: 200},
      {text: 'Загружен', value: 'uploaded_at', width: 180},
      {text: 'Действия', value: 'action', width: 70},
    ],
    fileTypeIcons: {
      DOCX: {icon: 'mdi-file-word', color: 'blue darken-2', text: 'Документ Word'},
      PDF: {icon: 'mdi-file-pdf-box', color: 'red darken-2', text: 'PDF документ'},
      SIGN: {icon: 'mdi-certificate', color: 'green darken-2', text: 'Электронная подпись'},
      OTHER: {icon: 'mdi-file', color: 'grey darken-1', text: 'Файл'}
    },
    detailDrawer: false,
    selectedFile: null,
    deleteDialog: false,
    fileToDelete: null,
    deleteInProgress: false
  }),
  computed: {
    ...mapGetters('documentFlow', ['getFileList'])
  },
  methods: {
    ...mapActions('documentFlow', ['fetchFileList', 'fileDeleteInfo', 'safeDelete']),
    async init() {
      await Promise.all([this.fetchFileList()])
    },
    getFileTypeIcon(fileType) {
      return this.fileTypeIcons[fileType] || this.fileTypeIcons.OTHER
    },
    getFileTypeText(fileType) {
      return this.getFileTypeIcon(fileType).text
    },
    downloadFile(file) {
      const downloadId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      this.$store.dispatch('downloads/addDownload', {
        id: downloadId,
        fileName: file['original_name']
      }, {root: true})
      this.$store.dispatch('downloads/downloadFile', {
        id: file.id,
        fileName: file['original_name'],
        downloadId
      }, {root: true})
    },
    async checkDelete(file) {
      try {
        // Получаем информацию о возможности удаления
        this.fileDeleteInfo(file.id).then((data => {
          console.log(data)
          this.fileToDelete = data;
          this.deleteDialog = true;
        }))

      } catch (error) {
        console.error('Ошибка при проверке возможности удаления:', error);
        await this.$store.dispatch('snackbar/showSnackbar', {
          text: 'Ошибка при проверке файла',
          color: 'error'
        }, {root: true});
      }
    },

    async confirmDelete() {
      if (!this.fileToDelete || !this.fileToDelete.can_be_deleted) {
        return;
      }

      this.deleteInProgress = true;

      try {
        await this.safeDelete(this.fileToDelete.id)

        this.$store.dispatch('snackbar/showSnackbar', {
          text: `Файл "${this.fileToDelete.original_name}" успешно удален`,
          color: 'success'
        }, {root: true});

        // Закрываем диалог и обновляем список
        this.deleteDialog = false;
        this.fileToDelete = null;
        await this.fetchFileList();

      } catch (error) {
        console.error('Ошибка при удалении файла:', error);

        let errorMessage = 'Произошла ошибка при удалении файла';
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
        await this.$store.dispatch('snackbar/showSnackbar', {
          text: errorMessage,
          color: 'error'
        }, {root: true});
      } finally {
        this.deleteInProgress = false;
      }
    },
    showDetail(file) {
      this.selectedFile = file;
      this.detailDrawer = true;
    },
  },
  mounted() {
    this.init()
  }
}
</script>

<style scoped>

</style>