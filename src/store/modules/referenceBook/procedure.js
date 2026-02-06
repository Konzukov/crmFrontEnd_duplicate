import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";


Vue.use(VueCookies)


export default {
    state: {
        creditorMeeting: [],
        basicCreditorClaim: [],
        creditorClaimsRegister: [],
        involvedPerson: [],
        complaints: [],
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
        syncBasicCreditorClaim(state, data) {
            state.basicCreditorClaim = [...data]
        },
        syncCreditorClaimRegister(state, data) {
            console.log(data)
            state.creditorClaimsRegister = [...data]
        },
        syncAddBasicCreditorClaim(state, data) {
            state.basicCreditorClaim.push(data)
        },
        syncInvolvedPerson(state, data) {
            state.involvedPerson = [...data]
        },
        syncAddInvolvedPerson(state, data) {
            state.involvedPerson.push(data)
        },
        syncEditInvolvedPerson(state, data) {
            state.involvedPerson = state.involvedPerson.map(item => {
                if (item.id === data.id) {
                    return data
                }
                return item
            })
        },
        syncComplaints(state, data) {
            state.complaints = [...data]
        },
        syncAddComplaints(state, data) {
            state.complaints.push(data)
        },
        syncEditComplaints(state, data) {
            state.complaints = state.complaints.map(item => {
                if (item.id === data.id) {
                    return data
                }
                return item
            })
        },
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
        getCreditorClaim({commit}, pk) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'creditors-claims',
                    params: {project: pk}
                }).then(res => {
                    console.log(res.data.data.data)
                    commit('syncCreditorClaimRegister', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
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
                    commit('syncAddBasicCreditorClaim', res.data.data.data)
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
                    url: customConst.REFERENCE_BOOK_API + 'bankruptcy-estate/' + project + '/list/',
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
        },
        getInvolvedPersonList({commit}, project) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + `involved-person/${project}/list`,
                    params: {
                        project: project
                    }
                }).then(res => {
                    commit('syncInvolvedPerson', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createInvolvedPerson({commit}, data) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'involved-person/',
                    data: data,
                }).then(res => {
                    commit('syncAddInvolvedPerson', res.data.data.data)
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        editInvolvedPerson({commit}, {data, id}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.REFERENCE_BOOK_API + `involved-person/${id}/`,
                    data: data,
                }).then(res => {
                    commit('syncEditInvolvedPerson', res.data.data.data)
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getComplaintList({commit}, project) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + `complaints/${project}/list`,
                    params: {
                        project: project
                    }
                }).then(res => {
                    commit('syncComplaints', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createComplaint({commit}, data) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'complaints/',
                    data: data,
                }).then(res => {
                    commit('syncAddComplaints', res.data.data.data)
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        editComplaint({commit}, {data, id}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.REFERENCE_BOOK_API + `complaints/${id}/`,
                    data: data,
                }).then(res => {
                    commit('syncEditComplaints', res.data.data.data)
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
    },
    getters: {
        creditorMeetingData(state) {
            return state.creditorMeeting
        },
        basicCreditorClaimData(state) {
            return state.basicCreditorClaim
        },
        involvedPersonData(state) {
            return state.involvedPerson
        },
        complaintsData(state) {
            return state.complaints
        },
        creditorClaimRegisterData(state) {
            return state.creditorClaimsRegister
        }
    }
}