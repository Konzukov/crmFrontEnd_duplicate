<template>
  <v-container>
    <v-dialog
        fullscreen
        hide-overlay
        persistent
        transition="dialog-bottom-transition"
        scrollable
        v-model="drawer"
    >
          <v-overlay v-model="overlay">
      <v-progress-circular
          indeterminate
          size="64"
      ></v-progress-circular>
    </v-overlay>
      <v-card>
        <v-toolbar dark color="primary" max-height="60">
          <v-toolbar-title>{{ postForm['pk'] ? "Редактирование почты" : "Создать почту" }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="drawer = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-row justify="space-around" class="mr-0 ml-5 mt-3">
          <v-col sm="12" md="7" lg="7" xl="7">
            <v-form lazy-validation>
              <v-row justify="start" align="center">
                <v-col md="4">
                  <v-select
                      dense
                      outlined
                      label="Создал"
                      v-model="postForm['user']"
                      :items="systemUser"
                      item-value="uuid"
                      item-text="fullName"
                      return-object
                      disabled
                  >
                  </v-select>
                </v-col>
                <v-col md="4">
                  <v-text-field
                      outlined
                      dense
                      label="Дата создания"
                      disabled
                      v-model="postForm['entry_date']"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row justify="start" align="center">
                <v-col md="4" sm="6" lg="4" xl="4">
                  <v-select
                      label="Направление"
                      outlined
                      dense
                      :items="route"
                      item-text="text"
                      item-value="value"
                      v-model="postForm['route']"
                  ></v-select>
                </v-col>
                <v-col md="4" sm="6" lg="4" xl="4">
                  <v-text-field
                      label="Дата отправки"
                      outlined
                      dense
                      v-model="postForm['departure_date']"
                      type="datetime-local"
                  ></v-text-field>
                </v-col>
                <v-col md="4" sm="6" lg="4" xl="4">
                  <v-text-field
                      label="Дата получение"
                      outlined
                      dense
                      v-model="postForm['receiving_date']"
                      type="date"
                  ></v-text-field>
                </v-col>
              </v-row>
              <template v-if="postForm['route'] === 'OUT'">
                <v-row
                    justify="start"
                    align="center"
                    v-if="postForm['from_custom'] && !postForm['from_who']"
                >
                  <v-col md="4" sm="6">
                    <v-text-field
                        outlined
                        dense
                        label="Получатель(Произвольно)"
                        v-model="postForm['from_custom']"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row justify="start" align="center">
                  <v-col md="6" sm="12" lg="6" xl="6">
                    <v-combobox
                        outlined
                        dense
                        :search-input.sync="fromWhoSearch"
                        :items="fromWho"
                        label="Получатель"
                        item-value="uuid"
                        item-text="fullName"
                        v-model="postForm['from_who']"
                        return-object
                    >
                      <template v-slot:selection="data">
                        <v-chip
                            v-bind="data.attrs"
                            :input-value="data.selected"
                            close
                            @click="data.select"
                            @click:close="remove(data.item)"
                        >
                          {{ data.item.fullName }}
                        </v-chip>
                      </template>
                      <template v-slot:no-data>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title> Не найдено</v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>
                              <v-btn
                                  color="black"
                                  small
                                  @click="addNewItem(fromWhoSearch, 'physical')"
                              >
                                <v-icon color="white">mdi-plus</v-icon>
                              </v-btn>
                              <span
                              >Что бы добавить физ. лицо -
                              {{ fromWhoSearch }}</span
                              >
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>
                              <v-btn
                                  color="black"
                                  small
                                  @click="addNewItem(fromWhoSearch, 'legal')"
                              >
                                <v-icon color="white">mdi-plus</v-icon>
                              </v-btn>
                              <span
                              >Что бы добавить юр. лицо -
                              {{ fromWhoSearch }}</span
                              >
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </template>
                    </v-combobox>
                  </v-col>
                  <v-col md="6" sm="12" lg="6" xl="6">
                    <v-select
                        outlined
                        dense
                        :items="participatorList"
                        label="Отправитель"
                        item-value="pk"
                        item-text="participator.fullName"
                        v-model="postForm['to']"
                    ></v-select>
                  </v-col>
                  <v-col cols="auto">
                    <v-autocomplete label="Тип корреспонденции" outlined dense
                                    item-text="name"
                                    item-value="id"
                                    :items="correspondenceType"
                                    v-model="postForm['correspondence_type']"></v-autocomplete>
                  </v-col>
                </v-row>
              </template>
              <template v-else>
                <v-row
                    justify="start"
                    align="center"
                    v-if="postForm['from_custom'] && !postForm['from_who']"
                >
                  <v-col md="4" sm="6">
                    <v-text-field
                        outlined
                        dense
                        label="Оправитель(Произвольно)"
                        v-model="postForm['from_custom']"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row justify="start" align="center">
                  <v-col md="4" sm="12" lg="4" xl="4">
                    <v-combobox
                        outlined
                        :search-input.sync="fromWhoSearch"
                        :items="fromWho"
                        label="Оправитель"
                        item-value="uuid"
                        item-text="fullName"
                        v-model="postForm['from_who']"
                        return-object
                    >
                      <template v-slot:selection="data">
                        <v-chip
                            v-bind="data.attrs"
                            :input-value="data.selected"
                            close
                            @click="data.select"
                            @click:close="remove(data.item)"
                        >
                          {{ data.item.fullName }}
                        </v-chip>
                      </template>
                      <template v-slot:no-data>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title> Не найдено</v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>
                              <v-btn
                                  color="black"
                                  small
                                  @click="addNewItem(fromWhoSearch, 'physical')"
                              >
                                <v-icon color="white">mdi-plus</v-icon>
                              </v-btn>
                              <span
                              >Что бы добавить физ. лицо -
                              {{ fromWhoSearch }}</span
                              >
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>
                              <v-btn
                                  color="black"
                                  small
                                  @click="addNewItem(fromWhoSearch, 'legal')"
                              >
                                <v-icon color="white">mdi-plus</v-icon>
                              </v-btn>
                              <span
                              >Что бы добавить юр. лицо -
                              {{ fromWhoSearch }}</span
                              >
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </template>
                    </v-combobox>
                  </v-col>
                  <v-col md="4" sm="12" lg="4" xl="4">
                    <v-select
                        outlined
                        :items="participatorList"
                        label="Получатель"
                        item-value="pk"
                        item-text="participator.fullName"
                        v-model="postForm['to']"
                    ></v-select>
                  </v-col>
                  <v-col md="4" sm="12" lg="4" xl="4">
                    <v-autocomplete label="Тип корреспонденции" outlined
                                    item-text="name"
                                    item-value="id"
                                    :items="correspondenceType"
                                    v-model="postForm['correspondence_type']"></v-autocomplete>
                  </v-col>
                </v-row>
              </template>
              <v-row justify="start">
                <v-col cols="auto">
                  <v-text-field outlined label="РПО" dense v-model="postForm['rpo']" :disabled="action ==='edit'">
                    <template v-slot:append-outer v-if="action==='create'">
                      <v-btn icon @click="getPostTracingData">
                        <v-icon>mdi-sync</v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col cols="auto">
                  <v-text-field outlined label="Код пакета" dense v-model="postForm['package_code']"
                                :disabled="action ==='edit'"></v-text-field>
                </v-col>
                <v-col cols="auto">
                  <v-text-field outlined dense type="number" label="Цена" :disabled="action ==='edit'"
                                v-model.number="postForm['price']"></v-text-field>
                </v-col>
              </v-row>
              <v-row justify="start" align="center">
                <v-col md="5" sm="5">
                  <v-autocomplete
                      outlined
                      dense
                      label="Проект"
                      :items="projectList"
                      return-object
                      v-model="postForm['project']"
                      item-value="pk"
                      item-text="name"
                      chips
                      multiple
                      append-outer-icon="mdi-plus"
                      @click:append-outer="addNewProject"
                  ></v-autocomplete>
                </v-col>
                <v-col md="5" sm="5">
                  <AddTag
                      ref="tagsList"
                      :existTags.sync="postForm['tags']"
                  ></AddTag>
                </v-col>
              </v-row>
              <v-row justify="center">
                <v-col>
                  <v-textarea
                      v-model="postForm['description']"
                      outlined
                      label="Описание"
                  >
                  </v-textarea>
                </v-col>
              </v-row>
              <v-row justify="center">
                <v-col>
                  <el-button type="danger" @click="close">Отмена</el-button>
                </v-col>
                <v-col>
                  <el-button type="primary" @click="createNewTask">
                    Создать задачу
                  </el-button>
                </v-col>
                <v-col>
                  <el-button type="success" @click="save" :loading="saving">
                    {{ saving ? "Сохранение ..." : "Сохранить" }}
                  </el-button>
                </v-col>
              </v-row>
            </v-form>
          </v-col>
          <v-col sm="12" md="5" lg="5" xl="5">
            <h2>Вложения</h2>
            <v-list>
              <v-list-item v-for="(document, index) in postForm['post_documents']" :key="index">
                <v-list-item-content>
                  <v-list-item-title v-text="document.fileName"></v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-row>
                    <v-btn icon @click.prevent="downloadDoc(document)">
                      <v-icon color="success lighten-1">mdi-download</v-icon>
                    </v-btn>
                    <v-btn icon @click.prevent="editItem(document)">
                      <v-icon color="primary lighten-1">mdi-pencil</v-icon>
                    </v-btn>
                  </v-row>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <v-btn @click="addDocument" :disabled="!postForm['pk']">Добавить документ</v-btn>
          </v-col>
        </v-row>
      </v-card>
      <v-snackbar absolute v-model="snackbar.show" left top>
        {{ snackbar.text }}
      </v-snackbar>
    </v-dialog>
    <ProjectCreateModal></ProjectCreateModal>
    <editDocument></editDocument>
    <TaskCreate></TaskCreate>
    <createDocument></createDocument>
  </v-container>
</template>

<script>
import {mapGetters, mapActions} from "vuex";
import moment from "moment";
import AddTag from "@/components/Tagging/AddTag";
import {isEmpty} from "lodash";
// import FileUploader from "@/components/FileManager/FileUploaderForm";
// import FileList from "@/components/FileManager/FileList";
import TaskCreate from "@/components/CRM/Task/modal/TaskCreate";
import editDocument from "@/components/CRM/PaperFlow/modal/editDocument";
import createDocument from "@/components/CRM/PaperFlow/modal/createDocument";
import customConst from "@/const/customConst";
import ProjectCreateModal from "@/components/referenceBook/Project/modal/ProjectCreateModal";


// import {eventBus} from "@/bus";

export default {
  name: "PostEdit",
  data() {
    return {
      drawer: false,
      action: 'edit',
      overlay: false,
      route: [
        {value: "IN", text: "Входящее"},
        {value: "OUT", text: "Исходящее"},
      ],
      postForm: {
        rpo: '',
        departure_date: '',
        receiving_date: '',
        from_custom: '',
        from_who: '',
        correspondence_type: '',
        route: '',
        package_code: '',
        price: '',
        project: '',
        description: '',
        tags: '',

      },
      fromWhoSearch: "",
      saving: false,
      loading: true,
      snackbar: {
        show: false,
        text: ''
      }
    }
  },
  computed: {
    ...mapGetters({
      postDetail: "postDetailData",
      systemUser: "allSystemUsersData",
      participatorList: "participatorList",
      fromWho: "allRefData",
      projectList: "projectListData",
      correspondenceType: 'correspondenceTypeData'
    }),
  },
  methods: {
    ...mapActions([
      "getPostDetail",
      "allSystemUser",
      "getParticipator",
      "getLegalEntity",
      "getPhysicalPerson",
      "getProjectList",
      "editPost",
      "createPost",
      "getCorrespondenceType"
    ]),
    getPostTracingData() {
      this.$http({
        method: 'POST',
        url: customConst.PAPERFLOW_API + 'get-post-tracing-data',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          'post_rpo': this.postForm['rpo']
        },
      }).then(res => {
        this.postForm.departure_date = moment(res.data.data['departure_date']).format('YYYY-MM-DDTHH:mm')
        this.postForm.receiving_date = moment(res.data.data['receiving_date']).format('YYYY-MM-DD')
        this.postForm.from_custom = res.data.data['to']
        this.postForm.route = this.route[1].value
        console.log(res.data)
      })
    },
    handleClose(done) {
      this.$confirm("Закрыть окно?")
          .then((_) => {
            done();
          })
          .catch((_) => {
          });
    },
    close() {
      this.$confirm("Закрыть окно?")
          .then((_) => {
            this.drawer = false;
            Object.assign(this.$data, this.$options.data());
          })
          .catch((_) => {
          });
    },
    addNewProject() {
      this.$emit("newProject");
    },
    remove(item) {
      this.postForm["from_who"] = "";
    },
    addNewItem(item) {
      console.log(item);
    },
    async save() {
      this.saving = true;
      let tagsList;
      if (this.$refs.tagsList) {
        tagsList = this.$refs.tagsList.selected;
      }
      let formData = new FormData();
      Object.keys(this.postForm).forEach((key) => {
        if (typeof this.postForm[key] === "object") {
          if (!isEmpty(this.postForm[key])) {
            if (
                Object.prototype.toString.call(this.postForm[key]) ===
                "[object Array]"
            ) {
              this.postForm[key].forEach((obj) => {
                formData.append(key, obj["pk"]);
              });
            } else {
              if (key === "from_who") {
                if (this.postForm[key]["type"] === "LegalEntity")
                  formData.append("from_legal", this.postForm[key].pk);
                else {
                  formData.append("from_physical", this.postForm[key].pk);
                }
              } else {
                formData.set(key, this.postForm[key].pk);
              }
            }
          }
        } else {
          formData.set(key, this.postForm[key]);
        }
      });
      formData.delete('tags')
      if (tagsList) {
        tagsList.forEach((obj) => {
          if (obj) {
            console.log(obj)
            formData.append("tags", obj.pk.toString());
          }
          this.$emit("resetTagForm");
        });
      }
      if (this.action === 'edit') {
        await this.editPost({formData, pk: this.postForm["pk"]}).then(() => {
          this.snackbar.text = "Успешно";
        }).finally(() => {
          this.saving = false;
          setTimeout(() => {
            this.snackbar.show = false
          }, 1500)
        });
      } else {
        for (let pair of formData.entries()) {
          console.log(pair[0] + ', ' + pair[1]);
        }
        await this.createPost(formData).then((data) => {
          this.loadPostData(data.pk)
          this.action = 'edit'
          this.snackbar.text = "Успешно";
        }).finally(() => {
          this.saving = false;
          setTimeout(() => {
            this.snackbar.show = false
          }, 1500)
        });
      }

    },
    addDocument() {
      this.$emit("newPostDocument", {postPk: this.postForm["pk"], project: this.postForm['project']});
      // this.snackbar.show = true;
      // this.snackbar.text = "Сохранение изменений";
      // new Promise(async (resolve) => {
      //   await this.save();
      //   resolve();
      // }).then(() => {
      //   this.$emit("newPostDocument", this.postForm["pk"]);
      // });
    },
    createNewTask() {
      this.snackbar.show = true;
      this.snackbar.text = "Сохранение изменений";
      new Promise(async (resolve) => {
        await this.save();
        resolve();
      }).then(() => {
        this.$emit('createTask', {'event': null, 'post': this.postDetail, type: 'create'})
      });

    },
    downloadDoc(doc) {
      this.$store.dispatch('downloadDocument', {'pk': doc.pk, 'fileName': doc.file})
    },
    editItem(doc) {
      this.$emit('editDoc', doc.pk)
    },
    loadPostData(pk) {
      this.getPostDetail(pk).then(() => {
        this.postForm = Object.assign({}, this.postDetail);
        this.postForm["departure_date"] = moment(
            this.postForm["departure_date"]
        ).format("YYYY-MM-DDThh:mm");
        this.loading = false;
        this.overlay = false;
      });
    }
  },
  created() {
    this.overlay = true
    this.allSystemUser()
    this.getProjectList()
    this.getParticipator()
    this.getLegalEntity()
    this.getPhysicalPerson()
    this.getCorrespondenceType();
    this.$parent.$on("editPost", (pk) => {
      this.drawer = true;
      this.overlay = true
      this.action = 'edit'
      this.loadPostData(pk)
    });
    this.$parent.$on('createSingleOutPost', () => {
      this.action = 'create'
      this.postForm.route = this.route[1].value
      this.postForm['to'] = this.participatorList[0]
      this.drawer = true;
    })
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "addTrashFile") {
        this.postForm["files"] = this.postForm["files"].filter((file) => {
          if (file["pk"] !== mutation.payload["file"]["pk"]) {
            return file;
          }
        });
        console.log("mutation.payload", mutation.payload);
      }
    });
    this.overlay = false
  },
  components: {
    ProjectCreateModal,
    AddTag,
    createDocument,
    // FileList,
    TaskCreate,
    editDocument
  },
};
</script>

<style scoped>
.row + .row {
  margin-top: 1px;
}

>>> .v-dialog {
  background-color: white !important;
}

>>> .v-chip.v-size--default {
  font-size: 13px;
  height: 25px;
}

>>> label.el-form-item__label {
  padding-bottom: 0;
}

>>> .v-input {
  font-size: 14px !important;
}
</style>