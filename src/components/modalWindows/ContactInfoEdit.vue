<template>
    <v-dialog v-model="show" persistent max-width="600">
        <v-card>
            <v-card-title>
                <span class="heading">Редактирование контакта</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-form ref="editContactInfo">
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
                       @click="show = false">Отмена
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
        name: "ContactInfoEdit",
        data() {
            return {
                show: false,
                contactInfo: '',
                rules: {
                    required: value => !!value || 'Поле обязательно',
                    counter: value => value.length >= 16 || 'Телефон в формате +1(234)567-89-01',
                }
            }
        },
        methods: {
            saveContactInfo() {
                let formData = new FormData()
                Object.keys(this.contactInfo).forEach(key => {
                    formData.set(key, this.contactInfo[key])
                })
                this.$store.dispatch('editContactInfo', {'formData': formData, 'contactInfo':this.contactInfo}).then(()=>{
                    this.show = false
                })
            }
        },
        directives: {
            VueMaskDirective
        },
        created() {
            this.$parent.$on('editContact', (contact) => {
                this.contactInfo = contact
                this.show = !this.show
            })
        }
    }
</script>

<style scoped>

</style>