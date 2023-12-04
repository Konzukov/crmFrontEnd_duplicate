import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";


Vue.use(VueCookies)

export default {
    state: {
        paymentPurpose: [],
        directedEventType: [],
        measureEventType: [],
    },
    mutations: {
        syncPaymentPurpose(state, paymentPurposeList) {
            state.paymentPurpose = paymentPurposeList
        },
        addPaymentPurpose(state, newPaymentPurpose) {
            state.paymentPurpose.push(newPaymentPurpose)
        },
        syncDirectedEventType(state, directedEventTypeList) {
            state.directedEventType = directedEventTypeList
        },
        addDirectedEventType(state, newDirectedEventTypeList) {
            state.directedEventType.push(newDirectedEventTypeList)
        },
        syncMeasureEventType(state, measureEventTypeList) {
            state.measureEventType = measureEventTypeList
        },
        addMeasureEventType(state, newMeasureEventType) {
            state.measureEventType.push(newMeasureEventType)
        }
    },
    actions: {
        getPaymentPurpose({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.CRM_API + 'payment-purpose-list'
                }).then(res => {
                    commit('syncPaymentPurpose', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createPaymentPurpose({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.CRM_API + 'create-payment-purpose',
                    data: formData
                }).then(res => {
                    commit('addPaymentPurpose', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createMoneyEvent({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.CRM_API + 'create-money-event',
                    data: formData
                }).then(res => {
                    resolve(res.data.data.data)
                })
            })
        },
        editMoneyEvent({commit}, {formData, pk}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.CRM_API + 'edit-money-event/' + pk,
                    data: formData
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getDirectedEventType({commit}) {
            new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.CRM_API + 'get-directed-event-type'
                }).then((res) => {
                    commit('syncDirectedEventType', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createDirectedEventType({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.CRM_API + 'create-directed-event-type',
                    data: formData
                }).then(res => {
                    commit('addPaymentPurpose', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createDirectedEvent({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.CRM_API + 'create-directed-event',
                    data: formData
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        editDirectedEvent({commit}, {formData, pk}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.CRM_API + 'edit-directed-event/' + pk,
                    data: formData
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getMeasureEventType({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.CRM_API + 'measure-event-type-list'
                }).then(res => {
                    commit('syncMeasureEventType', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createMeasureEventType({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.CRM_API + 'create-measure-event-type',
                    data: formData
                }).then(res => {
                    console.log('res', res.data.data.data)
                    commit('addMeasureEventType', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createMeasureEvent({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.CRM_API + 'create-measure-event',
                    data: formData
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        editMeasureEvent({commit}, {formData, pk}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.CRM_API + 'edit-measure-event/' + pk,
                    data: formData
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        }
    },
    getters: {
        paymentPurposeList(state) {
            return state.paymentPurpose
        },
        directedEventTypeList(state) {
            return state.directedEventType
        },
        measureEventTypeList(state) {
            return state.measureEventType
        }
    }
}