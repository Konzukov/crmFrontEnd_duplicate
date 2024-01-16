import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";


Vue.use(VueCookies)


export default {
    state: {
        judicialEvent: [],

    },
    mutations: {
        syncJudicialEvent(state, judicialEvents) {
            state.judicialEvent = judicialEvents
        },
        newJudicialEvent(state, judicialEvents) {
            state.judicialEvent.push(judicialEvents)
        },
        syncEditJudicialEvent(state, judicialEvent){
            for (let events of state.judicialEvent){
                if (events['id'] === judicialEvent['id']){
                    Object.assign(events, judicialEvent)
                    // events = judicialEvent
                }
            }
        }
    },
    actions: {
        getJudicialEvent({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.CRM_API + 'judicial-sessions'
                }).then(res => {
                    commit('syncJudicialEvent', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        detailJudicialEvent({commit}, id) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.CRM_API + 'judicial-sessions/' + id
                }).then(res => {
                    resolve(res.data.data.data)
                })
            })
        },
        createJudicialEvent({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.CRM_API + 'judicial-sessions/',
                    data: formData
                }).then(res => {
                    commit('newJudicialEvent', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        async editJudicialEvent({commit}, {formData, id}) {
            return new Promise(async (resolve, reject) => {
                await axios({
                    method: "PUT",
                    url: customConst.CRM_API + `judicial-sessions/${id}/`,
                    data: formData
                }).then(res => {
                    commit('syncEditJudicialEvent', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        }
    },
    getters: {
        judicialEventData(state) {
            return state.judicialEvent
        }
    }
}