<script>
import {defineComponent} from 'vue'

export default defineComponent({
  name: "PostQueueItem"
})
</script>

<template>
  <v-list-item
    :style="index % 2 !== 0 ? 'background-color: #cfcfcf4d' : ''"
    style="font-size: 14px"
  >
    <v-row justify="start" class="py-5">
      <!-- Колонки -->
      <v-col cols="1">
        <v-checkbox
          dense
          :disabled="disabled"
          v-model="selected"
          @change="$emit('select')"
        />
      </v-col>

      <v-col cols="1">{{ item | postNumber }}</v-col>

      <v-col cols="1">
        <communication-icon :communication="item.document.fromWho.main_communication" />
      </v-col>

      <v-col cols="3">
        <project-info :project="item.document.project[0]" />
      </v-col>

      <v-col cols="3">
        <sender-info :sender="item.document.fromWho" />
      </v-col>

      <v-col cols="2">
        <document-info :document="item.document" />
      </v-col>

      <v-col cols="1">
        <item-actions
          @edit="$emit('edit')"
          @change-file="$emit('change-file')"
          @change-communication="$emit('change-communication')"
          @delete="$emit('delete')"
        />
      </v-col>
    </v-row>
  </v-list-item>
</template>

<style scoped>

</style>