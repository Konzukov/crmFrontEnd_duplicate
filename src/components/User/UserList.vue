<template>
  <v-container fluid>
    <v-row>
      <v-col md="4" lg="4" xl="4" sm="6">
        <v-list subheader>
          <v-subheader>Пользователи в сети</v-subheader>

          <v-list-item
              v-for="user in onlineUser"
              :key="user.pk"
          >
            <v-list-item-avatar>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>{{user.last_name}} {{user.first_name}} <span class="dot"></span></v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
            </v-list-item-icon>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  name: "UserList",
  computed: {
    ...mapGetters({
      onlineUser: 'getOnlineUserList'
    })
  },
  created() {
    this.$store.dispatch('getOnlineUser')
  }
}
</script>

<style scoped>
.dot {
  width: 2px;
  height: 2px;
  color: green;
}
</style>