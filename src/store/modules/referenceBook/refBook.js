import Axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";
import auth from "@/store/modules/auth";

Vue.use(VueCookies)

export default {
    state: {
        status: '',
        contractorList: [],
        physicalPerson: [],
        physicalPersonDetail: {},
        systemUsers: '',
        allSystemUsers: [],
        servicesList: '',
        legalEntity: [],
        legalEntityDetail: '',
        organizationStaff: '',
        position: [],
        department: [],
        country: [],
        region: [],
        bailiffs: [],
        fns: [],
        employmentService: [],
        marriageService: [],
        curt: [],
        gibdd: [],
        osfr: [],
        ufsvn: [],
        git: [],
        gims: [],
        technicalSupervision: [],
        addressDesk: [],
        mvd: [],
        bti: [],
        kio: [],
        dizo: [],
        pfr: [],
    },
    mutations: {
        syncSystemUser(state, userList) {
            state.systemUsers = userList
        },
        syncAllSystemUser(state, userList) {
            state.allSystemUsers = userList
        },
        syncPhysicalPerson(state, person) {
            state.status = 'sync success'
            state.physicalPerson = person

        },
        addPhysicalPerson(state, person) {
            state.status = 'create success'
            console.log(state.physicalPerson)
            state.physicalPerson.push(person)
        },
        updatePhysicalPerson(state, person) {
            state.status = 'Physical person updated'
            state.physicalPerson = state.physicalPerson.map(obj => {
                if (obj.pk === person.pk) {
                    return Object.assign({}, person)
                }
                return obj
            })
        },
        detailPhysicalPerson(state, physicalPerson) {
            state.physicalPersonDetail = Object.assign({}, physicalPerson)
        },
        delPhysicalPerson(state, pk) {
            state.status = 'remove success'
            state.physicalPerson.data = state.physicalPerson.data.filter(obj => {
                if (obj['pk'] !== pk) {
                    return obj
                }
            })
        },
        legalEntityList(state, legalEntity) {
            state.status = 'legalEntityList success'
            state.legalEntity = legalEntity
            state.fns = legalEntity.filter(obj => obj['org_type'] === 'FNS')
            state.employmentService = legalEntity.filter(obj => obj['org_type'] === 'EMPLS')
            state.bailiffs = legalEntity.filter(obj => obj['org_type'] === 'FSSP')
            state.osfr = legalEntity.filter(obj => obj['org_type'] === 'OSFR')
            state.marriageService = legalEntity.filter(obj => obj['org_type'] === 'ZAGS')
            state.technicalSupervision = legalEntity.filter(obj => obj['org_type'] === 'TECHN')
            state.addressDesk = legalEntity.filter(obj => obj['org_type'] === 'ADDRD')
            state.pfr = legalEntity.filter(obj => obj['org_type'] === 'PFR')
            state.mvd = legalEntity.filter(obj => obj['org_type'] === 'MVD')
            state.git = legalEntity.filter(obj => obj['org_type'] === 'GIT')
            state.bti = legalEntity.filter(obj => obj['org_type'] === 'BTI')
            state.kio = legalEntity.filter(obj => obj['org_type'] === 'KIO')
            state.dizo = legalEntity.filter(obj => obj['org_type'] === 'DIZO')
            state.gims = legalEntity.filter(obj => obj['org_type'] === 'GIMS')
            state.ufsvn = legalEntity.filter(obj => obj['org_type'] === 'UFSVN')
            state.gibdd = legalEntity.filter(obj => obj['org_type'] === 'GIBDD')
            state.curt = legalEntity.filter(obj => obj['org_type'] === 'ARBCR' || obj['org_type'] === 'GEJRD' || obj['org_type'] === 'MGSCR' || obj['org_type'] === 'MOSC')
        },
        legalEntityDetailInfo(state, obj) {
            state.status = 'Success'
            state.legalEntityDetail = obj
        },
        addLegalEntity(state, legalEntity) {
            state.status = 'legalEntityCreate success'
            console.log('legalEntity', legalEntity)
            state.legalEntity.push(legalEntity)
        },
        updateLegalEntity(state, legalEntity) {
            state.status = 'legalEntityUpdate success'
            state.legalEntity.data = state.legalEntity.map(obj => {
                if (obj['pk'] === legalEntity['pk']) {
                    return Object.assign({}, legalEntity)
                }
                return obj
            })
            state.fns.data = state.fns.map(obj => {
                if (obj['pk'] === legalEntity['pk']) {
                    return Object.assign({}, legalEntity)
                }
                return obj
            })
            state.employmentService.data = state.employmentService.map(obj => {
                if (obj['pk'] === legalEntity['pk']) {
                    return Object.assign({}, legalEntity)
                }
                return obj
            })
            state.bailiffs.data = state.bailiffs.map(obj => {
                if (obj['pk'] === legalEntity['pk']) {
                    return Object.assign({}, legalEntity)
                }
                return obj
            })
            state.marriageService.data = state.marriageService.map(obj => {
                if (obj['pk'] === legalEntity['pk']) {
                    return Object.assign({}, legalEntity)
                }
                return obj
            })
            state.curt.data = state.curt.map(obj => {
                if (obj['pk'] === legalEntity['pk']) {
                    return Object.assign({}, legalEntity)
                }
                return obj
            })
            state.gibdd.data = state.gibdd.map(obj => {
                if (obj['pk'] === legalEntity['pk']) {
                    return Object.assign({}, legalEntity)
                }
                return obj
            })
            state.osfr.data = state.osfr.map(obj => {
                if (obj['pk'] === legalEntity['pk']) {
                    return Object.assign({}, legalEntity)
                }
                return obj
            })
            state.ufsvn.data = state.ufsvn.map(obj => {
                if (obj['pk'] === legalEntity['pk']) {
                    return Object.assign({}, legalEntity)
                }
                return obj
            })
            state.gims.data = state.gims.map(obj => {
                if (obj['pk'] === legalEntity['pk']) {
                    return Object.assign({}, legalEntity)
                }
                return obj
            })
            state.technicalSupervision.data = state.technicalSupervision.map(obj => {
                if (obj['pk'] === legalEntity['pk']) {
                    return Object.assign({}, legalEntity)
                }
                return obj
            })
            state.addressDesk.data = state.addressDesk.map(obj => {
                if (obj['pk'] === legalEntity['pk']) {
                    return Object.assign({}, legalEntity)
                }
                return obj
            })
            state.mvd.data = state.mvd.map(obj => {
                if (obj['pk'] === legalEntity['pk']) {
                    return Object.assign({}, legalEntity)
                }
                return obj
            })
            state.bti.data = state.bti.map(obj => {
                if (obj['pk'] === legalEntity['pk']) {
                    return Object.assign({}, legalEntity)
                }
                return obj
            })
            state.kio.data = state.kio.map(obj => {
                if (obj['pk'] === legalEntity['pk']) {
                    return Object.assign({}, legalEntity)
                }
                return obj
            })
            state.dizo.data = state.dizo.map(obj => {
                if (obj['pk'] === legalEntity['pk']) {
                    return Object.assign({}, legalEntity)
                }
                return obj
            })
            state.pfr.data = state.pfr.map(obj => {
                if (obj['pk'] === legalEntity['pk']) {
                    return Object.assign({}, legalEntity)
                }
                return obj
            })
        },
        delLegalEntity(state, pk) {
            state.status = 'LegalEntity remove success'
            state.legalEntity.data = state.legalEntity.data.filter(obj => {
                if (obj['pk'] !== pk) {
                    return obj
                }
            })
        },
        addLegalRelatedPerson(state, updatedData) {
            state.status = 'RelatedPerson add success'
            // Инструкция для обновления данных по связанным ФИЗ лицам с организацией
            state.legalEntity.data = state.legalEntity.data.filter(entity => {
                if (entity.pk === updatedData.pk) {
                    entity['related_physical_person'] = updatedData['related_physical_person']
                }
                return entity
            })
        },
        addPhysicalRelatedPerson(state, updatedData) {
            console.log('updatedData', updatedData)
            state.status = 'RelatedPerson add success'
            // Инструкция для обновления данных по связанным Юр лиц с физическими лицами
            state.physicalPerson.data = state.physicalPerson.data.filter(entity => {
                if (entity.pk === updatedData.pk) {
                    entity['related_legal_entity'] = updatedData['related_legal_entity']
                }
                return entity
            })
        },
        delPhysicalRelatedPerson(state, pks) {
            console.log('pks', pks)
            state.physicalPersonDetail.related_legal_entity = state.physicalPersonDetail.related_legal_entity.filter(entity => {
                return entity['pk'] !== pks.relation
            })
        },
        delLegalEntityRelatedPerson(state, pks) {
            state.legalEntity.data = state.legalEntity.data.filter(entity => {
                if (entity['pk'] === pks.person) {
                    entity['related_physical_person'] = entity['related_physical_person'].filter(obj => {
                        return obj['pk'] !== pks.relation
                    })
                }
                return entity
            })
        },
        addContactInfo(state, data) {
            state.status = 'contact info added success'
            state.legalEntity.data = state.legalEntity.data.filter(obj => {
                if (obj['pk'] === data.legalEntity) {
                    obj['contact_info'].push(data.contact)
                }
                return obj
            })
        },
        delContactInfo(state, item) {
            state.status = 'contact info deleted'
            state.legalEntity.data = state.legalEntity.data.filter(obj => {
                if (obj['pk'] === item.entity) {
                    obj['contact_info'] = obj['contact_info'].filter(contact => {
                        return contact.pk !== item.contact.pk
                    })
                }
                return obj
            })
        },
        updateContactInfo(state) {
            state.status = 'contact info updated'
        },
        positionList(state, position) {
            state.status = 'get position list success '
            state.position = position
        },
        addPosition(state, newPosition) {
            state.status = 'position added success'
            state.position.push(newPosition)
        },
        departmentList(state, department) {
            state.status = 'get department list success '
            state.department = department
        },
        addDepartment(state, newDepartment) {
            state.status = 'department created success'
            state.department.data.push(newDepartment)
        },
        addStaff(state, staff) {
            state.status = 'Staff created success'
            state.legalEntity.data = state.legalEntity.data.filter(obj => {
                if (obj.pk === staff.attributes.pk) {
                    obj.staffs = staff.attributes.staffs
                }
                return obj
            })
        },
        organizationStaffList(state, obj) {
            state.status = 'success get staff'
            state.organizationStaff = obj
        },
        updateStaff(state, staff) {
            state.status = 'Staff created success'
            state.legalEntity.data = state.legalEntity.data.filter(obj => {
                if (obj.pk === staff.attributes.pk) {
                    obj.staffs = staff.attributes.staffs
                }
                return obj
            })
        },
        syncService(state, servicesList) {
            state.status = 'Services sync success'
            state.servicesList = servicesList
        },
        syncCountry(state, countryList) {
            state.country = countryList
        },
        syncRegion(state, regionList) {
            state.region = regionList
        },
        syncBailiffs(state, bailiffsList) {
            state.bailiffs = bailiffsList
        },

    },
    actions: {
        allSystemUser({commit}) {
            Axios({
                method: "GET",
                url: customConst.REFERENCE_BOOK_API + 'all-system-user/'
            }).then(response => {
                commit('syncAllSystemUser', response.data.data.data)
            })
        },
        getRelatedUser({commit}, participant) {
            Axios({
                method: "GET",
                url: customConst.REFERENCE_BOOK_API + 'system-user/' + participant
            }).then(response => {
                console.log(response.data.data.data)
                commit('syncSystemUser', response.data.data.data)
            })
        },
        createPhysicalPerson({commit}, physicalPersonData) {
            return new Promise((resolve, reject) => {
                Axios({
                    method: 'post',
                    url: customConst.REFERENCE_BOOK_API + 'physical-person-create',
                    data: physicalPersonData
                }).then((response) => {
                        console.log(response.data.data.attributes)
                        commit('addPhysicalPerson', response.data.data.attributes)
                        resolve(response.data.data.attributes)
                    }
                ).catch(err => {
                    reject(err)
                })
            })
        },
        async createPhysicalPersonPassport({commit}, formData) {
            return await new Promise((resolve, reject) => {
                Axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'physical-person-passport/',
                    data: formData
                }).then(res => {
                    console.log(res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    console.log(err)
                    reject()
                })
            })
        },
        async editPhysicalPersonPassport({commit}, {formData, pk}) {
            return new Promise((resolve, reject) => {
                Axios({
                    method: "PUT",
                    url: customConst.REFERENCE_BOOK_API + `physical-person-passport/${pk}/`,
                    data: formData
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    console.log(err)
                    reject()
                })
            })
        },
        async createPhysicalPersonRegistration({commit}, formData) {
            return await new Promise((resolve, reject) => {
                Axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'physical-person-registration/',
                    data: formData
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    console.log(err)
                    reject()
                })
            })
        },
        async editPhysicalPersonRegistration({commit}, {formData, pk}) {
            return new Promise((resolve, reject) => {
                Axios({
                    method: "PUT",
                    url: customConst.REFERENCE_BOOK_API + `physical-person-registration/${pk}/`,
                    data: formData
                }).then(res => {
                    resolve(res.data.data.data)
                }).catch(err => {
                    console.log(err)
                    reject()
                })
            })
        },
        getPhysicalPerson({commit}) {
            return new Promise((resolve, reject) => {
                Axios({
                    method: 'get',
                    url: customConst.REFERENCE_BOOK_API + 'physical-person/',
                }).then(response => {
                    commit('syncPhysicalPerson', response.data.data.data)
                    resolve()
                }).catch(error => {
                    console.log(error.error.response)
                    reject()
                })
            })
        },
        deletePhysicalPerson({commit}, pk) {
            Axios({
                method: 'DELETE',
                url: customConst.REFERENCE_BOOK_API + 'physical-person-detail/' + pk,
            }).then(() => {
                commit('delPhysicalPerson', pk)
            }).catch(error => {
                console.log(error)
            })
        },
        getPhysicalPersonDetail({commit}, pk) {
            return new Promise((resolve, reject) => {
                Axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'physical-person/' + pk,
                }).then((res) => {
                    commit('detailPhysicalPerson', res.data.data.data)
                    resolve(res.data.data.data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        editPhysicalPerson({commit}, {formData, pk}) {
            return new Promise((resolve, reject) => {
                Axios({
                    method: 'put',
                    url: customConst.REFERENCE_BOOK_API + 'physical-person-detail/' + pk,
                    data: formData
                }).then(res => {
                    commit('updatePhysicalPerson', res.data.data.data)
                    resolve()
                }).catch(error => {
                    console.log(error)
                    reject()
                })
            })
        },
        getLegalEntity({commit}) {
            return new Promise((resolve, reject) => {
                Axios({
                    method: 'get',
                    url: customConst.REFERENCE_BOOK_API + 'legal-entity/'
                }).then(response => {
                    commit('legalEntityList', response.data.data.data)
                    resolve()
                }).catch(err => {
                    console.log(err)
                    reject()
                })
            })
        },
        getLegalEntityDetailInfo({commit}, pk) {
            return new Promise((resolve, reject) => {
                Axios({
                    method: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'legal-entity-detail/' + pk,
                }).then((response) => {
                    resolve(response.data.data.attributes)
                    commit('legalEntityDetailInfo', response.data.data.attributes)

                })
            })

        },
        createLegalEntity({commit}, legalEntityData) {
            return new Promise((resolve, reject) => {
                Axios({
                    method: 'post',
                    url: customConst.REFERENCE_BOOK_API + 'legal-entity-create',
                    data: legalEntityData
                }).then(response => {
                    commit('addLegalEntity', response.data.data.data)
                    resolve(response)
                }).catch(err => reject(err))
            })

        },
        editLegalEntity({commit}, data) {
            console.log('actions', data)
            return new Promise((resolve, reject) => {
                Axios({
                    method: 'put',
                    url: customConst.REFERENCE_BOOK_API + 'legal-entity-update/' + data.legalEntityDetail.pk,
                    data: data.data
                }).then((response) => {
                    console.log(response.data.data.data)
                    commit('updateLegalEntity', response.data.data.data)
                    resolve(response)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        deleteLegalEntity({commit}, pk) {
            Axios({
                method: 'DELETE',
                url: customConst.REFERENCE_BOOK_API + 'legal-entity-update/' + pk,
            }).then(response => {
                commit('delLegalEntity', pk)
                console.log(response)
            }).catch(error => {
                console.log(error)
            })
        },
        createRelatedPerson({commit}, formData) {
            return new Promise((resolve, reject) => {
                Axios({
                    method: 'POST',
                    url: customConst.REFERENCE_BOOK_API + 'related-person-create',
                    data: formData.data
                }).then((response) => {
                    if (formData.type === 'physicalRelation') {
                        Axios({
                            method: "GET",
                            url: customConst.REFERENCE_BOOK_API + 'legal-entity/' + response.data.data.relationships.legal_entity.data.id
                        }).then(response => {
                            commit('addLegalRelatedPerson', response.data.data.attributes)
                            resolve()
                        })
                    } else {
                        Axios({
                            method: "GET",
                            url: customConst.REFERENCE_BOOK_API + 'physical-person/' + response.data.data.relationships.person.data.id
                        }).then(response => {
                            commit('detailPhysicalPerson', response.data.data.data)
                            resolve()
                        })
                    }
                })
            })

        },
        editRelatedPerson({commit}, data) {
            console.log(data)
            Axios({
                method: "PUT",
                url: customConst.REFERENCE_BOOK_API + 'related-person-detail/' + data.pk,
                data: data.data
            }).then((response) => {
                console.log(response)
            })
        },
        deleteRelatedPerson({commit}, pks) {
            Axios({
                method: "DELETE",
                url: customConst.REFERENCE_BOOK_API + 'related-person-detail/' + pks.relation
            }).then((response) => {
                if (pks.type === 'physicalPerson') {
                    commit('delPhysicalRelatedPerson', pks)
                } else if (pks.type === 'legalEntity') {
                    commit('delLegalEntityRelatedPerson', pks)
                }
            })
        },
        createContactInfo({commit}, contact) {
            Axios({
                method: "POST",
                url: customConst.REFERENCE_BOOK_API + 'contact-info-create',
                data: contact.formData
            }).then(response => {
                commit('addContactInfo', {'contact': response.data.data.attributes, 'legalEntity': contact.legalEntity})
            }).catch((error) => {
                console.log(error.response)
            })
        },
        deleteContactInfo({commit}, obj) {
            Axios({
                method: "DELETE",
                url: customConst.REFERENCE_BOOK_API + 'contact-info-detail/' + obj.contact.pk
            }).then(() => {
                commit('delContactInfo', {'contact': obj.contact, 'entity': obj.entity})
            })
        },
        editContactInfo({commit}, data) {
            Axios({
                method: 'PUT',
                url: customConst.REFERENCE_BOOK_API + 'contact-info-detail/' + data.contactInfo.pk,
                data: data.formData
            }).then(() => {
                commit('updateContactInfo')
            })
        },
        getPositionByDepartment({commit}, department) {
            console.log('department', department)
            Axios({
                method: "GET",
                url: customConst.REFERENCE_BOOK_API + 'position/' + department.pk
            }).then((response) => {
                console.log(response.data.data.data)
                commit('positionList', response.data.data.data)
            })
        },
        createPosition({commit}, formData) {
            Axios({
                method: "POST",
                url: customConst.REFERENCE_BOOK_API + 'position-create',
                data: formData
            }).then(response => {
                console.log(response.data)
                commit('addPosition', response.data.data.attributes)
            })
        },
        getOrganizationStaff({commit}, pk) {
            Axios({
                method: "GET",
                url: customConst.REFERENCE_BOOK_API + 'organization-staff-list/' + pk
            }).then((response) => {
                commit('organizationStaffList', response.data.data.data)
            })
        },
        createStaff({commit}, obj) {
            return new Promise((resolve, reject) => {
                Axios({
                    method: "POST",
                    url: customConst.REFERENCE_BOOK_API + 'staff-create',
                    data: obj.data
                }).then(() => {
                    Axios({
                        method: 'GET',
                        url: customConst.REFERENCE_BOOK_API + 'legal-entity-detail/' + obj.legalEntity
                    }).then((response) => {
                        commit('legalEntityDetailInfo', response.data.data.attributes)
                        resolve()
                    })
                })
            })

        },
        editStaff({commit}, data) {
            Axios({
                method: "PUT",
                url: customConst.REFERENCE_BOOK_API + 'staff-detail/' + data.staffPk,
                data: data.formData
            }).then(() => {
                Axios({
                    method: 'GET',
                    url: customConst.REFERENCE_BOOK_API + 'legal-entity-detail/' + data.legalEntityPk
                }).then((response) => {
                    commit('updateStaff', response.data.data)
                })
            })
        },
        deleteStaff({commit}, data) {
            return new Promise((resolve, reject) => {
                Axios({
                    method: "DELETE",
                    url: customConst.REFERENCE_BOOK_API + 'staff-detail/' + data.staffPk
                }).then(() => {
                    Axios({
                        method: 'GET',
                        url: customConst.REFERENCE_BOOK_API + 'legal-entity-detail/' + data.legalEntityPk
                    }).then((response) => {
                        commit('legalEntityDetailInfo', response.data.data.attributes)
                        resolve()
                    })
                })
            })

        },
        getDepartment({commit}, legalEntity) {
            Axios({
                method: 'GET',
                url: customConst.REFERENCE_BOOK_API + 'department/' + legalEntity.pk
            }).then((response) => {
                commit('departmentList', response.data.data)
            })
        },
        addDepartment({commit}, formData) {
            Axios({
                method: "POST",
                url: customConst.REFERENCE_BOOK_API + 'department-create',
                data: formData
            }).then((response) => {
                commit('addDepartment', response.data.data.attributes)
            })
        },
        getService({commit}) {
            Axios({
                method: "GET",
                url: customConst.AUTH_API + 'services'
            }).then((response) => {
                commit('syncService', response.data.data)
            })
        },
        getCountry({commit}) {
            return new Promise((resolve, reject) => {
                Axios({
                    methods: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'country'
                }).then(res => {
                    commit('syncCountry', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getRegion({commit}) {
            return new Promise((resolve, reject) => {
                Axios({
                    methods: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'region'
                }).then(res => {
                    commit('syncRegion', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        getBailiffs({commit}) {
            return new Promise((resolve, reject) => {
                Axios({
                    methods: "GET",
                    url: customConst.REFERENCE_BOOK_API + 'bailiffs'
                }).then(res => {
                    commit('syncBailiffs', res.data.data.data)
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
    },
    getters: {
        relatedUserData(state) {
            return state.systemUsers
        },
        allSystemUsersData(state) {
            return state.allSystemUsers
        },
        physicalPersonData(state) {
            return state.physicalPerson
        },
        physicalPersonDetailData(state) {
            return state.physicalPersonDetail
        },
        legalEntityData(state) {
            return state.legalEntity
        },
        allRefData(state) {
            let data = [];
            if (state.legalEntity) {
                data.push(...state.legalEntity)
            }
            if (state.physicalPerson) {
                data.push(...state.physicalPerson)
            }
            return data
            // if (state.legalEntity && state.physicalPerson) {
            //     return state.legalEntity.concat(state.physicalPerson)
            // }

        },
        positionData(state) {
            return state.position
        },
        departmentData(state) {
            return state.department
        },
        legalEntityDetailData(state) {
            return state.legalEntityDetail
        },
        organizationStaffData(state) {
            return state.organizationStaff
        },
        servicesListData(state) {
            return state.servicesList
        },
        contractorListData(state) {
            let contractor = []
            if (state.legalEntity && state.physicalPerson) {
                contractor = state.legalEntity.concat(state.physicalPerson)
            }
            return contractor
        },
        currentUserData(state) {
            const curUser = state.allSystemUsers.filter(user => {
                if (user['uuid'] === auth.state.user['uuid']) {
                    return user
                }
            })
            return curUser
        },
        countryListData(state) {
            return state.country
        },
        regionListData(state) {
            return state.region
        },
        bailiffsListData(state) {
            return state.bailiffs
        },
        fnsListData(state) {
            return state.fns
        },
        employmentServiceListData(state) {
            return state.employmentService
        },
        marriageServiceListData(state) {
            return state.marriageService
        },
        curtListData(state) {
            return state.curt
        },
        gibddListData(state) {
            return state.gibdd
        },
        osfrListData(state) {
            return state.osfr
        },
        ufsvnListData(state) {
            return state.ufsvn
        },
        gitListData(state) {
            return state.git
        },
        gimsListData(state) {
            return state.gims
        },
        technicalSupervisionListData(state) {
            return state.technicalSupervision
        },
        addressDeskListData(state) {
            return state.addressDesk
        },
        mvdListData(state) {
            return state.mvd
        },
        btiListData(state) {
            return state.bti
        },
        kioListData(state) {
            return state.kio
        },
        dizoListData(state) {
            return state.dizo
        },
        pfrListData(state) {
            return state.pfr
        },
    }
}
