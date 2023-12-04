<template>
  <v-expansion-panel>
    <v-expansion-panel-header expand-icon="mdi-menu-down">
      <v-row justify="start" align="center">
        <v-col>
          <v-icon small class="pr-2">mdi-file</v-icon>
          {{ file.name }}
          <template>
            <v-icon :class="[fileUpload.status.uploaded ? 'uploaded' : 'inactive', 'mr-1']">mdi-check-circle-outline
            </v-icon>
            <template>
              <v-icon :class="[fileUpload.status.error ? 'upload-error' : 'inactive']"
                      v-if="!fileUpload.status.error"
              >mdi-alert-circle-outline
              </v-icon>
              <v-tooltip top v-else>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon :class="[fileUpload.status.error ? 'upload-error' : 'inactive']"
                          v-bind="attrs"
                          v-on="on">mdi-alert-circle-outline
                  </v-icon>
                </template>
                <span>{{ fileUpload.status.errorMessage }}</span>
              </v-tooltip>
            </template>
            <v-btn :loading="fileUpload.status.uploading && !fileUpload.status.uploaded" plain icon
                   :class="[fileUpload.status.message ? 'upload-info' : 'inactive']"
            >
              <template v-slot:loader>
                <v-progress-circular
                    :rotate="-90"
                    :size="85"
                    :width="10"
                    :value="fileUpload.progress"
                    color="primary"
                >
                  {{ fileUpload.progress }}
                </v-progress-circular>
              </template>
              <v-tooltip
                  top
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                      icon
                      v-bind="attrs"
                      v-on="on"
                  >
                    <v-icon :class="[fileUpload.status.message ? 'upload-info' : 'inactive']"> mdi-information-outline
                    </v-icon>
                  </v-btn>
                </template>
                <span>{{ fileUpload.status.message }}</span>
              </v-tooltip>

            </v-btn>
          </template>
        </v-col>
      </v-row>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <v-form>
        <v-row justify="start" align="center">
          <v-col md="4" sm="6" xl="4" lg="4">
            <v-text-field
                label="Дата создания"
                outlined
                type="datetime-local" v-model="fileForm['create_date']">
            </v-text-field>
          </v-col>
          <v-col md="4" sm="6" xl="4" lg="4">
            <v-select disabled
                      outlined
                      label="Пользователь"
                      v-model="fileForm['user']"
                      :items="systemUser"
                      item-value="uuid"
                      item-text="fullName"
                      return-object
            >
            </v-select>
          </v-col>
          <v-col md="4" sm="12" xl="4" lg="4">
            <v-text-field disabled outlined label="РПО" v-if="post" v-model="fileForm['post']['rpo']">

            </v-text-field>
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col md="10" sm="12" xl="10" lg="10">
            <v-textarea
                label="Описание файла"
                outlined
                v-model="fileForm['description']"
            >
            </v-textarea>
          </v-col>
        </v-row>
        <v-row justify="center">

          <v-btn class="mr-3" color="error" @click="removeFile()">Удалить</v-btn>
          <v-btn class="ml-3" color="success" @click="save()"
                 :disabled="fileUpload.status.uploaded || fileUpload.status.error">Сохранить
          </v-btn>
        </v-row>
      </v-form>
    </v-expansion-panel-content>
  </v-expansion-panel>

</template>

<script>
import moment from "moment";
import {mapGetters, mapActions} from 'vuex'
import {eventBus} from "@/bus";
// import {isEmpty} from 'lodash'

export default {
  props: {
    file: {
      type: File,
      require: true
    },
    post: {
      type: Object,
      require: false,
      default: null
    }
  },
  name: "FileUploaderForm",
  data() {
    return {
      fileForm: {
        file: '',
        create_date: '',
        user: {},
        description: '',
        post: null
      },
      fileUpload: {
        file: {
          name: ''
        },
        status: {
          uploading: false,
          uploaded: false,
          error: false,
          errorMessage: '',
          message: null
        },
        process: null
      }
    }
  },
  methods: {
    ...mapActions(['createFile']),
    save() {
      let formData = new FormData()
      Object.keys(this.fileForm).forEach(key => {
        if (this.fileForm[key]) {
          if (Object.prototype.toString.call(this.fileForm[key]) === '[object Object]') {
            formData.append(key, this.fileForm[key]['pk'])
          } else {
            formData.append(key, this.fileForm[key])
          }
        }
      })
      // for (let pair of formData.entries()) {
      //   console.log(pair[0] + ', ' + pair[1]);
      // }
      this.createFile({formData: formData, file: this.file}).then(() => {
        this.$emit('fileSaved', this.file)
      })
    },
    removeFile() {
      this.$emit('removeFile', this.file)
    }
  },
  computed: {
    ...mapGetters({
      postDetail: 'postDetailData',
      systemUser: 'allSystemUsersData',
      participatorList: 'participatorList',
      fromWho: 'allRefData',
      projectList: 'projectListData',
      authUserData: 'authUserData'
    }),
  },
  created() {
    eventBus.$on('saveAllFile', () => {
      if (!this.fileUpload.status.uploaded) {
        this.save()
      }
    })
    this.fileForm['post'] = this.post
    this.systemUser.forEach(user => {
      if (user['uuid'] === this.authUserData['uuid']) {
        this.fileForm['user'] = user
      }
    })
    this.fileForm['create_date'] = moment(new Date()).format('YYYY-MM-DDTHH:mm')
    this.fileForm['file'] = this.file
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'uploadProgress') {
        if (this.file['name'] === mutation.payload['file']) {
          this.fileUpload = Object.assign({}, mutation.payload)
        }
      }
    })
  },
  beforeDestroy() {
    this.unsubscribe()
  },
}
</script>

<style scoped>
>>> .v-expansion-panel-header {
  padding: 5px 20px;
}

.uploaded {
  color: #30b21d;
}

.upload-error {
  color: #800403;
}

.upload-info {
  color: #0D47A1 !important;
}

.inactive {
  opacity: 0.3;
}
</style>