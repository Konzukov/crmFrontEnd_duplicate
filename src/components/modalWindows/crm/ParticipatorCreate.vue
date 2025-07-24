<template>
    <v-dialog v-model="dialog" width="600" persistent>
        <v-card>
            <v-container>
                <v-row>
                    <v-card-title>
                        <span class="head-line">Добавление участника</span>
                    </v-card-title>
                </v-row>
                <v-form ref="form" lazy-validation v-model="valid">
                    <v-row justify="center">
                        <v-col md="120" sm="10">
                            <v-select
                                    @change="getList()"
                                    v-model="participator.type"
                                    :items="participator.items"
                                    item-text="name"
                            ></v-select>
                        </v-col>
                    </v-row>
                    <v-row justify="center">
                        <v-col md="10" sm="12">
                            <v-select v-if="participator.type === 'Физ. лицо'"
                                      v-model="participator.selected"
                                      :items="pickList.data"
                                      @change="resetValidation"
                                      item-text="name"
                                      item-value="pk"
                                      return-object
                                      :error-messages="errors.participator"
                            >
                                <template slot="selection" slot-scope="data">
                                    {{ data.item.last_name}} {{ data.item.first_name}}
                                </template>
                                <template slot="item" slot-scope="data">
                                    {{ data.item.last_name}} {{ data.item.first_name}}
                                </template>
                            </v-select>
                            <v-select v-else
                                      v-model="participator.selected"
                                      :items="pickList.data"
                                      @change="resetValidation"
                                      item-text="name"
                                      item-value="pk"
                                      return-object
                                      :error-messages="errors.participator"
                            ></v-select>
                        </v-col>
                    </v-row>
                </v-form>
                <v-card-actions>
                    <v-row>
                        <v-col cols="12" md="4" sm="6">
                            <v-btn text color="error" @click="dialog = false">Закрыть</v-btn>
                        </v-col>
                        <v-col cols="12" md="4" sm="6">
                            <v-btn text color="success" @click="addParticipator()">Добавить</v-btn>
                        </v-col>
                    </v-row>
                </v-card-actions>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        name: "ParticipatorCreate",
        data() {
            return {
                valid: true,
                participator: {
                    type: '',
                    items: [
                        {name: 'Физ. лицо'},
                        {name: 'Юр.лицо'}
                    ],
                    selected: ''
                },
                errors: {
                    type: '',
                    participator: ''
                },
                pickList: '',
                dialog: false
            }
        },
        methods: {
            addParticipator() {
                let formData = new FormData()
                console.log(this.participator.selected)
                if (this.participator.type === 'Физ. лицо') {
                    formData.set('physical_person', this.participator.selected.pk)
                } else {
                    formData.set('legal_entity', this.participator.selected.pk)
                }
                this.$store.dispatch('createParticipator', formData).catch(err => {
                    if (this.participator.type === 'Физ. лицо') {
                        this.errors.participator = err.response.data.errors.physical_person
                    } else {
                        this.errors.participator = err.response.data.errors.legal_entity
                    }

                })
            },
            getList() {
                if (this.participator.type === 'Физ. лицо') {
                    this.$store.dispatch('fetchPhysicalPersons').then(() => {
                        this.pickList = this.$store.getters.physicalPersonData
                    })
                    this.pickList = this.$store.getters.physicalPersonData
                } else {
                    this.$store.dispatch('getLegalEntity').then(() => {
                        this.pickList = this.$store.getters.legalEntityData
                    })

                }
            },
            resetValidation(){
                this.errors.participator = ''
            }
        },
        computed: {},
        created() {
            this.$store.dispatch('fetchPhysicalPersons')
            this.$store.dispatch('getLegalEntity')
            this.$parent.$on('addParticipator', () => {
                this.dialog = true
            })
        }
    }
</script>

<style scoped>

</style>