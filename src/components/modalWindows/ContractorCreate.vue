<template>
    <v-container fluid>
        <v-dialog v-model="dialog" width="600">
            <v-card width="600">
                <v-container>
                    <v-card-title>
                        <span class="headline">Добавление контрагента</span>
                    </v-card-title>
                    <v-card-text>
                        <v-row justify="center">
                            <v-col md="10" sm="10">
                                <v-select :items="type" @change="showForm" v-model="selected">
                                </v-select>
                            </v-col>
                        </v-row>
                        <v-form v-model="valid" lazy-validation>
                            <v-row justify="center" v-if="selected === 'Физ. лицо'">
                                <v-col md="5" sm="5">
                                    <v-text-field label="Фамилия" :rules="rules"
                                                  v-model="form.last_name"></v-text-field>
                                </v-col>
                                <v-col md="5" sm="5">
                                    <v-text-field label="Имя" :rules="rules" v-model="form.first_name"></v-text-field>
                                </v-col>
                                <v-col md="5" sm="5">
                                    <v-text-field label="Отчество" v-model="form.middle_name"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row justify="center" v-else-if="selected === 'Юр. лицо'">
                                <v-col md="10" sm="11">
                                    <v-text-field label="Название" v-model="form.name"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                    <v-row justify="center">
                        <v-card-actions>
                            <v-col md="5" sm="5">
                                <v-btn color="error" @click="close">Закрыть</v-btn>
                            </v-col>
                            <v-col md="5" sm="5">
                                <v-btn color="success" :disabled="!valid" @click="save()">Добавить</v-btn>
                            </v-col>
                        </v-card-actions>
                    </v-row>
                </v-container>
            </v-card>
        </v-dialog>
        <PhysicalPersonCreate></PhysicalPersonCreate>
    </v-container>
</template>

<script>
    import PhysicalPersonCreate from "./PhysicalPersonCreate";

    export default {
        name: "ContractorCreate",
        data() {
            return {
                valid: true,
                dialog: false,
                type: ['Физ. лицо', 'Юр. лицо'],
                selected: '',
                rules: [v => !!v || 'Данное поле обязательно'],
                form: {}
            }
        },
        methods: {
            close() {
                this.dialog = false
                this.selected = ''
            },
            open() {
                this.dialog = true
            },
            save() {
                let formData = new FormData()
                Object.keys(this.form).forEach(key => {
                    formData.set(key, this.form[key])
                })
                if (this.selected === 'Физ. лицо') {
                    this.$store.dispatch('createPhysicalPerson', formData).then(() => {
                        this.close()
                        this.form = {}
                    })
                } else {
                    this.$store.dispatch('createLegalEntity', formData).then(()=>{
                        this.close()
                        this.form = {}
                    }).catch(err=>{
                        console.log(err)
                    })

                }

            },
            showForm(item) {
                if (item === 'Физ. лицо') {
                    this.form['last_name'] = ''
                    this.form['first_name'] = ''
                    this.form['middle_name'] = ''
                } else {
                    this.form['name'] = ''
                }
            }
        },
        created() {
            this.$parent.$on('addContractor', () => {
                this.open()
            })
        },
        components: {
            PhysicalPersonCreate,

        }
    }
</script>
<!--addPhysicalPerson-->
<style scoped>

</style>