import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "@/const/customConst";
import axios from "axios";

Vue.use(VueCookies)

export default {
    state: {
        wikiDocs: [],
    },
    mutations: {
        SET_WIKI_DOCS(state, data) {
            state.wikiDocs = [...data]
        }
    },
    actions: {
        async fetchWikiDocs({commit}) {
            return await new Promise((resolve, reject) => {
                axios.get(customConst.REFERENCE_BOOK_API + 'wiki').then(res => {
                    commit('SET_WIKI_DOCS', res.data.data.data)
                    console.log(res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        async fetchWikiDoc({commit}, id) {
            return await new Promise((resolve, reject) => {
                axios.get(customConst.REFERENCE_BOOK_API + 'wiki/'+ id).then(res => {
                    console.log('Wiki article data:', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    console.error('Error fetching wiki article:', err)
                    reject(err)
                })
            })
        },
        async saveWiki({commit}, {data, id}) {
            return await new Promise((resolve, reject) => {
                const url = id
                    ? `${customConst.REFERENCE_BOOK_API}wiki/${id}/`
                    : `${customConst.REFERENCE_BOOK_API}wiki/`
                const method = id ? 'put' : 'post'
                axios[method](url, data).then(res => {
                    console.log(res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        }
    },
    getters: {
        wikiListData(state) {
            return state.wikiDocs
        }
    }
}