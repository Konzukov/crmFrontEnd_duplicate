<template>
    <v-dialog persistent v-model="dialog" max-width="700px">
        <v-card>
            <v-card-title>
                <span class="headline">Добавление сотрудника</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-form
                            lazy-validation
                            ref="editStaff"
                            v-model="valid"
                    >
                        <v-row justify="center">
                            <v-col cols="12">
                                <v-select
                                        v-model="formData.organization"
                                        :items="legalEntity"
                                        item-value="pk"
                                        item-text="name"
                                        label="Организация"
                                        id="organization"
                                        outlined
                                        disabled
                                ></v-select>
                            </v-col>
                            <v-col cols="12">
                                <v-select
                                        v-model="formData.staff"
                                        :items="physicalPerson.data"
                                        item-value="pk"
                                        label="Физические лица"
                                        id="staff"
                                        outlined
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
                            <v-col cols="12" md="6" sm="12">
                                <v-autocomplete
                                        v-model="formData.department"
                                        :items="departmentList.data"
                                        id="department"
                                        item-value="pk"
                                        item-text="name"
                                        label="Отдел"
                                        return-object
                                        outlined
                                >
                                </v-autocomplete>
                            </v-col>
                            <v-col cols="12" md="6" sm="12">
                                <v-autocomplete
                                        v-model="formData.position"
                                        :items="positionList"
                                        item-value="pk"
                                        item-text="name"
                                        label="Должность"
                                        id="position"
                                        return-object
                                        outlined
                                        append-outer-icon="mdi-plus"
                                        @click:append-outer="newPosition(formData.department)"
                                >
                                </v-autocomplete>
                            </v-col>
                        </v-row>
                        <v-row justify="center">
                            <v-col cols="12" md="6" sm="12">
                                <v-text-field
                                        v-model="formData.acceptance_date"
                                        id="acceptance_date"
                                        label="Дата приема"
                                        outlined
                                        type="date"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6" sm="12">
                                <v-text-field
                                        v-model="formData.termination_date"
                                        id="termination_date"
                                        label="Дата увольнения"
                                        outlined
                                        type="date"
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
                       @click="dialog = false">Отмена
                </v-btn>
                <v-btn color="success darken-1"
                       class="mr-4"
                       @click="updateStaff()"
                >Сохранить
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import moment from 'moment'

    export default {
        name: "StaffEdit",
        props: [''],
        data() {
            return {
                dialog: false,
                valid: true,
                staffPk: '',
                formData: {
                    organization: '',
                    staff: '',
                    position: '',
                    department: '',
                    acceptance_date: '',
                    termination_date: ''
                }
            }
        },
        computed: {
            legalEntity() {
                return new Array(this.formData.organization)
            },
            physicalPerson() {
                return this.$store.getters.physicalPersonData
            },
            departmentList() {
                return this.$store.getters.departmentData
            },
            positionList() {
                return this.$store.getters.positionData
            },
        },
        methods: {
            newPosition(department) {
                this.$emit('positionCreate', department)
            },
            updateStaff() {
                let formData = new FormData()
                this.$refs.editStaff.inputs.filter(obj => {
                    if (typeof obj.value == 'object' && obj.value !== null) {
                        formData.set(obj.id, obj.value.pk)
                    } else if (obj.value !== null && obj.value !== '') {
                        formData.set(obj.id, moment(obj.value).format('YYYY-MM-DD'))
                    }
                })
                this.$store.dispatch('editStaff', {
                    'formData': formData,
                    'staffPk': this.staffPk,
                    'legalEntityPk': this.formData.organization.pk
                }).then(() => {
                    Object.keys(this.formData).forEach(key => {
                        this.formData[key] = ''
                    })
                    this.dialog = false
                })
            }
        },
        created() {
            this.$parent.$on('editStaff', (staff, organization) => {
                this.$store.dispatch('getDepartment', organization).then(() => {
                    this.$store.dispatch('getPositionByDepartment', staff.department)
                    this.$store.dispatch('getPhysicalPerson')
                })
                this.staffPk = staff.pk
                this.formData.organization = organization
                this.formData.staff = staff.staff
                this.formData.position = staff.position
                this.formData.department = staff.department
                this.formData.acceptance_date = staff.acceptance_date
                this.formData.termination_date = staff.termination_date
                this.dialog = true
            })
        }
    }
</script>

<style scoped>

</style>