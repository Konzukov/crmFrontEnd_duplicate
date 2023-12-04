<template>
  <v-form>
      <v-combobox
          outlined
          dense
          v-model="selected"
          :items="tagsList"
          :search-input.sync="search"
          @keydown="keyP"
          label="Тег"
          multiple
          chips
          item-text="name"
          item-value="pk"
          :loading="loading"
          @change="search = ''"
      >
        <template v-slot:selection="data">
          <v-chip
              v-bind="data.attrs"
              :input-value="data.selected"
              close
              @click="data.select"
              @click:close="remove(data.item)"
          >
            {{ data.item.name }}
          </v-chip>
        </template>
        <template v-slot:no-data>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                "<strong>{{ search }}</strong>" не найден
                Нажмите
                <v-btn color="black" small @click="addingNewTag(search)">
                  <v-icon color="white">mdi-plus</v-icon>
                </v-btn>
                что бы добавить
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-combobox>
  </v-form>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  name: "Tagging",
  props: ['existTags'],
  data() {
    return {
      tag: {
        name: ''
      },
      selected: [],
      search: '',
      loading: false,
    }
  },
  computed: {
    ...mapGetters({
      tagsList: 'tagsListData'
    })
  },
  methods: {
    addingNewTag(tagName) {
      this.loading = true
      let formData = new FormData()
      formData.set('name', tagName)
      this.$store.dispatch('addTag', formData).then((newTag) => {
        this.selected = this.selected.filter(obj => {
          if (typeof obj === 'object') {
            return obj
          }
        })
        this.selected.push(Object.assign({}, newTag))
        this.search = ''
        this.loading = false
      })
    },
    keyP(e) {
      if (e.code === 'Space') {
        e.preventDefault()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        this.addingNewTag(this.search)
      }

    },
    remove(item) {
      console.log('click remove', item)
      let index = this.selected.indexOf(item)
      this.selected.splice(index, 1)
    },
    clear() {
      Object.assign(this.$data, this.$options.data())
    }
  },
  watch: {
    existTags(val, oldVal) {
      this.selected = this.existTags
    },
    search(val) {
      if (val) {
        this.$set(this, 'search', val.replace(' ', '_'))
      }
    },
  },
  created() {
    this.$store.dispatch('getTagList').then(() => {
      if (this.existTags) {
        this.selected = this.existTags
      }
    })
  },
}
</script>

<style scoped>

</style>