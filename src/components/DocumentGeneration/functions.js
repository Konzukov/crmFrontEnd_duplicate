import moment from "moment";
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import {isEmpty} from 'lodash'

Vue.use(VueCookies)


export async function compareFields(fields, data) {
    let act_date;
    let report_date;
    let compare = {}
    let person = data['physical_contractor']
    let act = data['act'][0]
    console.log(person)
    let personDomicile = null;
    let personPostcode = null
    if (person) {
        personDomicile = person['registration'].filter(obj => {
            if (obj.length === 1) return obj['address']
            else if (obj['active']) return obj['address']
        })
        if (personDomicile.length === 0) {
            personDomicile = null
        }
        personPostcode = person['registration'].filter(obj => {
            if (obj.length === 1) return obj['postcode']
            else if (obj['active']) return obj['postcode']
        })
        if (personPostcode.length === 0) {
            personPostcode = null
        }
    }
    for (let field of fields) {
        switch (field['value']) {
            case "GENERATE_DATE":
                compare[field['value']] = moment(new Date()).format('YYYY-MM-DD')
                break
            case "DATE_EXECUTION_REQUIREMENT":
                compare[field['value']] = moment(new Date()).add(15, 'days').format('YYYY-MM-DD')
                console.log(moment(new Date()).add(15, 'days').format('YYYY-MM-DD'))
                break
            case "DEBTOR_FULLNAME":
                if (person) {
                    compare[field['value']] = `${person['last_name']} ${person['first_name']} ${person['middle_name']}`
                } else {
                    compare[field['value']] = ''
                }
                break
            case "DEBTOR_BYRTHDAY":
                if (person) {
                    compare[field['value']] = moment(person['birthday']).format('DD.MM.YYYY')
                } else {
                    compare[field['value']] = ''
                }
                break
            case "OUT_NUMBER":
                if (data['out_document']) {
                    compare[field['value']] = data['out_document']
                } else {
                    compare[field['value']] = 1
                }
                break
            case "DEBTOR_BYRTHPLACE":
                if (person) {
                    compare[field['value']] = person['birthplace']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "DEBTOR_DOMICILE":
                if (personDomicile) {
                    compare[field['value']] = personDomicile[0]['address']
                } else compare[field['value']] = ''
                break
            case "DEBTOR_POSTCODE":
                if (personPostcode) {
                    compare[field['value']] = personPostcode[0]['postcode']
                } else compare[field['value']] = ''
                break
            case "DEBTOR_INN":
                if (person) {
                    compare[field['value']] = person['inn']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "DEBTOR_SNILS":
                if (person) {
                    compare[field['value']] = person['snils']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "DEBTOR_PASSPORT":
                if (person) {
                    let passport = person['passports'][0]
                    if (isEmpty(passport)) {
                        compare[field['value']] = ''
                    } else {
                        compare[field['value']] = `${passport.serial} ${passport.number}`
                    }
                } else {
                    compare[field['value']] = ''
                }
                break

            case "CURT":
                if (data['court']) {
                    compare[field['value']] = data['court']['name']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "REPORT_DATE":
                if (data['report_date']) {
                    compare[field['value']] = data['report_date']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "CASE_NUMBER":
                compare[field['value']] = data['case_number']
                break
            case "JUDICIAL_ACT_DATE":
                if (act) {
                    compare[field['value']] = moment(act['document']['receiving_date']).format('DD.MM.YYYY')
                } else {
                    compare[field['value']] = ''
                }
                break
            case "JUDICIAL_ACT_URL":
                if (act) {
                    compare[field['value']] = act['url']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "CURT_ADDRESS":
                if (data['court']) {
                    compare[field['value']] = data['court']['address']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "JUDGE":
                if (data['judge']) {
                    compare[field['value']] = data['judge']['full_name']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "JUDGE_CAB":
                if (data['judge']) {
                    compare[field['value']] = data['judge']['office_room']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "EFRSB_NUMBER":
                if (data['publication_number_efrsb']) {
                    compare[field['value']] = data['publication_number_efrsb']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "EFRSB_DATE":
                if (data['publication_date_efrsb']) {
                    compare[field['value']] = data['publication_date_efrsb']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "KOMM_DATE":
                if (data['publication_date']) {
                    compare[field['value']] = data['publication_date']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "KOMM_ISSUE":
                if (data['publication_issue_number']) {
                    compare[field['value']] = data['publication_issue_number']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "KOMM_NUMBER":
                if (data['publication_number']) {
                    compare[field['value']] = data['publication_number']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "KOMM_PAGE":
                if (data['publication_number_page']) {
                    compare[field['value']] = data['publication_number_page']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "CONTRACTOR":
                if (data['legal_contractor']) {
                    compare[field['value']] = data['legal_contractor']['full_name']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "CONTRACTOR_INN":
                if (data['legal_contractor']) {
                    compare[field['value']] = data['legal_contractor']['inn']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "CONTRACTOR_KPP":
                if (data['legal_contractor']) {
                    compare[field['value']] = data['legal_contractor']['kpp']
                } else {
                    compare[field['value']] = ''
                }
                break
            case "FROM_MONTH":
                compare[field['value']] = ''
                break

            case 'CREDITOR_NOTICE':
                compare[field['value']] = ''
                break
            case 'POST_TOTAL_PRICE':
                compare[field['value']] = ''
                break
            case 'DOC_TOTAL_PRICE':
                compare[field['value']] = ''
                break
            case "DURATION":
                if (act) {
                    act_date = moment(act['document']['receiving_date'])
                } else {
                    act_date = null
                }
                if (data['report_date']) {
                    report_date = moment(data['report_date'])
                } else {
                    report_date = null
                }

                if (report_date && act_date) {
                    compare[field['value']] = report_date.diff(act_date, 'months')
                } else
                    compare[field['value']] = 6

        }
    }
    return compare
}