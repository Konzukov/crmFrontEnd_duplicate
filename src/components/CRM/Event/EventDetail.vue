<template>
  <v-card width="100%" height="100%">
    <v-card-title class="justify-center">Событие "{{ event.name }}"</v-card-title>
    <v-card-text class="task-detail">
      <v-row class="description">
        <v-col cols="auto">
          <h3>Описание</h3>
          <p>
            {{ event.description }}
          </p>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="auto">
          <h3>Дата создания</h3>
          <p v-text="event.date? event.date: 'Не указано'"></p>
        </v-col>
        <v-col cols="auto">
          <h3>Автор</h3>
          <p v-text="event.author ? event.author['fullName']: 'Не указано'"></p>
        </v-col>
        <v-col cols="auto">
          <h3>Проект</h3>
          <p v-text="event.project.length !== 0 ? projectName(event.project) : 'Не указано'"></p>
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
          <v-btn color="success" @click="createTask">Создать задачу</v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script>

export default {
  props: ['event'],
  name: "EventDetail",
  methods: {
    close() {
      this.$emit('hideDetail')
    },
    editTask() {
      this.$emit("editEvent", this.event)
    },
    createTask() {
      this.$emit('createTask', this.event)
    },
    projectName(obj) {
      let projectList = "";
      if (obj) {
        for (let project of obj) {
          projectList += project.name + ', '
        }
      } else {
        projectList = "Не указано"
      }
      return projectList
    }
  },
  filters: {}
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