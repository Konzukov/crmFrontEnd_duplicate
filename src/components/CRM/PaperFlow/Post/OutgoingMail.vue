<template>
  <v-container fluid style="height: 82vh;">
    <v-card style="height: 100%;">
      <v-card-title class="justify-space-between">
        <div class="ml-4">
          <v-col cols="auto">
            <v-row>
              <v-switch dense class="switch-menu" v-model="filters.showUnProcessed"
                        label="Показывать только не обработанные"></v-switch>
            </v-row>
            <v-row>
              <v-switch dense class="switch-menu" v-model="filters.withOutProject"
                        label="Показывать только без проектов"></v-switch>
            </v-row>
            <v-row>
              <v-col cols="auto">
                <v-text-field clearable label="Поиск" v-model="filters.searchField"></v-text-field>
              </v-col>
            </v-row>
          </v-col>
        </div>
        <vc-calendar :columns="$screens({ default: 1, lg:3 })"
                     :rows="$screens({ default: 1, lg: 1 })"
                     :attributes='attrs'
        />
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
                color="primary"
                v-bind="attrs"
                v-on="on"
                icon
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item :to="{name: 'post-parsing'}">
              <v-list-item-title>Парсинг почты</v-list-item-title>
            </v-list-item>
            <v-list-item @click="addOutPost">
              <v-list-item-title>Добавить из архива</v-list-item-title>
            </v-list-item>
            <v-list-item @click="addSingleOutPost">
              <v-list-item-title>Добавить исходящую почту</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-card-title>
      {{ editableItem.pk }}
      <v-data-table
          @contextmenu:row.prevent="openContextMenu"
          v-model="editableItem"
          :items="filteredPostData"
          :headers="headers"
          :item-class="hasFile"
          :search="filters.searchField"
          fixed-header
          item-key="pk"
          show-select
      >
        <template v-slot:item.departure_date="{item}">
          {{ item.departure_date | dateFilter }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-menu class="mb-10" bottom
                  left>
            <template v-slot:activator="{attrs, on}">
              <v-icon size="15" v-bind="attrs"
                      v-on="on">mdi-dots-vertical
              </v-icon>
            </template>
            <v-list class="action bg-grey">
              <v-list-item link @click="handleEdit(item)">
                <v-list-item-title>
                  Редактировать
                </v-list-item-title>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item link @click="handleDelete(item)">
                <v-list-item-title>
                  Удалить
                </v-list-item-title>
              </v-list-item>
              <v-divider></v-divider>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>
    <PostEdit></PostEdit>
    <massEdit itemType="posts"></massEdit>
    <DeletePost></DeletePost>
    <MouseContextMenu :display="showContextMenu"  ref="contextMenu">
      <li @click="massEdit">Редактировать выбранные</li>
      <!--      <li >Скачать выбранные</li>-->
    </MouseContextMenu>

  </v-container>
</template>
<script>
import {mapGetters} from 'vuex'
import PostEdit from "@/components/CRM/PaperFlow/Post/modal/PostEdit";
import DeletePost from "./modal/DeletePost";
import moment from 'moment'
import MouseContextMenu from "@/components/UI/MouseContextMenu";
import massEdit from "@/components/CRM/PaperFlow/Post/modal/massEdit";

export default {
  name: "OutgoingMail",
  data: () => ({
    showContextMenu: false,
    editableItem: [],
    attrs: [
      {
        key: 'today',
        highlight: 'red',
        dates: new Date(),
      },
    ],
    headers: [
      {text: 'Дата отправки', value: 'departure_date'},
      {text: 'РПО', value: 'rpo'},
      {text: 'Кому', value: 'from_who.fullName'},
      {text: 'Проект', value: 'project'},
      {text: 'Действия', value: 'actions'},
    ],
    filters: {
      showUnProcessed: false,
      withOutProject: false,
      searchField: '',
      dataFilter: []
    }
  }),
  methods: {
    filterHandler(value, row, column) {
      const property = column['property'];
      return row[property] === value;
    },
    addOutPost() {
      this.$router.push({name: 'create-outgoing-post'})
    },
    hasFile(item) {
      if (!item['post_documents']) {
        return 'warning-row';
      }
      return '';
    },
    handleEdit(item) {
      this.$emit('editPost', item['pk'])
    },
    handleDelete(item) {
      this.$emit('deletePost', item)
    },
    addSingleOutPost() {
      this.$emit('createSingleOutPost')
    },
    openContextMenu(e) {
      if (this.editableItem.length > 0) {
        this.$refs.contextMenu.open(e)
      }

    },
    massEdit() {
      this.$emit('massEdit', this.editableItem)
    }
  },
  computed: {
    ...mapGetters({
      outgoingPost: 'outgoingPostDate',
    }),
    filteredPostData() {
      return this.outgoingPost.filter(post => {
        if (this.filters.showUnProcessed) {
          return !post['post_file']
        }
        if (this.filters.withOutProject) {
          return !post['project']
        }
        return post
      })
    }
  },
  filters: {
    dateFilter(item) {
      return moment(item).format('YYYY-MM-DD')
    }
  },
  created() {
    this.$store.dispatch('getOutgoingPost')
  },
  components: {
    PostEdit,
    DeletePost,
    MouseContextMenu,
    massEdit,
  }
}
</script>

<style scoped>
>>> .v-card__title {
  padding: 3px 16px 0 16px;
}

.v-data-table > .v-data-table__wrapper > table > tbody > tr > td,
.v-data-table > .v-data-table__wrapper > table > thead > tr > td,
.v-data-table > .v-data-table__wrapper > table > tfoot > tr > td {
  font-size: 0.775rem;
  height: 40px;
}

>>> .v-data-table {
  height: 70%;
  overflow-y: scroll;
  padding: 0 15px;
  box-sizing: border-box;
}

>>> .warning-row {
  background: #80030347;
}

>>> .el-switch__label:not(.is-active) span {
  color: #88888882;
}

>>> .el-switch__label.is-active {
  color: #02c110;
}

.switch-menu .v-input__control .v-input__slot .v-input--selection-controls__input > label {
  font-size: 14px !important;
}

>>> .v-label {
  font-size: 12px;
}

>>> .vc-title {
  font-size: 14px !important;
  line-height: 16px !important;
}

>>> .vc-day-content {
  font-size: 12px !important;
}

>>> .vc-weekday {
  font-size: 12px !important;
}

>>> .vc-day {
  min-height: 25px !important;
}

>>> .vc-highlight {
  width: 22px !important;
  height: 22px !important;
}

>>> .vc-arrow {
  height: 12px;
  width: 12px;
}
</style>
