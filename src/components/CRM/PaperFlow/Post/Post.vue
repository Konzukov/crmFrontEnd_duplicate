<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-switch
            v-model="filters.showUnProcessed"
            label="Показывать только не обработанные"
        >
        </v-switch>
      </v-card-title>
      <v-data-table
          :items="filteredPostData"
          :headers="headers"
          :item-class="hasFile"
      >
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
    <DeletePost></DeletePost>
  </v-container>
</template>

<script>
// import leftFilter from "@/components/filter/leftFilter";
import {mapGetters} from 'vuex'
import PostEdit from "@/components/CRM/PaperFlow/Post/modal/PostEdit";
import DeletePost from "@/components/CRM/PaperFlow/Post/modal/DeletePost";


export default {
  name: "Post",
  data() {
    return {
      headers: [
        {text: 'Дата отправки', value: 'departure_date'},
        {text: 'РПО', value: 'rpo'},
        {text: 'Направление', value: 'route'},
        {text: 'Кому', value: 'to'},
        {text: 'От кого', value: 'from_who.fullName'},
        {text: 'Действия', value: 'actions'},
      ],
      filters: {
        dataFilter: [],
        showUnProcessed: false,
        route: [{value: 'Входящее', text: 'Входящее'}, {value: 'Исходящее', text: 'Исходящее'}]
      }
    }
  },
  postType: '',
  computed: {
    ...mapGetters({
      postData: 'incomingPostData'
    }),
    filteredPostData() {
      return this.postData.filter(post => {
        if (this.filters.showUnProcessed) {
          return !post['post_file']
        }
        return post
      })
    }
  },
  methods: {
    filterHandler(value, row, column) {
      const property = column['property'];
      return row[property] === value;
    },
    handleEdit(item) {
      this.$emit('editPost', item['pk'])
    },
    hasFile(item) {
      if (!item['post_file']) {
        return 'warning-row';
      }
      return '';
    },
    handleDelete(item) {
      this.$emit('deletePost', item)
    }
  },
  created() {
    this.$store.dispatch('getIncomingPost')
  },
  components: {
    PostEdit,
    DeletePost,

  }
}
</script>

<style scoped>
>>> .warning-row {
  background: #80030347;
}

>>> .el-switch__label:not(.is-active) span {
  color: #88888882;
}

>>> .el-switch__label.is-active {
  color: #02c110;
}
</style>