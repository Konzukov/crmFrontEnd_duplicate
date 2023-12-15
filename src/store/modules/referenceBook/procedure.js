import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";


Vue.use(VueCookies)


export default {
    actions: {
        savePersonalInfo(commit, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'POST',
                    url: customConst.PROCEDURE + 'questionnaire/',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: formData
                })
            })
        },
        saveCreditorClaim({commit}, formData){
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'creditors-claims/',
                    data:formData
                }).then((res=>{
                    resolve(res.data.data.data)
                })).catch(err=>{
                    reject(err)
                })
            })
        },
        editCreditorClaim({commit}, {formData, id}){
            return new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.REFERENCE_BOOK_API  +'creditors-claims/'+ `${id}/`,
                    data:formData
                }).then((res=>{
                    resolve(res.data.data.data)
                })).catch(err=>{
                    reject(err)
                })
            })
        },
    }

}