let ProcedureType = {
    "Physical": [
        {value: "RCP", text: "Реструктуризация имущества гражданина"},
        {value: "SDP", text: "Реализация имущества должника"},
    ],
    "Legal": [
        {value: "OBS", text: "Наблюдение"},
        {value: "ECL", text: "Внешнее управление"},
        {value: "FCR", text: "Финансовое оздоровление"},
        {value: "BPS", text: "Конкурсное производство"}
    ]
}

let ThirdStageType = [
    {value: 'empty', text: 'Не указано'},
    {value: 'UC', text: 'Требования, не обеспеченные залогом'},
    {value: 'SC', text: 'Требования, обеспеченные залогом'},
    {value: 'FP', text: 'Штрафы, пени'},
    {value: 'PT', text: 'Проценты'},
    {value: 'OR', text: 'Другое'},
]

let DocumentNameTemplate = [
    {id: 1, name : "Шаблон для входящих документов", helpText: "<code_code>-<date>-<other>", regExp: "(\\S+)_(\\d{8})_(\\S+)"},
    {id: 2, name : "Шаблон для гос.услуг", helpText: "<other>___<date>", regExp: "___(\\d{8,8}).pdf"},
]


export {ThirdStageType}
export {ProcedureType}
export {DocumentNameTemplate}