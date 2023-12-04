import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";

Vue.use(VueCookies)


export default {
    state: {
        tagList: [],
    },
    mutations: {
        syncTagList(state, tagList) {
            state.tagList = tagList
        },
        syncAddedTag(state, newTag){
            state.tagList.push(newTag)
        }
    },
    actions: {
        getTagList({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.CRM_API + 'tags-list/'
                }).then(res => {
                    commit('syncTagList', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        addTag({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.CRM_API + 'tags-create/',
                    data: formData
                }).then(res => {
                    commit('syncAddedTag', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        }

    },
    getters: {
        tagsListData(state) {
            return state.tagList
        }
    }
}