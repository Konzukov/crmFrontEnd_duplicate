import moment from "moment";
import Vue from 'vue'
import VueCookies from 'vue-cookies'

Vue.use(VueCookies)

export async function compareFields(fields, data) {
    console.log(data)
    let act_date;
    let report_date;
    let compare = {}
    let person = data['physical_contractor']
    let act = data['act'][0]
    let personDomicile = null;
    let personPostcode = null;
    let personInn = null;
    let personSnils = null;

    if (person) {
        // Находим российское гражданство (страна с id = 1)
        const russianCitizenship = person.citizenships?.find(c => c.country.id === 1);
        const citizenshipId = russianCitizenship?.id ||
            (person.citizenships?.length > 0 ? person.citizenships[0].id : null);
        // Получаем регистрацию для выбранного гражданства
        if (person.registration && person.registration.length > 0) {
            const registration = citizenshipId ?
                person.registration.find(reg => reg.citizenship === citizenshipId) :
                person.registration[0];

            if (registration) {
                personDomicile = registration.address;
                personPostcode = registration.postcode;
            }
        }

        // Получаем идентификаторы для выбранного гражданства
        if (person?.identifiers?.length > 0) {
            // Находим блок идентификаторов для нужного гражданства
            const identifierBlock = citizenshipId
                ? person.identifiers.find(block => block.citizenship === citizenshipId)
                : person.identifiers[0];

            if (identifierBlock?.identifier) {
                // Ищем конкретные идентификаторы внутри блока
                const innIdentifier = identifierBlock.identifier.find(id => id.type === 'INN');
                const snilsIdentifier = identifierBlock.identifier.find(id => id.type === 'SNILS');

                personInn = innIdentifier?.value || null;
                personSnils = snilsIdentifier?.value || null;
            }
        }
    }

    for (let field of fields) {
        switch (field['value']) {
            case "GENERATE_DATE":
                compare[field['value']] = moment(new Date()).format('YYYY-MM-DD')
                break
            case "DATE_EXECUTION_REQUIREMENT":
                compare[field['value']] = moment(new Date()).add(15, 'days').format('YYYY-MM-DD')
                break
            case "DEBTOR_FULLNAME":
                compare[field['value']] = person ?
                    `${person['last_name']} ${person['first_name']} ${person['middle_name']}` :
                    '';
                break
            case "DEBTOR_BYRTHDAY":
                compare[field['value']] = person ?
                    moment(person['birthday'], 'DD.MM.YYYY').format('DD.MM.YYYY') :
                    '';
                break
            case "OUT_NUMBER":
                compare[field['value']] = data['out_document'] || 1;
                break
            case "DEBTOR_BYRTHPLACE":
                compare[field['value']] = person?.birthplace || '';
                break
            case "DEBTOR_DOMICILE":
                compare[field['value']] = personDomicile || '';
                break
            case "DEBTOR_POSTCODE":
                compare[field['value']] = personPostcode || '';
                break
            case "DEBTOR_INN":
                compare[field['value']] = personInn || '';
                break
            case "DEBTOR_SNILS":
                compare[field['value']] = personSnils || '';
                break
            case "DEBTOR_PASSPORT":
                if (person?.passports?.length > 0) {
                    // Ищем паспорт для российского гражданства
                    const russianPassport = person.passports.find(p =>
                        p.citizenship === (person.citizenships?.find(c => c.country.id === 1)?.id)
                    );
                    const passport = russianPassport || person.passports[0];
                    compare[field['value']] = `${passport.serial} ${passport.number}`;
                } else {
                    compare[field['value']] = '';
                }
                break
            // ... остальные case остаются без изменений
            case "CURT":
                compare[field['value']] = data['legal_court']?.name || '';
                break
            case "REPORT_DATE":
                compare[field['value']] = data['report_date'] || '';
                break
            case "CASE_NUMBER":
                compare[field['value']] = data['case_number'] || '';
                break
            case "JUDICIAL_ACT_DATE":
                compare[field['value']] = act ?
                    moment(act['document']['receiving_date']).format('DD.MM.YYYY') :
                    '';
                break
            case "JUDICIAL_ACT_URL":
                compare[field['value']] = act?.url || '';
                break
            case "CURT_ADDRESS":
                compare[field['value']] = data['legal_court']?.legal_address || data['legal_court']?.postal_address ||'';
                break
            case "JUDGE":
                compare[field['value']] = data['judge']?.full_name || '';
                break
            case "JUDGE_CAB":
                compare[field['value']] = data['judge']?.office_room || '';
                break
            case "EFRSB_NUMBER":
                compare[field['value']] = data['publication_number_efrsb'] || '';
                break
            case "EFRSB_DATE":
                compare[field['value']] = data['publication_date_efrsb'] || '';
                break
            case "KOMM_DATE":
                compare[field['value']] = data['publication_date'] || '';
                break
            case "KOMM_ISSUE":
                compare[field['value']] = data['publication_issue_number'] || '';
                break
            case "KOMM_NUMBER":
                compare[field['value']] = data['publication_number'] || '';
                break
            case "KOMM_PAGE":
                compare[field['value']] = data['publication_number_page'] || '';
                break
            case "CONTRACTOR":
                compare[field['value']] = data['legal_contractor']?.full_name || '';
                break
            case "CONTRACTOR_INN":
                compare[field['value']] = data['legal_contractor']?.inn || '';
                break
            case "CONTRACTOR_KPP":
                compare[field['value']] = data['legal_contractor']?.kpp || '';
                break
            case "FROM_MONTH":
            case 'CREDITOR_NOTICE':
            case 'POST_TOTAL_PRICE':
            case 'DOC_TOTAL_PRICE':
                compare[field['value']] = '';
                break
            case "DURATION":
                act_date = act ? moment(act['document']['receiving_date']) : null;
                report_date = data['report_date'] ? moment(data['report_date']) : null;
                compare[field['value']] = (report_date && act_date) ?
                    report_date.diff(act_date, 'months') : 6;
                break;
        }
    }
    return compare;
}