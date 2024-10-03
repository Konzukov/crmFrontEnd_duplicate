import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";


Vue.use(VueCookies)


export default {
    state: {
        creditorMeeting: [],
        basicCreditorClaim: []
    },
    mutations: {
        syncCreditorMeeting(state, data) {
            state.creditorMeeting = [...data]
        },
        syncAddCreditorMeeting(state, data) {
            state.creditorMeeting.push(data)
        },
        syncEditCreditorMeeting(state, data) {
            const index = state.creditorMeeting.findIndex(i => i.id === data.id);
            if (index !== -1) {
                state.creditorMeeting.splice(index, 1, data);
            }
        },
        syncBasicCreditorClaim(state, data){
            state.basicCreditorClaim=[...data]
        }
    },
    actions: {
        savePersonalInfo(commit, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'POST',
                    url: customConst.PROCEDURE + 'questionnaire/',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: formData
                })
            })
        },
        saveCreditorClaim({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'creditors-claims/',
                    data: formData
                }).then((res => {
                    resolve(res.data.data.data)
                })).catch(err => {
                    reject(err)
                })
            })
        },
        editCreditorClaim({commit}, {formData, id}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.REFERENCE_BOOK_API + 'creditors-claims/' + `${id}/`,
                    data: formData
                }).then((res => {
                    resolve(res.data.data.data)
                })).catch(err => {
                    reject(err)
                })
            })
        },
        getBasicCreditorClaim({commit}, pk) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + `basic-creditor-claim/`,
                    params: {project: pk}
                }).then((res => {
                    commit('syncBasicCreditorClaim', res.data.data.data)
                    resolve(res.data.data.data)
                })).catch(err => {
                    reject(err)
                })
            })
        },
        saveBasicCreditorClaim({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'basic-creditor-claim/',
                    data: formData
                }).then((res => {
                    resolve(res.data.data.data)
                })).catch(err => {
                    reject(err)
                })
            })
        },
        editBasicCreditorClaim({commit}, {formData, id}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.REFERENCE_BOOK_API + 'basic-creditor-claim/' + `${id}/`,
                    data: formData
                }).then((res => {
                    resolve(res.data.data.data)
                })).catch(err => {
                    reject(err)
                })
            })
        },
        async saveBankruptcyEstate({commit}, formData) {
            return await new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'bankruptcy-estate/',
                    data: formData
                }).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        async editBankruptcyEstate({commit}, {formData, id}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.REFERENCE_BOOK_API + 'bankruptcy-estate/' + `${id}/`,
                    data: formData
                }).then((res => {
                    resolve(res.data.data.data)
                })).catch(err => {
                    reject(err)
                })
            })
        },
        getBankruptcyEstate({commit}, project) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'bankruptcy-estate/' + project + '/list',
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getEstateSaleProgress({commit}, project) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'estate-sale-progress/' + project + '/list',
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        async saveEstateSaveProgress({commit}, formData) {
            return await new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'estate-sale-progress/',
                    data: formData
                }).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        async editEstateSaveProgress({commit}, {formData, id}) {
            return await new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.REFERENCE_BOOK_API + 'estate-sale-progress/' + `${id}/`,
                    data: formData
                }).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getCreditorMeeting({commit}, project) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + `creditor-meeting/${project}/list`,
                    params: {project: project}
                }).then(res => {
                    commit('syncCreditorMeeting', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    console.log(err)
                })
            })
        },
        addCreditorMeeting({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'creditor-meeting/',
                    data: formData
                }).then(res => {
                    commit('syncAddCreditorMeeting', res.data.data.data)
                    console.log(res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    console.log(err)
                    reject(err)
                })
            })
        },
        editCreditorMeeting({commit}, {formData, id}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.REFERENCE_BOOK_API + `creditor-meeting/${id}/`,
                    data: formData
                }).then(res => {
                    commit('syncEditCreditorMeeting', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    console.log(err)
                    reject(err)
                })
            })
        }
    },
    getters: {
        creditorMeetingData(state) {
            return state.creditorMeeting
        },
        basicCreditorClaimData(state){
            return state.basicCreditorClaim
        }
    }

}