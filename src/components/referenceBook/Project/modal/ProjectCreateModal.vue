<template>
  <v-dialog v-model="dialog" >
    <v-card class="pa-4">
      <ProjectCreate @close="close"></ProjectCreate>
    </v-card>
  </v-dialog>
</template>

<script>
import ProjectCreate from "@/components/referenceBook/Project/ProjectCreate";

export default {
  name: "ProjectCreateModal",
  data: ()=>({
    dialog: false,
  }),
  methods: {
    close(project){
      this.dialog = false
      this.$emit('setProject', project)
    }
  },
  created() {
    this.$parent.$on('newProject', ()=>{
      this.dialog = true
    })
  },
  components:{
    ProjectCreate
  }
}
</script>

<style scoped>

</style>