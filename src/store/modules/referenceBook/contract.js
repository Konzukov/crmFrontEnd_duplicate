import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";

Vue.use(VueCookies)


export default {
    state: {
        status: '',
        contactList: [],
        contractorContractList: [],
        participantContractList: '',
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
            const contractor = state.contractorContractList.length > 0 ? state.contractorContractList[0] : null
            if (contractor && contractor.contractor.pk === newContract.contractor.pk){
                state.contractorContractList.push(newContract)
            }
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
        },
        syncContractorContractList(state, contractList){
            state.contractorContractList = contractList
        }
    },
    actions: {
        getContractList({commit}) {
            axios({
                method: "GET",
                url: customConst.REFERENCE_BOOK_API + 'contract-list'
            }).then(response => {
                console.log(response)
                commit('syncContractList', response.data.data.data)
            })
        },
        getParticipantContractList({commit}, params) {
            axios({
                method: "GET",
                url: customConst.REFERENCE_BOOK_API + 'contract-list/' + params.participantPk + '/' + params.directionPk
            }).then((response) => {
                commit('syncParticipantContractList', response.data.data.data)
            })
        },
        getContractorContract({commit}, contractorUUID) {
            console.log(contractorUUID)
            return new Promise((resolve, reject) => {
                axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'contract-list/' + contractorUUID
                }).then(res => {
                    commit('syncContractorContractList', res.data.data.data)
                    resolve()
                })
            })
        },
        createContract({commit}, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'contract-create',
                    data: formData
                }).then((response) => {
                    console.log(response.data.data.data)
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
                url: customConst.REFERENCE_BOOK_API + 'contract-update/' + obj['pk'],
                data: obj['formData']
            }).then((response) => {
                commit('updateContract', response.data.data.data)
            })
        },
        deleteContract({commit}, pk) {
            axios({
                method: 'DELETE',
                url: customConst.REFERENCE_BOOK_API + 'contract-delete/' + pk
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
        },
        contractorContractListData(state){
            return state.contractorContractList
        }
    }
}