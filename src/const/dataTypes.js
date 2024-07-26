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


export {ThirdStageType}
export {ProcedureType}