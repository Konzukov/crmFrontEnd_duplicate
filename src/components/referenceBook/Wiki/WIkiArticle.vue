<template>
  <v-container fluid class="d-flex flex-column ma-0 pa-0" style="min-height: 100vh;">
    <!-- Заголовок статьи -->
    <v-card flat>
      <v-card-title>
        <h1 class="text-h4" style="line-height: 1.25">{{ article.title }}</h1>
      </v-card-title>
    </v-card>

    <!-- Основной контент с возможностью прокрутки -->
    <div class="flex-grow-1 overflow-y-auto">
      <!-- Тело статьи -->
      <v-row>
        <v-col cols="12" md="9">
          <v-card outlined height="50vh">
            <!-- Отображение HTML-контента -->
            <v-card-text v-if="article.description" class="article-content"
                         v-html="article.description"></v-card-text>
            <v-card-text v-else>Описание отсутствует</v-card-text>
          </v-card>

          <v-card v-if="article.files && article.files.length" class="mt-4" height="25vh">
            <v-card-title class="text-h5 py-2">Файлы</v-card-title>
            <v-card-text style="overflow-y: auto;">
              <v-row>
                <v-col
                    cols="12"
                    md="3"
                    v-for="(file, index) in article.files"
                    :key="file.id"
                >
                  <div class="video-container">
                    <video
                        controls
                        class="video-player"
                    >
                      <source :src="file.video_url" type="video/mp4">
                      Ваш браузер не поддерживает видео тег.
                    </video>
                  </div>
                  <div class="text-caption mt-2 text-center">
                    Видео {{ index + 1 }} ({{ formatDate(file.created_at) }})
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card v-else class="mt-4" height="25vh">
            <v-card-text style="overflow-y: auto;">Нет видеофайлов</v-card-text>
          </v-card>
        </v-col>

        <!-- Боковая панель -->
        <v-col cols="12" md="3" class="d-flex flex-column">
          <v-card outlined>
            <v-card-title class="text-subtitle-1 font-weight-bold">
              <v-icon left>mdi-information</v-icon>
              Информация
            </v-card-title>
            <v-list dense>
              <v-list-item>
                <v-list-item-icon>
                  <v-icon small>mdi-account</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Автор</v-list-item-title>
                  <v-list-item-subtitle>{{ article.author.fullName }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-icon>
                  <v-icon small>mdi-calendar</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Создано</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(article.created_at) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-icon>
                  <v-icon small>mdi-update</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Обновлено</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(article.updated_at) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
          <v-spacer></v-spacer>
          <div class="d-flex justify-center">
            <v-btn
                color="primary"
                class="mr-2"
                small
                @click="editArticle"
            >
              <v-icon left>mdi-pencil</v-icon>
              Редактировать
            </v-btn>

            <v-btn
                outlined
                small
                color="grey"
                @click="$router.go(-1)"
            >
              <v-icon left>mdi-arrow-left</v-icon>
              Назад к списку
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </div>
    <EditVideoInstruction
        :show="showEditDialog"
        :articleId="id"
        @close="showEditDialog = false"
        @saved="handleSaved"
    />
  </v-container>
</template>

<script>
import '@/assets/css/quill.css'
import moment from "moment";
import EditVideoInstruction from "@/components/referenceBook/Wiki/EditVideoInstruction.vue";

export default {
  name: 'WikiArticleView',
  components: {EditVideoInstruction},
  props: ['id'],
  data() {
    return {
      showEditDialog: false,
      article: {
        id: null,
        title: '',
        description: '',
        created_at: '',
        updated_at: '',
        files: [],
        author: {
          id: null,
          fullName: '',
          avatar: null
        }
      },
    };
  },
  created() {
    this.fetchArticle();
  },
  methods: {
    async fetchArticle() {
      try {
        this.article = await this.$store.dispatch('fetchWikiDoc', this.id);
      } catch (error) {
        console.error('Ошибка загрузки статьи:', error);
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      return moment(dateString).format('DD.MM.YYYY');
    },
    editArticle() {
      this.showEditDialog = true;
    },
    handleSaved() {
      this.fetchArticle(); // Перезагружаем данные статьи
    }
  }
};
</script>

<style scoped>

.pointer {
  cursor: pointer;
}

.article-content {
  height: 100%;
  line-height: 1.6;
  overflow-y: scroll;
}

.article-content ::v-deep img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 16px 0;
}

.article-content ::v-deep h2 {
  margin-top: 24px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.article-content ::v-deep h3 {
  margin-top: 20px;
  margin-bottom: 12px;
}

.article-content ::v-deep p {
  margin-bottom: 16px;
}

.article-content ::v-deep ul,
.article-content ::v-deep ol {
  padding-left: 24px;
  margin-bottom: 16px;
}

.article-content ::v-deep li {
  margin-bottom: 8px;
}

.article-content ::v-deep pre {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 16px 0;
}

.article-content ::v-deep code {
  font-family: 'Courier New', monospace;
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 4px;
}

/* Стили для видео */
.video-container {
  position: relative;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  overflow: hidden;
}

.video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  background-color: #000;
}

/* Адаптация для мобильных устройств */
@media (max-width: 960px) {
  .video-container {
    padding-top: 75%; /* 4:3 для мобильных */
  }
}
</style>