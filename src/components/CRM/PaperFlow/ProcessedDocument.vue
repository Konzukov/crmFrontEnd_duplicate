<template>
  <v-container fluid>
    <div class="main">
      <leftFilter
          :allData.sync='processesDocumentList'
          :projectList="projectList"
          :dataType="'document'"
          :tagsList="tagsList"
          :useCalendarRange="true"
          @getMonthData="getDocument"
          @applyFilter="getDocument"
          @applyRangeFilter="rangeUpdate"
      ></leftFilter>
      <div class="content">
        <v-skeleton-loader
            :loading="loading"
            type="table"
        >
          <v-card>
            <v-data-table
                :headers="headers"
                :items="processesDocumentList"
                :page.sync="page"
                :items-per-page="15"
                hide-default-footer
                class="elevation-1"
                height="75vh"
                @page-count="pageCount = $event"
            >
              <template v-slot:item.project="{item}">
                <template v-for="proj in item.project">
                  {{ proj.name }}
                </template>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon size="18" class="mr-2" color="primary" @click.prevent="downloadDoc(item)">
                    mdi-download
                </v-icon>
                <v-icon size="18" class="mr-2" color="success" @click="editItem(item)">mdi-pencil
                </v-icon>
                <v-icon size="18" color="error" @click="deleteItem(item)">mdi-delete</v-icon>
                <v-menu offset-y>
                  <template v-slot:activator="{attrs, on}">
                    <v-icon size="18" v-bind="attrs"
                            v-on="on">mdi-dots-horizontal
                    </v-icon>
                  </template>
                  <v-list>
                    <v-list-item link>
                      <v-list-item-icon class="more-action">
                        <v-icon>mdi-file-replace-outline</v-icon>
                      </v-list-item-icon>
                      <v-list-item-title class="text-caption" @click="changeFile(item)">Заменить
                        файл
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item link>
                      <v-list-item-icon class="more-action">
                        <v-icon>mdi-share-variant-outline</v-icon>
                      </v-list-item-icon>
                      <v-list-item-title class="text-caption">Отправить</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-data-table>
            <div class="text-center pt-2">
              <v-pagination v-model="page" :length="pageCount" :total-visible="7"></v-pagination>
            </div>
          </v-card>
        </v-skeleton-loader>
      </div>
    </div>
    <editDocument></editDocument>
    <deleteDocument></deleteDocument>
    <ChangeFile></ChangeFile>
  </v-container>
</template>

<script>
import editDocument from "./modal/editDocument";
import deleteDocument from "./modal/deleteDocument"
import moment from 'moment'
import leftFilter from "../../filter/leftFilter";
import ChangeFile from "./modal/ChangeFile";

export default {
  name: "ProcessedDocument",
  data() {
    return {
      page: 1,
      pageCount: 0,
      month: null,
      loading: true,
      filter: {
        range: [],
        project: '',
        author: '',
        from: '',
      },
      headers: [
        {text: 'Документ', value: 'fileName', width: '30%'},
        {text: 'Дата получения', value: 'receiving_date', width: '10%'},
        {text: 'Автор', value: 'author.fullName', width: '10%'},
        {text: 'От кого', value: 'fromWho.fullName', width: '10%'},
        {text: 'Кому', value: 'to', width: '10%'},
        {text: 'Проект', value: 'project', width: '20%'},
        {text: 'Действия', value: 'actions', width: '10%'},
      ]
    }
  },
  methods: {
    getFromFile(obj) {

    },
    editItem(doc) {
      this.$emit('editDoc', doc.pk)
    },
    downloadDoc(doc) {
      this.$store.dispatch('downloadDocument', {'pk': doc.pk, 'fileName': doc.file})
    },
    deleteItem(doc) {
      this.$emit('delDoc', doc)
    },
    changeFile(doc) {
      this.$emit('changeFile', doc)
    },
    rangeUpdate(range) {
      this.filter.range = range
    },
    getDocument({date, project = '-1', user = '-1', tags = '-1'}) {
      this.loading = true
      console.log(date, project, user, tags)
      this.$store.dispatch('getProcessedDocument', {date, project, user, 'tags': tags}).then(() => {
        this.loading = false
      })
    },


  },
  watch: {},
  computed: {
    processesDocumentList: {
      get() {
        let doc = this.$store.getters.processedDocumentListData
        if (this.filter.range.length > 0) {
          doc = doc.filter(obj => {
            if (this.filter.range.length === 2) {
              if (obj.receiving_date >= this.filter.range[0] && obj.receiving_date <= this.filter.range[1]) {
                return obj
              }
            } else {
              if (obj.receiving_date >= this.filter.range[0]) {
                return obj
              }
            }
          })
        }
        return doc
      }
    },
    projectList: {
      get() {
        return this.$store.getters.projectListData
      }
    },
    tagsList: {
      get() {
        return this.$store.getters.tagsListData
      }
    }
  },
  created() {
    this.getDocument({'date': moment().format('YYYY-M')})
    this.$store.dispatch('getProjectList').then(() => {
      this.$store.dispatch('getTagList')
    })
  },
  components: {
    editDocument,
    deleteDocument,
    ChangeFile,
    leftFilter
  }
}
</script>

<style scoped>
@media screen and (max-width: 1024px) {
  div.container div.main {
    flex-wrap: wrap;
  }
}

div.main {
  display: inline-flex;
  flex-wrap: nowrap;
  flex-direction: row;
  width: 100%;
}

div.main > .content {
  flex-grow: 1;
}

.more-action {
  margin-right: 10px !important;
}
</style>