<template>
  <v-container fluid class="pt-4">
    <router-view></router-view>
    <v-card v-if="!$route.params.id" flat class="content-wrapper">
      <v-card-text>
        <v-row justify="start">
          <v-col cols="12" md="4" lg="3" sm="6" v-for="(item, i) in wikiDocsList" :key="i">
            <v-card hover class="card-item">
              <v-card-title class="text-h6 px-4 py-2 title-wrapper">
                <span class="text-truncate-2">{{ item.title }}</span>
              </v-card-title>

              <v-divider class="mx-4"></v-divider>

              <v-card-text class="py-2 px-4 description-wrapper">
                <div class="text-caption meta-info">
                  <div class="author-info">
                    <span>{{ item.author.fullName }}</span>
                  </div>
                  <div class="date-info">
                    <v-icon small>mdi-calendar</v-icon>
                    <span>{{ formatDate(item.created_at) }}</span>
                  </div>
                </div>

                <p class="text-body-2 mt-3 text-truncate-3" v-html="truncateText(item.description, 100)"></p>
              </v-card-text>

              <v-card-actions class="px-4 py-3">
                <v-btn
                    link
                    color="primary"
                    variant="outlined"
                    block
                    :to="{name: 'wiki-detail', params: {id: item.id}}"
                >
                  Подробнее
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Кнопка добавления -->
    <v-btn
        v-if="!$route.params.id"
        @click="addInstruction"
        class="floating-btn"
        fab
        dark
        color="primary"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <AddVideoInstruction @saved="handleSaved"></AddVideoInstruction>
  </v-container>
</template>

<script>
import {isEmpty} from 'lodash'
import {mapGetters} from "vuex";
import AddVideoInstruction from "@/components/referenceBook/Wiki/AddVideoInstruction.vue";
import moment from "moment";

export default {
  name: "VideoInstruction",
  data: () => ({}),
  computed: {
    ...mapGetters({
      wikiDocsList: "wikiListData"
    })
  },
  methods: {
    addInstruction() {
      this.$emit('addInstruction')
    },
    formatDate(dateString) {
      return moment(dateString).format('DD.MM.YYYY')
    },
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    handleSaved() {
      this.$store.dispatch('fetchWikiDocs') // Перезагружаем данные статьи
    }
  },
  created() {
    if (isEmpty(this.$store.getters.wikiListData)) {
      this.$store.dispatch('fetchWikiDocs')
    }
  },
  components: {
    AddVideoInstruction
  }
}
</script>

<style scoped>
.content-wrapper {
  min-height: 82vh;
}

.card-item {
  border-radius: 12px !important;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px 0 0;
  background: linear-gradient(to bottom, rgba(100, 181, 246, 0.1), transparent 80%);
}

.title-wrapper {
  min-height: 72px;
  display: flex;
  align-items: center;
}

.description-wrapper {
  flex-grow: 1;
  padding-bottom: 8px;
}

.meta-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #616161;
}

.author-info {
  display: flex;
  align-items: center;
  max-width: 60%;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.text-truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #424242;
  line-height: 1.5;
}

.floating-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(66, 133, 244, 0.3);
}
</style>