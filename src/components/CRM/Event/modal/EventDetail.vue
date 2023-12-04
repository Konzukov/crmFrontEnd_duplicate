    <template>
    <v-dialog v-model="eventSelected">
        <v-menu
                :close-on-content-click="false"

        >
            <v-card
                    color="grey lighten-4"
                    min-width="350px"
                    flat
            >
                <v-toolbar
                        :color="selectedEvent.color"
                        dark
                >
                    <v-btn icon>
                        <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon>
                        <v-icon>mdi-heart</v-icon>
                    </v-btn>
                    <v-btn icon>
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text>
                    <span v-html="selectedEvent.details"></span>
                </v-card-text>
                <v-card-actions>
                    <v-btn
                            text
                            color="secondary"
                            @click="selectedOpen = false"
                    >
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-menu>
    </v-dialog>

</template>

<script>
    export default {
        name: "EventDetail",
        data() {
            return {
                eventSelected: false,
                selectedEvent: {},
                selectedElement: null,
            }
        },
        methods: {},
        created() {
            this.$parent.$on('showEventDetail', ({ nativeEvent, event }) => {
                this.eventSelected = true
                this.selectedEvent = event
                this.selectedElement = nativeEvent.target
            })
        }


    }
</script>

<style scoped>

</style>