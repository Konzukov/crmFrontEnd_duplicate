import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "@/const/customConst";
import post from "@/store/modules/crm/post";
import saveAs from 'file-saver'

Vue.use(VueCookies)


export default {
    state: {
        file: '',
        fileList: [],
        filePostList: [],
        trashFile: [],
    },
    mutations: {
        addfile(state, file) {
            console.log(file)
            if (file['post'] === post.state.singlePost['pk']) {
                post.state.singlePost['files'].unshift(file)
            }
            state.fileList.unshift(file)
            state.filePostList.unshift(file)
        },
        fileDetail(state, file){
            state.file = file
        },
        downloadProgress(state, {file, progress, status}) {
            let downloadObj = {
                file: {
                    name: file,
                    status: {
                        downloading: status.downloading,
                        downloaded: status.downloaded,
                        message: status.message
                    },
                    progress: progress
                }
            }
            state.fileList.map(obj => {
                if (obj['fileName'] === file) {
                    obj['state'] = Object.assign({}, downloadObj)
                }
            })
        },
        uploadProgress(state, {file, progress, status}) {

        },
        addTrashFile(state, trashFile) {
            state.trashFile.unshift(trashFile)
            let singlePostFile = post.state.singlePost['files'].filter(file => {
                if (file['pk'] !== trashFile['file']['pk']) {
                    return file
                }
            })
            post.state.singlePost['files'] = singlePostFile
        }
    },
    actions: {
        createFile({commit}, {formData, file}) {
            let status;
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.FILE_MANAGER + 'create-file',
                    data: formData,
                    onUploadProgress: (progressEvent) => {
                        let progress = String(Math.round((progressEvent.loaded / progressEvent.total) * 100))
                        if (progress === '100') {
                            status = {
                                uploading: false,
                                uploaded: true,
                                error: false,
                                message: 'Загрузка завершена'
                            }
                        } else {
                            status = {
                                uploading: true,
                                uploaded: false,
                                error: false,
                                message: 'Загрузка ...'
                            }
                        }
                        commit('uploadProgress', {file: file['name'], status, progress})
                    }
                }).then((res) => {
                    console.log(res.data.data.data)
                    commit('addfile', res.data.data.data)
                    resolve()
                }).catch((err) => {
                    status = {
                        uploading: false,
                        uploaded: false,
                        error: true,
                        message: 'Ошибка при загрузке'
                    }
                    if (err.response.status === 444) {
                        status['errorMessage'] = err.response.data.errors.message
                    } else {
                        reject(err)
                    }
                    commit('uploadProgress', {file: file['name'], status, progress: null})
                })
            })
        },
        getFile({commit}, pk){
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.FILE_MANAGER + 'file-view/'+ pk,
                }).then(res=>{
                    commit('fileDetail', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err=>{
                    reject(err)
                })
            })
        },
        downloadFile({commit}, file) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.FILE_MANAGER + 'download-file/' + file['pk'],
                    responseType: 'blob',
                    onDownloadProgress: (progressEvent) => {
                        let status;
                        let progress = String(Math.round((progressEvent.loaded / progressEvent.total) * 100))
                        if (progress === '100') {
                            status = {
                                downloading: false,
                                downloaded: true,
                                message: 'Загрузка завершена'
                            }
                        } else {
                            status = {
                                downloading: true,
                                downloaded: false,
                                message: 'Загрузка ...'
                            }
                        }
                        commit('downloadProgress', {file: file['fileName'], status, progress})
                    }
                }).then(res => {
                    saveAs(res.data, file['fileName'])
                    // const url = window.URL.createObjectURL(new Blob([res.data]));
                    // const link = document.createElement('a');
                    // link.href = url;
                    // link.setAttribute('download', file['fileName']); //or any other extension
                    // document.body.appendChild(link);
                    // link.click();
                }).catch(err => {
                    reject(err)
                })
            })
        },
        createTrashFile({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.FILE_MANAGER + 'create-trash-file',
                    data: formData
                }).then(res => {
                    commit('addTrashFile', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },

    },
    getters: {}

}
