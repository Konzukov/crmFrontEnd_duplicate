<template>
  <v-container>
    <v-card flat>
      <v-card-title>Создать почтовое отправление</v-card-title>
      <v-card-text style="height: 70vh">
        <v-form lazy-validation v-model="valid">
          <v-row justify="start">
            <v-col cols="4">
              <v-text-field dense outlined label="Получатель" v-model="postData.recipientName"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field dense outlined label="Адрес получателя" v-model="postData.address"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="2">
              <v-text-field dense outlined label="Кол-во страниц" v-model="postData.pageCount"
                            :messages="calcWeight"
              ></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-text-field dense outlined label="Вес" v-model="postData.mass"
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-select dense outlined label="Категория РПО"
                        :items="mailCategory"
                        item-text="text"
                        item-value="val"
                        v-model="postData.mailCategory"></v-select>
            </v-col>
            <v-col cols="3">
              <v-select dense outlined label="Вид РПО"
                        :items="mailType"
                        item-text="text"
                        item-value="val"
                        v-model="postData.mailType"></v-select>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col cols="2">
              <v-text-field dense outlined label="Номер заказа" v-model="postData.orderNum"></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-select dense outlined label="Тип конверта"
                        :items="envelopeType"
                        item-text="text"
                        item-value="val"
                        v-model="postData.envelopeType"></v-select>
            </v-col>
            <v-col cols="6">
              <v-textarea dense rows="2" label="Комментарий" outlined v-model="postData.comment"></v-textarea>
            </v-col>
          </v-row>
          <v-row justify="start">

          </v-row>
          <v-row justify="start">
            <v-card flat>
              <v-card-text style="height: 30vh; overflow: auto">
                <v-row justify="start" v-for="(doc, i) in postData.documentId" :key="i">
                  <v-col cols="8">
                    <v-row justify="start">{{ doc.correspondence_type }}</v-row>
                    <v-row justify="start">{{ doc.file }}</v-row>
                  </v-col>
                  <v-col cols="4">
                    <v-select outlined dense label="Тип документа" :items="docType" item-value="value"
                              item-text="text"></v-select>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-btn @click="addDocument">Добавить документ</v-btn>
              </v-card-actions>
            </v-card>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-row justify="center">
          <v-col cols="4">
            <v-btn color="error" @click="close">Закрыть</v-btn>
          </v-col>
          <v-col cols="4">
            <v-btn color="success" @click="cleanAddress">Создать</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>

    </v-card>
    <PostOrderAddDocument @addDocToPost="addDocToPost"></PostOrderAddDocument>
  </v-container>
</template>

<script>
import customConst from "@/const/customConst";
import PostOrderAddDocument from "@/components/PostMail/PostOrderAddDocument";

export default {
  props: ['legalData', 'project', 'number', 'doc'],
  name: "PostMailForm",
  data: () => ({
    mailOrder: '',
    valid: false,
    calcWeight: '',
    docType: [
      {value: 'EMPTY', text: ''},
      {value: 'COPY', text: 'Копия документа'},
      {value: 'ORIGINAL', text: 'Оригинал докумениа'},
    ],
    mailCategory: [
      {val: 'ORDERED', text: 'Заказное'},
      {val: 'SIMPLE', text: 'Простое'},
      {val: 'ORDINARY', text: 'Обыкновенное'},
    ],
    mailType: [
      {val: 'LETTER', text: 'Письмо'},
      {val: 'BNADEROL', text: 'Бандероль'},
    ],
    envelopeType: [
      {val: 'C4', text: 'C4 - 229мм x 324мм'},
      {val: 'C5', text: 'C5 - 162мм x 229мм'},
      {val: 'DL', text: 'DL - 110мм x 220мм'},
      {val: 'OX', text: 'OX - Стикер ЗОО X6'},
    ],
    postData: {
      recipientName: '',
      address: '',
      pageCount: 0,
      mass: 0,
      mailCategory: 'ORDERED',
      mailType: 'LETTER',
      envelopeType: 'C5',
      orderNum: '',
      comment: '',
      legal_recipient: '',
      physical_recipient: '',
      documentId: []
    }
  }),
  methods: {
    close() {
      Object.assign(this.$data, this.$options.data())
      this.dialog = false
    },
    addDocument: function () {
      this.$emit('attachDoc')
    },
    cleanAddress() {
      let formData = new FormData()
      for (let [key, value] of Object.entries(this.postData)) {
        formData.append(key, value);
      }
      this.$http({
        method: "POST",
        url: customConst.PAPERFLOW_API + 'post-order/create-backlog/',
        data: formData,
        // responseType: 'blob'
      }).then(res => {
        this.mailOrder = res.data.data['shipment']
        this.notify = true
        setTimeout(() => {
          this.dialog = false
          Object.assign(this.$data, this.$options.data())
        }, 1100)

        // const contentDisposition = res.headers['content-disposition'];
        //
        // // 2) set the fileName variable to the default value
        // let fileName = 'forms_all.zip';
        //
        // // 3) if the header is set, extract the filename
        // if (contentDisposition) {
        //   const fileNameMatch =
        //       contentDisposition.match(/filename="(.+)"/);
        //   console.log('fileNameMatch', fileNameMatch);
        //   if (fileNameMatch.length === 2) {
        //     fileName = fileNameMatch[1];
        //   }
        // }
        // saveAs(res.data, fileName)
      })
    },
    addDocToPost(docs) {
      this.postData.documentId.push(...docs)
    }
  },
  watch: {
    'postData.pageCount'(val) {
      if (val) {
        let calcWeight = (val * 6) + 4.8
        let weight = Math.ceil(calcWeight)
        this.calcWeight = `Расчетный вес: ${weight} гр.`
        this.postData.mass = weight
        if (weight >= 100) {
          this.postData.mailType = 'BNADEROL'
        } else {
          this.postData.mailType = 'LETTER'
        }
      }
    }
  },
  created() {
    if (this.project && this.number) {
      this.postData.orderNum = this.project.id + '-' + this.number
      if (this.project.legal_contractor) {
        this.postData.legal_recipient = this.project.legal_contractor.id
      } else {
        this.postData.physical_recipient = this.project.physical_contractor.id
      }
    }
    if (this.legalData) {
      this.postData.address = this.legalData['postal_address']
      this.postData.recipientName = this.legalData['name']
    }
    if (this.doc) {
      this.postData.documentId = this.doc
    }

  },
  components: {
    PostOrderAddDocument
  }
}
</script>

<style scoped>

</style>