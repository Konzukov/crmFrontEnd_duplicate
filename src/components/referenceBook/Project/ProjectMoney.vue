<template>
  <v-container fluid>
    <v-card id="report-card" width="100%" height="50vh" flat>
      <template v-for="(item, i) in projectMoneyReport">
        <v-card-text :key="i" :class="i % 2===0 ? 'bg-grey' : ''">
          <v-row justify="start">
            <v-col cols="3">
              <template v-if="checkArray(item.file_name)">
                {{ item['file_name'][0] }}
              </template>
              <template v-else>
                {{ item.fileName }}
              </template>
            </v-col>
            <v-col cols="2">{{ item.to | getTo }}</v-col>
            <v-col cols="2">{{ item | fromWho }}</v-col>
            <v-col cols="2">{{ item.correspondence_type | getCorrespondenceType }}</v-col>
            <v-col cols="2" @click="viewItem(item)" style="color: #0D47A1; cursor: pointer">{{ item.rpo }}</v-col>
            <v-col cols="1">{{ item.price }}</v-col>
          </v-row>
        </v-card-text>
      </template>
      <v-card-actions>
        <v-btn @click="getReport">Выгрузить</v-btn>
      </v-card-actions>
    </v-card>
    <PostEdit></PostEdit>
  </v-container>
</template>

<script>
import moment from "moment";
import PostEdit from "@/components/CRM/PaperFlow/Post/modal/PostEdit";
import {isArray, isObject, isEmpty} from 'lodash'
import customConst from "@/const/customConst";
import {saveAs} from 'file-saver';

export default {
  name: "ProjectMoney",
  data: () => ({
  }),
  methods: {
    viewItem(item) {
      if (item.hasOwnProperty('rpo')) {
        this.$emit('editPost', item.pk)
      } else {
        this.$emit('editDocument', item.pk)
      }

    },
    checkArray(item) {
      return isArray(item)
    },
    getReport() {
      let formData = new FormData()
      let reportFields = ['Файл', 'От кого', 'Кому', 'ШПИ', 'Тип корреспонденции', 'Цена']
      for (let item of reportFields) {
        formData.append('fields', item)
      }
      formData.append('reportType', 'projectMoney')
      formData.append('project', this.$route.params['pk'])
      this.$http({
        method: "POST",
        url: customConst.REPORT_API + 'create-xlsx',
        data: formData,
        responseType: 'blob'
      }).then(res => {
        // 2) set the fileName variable to the default value
        let fileName = `money_report_${this.$route.params['pk']}.xlsx`;

        // 3) if the header is set, extract the filename
        // if (contentDisposition) {
        //   const fileNameMatch =
        //       contentDisposition.match(/filename="(.+)"/);
        //   console.log('fileNameMatch', fileNameMatch);
        //   if (fileNameMatch.length === 2) {
        //     fileName = fileNameMatch[1];
        //   }
        // }
        saveAs(res.data, fileName)
      })
    },
  },
  filters: {
    filterDate: date => moment(new Date(date)).format('DD.MM.YYYY'),
    getTo(item) {
      if (isObject(item)) {
        return item.participator.name
      }
      return item
    },
    fromWho(item){
      if (!isEmpty(item)){
        if (item.hasOwnProperty('from_who')){
          return item['from_who']
        }else{
            if (item.hasOwnProperty('fromWho')){
              return item['fromWho']?.fullName
            }
        }
      }
      return 'Не указано'

    },
    getCorrespondenceType(item) {
      if (isObject(item)) {
        return item.name
      }
      return item
    }
  },
  computed: {
    projectMoneyReport() {
      return this.$store.getters.projectMoneyData
    }
  },
  created() {
    console.log('created')
    let projectPK = this.$route.params['pk'];
    this.$store.dispatch('getProjectMoneyReport', projectPK)
  },
  components: {
    PostEdit
  }
}
</script>

<style scoped>
#report-card {
  overflow-x: scroll;
  overflow-y: scroll;
}

>>> .v-card__text {
  padding-bottom: 0;
  padding-top: 1px;
  border-bottom: 1px solid #a1a1a1;
}

.bg-grey {
  background-color: #f4f4f4;

}
</style>