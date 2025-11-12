import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";


Vue.use(VueCookies)


export default {
    state: {
        judgeList: [],
        judicialCategories: [],
        courtList: []

    },
    mutations: {
        syncJudge(state, judgeList) {
            state.judgeList = judgeList
        },
        addNewJudge(state, newJudge) {
            state.judgeList.push(newJudge)
        },
        syncJudicialCategories(state, judicialCategoriesList) {
            state.judicialCategories = judicialCategoriesList
        },

    },
    actions: {
        createJudge({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'judge/',
                    data: formData
                }).then(res => {
                    commit('addNewJudge', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getJudgeList({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'judge',
                }).then(res => {
                    commit('syncJudge', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getJudicialCategories({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'judicial-categories',
                }).then(res => {
                    commit('syncJudicialCategories', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })

        },
    },
    getters: {
        judgeListData(state) {
            return state.judgeList
        },
        judicialCategoriesData(state) {
            return state.judicialCategories
        },
        courtListData(state, getters) {
            const allowedTypes = ["ARBCR", "ACA", "ACC", "SCRF", "GEJRD", "CGJA", "CGJC", "MGSCR", "AC", "MOSC"];
            return getters.legalEntityData.filter(obj =>
                allowedTypes.includes(obj.legal_type)
            );
        }
    }
}