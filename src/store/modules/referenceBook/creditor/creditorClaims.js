import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "@/const/customConst";

Vue.use(VueCookies)

const state = {
    creditorClaims: []
};

const getters = {
    creditorClaimsData: state => state.creditorClaims
};

const actions = {
    async fetchCreditorClaims({commit}, projectId) {
        try {
            const response = await axios({
                method: "GET",
                url: customConst.REFERENCE_BOOK_API + 'creditor-claims/',
                params: {project_id: projectId}
            });
            commit('SET_CREDITOR_CLAIMS', response.data.data.data);
        } catch (error) {
            console.error('Ошибка загрузки требований кредиторов:', error);
        }
    },

    async saveCreditorClaim({commit, dispatch}, claimData) {
        try {
            const url = `${customConst.REFERENCE_BOOK_API}creditor-claims/`;
            const response = await axios.post(url, claimData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // После сохранения обновляем список требований для проекта
            if (claimData.project_id) {
                dispatch('fetchCreditorClaims', claimData.project_id);
            }
            return response.data;
        } catch (error) {
            console.error('Ошибка сохранения требования:', error);
            throw error;
        }
    },

    async updateCreditorClaim({commit, dispatch}, {id, data}) {
        try {
            const url = `${customConst.REFERENCE_BOOK_API}creditor-claims/${id}/`;
            const response = await axios.put(url, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // После обновления обновляем список требований для проекта
            if (data.project_id) {
                dispatch('fetchCreditorClaims', data.project_id);
            }
            return response.data;
        } catch (error) {
            console.error('Ошибка обновления требования:', error);
            throw error;
        }
    }
};

const mutations = {
    SET_CREDITOR_CLAIMS(state, claims) {
        state.creditorClaims = claims;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};