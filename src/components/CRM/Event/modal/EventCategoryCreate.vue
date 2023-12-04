<template>
    <v-dialog v-model="dialog" width="500">
        <v-container>

            <v-card>
                <v-row justify="center">
                    <v-card-title>Новая категория события</v-card-title>
                </v-row>
                <v-row justify="center">
                    <v-card-text>

                    </v-card-text>
                </v-row>
                <v-row justify="center">
                    <v-card-actions>
                        <v-btn @click="close">Закрыть</v-btn>
                        <v-btn>Сохранить</v-btn>
                    </v-card-actions>
                </v-row>

            </v-card>

        </v-container>
    </v-dialog>
</template>

<script>
    export default {
        name: "EventCategoryCreate",
        data() {
            return {
                dialog: false,
            }
        },
        methods: {
            close() {
                this.$refs.newEventCategory.reset()
                this.dialog = false
            }
        },


        created() {
            this.$parent.$on('newEventCategory', ()=>{
                this.dialog = true
            })
        }
    }
</script>

<style scoped>

</style>