<template>
    <div>
        <v-row>
            <v-col md="6" sm="5">
                <v-autocomplete
                        outlined
                        label="От кого"
                        :rules="sourceRules"
                        :items="contractorData"
                        return-object
                        item-value="uuid"
                        item-text="fullName"
                        v-model="formData.source"
                        clearable
                        append-outer-icon="mdi-plus"
                        @click:append-outer="addContractor"
                ></v-autocomplete>
            </v-col>
            <v-col md="1" sm="2" align-self="baseline" class="mt-3">
                <v-btn icon color="success" @click="changeRoute()">
                    <v-icon :class="[eventRoute, 'route-arrow']">
                        mdi-arrow-right-bold
                    </v-icon>
                </v-btn>
            </v-col>
            <v-col md="5" sm="5">
                <v-autocomplete
                        outlined
                        label="Кому"
                        clearable
                        :items="participator"
                        v-model="formData.participant"
                        return-object
                        item-value="pk"
                        item-text="participator.fullName"
                ></v-autocomplete>
            </v-col>
        </v-row>
        <v-row justify="start" class="mr-5">
            <v-col md="6" sm="12">
                <v-text-field outlined
                              label="От кого (произвольно)"
                              persistent-hint
                              v-model="formData.custom_source"
                              clearable
                ></v-text-field>
            </v-col>
            <v-col md="6" sm="12">
                <v-autocomplete outlined
                                label="Способ получения"
                                persistent-hint
                                :items="measureEventTypeList"
                                v-model="formData.type"
                                return-object
                                item-value="pk"
                                item-text="name"
                                clearable
                                append-outer-icon="mdi-plus"
                                @click:append-outer="addMeasureEventType"
                ></v-autocomplete>
            </v-col>
        </v-row>
        <v-row justify="center">
            <v-col md="10" sm="10">
                <v-textarea
                        outlined
                        label="Место проведения"
                        v-model="formData.location"
                ></v-textarea>
            </v-col>
        </v-row>
        <CreateMeasureEventType></CreateMeasureEventType>
        <ContractorCreate></ContractorCreate>
    </div>
</template>

<script>
    import {eventBus} from "../../../../bus";
    import {mapGetters} from 'vuex';
    import ContractorCreate from "../../../modalWindows/ContractorCreate";
    import CreateMeasureEventType from "./CreateMeasureEventType";


    export default {
        name: "CreateMeasureEvent",
        props: ['currentEvent'],
        data() {
            return {
                actionType: 'edit',
                formData: {
                    pk: '',
                    participant: '', // Объект
                    type: '',
                    source: '',
                    location: '',
                    route: true,
                    custom_source: '',
                },
                sourceRules: [
                    i => !!this.formData.source || !!this.formData.custom_source || 'Поле обязательно',
                ],
            }
        },
        computed: {
            contractorData: {
                get() {
                    if (this.$store.getters.legalEntityData.data && this.$store.getters.physicalPersonData.data) {
                        return this.$store.getters.legalEntityData.data.concat(this.$store.getters.physicalPersonData.data)
                    }
                    return this.$store.getters.legalEntityData.data
                }
            },
            ...mapGetters({
                paymentPurpose: 'paymentPurposeList',
                participator: 'participatorList',
                measureEventTypeList: 'measureEventTypeList'
                // ...
            }),
            eventRoute() {
                return this.formData.route ? 'arrow-right' : 'arrow-left'
            }
        },
        methods: {
            addContractor() {
                this.$emit('addContractor')
            },
            addMeasureEventType() {
                this.$emit('addMeasureEventType')
            },
            changeRoute() {
                this.formData.route = !this.formData.route
            },
            clean() {
                Object.keys(this.formData).forEach(key => {
                    if (key === 'route') {
                        this.formData[key] = true
                    } else {
                        this.formData[key] = ''
                    }
                })
            },
            reset() {
                Object.assign(this.$data, this.$options.data())
            },
            save() {
                let formData = new FormData()
                Object.keys(this.formData).forEach(key => {
                    console.log(key, this.formData[key])
                    if (typeof this.formData[key] === 'object' && this.formData[key]) {
                        if (key === 'source') {
                            if (this.formData[key]['type'] === "LegalEntity") {
                                formData.set('legal_entity_source', this.formData[key]['pk'])
                            } else {
                                formData.set('physical_person_source', this.formData[key]['pk'])
                            }
                        } else {
                            formData.set(key, this.formData[key]['pk'])
                        }
                    } else {
                        if (key === 'translation_type') {
                            formData.set(key, this.formData[key])
                        } else {
                            if (this.formData[key]) {
                                formData.set(key, this.formData[key])
                            }
                        }
                    }
                })
                if (this.actionType === 'create') {
                    this.$store.dispatch('createMeasureEvent', formData).then(data => {
                        this.$emit('savedEventData', {type: 'measure', data})
                        this.$forceUpdate()
                    })
                } else {
                    if (this.formData['pk'] && this.actionType === 'edit') {
                        this.$store.dispatch('editMeasureEvent', {formData, pk: this.formData['pk']}).then(data => {
                            this.$emit('savedEventData', {type: 'measure', data})
                            this.$forceUpdate()
                        })
                    }
                }
            }
        },
        components: {
            CreateMeasureEventType,
            ContractorCreate
        },
        created() {
            if (this.currentEvent) {
                Object.keys(this.formData).forEach(key => {
                    this.formData[key] = this.currentEvent[key]
                    if (this.currentEvent['pk']) {
                        this.actionType = 'edit'
                    }
                })
            } else {
                this.actionType = 'create'
            }

            eventBus.$on('saveMeasureEvent', () => {
                this.save()
            })
            this.$store.dispatch('getMeasureEventType').then(() => {
            })
            this.$parent.$on('changeCategoryType', () => {
                this.clean()
            })
            eventBus.$on('resetAdditionalForm', () => {
                this.reset()
            })
        },
        destroyed() {
            this.clean()
        }
    }
</script>

<style scoped>

</style>