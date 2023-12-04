<template>
    <v-container fluid>
        <v-card>
            <v-data-table
                    :loading="loading" loading-text="Loading... Please wait"
                    :headers="headers"
                    :items="directionsList"
                    class="elevation-1"
            >
                <template v-slot:top>
                    <v-toolbar flat color="white">
                        <v-toolbar-title>Направления</v-toolbar-title>
                        <v-divider
                                class="mx-4"
                                inset
                                vertical
                        ></v-divider>
                        <v-spacer></v-spacer>
                        <v-btn text @click="addDirection">Добавить направление</v-btn>
                    </v-toolbar>
                </template>
                <template v-slot:item.participant.participator="{item}">
                    <tr>
                        <td v-if="item.participant.participator.name">
                            {{item.participant.participator.name}}
                        </td>
                        <td v-else>
                            {{item.participant.participator.last_name}} {{item.participant.participator.first_name}}
                        </td>
                    </tr>
                </template>
                <template v-slot:item.responsible="{ item }">
                    <tr>
                        <td v-if="item.responsible">
                            {{item.responsible.last_name}} {{item.responsible.first_name}}
                        </td>
                        <td v-else>
                            -
                        </td>
                    </tr>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-icon color="error"
                            small
                            class="mr-2"
                            @click="editDirections(item)"
                    >
                        mdi-pencil
                    </v-icon>
                    <v-icon
                            color="primary"
                            small
                            @click="deleteDirections(item)"
                    >
                        mdi-delete
                    </v-icon>
                </template>
            </v-data-table>
        </v-card>
        <DirectionCreate edit="true"></DirectionCreate>
    </v-container>
</template>

<script>
    import DirectionCreate from "../modalWindows/crm/DirectionCreate";

    export default {
        name: "Directions",
        data() {
            return {
                loading: true,
                headers: [
                    {text: 'Участник', align: 'start', value: 'participant.participator'},
                    {text: 'Направление', value: 'direction.name'},
                    {text: 'Отвественный', value: 'responsible'},
                    {text: 'Actions', value: 'actions', sortable: false},
                ],
            }
        },
        methods: {
            addDirection(){
              this.$emit('newDirection', {'type': 'create'})
            },
            editDirections(item){
                this.$emit('editDirection', {'type': 'edit', 'direction': item})
            },
            deleteDirections(direction) {
                this.$store.dispatch('deleteDirections', direction.attributes)
            }
        },
        filters: {
            participatorDisplayName(obj) {
                if (obj.item.attributes.participator.hasOwnProperty('name')) {
                    return obj.item.attributes.participator['name']
                } else {
                    return `${obj.item.attributes.participator['last_name']} ${obj.item.attributes.participator['first_name']}`
                }
            }
        },
        computed: {
            directionsList: {
                get() {
                    if (this.$store.getters.directionsListData) {
                        return this.$store.getters.directionsListData
                    } else {
                        return new Array()
                    }
                }
            },
        }, watch: {
            directionsList(val) {
                if (val) {
                    this.loading = false
                } else {
                    this.loading = true
                }
            }
        },
        created() {
            this.$store.dispatch('getDirectionsList').then(() => {
                this.$store.dispatch('getParticipator')
            })
        },

        components: {
            DirectionCreate
        }
    }
</script>

<style scoped>

</style>