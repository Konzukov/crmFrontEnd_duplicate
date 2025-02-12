<template>
  <v-container fluid>
    <v-form>
      <v-row justify="start" align="baseline">
        <v-col md="6" sm="8" xl="6" lg="6">
          <v-autocomplete dense outlined label="Структура файла" v-model="fileType"
                          :items="fileTypes" item-text="text" item-value="val"
          >
          </v-autocomplete>
          <v-file-input
              dense
              label="Добавьте файл xlsx"
              v-model="outMail"
              outlined
          ></v-file-input>
        </v-col>
        <v-col md="4" sm="4" xl="4" lg="4">
          <v-btn tile @click="checkOutPostXlsx()">Обработать</v-btn>
        </v-col>
      </v-row>
    </v-form>
    <v-row justify="start">
      <v-col cols="12">
        <v-data-table :items="postData"
                      :headers="headers"
                      style="overflow-y: scroll"
                      :item-class="exist"
        >
          <template v-slot:item.entry_date="{ item }">
            {{ item.entry_date | formatDate }}
          </template>
          <template v-slot:item.departure_date="{ item }">
            {{ item.departure_date | formatDate }}
          </template>
          <template v-slot:item.project="{ item }">
            <span v-for="project in item.project" :key="project.id">{{ project.name }}</span>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon color="success" @click="editPost(item)">
              <v-icon size="16px">mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon color="primary" :disabled="!item.project || item.created" @click="savePost(item)">
              <v-icon size="16px">mdi-content-save</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <PostEdit @postCreated="updateList"></PostEdit>
  </v-container>
</template>

<script>
import customConst from "@/const/customConst";
import moment from "moment";
import PostEdit from "@/components/CRM/PaperFlow/Post/modal/PostEdit.vue";
import {mapGetters} from "vuex";

export default {
  name: 'CreateOutgoingMail',
  components: {PostEdit},
  data: () => ({
    fileTypes: [
      {val: 'POST', text: 'Почта РФ'},
      {val: 'SBIS', text: 'Сбис'},
    ],
    outMail: null,
    fileType: 'POST',
    postData: [],
    headers: [
      {text: 'Дата создания', value: 'entry_date'},
      {text: 'Дата отправки', value: 'departure_date'},
      {text: 'Номер', value: 'rpo'},
      {text: 'Кому', value: 'from_legal.fullName'},
      {text: 'Проект', value: 'project'},
      {text: 'Действия', value: 'actions'},
    ]
  }),
  computed: {
    ...mapGetters({
      participatorList: "participatorList",
      correspondenceType: 'correspondenceTypeData'
    }),
  },
  methods: {
    exist(item) {
      if (item.created) {
        return 'success'
      }
    },
    updateList(data) {
      console.log('emit post save', data)
      let index = this.postData.findIndex((obj) => obj.rpo === data.rpo)
      this.postData[index].created = true
      this.postData[index].project = data.project
    },
    savePost(item) {
      let formData = new FormData()
      formData.set('route', 'IN')
      formData.set('to', this.participatorList[0]['pk'])
      formData.set('post_type', 'EDO')
      formData.set('post_account', item.post_account.id)
      formData.set('rpo', item.rpo)
      formData.set('departure_date', moment(item.departure_date, 'YYYY-MM-DD').format('YYYY-MM-DD HH:mm:ss'))
      formData.set('from_legal', item.from_legal.pk)
      formData.set('description', item.description)
      formData.set('calculated_price', item.calculated_price)
      for (let project of item.project) {
        formData.append('project', project.pk)
      }

      this.$store.dispatch('createPost', formData).then(data=>{
        this.updateList(data)
      })
    },
    editPost(item) {
      if (item.id) {
        this.$emit('editPost', item.pk)
      } else {
        this.$emit('createSingleOutPost', item)
      }

    }
    ,
    checkOutPostXlsx() {
      let formData = new FormData
      formData.append('file', this.outMail)
      formData.append('fileType', this.fileType)
      return new Promise((resolve, reject) => {
        this.$http({
          method: "POST",
          url: customConst.PAPERFLOW_API + 'check-outgoing-post-xlsx',
          data: formData
        }).then(res => {
          this.postData = res.data.data.data
        }).catch(err => {
          console.log(err)
        })
      })
    }
  },
  filters: {
    getFileName(obj) {
      return obj?.fileName
    }
    ,
    formatDate(date) {
      return moment(date).format('DD.MM.YYYY')
    }
  }
}

</script>

<style scoped>
>>> .success {
  background-color: #d7fdd8 !important;
}
</style>