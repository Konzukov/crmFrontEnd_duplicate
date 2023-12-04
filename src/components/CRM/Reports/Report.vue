<template>
    <v-container fluid>
        <v-tabs center-active
                background-color="primary"
                dark>
            <v-tab :to="{name: 'project-report'}">
                <v-icon class="mr-2"></v-icon>
                <span>Проекты</span>
            </v-tab>
            <v-tab :to="{name: 'user-report'}">
                <v-icon class="mr-2"></v-icon>
                <span>Пользователи</span>
            </v-tab>
        </v-tabs>
        <router-view></router-view>
    </v-container>
</template>

<script>

    export default {
        name: "Report",
    }
</script>

<style scoped>
    i.doc-icon {
        margin: 0 45px;
    }

    .activeDisplay {
        color: green;
    }

    .routeIcon {
        color: #30b21d;
    }

    tr.event-list td {
        border-color: #0D47A1 !important;
        border-top: 2px solid;
        border-bottom: 2px solid;
    }

    tr.event-list td:first-child {
        border-color: #0D47A1 !important;
        border-left: 2px solid;
    }

    tr.event-list td:last-child {
        border-color: #0D47A1 !important;
        border-right: 2px solid;
    }

    tr.task-list td {
        border-color: #B71C1C !important;
        border-top: 2px solid;
        border-bottom: 2px solid;
    }

    tr.task-list td:first-child {
        border-color: #B71C1C !important;
        border-left: 2px solid;
    }

    tr.task-list td:last-child {
        border-color: #B71C1C !important;
        border-right: 2px solid;
    }

    tr.doc-list td {
        border-color: #FFB74D !important;
        border-top: 2px solid;
        border-bottom: 2px solid;
    }

    tr.doc-list td:first-child {
        border-color: #FFB74D !important;
        border-left: 2px solid;
    }

    tr.doc-list td:last-child {
        border-color: #FFB74D !important;
        border-right: 2px solid;
    }
</style>