<template>
  <v-card flat fluid class="mt-3" width="100%">

    <v-card-text>

      <v-treeview
          :items="zipData"
          v-model="tree"
          activatable
          item-key="name"
          open-on-click
      >

        <template v-slot:prepend="{ item, open }">
                <v-icon v-if="!item.file">
                  {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                </v-icon>
                <v-icon v-else :class="item.file">
                  {{files[item.file]}}
                </v-icon>
        </template>
      </v-treeview>
      <!--      <v-row justify="space-between">-->
      <!--        <template v-for="(item, i) in zipData">-->
      <!--          {{item}}-->
      <!--          <v-col cols="12" :key="i">-->
      <!--&lt;!&ndash;            <v-row justify="start">&ndash;&gt;-->
      <!--&lt;!&ndash;              <v-col cols="1" :class="['ext-icon', getExtension(item['filename'])]"></v-col>&ndash;&gt;-->
      <!--&lt;!&ndash;              <v-col cols="6"  >{{ item['filename'] }}</v-col>&ndash;&gt;-->
      <!--&lt;!&ndash;              <v-col cols="2" >{{ item['modified'] }}</v-col>&ndash;&gt;-->
      <!--&lt;!&ndash;              <v-col cols="2" >{{ item['size'] | sizeFormat }}</v-col>&ndash;&gt;-->
      <!--&lt;!&ndash;            </v-row>&ndash;&gt;-->
      <!--          </v-col>-->
      <!--        </template>-->
      <!--      </v-row>-->
    </v-card-text>

  </v-card>
</template>

<script>
import {mdiFilePdf, mdiFileWord, mdiFileExcel, mdiZipBox, mdiFileKey } from '@mdi/js'
export default {
  props: ['zipData'],
  data: () => ({
    files: {
      pdf: mdiFilePdf,
      zip: mdiZipBox,
      xls: mdiFileExcel,
      xlsx: mdiFileExcel,
      xlsb: mdiFileExcel,
      doc: mdiFileWord,
      docx: mdiFileWord,
      sig: mdiFileKey ,
    },
    tree: [],
  }),
  methods: {
    getExtension(fileName) {
      console.log(fileName.split('.').pop())
      return fileName.split('.').pop().toLowerCase();
    }
  },
  filters: {
    sizeFormat(size) {
      if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} Кб`;
      } else if (size < 1024 * 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(2)} Мб`;
      } else {
        return `${(size / (1024 * 1024 * 1024)).toFixed(2)} Гб`;
      }
    }
  }
}
</script>

<style scoped >
.ext-icon {
  height: 70px;
  align-self: center;
  background-size: 35px auto !important;
  background-position: 0 10% !important;
}
.v-icon.pdf {
  color: red;
}

.v-icon.docx , .v-icon.doc {
  color: blue;
}
.v-icon.xls, .v-icon.xlsx, .v-icon.xlsb {
  color: green;
}
.v-icon.zip, v-icon.rar {
  color: orange;
}

.v-icon.sig {
  color: #6285ef;
}

.ext-icon.pdf {
  background: url("../referenceBook/Project/FileView/icons/pdf-file.svg") no-repeat;

}

.ext-icon.zip {
  background: url("../referenceBook/Project/FileView/icons/zip-file.svg") no-repeat;
}

.ext-icon.xls, .ext-icon.xlsx {
  background: url("../referenceBook/Project/FileView/icons/excel-file.svg") no-repeat;
}

.ext-icon.doc, .ext-icon.docx {
  background: url("../referenceBook/Project/FileView/icons/microsoft-word.svg") no-repeat;
}

.date {
  font-size: 12px;
  color: #666;
}
</style>