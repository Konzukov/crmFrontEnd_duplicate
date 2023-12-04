<template>
    <v-dialog v-model="show" persistent max-width="600">
        <v-card>
            <v-card-title>Редактирование связанного лица</v-card-title>
            <v-card-text>
                <v-container>
                    <v-form ref="relatedPersonCreate">
                        <v-row justify="center">
                            <v-col cols="10">
                                <v-select v-if="person"
                                          v-model="formData.legal_entity"
                                          label="Организация"
                                          id="legal_entity"
                                          :items="legalEntityList.data"
                                          item-text="name"
                                          item-value="pk"
                                          return-object
                                ></v-select>
                                <v-select v-else
                                          v-model="legalEntity"
                                          label="Организация"
                                          id="legal_entity"
                                          :items="curLegalEntity"
                                          item-text="name"
                                          item-value="pk"
                                          disabled
                                          return-object
                                ></v-select>
                            </v-col>
                        </v-row>
                        <v-row justify="center">
                            <v-col cols="10">
                                <v-select v-if="person"
                                          :items="curPerson"
                                          v-model="person"
                                          item-value="pk"
                                          id="person"
                                          label="Человеки"
                                          disabled
                                          return-object>
                                    <template slot="selection" slot-scope="data">
                                        {{ data.item.last_name}} {{ data.item.first_name}}
                                    </template>
                                    <template slot="item" slot-scope="data">
                                        {{ data.item.last_name}} {{ data.item.first_name}}
                                    </template>
                                </v-select>
                                <v-select v-else
                                          :items="physicalPersonList.data"
                                          v-model="formData.person"
                                          item-value="pk"
                                          id="person"
                                          label="Человеки"
                                          return-object>
                                    <template slot="selection" slot-scope="data">
                                        {{ data.item.last_name}} {{ data.item.first_name}}
                                    </template>
                                    <template slot="item" slot-scope="data">
                                        {{ data.item.last_name}} {{ data.item.first_name}}
                                    </template>
                                </v-select>
                            </v-col>
                        </v-row>
                        <v-row justify="center">
                            <v-col cols="6" sm="12" md="6">
                                <v-text-field
                                        prepend-icon="mdi-calendar"
                                        type="date"
                                        v-model="formData.date_from"
                                        id="date_from"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="6" sm="12" md="6">
                                <v-text-field
                                        prepend-icon="mdi-calendar"
                                        v-model="formData.date_to"
                                        type="date"
                                        id="date_to"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-btn color="error" @click="show = false">Отмена</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="success" @click="saveChange()">Сохранить</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import moment from 'moment'

    export default {
        name: "RelatedPersonEdit",
        props: ['person', 'legalEntity'],
        data() {
            return {
                show: false,
                formData: ''
            }
        },
        computed: {
            physicalPersonList: {
                get() {
                    return this.$store.getters.physicalPersonData
                },
                set(val) {
                    return val;
                }
            },
            legalEntityList: {
                get() {
                    return this.$store.getters.legalEntityData
                },
                set(val) {
                    return val
                }
            },
            curPerson: {
                get() {
                    return new Array(this.person)
                },
                set(val) {
                    return val
                }
            },
            curLegalEntity: {
                get() {
                    return new Array(this.legalEntity)
                },
                set(val) {
                    return val
                }
            }
        },
        methods: {
            saveChange() {
                let formData = new FormData()
                this.$refs.relatedPersonCreate.inputs.filter(obj => {
                    if (typeof obj.value == 'object' && obj.value !== null) {
                        formData.set(obj.id, obj.value.pk)
                    } else if (obj.value !== null) {
                        formData.set(obj.id, moment(obj.value).format('YYYY-MM-DD'))
                    }
                })
                this.$store.dispatch('editRelatedPerson', {'data': formData, 'pk': this.formData.pk}).then(()=>{
                    this.show = false
                })
            }
        },
        created() {
            this.$parent.$on('editRelated', (object) => {
                this.show = !this.show
                this.formData = object
            })
        },
    }
</script>

<style scoped>

</style>