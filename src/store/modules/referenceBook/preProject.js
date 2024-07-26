import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";

Vue.use(VueCookies)

export default {
    state: {
        agreementTemplate: [],
        preProjectList: [],
        preProjectDetail: {}
    },
    mutations: {
        syncAgreementTemplate(state, list) {
            state.agreementTemplate = list
        },
        syncPreProject(state, list) {
            state.preProjectList = list
        },
        syncPreProjectDetail(state, preProjectDetail) {
            state.preProjectDetail = preProjectDetail
        },
        addPreProject(state, newPreProject) {
            state.preProjectList.unshift(newPreProject)
        },
        updatePreProject(state, editedPreProject) {
            state.preProjectDetail = editedPreProject
            const index = state.preProjectList.findIndex((obj)=> obj.id === editedPreProject.id)
            state.preProjectList[index] = editedPreProject
            console.log('editedPreProject', editedPreProject)
        }
    },
    actions: {
        getPreProjectList({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'pre-project'
                }).then(res => {
                    console.log(res.data.data.data)
                    commit('syncPreProject', res.data.data.data)
                    resolve()
                }).catch(err => {
                    console.log(err)
                })
            })
        },
        getAgreementTemplate({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'agreement-template/'
                }).then(res => {
                    console.log(res.data.data)
                    commit('syncAgreementTemplate', res.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createPreProject({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'pre-project/',
                    data: formData
                }).then(res => {
                    console.log(res.data.data.data)
                    commit('addPreProject', res.data.data.data)
                    resolve()
                }).catch(err => {
                    console.log(err)
                    reject(err)
                })
            })
        },
        editPreProject({commit}, {formData, id}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.REFERENCE_BOOK_API + 'pre-project/' + id + '/',
                    data: formData
                }).then(res => {
                    console.log(res.data.data)
                    commit('updatePreProject', res.data.data.data)
                    resolve()
                }).catch(err => {
                    console.log(err)
                    reject(err)
                })
            })
        },
        getPreProjectDetail({commit}, id) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'pre-project/' + id,
                }).then(res => {
                    commit('syncPreProjectDetail', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        downloadPreProjectReport({commit}){
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'download-pre-project-report',
                    responseType: "blob"
                }).then(res=>{
                    console.log(res)
                    resolve(res)
                }).catch(err=>{
                    console.log(err)
                    reject(err)
                })
            })
        }
    },
    getters: {
        agreementTemplateData(state) {
            return state.agreementTemplate
        },
        preProjectData(state) {
            return state.preProjectList
        },
        preProjectDetailData(state) {
            return state.preProjectDetail
        }
    }
}
