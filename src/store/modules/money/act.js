import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "@/const/customConst";

Vue.use(VueCookies)


export default {
    state: {
        actList: [],
        actDetail: null,
        lastNumber: null,
    },
    mutations: {
        syncActList(state, actList) {
            state.actList = actList
        },
        syncLastNum(state, num){
            state.lastNumber = num
        },
        addAct(state, newAct){
            state.actList.push(newAct)
        }
    },
    actions: {
        getActList({commit},) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.MONEY + 'act',
                }).then(res => {
                    commit('syncActList', res.data.data.data)
                    console.log(res)
                    resolve(res.data.data.data)
                })
            })
        },
        createAct({commit}, actData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.MONEY + 'act/',
                    data: actData
                }).then(res => {
                    commit('addAct', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject()
                })
            })
        },
        editAct({commit}, {id, actData}) {
            for (let pair of actData.entries()) {
                console.log(pair[0] + ', ' + pair[1]);
            }
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.MONEY + `act/${id}/`,
                    data: actData
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject()
                })
            })
        },
        getActDetail({commit}, actID) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.MONEY + `act/${actID}`
                }).then(res => {
                    resolve(res.data.data.data)
                    console.log('resolve', res.data.data.data)
                }).catch(err => {
                    reject(err)
                    console.log(err)
                })
            })
        },
        getLastNumber({commit},) {
           return  new Promise(resolve => {
                axios({
                    method: "GET",
                    url: customConst.MONEY + 'get-last-number',
                }).then((res)=>{
                    commit('syncLastNum', res.data)
                    resolve(res.data)
                })
            })
        }

    },
    getters: {
        actListData(state) {
            return state.actList
        },
        lastActNum(state) {
            console.log(state.lastNumber)
            return state.lastNumber
        }
    }
}