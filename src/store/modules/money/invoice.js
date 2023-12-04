import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "@/const/customConst";

Vue.use(VueCookies)

export default {
    state: {
        invoiceList: []
    },
    mutations: {
        invoiceCreated(state, newInvoice) {
            state.invoiceList.unshift(newInvoice)
        },
        invoiceListGetting(state, invoiceList) {
            state.invoiceList = invoiceList
        }
    },
    actions: {
        createInvoice({commit}, invoiceData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.MONEY + "invoice/",
                    data: invoiceData
                }).then(res => {
                    commit('invoiceCreated', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        editInvoice({commit}, {id, invoiceData}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.MONEY + `invoice/${id}/`,
                    data: invoiceData
                }).then(res => {
                    commit('invoiceCreated', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getInvoiceList({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.MONEY + "invoice",
                }).then(res => {
                    commit('invoiceListGetting', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getInvoiceDetail({commit}, invoiceID) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.MONEY + 'invoice/' + invoiceID
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    console.log(err)
                })
            })
        },

    },
    getters: {
        invoiceListData(state, filter = null) {
            return state.invoiceList.filter(obj => {
                if (filter) {
                    return obj !== filter
                }
                return obj
            })
        }
    }
}