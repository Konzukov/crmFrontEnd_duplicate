<template>
  <v-dialog v-model="show" max-width="600px">
    <v-card height="25vh">
      <v-toolbar class="mb-6">
        <v-toolbar-title class="mr-5">Новый кошелек</v-toolbar-title>
        <v-divider vertical></v-divider>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon color="error" class="align-content-end" @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-form>
          <v-row justify="start">
            <v-col md="4" lg="4" sm="12">
              <v-select outlined label="Пользователь" :items="userList"
                        v-model="wallet.user"
                        disabled
                        item-value="user.pk"

                        item-text="fullName"></v-select>
            </v-col>
            <v-col md="6" lg="6" sm="12">
              <v-text-field label="Название кошелька"
                            outlined v-model="wallet.name"
                            :rules="rules.require"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-row justify="space-around">
          <v-btn @click="close" color="error">Закрыть</v-btn>
          <v-btn @click="save" color="success" :loading="loading">Сохранить</v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "createWallet",
  data: () => ({
    show: false,
    loading: false,
    wallet: {
      user: null,
      name: ''
    },
    rules: {
      require: [
        v => !!v || 'Данное поле обязательно',
      ]
    }

  }),
  computed: {
    ...mapGetters({
      userList: 'allSystemUsersData',
    }),
  },
  methods: {
    close() {
      Object.assign(this.$data, this.$options.data())
      this.show = false
    },
    save() {
      this.loading = true
      let formData = new FormData()
      formData.append('user', this.wallet.user)
      formData.append('name', this.wallet.name)
      this.$store.dispatch('createWallet', formData).then(() => {
        this.close()
      }).catch(err => {
        console.log(err)
      })
    }
  },
  created() {
    this.$parent.$on('addWallet', (userPk) => {
      console.log('emited')
      this.show = true
      this.wallet.user = userPk
    })
  }
}
</script>

<style scoped>

</style>