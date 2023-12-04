<template>
    <v-dialog v-model="dialog" width="400">
        <v-card>
            <v-card-title>
                <p class="text--black">Действительно удалить</p>
                <span class="text--primary text--darken-3">"{{item.name}}"?</span>
            </v-card-title>
            <v-row justify="center">
                <v-card-actions>
                    <v-btn @click="delItem()" color="error darken-3">Удалить</v-btn>
                    <v-btn @click="cancel()" color="primary darken-4">отмена</v-btn>
                </v-card-actions>
            </v-row>

        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        name: "ConfirmDelete",
        data() {
            return {
                dialog: false,
                item: {}
            }
        },
        methods: {
            delItem() {
                this.$emit('delItem', this.item)
                this.cancel()
            },
            cancel() {
                this.dialog = false
            },

        },
        created() {
            this.$parent.$on('confirmDelete', item => {
                this.item = Object.assign({}, item)
                this.dialog = true
            })
        }
    }
</script>

<style scoped>
.v-card{
    overflow: hidden;
}
</style>