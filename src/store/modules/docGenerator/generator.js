import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";

Vue.use(VueCookies)

export default {
    state: {
        docTemplate: [],
        templateField: []
    },
    mutations: {
        syncDocTemplate(state, template) {
            state.docTemplate = template
        },
        syncTemplateFields(state, fields) {
            state.templateField = fields
        }
    },
    actions: {
        getDocTemplate({commit}) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.GENERATOR + 'document-template/'
                }).then((res) => {
                    commit('syncDocTemplate', res.data.data.data)
                    console.log(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getTemplateFields({commit}, template) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.GENERATOR + 'template-fields/' + template
                }).then(res => {
                    commit('syncTemplateFields', res.data.data.data)
                    console.log(res.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        generateDocument({commit}, {formData, fileName}) {
            console.log('Start generate document')
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.GENERATOR + 'generate-document',
                    data: formData,
                    responseType: "arraybuffer",
                }).then(res => {
                    console.log(res)
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', fileName); //or any other extension
                    document.body.appendChild(link);
                    link.click();
                }).catch(err => {
                    console.log(err)
                })
            })

        }
    },
    getters: {
        docTemplateData(state) {
            return state.docTemplate
        },
        templateFieldsData(state) {
            return state.templateField
        }

    }

}
