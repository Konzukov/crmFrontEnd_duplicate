import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";

Vue.use(VueCookies)


export default {
    state: {
        bankList: [],
        bankAccountList: [],
        organizationBankAccount: [],
        bankCardList: [],
        creditOrganization: []
    },
    mutations: {
        syncBankList(state, bankList) {
            state.bankList = bankList
        },
        syncBankAccountList(state, accountList) {
            state.bankAccountList = accountList
        },
        syncOrganizationBankAccountList(state, accountList) {
            state.organizationBankAccount = accountList
        },
        addBank(state, newBank) {
            state.bankList.unshift(newBank)
        },
        addBankAccount(state, newAccountBank) {
            state.bankAccountList.unshift(newAccountBank)
        },
        syncBankCardsList(state, bankCardsList) {
            state.bankCardList = bankCardsList
        },
        syncCreditOrganization(state, creditOrganizationList) {
            state.creditOrganization = creditOrganizationList
        }
    },
    actions: {
        getBankList({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'bank'
                }).then(res => {
                    console.log(res.data.data.data)
                    commit('syncBankList', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getOrganizationBankAccount({commit}, uuid) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + `organization-bank-account/${uuid}`,
                }).then(res => {
                    // commit('syncOrganizationBankAccountList', )
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getContractorBankAccount({commit}, uuid) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + `contractor-bank-account/${uuid}`,
                }).then(res => {
                    // commit('syncOrganizationBankAccountList', )
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getBankAccountList({commit}, project) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'bank-account',
                    params: {
                        project: project
                    }
                }).then(res => {
                    commit('syncBankAccountList', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getBankCardList({commit}, project) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'bank-cards',
                    params: {
                        project: project
                    }
                }).then(res => {
                    commit('syncBankCardsList', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createBankCard({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'bank-cards/',
                    data: formData
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        editBankCard({commit}, {id, formData}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.REFERENCE_BOOK_API + `bank-cards/${id}/`,
                    data: formData
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createBank({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'bank/',
                    data: formData
                }).then(res => {
                    commit('addBank', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createBankAccount({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'bank-account/',
                    data: formData
                }).then(res => {
                    commit('addBankAccount', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        editBankAccount({commit}, {formData, id}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.REFERENCE_BOOK_API + `bank-account/${id}/`,
                    data: formData
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getCreditorOrganization({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'bank/get-credit-organization',
                }).then(res => {
                    commit('syncCreditOrganization', res.data.data.data)
                    resolve()
                }).catch(err => {
                    console.log(err)
                })
            })
        },
    },
    getters: {
        bankListData(state) {
            return state.bankList
        },
        getBankCardsListData(state) {
            return state.bankCardList
        },
        organizationBankAccountData(state) {
            return state.organizationBankAccount
        },
        creditOrganizationListData(state) {
            return state.creditOrganization
        }
    }

}