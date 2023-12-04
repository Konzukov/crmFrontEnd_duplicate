<template>
  <v-card flat>
    <v-treeview
        class="comment-list"
        :items="commentList"
        item-key="pk"
        v-model="tree"
    >
      <template v-slot:prepend="{ item, open }">
        <v-row justify="start">
          <v-col md="6" class="comment-info">
            <v-avatar
                color="primary"
                size="36">
                            <span class="white--text headline text-caption">
                                {{ item.author.last_name.charAt(0) }} {{ item.author.first_name.charAt(0) }}
                            </span>
            </v-avatar>
            <span class="headline text-caption">
                                {{ item.author.fullName }}
                            </span>
          </v-col>
          <v-col md="6" align-self="center">
                        <span class="headline text-uppercase text-caption">
                            {{ item.date }}
                        </span>
          </v-col>
        </v-row>
        <v-row v-html="item.text" justify="start">

        </v-row>
      </template>
    </v-treeview>
  </v-card>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  props: ['task', 'maxHeight', 'minHeight'],
  name: "CommentDisplay",
  data() {
    return {
      tree: []
    }
  },
  filters: {
    filters: {
      avatarLetter(val) {
        if (!val) return ''
        return val.charAt(0).toUpperCase()
      }
    },
  },
  computed: {
    ...mapGetters({
      commentList: 'commentListData'
    })
  },
  created() {
    if (this.task) {
      this.$store.dispatch('getCommentList', this.task)
    }

  }
}
</script>

<style scoped>
>>> .v-treeview-node__prepend {
  width: 90% !important;
}

.comment-list {
  max-height: 40vh;
  min-height: auto;
  overflow: hidden scroll;
}

.comment-info {
  padding-left: 0;
}
</style>