<template>
  <v-dialog v-model="dialog" width="50wv">
    <v-card height="60vh">
      <v-toolbar dense>
        <v-toolbar-title>Выберите способ коммуникации для</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon small @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text style="height: 80%">
        <v-list two-line flat>
          <v-list-item-group v-model="selectedCommunication" color="success">
            <v-list-item v-for="item in communications" :key="item.id" :value="item">
              <v-list-item-icon>
                <v-icon v-if="item['communication_type'] === 'Email'">mdi-gmail</v-icon>
                <v-icon v-else-if="item['communication_type'] === 'PaperMail'">mdi-email-open-outline</v-icon>
                <v-icon v-else-if="item['communication_type'] === 'ElectronicMail'">mdi-email-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ getCommunicationMethod(item['communication_type']) }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item['value'] }}
                  <v-btn icon small color="primary" @click.native.stop="editCommunication(item)" class="ml-9">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
        <v-spacer></v-spacer>
        <v-btn color="success" @click="addCommunication">Добавить</v-btn>
      </v-card-text>
      <v-card-actions class="d-flex justify-center">
        <v-btn color="error" @click="close">Закрыть</v-btn>
        <v-btn color="success" @click="save">Сохранить</v-btn>
      </v-card-actions>
    </v-card>
    <CommunicationForm :communicationItem="selectedCommunication" @update="update"></CommunicationForm>
  </v-dialog>
</template>

<script>
import CommunicationForm from "@/components/referenceBook/Communication/CommunicationForm.vue";
import {eventBus} from "@/bus";

export default {
  name: "SelectCommunication",
  components: {CommunicationForm},
  data: () => ({
    dialog: false,
    legal: null,
    physical: null,
    communications: [],
    selectedCommunication: null,
  }),
  methods: {
    update(item) {
      console.log(item)
      const attributes = item.data.data.attributes
      const id = item.data.data.id
      if (item.status === 201) {
        this.communications.push({
          id: id,
          communication_type: attributes['communication_type'],
          is_main: attributes['is_main'],
          value: attributes['value'],
        })
      }
      const communication = this.communications.filter(obj => obj.id === Number(id))[0]
      if (communication) {
        Object.entries(attributes).forEach(([key, value]) => {
          communication[key] = value
        })
        if (communication['is_main']) {
          this.selectedCommunication = communication
        }
      }
    },
    close() {
      this.dialog = false
    },
    save() {
      if (!this.selectedCommunication) return
      const formData = new FormData()
      formData.append('is_main', true)
      const fields = ['communication_type', 'value']
      fields.forEach(key => {
        if (this.selectedCommunication[key] !== undefined) {
          formData.append(key, this.selectedCommunication[key])
        }
      })
      if (this.legal) {
        formData.append('legal', this.legal.id)
      } else {
        formData.append('physical', this.physical.id)
      }
      this.$store.dispatch('editCommunication', {
        formData: formData,
        id: this.selectedCommunication.id
      }).then(() => {
        this.close()
        this.$emit('updateQueue')
      })
    },
    editCommunication(item) {
      eventBus.$emit('editCommunication', item)
    },
    addCommunication() {
      eventBus.$emit('addCommunication', {legal: this.legal.id})
    },
    getCommunicationMethod(type) {
      return this.communicationMethods[type] || type;
    }
  },
  computed: {
    communicationMethods() {
      return {
        'PaperMail': 'Бумажная почта',
        'ElectronicMail': 'Электронные письма',
        'Email': 'Электронная почта',
        'SBIS': 'Сбис'
      };
    },
  },
  created() {
    this.$parent.$on('selectCommunication', (item) => {
      console.log(item)
      if (item.type === "LegalEntity") {
        this.legal = item
      } else {
        this.physical = item
      }
      this.communications = item.communication || [];
      // Устанавливаем основной способ коммуникации как выбранный по умолчанию
      this.selectedCommunication = this.communications.find(obj => obj.is_main) || null;
      this.dialog = true;
    })
  }
}
</script>


<style scoped>

</style>