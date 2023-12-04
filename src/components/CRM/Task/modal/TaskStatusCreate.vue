<template>
    <v-overlay v-if="dialog">
        <v-dialog v-model="dialog" max-width="650" class="task-status" persistent>
            <v-card>
                <v-container>
                    <v-row justify="center">
                        <v-card-title>Направления</v-card-title>
                    </v-row>
                    <v-row justify="center">
                        <v-card-text>
                            <v-form>
                                <v-row justify="center">
                                    <v-col md="10" sm="10">
                                        <v-text-field
                                                outlined
                                                label="Направление"
                                                v-model="form.name"
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-form>
                        </v-card-text>
                    </v-row>
                    <v-row justify="center">
                        <v-card-actions>
                            <v-col md="6" sm="6">
                                <v-btn class="pl-3 pr-3" color="error" @click="dialog=false">Отмена</v-btn>
                            </v-col>
                            <v-col md="6" sm="6">
                                <v-btn class="pl-3 pr-3" color="success" @click="save">Сохранить</v-btn>
                            </v-col>
                        </v-card-actions>
                    </v-row>
                </v-container>
            </v-card>
        </v-dialog>
    </v-overlay>
</template>

<script>
    import {eventBus} from "../../../../bus";

    export default {
        name: "TaskStatus",
        data() {
            return {
                dialog: false,
                form: {
                    name: ''
                }
            }
        },
        methods: {
            save() {

            }
        },
        created() {
            eventBus.$on('newTaskStatus', () => {
                this.dialog = true
            })
        }
    }
</script>

<style scoped>
    >>>.task-status {
        z-index: 9999999999;
    }
</style>