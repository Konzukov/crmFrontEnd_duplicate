import store from '../../store'
import moment from "moment";

export default {
    createFormData: function (obj) {
        let data = new FormData
        Object.keys(obj).forEach(key => {
            if (key === 'registration_date' || key === 'birthday') {
                if (obj[key] === null) {
                    data.set(key, '')
                } else {
                    data.set(key, moment(obj[key]).format('YYYY-MM-DD'))
                }
            } else {
                if (obj[key]) {
                    data.set(key, obj[key])
                }

            }
        })
        return data
    },
    showDetail(objList, pk) {
        let data = objList.filter(obj => {
            for (let key in obj) {
                if (key === 'pk' && obj[key] === pk) {
                    return obj
                }
            }
        })
        return data
    },
    getPermission(perm) {
        let userPermission = ''
        try {
            userPermission = store.getters.authUserData.profile.user_permission.reference_book.legalentity
        } catch (e) {
            console.log('Нет доступных разрешений')
        }
        for (let i in userPermission) {
            if (perm === userPermission[i]) {
                return true
            }
        }
        return false
    }
}
