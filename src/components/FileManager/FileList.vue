<template>
  <v-list>
    <v-list-item
        v-for="(item, i) in files" :key="i"
    >
      <SingleFile :file.sync="item"></SingleFile>
    </v-list-item>

  </v-list>
</template>

<script>
import SingleFile from "@/components/FileManager/SingleFile";


export default {
  props: {
    files: {
      type: Array,
      require: true,
    }
  },
  name: "FileList",
  components: {
    SingleFile
  }
}
</script>

<style scoped>

</style>