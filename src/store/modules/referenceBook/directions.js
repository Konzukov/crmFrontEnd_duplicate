import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";


Vue.use(VueCookies)

export default {
    state: {
        status: '',
        baseDirectionsList: [],
        directionsList: [],
        directionsParticipantList: [],
    },
    mutations: {
        syncBaseDirectionsList(state, baseDirectionList) {
            state.baseDirectionsList = baseDirectionList
        },
        addBaseDirectionsList(state, newBaseDirection) {
            state.baseDirectionsList.push(newBaseDirection)
        },
        syncDirectionsParticipantList(state, obj) {
            state.status = 'sync success'
            state.directionsParticipantList = obj
            console.log('by participant', state.directionsParticipantList)
        },
        syncDirectionsList(state, obj) {
            state.status = 'sync success'
            state.directionsList = obj
        },
        addDirections(state, obj) {
            state.status = 'Directions create success'
            console.log(obj)
            if (obj.fromContract) {
                state.directionsParticipantList.push(obj.newDirections)
            } else {
                state.directionsList.push(obj.newDirections)
            }
            console.log(state.directionsParticipantList)
        },
        updateDirections(state, newDirections) {
            state.status = 'Directions update success'
            state.directionsList = state.directionsList.filter(obj => {
                if (obj['pk'] !== newDirections['pk']) {
                    return obj
                }
            })
            state.directionsList.push(newDirections)
        },
        delDirection(state, deletedDirection) {
            state.status = 'Directions update success'
            state.directionsList = state.directionsList.filter(direction => {
                if (direction.attributes['pk'] !== deletedDirection['pk']) {
                    return direction
                }
            })
        }
    },
    actions: {
        getBaseDirectionList: async ({commit}) => {
            await axios({
                method: "GET",
                url: customConst.REFERENCE_BOOK_API + 'directions-list'
            }).then((response) => {
                commit('syncBaseDirectionsList', response.data.data.data)
            })
        },
        createBaseDirection: async ({commit}, formData)=>{
          await axios({
              method: "POST",
              url: customConst.REFERENCE_BOOK_API + 'directions-create',
              data: formData
          }).then((response)=>{
              commit('addBaseDirectionsList', response.data.data.data)
          })
        },
        getDirectionsParticipantList({commit}, participatorPk) {
            axios({
                method: 'GET',
                url: customConst.REFERENCE_BOOK_API + 'direction-participant-list/' + participatorPk,
            }).then(response => {
                commit('syncDirectionsParticipantList', response.data.data.data)
            })
        },
        getDirectionsList({commit}) {
            axios({
                method: 'GET',
                url: customConst.REFERENCE_BOOK_API + 'direction-list',
            }).then(response => {
                commit('syncDirectionsList', response.data.data.data)
            })
        },
        createDirections({commit}, obj) {
            console.log(obj, 'from create')
            axios({
                method: 'POST',
                url: customConst.REFERENCE_BOOK_API + 'direction-create',
                data: obj.formData
            }).then((response) => {
                commit('addDirections', {'newDirections': response.data.data.data, 'fromContract': obj.fromContract})
            })
        },
        changeDirections({commit}, data) {
            axios({
                method: 'PUT',
                url: customConst.REFERENCE_BOOK_API + 'direction-edit/' + data.pk,
                data: data.formData
            }).then((response) => {
                commit('updateDirections', response.data.data.data)
            })
        },
        deleteDirections({commit}, direction) {
            axios({
                method: 'DELETE',
                url: customConst.REFERENCE_BOOK_API + 'direction-delete/' + direction.pk,
            }).then(() => {
                commit('delDirection', direction)
            })
        }
    },
    getters: {
        baseDirectionListData(state) {
            return state.baseDirectionsList
        },
        directionsParticipantListData(state) {
            return state.directionsParticipantList
        },
        directionsListData(state) {
            return state.directionsList
        }

    }
}