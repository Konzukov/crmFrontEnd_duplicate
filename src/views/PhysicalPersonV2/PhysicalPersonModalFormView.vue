<template>

  <v-dialog v-model="show" fullscreen>
    <div v-if="isLoading" class="text-center py-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <PhysicalPersonDetail
        v-else
        style="overflow: scroll"
        :show-snackbar="true"
        :person="person"
        :show-action-button="true"
        @cancel="closeModal"
    />
  </v-dialog>
</template>

<script>
import PhysicalPersonDetail from "@/components/referenceBook/PhysicalPersonV2/PhysicalPersonDetail.vue";

export default {
  name: "PhysicalPersonModalFormView",
  components: {
    PhysicalPersonDetail
  },
  data: () => ({
    show: false,
    person: {},
    isLoading: false
  }),
  created() {
    this.$parent.$on('showModalPerson', this.handleShowModal);
  },
  beforeDestroy() {
    this.$parent.$off('showModalPerson', this.handleShowModal);
  },
  methods: {
    async handleShowModal(id) {
      try {
        this.isLoading = true; // Начинаем загрузку
        this.show = true;
        const data = await this.$store.dispatch('fetchSinglePhysicalPersons', id);
        setTimeout(() => {
          this.person = {...data}
        }, 300)

      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        this.$notify.error("Не удалось загрузить данные");
        this.closeModal();
      } finally {
        this.isLoading = false; // Завершаем загрузку
      }
    },
    closeModal() {
      this.show = false;
      setTimeout(() => {
        this.person = {};
      }, 300);
    }
  }
};
</script>