import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";


Vue.use(VueCookies)


export default {
    state: {
        taskList: [],
        taskStatusList: [],
        taskCategoryList: [],
        userExecutorTaskList: [],
        userAuthorTaskList: [],
        indefiniteTaskList: [],
        taskDetail: '',
        userDashboardTaskList: [],
        userDashboardUserTaskList: [],
        userTaskList: [],
        taskHistory: ''
    },
    mutations: {
        syncTaskList(state, taskList) {
            state.taskList = taskList
        },
        syncTaskDetail(state, task) {
            state.taskDetail = task
        },
        syncDashboardUserTask(state, userTaskList) {
            state.userDashboardTaskList = userTaskList
        },
        syncDashboardUserTaskList(state, userTaskList) {
            state.userDashboardUserTaskList = userTaskList
        },
        syncTaskStatus(state, taskStatusList) {
            state.taskStatusList = taskStatusList
        },
        syncTaskCategory(state, taskCategoryList) {
            state.taskCategoryList = taskCategoryList
        },
        syncUserTaskList(state, taskList) {
            state.userTaskList = taskList
        },
        addTaskStatus(state, newTaskStatus) {
            state.taskStatusList.push(newTaskStatus)
        },
        addNewTask(state, newTask) {
            state.taskList.push(newTask)
        },
        updateTask(state, editedTask) {
            state.taskList = state.taskList.map(obj => {
                if (obj['pk'] === editedTask['pk']) {
                    return editedTask
                }
                return obj
            })
            state.userTaskList = state.userTaskList.map(obj => {
                if (obj['pk'] === editedTask['pk']) {
                    if (obj['executor'] !== editedTask['executor']) {
                        obj = editedTask
                    } else {
                        obj = editedTask
                        return obj
                    }
                } else {
                    return obj
                }
            })
            // state.taskList = state.taskList.filter(obj => obj['pk'] !== editedTask['pk'] && editedTask['status']['name'] === 'Выполнена')
            // state.userDashboardUserTaskList = state.userDashboardUserTaskList.filter(
            //     obj => obj['pk'] !== editedTask['pk'] && editedTask['status']['name'] === 'Выполнена'
            // )
            // state.userTaskList = state.userTaskList.filter(
            //     obj => obj['pk'] !== editedTask['pk'] && editedTask['status']['name'] === 'Выполнена'
            // )
        },
        syncTaskHistory(state, history) {
            state.taskHistory = history
        },
        syncUserExecutorTask(state, taskList) {
            state.userExecutorTaskList = taskList
        },
        syncUserAuthorTask(state, taskList) {
            state.userAuthorTaskList = taskList
        },
        syncIndefiniteTask(state, taskList) {
            state.indefiniteTaskList = taskList
        }
    },
    actions: {
        getTaskList({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.CRM_API + 'task-list'
                }).then(response => {
                    commit('syncTaskList', response.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getDashboardTaskList({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'GET',
                    url: customConst.CRM_API + 'dashboard-task-list'
                }).then(res => {
                    commit('syncDashboardUserTask', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getDashboardUserTaskList({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'GET',
                    url: customConst.CRM_API + 'dashboard-user-task-list'
                }).then(res => {
                    commit('syncDashboardUserTaskList', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getTaskDetail({commit}, pk) {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'GET',
                    url: customConst.CRM_API + 'task-detail/' + pk,
                }).then(res => {
                    commit('syncTaskDetail', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getTaskStatusList({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.CRM_API + 'task-status-list',
                }).then(response => {
                    commit('syncTaskStatus', response.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getTaskCategoryList({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.CRM_API + 'task-category-list',
                }).then(response => {
                    commit('syncTaskCategory', response.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        async getUserTaskList({commit}, {user, project, date, tags}) {
            return await new Promise((resolve, reject) => {
                let tagsList;
                if (tags) {
                    if (tags.length > 0) {
                        tagsList = tags.toString()
                    } else {
                        tagsList = '-1'
                    }
                }
                axios({
                    method: 'GET',
                    url: customConst.CRM_API + 'user-task-list',
                    params: {
                        user: user,
                        project: project,
                        date: date,
                        tags: tagsList
                    }
                }).then((response) => {
                    commit('syncUserTaskList', response.data.data.data)
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        getUserExecutorTask({commit},) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.CRM_API + 'user-executor-task-list'
                }).then((response) => {
                    commit('syncUserExecutorTask', response.data.data.data)
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        getUserAuthorTask({commit},) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.CRM_API + 'user-author-task-list'
                }).then((response) => {
                    commit('syncUserAuthorTask', response.data.data.data)
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        getIndefiniteTask({commit},) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.CRM_API + 'indefinite-task-list'
                }).then((response) => {
                    commit('syncIndefiniteTask', response.data.data.data)
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        createTaskStatus({commit}, formData) {
            axios({
                method: "POST",
                url: customConst.CRM_API + 'task-status-create',
                data: formData
            }).then(response => {
                commit('addTaskStatus', response.data.data.data)
            })
        },
        createTask({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.CRM_API + 'task-create',
                    data: formData
                }).then((response) => {
                    commit('addNewTask', response.data.data.data)
                    resolve(response.data.data.data)
                }).catch((error) => {
                    reject(error)
                })
            })
        },
        editTask({commit}, obj) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.CRM_API + 'task-edit/' + obj.pk,
                    data: obj.formData
                }).then((response) => {
                    commit('updateTask', response.data.data.data)
                    resolve(response.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getTaskHistory({commit}, taskPK) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.CRM_API + 'task-history/' + taskPK
                }).then(res => {
                    commit('syncTaskHistory', res.data.data.data)
                    resolve
                }).catch(err => {
                    reject(err)
                })
            })
        },
        setCloseTaskStatus({commit}, taskPk) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.CRM_API + 'task-close/' + taskPk
                }).then(res => {

                    console.log(res)
                    resolve()
                }).catch(err => {
                    console.log(err)
                    reject()
                })
            })
        },
        sendTaskNotify({commit}, pk) {
            return new Promise((resolve, reject) => {
                axios({
                    url: customConst.CRM_API + `${pk}/send-notify`,
                    method: "GET",
                }).then(res => {
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
    },
    getters: {
        taskListData(state) {
            return state.taskList
        },
        taskDetailData(state) {
            return state.taskDetail
        },
        taskStatusListData(state) {
            return state.taskStatusList
        },
        taskCategoryListData(state) {
            return state.taskCategoryList
        },
        userTaskListData(state) {
            return state.userTaskList
        },
        taskHistoryData(state) {
            return state.taskHistory
        },
        dashboardUserTaskList(state) {
            return state.userDashboardTaskList
        },
        dashboardUserTaskListData(state) {
            return state.userDashboardUserTaskList
        },
        userExecutorTaskListData(state) {
            return state.userExecutorTaskList
        },
        userAuthorTaskListData(state) {
            return state.userAuthorTaskList
        },
        indefiniteTaskListData(state) {
            return state.indefiniteTaskList
        }


    },
}