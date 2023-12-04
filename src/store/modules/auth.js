import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../const/customConst";

Vue.use(VueCookies)

export default {
    state: {
        status: '',
        user: '',
        token: Vue.$cookies.get('token') || '',
    },
    mutations: {
        auth_request(state) {
            state.status = 'loading'
        },
        auth_error(state) {
            state.status = 'error'
        },
        auth_success(state, userData) {
            state.status = 'success'
            state.token = userData.token
            state.user = userData.userFullInfo
        },
        auth_sync(state, user) {
            state.status = 'success sync'
            state.user = user
        },
        logout(state) {
            state.status = '',
                state.token = '',
                state.user = ''
        },
    },
    actions: {
        login({commit}, data) {
            let userData = new FormData()
            userData.set('username', data.login)
            userData.set('password', data.password)
            userData.set('smsCode', data.smsCode)

            return new Promise((resolve, reject) => {
                console.log(data.login, data.password, data.smsCode)
                commit('auth_request')
                axios({
                    method: 'post',
                    url: customConst.AUTH_API + 'check-sms-code/',
                    headers: {'Content-Type': 'application/vnd.api+json'},
                    data: userData
                })
                    .then(response => {
                        const userFullInfo = response.data.data.data
                        console.log(response.data.data.data)
                        console.log(userFullInfo)
                        userData.delete('smsCode')
                        axios({
                            method: 'post',
                            url: customConst.AUTH_API + 'auth/token/login/',
                            headers: {'Content-Type': 'application/vnd.api+json'},
                            data: userData
                        })
                            .then(response => {
                                const token = "Token " + response.data.data.attributes.auth_token
                                Vue.$cookies.set('token', token, '1d')
                                axios.defaults.headers.common['Authorization'] = token
                                commit('auth_success', {token, userFullInfo})
                                resolve(response)
                            })
                            .catch(err => {
                                commit('auth_error')
                                localStorage.removeItem('token')
                                Vue.$cookies.remove('token')
                                reject(err)
                            })

                    })
                    .catch(err => {
                        commit('auth_error')
                        reject(err)
                    })

            })
        },
        logout({commit}, user) {
            return new Promise(resolve => {
                axios({
                    method: 'GET',
                    url: customConst.AUTH_API + 'logout-request',
                    params: {
                        userName: user
                    }
                }).then(() => {
                    resolve()
                    return new Promise(resolve => {
                        commit('logout')
                        axios({
                            method: 'post',
                            url: customConst.AUTH_API + 'auth/token/logout/',
                        })
                            .then(() => {
                                Vue.$cookies.remove('token')
                                delete axios.defaults.headers.common['Authorization']
                                resolve()
                            }).catch(err => console.log(err))

                    })
                })
            })

        },
        async checkAuth({commit}) {
            axios.defaults.headers.common['Authorization'] = Vue.$cookies.get('token')
            return await new Promise((resolve, reject) => {
                axios({
                    method: 'GET',
                    url: customConst.AUTH_API + 'auth/users/me/',
                }).then(response => {
                    axios({
                        method: 'GET',
                        url: customConst.AUTH_API + 'sync/',
                        params: {
                            userName: response.data.data.attributes.username
                        }
                    })
                        .then(response => {
                            console.log('checkAuth', response.data.data.data)
                            commit('auth_sync', response.data.data.data)
                            resolve(response.data.data.data)
                        }).catch(err => {
                        Vue.$cookies.remove('token')
                        delete axios.defaults.headers.common['Authorization']
                        reject(err)
                    })
                }).catch(err => {
                    Vue.$cookies.remove('token')
                    delete axios.defaults.headers.common['Authorization']

                })
            })
        },
        changeOrganization({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.AUTH_API + 'change-active-organization',
                    data: formData
                }).then((res) => {
                    resolve()
                })
            })
        }
    },
    getters: {
        isLoggedIn(state) {
            return !!state.token
        },
        authStatus(state) {
            return state.status
        },
        authUserData(state) {
            return state.user
        },
    }
}