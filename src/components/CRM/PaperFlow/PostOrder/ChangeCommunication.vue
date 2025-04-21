<template>
  <v-dialog v-model="dialog" width="50vw">
    <v-card height="45vh">
      <v-card-title>Изменить способ отправки</v-card-title>
      <v-card-text>
        <template v-if="legal">
          <h4>Поменять способ отправки для {{ legal.name }}</h4>
        </template>
        <template v-else-if="physical !== null">
          <h3>Поменять способ отправки для <strong>{{ physical.fullName }}</strong></h3>
        </template>
        <v-divider></v-divider>
        <v-list-item-group>
          <v-list-item v-for="(item, i) in communicationMethodList" :key="i">
            <v-list-item-action>
              <v-checkbox v-model="communicationMethod" :value="item.value"></v-checkbox>
            </v-list-item-action>

            <v-list-item-content>
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn color="error" @click="close" class="mr-5">
          Отмена
        </v-btn>
        <v-btn color="success" @click="save">
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script>
export default {
  name: "ChangeCommunication",
  data: () => ({
    dialog: false,
    legal: null,
    physical: null,
    communicationMethod: "ElectronicMail",
    communicationMethodList: [
      {value: "ElectronicMail", text: "Электронные письма"},
      {value: "PaperMail", text: "Бумажная почта"},
      {value: "Email", text: "Электронная почта"},
    ]
  }),
  methods: {
    close() {
      this.dialog = false
      Object.assign(this.$data, this.$options.data())
    },
    save() {
      let formData = new FormData()
      if (this.legal !== null) {
        formData.append('legal', this.legal.id)
      }else {
        formData.append('physical', this.physical.id)
      }
      formData.append('communicationMethod', this.communicationMethod)
      this.$store.dispatch('changeCommunicationMethod', formData).then(res=>{
        this.close()
        this.$emit('updateQueue')
      })
    }
  },
  created() {
    this.$parent.$on("changeCommunication", (item) => {
      this.communicationMethod = item.fromWho['communication']
      if (item['fromWho'].type === "LegalEntity") {
        this.legal = item['fromWho']
      } else {
        this.physical = item['fromWho']
      }
      this.dialog = true
    })
  }
}


</script>

<style scoped>
.v-card__text {
  height: 60%;
}
</style>