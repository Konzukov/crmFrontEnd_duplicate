<template>
    <v-dialog v-model="dialog" width="650">
        <v-card>
            <v-container>
                <v-row justify="center">
                    <v-card-title>Добавление отдела</v-card-title>
                </v-row>
                <v-card-text>
                    <v-form ref="departmentCreate">
                        <v-row>
                            <v-col md="8" sm="10">
                                <v-text-field
                                        outlined
                                        disabled
                                        label="Организация"
                                        v-model="newDepartmentData.organization.name"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col md="8" sm="10">
                                <v-text-field
                                        outlined
                                        v-model="newDepartmentData.name"
                                        label="Название отдела"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-row>
                        <v-btn @click="close" color="error">Закрыть</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="success" @click="save">Сохранить</v-btn>
                    </v-row>
                </v-card-actions>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>

    export default {
        name: "DepartmentCreate",
        data() {
            return {
                dialog: false,
                newDepartmentData: {
                    organization: '',
                    name: ''
                }

            }
        },
        methods: {
            close() {
                this.dialog = false
            },
            save(){
                let formData = new FormData()
                formData.set('name', this.newDepartmentData.name)
                formData.set('organization', this.newDepartmentData.organization.pk)
                this.$store.dispatch('addDepartment', formData).then(()=>{
                    this.dialog = false
                    this.newDepartmentData.name = ''
                })
            }
        },
        created() {
            this.$parent.$on('departmentCreate', (legalEntity) => {
                this.newDepartmentData.organization = legalEntity
                this.dialog = true
            })
        }
    }
</script>

<style scoped>

</style>