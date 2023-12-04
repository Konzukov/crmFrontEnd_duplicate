<template>
    <v-container>
        <v-row class="mb-4">
            <v-btn fab color="success" @click="$router.go(-1)">
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
        </v-row>
        <v-row justify="center">
            <v-col cols="12" md="4" sm="12" v-for="(staffs, pk) in participatorStaffs" :key="pk">
                <v-card>
                    <v-card-title>
                        <v-row align="baseline">
                            <v-col md="8" justify-self="start">
                                <span class="font-weight-bold">
                                </span>
                                {{staffs.staff | staffFullName}}
                            </v-col>
                            <v-spacer></v-spacer>
                            <v-col md="4" justify-self="end">
                                <v-avatar color="indigo"></v-avatar>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <span class="font-weight-bold">
                                    Отдел: {{staffs.department | hasDepPos}}
                                </span>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <span class="font-weight-bold">
                                    Должность: {{staffs.position | hasDepPos}}
                                </span>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                Дата приема: {{staffs.acceptance_date}}
                            </v-col>
                            <v-col cols="12">
                                Дата увольнения: {{staffs.termination_date || '-'}}
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-row justify="center">
                            <v-btn color=primary>
                                Данные сотрудника
                            </v-btn>
                        </v-row>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>

    import filter from "../../mixin/filter";

    export default {
        name: "ParticipatorStaffList",
        computed: {
            participatorStaffs() {
                return this.$store.getters.organizationStaffData
            }
        },
        mixins:[filter],
        created() {
            this.$store.dispatch('getOrganizationStaff', this.$route.params['pk'])
        }
    }
</script>

<style scoped>

</style>