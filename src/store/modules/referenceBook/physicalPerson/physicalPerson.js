import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "@/const/customConst";
import axios from "axios";

Vue.use(VueCookies)

export default {
    state: {
        physicalPersonList: []
    },
    mutations: {
        syncPhysicalPerson(state, data){
            state.physicalPersonList = [...data]
        }
    },
    actions: {
        async getPhysicalPersonV2({commit}) {
             return await new Promise((resolve, reject) => {
                 axios({
                     method: "GET",
                     url: customConst.REFERENCE_BOOK_API + 'physical-person-v2'
                 }).then(res=>{
                     commit('syncPhysicalPerson', res.data.data.data)
                     resolve(res.data.data.data)
                 }).catch(err=>{
                     reject(err)
                 })
             })
        }
    },
    getters: {
        physicalPersonListDataV2(state){
            return state.physicalPersonList
        }
    }
}