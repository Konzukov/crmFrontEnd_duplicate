<template>
  <v-card width="100%" height="100%">
    <v-card-title class="justify-center">Задача "{{ task.name }}"</v-card-title>
    <v-card-text class="task-detail">
      <v-row class="description">
        <v-col cols="auto">
          <h3>Описание</h3>
          <p>
            {{ task.description }}
          </p>
        </v-col>
      </v-row>
      <v-row justify="space-around">
        <v-col cols="auto">
          <h3>Срок исполнения с </h3>
          <p v-text="task.date_from? task.date_from: 'Не указано'"></p>
        </v-col>
        <v-col cols="auto">
          <h3>Срок исполнения до </h3>
          <p v-text="task.date_to? task.date_to: 'Не указано'"></p>
        </v-col>
        <v-col cols="auto">
          <h3>Исполнитель</h3>
          <p v-text="task.executor? task.executor: 'Не указано'"></p>
        </v-col>
        <v-col cols="auto">
          <h3>Автор</h3>
          <p v-text="task.author"></p>
        </v-col>
      </v-row>

    </v-card-text>
    <v-card-actions>
      <v-row justify="end">
        <v-col cols="auto" class="mr-3">
          <v-btn color="error" @click="close">Отмена</v-btn>
        </v-col>
        <v-col cols="auto" class="mr-3">
          <v-btn color="primary" @click="editTask">Редактировать</v-btn>
        </v-col>
        <v-col cols="auto" class="mr-3">
          <v-btn color="success" @click="createEvent">Создать событие</v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script>

export default {
  props: ['task', 'event'],
  name: "TaskDetail",
  methods: {
    close() {
      this.$emit('hideDetail')
    },
    editTask() {
      this.$emit("editTask", this.task)
    },
    createEvent() {
      this.$emit('createEvent', this.task)
    }
  }
}
</script>

<style scoped>
>>> .v-card__title {
  max-height: 100px !important;
  min-height: 100px !important;
}

.description {
  min-height: 340px;
  max-height: 340px;
  overflow-y: auto;
}

.task-detail {
  min-height: 55%;
}
</style>