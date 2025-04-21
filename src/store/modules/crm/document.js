import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";
import {eventBus} from "../../../bus";
import {saveAs} from 'file-saver'

Vue.use(VueCookies)


export default {
    state: {
        status: '',
        processedDocumentList: [],
        unProcessedDocumentList: [],
        trashDocumentList: [],
        projectDocumentList: [],
        documentDetail: '',
        uploadingTemplates: '',
        docType: [],
        correspondenceType: [],
        docSendQueue: []
    },
    mutations: {
        addDocument(state, newDoc) {
            if (newDoc['processed']) {
                state.processedDocumentList.push(newDoc)
            } else {
                state.unProcessedDocumentList.push(newDoc)
            }
        },
        updateDocument(state, doc) {
            console.log(doc)
            state.processedDocumentList = state.processedDocumentList.filter(obj => {
                console.log(obj)
                if (obj.pk !== doc.pk) {
                    console.log(obj, doc)
                    return obj
                }
            })
            state.unProcessedDocumentList = state.unProcessedDocumentList.filter(obj => {
                console.log(obj)
                if (obj.pk !== doc.pk) {
                    return obj
                }
            })
            if (doc['processed']) {
                state.processedDocumentList.push(doc)
            } else {
                state.unProcessedDocumentList.push(doc)
            }
        },
        syncProcessedDocument(state, docList) {
            state.processedDocumentList = docList
        },
        syncUnProcessedDocument(state, docList) {
            state.unProcessedDocumentList = docList
        },
        syncTrashDocument(state, docList) {
            state.trashDocumentList = docList
        },
        syncProjectDocument(state, docList) {
            state.projectDocumentList = docList
        },
        addToTrash(state, pk) {
            state.processedDocumentList = state.processedDocumentList.filter(obj => {
                if (obj.pk !== pk) {
                    return obj
                }
            })
            state.unProcessedDocumentList = state.unProcessedDocumentList.filter(obj => {
                if (obj.pk !== pk) {
                    return obj
                }
            })

        },
        delFromTrash(state, pk) {
            state.trashDocumentList = state.trashDocumentList.filter(obj => {
                if (obj['pk'] !== pk) {
                    return obj
                }
            })
        },
        restore(state, pk) {
            state.trashDocumentList = state.trashDocumentList.filter(obj => {
                console.log(obj['pk'], pk)
                if (obj['pk'] !== pk) {
                    return obj
                }
            })
        },
        syncDocumentDetail(state, doc) {
            state.documentDetail = doc
        },
        syncUploadingTemplates(state, templates) {
            state.uploadingTemplates = templates
        },
        syncDocType(state, docTypeList) {
            state.docType = docTypeList
        },
        syncCorrespondenceType(state, correspondenceTypeList) {
            state.correspondenceType = correspondenceTypeList
        },
        syncDocSendQueue(state, docSend) {
            console.log(docSend)
            state.docSendQueue = [...docSend]
        },
        syncDelDocSendQueue(state, id) {
            const index = state.docSendQueue.findIndex(i => i.id === id);
            if (index !== -1) {
                state.docSendQueue.splice(index, 1);
            }
        }
    },
    actions: {
        async saveDocument({commit}, {formData, template, file, force}) {
            return await new Promise(async (resolve, reject) => {
                setTimeout(async () => {
                    await axios({
                        method: 'POST',
                        url: customConst.PAPERFLOW_API + 'document-create',
                        data: formData,
                        params: {
                            template: template.id,
                            force: force
                        },
                        onUploadProgress: (progressEvent) => {
                            let progress = String(Math.round((progressEvent.loaded / progressEvent.total) * 100))
                            eventBus.$emit('updateProgress', {progress, file})
                        }

                    }).then(async (response) => {
                        commit('addDocument', response.data.data.data)
                        await resolve(response.data.data.data)
                    }).catch(async (error) => {
                        await reject(error)
                    })
                }, 1000)

            })
        },
        editDocument({commit}, obj) {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'PUT',
                    url: customConst.PAPERFLOW_API + 'document-edit/' + obj.pk,
                    data: obj.formData,
                }).then((response) => {
                    commit('updateDocument', response.data.data.data)
                    resolve()
                }).catch((error) => {
                    reject(error)
                })
            })
        },
        changeDocumentFile({commit}, obj) {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'PUT',
                    url: customConst.PAPERFLOW_API + 'document-change-file/' + obj.pk,
                    data: obj.formData,
                    onUploadProgress: (progressEvent) => {
                        let progress = String(Math.round((progressEvent.loaded / progressEvent.total) * 100))
                        eventBus.$emit('updateProgress', {progress})
                    }
                }).then((response) => {
                    commit('updateDocument', response.data.data.data)
                    resolve()
                }).catch((error) => {
                    reject(error)
                })
            })
        },
        getDocumentDetail({commit}, pk) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.PAPERFLOW_API + 'single-document/' + pk
                }).then((response) => {
                    commit('syncDocumentDetail', response.data.data.data)
                    resolve(response.data.data.data)
                }).catch((error) => {
                    reject(error)
                })
            })
        },
        getProcessedDocument({commit}, {date, project, user, tags}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.PAPERFLOW_API + 'processed-document-list',
                    params: {
                        date: date,
                        project: project,
                        user: user,
                        tags: tags.toString()
                    }
                }).then((response) => {
                    commit('syncProcessedDocument', response.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })

        },
        getUnProcessedDocument({commit}) {
            axios({
                method: "GET",
                url: customConst.PAPERFLOW_API + 'unprocessed-document-list'
            }).then((response) => {
                commit('syncUnProcessedDocument', response.data.data.data)
            })
        },
        getTrashDocument({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.PAPERFLOW_API + 'trash-document-list'
                }).then((response) => {
                    commit('syncTrashDocument', response.data.data.data)
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
            })

        },
        getProjectDocument({commit}, project) {
            console.log(project)
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.PAPERFLOW_API + 'project-document-list',
                    params: {
                        project: project,
                    }
                }).then((response) => {
                    commit('syncProjectDocument', response.data.data.data)
                    resolve(response.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        downloadDocument({commit}, {pk, fileName}) {
            console.log(pk, fileName)
            axios({
                method: "GET",
                url: customConst.PAPERFLOW_API + 'document-download/' + pk,
                responseType: 'blob',
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.total !== null) {
                        console.log(Math.round((progressEvent.loaded * 100) / (progressEvent.total * 100)))
                    }
                },
            }).then((response) => {
                saveAs(response.data, fileName)
                // console.log(response.request.getResponseHeader('filename'))
                // const url = window.URL.createObjectURL(new Blob([response.data]));
                // const link = document.createElement('a');
                // link.href = url;
                // link.setAttribute('download', fileName); //or any other extension
                // document.body.appendChild(link);
                // link.click();
            })
        },
        addTrashDocument({commit}, {pk, formData}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.PAPERFLOW_API + 'document-delete',
                    data: formData
                }).then((response) => {
                    commit('addToTrash', pk)
                    resolve()
                }).catch((err) => {
                    resolve(err)
                })
            })
        },
        delTrashDocument({commit}, pk) {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'DELETE',
                    url: customConst.PAPERFLOW_API + 'document-delete-trash/' + pk
                }).then(response => {
                    commit('delFromTrash', pk)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        restoreDocument({commit}, pk) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.PAPERFLOW_API + 'document-restore/' + pk
                }).then((response) => {
                    commit('restore', pk)
                    commit('addDocument', response.data.data)
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        getUploadingTemplates({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.PAPERFLOW_API + 'uploading-templates'
                }).then((response) => {
                    commit('syncUploadingTemplates', response.data.data.data)
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        getCorrespondenceType({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.PAPERFLOW_API + 'correspondence-type',
                }).then(res => {
                    commit('syncCorrespondenceType', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getDocType({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.PAPERFLOW_API + 'doc-type',
                }).then(res => {

                    commit('syncDocType', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        addDocsToTask({commit}, docs) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.PAPERFLOW_API + 'add-docs-to-task',
                    data: docs
                }).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        async addDocToPost({commit}, formData) {
            return await new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.PAPERFLOW_API + "add-doc-to-post",
                    data: formData
                }).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        async addDocsToEvent({commit}, docs) {
            return await new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.PAPERFLOW_API + 'add-docs-to-event',
                    data: docs
                }).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        async getProjectAct({commit}, projectPk) {
            return new Promise(resolve => {
                axios({
                    method: "GET",
                    url: customConst.PAPERFLOW_API + `judicial-act/${projectPk}/list/`,
                }).then(res => {
                    resolve(res)
                })
            })
        },
        async getDocumentSendQueue({commit}) {
            return await new Promise(async (resolve, reject) => {
                await axios({
                    method: "GET",
                    url: customConst.PAPERFLOW_API + 'document-send-queue'
                }).then(res => {
                    console.log(res.data.data.data)
                    commit('syncDocSendQueue', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        deleteDocumentSendQueue({commit}, {id, formData}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "DELETE",
                    url: customConst.PAPERFLOW_API + 'document-send-queue/' + id,
                    data: formData
                }).then(res => {
                    commit('syncDelDocSendQueue', id)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        sendDocumentQueue({commit}, {formData, sendMethod}) {
            return new Promise((resolve, reject) => {
                let responseType = 'json'
                if (sendMethod !== "Email") {
                    responseType = 'blob'
                }
                axios({
                    method: "POST",
                    url: customConst.PAPERFLOW_API + 'document-send-queue/send/',
                    // url: 'http://192.168.1.108:9893/api/paper-flow/' + 'document-send-queue/send/',
                    data: formData,
                    responseType: responseType,
                }).then(res => {
                    console.log(sendMethod)
                    if (sendMethod !== "Email") {
                        saveAs(res.data, 'otpravka.zip')
                    }
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        changeCommunicationMethod({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.PAPERFLOW_API + 'document-send-queue/change-communication/',
                    data: formData
                }).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        addToSendQueue({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.PAPERFLOW_API + 'document-send-queue/add-to-send-queue/',
                    data: formData
                }).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        yamlProcessing({commit}, {formData, file}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.PAPERFLOW_API + "processing-yaml",
                    data: formData,
                    onUploadProgress: (progressEvent) => {
                        let progress = String(Math.round((progressEvent.loaded / progressEvent.total) * 100))
                        eventBus.$emit('updateProgress', {progress, file})
                    }
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getEmailConf({commit}){
          return new Promise((resolve, reject) => {
              axios({
                  method: "GET",
                  url: customConst.PAPERFLOW_API + 'get-email-conf'
              }).then(res=>{
                  resolve(res.data.data.data)
              }).catch(err=>{
                  reject(err)
              })
          })
        },
        getCert({commit}){
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                     url: customConst.PAPERFLOW_API + "processing-yaml",
                })
            })
        }

    },
    getters: {
        processedDocumentListData(state) {
            return state.processedDocumentList
        },
        unProcessedDocumentListData(state) {
            return state.unProcessedDocumentList
        },
        projectDocumentListData(state) {
            return state.projectDocumentList
        },
        trashDocumentListData(state) {
            return state.trashDocumentList
        },
        singleDocumentData(state) {
            return state.documentDetail
        },
        uploadingTemplatesData(state) {
            return state.uploadingTemplates
        },
        docTypeData(state) {
            return state.docType
        },
        correspondenceTypeData(state) {
            return state.correspondenceType
        },
        docQueueData(state) {
            return state.docSendQueue
        }
    }
}