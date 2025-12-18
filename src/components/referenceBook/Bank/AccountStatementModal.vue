<template>
  <v-dialog v-model="dialog" width="45vw">
    <v-card height="55vh" class="pt-6">
      <v-card-text style="height: 45%">
        <v-form lazy-validation v-model="valid">
          <v-row justify="start">
            <v-col cols="6">
              <v-text-field outlined dense v-model="form.date_from" label="Период с" type="date"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field outlined dense v-model="form.date_to" label="Период до" type="date"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start" class="ml-1 mr-1">
            <v-col cols="8">
              <v-autocomplete outlined dense label="Файл" v-model="form.file" :items="projectDocumentList"
                              item-value="id" item-text="file">

              </v-autocomplete>
            </v-col>
            <v-col cols="4">
              <v-text-field dense outlined label="Номер страницы"
                            append-outer-icon=""
                            v-model="form.page"
              >
                <template v-slot:append-outer>
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn small v-bind="attrs"
                             v-on="on" icon color="primary">
                        <svg-icon type="mdi" :path="helpIcon"></svg-icon>
                      </v-btn>
                    </template>
                    <span>Номера страниц. Например: 1-5, 8, 13-15</span>
                  </v-tooltip>

                </template>
              </v-text-field>
            </v-col>

          </v-row>
        </v-form>
      </v-card-text>
      <v-card-text style="height: 35%">
        <v-row justify="center" v-if="close">
          Данные сохранены. Окно будет закрыто автоматически
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-row justify="center">
          <v-col cols="auto">
            <v-btn color="error" @click="dialog=false">Закрыть</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn color="success" @click="save" :disabled="saving">Сохранить</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
    <v-overlay :value="isLoading" absolute>
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-dialog>
</template>


<script>
// import customConst from "@/const/customConst";

import {mapGetters} from "vuex";
import customConst from "@/const/customConst";
import SvgIcon from "@jamescoyle/vue-icon";
import {mdilHelp} from '@mdi/light-js'
import moment from "moment/moment";

export default {
  props: ['statement'],
  name: 'AccountStatementModal',
  data: () => ({
    isLoading: false,
    dialog: false,
    valid: false,
    saving: false,
    close: false,
    helpIcon: mdilHelp,
    form: {
      id: '',
      bank_account: '',
      date_from: '',
      date_to: '',
      file: '',
      page: '',
    },
  }),
  methods: {
    save() {
      this.saving = true
      let formData = new FormData()
      Object.keys(this.form).forEach(key => {
        formData.set(key, this.form[key])
      })
      if (this.form.id) {
        this.$http({
          method: "PUT",
          url: customConst.PAPERFLOW_API + `bank-account-statement/${this.form.id}/`,
          data: formData
        }).then(res => {
          this.close = true
          setTimeout(() => {
            Object.assign(this.$data, this.$options.data())
            this.dialog = false
            this.saving = false
          }, 1000)
        }).catch(err => {
          this.saving = false
        })
      } else {
        this.$http({
          method: "POST",
          url: customConst.PAPERFLOW_API + "bank-account-statement/",
          data: formData
        }).then(res => {
          this.close = true
          setTimeout(() => {
            Object.assign(this.$data, this.$options.data())
            this.dialog = false
            this.saving = false
          }, 1000)
        }).catch(err => {
          this.saving = false
          console.log(err)
        })
      }

    }
  },
  computed: {
    ...mapGetters({
      projectDocumentList: 'projectDocumentListData'
    })
  },
  filters: {
    getName(obj) {
      if (typeof obj === 'object') {
        if (obj && obj.hasOwnProperty('fullName')) {
          return obj.fullName
        }
        return '-------'
      } else {
        return obj
      }
    }
  },
  created() {
    this.$parent.$on('editAccountStatement', async ({statement, project}) => {
      this.dialog = true
      this.isLoading = true
      await this.$store.dispatch('getProjectDocument', project).then(() => {
        Object.keys(this.form).forEach(key => {
          if (key === 'date_from') {
            this.form[key] = moment(statement[key], 'DD.MM.yyyy').format('yyyy-MM-DD')
          } else if (key === 'date_to') {
            this.form[key] = moment(statement[key], 'DD.MM.yyyy').format('yyyy-MM-DD')
          } else {
            this.form[key] = statement[key]
          }
        })
        this.isLoading = false
      })
    })
    this.$parent.$on('addAccountStatement', async ({account, project}) => {
      this.dialog = true
      this.isLoading = true
      await this.$store.dispatch('getProjectDocument', {project}).then((data) => {
        this.isLoading = false
      })
      this.form.bank_account = account

    })
  },
  components: {
    SvgIcon
  }
}
</script>

<style scoped>
.item-from {
  font-size: 12px;
}


>>> .v-list-item:nth-child(2n - 1) {
  background-color: #d7d7d7;

}

.item-additional-info {
  font-size: 10px;
}
</style>