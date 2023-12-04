import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";

Vue.use(VueCookies)

export default {
    state: {
        documentList: [],
        docTypeList: [],
    },
    mutations: {
        syncDocumentList(state, documentList) {
            state.documentList = documentList
        },
        syncDocType(state, docTypeList) {
            state.docTypeList = docTypeList
        }
    },
    actions: {
        getDocuments({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    url: customConst.DOCUMENTS_STORAGE_API + 'document',
                    method: "GET",
                }).then((res) => {
                    commit('syncDocumentList', res.data.data.data)
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        getDocumentType({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.DOCUMENTS_STORAGE_API + 'document-type'
                }).then((res) => {
                    commit('syncDocType', res.data.data.data)
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
            })
        },
    },
    getters: {
        processedDocument(state) {
            return state.documentList.filter(item => item.project)
        },
        unprocessedDocument(state) {
            return state.documentList.filter(item => !item.project)
        },
        documentStorageType(state) {
            return state.docTypeList
        }
    }
}