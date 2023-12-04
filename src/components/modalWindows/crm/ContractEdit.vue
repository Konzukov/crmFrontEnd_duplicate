<template>
    <v-dialog v-model="dialog" max-width="700px" persistent transition="slide-x-reverse-transition">
        <template v-slot:activator="{ on }" v-if="this.$route.name === 'contract'">
            <v-btn color="primary" dark class="mb-2" v-on="on">Новый контракт</v-btn>
        </template>
        <v-card>
            <v-row justify="center" class="pb-5">
                <v-card-actions>
                    <v-btn color="error darken-1" @click="close">Отмена</v-btn>
                    <v-btn color="success darken-1" @click="save">Сохранить</v-btn>
                </v-card-actions>
            </v-row>
        </v-card>
    </v-dialog>
</template>

<script>

    export default {
        name: "ContractEdit",
        data() {
            return {
                dialog: false,
                legalEntity: '',
                direction: '',
                contract: {
                    pk: '',
                    number: '',
                    participator: '',
                    contractor: '',
                    direction: '',
                    date_from: '',
                    date_to: '',
                }
            }
        },
        computed: {},
        methods: {
            getDirection(pk) {
                this.$store.dispatch('getDirectionsParticipantList', pk)
            },
            close() {
                this.dialog = false
            },
            save(pk) {

            }
        },
        filters: {},
        created() {
            this.$parent.$on('editContract', (contract) => {
                Object.keys(this.contract).forEach(key=>{
                    if(typeof contract[key]==='object' && contract[key]){
                       this.contract[key] = contract[key]['pk']
                    }else{
                        this.contract[key] = contract[key]
                    }
                })
                this.dialog = true
            })
        }
    }
</script>

<style scoped>

</style>