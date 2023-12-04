import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";


Vue.use(VueCookies)


export default {
    state: {
        onlineUser: []
    },
    mutations: {
        syncOnlineUser(state, onlineUserList){
            state.onlineUser = onlineUserList
        }
    },
    actions: {
        getOnlineUser({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.AUTH_API + 'online-user'
                }).then(res => {
                    commit('syncOnlineUser', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        }
    },
    getters: {
        getOnlineUserList(state){
            return state.onlineUser
        }
    }
}