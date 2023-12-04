<template>
    <v-row justify="start">
        <v-col md="4" sm="12">
            <v-card>
                <v-card-title>Выборете пользователя</v-card-title>
                <v-card-text>
                    <v-form>
                        <v-row justify="center">
                            <v-spacer></v-spacer>
                            <v-col md="3" sm="3">
                                <v-btn icon @click="display = 'timeLine'"
                                       :color="display === 'timeLine' ? 'success' : ''">
                                    <v-icon size="36">mdi-chart-timeline-variant</v-icon>
                                </v-btn>
                            </v-col>
                            <v-col md="3" sm="3">
                                <v-btn icon @click="display = 'table'"
                                       :color="display === 'table' ? 'success' : ''">
                                    <v-icon size="36">mdi-table-large</v-icon>
                                </v-btn>
                            </v-col>
                            <v-spacer></v-spacer>
                        </v-row>
                        <v-autocomplete
                                :items="systemUser"
                                label="Пользователь"
                                item-value="uuid"
                                item-text="fullName"
                                @change="getEvent"
                                clearable
                                v-model="filter.user"
                        ></v-autocomplete>
                        <v-date-picker
                                full-width
                                no-title
                                locale="ru"
                                first-day-of-week="1"
                                v-if="filter.user"
                                @input="orderingDate"
                                v-model="filter.range" range></v-date-picker>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col md="8" sm="12" v-if="filter.user">
            <template v-if="display === 'timeLine'">
                <v-timeline>
                    <v-timeline-item v-for="(event, i) in eventList" :key="i"
                                     :left="i % 2 == 0"
                                     :right="i % 2 != 0"
                                     color="amber darken-2"
                                     icon="mdi-lightbulb-on-outline"
                    >
                        <v-card>
                            <v-row>
                                <v-col>
                                </v-col>
                            </v-row>
                            <v-card-title>
                                <v-row>
                                    <v-col md="3">
                                        <v-icon
                                                size="55"
                                                class="mr-4"
                                                color="amber darken-2"
                                        >mdi-lightbulb-on-outline
                                        </v-icon>
                                    </v-col>
                                    <v-col md="9">
                                        <v-row>
                                            <span class="caption">{{event.start}}</span></v-row>
                                        <v-row>
                                            <h3 class="font-weight-medium">{{event.name}}</h3>
                                        </v-row>
                                    </v-col>
                                </v-row>
                            </v-card-title>
                            <v-card-text>
                                {{event.description}}
                            </v-card-text>
                            <v-expansion-panels v-if="event.document.length > 0">
                                <v-expansion-panel>
                                    <v-expansion-panel-header>Документы</v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        <v-row>
                                            <v-col md="6" v-for="(doc, i) in event.document" :key="i"
                                                   align-self="center">
                                                <v-icon
                                                        class="doc-icon"
                                                        size="36"
                                                        color="success darken-2"
                                                >mdi-file
                                                </v-icon>
                                                <br>
                                                <span class="caption">{{doc.fileName}}</span>
                                            </v-col>
                                        </v-row>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </v-card>
                    </v-timeline-item>
                </v-timeline>
            </template>
            <template v-else>
                <template v-if="loading">
                    <v-skeleton-loader
                            class="mx-auto"
                            type="table"
                    ></v-skeleton-loader>
                </template>
                <template v-else>
                    <v-card :height="reportCardHeight()" id="report-card">
                        <v-card-text v-for="(items, key) in reportData" :key="key">
                            <v-card flat v-for="(item, key, i)  in items" :key="i">
                                <v-card-title class="text-left heading">{{key}}</v-card-title>
                                <v-card-text v-for="(report, index) in item" :key="index">
                                    <v-row>
                                        <v-col md="1">
                                            <v-icon size="36" v-if="report.type === 'document'">
                                                mdi-file-outline
                                            </v-icon>
                                            <v-icon size="36" v-else-if="report.type === 'event'">
                                                mdi-lightbulb-on-outline
                                            </v-icon>
                                            <v-icon size="36" v-else-if="report.type === 'task'"
                                                    :color="taskColor(report)">
                                                mdi-clipboard-list-outline
                                            </v-icon>
                                        </v-col>
                                        <v-col md="2">
                                            Проекты:
                                                <template v-for="(project, i) in report.project">

                                                    <p v-if="project" :key="i">{{project.name}}</p>
                                            </template>
                                        </v-col>
                                        <v-col md="3">
                                            <div v-if="report.type === 'document'">
                                                <p class="font-weight-medium mb-0">{{report.fileName}}
                                                    <v-icon color="success" @click="downloadDoc(report)" size="18">
                                                        mdi-download-outline
                                                    </v-icon>
                                                </p>
                                                <p class="text-sm-caption"><span class="font-weight-thin">Внес:</span>
                                                    {{report.author.fullName}}
                                                </p>
                                            </div>
                                            <div v-else>
                                                <p class="text-sm-caption">
                                                    <v-expansion-panels flat>
                                                        <v-expansion-panel>
                                                            <v-expansion-panel-header
                                                                    expand-icon="mdi-chevron-double-down">
                                                                {{report.name}}
                                                            </v-expansion-panel-header>
                                                            <v-expansion-panel-content>
                                                                {{report.description}}
                                                            </v-expansion-panel-content>
                                                        </v-expansion-panel>
                                                    </v-expansion-panels>
                                                </p>
                                            </div>
                                        </v-col>
                                        <v-col md="3">
                                            <template v-if="report.type === 'document'">
                                                <p v-if="report.route === 'true'">
                                                    <span class="font-weight-thin">От:</span> {{report.to.fullName}}
                                                </p>
                                                <p v-else>
                                                    <span class="font-weight-thin">От:</span>
                                                    {{report.fromWho.fullName}}
                                                </p>
                                            </template>
                                            <template v-else-if="report.type === 'event'">
                                                <p v-if="report.event_detail.route === 'true'">
                                                    <span class="font-weight-thin">От:</span>
                                                    {{report.event_detail.participant.participator.fullName}}
                                                </p>
                                                <p v-else>
                                                    <span class="font-weight-thin">От:</span>
                                                    {{report.event_detail.source.fullName}}
                                                </p>
                                            </template>
                                            <template v-else>
                                                <p>
                                                    <span class="font-weight-thin">От:</span>
                                                    {{report.author.fullName}}
                                                </p>
                                            </template>
                                        </v-col>
                                        <v-col md="3">
                                            <template v-if="report.type === 'document'">
                                                <p v-if="report.route === 'true'">
                                                    <span class="font-weight-thin">Кому:</span>
                                                    {{report.fromWho.fullName}}
                                                </p>
                                                <p v-else>
                                                    <span class="font-weight-thin">Кому:</span> {{report.to.fullName}}
                                                </p>
                                            </template>
                                            <template v-else-if="report.type === 'event'">
                                                <p v-if="report.event_detail.route === 'true'">
                                                    <span class="font-weight-thin">Кому:</span>
                                                    {{report.event_detail.source.fullName}}
                                                </p>
                                                <p v-else>
                                                    <span class="font-weight-thin">Кому:</span>
                                                    <template v-if="report.event_detail.participant">
                                                        {{report.event_detail.participant.participator.fullName}}
                                                    </template>
                                                </p>
                                            </template>
                                            <template v-else>
                                                <p>
                                                    <span class="font-weight-thin">От:</span>
                                                    {{report.executor.fullName}}
                                                </p>
                                            </template>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-card>
                        </v-card-text>
                    </v-card>
                </template>
            </template>
        </v-col>
    </v-row>
</template>

<script>
    export default {
        name: "Report",
        data() {
            return {
                display: 'table',
                expanded: [],
                loading: true,
                filter: {
                    project: '',
                    user: '',
                    range: []
                },
            }
        },
        computed: {
            systemUser: {
                get() {
                    if (this.$store.getters.allSystemUsersData) {
                        return this.$store.getters.allSystemUsersData
                    }
                    return new Array()
                }
            },
            reportData: {
                get() {
                    if (this.$store.getters.userReportListData) {
                        let data = this.$store.getters.userReportListData
                        if (this.filter.range.length > 0) {
                            data = data.filter(obj => {
                                if (this.filter.range.length === 2) {
                                    if (obj.start >= this.filter.range[0] && obj.start <= this.filter.range[1]) {
                                        return obj
                                    }
                                } else {
                                    if (obj.start >= this.filter.range[0]) {
                                        return obj
                                    }
                                }
                            })
                        }
                        return data
                    }
                    return new Array()
                }
            },
        },
        methods: {
            getEvent() {
                if (this.filter.user) {
                    this.loading = true
                    this.$store.dispatch('getUserReport', this.filter.user).then(() => {
                        this.loading = false
                    })
                }
            },
            orderingDate(item) {
                this.filter.range.sort()
            },
            downloadDoc(doc) {
                this.$store.dispatch('downloadDocument', {'pk': doc.pk, 'fileName': doc.fileName})
            },
            taskColor(item) {
                if (item.status.name === 'Выполнена' || item.status === 'Закрыта событием') return 'success'
                else if (item.status === 'Отменена') return
                else return 'error'
            },
            reportCardHeight() {
                let card = document.querySelector('.v-main')
                console.log(card.offsetHeight)
                return card.offsetHeight - 200
            }
        },
        filters: {
            sliceDescription(description) {
                return description.slice(0, 35) + '...'
            }
        },
        created() {
            this.$store.dispatch('allSystemUser')
        }
    }
</script>

<style scoped>
    >>> .v-card#report-card {
        overflow-x: scroll;
        overflow-y: scroll;
    }

    i.doc-icon {
        margin: 0 45px;
    }

    .activeDisplay {
        color: green;
    }

    .routeIcon {
        color: #30b21d;
    }

    tr.event-list td {
        border-color: #0D47A1 !important;
        border-top: 2px solid;
        border-bottom: 2px solid;
    }

    tr.event-list td:first-child {
        border-color: #0D47A1 !important;
        border-left: 2px solid;
    }

    tr.event-list td:last-child {
        border-color: #0D47A1 !important;
        border-right: 2px solid;
    }

    tr.task-list td {
        border-color: #B71C1C !important;
        border-top: 2px solid;
        border-bottom: 2px solid;
    }

    tr.task-list td:first-child {
        border-color: #B71C1C !important;
        border-left: 2px solid;
    }

    tr.task-list td:last-child {
        border-color: #B71C1C !important;
        border-right: 2px solid;
    }

    tr.doc-list td {
        border-color: #FFB74D !important;
        border-top: 2px solid;
        border-bottom: 2px solid;
    }

    tr.doc-list td:first-child {
        border-color: #FFB74D !important;
        border-left: 2px solid;
    }

    tr.doc-list td:last-child {
        border-color: #FFB74D !important;
        border-right: 2px solid;
    }
</style>