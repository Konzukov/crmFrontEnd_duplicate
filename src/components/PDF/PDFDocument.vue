<template>
  <v-container>
    <v-btn @click="loadPds">Загрузить</v-btn>
  </v-container>
</template>

<script>
import range from 'lodash/range';
// import * as pdfjslib from 'pdfjs-dist/legacy/build/pdf'
// const pdfjsWorker = import('pdfjs-dist/build/pdf.worker.entry');
import customConst from "@/const/customConst";
// pdfjslib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export default {
  name: "PDFDocument",
  props: {
    pdf: String
  },
  data: () => ({}),
  methods: {
    // async loadPds(){
    //   let pdfPages = []
    //   await pdfjslib.getDocument(`${customConst.BASE_URL}${this.pdf}`).promise.then(obj=>{
    //     range(1, obj.numPages + 1).map(number=>{
    //       obj.getPage(number).then(page=>{
    //         pdfPages.push(page)
    //         page.render()
    //       })
    //     })
    //
    //   })
    // }
  },
  created() {
    // this.loadPds()
  }
}
</script>

<style scoped>

</style>