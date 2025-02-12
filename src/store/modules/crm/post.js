import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";

Vue.use(VueCookies)


export default {
    state: {
        post: [],
        trashPost: [],
        singlePost: {},
        incomingPost: [],
        outgoingPost: [],
        postAccount: []

    },
    mutations: {
        syncPostAccount(state, postAccount){
          state.postAccount = postAccount
        },
        syncIncomingPost(state, inPostList) {
            state.incomingPost = inPostList
        },
        syncOutgoingPost(state, outPostList) {
            state.outgoingPost = outPostList
        },
        syncAllPost(state, postList) {
            state.post = postList
        },
        syncTrashPost(state, trashPostList) {
            state.trashPost = trashPostList
        },
        syncSinglePost(state, post) {
            state.singlePost = Object.assign({}, post)
        },
        updateOutgoingPost(state, post) {

            state.outgoingPost = state.outgoingPost.map(obj => {
                console.log(obj['pk'], post)
                if (obj['pk'] === post['pk']) {
                    return post
                }
                return obj
            })
        },
        updatePost(state, data) {
            state.singlePost = Object.assign({}, data.postDetail)
            console.log('obj.postList ', data.postList)
            state.post = state.post.map(obj => {
                if (obj['pk'] === data.postList['pk']) {
                    return data.postList
                }
                return obj
            })
        },
        addPostToTrash(state, pk) {
            const trashObj = state.incomingPost.filter(obj => obj['pk'] === pk)
            state.incomingPost = state.incomingPost.filter(obj => obj['pk'] !== pk)
            state.outgoingPost = state.outgoingPost.filter(obj => obj['pk'] !== pk)
            state.trashPost.push(trashObj)
        },
        delPost(state, pk) {
            state.incomingPost = state.incomingPost.filter(obj => obj['pk'] !== pk)
            state.outgoingPost = state.outgoingPost.filter(obj => obj['pk'] !== pk)
        }
    },
    actions: {
        getPostAccount({commit}){
          return new Promise((resolve, reject) => {
              axios({
                  method: "GET",
                  url: customConst.PAPERFLOW_API + 'post-account'
              }).then(res=>{
                  commit('syncPostAccount', res.data.data.data)
                  resolve(res)
              }).catch(err=>{
                  reject(err)
              })
          })
        },
        getAllPost({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.PAPERFLOW_API + 'all-post-list'
                }).then(res => {
                    commit('syncAllPost', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getTrashPost({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.PAPERFLOW_API + 'trash-post-list'
                }).then(res => {
                    commit('syncTrashPost', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createPost({commit}, formData) {
            console.log('start create')
            return new Promise((resolve, reject) => {
                axios({
                    method: 'POST',
                    url: customConst.PAPERFLOW_API + 'post-create',
                    data: formData,
                }).then(res => {
                    console.log(res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    console.log(err)
                    reject(err)
                })
            })
        },
        editPost({commit}, {formData, pk}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'PUT',
                    url: customConst.PAPERFLOW_API + 'post-edit/' + pk,
                    data: formData
                }).then((res) => {
                    commit('updatePost', {postDetail: res.data.data.data, postList: res.data.data.listData})
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        getIncomingPost({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.PAPERFLOW_API + 'incoming-post-list'
                }).then(res => {
                    commit('syncIncomingPost', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getOutgoingPost({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.PAPERFLOW_API + 'outgoing-post-list'
                }).then(res => {
                    console.log(res.data.data.data)
                    commit('syncOutgoingPost', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        async getPostDetail({commit}, pk) {
            return await new Promise(async (resolve, reject) => {
                await axios({
                    method: "GET",
                    url: customConst.PAPERFLOW_API + 'post-detail/' + pk
                }).then(res => {
                    commit('syncSinglePost', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        trashPost({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.PAPERFLOW_API + 'trash-post',
                    data: formData
                }).then(res => {
                    console.log(res.data.data.data)
                    commit('addPostToTrash', res.data.data.data.post)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        deletePost({commit}, pk) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "DELETE",
                    url: customConst.PAPERFLOW_API + 'post-delete/' + pk
                }).then(() => {
                    commit('delPost', pk)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        }

    },
    getters: {
        postAccountData(state){
            console.log(state.postAccount)
          return state.postAccount.filter(obj=> obj['post_type'] === 'ElectronicMail')
        },
        allPostListData(state) {
            return state.post
        },
        allTrashPostListData(state) {
            return state.trashPost
        },
        incomingPostData(state) {
            return state.incomingPost
        },
        outgoingPostDate(state) {
            return state.outgoingPost
        },
        postDetailData(state) {
            return state.singlePost
        }
    }
}