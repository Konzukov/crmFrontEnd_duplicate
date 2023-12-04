import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "@/const/customConst";

Vue.use(VueCookies)

export default {
    state: {
        walletList: []
    },
    mutations: {
        syncWalletList(state, walletList) {
            state.walletList = walletList
        },
        addWallet(state, newWaller){
            state.walletList.push(newWaller)
        }
    },
    actions: {
        getWallet({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.MONEY + 'wallet'
                }).then(res => {
                    commit('syncWalletList', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createWallet({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.MONEY + 'wallet/',
                    data: formData
                }).then(res => {
                    console.log(res.data.data)
                    commit('addWallet', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        }
    },
    getters: {
        walletListData(state){
            console.log(state.walletList)
            return state.walletList
        }
    }
}