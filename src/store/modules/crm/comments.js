import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";

Vue.use(VueCookies)


export default {
    state: {
        commentList: [],
    },
    mutations: {
        syncCommentList(state, commentList) {
            state.commentList = commentList
        },
        syncAddedComment(state, newComment){
            state.commentList.push(newComment)
        }
    },
    actions: {
        getCommentList({commit}, pk) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.CRM_API + 'comment-list/' + pk
                }).then(res => {
                    commit('syncCommentList', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        addComment({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.CRM_API + 'comment-create/',
                    data: formData
                }).then(res => {
                    commit('syncAddedComment', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        }

    },
    getters: {
        commentListData(state) {
            return state.commentList
        }
    }
}