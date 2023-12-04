<template>
  <v-card class="pdf-document" height="92%" flat>
    <v-toolbar flat floating>
      <v-btn icon @click="scale+=0.2">
        <v-icon size="36">mdi-magnify-plus-outline</v-icon>
      </v-btn>
      <v-btn icon @click="scale-=0.2" class="mr-10">
        <v-icon size="36">mdi-magnify-minus-outline</v-icon>
      </v-btn>
    </v-toolbar>
    <div v-if="pages.length !== 0" class="page-container flex">
      <PDFPage v-for="page in pages" :page.sync="page" :scale="scale" :key="page.pageNumber"></PDFPage>
    </div>
  </v-card>
</template>

<script>
// import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
// import customConst from "@/const/customConst";
// const pdfjsWorker = import('pdfjs-dist/build/pdf.worker.entry')
// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
// const PDFPage = import('@/components/PDFViewer/PDFPage')

export default {
  props: {
    pdfUrl: String
  },
  name: "PDFDocument",
  data() {
    return {
      pdf: undefined,
      pages: [],
      scale: 1,
      pageCount: 0,
      currentPage: 1,
      activePage: null,
      renderPage: false,
    };
  },
  computed: {},
  methods: {
    // async getPDF() {
    //   const url = `${customConst.BASE_URL}${this.pdfUrl}`
    //   console.log(url)
    //   this.pdf = await pdfjsLib.getDocument(url).promise
    //
    //   this.pageCount = this.pdf.numPages
    //   // console.log(this.pdf, this.pageCount)
    //   for (let num = 1; num <= this.pdf.numPages; num++) {
    //     let page = await this.pdf.getPage(num)
    //     this.pages.push(page)
    //   }
    //   this.renderPage = true
    //
    // },
    // printPDF() {
    //   // print(this.pdfUrl)
    // }
  },
  components: {
    PDFPage: () => ({
      // component: PDFPage,
      delay: 900000
    })
  },
  async created() {
    // await this.getPDF();
  },
}
</script>

<style scoped>

.pdf-document {
  position: absolute;
  overflow-x: scroll;
  overflow-y: scroll;
  width: 99%;
  height: 92%;
}


.page-container {
  padding: 2px;
  height: 40%;
}

*::-webkit-scrollbar,
html *::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

*::-webkit-scrollbar-track,
html *::-webkit-scrollbar-track {
  background: lightgrey;
}

*::-webkit-scrollbar-thumb,
html *::-webkit-scrollbar-thumb {
  background-color: grey;
  border-radius: 5px;
  border: 3px solid grey;
}
</style>