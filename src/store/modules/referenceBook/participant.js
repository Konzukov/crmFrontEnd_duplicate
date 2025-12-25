import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";

Vue.use(VueCookies)


export default {
    state: {
        status: '',
        participator: [],
        participatorDetail: ''
    },
    mutations: {
        RESET_PARTICIPAT(state){
          state.status = ''
          state.participator = []
          state.participatorDetail = ''
        },
        participatorData(state, objectList) {
            state.status = 'Get participator list success'
            state.participator = objectList
        },
        addParticipator(state, object) {
            state.status = 'participator added success'
            state.participator.push(object)
        },
        participatorDetail(state, object) {
            state.participatorDetail = object
        }
    },
    actions: {
        getParticipator({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'participator-list',
                }).then((response) => {
                    commit('participatorData', response.data.data.data)
                    resolve()
                })
            })
        },
        createParticipator({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'POST',
                    url: customConst.REFERENCE_BOOK_API + 'participator-create',
                    data: formData
                }).then((response) => {
                    console.log(response.data.data)
                    axios({
                        method: "GET",
                        url: customConst.REFERENCE_BOOK_API + 'participator-tiny-detail/' + response.data.data.data.pk
                    }).then((response) => {
                        commit('addParticipator', response.data.data.data)
                        resolve()
                    })

                }).catch(err => {
                    reject(err)
                })
            })
        },
        participatorFullInfo({commit}, pk) {
            axios({
                method: "GET",
                url: customConst.REFERENCE_BOOK_API + 'participator-full-detail/' + pk
            }).then((response) => {
                commit('participatorDetail', response.data.data.data)
            })
        }
    },
    getters: {
        participatorList(state) {
            return state.participator
        },
        participantFullDetail(state) {
            return state.participatorDetail
        }
    }
}