import moment from "moment/moment";

function filterDate(date) {
    return moment(date).format('DD.MM.YYYY HH:mm')
}

export {filterDate}