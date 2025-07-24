<template>
    <div>
        <v-dialog v-model="dialog" :width="width">
            <v-card>
                <v-container fluid>
                    <v-row justify="center">
                        <v-card-title class="">Новое событие</v-card-title>
                    </v-row>
                    <v-snackbar
                            v-model="snackbar.display"
                            :color="snackbar.color"
                            :timeout="snackbar.timeout"
                            right
                            top
                    >
                        {{ snackbar.text }}
                    </v-snackbar>
                    <v-row justify="start">
                        <v-col md="7" sm="12">
                            <v-card-text>
                                <v-row justify="start"></v-row>
                                <v-form ref="newEvent" lazy-validation v-model="valid">
                                    <v-row justify="start">
                                        <v-col md="3" sm="12">
                                            <v-text-field
                                                    outlined
                                                    v-model="formData.date"
                                                    type="datetime-local"
                                            ></v-text-field>
                                        </v-col>
                                        <v-spacer></v-spacer>
                                        <v-col md="8" sm="12">
                                            <v-text-field
                                                    outlined
                                                    label="Название *"
                                                    :rules="rules"
                                                    v-model="formData.name"
                                            >
                                            </v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row justify="start" class="mr-5">
                                        <v-col md="5" sm="5">
                                            <v-autocomplete
                                                    outlined
                                                    label="Проект"
                                                    :items="projectList"
                                                    v-model="formData.project"
                                                    append-outer-icon="mdi-plus"
                                                    @click:append-outer="addNewProject"
                                                    item-text="name"
                                                    clearable
                                                    multiple
                                                    chips
                                                    return-object
                                            ></v-autocomplete>
                                        </v-col>
                                        <v-col md="7" sm="12">
                                            <v-textarea
                                                    outlined
                                                    label="Описание"
                                                    :rules="rules"
                                                    :rows="2"
                                                    v-model="formData.description"
                                            ></v-textarea>
                                        </v-col>
                                    </v-row>
                                    <v-row justify="start" class="mr-5">
                                        <v-col md="6" sm="12">
                                            <v-select
                                                    outlined
                                                    label="Категория события *"
                                                    :items="eventCategory"
                                                    v-model="formData.category"
                                                    clearable
                                                    :rules="rules"
                                                    item-value="pk"
                                                    item-text="name"
                                                    return-object
                                                    @change="categoryType"
                                            ></v-select>
                                        </v-col>
                                        <v-col md="6" sm="12">

                                        </v-col>
                                    </v-row>
                                    <template v-if="formData.category">
                                        <v-card flat transition="slide-x-transition">
                                            <v-card-title>
                                                <v-row justify="center">
                                                    <h5>Детализация события</h5>
                                                </v-row>
                                                <v-card-text>
                                                    <template v-if="formData.category.name === 'Деньги'">
                                                        <CreateMoneyEvent
                                                                @savedEventData="saveAdditionalEvent"
                                                                :currentEvent="additionalEvent">
                                                        </CreateMoneyEvent>
                                                    </template>
                                                    <template
                                                            v-else-if="formData.category.name === 'Направленное событие'">
                                                        <CreateDirectedEvent
                                                                @savedEventData="saveAdditionalEvent"
                                                                :currentEvent="additionalEvent">
                                                        </CreateDirectedEvent>
                                                    </template>
                                                    <template v-else-if="formData.category.name === 'Мероприятие'">
                                                        <CreateMeasureEvent
                                                                @savedEventData="saveAdditionalEvent"
                                                                :currentEvent="additionalEvent">
                                                        </CreateMeasureEvent>
                                                    </template>
                                                </v-card-text>
                                            </v-card-title>
                                        </v-card>
                                    </template>
                                </v-form>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn color="error" @click="close">Закрыть</v-btn>
                                <v-spacer></v-spacer>
                                <v-btn color="success" :disabled="!valid || disabled" @click="validate">
                                    Сохранить
                                </v-btn>

                            </v-card-actions>
                        </v-col>
                        <v-col md="5" sm="12">
                            <v-row justify="center">
                                <span class="headline">Документы</span>
                            </v-row>
                            <v-row justify="center">
                                <v-col md="10">
                                    <v-list>
                                        <template v-for="(item, index) in document">
                                            <v-list-item :key="item.fileName">
                                                <v-list-item-content>
                                                    <v-list-item-title v-html="item.fileName"></v-list-item-title>
                                                </v-list-item-content>
                                                <v-list-item-action>
                                                    <v-row>
                                                        <v-btn icon @click="downloadDoc(item)">
                                                            <v-icon color="success lighten-1">mdi-download</v-icon>
                                                        </v-btn>
                                                        <v-btn icon @click="editItem(item)">
                                                            <v-icon color="primary lighten-1">mdi-eye</v-icon>
                                                        </v-btn>
                                                        <v-btn icon @click="deleteItem(item)">
                                                            <v-icon color="error darken-1">mdi-delete</v-icon>
                                                        </v-btn>
                                                    </v-row>
                                                </v-list-item-action>
                                            </v-list-item>
                                            <v-divider :key="index"></v-divider>
                                        </template>
                                    </v-list>
                                </v-col>
                            </v-row>
                            <v-row justify="center" class="mt-5">
                                <v-btn @click="addEventDoc" :disabled="snackbar.display" fab dark large color="success">
                                    <v-icon>mdi-text-box-plus</v-icon>
                                </v-btn>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
        </v-dialog>
        <createDocument @allDocSaved="close"></createDocument>
        <ProjectCreate></ProjectCreate>
        <editDocument></editDocument>
        <deleteDocument @docAddedToTrash="updateDocList"></deleteDocument>
    </div>
</template>

<script>
    import moment from 'moment'
    import filter from '../../../../mixin/filter'
    import {eventBus} from '../../../../bus'
    import ProjectCreate from "../../../referenceBook/Project/ProjectCreate";
    import _ from 'lodash'
    import editDocument from "../../../CRM/PaperFlow/modal/editDocument";
    import deleteDocument from "../../../CRM/PaperFlow/modal/deleteDocument";
    import createDocument from "../../../CRM/PaperFlow/modal/createDocument";
    import CreateMeasureEvent from "../../Event/modal/CreateMeasureEvent";
    import CreateMoneyEvent from "../../Event/modal/CreateMoneyEvent";
    import CreateDirectedEvent from "../../Event/modal/CreateDirectedEvent";


    export default {
        name: "EventCreate",
        data() {
            return {
                additionalEvent: '',
                width: window.innerWidth,
                document: [],
                snackbar: {
                    display: false,
                    color: '',
                    text: ''
                },
                docAdding: false,
                dialog: false,
                valid: true,
                actionType: '',
                disabled: false,
                eventData: {},
                selectedCategory: '',
                selectedContractor: '',
                newEventCategory: {
                    display: false,
                    name: ''
                },
                formData: {
                    pk: '',
                    name: '',
                    date: moment(new Date()).locale('ru').format('yyyy-MM-DThh:mm'),
                    category: '',
                    description: '',
                    route: true,
                    project: [],
                    task: [],
                },
                sourceRules: [
                    i => !!this.formData.source || !!this.formData.custom_source || 'Поле обязательно',
                ],
                rules: [
                    v => !!v || 'Поле обязательно',
                ],
            }
        },
        methods: {
            close() {
                Object.keys(this.formData).forEach(key => {
                    if (key === 'data') {
                        this.formData[key] = new Date()
                    } else if (key === 'task') {
                        this.formData[key] = []
                    } else if (key === 'route') {
                        this.formData[key] = true
                    } else if (key === 'project') {
                        this.formData[key] = []
                    } else {
                        this.formData[key] = ''
                    }
                })
                this.docAdding = false
                this.document = '';
                this.dialog = false
                this.additionalEvent = ''
                eventBus.$emit('resetAdditionalForm')

            },
            validate() {
                if (this.$refs.newEvent.validate()) {
                    this.newEventSave()
                }
            },
            newEventSave() {
                if (this.formData.category.name === 'Деньги') {
                    eventBus.$emit('saveMoneyEvent')
                } else if (this.formData.category.name === 'Направленное событие') {
                    eventBus.$emit('saveDirectedEvent')
                } else if (this.formData.category.name === 'Мероприятие') {
                    eventBus.$emit('saveMeasureEvent')
                }
            },
            saveProccessing(formData) {
                if (this.actionType === 'create') {
                    // Событие еще не создано pk = ''
                    if (!this.formData.pk) {
                        this.snackbar.text = `Создание события.... Ожидайте`
                        this.snackbar.color = 'primary'
                        this.snackbar.display = true
                        this.disabled = true
                        this.$store.dispatch('createEvent', formData).then((data) => {
                            new Promise(async (resolve) => {
                                this.formData.pk = data['pk']
                                this.eventData = Object.assign({}, data)
                                this.snackbar.text = `Событие ${data['name']} успешно создано`
                                this.snackbar.color = 'success'
                                await setTimeout(() => {
                                    this.snackbar.display = false
                                    this.disabled = false
                                    resolve()
                                }, 1500)
                            }).then(() => {
                                if (!this.snackbar.display) {
                                    if (!this.docAdding) {
                                        this.$emit('taskEventSaved')
                                        this.close()
                                    } else {
                                        if (this.docAdding) {
                                            this.$emit('newEventDocument', this.eventData)
                                            this.docAdding = false
                                        }
                                    }
                                }
                            })
                        }).catch((err) => {
                            this.disabled = false
                        })
                    } else {
                        this.$store.dispatch('getEventDetail', this.formData.pk).then(() => {
                            this.eventData = this.$store.getters.eventDetailData
                            if (!this.docAdding) {
                                this.close()
                            } else {
                                if (this.docAdding) {
                                    this.$emit('newEventDocument', this.eventData)
                                    this.docAdding = false
                                }
                            }
                        }).catch((err) => {
                            this.disabled = false
                        })
                    }
                }
            },
            saveAdditionalEvent({type, data}, addDoc = false, addTask = false) {
                let newEventData = new FormData();
                Object.keys(this.formData).forEach(key => {
                    if (typeof this.formData[key] === 'object' && this.formData[key]) {
                        if (key === 'task') {
                            if (this.formData[key]) {
                                this.formData.task.forEach(obj => {
                                    newEventData.append(key, obj['pk'])
                                })
                            } else {
                                newEventData.append(key, '')
                            }
                        } else if (key === 'project') {
                            if (this.formData.project.length > 0) {
                                this.formData.project.forEach(obj => {
                                    newEventData.append(key, obj['pk'].toString())
                                })
                            }
                        } else if (key === 'date') {
                            newEventData.set(key, moment(this.formData[key]).format('YYYY-MM-DD HH:mm:ss'))
                        } else {
                            newEventData.set(key, this.formData[key]['pk'])
                        }
                    } else {
                        newEventData.set(key, this.formData[key])
                    }
                })
                if (type && data) {
                    newEventData.set(type, data['pk'])
                }
                this.saveProccessing(newEventData)
            },
            setCategory(curEvent) {
                if (this.eventCategory) {
                    this.eventCategory.forEach(obj => {
                        if (obj['name'] === curEvent) {
                            this.formData.category = obj['pk']
                        }
                    })
                }
            },
            addEventCategory() {
                let formData = new FormData()
                formData.append('name', this.newEventCategory.name)
                this.$store.dispatch('createEventCategory', formData).then(() => {
                    this.newEventCategory.display = false
                })

            },
            addNewProject() {
                this.$emit('newProject')
            },
            addEventDoc() {
                if (this.$refs.newEvent.validate()) {
                    this.docAdding = true
                    this.newEventSave()
                }
            },
            downloadDoc(doc) {
                this.$store.dispatch('downloadDocument', {'pk': doc.pk, 'fileName': doc.fileName})
            },
            deleteItem(doc) {
                this.$emit('delDoc', doc)
            },
            editItem(doc) {
                this.$emit('editDoc', doc)
            },
            createTask() {
                if (this.$refs.newEvent.validate()) {
                    this.taskAdding = true
                    this.newEventSave()
                }
            },
            updateDocList(doc) {
                this.document = this.document.filter(obj => {
                    if (obj['pk'] !== doc) {
                        return obj
                    }
                })
            },
            categoryType() {
                this.$emit('changeCategoryType')
            },
        },
        computed: {
            authUser() {
                return new Array(this.$store.getters.authUserData)
            },
            eventCategory: {
                get() {
                    if (this.$store.getters.eventCategoryListData) {
                        return this.$store.getters.eventCategoryListData
                    } else {
                        return new Array()
                    }
                }
            },
            projectList: {
                get() {
                    if (this.$store.getters.projectListData) {
                        let projectList = this.$store.getters.projectListData
                        if (this.formData.participant) {
                            projectList = projectList.filter(obj => {
                                if (obj['participant']['pk'] === this.formData.participant['pk']) {
                                    return obj
                                }
                            })
                        }
                        return projectList
                    }
                    return new Array()
                }
            },
            taskList: {
                get() {
                    if (this.$store.getters.taskListData) {
                        return this.$store.getters.taskListData
                    }
                    return new Array()
                }
            },
            eventRoute() {
                return this.formData.route ? 'arrow-right' : 'arrow-left'
            }

        },
        mixins: [filter],
        watch: {
            eventCategory(val) {
                if (val.length > 0 && this.selectedCategory) {
                    this.setCategory(this.selectedCategory)
                }
            },
            formData: {
                deep: true,
                handler(val) {
                    if (this.$refs.newEvent) {
                        this.$refs.newEvent.validate()
                    }
                }
            },
            contractorData: {
                deep: true,
                handler(val, oldVal) {
                    if ((val && oldVal) && val.length > oldVal.length) {
                        this.formData.contractor = _.difference(val, oldVal)[0]
                    }
                }
            }

        },
        created() {
            this.$store.dispatch('getParticipator').then(() => {
                this.$store.dispatch('getLegalEntity').then(() => {
                    this.$store.dispatch('fetchPhysicalPersons').then(() => {
                        this.$store.dispatch('getProjectList').then(() => {

                        })
                    })
                })
            })
            this.$parent.$on('newEvent', (task) => {
                this.actionType = 'create'
                if (task) {
                    this.$store.dispatch('getEventCategory').then(() => {
                        this.formData.source = task.executor
                        this.formData.participant = task.project.participant
                        this.formData.project.push(task.project)
                        this.formData.date = moment(new Date()).format('YYYY-MM-DDThh:mm');
                        this.formData.task.push(task)
                        this.formData.route = true
                        this.formData.name = task.name + ' - готово'
                        this.eventCategory.map(obj => {
                            if (obj['name'] === 'Направленное событие') {
                                this.formData.category = obj
                            }
                        })
                    })

                } else {
                    this.$store.dispatch('getEventCategory').then(() => {
                        let author = this.$store.getters.authUserData
                        this.formData.description = '';
                        this.formData.author = author['pk'];
                        this.formData.date = new Date();
                        this.formData.category = '';
                    })
                }
                this.dialog = true

            })
            this.$parent.$on('editEvent', e => {
                this.actionType = 'edit'
                this.$store.dispatch('getEventDetail', e.pk).then((response) => {
                    let eventDetail = this.$store.getters.eventDetailData
                    this.document = eventDetail['document']
                    this.$store.dispatch('getEventCategory').then(() => {
                        Object.keys(eventDetail).forEach(key => {
                            if (eventDetail[key] === 'object') {
                                this.formData[key] = eventDetail[key]
                            } else {
                                this.formData[key] = eventDetail[key]
                            }
                        })
                        this.dialog = true
                    })
                })
            })
        },
        components: {
            ProjectCreate,
            createDocument,
            editDocument,
            deleteDocument,
            CreateDirectedEvent,
            CreateMoneyEvent,
            CreateMeasureEvent,
        }
    }
</script>

<style scoped>
    >>> .arrow-left {
        transform: rotate(180deg);
    }

    >>> i.route-arrow {
        font-size: 40px !important;
    }
</style>