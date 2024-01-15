<template>
  <v-dialog v-model="dialog" width="65vw" scrollable>
    <v-card style="overflow: hidden">
      <v-card-title class="justify-center">Документы на сайте суда</v-card-title>
      <v-card-text style="min-height: 40vh" class="align-center flex justify-center">
        <div v-if="availableDocList.length === 0">
          <v-row justify="center">
            <v-progress-circular
                :size="70"
                color="primary"
                indeterminate
            >

            </v-progress-circular>
          </v-row>
          <v-row justify="center">Загрузка данных...</v-row>
        </div>
        <v-list-item-group v-else>
          <v-list-item v-for="(doc, i) in availableDocList " :key="i">
            <template v-slot:default="{ active }">
              <v-list-item-action>
                <v-checkbox :input-value="active" @change="selectDoc(doc)"></v-checkbox>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ doc.date }} | {{ doc.type }}</v-list-item-title>
                <v-list-item-subtitle><a :href=doc.file target="_blank">{{ doc.description }}</a></v-list-item-subtitle>
              </v-list-item-content>
            </template>
          </v-list-item>
        </v-list-item-group>
      </v-card-text>
      <v-card-actions class="mt-4">
        <v-row justify="center">
          <v-col cols="3" class="ml-5">
            <v-btn color="error" @click="close">Отмена</v-btn>
          </v-col>
          <v-col cols="3">
            <v-btn color="success" @click="saveDoc">Добавить</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from 'moment'

export default {
  props: ['availableDocList'],
  name: "DocInArbitr",
  data: () => ({
    dialog: false,
    selectedDoc: {
      url: null,
      type: null,
      date: null
    },
    docList: [
      {
        "date": "03.04.2023",
        "type": "Ходатайства",
        "file": "",
        "description": "Ходатайство о приобщении к делу дополнительных документов",
        "additionalInfo": ""
      },
      {
        "date": "29.03.2023",
        "type": "Дополнение к делу",
        "file": "",
        "description": "Дополнение",
        "additionalInfo": ""
      },
      {
        "date": "27.03.2023",
        "type": "Дополнение к делу",
        "file": "",
        "description": "Дополнение",
        "additionalInfo": ""
      },
      {
        "date": "27.03.2023",
        "type": "Ходатайства",
        "file": "",
        "description": "Ходатайство о приобщении к делу дополнительных документов",
        "additionalInfo": ""
      },
      {
        "date": "27.03.2023",
        "type": "Ходатайства",
        "file": "",
        "description": "Ходатайство об ознакомлении с материалами дела",
        "additionalInfo": ""
      },
      {
        "date": "23.03.2023",
        "type": "Прочие судебные документы",
        "file": "",
        "description": "Резолютивная часть решения по делу о несостоятельности (банкротстве)",
        "additionalInfo": ""
      },
      {
        "date": "23.03.2023",
        "type": "Информация о принятом судебном акте",
        "file": "",
        "description": "Решение о признании гражданина банкротом и введении реализации имущества",
        "additionalInfo": ""
      },
      {
        "date": "23.03.2023",
        "type": "Ходатайства",
        "file": "",
        "description": "Ходатайство о приобщении к делу дополнительных документов",
        "additionalInfo": ""
      },
      {
        "date": "16.03.2023",
        "type": "Определение",
        "file": "https://kad.arbitr.ru/Kad/PdfDocument/ca8d8f66-c771-462a-ab17-ce43f7018132/8f58d628-ab6a-40ed-a212-96abdf580868/A15-6696-2022_20230316_Opredelenie.pdf",
        "description": "Перерыв в заседании",
        "additionalInfo": "Дата и время судебного заседания 23.03.2023, 16:15, Зал № 11"
      },
      {
        "date": "16.03.2023",
        "type": "Информация о принятом судебном акте",
        "file": "",
        "description": "Перерыв в заседании",
        "additionalInfo": "Дата и время судебного заседания 23.03.2023, 16:15, Зал № 11"
      },
      {
        "date": "16.03.2023",
        "type": "Дополнение к делу",
        "file": "",
        "description": "Дополнение",
        "additionalInfo": ""
      },
      {
        "date": "06.03.2023",
        "type": "Ходатайства",
        "file": "",
        "description": "Ходатайство о приобщении к делу дополнительных документов",
        "additionalInfo": ""
      },
      {
        "date": "15.02.2023",
        "type": "Определение",
        "file": "https://kad.arbitr.ru/Kad/PdfDocument/ca8d8f66-c771-462a-ab17-ce43f7018132/70858e16-1dcc-4397-b30f-0e72883fdb4f/A15-6696-2022_20230215_Opredelenie.pdf",
        "description": "Об отложении судебного разбирательства",
        "additionalInfo": "Дата и время судебного заседания 16.03.2023, 15:30, Зал № 11"
      },
      {
        "date": "15.02.2023",
        "type": "Информация о принятом судебном акте",
        "file": "",
        "description": "Об отложении судебного разбирательства",
        "additionalInfo": "Дата и время судебного заседания 16.03.2023, 15:30, Зал № 11"
      },
      {
        "date": "02.02.2023",
        "type": "Заявление",
        "file": "",
        "description": "Заявление о представлении кандидатуры арбитражного управляющего",
        "additionalInfo": ""
      },
      {
        "date": "30.01.2023",
        "type": "Дополнение к делу",
        "file": "",
        "description": "Дополнение",
        "additionalInfo": ""
      },
      {
        "date": "30.01.2023",
        "type": "Ходатайства",
        "file": "",
        "description": "Ходатайство о приобщении к делу дополнительных документов",
        "additionalInfo": ""
      },
      {
        "date": "24.01.2023",
        "type": "Дополнение к делу",
        "file": "",
        "description": "Дополнение",
        "additionalInfo": ""
      },
      {
        "date": "24.01.2023",
        "type": "Дополнение к делу",
        "file": "",
        "description": "Дополнение",
        "additionalInfo": ""
      },
      {
        "date": "20.01.2023",
        "type": "Ходатайства",
        "file": "",
        "description": "Ходатайство о рассмотрении дела в отсутствии лица, участвующего в деле",
        "additionalInfo": ""
      },
      {
        "date": "19.01.2023",
        "type": "Дополнение к делу",
        "file": "",
        "description": "Дополнение",
        "additionalInfo": ""
      },
      {
        "date": "26.12.2022",
        "type": "Определение",
        "file": "https://kad.arbitr.ru/Kad/PdfDocument/ca8d8f66-c771-462a-ab17-ce43f7018132/21f1ab34-dee8-4b6e-ae0c-ffa1facaa8a5/A15-6696-2022_20221226_Opredelenie.pdf",
        "description": "О принятии заявления о признании должника банкротом",
        "additionalInfo": "Дата и время судебного заседания 15.02.2023, 15:00, Зал № 11"
      },
      {
        "date": "16.12.2022",
        "type": "Ходатайства",
        "file": "",
        "description": "Ходатайство о приобщении к делу дополнительных документов",
        "additionalInfo": ""
      },
      {
        "date": "24.11.2022",
        "type": "Определение",
        "file": "https://kad.arbitr.ru/Kad/PdfDocument/ca8d8f66-c771-462a-ab17-ce43f7018132/2a806d26-23d2-4e3d-a62f-14a70692804f/A15-6696-2022_20221124_Opredelenie.pdf",
        "description": "Об оставлении заявления о признании должника банкротом без движения",
        "additionalInfo": "Оставлено без движения до 23.12.2022"
      },
      {
        "date": "17.11.2022",
        "type": "Заявление",
        "file": "",
        "description": "Заявление о признании гражданина (индивидуального предпринимателя) банкротом",
        "additionalInfo": ". Сумма исковых требований 1100000"
      }
    ]
  }),
  methods: {
    selectDoc(doc) {
      this.selectedDoc.url = doc.file
      this.selectedDoc.type = doc.type
      this.selectedDoc.date = moment(doc.date, 'DD.MM.YYYY').format('YYYY-MM-DD')
    },
    openModal() {
      this.dialog = true
    },
    close() {
      this.dialog = false
      this.$emit('clearDocumentArbitr')
    },
    saveDoc(){
      this.$emit('saveDoc', {url: this.selectedDoc.url, type: this.selectedDoc.type, date: this.selectedDoc.date})
    }
  },
  watch: {
    availableDocList() {
      if (this.availableDocList.length > 0) {
        this.dialog = true
      }
    }
  }

}
</script>

<style scoped>

</style>