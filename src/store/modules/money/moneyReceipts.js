import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "@/const/customConst";

Vue.use(VueCookies)


export default {
    state: {
        moneyReceipts: [],
        singleMoneyReceipts: {}
    },
    mutations: {
        syncMoneyReceipts(state, moneyReceipts) {
            state.moneyReceipts = moneyReceipts
        },
        addMoneyReceipts(state, moneyReceipt) {
            state.moneyReceipts.unshift(moneyReceipt)
        },
        syncSingleMoneyReceipts(state, moneyReceipt) {
            state.singleMoneyReceipts = moneyReceipt
        },
        updateSingleMoneyReceipts(state, moneyReceipt) {
            state.singleMoneyReceipts = moneyReceipt
            state.moneyReceipts = state.moneyReceipts.map(obj => {
                if (obj['pk'] === moneyReceipt['pk']) {
                    obj = moneyReceipt
                    return obj
                }
                return obj
            })
        },
        addingToTrash(state, trashMoney){
            console.log(trashMoney)
            state.moneyReceipts =  state.moneyReceipts.filter(obj=> obj['pk'] !== trashMoney['money']['pk'])
        }
    },
    actions: {
        getMoneyReceipts({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.MONEY + 'money-receipts-list'
                }).then(res => {
                    commit('syncMoneyReceipts', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createMoneyReceipts({commit}, formData) {
            return new Promise(((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.MONEY + 'money-receipts-create',
                    data: formData
                }).then((res) => {
                    commit("addMoneyReceipts", res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            }))
        },
        detailMoneyReceipts({commit}, pk) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.MONEY + 'money-receipts-detail/' + pk
                }).then(res => {

                    commit('syncSingleMoneyReceipts', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        editMoneyReceipts({commit}, {formData, pk}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.MONEY + 'money-receipts-edit/' + pk,
                    data: formData
                }).then(res => {
                    commit('updateSingleMoneyReceipts', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        toTrashMoney({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.MONEY + 'trash-money',
                    data: formData
                }).then(res => {
                    console.log(res)
                    commit('addingToTrash', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        }
    },
    getters: {
        moneyReceiptsListData(state) {
            return state.moneyReceipts
        }
    }

}