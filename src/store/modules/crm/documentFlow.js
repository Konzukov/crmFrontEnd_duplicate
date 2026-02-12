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
        currentDocument: null,
        documentTypes: [],
        workflowStates: [],
        correspondence: [],
        currentCorrespondence: null,
        mailAccounts: [],
        createOptions: null,
        loading: {
            documents: false,
            document: false,
            correspondence: false,
            types: false,
            states: false
        },
        filters: {
            direction: null,
            current_state: null,
            document_type: null,
            project: null,
            ordering: '-created_at'
        }
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
        },
        SET_DOCUMENTS(state, documents) {
            state.documents = documents
        },
        SET_CURRENT_DOCUMENT(state, document) {
            state.currentDocument = document
        },
        UPDATE_DOCUMENT(state, document) {
            const index = state.documents.findIndex(d => d.id === document.id)
            if (index !== -1) {
                Vue.set(state.documents, index, document)
            }
            if (state.currentDocument && state.currentDocument.id === document.id) {
                state.currentDocument = document
            }
        },
        REMOVE_DOCUMENT(state, documentId) {
            state.documents = state.documents.filter(d => d.id !== documentId)
            if (state.currentDocument && state.currentDocument.id === documentId) {
                state.currentDocument = null
            }
        },
        SET_DOCUMENT_TYPES(state, types) {
            state.documentTypes = types
        },
        SET_WORKFLOW_STATES(state, states) {
            state.workflowStates = states
        },
        SET_CORRESPONDENCE(state, correspondence) {
            state.correspondence = correspondence
        },
        SET_CURRENT_CORRESPONDENCE(state, correspondence) {
            state.currentCorrespondence = correspondence
        },
        ADD_CORRESPONDENCE(state, correspondence) {
            state.correspondence.push(correspondence)
        },
        SET_MAIL_ACCOUNTS(state, accounts) {
            state.mailAccounts = accounts
        },
        SET_LOADING(state, {key, value}) {
            state.loading[key] = value
        },
        SET_FILTERS(state, filters) {
            state.filters = {...state.filters, ...filters}
        },
        REMOVE_FILE(state, fileId) {
            state.file = state.file.filter(f => f.id !== fileId)
        }
    },
    actions: {
        async fetchDocuments({commit, state}) {
            commit('SET_LOADING', {key: 'documents', value: true})
            try {
                const params = {}
                if (state.filters.direction) params.direction = state.filters.direction
                if (state.filters.current_state) params.current_state = state.filters.current_state
                if (state.filters.document_type) params.document_type = state.filters.document_type
                if (state.filters.project) params.project = state.filters.project
                if (state.filters.ordering) params.ordering = state.filters.ordering
                
                const res = await axios.get(customConst.DOCUMENT_FLOW + 'documents/', {params})
                commit('SET_DOCUMENTS', res.data.data)
                return res.data.data
            } catch (err) {
                console.error('Error fetching documents:', err)
                throw err
            } finally {
                commit('SET_LOADING', {key: 'documents', value: false})
            }
        },
        async fetchDocument({commit}, id) {
            commit('SET_LOADING', {key: 'document', value: true})
            try {
                const res = await axios.get(customConst.DOCUMENT_FLOW + `documents/${id}/`)
                commit('SET_CURRENT_DOCUMENT', res.data.data)
                return res.data.data
            } catch (err) {
                console.error('Error fetching document:', err)
                throw err
            } finally {
                commit('SET_LOADING', {key: 'document', value: false})
            }
        },
        async fetchCreateOptions({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.DOCUMENT_FLOW + 'documents/create_options/'
                }).then(res => {
                    commit('SET_CREATE_OPTIONS', res.data.data)
                    resolve(res.data.data)
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
                axios.post(customConst.DOCUMENT_FLOW + 'documents/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(res => {
                    commit('ADD_DOCUMENT', res.data.data)
                    resolve(res.data.data)
                }).catch(err => {
                    console.error('Error creating document:', err)
                    reject(err)
                })
            })
        },
        async updateDocument({commit}, {id, data}) {
            try {
                const formData = new FormData()
                Object.keys(data).forEach(key => {
                    if (data[key] !== null && data[key] !== undefined) {
                        formData.append(key, data[key])
                    }
                })
                
                const res = await axios.patch(customConst.DOCUMENT_FLOW + `documents/${id}/`, formData)
                commit('UPDATE_DOCUMENT', res.data.data)
                return res.data.data
            } catch (err) {
                console.error('Error updating document:', err)
                throw err
            }
        },
        async deleteDocument({commit}, id) {
            try {
                await axios.delete(customConst.DOCUMENT_FLOW + `documents/${id}/`)
                commit('REMOVE_DOCUMENT', id)
            } catch (err) {
                console.error('Error deleting document:', err)
                throw err
            }
        },
        async changeDocumentState({commit}, {documentId, stateId, comment}) {
            try {
                const res = await axios.post(
                    customConst.DOCUMENT_FLOW + `documents/${documentId}/change_state/`,
                    {state_id: stateId, comment}
                )
                commit('UPDATE_DOCUMENT', res.data.data)
                return res.data.data
            } catch (err) {
                console.error('Error changing document state:', err)
                throw err
            }
        },
        async addFilesToDocument({commit}, {documentId, fileIds}) {
            try {
                const res = await axios.post(
                    customConst.DOCUMENT_FLOW + `documents/${documentId}/add_files/`,
                    {file_ids: fileIds}
                )
                commit('UPDATE_DOCUMENT', res.data.data)
                return res.data.data
            } catch (err) {
                console.error('Error adding files:', err)
                throw err
            }
        },
        async removeFilesFromDocument({commit}, {documentId, fileIds}) {
            try {
                const res = await axios.post(
                    customConst.DOCUMENT_FLOW + `documents/${documentId}/remove_files/`,
                    {file_ids: fileIds}
                )
                commit('UPDATE_DOCUMENT', res.data.data)
                return res.data.data
            } catch (err) {
                console.error('Error removing files:', err)
                throw err
            }
        },
        async addSignatory({commit}, {documentId, signatoryId, signatureFileId, comment}) {
            try {
                const res = await axios.post(
                    customConst.DOCUMENT_FLOW + `documents/${documentId}/add_signatory/`,
                    {signatory_id: signatoryId, signature_file_id: signatureFileId, comment}
                )
                commit('UPDATE_DOCUMENT', res.data.data)
                return res.data.data
            } catch (err) {
                console.error('Error adding signatory:', err)
                throw err
            }
        },
        async removeSignatory({commit}, {documentId, signatoryId}) {
            try {
                const res = await axios.post(
                    customConst.DOCUMENT_FLOW + `documents/${documentId}/remove_signatory/`,
                    {signatory_id: signatoryId}
                )
                commit('UPDATE_DOCUMENT', res.data.data)
                return res.data.data
            } catch (err) {
                console.error('Error removing signatory:', err)
                throw err
            }
        },
        async fetchDocumentTypes({commit}) {
            commit('SET_LOADING', {key: 'types', value: true})
            try {
                const res = await axios.get(customConst.DOCUMENT_FLOW + 'document-types/')
                commit('SET_DOCUMENT_TYPES', res.data.data)
                return res.data.data
            } catch (err) {
                console.error('Error fetching document types:', err)
                throw err
            } finally {
                commit('SET_LOADING', {key: 'types', value: false})
            }
        },
        async fetchWorkflowStates({commit}) {
            commit('SET_LOADING', {key: 'states', value: true})
            try {
                const res = await axios.get(customConst.DOCUMENT_FLOW + 'workflow-states/')
                commit('SET_WORKFLOW_STATES', res.data.data)
                return res.data.data
            } catch (err) {
                console.error('Error fetching workflow states:', err)
                throw err
            } finally {
                commit('SET_LOADING', {key: 'states', value: false})
            }
        },
        async fetchCorrespondence({commit}) {
            commit('SET_LOADING', {key: 'correspondence', value: true})
            try {
                const res = await axios.get(customConst.DOCUMENT_FLOW + 'correspondence/')
                commit('SET_CORRESPONDENCE', res.data.data)
                return res.data.data
            } catch (err) {
                console.error('Error fetching correspondence:', err)
                throw err
            } finally {
                commit('SET_LOADING', {key: 'correspondence', value: false})
            }
        },
        async fetchCorrespondenceDetail({commit}, id) {
            try {
                const res = await axios.get(customConst.DOCUMENT_FLOW + `correspondence/${id}/`)
                commit('SET_CURRENT_CORRESPONDENCE', res.data.data)
                return res.data.data
            } catch (err) {
                console.error('Error fetching correspondence detail:', err)
                throw err
            }
        },
        async createCorrespondence({commit}, data) {
            try {
                const res = await axios.post(customConst.DOCUMENT_FLOW + 'correspondence/', data)
                commit('ADD_CORRESPONDENCE', res.data.data)
                return res.data.data
            } catch (err) {
                console.error('Error creating correspondence:', err)
                throw err
            }
        },
        async addDocumentsToCorrespondence({commit}, {correspondenceId, documents}) {
            try {
                const res = await axios.post(
                    customConst.DOCUMENT_FLOW + `correspondence/${correspondenceId}/add_documents/`,
                    {documents}
                )
                commit('SET_CURRENT_CORRESPONDENCE', res.data.data)
                return res.data.data
            } catch (err) {
                console.error('Error adding documents to correspondence:', err)
                throw err
            }
        },
        async removeDocumentsFromCorrespondence({commit}, {correspondenceId, documentIds}) {
            try {
                const res = await axios.post(
                    customConst.DOCUMENT_FLOW + `correspondence/${correspondenceId}/remove_documents/`,
                    {document_ids: documentIds}
                )
                commit('SET_CURRENT_CORRESPONDENCE', res.data.data)
                return res.data.data
            } catch (err) {
                console.error('Error removing documents from correspondence:', err)
                throw err
            }
        },
        async fetchMailAccounts({commit}) {
            try {
                const res = await axios.get(customConst.DOCUMENT_FLOW + 'mail-accounts/')
                commit('SET_MAIL_ACCOUNTS', res.data.data)
                return res.data.data
            } catch (err) {
                console.error('Error fetching mail accounts:', err)
                throw err
            }
        },
        async fetchFileList({commit}) {
            return await new Promise((resolve, reject) => {
                axios.get(customConst.DOCUMENT_FLOW + 'file/').then(res => {
                    commit('SET_FILE_LIST', res.data.data)
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
                        commit('UPDATE_FILE_LIST', res.data.data);
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
                    resolve(res.data.data)
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
                    commit('REMOVE_FILE', id)
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        }
    },
    getters: {
        getFileList: s => s.file,
        getCreateOptions: state => state.createOptions,
        getDocuments: state => state.documents,
        getCurrentDocument: state => state.currentDocument,
        getDocumentTypes: state => state.documentTypes,
        getWorkflowStates: state => state.workflowStates,
        getCorrespondence: state => state.correspondence,
        getCurrentCorrespondence: state => state.currentCorrespondence,
        getMailAccounts: state => state.mailAccounts,
        getLoading: state => state.loading,
        getFilters: state => state.filters
    }
}

