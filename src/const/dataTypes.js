let ProcedureType = {
    Physical: [
        {value: "RCP", text: "Реструктуризация имущества гражданина"},
        {value: "SDP", text: "Реализация имущества должника"}
    ],
    Legal: [
        {value: "OBS", text: "Наблюдение"},
        {value: "ECL", text: "Внешнее управление"},
        {value: "FCR", text: "Финансовое оздоровление"},
        {value: "BPS", text: "Конкурсное производство"}
    ]
};

let ThirdStageType = [
    {value: "empty", text: "Не указано"},
    {value: "UC", text: "Требования, не обеспеченные залогом"},
    {value: "SC", text: "Требования, обеспеченные залогом"},
    {value: "FP", text: "Штрафы, пени"},
    {value: "PT", text: "Проценты"},
    {value: "OR", text: "Другое"}
];

let DocumentNameTemplate = [
    {
        id: 1,
        name: "Шаблон для входящих документов",
        helpText: "<code_code>-<date>-<other>",
        regExp: "(\\S+)_(\\d{8})_(\\S+)"
    },
    {
        id: 2,
        name: "Шаблон для гос.услуг",
        helpText: "<other>___<date>",
        regExp: "___(\\d{8,8}).pdf"
    },
    {
        id: 3,
        name: "Шаблон загрузки счетов YAML",
        helpText: "Файл в формате yaml с данными по счетам"
    },
    {
        id: 4,
        name: "Шаблон загрузки счетов JSON",
        helpText: "Файл в формате JSON с данными по счетам"
    },
    {
        id: 5,
        name: "Шаблон загрузки чеков почты JSON",
        helpText: "Архив с json и pdf со сканами чеков"
    },
    {
        id: 6,
        name: "Шаблон загрузки имущества физ.лиц JSON",
        helpText: "Файл в формате JSON с данными по имуществу"
    }
];

let LegalEntityType = [
    {header: "Юридическое лицо"},
    {value: "EMPTY", text: "Юридическое лицо"},
    {divider: true},
    {header: "Банк"},
    {value: "BANK", text: "Банк"},
    {value: "DIB", text: "Биржи и депозитарии"},
    {value: "BKI", text: "Бюро кредитных историй (БКИ)"},
    {divider: true},
    {header: "Гос учреждения"},
    {value: "FSSP", text: "Федеральная служба судебных приставов"},
    {value: "FNS", text: "Федеральная налоговая служба"},
    {value: "GIBDD", text: "ГИБДД"},
    {value: "GIMS", text: "Государственная инспекция по маломерным судам"},
    {value: "MVD", text: "Министерство внутренних дел"},
    {value: "ADDRD", text: "Адресный стол"},
    {value: "TECHN", text: "Технадзор"},
    {value: "FSIN", text: "Федеральная служба исполнения наказаний"},
    {value: "OSFR", text: "Пенсионный и социальный фонды"},
    {value: "GIT", text: "Государственная инспекция по труду"},
    {value: "BTI", text: "Бюро технической инвентаризации"},
    {value: "DIZO", text: "Департамент имущественно-земельных отношений"},
    {
        value: "UFSVN",
        text: "Управление Федеральной службы войск национальной гвардии"
    },
    {value: "EMPLS", text: "Служба занятости"},
    {value: "ZAGS", text: "ЗАГС"},
    {divider: true},
    {header: "Суды"},
    {value: "ARBCR", text: "Арбитражный суд"},
    {value: "GEJRD", text: "Суд общей юрисдикции"},
    {value: "MOSC", text: "Военный и другие специализированные суды"},
    {value: "GEJRD", text: "Суд общей юрисдикции"},
    {value: "MGSCR", text: "Мировой суд"},
    {value: "ACA", text: "Арбитражный апелляционной инстанции"},
    {value: "ACC", text: "Арбитражный кассационной инстанции"},
    {value: "SCRF", text: "Верховный суд Российской Федерации"},
    {value: "CGJF", text: "Суд общей юрисдикции первой инстанции"},
    {
        value: "CGJA",
        text: "Суд общей юрисдикции апелляционной инстанции (региональный суд)"
    },
    {value: "CGJC", text: "Суд общей юрисдикции кассационной инстанции"},
    {value: "AC", text: "Третейский суд"}
];

let CommunicationMethodType = [
    {value: "ElectronicMail", text: "Электронные письма (ЭЗП)"},
    {value: "PaperMail", text: "Бумажная почта"},
    {value: "Email", text: "Электронная почта (Email)"},
    {value: "Phone", text: "Номер телефона"}
];

let AssetSchemas = {
    "квартира": {
        type: "object",
        required: [],
        properties: {
            address: {
                type: "string",
                label: "Адрес",
                placeholder: "Введите адрес квартиры",
                required: false
            },
            cadastre_number: {
                type: "string",
                label: "Кадастровый номер",
                placeholder: "Введите кадастровый номер",
                required: false
            },
            total_area: {
                type: "number",
                minimum: 0,
                label: "Общая площадь",
                placeholder: "Введите площадь",
                required: false
            },
            unit: {
                type: "string",
                enum: ["кв. м"],
                label: "Единица измерения",
                default: "кв. м",
                required: false
            },
            ownership_share: {
                type: "number",
                minimum: 0,
                maximum: 1,
                label: "Доля владения",
                placeholder: "Введите долю (от 0 до 1)",
                required: false
            }
        }
    },

    "дом": {
        type: "object",
        required: [],
        properties: {
            address: {
                type: "string",
                label: "Адрес",
                placeholder: "Введите адрес дома",
                required: false
            },
            cadastre_number: {
                type: "string",
                label: "Кадастровый номер",
                placeholder: "Введите кадастровый номер",
                required: false
            },
            total_area: {
                type: "number",
                minimum: 0,
                label: "Общая площадь",
                placeholder: "Введите площадь",
                required: false
            },
            unit: {
                type: "string",
                enum: ["кв. м"],
                label: "Единица измерения",
                default: "кв. м",
                required: false
            },
            ownership_share: {
                type: "number",
                minimum: 0,
                maximum: 1,
                label: "Доля владения",
                placeholder: "Введите долю (от 0 до 1)",
                required: false
            }
        }
    },

    "земельный участок": {
        type: "object",
        required: [],
        properties: {
            address: {
                type: "string",
                label: "Адрес",
                placeholder: "Введите адрес участка",
                required: false
            },
            cadastre_number: {
                type: "string",
                label: "Кадастровый номер",
                placeholder: "Введите кадастровый номер",
                required: false
            },
            total_area: {
                type: "number",
                minimum: 0,
                label: "Общая площадь",
                placeholder: "Введите площадь",
                required: false
            },
            unit: {
                type: "string",
                enum: ["кв. м"],
                label: "Единица измерения",
                default: "кв. м",
                required: false
            },
            ownership_share: {
                type: "number",
                minimum: 0,
                maximum: 1,
                label: "Доля владения",
                placeholder: "Введите долю (от 0 до 1)",
                required: false
            }
        }
    },
    'иное имущество': {
        type: "object",
        required: [],
        properties: {
            address: {
                type: "string",
                label: "Адрес",
                placeholder: "Введите адрес участка",
                required: false
            },
            cadastre_number: {
                type: "string",
                label: "Кадастровый номер",
                placeholder: "Введите кадастровый номер",
                required: false
            },
            total_area: {
                type: "number",
                minimum: 0,
                label: "Общая площадь",
                placeholder: "Введите площадь",
                required: false
            },
            unit: {
                type: "string",
                enum: ["кв. м"],
                label: "Единица измерения",
                default: "кв. м",
                required: false
            },
            ownership_share: {
                type: "number",
                minimum: 0,
                maximum: 1,
                label: "Доля владения",
                placeholder: "Введите долю (от 0 до 1)",
                required: false
            }
        }
    },

    "гараж": {
        type: "object",
        required: [],
        properties: {
            address: {
                type: "string",
                label: "Адрес",
                placeholder: "Введите адрес гаража",
                required: false
            },
            cadastre_number: {
                type: "string",
                label: "Кадастровый номер",
                placeholder: "Введите кадастровый номер",
                required: false
            },
            total_area: {
                type: "number",
                minimum: 0,
                label: "Общая площадь",
                placeholder: "Введите площадь",
                required: false
            },
            unit: {
                type: "string",
                enum: ["кв. м"],
                label: "Единица измерения",
                default: "кв. м",
                required: false
            },
            ownership_share: {
                type: "number",
                minimum: 0,
                maximum: 1,
                label: "Доля владения",
                placeholder: "Введите долю (от 0 до 1)",
                required: false
            }
        }
    },

    "автомобиль": {
        type: "object",
        required: [],
        properties: {
            brand_model: {
                type: "string",
                label: "Марка и модель",
                placeholder: "Например: Toyota Camry",
                required: false
            },
            vin: {
                type: "string",
                minLength: 1,
                maxLength: 17,
                label: "VIN номер",
                placeholder: "17-значный VIN номер",
                required: false
            },
            registration_number: {
                type: "string",
                label: "Регистрационный номер",
                placeholder: "Например: A123BC777",
                required: false
            },
            year_of_manufacture: {
                type: "integer",
                minimum: 1886,
                label: "Год выпуска",
                placeholder: "Год выпуска",
                required: false
            },
            engine_power: {
                type: "number",
                label: "Мощность двигателя",
                placeholder: "В лошадиных силах",
                required: false
            },
            unit: {
                type: "string",
                label: "Единица измерения",
                placeholder: "Например: л.с.",
                required: false
            },
            is_electric: {
                type: "boolean",
                label: "Электромобиль",
                required: false
            }
        }
    },

    "мотоцикл": {
        type: "object",
        required: [],
        properties: {
            brand_model: {
                type: "string",
                label: "Марка и модель",
                placeholder: "Например: Honda CBR600",
                required: false
            },
            vin: {
                type: "string",
                label: "VIN номер",
                placeholder: "Введите VIN номер",
                required: false
            },
            registration_number: {
                type: "string",
                label: "Регистрационный номер",
                placeholder: "Например: M123BC777",
                required: false
            },
            year_of_manufacture: {
                type: "integer",
                label: "Год выпуска",
                placeholder: "Год выпуска",
                required: false
            },
            engine_power: {
                type: "number",
                label: "Мощность двигателя",
                placeholder: "В лошадиных силах",
                required: false
            },
            unit: {
                type: "string",
                label: "Единица измерения",
                placeholder: "Например: л.с.",
                required: false
            }
        }
    },

    "самолёт": {
        type: "object",
        required: [],
        properties: {
            brand_model: {
                type: "string",
                label: "Марка и модель",
                placeholder: "Например: Cessna 172",
                required: false
            },
            registration_number: {
                type: "string",
                label: "Регистрационный номер",
                placeholder: "Введите регистрационный номер",
                required: false
            },
            year_of_manufacture: {
                type: "integer",
                label: "Год выпуска",
                placeholder: "Год выпуска",
                required: false
            },
            engine_power: {
                type: "number",
                label: "Мощность двигателя",
                placeholder: "В лошадиных силах",
                required: false
            },
            unit: {
                type: "string",
                label: "Единица измерения",
                placeholder: "Например: л.с.",
                required: false
            }
        }
    },

    "яхта": {
        type: "object",
        required: [],
        properties: {
            brand_model: {
                type: "string",
                label: "Марка и модель",
                placeholder: "Например: Princess V50",
                required: false
            },
            imo_number: {
                type: "string",
                label: "IMO номер",
                placeholder: "Введите IMO номер",
                required: false
            },
            registration_port: {
                type: "string",
                label: "Порт регистрации",
                placeholder: "Например: Сочи",
                required: false
            },
            country: {
                type: "string",
                label: "Страна регистрации",
                placeholder: "Например: Россия",
                required: false
            },
            year_of_manufacture: {
                type: "integer",
                label: "Год выпуска",
                placeholder: "Год выпуска",
                required: false
            },
            length: {
                type: "number",
                label: "Длина",
                placeholder: "Длина в метрах",
                required: false
            },
            unit: {
                type: "string",
                enum: ["м"],
                label: "Единица измерения",
                default: "м",
                required: false
            },
            flag: {
                type: "string",
                label: "Флаг",
                placeholder: "Флаг судна",
                required: false
            },
            purchase_price: {
                type: "number",
                label: "Цена покупки",
                placeholder: "Стоимость покупки",
                required: false
            },
            currency: {
                type: "string",

                label: "Валюта",
                placeholder: "Например: RUB, USD, EUR",
                required: false
            },
            owner_trustee: {
                type: "string",
                label: "Доверительный управляющий",
                placeholder: "ФИО доверительного управляющего",
                required: false
            },
            registration_expiry: {
                type: "string",
                format: "date",
                label: "Срок действия регистрации",
                placeholder: "Дата окончания регистрации",
                required: false
            }
        }
    },

    "охотничье ружьё": {
        type: "object",
        required: [],
        properties: {
            model: {
                type: "string",
                label: "Модель",
                placeholder: "Например: ИЖ-27",
                required: false
            },
            caliber: {
                type: "string",
                label: "Калибр",
                placeholder: "Например: 12 калибр",
                required: false
            },
            serial_number: {
                type: "string",
                label: "Серийный номер",
                placeholder: "Введите серийный номер",
                required: false
            },
            license_number: {
                type: "string",
                label: "Номер лицензии",
                placeholder: "Введите номер лицензии",
                required: false
            },
            license_issue_date: {
                type: "string",
                format: "date",
                label: "Дата выдачи лицензии",
                placeholder: "Дата выдачи лицензии",
                required: false
            },
            license_expiry_date: {
                type: "string",
                format: "date",
                label: "Дата окончания лицензии",
                placeholder: "Дата окончания действия лицензии",
                required: false
            },
            issued_by: {
                type: "string",
                label: "Кем выдана лицензия",
                placeholder: "Орган, выдавший лицензию",
                required: false
            },
            storage_location: {
                type: "string",
                label: "Место хранения",
                placeholder: "Адрес места хранения",
                required: false
            }
        }
    },

    "огнестрельное оружие": {
        type: "object",
        required: [],
        properties: {
            model: {
                type: "string",
                label: "Модель",
                placeholder: "Например: Glock 17",
                required: false
            },
            caliber: {
                type: "string",
                label: "Калибр",
                placeholder: "Например: 9mm",
                required: false
            },
            serial_number: {
                type: "string",
                label: "Серийный номер",
                placeholder: "Введите серийный номер",
                required: false
            },
            license_number: {
                type: "string",
                label: "Номер лицензии",
                placeholder: "Введите номер лицензии",
                required: false
            },
            license_issue_date: {
                type: "string",
                format: "date",
                label: "Дата выдачи лицензии",
                placeholder: "Дата выдачи лицензии",
                required: false
            },
            license_expiry_date: {
                type: "string",
                format: "date",
                label: "Дата окончания лицензии",
                placeholder: "Дата окончания действия лицензии",
                required: false
            },
            issued_by: {
                type: "string",
                label: "Кем выдана лицензия",
                placeholder: "Орган, выдавший лицензию",
                required: false
            },
            storage_location: {
                type: "string",
                label: "Место хранения",
                placeholder: "Адрес места хранения",
                required: false
            }
        }
    },

    "сельхозтехника": {
        type: "object",
        required: [],
        properties: {
            brand_model: {
                type: "string",
                label: "Марка и модель",
                placeholder: "Например: John Deere 7810",
                required: false
            },
            vin: {
                type: "string",
                label: "VIN номер",
                placeholder: "Введите VIN номер",
                required: false
            },
            registration_number: {
                type: "string",
                label: "Регистрационный номер",
                placeholder: "Введите регистрационный номер",
                required: false
            },
            year_of_manufacture: {
                type: "integer",
                label: "Год выпуска",
                placeholder: "Год выпуска",
                required: false
            },
            engine_power: {
                type: "number",
                label: "Мощность двигателя",
                placeholder: "В лошадиных силах",
                required: false
            },
            unit: {
                type: "string",
                label: "Единица измерения",
                placeholder: "Например: л.с.",
                required: false
            },
            purchase_price: {
                type: "number",
                label: "Стоимость покупки",
                placeholder: "Стоимость покупки",
                required: false
            },
            currency: {
                type: "string",

                label: "Валюта",
                placeholder: "Например: RUB, USD, EUR",
                required: false
            },
            registration_region: {
                type: "string",
                label: "Регион регистрации",
                placeholder: "Регион регистрации техники",
                required: false
            },
            special_permit_required: {
                type: "boolean",
                label: "Требуется спец. разрешение",
                required: false
            }
        }
    },

    "подарочная карта": {
        type: "object",
        required: [],
        properties: {
            issuer: {
                type: "string",
                label: "Эмитент",
                placeholder: "Например: Магнит, Пятерочка",
                required: false
            },
            card_number: {
                type: "string",
                label: "Номер карты",
                placeholder: "Введите номер карты",
                required: false
            },
            nominal_value: {
                type: "number",
                minimum: 0,
                label: "Номинал",
                placeholder: "Номинал карты",
                required: false
            },
            balance: {
                type: "number",
                minimum: 0,
                label: "Баланс",
                placeholder: "Текущий баланс",
                required: false
            },
            currency: {
                type: "string",

                label: "Валюта",
                placeholder: "Например: RUB, USD, EUR",
                required: false
            },
            issue_date: {
                type: "string",
                format: "date",
                label: "Дата выпуска",
                placeholder: "Дата выпуска карты",
                required: false
            },
            expiry_date: {
                type: "string",
                format: "date",
                label: "Срок действия",
                placeholder: "Дата окончания действия",
                required: false
            },
            terms: {
                type: "string",
                label: "Условия использования",
                placeholder: "Условия использования карты",
                required: false
            }
        }
    },

    "право краткосрочной аренды": {
        type: "object",
        required: [],
        properties: {
            property_type: {
                type: "string",
                label: "Тип имущества",
                placeholder: "Например: квартира, офис",
                required: false
            },
            address: {
                type: "string",
                label: "Адрес",
                placeholder: "Адрес арендуемого имущества",
                required: false
            },
            lease_term_months: {
                type: "integer",
                minimum: 1,
                maximum: 12,
                label: "Срок аренды (мес.)",
                placeholder: "Срок в месяцах",
                required: false
            },
            monthly_rent: {
                type: "number",
                label: "Ежемесячная плата",
                placeholder: "Сумма ежемесячной арендной платы",
                required: false
            },
            currency: {
                type: "string",
                label: "Валюта",
                placeholder: "Например: RUB, USD, EUR",
                required: false
            },
            landlord: {
                type: "string",
                label: "Арендодатель",
                placeholder: "ФИО или наименование арендодателя",
                required: false
            },
            contract_number: {
                type: "string",
                label: "Номер договора",
                placeholder: "Номер договора аренды",
                required: false
            },
            start_date: {
                type: "string",
                format: "date",
                label: "Дата начала",
                placeholder: "Дата начала аренды",
                required: false
            },
            end_date: {
                type: "string",
                format: "date",
                label: "Дата окончания",
                placeholder: "Дата окончания аренды",
                required: false
            },
            deposit_paid: {
                type: "number",
                label: "Депозит",
                placeholder: "Сумма депозита",
                required: false
            },
            deposit_returnable: {
                type: "boolean",
                label: "Депозит возвращаемый",
                required: false
            }
        }
    },

    "платный сервитут": {
        type: "object",
        required: [],
        properties: {
            servitude_type: {
                type: "string",
                enum: ["проезд", "подъезд", "прокладка коммуникаций"],
                label: "Тип сервитута",
                placeholder: "Выберите тип сервитута",
                required: false
            },
            granted_by: {
                type: "string",
                label: "Предоставлен",
                placeholder: "Кем предоставлен сервитут",
                required: false
            },
            property_cadastre: {
                type: "string",
                label: "Кадастровый номер",
                placeholder: "Кадастровый номер имущества",
                required: false
            },
            duration_years: {
                type: "integer",
                minimum: 1,
                label: "Срок действия (лет)",
                placeholder: "Срок действия в годах",
                required: false
            },
            annual_fee: {
                type: "number",
                label: "Годовая плата",
                placeholder: "Сумма годовой плата",
                required: false
            },
            currency: {
                type: "string",
                label: "Валюта",
                placeholder: "Например: RUB, USD, EUR",
                required: false
            },
            payment_method: {
                type: "string",
                label: "Способ оплаты",
                placeholder: "Способ оплаты сервитута",
                required: false
            },
            contract_number: {
                type: "string",
                label: "Номер договора",
                placeholder: "Номер договора сервитута",
                required: false
            },
            purpose: {
                type: "string",
                label: "Цель",
                placeholder: "Цель установления сервитута",
                required: false
            }
        }
    },

    // --- типы без конкретных полей ---
    "акции": {
        type: "object",
        required: [],
        properties: {},
        description: "Акции компаний"
    },
    "облигации": {
        type: "object",
        required: [],
        properties: {},
        description: "Облигации"
    },
    "банковский вклад": {
        type: "object",
        required: [],
        properties: {},
        description: "Банковский вклад"
    },
    "банковский счёт": {
        type: "object",
        required: [],
        properties: {},
        description: "Банковский счет"
    },
    "криптовалюта": {
        type: "object",
        required: [],
        properties: {},
        description: "Криптовалюта"
    },
    "доля в ООО": {
        type: "object",
        required: [],
        properties: {
            organization: {
                type: "string",
                label: "Организация",
                placeholder: "Выберите организацию",
                required: true,
                enum: "legalEntities"  // источник данных
            },
            shape: {
                type: "number",
                label: "Доля владения",
                placeholder: "Доля владения в процентах",
            },
            authorized_capital: {
                type: "number",
                label: "Уставной капитал",
                placeholder: "Уставной капитал",
            }
        },
        description: "Доля в обществе с ограниченной ответственностью"
    },
    "доля в АО": {
        type: "object",
        required: [],
        properties: {},
        description: "Доля в акционерном обществе"
    },
    "доля в оффшорной компании": {
        type: "object",
        required: [],
        properties: {},
        description: "Доля в оффшорной компании"
    },
    "произведение искусства": {
        type: "object",
        required: [],
        properties: {},
        description: "Произведение искусства"
    },
    "коллекция": {
        type: "object",
        required: [],
        properties: {},
        description: "Коллекция"
    },
    "патент": {
        type: "object",
        required: [],
        properties: {},
        description: "Патент"
    },
    "авторское право": {
        type: "object",
        required: [],
        properties: {},
        description: "Авторское право"
    },
    "договор займа": {
        type: "object",
        required: [],
        properties: {},
        description: "Договор займа"
    },
    "доля в праве на имущество": {
        type: "object",
        required: [],
        properties: {
            address: {
                type: "string",
                label: "Адрес",
                placeholder: "Введите адрес участка",
                required: false
            },
            cadastre_number: {
                type: "string",
                label: "Кадастровый номер",
                placeholder: "Введите кадастровый номер",
                required: false
            },
            total_area: {
                type: "number",
                minimum: 0,
                label: "Общая площадь",
                placeholder: "Введите площадь",
                required: false
            },
            unit: {
                type: "string",
                enum: ["кв. м"],
                label: "Единица измерения",
                default: "кв. м",
                required: false
            },
            ownership_share: {
                type: "number",
                minimum: 0,
                maximum: 1,
                label: "Доля владения",
                placeholder: "Введите долю (от 0 до 1)",
                required: false
            }
        },
        description: "Доля в праве на имущество"
    }
};

export {ThirdStageType};
export {ProcedureType};
export {DocumentNameTemplate};
export {LegalEntityType};
export {CommunicationMethodType};
export {AssetSchemas};
