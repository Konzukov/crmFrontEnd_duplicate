<template>
    <div :class="[isActive ? '' : 'mr-2 not-active', 'create-window']">
        <v-btn
                large
                absolute
                class="toggleBtn"
                @click="showCreateWindow()"
        >
            <v-icon>mdi-plus</v-icon>
        </v-btn>
        <transition name="create-window"
                    enter-active-class="animated fadeInRight"
        >
            <div v-if="isActive">
                <v-card full-width>
                    <v-form class="ml-6">
                        <v-row justify="start">
                            <v-col md="4">
                                <v-text-field
                                        outlined
                                        label="Дата создания *"
                                        v-model="form.date"
                                        type="datetime-local"
                                ></v-text-field>
                            </v-col>
                            <v-col md="7">
                                <v-text-field
                                        outlined
                                        label="Название *"
                                        v-model="form.name"
                                >
                                </v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col md="4">
                                <v-col md="12">
                                    <v-autocomplete
                                            outlined
                                            label="Проект"
                                            :items="projectList"
                                            v-model="form.project"
                                            append-outer-icon="mdi-plus"
                                            item-text="name"
                                            clearable
                                            multiple
                                            chips
                                            return-object
                                    ></v-autocomplete>
                                </v-col>
                                <v-col md="11">
                                    <v-select
                                            outlined
                                            label="Категория события *"
                                            :items="eventCategory"
                                            v-model="form.category"
                                            clearable
                                            item-value="pk"
                                            item-text="name"
                                            return-object
                                            @change="categoryType"
                                    ></v-select>
                                </v-col>
                            </v-col>
                            <v-col md="7">
                                <v-textarea
                                        outlined
                                        label="Описание"
                                        v-model="form.description"
                                >
                                </v-textarea>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card>
            </div>
        </transition>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'

    export default {
        name: "RightCreateWindow",
        props: {
            task: {
                type: Boolean,
                default: false,
            },
            event: {
                type: Boolean,
                default: false,
            },
            formFields: {
                type: Object
            },
            projectList: {
                type: Array,
                default: new Array()
            }
        },
        data() {
            return {
                isActive: false,
                form: {},
            }
        },
        computed: {
            ...mapGetters({
                taskList: 'taskListData',
                eventCategory: 'eventCategoryListData'
                // ...
            }),
        },
        methods: {
            showCreateWindow() {
                this.isActive = !this.isActive
            },
            categoryType() {
                this.$emit('changeCategoryType')
            },
        },
        created() {
            this.$store.dispatch('getEventCategory')
        }

    }
</script>

<style scoped>

    @media screen and (max-width: 1024px) {
        div.main div.filter-component {
            min-width: 100%;
            max-width: 100%;
        }
    }

    div.create-window {
        position: relative;
        flex-grow: 3;
        max-width: 70%;
        width: 70%;

    }

    div.create-window.not-active {
        max-width: 0;
    }

    div.create-window button.toggleBtn {
        position: absolute;
        z-index: 9999;
        height: 44px;
        min-width: 44px;
        width: 44px;
        right: 8px;
    }
</style>