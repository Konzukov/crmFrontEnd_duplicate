<template>
    <v-dialog persistent v-model="dialog" max-width="700px">
        <v-card>
            <v-card-title>
                <span class="headline">Добавление физического лица</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-form
                            lazy-validation
                            ref="form"
                            v-model="valid"
                    >
                        <v-row>
                            <v-col cols="4">
                                <v-text-field
                                        v-model="formData.last_name"
                                        ref="last_name"
                                        :rules="rules.nameRules"
                                        label="Фамилия"></v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field
                                        v-model="formData.first_name"
                                        ref="first_name"
                                        :rules="rules.nameRules"
                                        label="Имя"></v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field
                                        label="Отчетсво"
                                        ref="middle_name"
                                        v-model="formData.middle_name"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="6" md="6" sm="12">
                                <v-text-field
                                        label="Номер телефона"
                                        v-model="formData.phone"
                                        ref="phone"
                                        v-mask="'+#(###)###-##-##'"
                                        hint="Номер телефона в формате +7(xxx)xxx-xx-xx"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="6" md="6" sm="12">
                                <v-text-field
                                        label="Email"
                                        :rules="required"
                                        v-model="formData.email"
                                        ref="email"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col md="5" sm="10">
                                <el-date-picker
                                        v-model="formData.birthday"
                                        type="date"
                                        placeholder="День рождения"
                                >
                                </el-date-picker>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-switch
                                    color="success"
                                    v-model="formData.hasPermission"
                                    label="Доступ к системе"
                            ></v-switch>
                        </v-row>
                    </v-form>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error darken-1"
                       class="mr-4"
                       @click="close()">Отмена
                </v-btn>
                <v-btn color="success darken-1"
                       :disabled="!valid" class="mr-4"
                       @click="fromSubmit">Сохранить
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import {VueMaskDirective} from 'v-mask'
    import moment from 'moment'

    export default {
        name: "PhysicalPersonCreate",
        props: ['subsystem'],
        data() {
            return {
                dialog: false,
                valid: true,
                formData: {
                    last_name: '',
                    first_name: '',
                    middle_name: '',
                    phone: '',
                    email: '',
                    birthday: '',
                    hasPermission: false
                },
                rules: {
                    nameRules: [v => !!v || 'Данное поля обязатольно'],
                    emailRequired: [v => !!v || 'Данное поля обязатольно'],
                    emailNotRequired: [v => !v || 'Данное поля не обязатольно'],
                },
                phoneMask: '+#(###)###-##-##'

            }
        },
        created() {
            this.$parent.$on('showModals', (name) => {
                if (this.subsystem.name === name) {
                    this.dialog = !this.dialog
                }
            })
            this.$parent.$on('addPhysicalPerson', ()=>{
                this.dialog = true
            })
        },
        computed: {
            required: {
                get() {
                    if (this.formData.hasPermission) {
                        return this.rules.emailRequired
                    }
                    return new Array()
                }
            }
        },
        methods: {
            fromSubmit() {
                if (this.$refs.form.validate()) {
                    let data = new FormData();
                    Object.keys(this.formData).forEach(key => {
                        if (key === 'birthday') {
                            if (this.formData[key]) {
                                data.set(key, moment(this.formData[key]).format('YYYY-MM-DD'))
                            }
                        } else {
                            data.set(key, this.formData[key])
                        }
                    })
                    this.$store.dispatch('createPhysicalPerson', data).then(() => {
                        this.close()
                        // this.formData.hasPermission = false
                    })
                }
            },
            close() {
                this.dialog = false
                Object.keys(this.formData).forEach(key=>{
                    if(key === 'hasPermission') {
                        this.formData[key] = false
                    }else{
                        this.formData[key] = ''
                    }
                })
            }
        },
        watch: {
            'formData.hasPermission'(val) {
                if (val === false) {
                    this.$refs.form.resetValidation()
                }
            }
        }
        ,
        directives: {
            'v-mask':
            VueMaskDirective
        }
    }
</script>

<style scoped>

</style>