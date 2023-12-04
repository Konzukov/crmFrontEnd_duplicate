<template>
    <v-container fluid>
        <v-dialog persistent v-model="dialog" max-width="700px">
            <v-card>
                <v-card-title>
                    <span class="headline">Добавление сотрудника</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-form
                                lazy-validation
                                ref="addStaff"
                                v-model="valid"
                        >
                            <v-row justify="center">
                                <v-col cols="12">
                                    <v-select
                                            v-model="formData.organization"
                                            :items="curLegalEntity"
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
                                            :items="physicalPersonList.data"
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
                                            append-outer-icon="mdi-plus"
                                            item-value="pk"
                                            item-text="name"
                                            label="Отдел"
                                            return-object
                                            ref="department"
                                            @change="getPositionList(formData.department)"
                                            @click:append-outer="newDepartment(formData.organization)"
                                            outlined
                                    >
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="12" md="6" sm="12">
                                    <v-autocomplete
                                            :disabled="!formData.department"
                                            v-model="formData.position"
                                            :items="positionList"
                                            item-value="pk"
                                            item-text="name"
                                            label="Должность"
                                            id="position"
                                            return-object
                                            append-outer-icon="mdi-plus"
                                            @click:append-outer="newPosition(formData.department)"
                                            outlined
                                    ></v-autocomplete>
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
                           :disabled="!valid" class="mr-4"
                           @click="addStaff()"
                    >Сохранить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <DepartmentCreate></DepartmentCreate>
        <PositionCreate></PositionCreate>
    </v-container>
</template>

<script>
    import moment from 'moment'
    import DepartmentCreate from '../modalWindows/DepartmentCreate'
    import PositionCreate from '../modalWindows/PositionCreate'

    export default {
        name: "StaffCreate",
        data() {
            return {
                dialog: false,
                valid: true,
                formData: {
                    organization: '',
                    staff: '',
                    department: '',
                    position: '',
                    acceptance_date: '',
                    termination_date: ''
                },
            }
        },
        computed: {
            curLegalEntity() {
                return new Array(this.formData.organization)
            },
            physicalPersonList() {
                return this.$store.getters.physicalPersonData
            },
            departmentList() {
                return this.$store.getters.departmentData
            },
            positionList() {
                return this.$store.getters.positionData
            }
        },
        watch: {
            "departmentList.data.length"(val, oldVal) {
                if (val > oldVal) {
                    this.formData.department = this.departmentList.data[this.departmentList.data.length - 1]['pk']
                    this.getPositionList(this.departmentList.data[this.departmentList.data.length - 1])
                    this.$refs.department.selectItem(this.departmentList.data[this.departmentList.data.length - 1])

                }
            },
            "positionList.length"(val, oldVal) {
                if (val > oldVal) {
                    this.formData.position = this.positionList[this.positionList.length - 1]['pk']
                }
            }
        },
        methods: {
            addStaff() {
                let formData = new FormData()
                Object.keys(this.formData).forEach(key => {
                    if (typeof this.formData[key] === 'object' && this.formData[key] !== null) {
                        formData.set(key, this.formData[key]['pk'])
                    } else if (key === 'acceptance_date' || key === 'termination_date') {
                        if (this.formData[key] !== '') {
                            formData.set(key, moment(this.formData[key]).format('YYYY-MM-DD'))
                        }
                    } else {
                        formData.set(key, this.formData[key])
                    }
                })
                this.$store.dispatch('createStaff', {
                    'data': formData,
                    'legalEntity': this.formData.organization.pk
                }).then(() => {
                    Object.keys(this.formData).forEach(key => {
                        this.formData[key] = ''
                    })
                    this.dialog = false
                })
            },
            newDepartment(organization) {
                this.$emit('departmentCreate', organization)
            },
            newPosition(department) {
                this.$emit('positionCreate', department)
            },
            getPositionList(department) {
                this.$store.dispatch('getPositionByDepartment', department)
            }
        },
        created() {
            this.$parent.$on('addStaff', (legalEntity) => {
                this.dialog = true
                this.formData.organization = legalEntity
                this.$store.dispatch('getDepartment', legalEntity).then(() => {
                    console.log('Loading complete')
                })
            })
        },
        components: {
            DepartmentCreate,
            PositionCreate
        },
    }
</script>

<style scoped>

</style>