import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "@/const/customConst";
import axios from "axios";

Vue.use(VueCookies)

export default {
    actions: {
        async savePersonAssets({commit}, data){
             return await new Promise((resolve, reject)=>{
                 axios({
                     method: "POST",
                     url: customConst.REFERENCE_BOOK_API + 'asset/',
                     data
                 }).then(res=>{
                     resolve(res.data.data.data)
                 }).catch(err=>{
                     reject(err)
                 })
             })
        }
    }
}