import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";
import {eventBus} from "../../../bus";


Vue.use(VueCookies)

export default {
    state: {
        projectReport: {
            processed: [],
            unprocessed: []
        },
        userReport: [],
        projectMoney: []
    },
    mutations: {
        syncProjectReport(state, {processed }) {
            state.projectReport.processed = processed
            // state.projectReport.unprocessed = unprocessed
        },
        syncUserReport(state, reportData) {
            state.userReport = reportData
        },
        syncProjectMoney(state, moneyReport){
            state.projectMoney = moneyReport
        }
    },
    actions: {
        getProjectReport({commit}, {project, date}) {
            return new Promise((resolve, reject) => {
                axios({
                    url: customConst.REPORT_API + 'project-report/' + project,
                    method: "GET",
                    params: {
                        date
                    }
                }).then((reponse) => {
                    commit('syncProjectReport', {
                        'processed': reponse.data.data.data,
                        // 'unprocessed': reponse.data.data.unfinishedDoc
                    })
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        getUserReport({commit}, user) {
            return new Promise((resolve, reject) => {
                axios({
                    url: customConst.REPORT_API + 'user-report/' + user,
                    method: "GET",
                }).then((reponse) => {
                    commit('syncUserReport', reponse.data.data.data)
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        downloadReport({commit}, project) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REPORT_API + 'download-report/' + project,
                    onDownloadProgress: (progressEvent) => {
                        console.log(progressEvent)
                        console.log(progressEvent.loaded, progressEvent.total)
                        let progress = String(Math.round((progressEvent.loaded / progressEvent.total) * 100))
                        eventBus.$emit('updateProgress', progress)
                    },
                }).then((response) => {
                    let element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;base64,' + response.data);
                    element.setAttribute('download', 'report.zip');
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
            })

        },
        getProjectMoneyReport({commit}, project) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REPORT_API + 'project-money',
                    params: {'project': project}
                }).then((res) => {
                    console.log(res.data.data.data)
                    commit('syncProjectMoney', res.data.data.data)
                    resolve()
                }).catch(err => {
                    console.log(err)
                })
            })
        }
    },
    getters: {
        projectReportListData(state) {
            return state.projectReport.processed
        },
        unprocessedProjectReportListData(state) {
            return state.projectReport.unprocessed
        },
        userReportListData(state) {
            return state.userReport
        },
        projectMoneyData(state){
            return state.projectMoney
        }
    }
}
