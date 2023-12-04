import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "@/const/customConst";

Vue.use(VueCookies)


export default {
    state: {
        regularInvoiceList: [],
        scheduleList: []
    },
    mutations: {
        syncRegularInvoice(state, regularInvoice){
            state.regularInvoiceList = regularInvoice
        },
        syncSchedule(state, schedule){
            state.scheduleList = schedule
        }
    },
    actions: {
        getRegularInvoice({commit}){
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.MONEY + 'regular',
                }).then(res=>{
                    commit('syncRegularInvoice', res.data.data.data)
                    resolve()
                }).catch(err=>{
                    reject(err)
                })
            })
        },
        createRegularInvoice({commit}, formData){
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.MONEY + 'regular/',
                    data: formData
                }).then(res=>{
                    resolve(res.data.data.data)
                    console.log(res.data.data.data)
                }).catch(err=>{
                    console.log(err)
                })
            })
        },
        getSchedule({commit}){
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.MONEY + 'schedule'
                }).then(res=>{
                    console.log(res.data.data.data)
                    commit('syncSchedule', res.data.data.data)
                    resolve()
                }).catch(err=>{
                    reject(err)
                })
            })
        },
        getDetailRegularInvoice({commit}, id){
            return new Promise((resolve, reject) => {
                axios({
                    method: 'GET',
                    url: customConst.MONEY + `regular/${id}`
                }).then(res=>{
                    resolve(res.data.data.data)
                })
            })
        },
        editRegularInvoice({commit}, {id, formData}){
            console.log(id)
            console.log(formData)
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.MONEY + `regular/${id}/`,
                    data: formData
                }).then(res=>{
                    // commit('', res.data.data.data)
                    resolve()
                }).catch(err=>{
                    console.log(err)
                    reject(err)
                })
            })
        }
    },
    getters: {
        regularInvoiceListData(state){
            return state.regularInvoiceList
        },
        scheduleListData(state){
            return state.scheduleList
        }
    }
}