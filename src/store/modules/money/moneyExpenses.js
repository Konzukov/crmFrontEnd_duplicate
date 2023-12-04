import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "@/const/customConst";

Vue.use(VueCookies)


export default {
    state: {
        moneyExpenses: [],
        singleMoneyReceipts: {}
    },
    mutations: {
        syncMoneyExpenses(state, expenses) {
            state.moneyExpenses = expenses
        },
        addMoneyExpenses(state, moneyExpenses) {
            state.moneyExpenses.unshift(moneyExpenses)
        },
        syncSingleMoneyReceipts(state, moneyExpenses) {
            state.moneyExpenses = moneyExpenses
        },
        updateSingleMoneyReceipts(state, moneyExpenses) {
            console.log(state.moneyExpenses)
            console.log(moneyExpenses)
            state.singleMoneyExpenses = moneyExpenses

            // state.moneyExpenses = state.moneyExpenses.map(obj => {
            //     if (obj['pk'] === moneyExpenses['pk']) {
            //         obj = moneyExpenses
            //         return obj
            //     }
            //     return obj
            // })
        },
        addingToTrash(state, trashMoney){
            console.log(trashMoney)
            state.moneyExpenses =  state.moneyExpenses.filter(obj=> obj['pk'] !== trashMoney['money']['pk'])
        }
    },
    actions: {
            getMoneyExpenses({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.MONEY + 'money-expenses'
                }).then(res => {
                    console.log(res)
                    console.log(res.data.data.data)
                    commit('syncMoneyExpenses', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createMoneyExpenses({commit}, formData) {
            return new Promise(((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.MONEY + 'money-expenses/',
                    data: formData
                }).then((res) => {
                    commit("addMoneyExpenses", res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            }))
        },
        detailMoneyExpenses({commit}, pk) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.MONEY + 'money-expenses/' + pk
                }).then(res => {
                    commit('syncSingleMoneyExpenses', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        editMoneyExpenses({commit}, {formData, pk}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.MONEY + 'money-expenses/' + pk,
                    data: formData
                }).then(res => {
                    commit('updateSingleMoneyReceipts', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
    },
    getters: {
        moneyExpensesListData(state) {
            return state.moneyExpenses
        }
    }

}