<template>
    <v-container>
        <v-btn class="mx-2" fab dark absolute right color="green" @click="periodicalTaskCreate">
            <v-icon dark>mdi-plus</v-icon>
        </v-btn>
        <v-simple-table
                expanded>
            <template v-slot:default>
                <thead>
                <tr>
                    <th class="text-center">№</th>
                    <th class="text-center">Название</th>
                    <th class="text-center">Следующее создание
                        <v-icon>mdi-calendar</v-icon>
                    </th>
                    <th class="text-center">Последнее создание
                        <v-icon>mdi-calendar</v-icon>
                    </th>
                    <th></th>
                    <th></th>

                </tr>
                </thead>
                <tbody>
                <tr v-for="item in periodicalTaskListData" :key="item.name">
                    <td class="text-center">
                        <v-chip>{{ item.pk }}</v-chip>
                    </td>
                    <td class="text-center">{{ item.name }}</td>
                    <td class="text-center">{{ item.next_create || '--'}}</td>
                    <td class="text-center">{{ item.last_create || '--'}}</td>
                    <td class="text-center">
                        <v-btn color="success darken-4" @click="editPeriodicalTask(item)">
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>

                    </td>
                    <td class="text-center">
                        <v-btn color="error  darken-4" @click="delPeriodiccalTask(item)">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </td>
                </tr>
                </tbody>
            </template>
        </v-simple-table>
        <PeriodicalTaskCreate></PeriodicalTaskCreate>
        <ConfirmDelete @delItem="del"></ConfirmDelete>
        <v-btn color="success" @click="runTask()">Запустить</v-btn>
    </v-container>
</template>

<script>
    import PeriodicalTaskCreate from "./modal/PeriodicalTaskCreate";
    import {mapGetters, mapActions} from 'vuex';
    import ConfirmDelete from "./modal/ConfirmDelete";
    import customConst from "../../../const/customConst";
    import axios from 'axios'
    export default {
        name: "PeriodicalTask",
        methods: {
            periodicalTaskCreate() {
                this.$emit('createPeriodicalTask')
            },
            ...mapActions([
                'getPeriodicalTask',
                'deletePeriodicalTask'
            ]),
            editPeriodicalTask(item) {
                this.$emit('editPeriodicalTask', {item, 'type': 'edit'})
            },
            delPeriodiccalTask(item) {
                this.$emit('confirmDelete', item)
            },
            del(item) {
                this.deletePeriodicalTask(item.pk)
            },
            runTask(){
                axios({
                    method: "GET",
                    url: customConst.CRM_API + 'run-periodical-task'
                }).then(res=>{
                    console.log(res)
                }).catch(err=>{
                    console.error(err)
                })
            }
        },
        computed: {
            ...mapGetters([
                'periodicalTaskListData'
            ])
        },
        created() {
            this.getPeriodicalTask()
        },
        components: {
            PeriodicalTaskCreate,
            ConfirmDelete
        }
    }
</script>

<style scoped>

</style>