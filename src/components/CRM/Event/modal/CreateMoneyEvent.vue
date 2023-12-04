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
                <v-select
                        outlined
                        label="Способ оплаты"
                        clearable
                        :items="transitionType"
                        v-model="formData.translation_type"
                        item-value="pk"
                        item-text="name"
                ></v-select>
            </v-col>
            <v-row justify="start" class="mr-5">
                <v-col md="4" sm="10">
                    <v-text-field
                            outlined
                            label="Сумма платежа"
                            type="number"
                            v-model="formData.amount"
                    ></v-text-field>
                </v-col>
                <v-col md="6" sm="10">
                    <v-select
                            outlined
                            label="Назначение платежа"
                            clearable
                            :items="paymentPurpose"
                            v-model="formData.payment_purpose"
                            item-value="pk"
                            item-text="name"
                            return-object
                            append-outer-icon="mdi-plus"
                            @click:append-outer="addPaymentPurpose"
                    ></v-select>
                </v-col>
            </v-row>
        </v-row>
        <CreatePaymentPurpose></CreatePaymentPurpose>
        <ContractorCreate></ContractorCreate>
    </div>
</template>

<script>
    import {eventBus} from "../../../../bus";
    import CreatePaymentPurpose from "./CreatePaymentPurpose";
    import {mapGetters} from 'vuex';
    import ContractorCreate from "../../../modalWindows/ContractorCreate";

    export default {
        name: "CreateMoneyEvent",
        props: ['currentEvent'],
        data() {
            return {
                actionType: 'edit',
                transitionType: [
                    {name: 'Наличный', pk: 0},
                    {name: 'Безналичный', pk: 1}
                ],
                formData: {
                    pk: '',
                    translation_type: 0,
                    participant: '', // Объект
                    source: '',
                    route: true,
                    custom_source: '',
                    amount: '',
                    payment_purpose: '', // Объект PaymentPurpose - назначение платежа
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
            addPaymentPurpose() {
                this.$emit('addPaymentPurpose')
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
                console.log('save child even')
                let formData = new FormData()
                Object.keys(this.formData).forEach(key => {

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
                    console.log('this.actionType', this.actionType)
                    this.$store.dispatch('createMoneyEvent', formData).then((data) => {
                        this.$emit('savedEventData', {type: 'money', data})
                    })
                } else {
                    if (this.formData['pk'] && this.actionType === 'edit') {
                        this.$store.dispatch('editMoneyEvent', {formData, pk: this.formData['pk']}).then((data) => {
                            this.$emit('savedEventData', {type: 'money', data})
                        })
                    }
                }
            }
        },
        created() {
            if (this.currentEvent) {
                this.actionType = 'edit'
                Object.keys(this.formData).forEach(key => {
                    if (key === 'translation_type') {
                        this.transitionType.forEach(obj => {
                            Object.keys(obj).forEach(key => {
                                if (key === 'name' && obj[key] === this.currentEvent['translation_type']) {
                                    this.formData['translation_type'] = obj
                                }
                            })
                        })
                    } else {
                        this.formData[key] = this.currentEvent[key]
                    }
                })
            } else {
                this.actionType = 'create'
            }
            eventBus.$on('saveMoneyEvent', () => {
                this.save()
            })
            eventBus.$on('resetAdditionalForm',()=>{
                this.reset()
            })
            this.$store.dispatch('getPaymentPurpose')
        },
        destroyed() {
            this.clean()
        },
        components: {
            CreatePaymentPurpose,
            ContractorCreate
        }
    }
</script>

<style scoped>

</style>