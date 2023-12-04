<template>
    <v-dialog v-model="show" persistent max-width="600">
        <v-card>
            <v-card-title>
                <span class="headline">Добавление контактной информации</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-form ref="addContactInfo">
                        <v-row justify="center">
                            <v-col cols="12">
                                <v-select
                                        v-model="legalEntity"
                                        :items="curLegalEntity"
                                        item-value="pk"
                                        item-text="name"
                                        label="Организация"
                                        disabled
                                ></v-select>
                            </v-col>
                        </v-row>
                        <v-row justify="center">
                            <v-col cols="12">
                                <v-text-field
                                        outlined
                                        label="Наименование контакта"
                                        v-model="contactInfo.name"
                                >

                                </v-text-field>
                            </v-col>
                        </v-row>
                        <v-row justify="center">
                            <v-col cols="6" md="6" sm="12">
                                <v-text-field
                                        outlined
                                        label="Номер телефона"
                                        type="tel"
                                        :rules="[rules.required, rules.counter]"
                                        v-model="contactInfo.phone"
                                        v-vue-mask-directive="'+#(###)###-##-##'"
                                        append-icon="mdi-phone"
                                >

                                </v-text-field>
                            </v-col>
                            <v-col cols="6" md="6" sm="12">
                                <v-text-field
                                        outlined
                                        label="Email"
                                        type="email"
                                        v-model="contactInfo.email"
                                        append-icon="mdi-email"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error darken-1"
                       class="mr-4"
                       @click="cancelEdit()">Отмена
                </v-btn>
                <v-btn color="success darken-1"
                       class="mr-4"
                       @click="saveContactInfo()">Сохранить
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import {VueMaskDirective} from 'v-mask'

    export default {
        name: "ContactInfoCreate",
        props: ['legalEntity'],
        data() {
            return {
                show: false,
                contactInfo: {
                    name: '',
                    phone: '',
                    email: ''
                },
                rules: {
                    required: value => !!value || 'Поле обязательно',
                    counter: value => value.length >= 16 || 'Телефон в формате +1(234)567-89-01',
                    // email: value => {
                    //     const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    //     return pattern.test(value) || 'неверный e-mail.'
                    // },
                }
            }
        },
        computed: {
            curLegalEntity: {
                get() {
                    return new Array(this.legalEntity)
                },
                set(val) {
                    return val
                }
            },
        },
        methods: {
            cancelEdit() {
                Object.keys(this.contactInfo).forEach(key => {
                    this.contactInfo[key] = ''
                })
                this.show = false
            },
            saveContactInfo() {
                let formData = new FormData()
                Object.keys(this.contactInfo).forEach(key => {
                    formData.set(key, this.contactInfo[key])
                })
                formData.set('entity', this.legalEntity.pk)
                this.$store.dispatch('createContactInfo', {
                    'formData': formData,
                    'legalEntity': this.legalEntity.pk
                }).then(() => {
                    Object.keys(this.contactInfo).forEach(key => {
                        this.contactInfo[key] = ''
                        this.$refs.addContactInfo.resetValidation()
                    })
                    this.show = false
                })
            }
        },
        directives: {
            VueMaskDirective
        },
        created() {
            this.$parent.$on('addContactInfo', () => {
                this.show = true
            })
        }
    }
</script>

<style scoped>

</style>