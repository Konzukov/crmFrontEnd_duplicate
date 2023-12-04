<template>
  <v-dialog v-model="dialog" width="70%">
    <v-card>
      <v-card-title>
        <span class="headline">{{ formTitle }}</span>
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-row justify="start">
            <v-col md="2" lg="2" xl="2" sm="4">
              <v-text-field
                  label="Номер"
                  outlined
                  v-model="form['number']"
              ></v-text-field>
            </v-col>
            <v-col md="6" lg="6" xl="6" sm="8">
              <v-text-field
                  label="Дата"
                  outlined
                  type="datetime-local"
                  v-model="form['date']"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col md="6" xl="6" lg="5" sm="12">
              <v-autocomplete
                  outlined
                  label="Проект"
                  :items="projectList"
                  v-model="form['project']"
                  item-text="name"
                  item-value="pk"
              ></v-autocomplete>
            </v-col>
            <v-col md="5" xl="5" lg="5" sm="12">
              <v-text-field
                  outlined
                  label="Сумма"
                  type="number"
                  v-model="form['amount']"
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col md="10" sm="11">
              <v-textarea cols="4" v-model="form['description']" outlined label="Описание">

              </v-textarea>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-checkbox v-model="form.is_confirm" label="Подтвержден"></v-checkbox>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-row justify="space-around">
          <v-col md="6" xl="6" sm="6">
            <v-btn color="error" @click="close()">Закрыть</v-btn>
          </v-col>
          <v-col md="6" xl="6" sm="6">
            <v-btn color="success" @click="save()">Сохранить</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import moment from "moment";
import {mapActions, mapGetters} from 'vuex'

export default {
  props: ['number'],
  name: "createReceipts",
  data: () => ({
    dialog: false,
    editedIndex: -1,
    action: 'create',
    form: {
      pk: '',
      number: '',
      date: moment().format('yyyy-MM-DD hh:mm'),
      project: '',
      amount: '',
      description: '',
      is_confirm: null
    }
  }),
  computed: {
    ...mapGetters({
      projectList: "projectListData",
    }),
    formTitle() {
      return this.editedIndex === -1 ? 'Добавить постуление' : `Редактировать поуступление № ${this.editedIndex}`
    },
  },
  methods: {
    ...mapActions(['getProjectList', 'createMoneyReceipts', 'detailMoneyReceipts', 'editMoneyReceipts']),
    close() {
      this.dialog = false
      Object.assign(this.$data, this.$options.data())
    },
    save() {
      let formData = new FormData
      Object.keys(this.form).forEach(key => {
        if (this.form[key]) {
          formData.set(key, this.form[key])
        }
      })
      if (this.action === 'create') {
        this.createMoneyReceipts(formData).then(() => {
          this.close()
        }).catch(err => {
          if (err.response.status) {
            this.$confirm(err.response.data.errors.detail).then(_ => {
              this.close()
            }).catch(_ => {

            })
          }
        })
      } else {
        this.editMoneyReceipts({formData: formData, pk: this.form['pk']}).then(() => {
          this.close()
        }).catch(err => {
          console.log(err)
          if (err.response.status) {
            this.$confirm(err.response.data.errors.detail).then(_ => {
              this.close()
            }).catch(_ => {

            })
          }
        })
      }

    }
  },
  created() {
    this.$parent.$on('newReceipts', (num) => {
      this.getProjectList()
      this.action = 'create'
      this.dialog = true
      this.form['number'] = num + 1
    })
    this.$parent.$on('editReceipts', (item) => {
      console.log(item)
      console.log(item['pk'])
      this.editedIndex = item['pk']
      this.detailMoneyReceipts(item['pk']).then((receipts) => {
        Object.keys(this.form).forEach(key => {
          if (key === 'project') {
            this.form[key] = receipts[key]['pk']
          }
          else if (key === 'date') {
            this.form[key] = moment(receipts[key]).format('yyyy-MM-DDThh:mm')
          }
          else {
            this.form[key] = receipts[key]
          }
        })
        this.action = 'edit'
        this.dialog = true
      }).catch(err => {
        console.log(err)
        if (err.response.status) {
          this.$confirm(err.response.data.errors.detail).then(_ => {
            this.close()
          }).catch(_ => {

          })
        }
      })

    })
  }
}
</script>

<style scoped>
>>> .row {
  margin: 0;
  padding: 0;
}
</style>