<template>
    <v-dialog v-model="dialog" width="400">
        <v-card>
            <v-card-title>
                <v-row justify="center">
                    <span class="heading">Новое назначение платежа</span>
                </v-row>
            </v-card-title>
            <v-card-text>
                <v-form lazy-validation ref="paymentPurposeForm" @submit.prevent="save">
                    <v-row>
                        <v-text-field
                                outlined
                                label="Назначение платежа"
                                v-model="form.name"
                                :rules="rules"
                        ></v-text-field>
                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-row justify="center">
                    <v-col md="5" sm="5">
                        <v-btn color="error" @click="close">Закрыть</v-btn>
                    </v-col>
                    <v-col md="5" sm="5">
                        <v-btn color="success" @click="save">Сохранить</v-btn>
                    </v-col>
                </v-row>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        name: "CreatePaymentPurpose",
        data() {
            return {
                dialog: false,
                form: {
                    name: ''
                },
                rules: [
                    v => !!v || 'Поле обязательно'
                ]
            }
        },
        methods: {
            close() {
                this.dialog = false
                this.form.name = ''
            },
            save() {
                if (this.$refs.paymentPurposeForm.validate()) {
                    console.log(this.form.name)
                    let formData = new FormData()
                    formData.set('name', this.form.name)
                    this.$store.dispatch('createPaymentPurpose', formData).then(() => {
                        this.close()
                    })
                }

            }
        },
        created() {
            this.$parent.$on('addPaymentPurpose', () => {
                this.dialog = true
            })
        }
    }
</script>

<style scoped>
    >>>.v-card{
        overflow: hidden !important;
    }
</style>