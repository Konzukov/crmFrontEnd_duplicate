import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "@/const/customConst";
import axios from "axios";

Vue.use(VueCookies)

// function deepRemoveEmpty(obj) {
//   if (Array.isArray(obj)) {
//     return obj
//       .map(deepRemoveEmpty)
//       .filter(item => item !== null && item !== undefined);
//   }
//
//   if (typeof obj === 'object' && obj !== null) {
//     return Object.entries(obj).reduce((acc, [key, value]) => {
//       const processedValue = deepRemoveEmpty(value);
//
//       // Удаляем ключ если значение стало null/undefined после обработки
//       if (processedValue === null || processedValue === undefined) {
//         return acc;
//       }
//
//       // Удаляем ключ если значение пустая строка, пустой объект или пустой массив
//       if (
//         processedValue === '' ||
//         (typeof processedValue === 'object' && Object.keys(processedValue).length === 0)
//       ) {
//         return acc;
//       }
//
//       return {
//         ...acc,
//         [key]: processedValue
//       };
//     }, {});
//   }
//
//   return obj;
// }

export default {
    state: {
        physicalPersonList: []
    },
    mutations: {
        SET_PHYSICAL_PERSONS(state, data) {
            state.physicalPersonList = [...data]
        }
    },
    actions: {
        async fetchPhysicalPersons({commit}) {
            return await new Promise((resolve, reject) => {
                axios.get(customConst.REFERENCE_BOOK_API + 'physical-person').then(res => {
                    commit('SET_PHYSICAL_PERSONS', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        async fetchSinglePhysicalPersons({commit}, id) {
            return await new Promise((resolve, reject) => {
                axios.get(customConst.REFERENCE_BOOK_API + `physical-person/${id}`).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        async checkPersonDuplicates({commit}, data) {
            return await new Promise((resolve, reject) => {
                axios.post(customConst.REFERENCE_BOOK_API + 'physical-person/check-person-duplicates/', data)
                    .then(res => {
                        resolve(res.data.data.data)
                    })
                    .catch(error => {
                        reject(error)
                    })
            })
        },
        async savePerson({commit}, person) {
            let dataToSend = {
                ...person,
                citizenships: person.citizenships.map(c => ({
                    ...c,
                    country: c.country.id,
                })),
                passports: person.passports.filter(p => (p.type && p.serial && p.number)),
                registration: person.registration.filter(r => r.address),
            }
            // dataToSend = deepRemoveEmpty(dataToSend)
            return await new Promise((resolve, reject) => {
                const url = person.id
                    ? `${customConst.REFERENCE_BOOK_API}physical-person/${person.id}/`
                    : `${customConst.REFERENCE_BOOK_API}physical-person/`
                const method = person.id ? 'put' : 'post'
                axios[method](url, dataToSend, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => {
                    console.log(res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        }
    },
    getters: {
        physicalPersonListDataV2(state) {
            return state.physicalPersonList
        },
        detail() {

        }
    }
}