<template>
    <v-dialog v-model="dialog" width="650">
        <v-card>
            <v-container>
                <v-row justify="center">
                    <v-card-title>Добавление должности</v-card-title>
                </v-row>
                <v-card-text>
                    <v-form ref="departmentCreate">
                        <v-row justify="center">
                            <v-col md="8" sm="10">
                                <v-text-field
                                        outlined
                                        disabled
                                        label="Отдел"
                                        v-model="positionData.department.name"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row justify="center">
                            <v-col md="8" sm="10">
                                <v-text-field
                                        outlined
                                        label="Должность"
                                        v-model="positionData.name"
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
        name: "PositionCreate",
        data() {
            return {
                dialog: false,
                positionData: {
                    department: '',
                    name: '',
                }
            }
        },
        methods: {
            close() {
                this.dialog = false
            },
            save() {
                let formData = new FormData()
                formData.set('name', this.positionData.name)
                formData.set('department', this.positionData.department.pk)
                this.$store.dispatch('createPosition', formData).then(() => {
                    this.dialog = false
                    this.positionData.name = ''
                })
            }
        },
        created() {
            this.$parent.$on('positionCreate', (department) => {
                console.log(department)
                this.positionData.department = department
                this.dialog = true
            })
        }
    }
</script>

<style scoped>

</style>