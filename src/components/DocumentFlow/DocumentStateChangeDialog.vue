<template>
  <v-dialog v-model="dialog" max-width="500" persistent>
    <v-card>
      <v-card-title class="primary white--text">
        Изменить состояние документа
        <v-spacer></v-spacer>
        <v-btn icon color="white" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-form ref="form" v-model="valid">
          <v-select
            v-model="stateId"
            :items="workflowStates"
            item-text="name"
            item-value="id"
            label="Новое состояние *"
            :rules="[v => !!v || 'Выберите состояние']"
            outlined
            dense
          >
            <template v-slot:item="{ item }">
              <v-chip small :color="item.color" dark class="mr-2">
                {{ item.name }}
              </v-chip>
            </template>
            <template v-slot:selection="{ item }">
              <v-chip small :color="item.color" dark>
                {{ item.name }}
              </v-chip>
            </template>
          </v-select>

          <v-textarea
            v-model="comment"
            label="Комментарий"
            outlined
            dense
            rows="3"
          ></v-textarea>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close">Отмена</v-btn>
        <v-btn color="primary" @click="save" :loading="loading" :disabled="!valid">
          Подтвердить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'DocumentStateChangeDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    document: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      stateId: null,
      comment: '',
      valid: false,
      loading: false
    }
  },
  computed: {
    ...mapGetters('documentFlow', ['getWorkflowStates']),
    dialog: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    },
    workflowStates() {
      return this.getWorkflowStates || []
    }
  },
  watch: {
    dialog(val) {
      if (val && this.document) {
        this.stateId = this.document.current_state ? this.document.current_state.id : null
        this.comment = ''
      }
    }
  },
  methods: {
    ...mapActions('documentFlow', ['changeDocumentState']),
    async save() {
      if (this.$refs.form.validate()) {
        this.loading = true
        try {
          await this.changeDocumentState({
            documentId: this.document.id,
            stateId: this.stateId,
            comment: this.comment
          })
          this.$store.commit('snackbar/showSnackbar', {
            message: 'Состояние документа изменено',
            color: 'success'
          })
          this.$emit('state-changed')
          this.close()
        } catch (error) {
          console.error('Error changing state:', error)
          this.$store.commit('snackbar/showSnackbar', {
            message: 'Ошибка при изменении состояния',
            color: 'error'
          })
        } finally {
          this.loading = false
        }
      }
    },
    close() {
      this.$refs.form.reset()
      this.dialog = false
    }
  }
}
</script>
