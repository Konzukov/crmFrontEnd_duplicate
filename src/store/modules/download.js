import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "@/const/customConst";
import {saveAs} from 'file-saver'

Vue.use(VueCookies)

// store/modules/downloads.js
const state = {
    downloads: []
}

const mutations = {
    ADD_DOWNLOAD: (state, download) => {
        state.downloads.push({
            ...download,
            loaded: 0,
            total: 0,
            progress: 0,
            status: 'pending'
        })
    },
    UPDATE_DOWNLOAD: (state, {id, progress, loaded, total, status}) => {
        const index = state.downloads.findIndex(d => d.id === id)
        if (index !== -1) {
            const download = state.downloads[index]
            if (progress !== undefined) download.progress = progress
            if (loaded !== undefined) download.loaded = loaded
            if (total !== undefined) download.total = total
            if (status !== undefined) download.status = status

            // Обновляем Vue реактивность
            state.downloads.splice(index, 1, {...download})
        }
    },
    REMOVE_DOWNLOAD: (state, id) => {
        state.downloads = state.downloads.filter(d => d.id !== id)
    }
}

const actions = {
    addDownload({commit}, download) {
        commit('ADD_DOWNLOAD', download)
    },
    updateDownload({commit}, payload) {
        commit('UPDATE_DOWNLOAD', payload)
    },
    removeDownload({commit}, id) {
        commit('REMOVE_DOWNLOAD', id)
    },
    clearCompletedDownloads({commit, state}) {
        state.downloads
            .filter(d => d.status === 'completed' || d.status === 'error')
            .forEach(d => commit('REMOVE_DOWNLOAD', d.id))
    },
    clearAllDownloads({commit, state}) {
        state.downloads.forEach(d => commit('REMOVE_DOWNLOAD', d.id))
    },
    downloadFile({commit, dispatch}, {id, fileName, downloadId}) {
        dispatch('updateDownload', {
            id: downloadId,
            status: 'downloading'
        })
        axios({
            method: "GET",
            url: customConst.DOCUMENT_FLOW + `file/${id}/download/`,
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
                const loaded = progressEvent.loaded

                if (progressEvent.lengthComputable) {
                    const total = progressEvent.total
                    const progress = Math.round((loaded * 100) / total)

                    // Убрали {root: true}
                    dispatch('updateDownload', {
                        id: downloadId,
                        progress,
                        loaded,
                        total,
                        status: 'downloading'
                    })
                } else {
                    // Убрали {root: true}
                    dispatch('updateDownload', {
                        id: downloadId,
                        loaded,
                        status: 'downloading'
                    })
                }
            },
        }).then((response) => {
            saveAs(response.data, fileName)
            dispatch('updateDownload', {
                id: downloadId,
                progress: 100,
                status: 'completed'
            })
            setTimeout(() => {
                dispatch('removeDownload', downloadId)
            }, 5000)
        }).catch((error) => {
            console.error('Download error:', error)
            dispatch('updateDownload', {
                id: downloadId,
                status: 'error'
            })
            setTimeout(() => {
                dispatch('removeDownload', downloadId)
            }, 10000)
        })
    },
    downloadDocument({commit, dispatch}, {pk, fileName, downloadId}) {
        dispatch('updateDownload', {
            id: downloadId,
            status: 'downloading'
        })
        axios({
            method: "GET",
            url: customConst.PAPERFLOW_API + 'document-download/' + pk,
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
                const loaded = progressEvent.loaded

                if (progressEvent.lengthComputable) {
                    const total = progressEvent.total
                    const progress = Math.round((loaded * 100) / total)

                    // Убрали {root: true}
                    dispatch('updateDownload', {
                        id: downloadId,
                        progress,
                        loaded,
                        total,
                        status: 'downloading'
                    })
                } else {
                    // Убрали {root: true}
                    dispatch('updateDownload', {
                        id: downloadId,
                        loaded,
                        status: 'downloading'
                    })
                }
            },
        }).then((response) => {
            saveAs(response.data, fileName)
            dispatch('updateDownload', {
                id: downloadId,
                progress: 100,
                status: 'completed'
            })
            setTimeout(() => {
                dispatch('removeDownload', downloadId)
            }, 5000)
        }).catch((error) => {
            console.error('Download error:', error)
            dispatch('updateDownload', {
                id: downloadId,
                status: 'error'
            })
            setTimeout(() => {
                dispatch('removeDownload', downloadId)
            }, 10000)
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}