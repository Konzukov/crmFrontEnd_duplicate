import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";

Vue.use(VueCookies)


export default {
    state: {
        postOrder: [],

    },
    mutations: {
        syncPostOrder(state, postOrders){
            state.postOrder = postOrders
        }
    },
    actions: {
        getPostOrder({commit}){
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.PAPERFLOW_API + 'post-order'
                }).then(res=>{
                    commit('syncPostOrder', res.data.data.data)
                    resolve
                }).catch(err=>{
                    reject(err)
                })
            })
        }
    },
    getters: {
        postOrderData(state){
            return state.postOrder
        }
    }
}