let filters = {
    staffFullName(obj) {
        if (obj.middle_name !== null) {
            return `${obj.first_name} ${obj.last_name} ${obj.middle_name}`
        } else {
            return `${obj.first_name} ${obj.last_name}`
        }
    },
    eventDispay(obj){
        if (obj.source !== null){
            return `${obj.name} - ${obj.source.fullName}`
        }
        return `${obj.name}`
    },
    hasDepPos(obj) {
        if (obj) {
            return obj.hasOwnProperty('name') ? obj.name : ''
        }
    },
    participatorName(obj) {
        if (obj) {
            return obj.hasOwnProperty('name') ? obj.name : `${obj.first_name} ${obj.last_name}`
        }
    },
    regData(obj) {
        if (obj['kpp'] && obj['inn']) {
            return `ИНН: ${obj.inn} / КПП: ${obj.kpp} `
        }
    },
    participatorDisplayName(obj) {
        if (obj.item.hasOwnProperty('attributes')) {
            if (obj.item.attributes.participator.hasOwnProperty('name')) {
                return obj.item.attributes.participator['name']
            } else {
                return `${obj.item.attributes.participator['last_name']} ${obj.item.attributes.participator['first_name']}`
            }
        } else {
            if (obj.item.hasOwnProperty('name')) {
                return obj.item['name']
            } else {
                return `${obj.item.last_name} ${obj.item.first_name}`
            }
        }
    },
    projectName(obj){
        if(obj){
            return obj.name
        }
        return 'Без проекта'
    }
}


export default {
    filters
}
