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
                     url: customConst.REFERENCE_BOOK_API + 'asset/bulk-create/', // Используем новый endpoint
                     data: data // Отправляем массив активов
                 }).then(res=>{
                     if (res.data.success) {
                         resolve(res.data.data)
                     } else {
                         reject(new Error(res.data.error || 'Ошибка сохранения'))
                     }
                 }).catch(err=>{
                     if (err.response && err.response.data) {
                         const error = new Error(err.response.data.errors?.error || 'Ошибка сохранения');
                         error.response = err.response;
                         error.data = err.response.data;
                         reject(error);
                     } else {
                         reject(err);
                     }
                 })
             })
        }
    }
}