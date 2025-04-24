<template>
    <!-- Диалог подтверждения -->
    <v-dialog v-model="showDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">
          Подтвердите действие
        </v-card-title>

        <v-card-text>
          Вы уверены, что хотите выполнить это действие?
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDialog = false">
            Отмена
          </v-btn>
          <v-btn color="error" @click="confirmAction">
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>
<script>
import {eventBus} from "@/bus";

export default {
  name: "ConfirmDialog",
  data() {
    return {
      showDialog: false,
      deleteItem: null,
    }
  },
  methods: {
    confirmAction() {
      this.showDialog = false;
      this.$emit('confirm', this.deleteItem)
    }
  },
  created() {
    eventBus.$on('deleteCommunication', (item)=>{
      console.log('deleteCommunication')
      this.deleteItem = item
      this.showDialog = true
    })
  }
}
</script>