import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";

Vue.use(VueCookies)


export default {
    state: {
        status: '',
        contactList: [],
        participantContractList: [],
    },
    mutations: {
        syncContractList(state, obj) {
            state.status = 'Contract sync success'
            state.contactList = obj
        },
        syncParticipantContractList(state, contractList) {
            state.participantContractList = contractList
        },
        addContract(state, newContract) {
            state.status = 'Contract create success'
            state.contactList.push(newContract)
        },
        updateContract(state, updatedContract) {
            state.status = 'Contract updated success'
            state.contactList = state.contactList.filter(contract => {
                if (contract['pk'] !== updatedContract['pk']) {
                    return contract
                }
            })
            state.contactList.push(updatedContract)
        },
        delContract(state, pk) {
            state.status = 'Delete success'
            state.contactList = state.contactList.filter(contract => {
                if (contract['pk'] !== pk) {
                    return contract
                }
            })
        }
    },
    actions: {
        getContractList({commit}) {
            axios({
                method: "GET",
                url: customConst.CRM_API + 'contract-list'
            }).then(response => {
                console.log(response)
                commit('syncContractList', response.data.data.data)
            })
        },
        getParticipantContractList({commit}, params) {
            axios({
                method: "GET",
                url: customConst.CRM_API + 'contract-list/' + params.participantPk + '/' + params.directionPk
            }).then((response) => {
                commit('syncParticipantContractList', response.data.data.data)
            })
        },
        createContract({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.CRM_API + 'contract-create',
                    data: formData
                }).then((response) => {
                    commit('addContract', response.data.data.data)
                    resolve()
                }).catch(error => {
                    reject(error)
                })
            })
        },
        changeContract({commit}, obj) {
            axios({
                method: "PUT",
                url: customConst.CRM_API + 'contract-update/' + obj['pk'],
                data: obj['formData']
            }).then((response) => {
                commit('updateContract', response.data.data.data)
            })
        },
        deleteContract({commit}, pk) {
            axios({
                method: 'DELETE',
                url: customConst.CRM_API + 'contract-delete/' + pk
            }).then(() => {
                commit('delContract', pk)
            })
        },
    },
    getters: {
        contractListData(state) {
            return state.contactList
        },
        participantContractListData(state) {
            return state.participantContractList
        }
    }
}