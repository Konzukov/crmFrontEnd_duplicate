<template>
    <v-dialog v-model="show" persistent max-width="600">
        <v-card>
            <v-card-title>Добавление связанного лица</v-card-title>
            <v-card-text>
                <v-container>
                    <v-form ref="relatedPersonCreate">
                        <v-row justify="center">
                            <v-col cols="10">
                                <v-select v-if="person"
                                          v-model="formData.legalEntity"
                                          label="Организация"
                                          id="legal_entity"
                                          :items="legalEntityList.data"
                                          item-text="name"
                                          item-value="pk"
                                          return-object
                                ></v-select>
                                <v-select
                                        v-else
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
                            <v-col cols="6" sm="6" md="4">
                                <v-dialog
                                        ref="dialogDateFrom"
                                        v-model="dateFrom"
                                        :return-value.sync="formData.dateFrom"
                                        persistent
                                        width="290px"
                                >
                                    <template v-slot:activator="{ on }">
                                        <v-text-field
                                                v-model="formData.dateFrom"
                                                label="Начало связи"
                                                id="date_from"
                                                prepend-icon="mdi-calendar"
                                                readonly
                                                v-on="on"
                                        ></v-text-field>
                                    </template>
                                    <v-date-picker v-model="formData.dateFrom" scrollable locale="ru">
                                        <v-spacer></v-spacer>
                                        <v-btn text color="primary" @click="dateFrom = false">Отмена</v-btn>
                                        <v-btn text color="primary"
                                               @click="$refs.dialogDateFrom.save(formData.dateFrom)">ОК
                                        </v-btn>
                                    </v-date-picker>
                                </v-dialog>
                            </v-col>
                            <v-col cols="6" sm="6" md="4">
                                <v-dialog
                                        ref="dialogDateTo"
                                        v-model="dateTo"
                                        :return-value.sync="formData.dateTo"
                                        persistent
                                        width="290px"
                                >
                                    <template v-slot:activator="{ on }">
                                        <v-text-field
                                                v-model="formData.dateTo"
                                                label="Конец связи"
                                                id="date_to"
                                                prepend-icon="mdi-calendar"
                                                readonly
                                                v-on="on"
                                        ></v-text-field>
                                    </template>
                                    <v-date-picker v-model="formData.dateTo" scrollable locale="ru">
                                        <v-spacer></v-spacer>
                                        <v-btn text color="primary" @click="dateTo = false">Отмена</v-btn>
                                        <v-btn text color="primary"
                                               @click="$refs.dialogDateTo.save(formData.dateTo)">ОК
                                        </v-btn>
                                    </v-date-picker>
                                </v-dialog>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-btn color="error" @click="closeModal()">Отмена</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="success" @click="createRelatedPerson()">Добавить</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        name: "RelatedPersonCreate",
        props: ['legalEntity', 'person'],
        data: () => ({
            show: false,
            dateFrom: false,
            dateTo: false,
            formData: {
                person: '',
                legalEntity: '',
                dateFrom: '',
                dateTo: '',
            }
        }),
        methods: {
            closeModal() {
                for (let key in this.formData) {
                    this.formData[key] = ''
                }
                this.show = false
            },
            createRelatedPerson() {
                let formData = new FormData()
                let relationType = ''
                this.$refs.relatedPersonCreate.inputs.filter(obj => {
                    if (typeof obj.value == 'object') {
                        formData.set(obj.id, obj.value.pk)
                    } else {
                        formData.set(obj.id, obj.value)
                    }
                })
                if (this.legalEntity) {
                    relationType = 'physicalRelation'
                } else {
                    relationType = 'legalRelation'
                }
                this.$store.dispatch('createRelatedPerson', {'data': formData, type: relationType}).then(() => {
                    this.closeModal()
                })
            }
        },
        computed: {
            physicalPersonList() {
                return this.$store.getters.physicalPersonData
            },
            legalEntityList: {
                get() {
                    return this.$store.getters.legalEntityData
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
            },
            curPerson: {
                get() {
                    return new Array(this.person)
                },
                set(val) {
                    return val;
                }
            }

        },
        created() {
            this.$parent.$on('addRelationPerson', (legalEntity) => {
                this.show = !this.show

            })
            this.$store.dispatch('getPhysicalPerson')
            this.$store.dispatch('getLegalEntity')
        }

    }
</script>

<style scoped>

</style>