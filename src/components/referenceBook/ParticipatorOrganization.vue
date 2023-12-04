<template>
    <v-container fluid>
        <v-row class="mb-4">
            <v-btn fab color="success" @click="$router.go(-1)">
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
        </v-row>
        <v-card>
            <v-card-title></v-card-title>
            <v-card-text>
                <v-form>
                    <v-row>
                        <v-col cols="10" md="12">
                            <v-text-field
                                    v-model="participatorOrganizationDetail['full_name']"
                                    label="Полное наименование"
                                    outlined
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="10" md="12">
                            <v-text-field
                                    v-model="participatorOrganizationDetail['inn']"
                                    label="ИНН"
                                    append-outer-icon="mdi-check-outline"
                                    outlined
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="6" md="6" sm="12">
                            <v-text-field
                                    v-model="participatorOrganizationDetail['kpp']"
                                    label="КПП"
                                    outlined
                            ></v-text-field>
                        </v-col>
                        <v-col cols="6" md="6" sm="12">
                            <v-text-field
                                    v-model="participatorOrganizationDetail['ogrn']"
                                    label="ОГРН"
                                    outlined
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col md="6" sm="12">
                            <v-select
                                    v-model="participatorOrganizationDetail.country"
                                    label="Страна"
                                    outlined
                            >
                            </v-select>
                        </v-col>
                        <v-col md="6" sm="12">
                            <v-text-field
                                    v-model="participatorOrganizationDetail.legal_address"
                                    label="Юридический адрес"
                                    outlined
                            >
                            </v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="6" md="6" sm="12">
                            <v-text-field
                                    prepend-icon="mdi-calendar"
                                    type="date"
                                    label="Дата регистрации"
                                    v-model="participatorOrganizationDetail.registration_date"
                                    id="date_from"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="6" md="6" sm="12">
                            <v-text-field
                                    prepend-icon="mdi-calendar"
                                    type="date"
                                    id="date_from"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>

        </v-card>
    </v-container>
</template>

<script>
    export default {
        name: "ParticipatorOrganization",
        computed: {
            participatorOrganizationDetail() {
                return this.$store.getters.legalEntityDetailData
            }
        },
        created() {
            this.$store.dispatch('getLegalEntityDetailInfo', this.$route.params.pk)
        }
    }
</script>

<style scoped>

</style>