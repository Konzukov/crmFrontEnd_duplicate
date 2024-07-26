import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";


Vue.use(VueCookies)


export default {
    state: {
      accountOpening: []
    },
    mutations: {
      syncAccountOpeningApplication(state, data){
          state.accountOpening = data
      }
    },
    actions: {
        getAccountOpeningApplication({commit}) {
          return new Promise((resolve, reject) => {
              axios({
                  method: "GET",
                  url: customConst.REFERENCE_BOOK_API + 'account-opening',
              }).then(res=>{
                  console.log(res)
                  commit('syncAccountOpeningApplication', res.data.data.data)
                  resolve()
              })
          })
        },
        saveAccountOpeningApplication({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'account-opening/',
                    data: formData
                }).then(res=>{
                    resolve(res)
                }).catch(err=>{
                    reject(err)
                })
            })
        },
        generateAccountOpeningApplication({commit}, formData){
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'account-opening/generate/',
                    data: formData,
                    responseType: 'blob',
                }).then(res=>{
                    console.log(res)
                    resolve(res)
                }).catch(err=>{
                    reject(err)
                })
            })
        }
    },
    getters: {
        accountOpeningApplicationData(state){
            return state.accountOpening
        }
    }
}