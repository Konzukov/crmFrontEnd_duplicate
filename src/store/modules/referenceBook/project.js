import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";


Vue.use(VueCookies)


export default {
    state: {
        projectList: [],
        projectDetail: '',
        creditorMeeting: [],
    },
    mutations: {
        syncProjectList(state, projects) {
            state.projectList = projects
        },
        addProject(state, newProject) {
            state.projectList.unshift(newProject)
        },
        editProjectSync(state, project) {
            state.projectList = state.projectList.map(obj => {
                if (obj.pk === project.pk) {
                    obj = Object.assign({}, project)
                }
                return obj
            })
        },
        syncProjectDetail(state, project) {
            state.projectDetail = project
        },

    },
    actions: {
        getProjectList({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'project-list',
                }).then(response => {
                    commit('syncProjectList', response.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })

        },
        createProject({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'project-create',
                    data: formData
                }).then(response => {
                    commit('addProject', response.data.data.data)
                    resolve(response.data.data.data)
                }).catch((err) => {
                    reject(err)
                })
            })

        },
        editProject({commit}, {formData, pk}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.REFERENCE_BOOK_API + `project-edit/${pk}`,
                    data: formData
                }).then((response) => {
                    if (response.status === 226) {
                        resolve(response.data.data.data)
                    } else {
                        commit('editProjectSync', response.data.data.data)
                        resolve(response)
                    }

                }).catch((err) => {
                    reject(err)
                })
            })
        },
        getProjectDetail({commit}, pk) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'project-detail/' + pk,
                }).then((res) => {
                    commit('syncProjectDetail', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        getSeparatedDisputeList({commit}, project) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'separated-dispute/',
                    params: {project: project}
                }).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createSeparatedDispute({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'separated-dispute/',
                    data: formData
                }).then(res => {
                    console.log(res)
                    resolve(res)
                }).catch(err => {
                    console.log(err)
                    resolve(err)
                })
            })
        },
        editSeparatedDispute({commit}, {formData, id}) {
            console.log(formData)
            console.log('id', id)
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.REFERENCE_BOOK_API + `separated-dispute/${id}/`,
                    data: formData
                }).then(res => {
                    console.log(res)
                    resolve(res)
                }).catch(err => {
                    console.log(err)
                    resolve(err)
                })
            })
        },
        getEnforcementProceedings({commit}, project) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'enforcement-proceedings',
                    params: {project: project}
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    console.log(err)
                })
            })
        },
        getProjectsByCaseNumber({commit}, caseNumber) {
            return new Promise((resolve, reject) => {
                const url = customConst.REFERENCE_BOOK_API + 'project-list'
                axios.get(url, {
                    params: {case_number: caseNumber}
                }).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        }
    },
    getters: {
        projectListData(state) {
            return state.projectList
        },
        activeProjectListData(state) {
            return state.projectList.filter(obj => !obj['isArchive'])
        },
        projectDetailData(state) {
            return state.projectDetail
        },

    },
}