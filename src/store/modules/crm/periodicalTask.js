import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";


Vue.use(VueCookies)


export default {
    state: {
        periodicalTaskList: []
    },
    mutations: {
        addPeriodicalTask(state, task) {
            state.periodicalTaskList.push(task)
        },
        syncPeriodicalTask(state, taskList) {
            state.periodicalTaskList = taskList
        },
        delPeriodicalTask(state, pk) {
            state.periodicalTaskList = state.periodicalTaskList.filter(obj => {
                if (obj['pk'] !== pk) {
                    return obj
                }
            })
        },
        updatePeriodicalTask(state, task) {
            state.periodicalTaskList = state.periodicalTaskList.map(obj => {
                if (obj['pk'] === task['pk']) {
                    obj = task
                }
                return obj
            })
        }
    },
    actions: {
        getPeriodicalTask({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.CRM_API + 'periodical-task-list'
                }).then((res) => {
                    commit('syncPeriodicalTask', res.data.data.data)
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        createPeriodicalTask({commit}, {taskFormData, scheduleFormDate}) {

            let createSchedule = new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.CRM_API + 'schedule-task-create',
                    data: scheduleFormDate
                }).then((res) => {
                    taskFormData.set('schedule', res.data.data.data.pk)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
            createSchedule.then(() => {
                return new Promise((resolve, reject) => {
                    axios({
                        method: "POST",
                        url: customConst.CRM_API + 'periodical-task-create',
                        data: taskFormData
                    }).then((res) => {
                        commit('addPeriodicalTask', res.data.data.data)
                        resolve()
                    }).catch((err) => {
                        reject(err)
                    })
                })
            })
        },
        deletePeriodicalTask({commit}, pk) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "DELETE",
                    url: customConst.CRM_API + 'periodical-task-delete/' + pk
                }).then((res) => {
                    commit('delPeriodicalTask', pk)
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        editPeriodicalTask({commit}, {formData, pk}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.CRM_API + 'periodical-task-edit/' + pk,
                    data: formData
                }).then((res) => {
                    commit('updatePeriodicalTask', res.data.data.data)
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
            })
        }
    },
    getters: {
        periodicalTaskListData(state) {
            return state.periodicalTaskList
        }
    },
}