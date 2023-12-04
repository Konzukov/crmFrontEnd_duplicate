<template>
    <v-container>
        <v-dialog v-model="dialog" max-width="700" persistent>
            <v-card>
                <v-container>
                    <v-row justify="center">
                        <v-card-title>Добавление направления</v-card-title>
                    </v-row>
                    <v-row justify="center">
                        <v-card-text>
                            <v-form>
                                <v-row justify="center">
                                    <v-col md="10" sm="10">
                                        <v-autocomplete
                                                outlined
                                                v-model="form.direction"
                                                label="Направления"
                                                :items="baseDirectionList"
                                                item-value="pk"
                                                item-text="name"
                                                append-outer-icon="mdi-plus"
                                                @click:append-outer="addBaseDirection"
                                        ></v-autocomplete>
                                    </v-col>
                                </v-row>
                                <v-row justify="center">
                                    <v-col md="6" sm="10">
                                        <v-autocomplete
                                                outlined
                                                :items="participatorList"
                                                v-model="form.participant"
                                                small-chips
                                                label="Участник"
                                                item-text="participator.fullName"
                                                item-value="pk"
                                                @change="getRelatedUser"
                                        >
                                        </v-autocomplete>
                                    </v-col>
                                    <v-col md="6" sm="10">
                                        <v-autocomplete
                                                outlined
                                                label="Ответственный"
                                                v-model="form.responsible"
                                                :items="systemUserList"
                                                item-value="pk"
                                                item-text="last_name"
                                        >
                                            <template slot="selection" slot-scope="data" v-if="data">
                                                {{ data.item | staffFullName}}
                                            </template>
                                            <template slot="item" slot-scope="data" v-if="data">
                                                {{ data.item | staffFullName}}
                                            </template>
                                        </v-autocomplete>
                                    </v-col>
                                </v-row>
                                <v-row justify="center">
                                    <v-col md="10" sm="11">
                                        <v-switch
                                                color="success"
                                                v-model="form.isActive"
                                                label="Активное">
                                        </v-switch>
                                    </v-col>
                                </v-row>
                            </v-form>
                        </v-card-text>
                    </v-row>
                    <v-row justify="center">
                        <v-card-actions>
                            <v-col md="6" sm="6">
                                <v-btn class="pl-3 pr-3" color="error" @click="close">Отмена</v-btn>
                            </v-col>
                            <v-col md="6" sm="6">
                                <v-btn class="pl-3 pr-3" color="success" @click="save">Сохранить</v-btn>
                            </v-col>
                        </v-card-actions>
                    </v-row>

                </v-container>
            </v-card>
        </v-dialog>
        <BaseDirectionCreate></BaseDirectionCreate>
    </v-container>

</template>

<script>
    import filter from '../../../mixin/filter'
    import BaseDirectionCreate from "../BaseDirectionCreate";

    export default {
        name: "DirectionCreate",
        data() {
            return {
                dialog: false,
                actionType: 'create',
                loading: true,
                fromContract: false,
                form: {
                    pk: '',
                    direction: '',
                    participant: '',
                    responsible: '',
                    isActive: true,
                }
            }
        },
        computed: {
            baseDirectionList: {
                get() {
                    if (!this.loading) {
                        return this.$store.getters.baseDirectionListData
                    }
                    return new Array()
                }
            },
            participatorList: {
                get() {
                    if (!this.loading) {
                        return this.$store.getters.participatorList
                    }
                    return new Array()
                }
            },
            systemUserList: {
                get() {
                    if (this.$store.getters.relatedUserData) {
                        return this.$store.getters.relatedUserData
                    }
                    return new Array()
                }
            }
        },
        methods: {
            close() {
                this.dialog = false
                Object.keys(this.form).forEach(key => {
                    if (key === 'isActive') {
                        this.form[key] = true
                    } else {
                        this.form[key] = ''
                    }
                })
            },
            save() {
                let formData = new FormData()
                Object.keys(this.form).forEach(key => {
                    formData.append(key, this.form[key])
                })
                if (this.actionType === 'create') {
                    this.$store.dispatch('createDirections', {formData, 'fromContract': this.fromContract}).then(() => {
                        this.close()
                    }).catch((error) => {
                        console.log(error)
                    })
                } else {
                    this.$store.dispatch('changeDirections', {'pk': this.form['pk'], formData}).then(() => {
                        this.close()
                    }).catch((error) => {
                        console.log(error)
                    })
                }

            },
            async addBaseDirection() {
                this.$emit('newBaseDirection')
            },
            getRelatedUser(item) {
                this.$store.dispatch('getRelatedUser', item)
            },
            async dispatchStoreData() {
                this.$store.dispatch('getBaseDirectionList').then(() => {
                    this.$store.dispatch('getParticipator').then(() => {
                        this.getRelatedUser(this.form.participant)
                        this.loading = false
                    })
                })
            },
        },
        mixins: [filter],
        created() {
            this.$parent.$on('newDirection', (type, participant, fromContract) => {
                this.dispatchStoreData()
                if (type['fromContract']) {
                    this.fromContract = type['fromContract']
                }
                this.form.participant = type['participant']
                this.actionType = type['type']
                this.dialog = true
            })
            this.$parent.$on('editDirection', ({type, direction}) => {
                this.dispatchStoreData()
                this.actionType = type
                Object.keys(this.form).forEach(key => {
                    if (typeof direction[key] === 'object') {
                        this.form[key] = direction[key]['pk']
                    } else {
                        this.form[key] = direction[key]
                    }

                })
                this.dialog = true
            })
        },
        components: {
            BaseDirectionCreate
        }
    }
</script>

<style scoped>
    >>> .v-card .row {
        margin-right: 0px;
    }

</style>