let methods = {
    projectColor(obj) {
        console.log(obj.direction.direction)
        switch (obj.direction.direction.name) {
            case 'Бухгалтерия':
                return '#880E4F'
        }
    }
}

export default {
    methods
}