<template>
  <v-container fluid>
    <v-row justify="start">
      <v-col cols="12" md="4" sm="6">
        <v-row>
          <v-col md="12">
            <v-card>
              <v-row justify="center">
                <v-card-title><span class="heading">{{ participantFullInfo.participator | participatorName }}</span>
                </v-card-title>
              </v-row>
              <v-row justify="center">
                {{ participantFullInfo.participator | regData }}
              </v-row>
              <v-row justify="center">
                <v-card-actions>
                  <v-btn color="primary"
                         :to="{name: 'participatorOrganization', params:{pk: participantFullInfo.participator.pk}}">
                    Подробнее
                  </v-btn>
                </v-card-actions>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card>
              <v-row justify="center">
                <v-card-title><span class="heading">Сотрудники</span></v-card-title>
              </v-row>
              <v-card-text>
                <v-list-item-group>
                  <v-list-item three-line v-for="(staff, id) in participantFullInfo.staff" :key="id">
                    <v-list-item-content>
                      <v-list-item-title>
                        <span class="heading">{{ staff.staff | staffFullName }}</span>
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        {{ staff.department | hasDepPos }} - {{ staff.position | hasDepPos }}
                      </v-list-item-subtitle>
                      <v-row>
                        <v-col md="6" sm="12">
                          <v-icon>mdi-phone</v-icon>
                          {{ staff.staff.phone || '' }}
                        </v-col>
                        <v-col md="6" sm="12">
                          <v-icon>mdi-email</v-icon>
                          {{ staff.staff.email }}
                        </v-col>
                      </v-row>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-card-text>
              <v-row justify="center">
                <v-card-actions>
                  <v-btn color="primary"
                         :to="{name: 'participatorStaff', params:{pk: participantFullInfo.participator.pk}}">
                    Все сотрудники
                  </v-btn>
                </v-card-actions>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" md="6" sm="12">
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>Контракты</v-card-title>
            </v-card>
          </v-col>

        </v-row>
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>События</v-card-title>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>Задачи</v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import filter from "../../mixin/filter";

export default {
  name: "ParticipatorDetail",
  computed: {
    participantFullInfo() {
      return this.$store.getters.participantFullDetail
    }
  },
  mixins: [filter],
  created() {
    this.$store.dispatch('participatorFullInfo', this.$route.params.pk)
  }
}
</script>

<style scoped>

</style>