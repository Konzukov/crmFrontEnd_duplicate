<template>
  <v-dialog v-model="dialog" width="80vw">
    <v-card height="50vh" width="100%">
      <v-toolbar dense>
        <v-toolbar-title>Добавить сведения о привлеченных лицах</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="mt-4">
        <v-form lazy-validation>
          <v-row justify="start">
            <v-col md="5" xl="6" sm="12" xs="12">
              <v-text-field dense outlined label="Вид выполненных работ" v-model="form.work_type"></v-text-field>
            </v-col>
            <v-col md="5" xl="6" sm="12" xs="12">
              <v-autocomplete dense outlined label="Наименование юридического лица "
                              :items="allRefList"
                              v-model="contractor"
                              item-text="name"
                              item-value="id" return-object @change="setContractor"></v-autocomplete>
            </v-col>
            <v-col md="2" xl="2" sm="12" xs="12">
              <v-text-field dense outlined label="Размер вознаграждения" v-model.number="form.amount"
                            type="number"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start">
            <v-col md="6" xl="6" sm="12" xs="12">
              <v-textarea rows="2" dense outlined label="Номер, дата заключения и срок действия договора"
                          v-model="form.contract"></v-textarea>
            </v-col>
            <v-col md="6" xl="6" sm="12" xs="12">
              <v-textarea rows="2" dense outlined label="Дата судебного акта, на основании которого привлечено лицо"
                          v-model="form.judicial_act_date"></v-textarea>
            </v-col>
          </v-row>
          <!--          Дата судебного акта, на основании которого привлечено лицо-->
          <v-row justify="start">
            <v-col md="12" xl="12" sm="12" xs="12">
              <v-textarea rows="2" dense outlined
                          label="Сведения о наличии аккредитации лица при саморегулируемой организации"
                          v-model="form.sro"></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-row justify="center">
          <v-col cols="2">
            <v-btn small color="error" @click="close">Отмена</v-btn>
          </v-col>
          <v-col cols="2">
            <template v-if="form.id">
              <v-btn small color="success" @click="editInvolved">Сохранить</v-btn>
            </template>
            <template v-else>
              <v-btn small color="success" @click="createInvolved">Добавить</v-btn>
            </template>

          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script>

import {mapGetters} from 'vuex'
import {eventBus} from "@/bus";

export default {
  name: "InvolvedPersonModal",
  props: ['project'],
  data: () => ({
    dialog: false,
    contractor: null,
    form: {
      id: null,
      project: null,
      work_type: null,
      contract: null,
      legal_contractor: null,
      physical_contractor: null,
      amount: null,
      judicial_act_date: null,
      sro: "№ протокола 2/24 от 12.03.2025 Дата окончания срока аккредитации 05.02.2026",
    }
  }),
  computed: {
    ...mapGetters({
      allRefList: 'allRefData'
    })
  },
  methods: {
    editInvolved() {
      let formData = new FormData()
      Object.entries(this.form).forEach(([key, val]) => {
        if (val) {
          formData.append(key, val)
        }
      })
      this.$store.dispatch('editInvolvedPerson', {data: formData, id: this.form.id}).then(res => {
        this.$emit('updateInvolvedPerson')
        this.close()
      })
    },
    createInvolved() {
      let formData = new FormData()
      Object.entries(this.form).forEach(([key, val]) => {
        if (val) {
          formData.append(key, val)
        }
      })
      this.$store.dispatch('createInvolvedPerson', formData).then(res => {
        this.$emit('updateInvolvedPerson')
        this.close()
      })
    },
    close() {
      Object.assign(this.$data, this.$options.data())
      this.dialog = false
    },
    setContractor(item) {
      switch (item.type) {
        case "LegalEntity":
          this.form.legal_contractor = item['pk']
          this.form.physical_contractor = null
          break
        case "PhysicalPerson":
          this.project.physical_contractor = item['pk']
          this.form.legal_contractor = null
          break
        default:
          break
      }
    },
  },
  created() {
    this.$parent.$on("addInvolvedPerson", () => {
      this.form.project = this.project
      this.dialog = true
    })
    eventBus.$on("editInvolvedPerson", item => {
      Object.entries(item).forEach(([key, val]) => {
        if (val) {
          if (key === 'legal_contractor' || key === 'physical_contractor') {
            this.form[key] = val
            this.contractor = val
          } else {
            this.form[key] = val
          }
        }
      })
      this.dialog = true
    })
  }
}
</script>

<style scoped>

</style>