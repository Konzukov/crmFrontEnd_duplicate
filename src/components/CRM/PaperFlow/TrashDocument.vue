<template>
    <v-container fluid>
        <v-data-table
                :headers="headers"
                :items="trashDocumentList"
                :page.sync="page"
                :laoding="loading"
                :items-per-page="15"
                hide-default-footer
                class="elevation-1"
                height="75vh"
                @page-count="pageCount = $event"
        >
            <template v-slot:item.actions="{ item }">
                <v-icon class="mr-2" color="primary" @click="restoreDocument(item)">mdi-backup-restore</v-icon>
                <v-icon color="error" @click="deleteDocument(item)">mdi-delete</v-icon>
            </template>
        </v-data-table>
        <div class="text-center pt-2">
            <v-pagination v-model="page" :length="pageCount" :total-visible="7"></v-pagination>
        </div>
    </v-container>
</template>

<script>
    export default {
        name: "TrashDocument",
        data() {
            return {
                loading: true,
                page: 1,
                pageCount: 0,
                headers: [
                    {text: 'Документ', value: 'doc.fileName'},
                    {text: 'Дата удаления', value: 'deleted_date'},
                    {text: 'Удалил', value: 'user.fullName'},
                    {text: 'Проект', value: 'doc.project.name'},
                    {text: 'Причина удаления', value: 'reason'},
                    {text: 'Действия', value: 'actions'},
                ]
            }
        },
        methods: {
            restoreDocument(item) {
                this.$store.dispatch('restoreDocument', item.pk)
            },
            deleteDocument(item){
                this.$store.dispatch('delTrashDocument', item.pk)
            }
        },
        computed: {
            trashDocumentList: {
                get() {
                    if (!this.loading) {
                        return this.$store.getters.trashDocumentListData
                    }
                    return new Array()
                }
            }
        },
        created() {
            this.$store.dispatch('getTrashDocument').then(() => {
                this.loading = false
            })
        }
    }
</script>

<style scoped>

</style>