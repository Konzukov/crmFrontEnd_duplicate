import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "@/const/customConst";

Vue.use(VueCookies)

export default {
    namespaced: true,
    state: {
        file: [],
        documents: [],
        createOptions: null
    },
    mutations: {
        SET_FILE_LIST(state, data) {
            state.file = [...data]
        },
        UPDATE_FILE_LIST(state, data) {
            state.file.push(data)
        },
        SET_CREATE_OPTIONS: (state, options) => {
            state.createOptions = options
        },
        ADD_DOCUMENT: (state, document) => {
            state.documents.push(document)
        }
    },
    actions: {
        async fetchCreateOptions({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.DOCUMENT_FLOW + 'documents/create_options/'
                }).then(res => {
                    commit('SET_CREATE_OPTIONS', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    console.error('Error fetching create options:', err)
                    reject(err)
                })
            })
        },
        async createDocument({commit}, documentData) {
            const formData = new FormData()

            // Добавляем основные поля документа
            Object.keys(documentData).forEach(key => {
                if (key !== 'existing_files' && key !== 'new_files' && key !== 'file_descriptions') {
                    if (documentData[key] !== null && documentData[key] !== undefined) {
                        formData.append(key, documentData[key])
                    }
                }
            })

            // Добавляем существующие файлы
            if (documentData.existing_files) {
                documentData.existing_files.forEach(fileId => {
                    formData.append('existing_files', fileId)
                })
            }

            // Добавляем новые файлы
            if (documentData.new_files) {
                documentData.new_files.forEach(file => {
                    formData.append('new_files', file)
                })
            }

            // Добавляем описания файлов
            if (documentData.file_descriptions) {
                Object.keys(documentData.file_descriptions).forEach(fileKey => {
                    formData.append(`file_descriptions[${fileKey}]`, documentData.file_descriptions[fileKey])
                })
            }
            return new Promise((resolve, reject) => {
                axios.post(customConst.DOCUMENT_FLOW + '/api/documents/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(res => {
                    commit('ADD_DOCUMENT', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    console.error('Error creating document:', err)
                    reject(err)
                })
            })
        },
        async fetchFileList({commit}) {
            return await new Promise((resolve, reject) => {
                axios.get(customConst.DOCUMENT_FLOW + 'file').then(res => {
                    commit('SET_FILE_LIST', res.data.data.data)
                    resolve(res)
                }).catch(err => {
                    console.log(err)
                    reject(err)
                })
            })
        },
        async uploadFile({commit}, {formData, onProgress}) {
            return new Promise((resolve, reject) => {
                axios.post(customConst.DOCUMENT_FLOW + 'file/', formData, {
                    onUploadProgress: (progressEvent) => {
                        if (onProgress) {
                            const progress = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            onProgress(progress);
                        }
                    }
                })
                    .then(res => {
                        commit('UPDATE_FILE_LIST', res.data.data.data);
                        resolve(res.data);
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        },
        async fileDeleteInfo({commit}, id) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.DOCUMENT_FLOW + `file/${id}/delete_info/`,
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        async safeDelete({commit}, id) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "DELETE",
                    url: customConst.DOCUMENT_FLOW + `file/${id}/safe_delete`
                }).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        }
    },
    getters: {
        getFileList: s => s.file,
        getCreateOptions: state => state.createOptions
    }
}

