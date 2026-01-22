import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "@/const/customConst";
import axios from "axios";

Vue.use(VueCookies)

export default {
    state: {
        assets: [],
        loading: false,
        error: null
    },
    mutations: {
        SET_ASSETS(state, assets) {
            state.assets = assets;
        },
        SET_LOADING(state, loading) {
            state.loading = loading;
        },
    },
    actions: {
        async fetchAssets({commit}) {
            commit('SET_LOADING', true);
            return await new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'asset',
                }).then(res => {
                    commit('SET_ASSETS', res.data.data.data);
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        async savePersonAssets({commit}, data) {
            return await new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'asset/bulk-create/',
                    data: data
                }).then(res => {
                    console.log('Полный ответ от сервера:', res);
                    // Проверяем структуру ответа - у вас response.data.data.data
                    if (res.data && res.data.data && res.data.data.success) {
                        // Возвращаем data из ответа
                        resolve(res.data.data.data)
                    } else {
                        // Если структура не соответствует ожидаемой
                        reject(new Error('Неверная структура ответа от сервера'))
                    }
                }).catch(err => {
                    console.error('Ошибка запроса:', err);
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
        },
        async updateAsset({commit}, asset) {
            console.log(asset)
            console.log(asset.id)
            return await new Promise((resolve, reject) => {
                axios({
                    method: "PUT",
                    url: customConst.REFERENCE_BOOK_API + `asset/${asset.id}/`,
                    data: asset
                }).then(res=>{
                    console.log(res)
                    resolve(res)
                }).catch(err=>{
                    console.log(err)
                    reject(err)
                })
            })
        },
        async deleteAsset({commit}, asset){
            return new Promise((resolve, reject) => {
                axios({
                    method: "DELETE",
                    url: customConst.REFERENCE_BOOK_API + `asset/${asset.id}/`,
                }).then(res=>{
                    resolve(res)
                }).catch(err=>{
                    reject(err)
                })
            })
        }
    },
    getters: {
        assetsList: state => state.assets,
    }
}