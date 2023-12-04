import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";


Vue.use(VueCookies)

export default {
    state: {
        eventList: [],
        userAuthorEventList: [],
        eventDetail: null,
        eventCategoryList: []
    },
    mutations: {
        syncAllEvent(state, allEventList) {
            state.eventList = allEventList
        },
        syncUserEvent(state, userEvent) {
            state.userAuthorEventList = userEvent
        },
        syncEventDetail(state, eventDetail) {
            state.eventDetail = eventDetail
        },
        syncEventCategory(state, eventCategory) {
            state.eventCategoryList = eventCategory
        },
        addEvent(state, newEvent) {
            state.eventList.unshift(newEvent)
            state.userAuthorEventList.unshift(newEvent)
        },
        updateEvent(state, event) {
            state.eventList = state.eventList.map(obj => {
                if (obj['pk'] === event['pk']) {
                    return event
                }
                return obj
            })
            state.userAuthorEventList = state.userAuthorEventList.map(obj => {
                if (obj['pk'] === event['pk']) {
                    obj = Object.assign({}, event)
                }
                return obj
            })
        }
    },
    actions: {
        getAllEvent({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    url: customConst.CRM_API + 'event',
                    method: "GET"
                }).then(res => {
                    commit('syncAllEvent', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getUserEvent({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    url: customConst.CRM_API + 'event/author',
                    method: "GET"
                }).then(res => {
                    commit('syncUserEvent', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getEventDetail({commit}, pk) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.CRM_API + `event/${pk}`,
                }).then(res => {
                    commit('syncEventDetail', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getEventCategory({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.CRM_API + 'event-category'
                }).then(res => {
                    commit('syncEventCategory', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createEvent({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.CRM_API + 'event/',
                    data: formData
                }).then(res => {
                    commit('addEvent', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        editEvent({commit}, {formData, pk}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.CRM_API + `event/${pk}/`,
                    data: formData
                }).then(res => {
                    commit('updateEvent', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        sendEventNotify({commit}, pk) {
            return new Promise((resolve, reject) => {
                axios({
                    url: customConst.CRM_API + `event/${pk}/send-notify/`,
                    method: "GET",
                }).then(res => {
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
    },
    getters: {
        getAllEventListData(state) {
            return state.eventList
        },
        getUserAuthorEventListData(state) {
            return state.userAuthorEventList
        },
        eventDetailData: (state) => state.eventDetail,
        eventCategoryListData: (state) => state.eventCategoryList
    },
}
