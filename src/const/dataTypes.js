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
    {
        id: 1,
        name: "Шаблон для входящих документов",
        helpText: "<code_code>-<date>-<other>",
        regExp: "(\\S+)_(\\d{8})_(\\S+)"
    },
    {id: 2, name: "Шаблон для гос.услуг", helpText: "<other>___<date>", regExp: "___(\\d{8,8}).pdf"},
    {id: 3, name: "Шаблон загрузки счетов YAML", helpText: "Файл в формате yaml с данными по счетам"},
]

let LegalEntityType = [
    {header: 'Юридическое лицо'},
    {value: "EMPTY", text: "Юридическое лицо"},
    {divider: true},
    {header: 'Банк'},
    {value: "BANK", text: 'Банк'},
    {divider: true},
    {header: 'Гос учреждения'},
    {value: "FSSP", text: 'Федеральная служба судебных приставов'},
    {value: "FNS", text: 'Федеральная налоговая служба'},
    {value: "GIBDD", text: 'ГИБДД'},
    {value: "GIMS", text: 'Государственная инспекция по маломерным судам'},
    {value: "MVD", text: 'Министерство внутренних дел'},
    {value: "ADDRD", text: 'Адресный стол'},
    {value: "TECHN", text: 'Технадзор'},
    {value: "OSFR", text: 'Пенсионный и социальный фонды'},
    {value: "GIT", text: 'Государственная инспекция по труду'},
    {value: "BTI", text: 'Бюро технической инвентаризации'},
    {value: "DIZO", text: 'Департамент имущественно-земельных отношений'},
    {value: "UFSVN", text: 'Управление Федеральной службы войск национальной гвардии'},
    {value: "EMPLS", text: 'Служба занятости'},
    {value: "ZAGS", text: 'ЗАГС'},
    {divider: true},
    {header: 'Суды'},
    {value: "ARBCR", text: 'Арбитражный суд'},
    {value: "GEJRD", text: 'Суд общей юрисдикции'},
    {value: "MOSC", text: 'Военный и другие специализированные суды'},
    {value: "GEJRD", text: "Суд общей юрисдикции"},
    {value: "MGSCR", text: "Мировой суд"},
    {value: 'ACA', text: 'Арбитражный апелляционной инстанции'},
    {value: 'ACC', text: 'Арбитражный кассационной инстанции'},
    {value: 'SCRF', text: 'Верховный суд Российской Федерации'},
    {value: 'CGJF', text: 'Суд общей юрисдикции первой инстанции'},
    {value: 'CGJA', text: 'Суд общей юрисдикции апелляционной инстанции (региональный суд)'},
    {value: 'CGJC', text: 'Суд общей юрисдикции кассационной инстанции'},
    {value: 'AC', text: 'Третейский суд'},
]

let CommunicationMethodType = [
    {value: "ElectronicMail", text: "Электронные письма"},
    {value: "PaperMail", text: "Бумажная почта"},
    {value: "Email", text: "Электронная почта"},
]

export {ThirdStageType}
export {ProcedureType}
export {DocumentNameTemplate}
export {LegalEntityType}
export {CommunicationMethodType}