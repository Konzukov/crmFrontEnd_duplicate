import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";

Vue.use(VueCookies)

export default {
    state: {
        notice: {}
    },
    mutations: {
        syncSystemUpdateNotice(state, notice) {
            state.notice = notice
        }
    },
    actions: {
        async getSystemUpdateNotice({commit}) {
            return await new Promise(async (resolve) => {
                await axios({
                    method: "GET",
                    url: customConst.NOTIFY + 'system-update-notice'
                }).then(res => {
                    commit('syncSystemUpdateNotice', res.data.data.data)
                    resolve(res.data.data.data)
                })
            })
        },
        async confirmAcquainted({commit}, formData) {
            return await new Promise(async (resolve, reject) => {
                await axios({
                    method: "POST",
                    url: customConst.NOTIFY + 'system-update-notice/confirm-acquainted/',
                    data: formData
                }).then(res=>{
                    console.log(res)
                    resolve(res)
                }).catch(err=>{
                    console.log(err)
                    reject(err)
                })
            })
        }
    },
    getters: {}
}