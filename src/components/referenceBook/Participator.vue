<template>
    <v-container>
        <v-row justify="center">
            <v-col md="3" sm="3">
                <v-row justify="start">
                    <v-col md="2" sm="2">
                        <v-btn icon @click="display = 'card'">
                            <v-icon>mdi-card-account-details</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col md="2" sm="2">
                        <v-btn icon @click="display = 'list'">
                            <v-icon>mdi-view-list</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-col>
            <v-col md="9" sm="9">
                <v-btn color="primary" @click="addParticipator()">Добавить участника</v-btn>
            </v-col>

        </v-row>
        <v-main v-if="display === 'card'">
            <v-row justify="center">
                <v-col cols="12" md="6" sm="12" v-for="(participator, id) in participatorList" :key="id">
                    <v-card min-height="350">
                        <v-card-title>{{participator.participator.fullName}}</v-card-title>
                        <v-card-subtitle>{{participator.participator | regData}}</v-card-subtitle>
                        <v-list>
                            <v-list-item>
                                <v-list-item-content>Сотрудники</v-list-item-content>
                                <v-list-item-avatar> - -</v-list-item-avatar>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-content>Контракты</v-list-item-content>
                                <v-list-item-avatar> - -</v-list-item-avatar>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-content>Задачи</v-list-item-content>
                                <v-list-item-avatar> - -</v-list-item-avatar>
                            </v-list-item>
                        </v-list>
                        <v-container>
                            <v-row justify="center" align="end">
                                <v-card-actions>
                                    <v-btn
                                            color="success"
                                            :to="{name: 'participatorDetail', params: {pk: participator.pk}}"
                                    >Подробно
                                    </v-btn>
                                </v-card-actions>
                            </v-row>
                        </v-container>
                    </v-card>
                </v-col>
            </v-row>
        </v-main>
        <v-main v-else>
            <v-data-table
            :items="participatorList"
            :headers="headers"></v-data-table>
        </v-main>
        <ParticipatorCreate></ParticipatorCreate>
    </v-container>
</template>

<script>
    import ParticipatorCreate from "../modalWindows/crm/ParticipatorCreate";

    export default {
        name: "Participator",
        data() {
            return {
                display: 'list',
                headers: [
                    {text: 'ID', value: 'participator.pk'},
                    {text: 'Участник', value: 'participator.fullName'},
                ]
            }
        },
        computed: {
            participatorList: {
                get(){
                    if(this.$store.getters.participatorList){
                        return this.$store.getters.participatorList
                    }
                    return new Array()
                }
            }
        },
        methods: {
            addParticipator() {
                this.$emit('addParticipator')
            }
        },
        filters: {
            participatorName(obj) {
                if ('name' in obj) {
                    return obj.name
                } else {
                    return `${obj.first_name} ${obj.last_name}`
                }
            },
            regData(obj) {
                if ('inn' && 'kpp' in obj) {
                    return `ИНН: ${obj.inn} / КПП: ${obj.kpp} `
                }
            }
        },
        created() {
            this.$store.dispatch('getParticipator')
        },
        components: {
            ParticipatorCreate
        },
    }
</script>

<style scoped>

</style>