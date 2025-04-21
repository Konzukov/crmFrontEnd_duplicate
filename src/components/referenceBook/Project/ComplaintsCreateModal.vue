<template>
  <v-dialog v-model="dialog" width="60vw">
    <v-card height="62vh">
      <v-toolbar dense>
        <v-toolbar-title>Добавить информацию о жалобах на действия (бездействие)</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon small @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="mt-4">
        <v-form lazy-validation>
          <v-row justify="start">
            <v-col md="4" xl="4" sm="12" xs="12">
              <v-autocomplete dense outlined label="Сведения о заявителе жалобы"
                              :items="allRefList" item-value="id" item-text="fullName"
                              return-object @change="setComplaint"
                              v-model="complainant"></v-autocomplete>
            </v-col>
            <v-col md="4" xl="4" sm="12" xs="12">
              <v-autocomplete dense outlined label="Орган принявший решение"
                              :items="legalEntity" item-value="pk" item-text="fullName"
                              v-model="form.decision_maker"></v-autocomplete>
            </v-col>
            <v-col md="2" xl="2" sm="12" xs="12">
              <DatePicker v-model="form.complaint_date" value-type="format" format="DD.MM.YYYY"
                          placeholder="Дата поступления жалобы"
                          :clearable="false"></DatePicker>
            </v-col>
          </v-row>
          <v-row justify="center">
            <v-col cols="12">
              <v-textarea dense outlined label="Суть жалобы" rows="2" v-model="form.complaint_essence"></v-textarea>
            </v-col>
          </v-row>
          <v-row justify="center">
            <v-col cols="7">
              <v-textarea dense outlined label="Дата документа по итогам рассмотрения жалобы" rows="2"
                          v-model="form.act_date"></v-textarea>
            </v-col>
            <v-col cols="5">
              <v-textarea dense outlined label="Сведения о пересмотре" rows="2"
                          v-model="form.revision"></v-textarea>
            </v-col>
          </v-row>
          <v-row justify="center">
            <v-col cols="12">
              <v-textarea dense outlined label="Принятое решение" rows="2"
                          v-model="form.accepted_decision"></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn color="error" @click="close">Отмена</v-btn>
        <v-btn v-if="form.id" color="success" @click="edit">Сохранить</v-btn>
        <v-btn v-else color="success" @click="save">Сохранить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {eventBus} from "@/bus";
import {mapGetters} from "vuex";
import moment from "moment";

export default {
  props: ['project'],
  name: "ComplaintsCreateModal",
  data: () => ({
    dialog: false,
    complainant: null,
    form: {
      id: null,
      project: null,
      legal_complainant: null,
      physical_complainant: null,
      complaint_date: null,
      act_date: null,
      decision_maker: null,
      complaint_essence: null,
      revision: null,
      accepted_decision: null,
    }
  }),
  computed: {
    ...mapGetters({
      allRefList: 'allRefData',
      legalEntity: 'legalEntityData'
    })
  },
  methods: {
    getFormData() {
      let formData = new FormData()
      Object.entries(this.form).forEach(([key, val]) => {
        if (val) {
          if (key === 'complaint_date') {
            if (val !== "Invalid date") {
              formData.append(key, moment(val, 'DD.MM.YYYY').format('YYYY-MM-DD'))
            }
          } else {
            formData.append(key, val)
          }
        }
      })
      return formData
    },
    save() {
      let formData = this.getFormData()
      this.$store.dispatch('createComplaint', formData).then(res => {
        this.$emit('updateComplaint')
        this.close()
      })
    },
    edit() {
      let formData = this.getFormData()
      this.$store.dispatch('editComplaint', {data: formData, id: this.form.id}).then(res => {
        this.$emit('updateComplaint')
        this.close()
      })
    },
    close() {
      this.dialog = false
      Object.assign(this.$data, this.$options.data())
    },
    setComplaint(item) {
      switch (item.type) {
        case "LegalEntity":
          this.form.legal_complainant = item['pk']
          this.form.physical_complainant = null
          break
        case "PhysicalPerson":
          this.form.physical_complainant = item['pk']
          this.form.legal_complainant = null
          break
        default:
          break
      }
    }
  },
  created() {
    if (this.allRefList.length === 0) {
      this.$store.dispatch('getLegalEntity')
      this.$store.dispatch('getPhysicalPerson')
    }
    eventBus.$on('addComplaints', (project) => {
      this.form.project = project
      this.dialog = true
    })
    eventBus.$on('editComplaints', item => {
      Object.entries(item).forEach(([key, val]) => {
        if (val) {
          if (key === 'legal_complainant' || key === 'physical_complainant') {
            this.form[key] = val
            this.complainant = val
          } else if (key === 'complaint_date') {
            this.form[key] = moment(item[key]).format('DD.MM.YYYY')
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
>>> .v-card__text {
  height: 75%;
  overflow-y: auto;
}
</style>