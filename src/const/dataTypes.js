let ProcedureType = {
  Physical: [
    { value: "RCP", text: "Реструктуризация имущества гражданина" },
    { value: "SDP", text: "Реализация имущества должника" }
  ],
  Legal: [
    { value: "OBS", text: "Наблюдение" },
    { value: "ECL", text: "Внешнее управление" },
    { value: "FCR", text: "Финансовое оздоровление" },
    { value: "BPS", text: "Конкурсное производство" }
  ]
};

let ThirdStageType = [
  { value: "empty", text: "Не указано" },
  { value: "UC", text: "Требования, не обеспеченные залогом" },
  { value: "SC", text: "Требования, обеспеченные залогом" },
  { value: "FP", text: "Штрафы, пени" },
  { value: "PT", text: "Проценты" },
  { value: "OR", text: "Другое" }
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
  }
];

let LegalEntityType = [
  { header: "Юридическое лицо" },
  { value: "EMPTY", text: "Юридическое лицо" },
  { divider: true },
  { header: "Банк" },
  { value: "BANK", text: "Банк" },
  { value: "DIB", text: "Биржи и депозитарии" },
  { value: "BKI", text: "Бюро кредитных историй (БКИ)" },
  { divider: true },
  { header: "Гос учреждения" },
  { value: "FSSP", text: "Федеральная служба судебных приставов" },
  { value: "FNS", text: "Федеральная налоговая служба" },
  { value: "GIBDD", text: "ГИБДД" },
  { value: "GIMS", text: "Государственная инспекция по маломерным судам" },
  { value: "MVD", text: "Министерство внутренних дел" },
  { value: "ADDRD", text: "Адресный стол" },
  { value: "TECHN", text: "Технадзор" },
  { value: "FSIN", text: "Федеральная служба исполнения наказаний" },
  { value: "OSFR", text: "Пенсионный и социальный фонды" },
  { value: "GIT", text: "Государственная инспекция по труду" },
  { value: "BTI", text: "Бюро технической инвентаризации" },
  { value: "DIZO", text: "Департамент имущественно-земельных отношений" },
  {
    value: "UFSVN",
    text: "Управление Федеральной службы войск национальной гвардии"
  },
  { value: "EMPLS", text: "Служба занятости" },
  { value: "ZAGS", text: "ЗАГС" },
  { divider: true },
  { header: "Суды" },
  { value: "ARBCR", text: "Арбитражный суд" },
  { value: "GEJRD", text: "Суд общей юрисдикции" },
  { value: "MOSC", text: "Военный и другие специализированные суды" },
  { value: "GEJRD", text: "Суд общей юрисдикции" },
  { value: "MGSCR", text: "Мировой суд" },
  { value: "ACA", text: "Арбитражный апелляционной инстанции" },
  { value: "ACC", text: "Арбитражный кассационной инстанции" },
  { value: "SCRF", text: "Верховный суд Российской Федерации" },
  { value: "CGJF", text: "Суд общей юрисдикции первой инстанции" },
  {
    value: "CGJA",
    text: "Суд общей юрисдикции апелляционной инстанции (региональный суд)"
  },
  { value: "CGJC", text: "Суд общей юрисдикции кассационной инстанции" },
  { value: "AC", text: "Третейский суд" }
];

let CommunicationMethodType = [
  { value: "ElectronicMail", text: "Электронные письма (ЭЗП)" },
  { value: "PaperMail", text: "Бумажная почта" },
  { value: "Email", text: "Электронная почта (Email)" },
  { value: "Phone", text: "Номер телефона" }
];

let AssetSchemas = {
  "квартира": {
    type: "object",
    required: ["address", "cadastre_number", "total_area"],
    properties: {
      address: {
        type: "string",
        label: "Адрес",
        placeholder: "Введите адрес квартиры"
      },
      cadastre_number: {
        type: "string",
        label: "Кадастровый номер",
        placeholder: "Введите кадастровый номер"
      },
      total_area: {
        type: "number",
        minimum: 0,
        label: "Общая площадь",
        placeholder: "Введите площадь"
      },
      unit: {
        type: "string",
        enum: ["кв. м"],
        label: "Единица измерения",
        default: "кв. м"
      },
      ownership_share: {
        type: "number",
        minimum: 0,
        maximum: 1,
        label: "Доля владения",
        placeholder: "Введите долю (от 0 до 1)"
      }
    }
  },

  "дом": {
    type: "object",
    required: ["address", "cadastre_number", "total_area"],
    properties: {
      address: {
        type: "string",
        label: "Адрес",
        placeholder: "Введите адрес дома"
      },
      cadastre_number: {
        type: "string",
        label: "Кадастровый номер",
        placeholder: "Введите кадастровый номер"
      },
      total_area: {
        type: "number",
        minimum: 0,
        label: "Общая площадь",
        placeholder: "Введите площадь"
      },
      unit: {
        type: "string",
        enum: ["кв. м"],
        label: "Единица измерения",
        default: "кв. м"
      },
      ownership_share: {
        type: "number",
        minimum: 0,
        maximum: 1,
        label: "Доля владения",
        placeholder: "Введите долю (от 0 до 1)"
      }
    }
  },

  "земельный участок": {
    type: "object",
    required: ["address", "cadastre_number", "total_area"],
    properties: {
      address: {
        type: "string",
        label: "Адрес",
        placeholder: "Введите адрес участка"
      },
      cadastre_number: {
        type: "string",
        label: "Кадастровый номер",
        placeholder: "Введите кадастровый номер"
      },
      total_area: {
        type: "number",
        minimum: 0,
        label: "Общая площадь",
        placeholder: "Введите площадь"
      },
      unit: {
        type: "string",
        enum: ["кв. м"],
        label: "Единица измерения",
        default: "кв. м"
      },
      ownership_share: {
        type: "number",
        minimum: 0,
        maximum: 1,
        label: "Доля владения",
        placeholder: "Введите долю (от 0 до 1)"
      }
    }
  },

  "гараж": {
    type: "object",
    required: ["address", "cadastre_number", "total_area"],
    properties: {
      address: {
        type: "string",
        label: "Адрес",
        placeholder: "Введите адрес гаража"
      },
      cadastre_number: {
        type: "string",
        label: "Кадастровый номер",
        placeholder: "Введите кадастровый номер"
      },
      total_area: {
        type: "number",
        minimum: 0,
        label: "Общая площадь",
        placeholder: "Введите площадь"
      },
      unit: {
        type: "string",
        enum: ["кв. м"],
        label: "Единица измерения",
        default: "кв. м"
      },
      ownership_share: {
        type: "number",
        minimum: 0,
        maximum: 1,
        label: "Доля владения",
        placeholder: "Введите долю (от 0 до 1)"
      }
    }
  },

  "автомобиль": {
    type: "object",
    required: ["brand_model", "vin", "registration_number"],
    properties: {
      brand_model: {
        type: "string",
        label: "Марка и модель",
        placeholder: "Например: Toyota Camry"
      },
      vin: {
        type: "string",
        minLength: 17,
        maxLength: 17,
        label: "VIN номер",
        placeholder: "17-значный VIN номер"
      },
      registration_number: {
        type: "string",
        label: "Регистрационный номер",
        placeholder: "Например: A123BC777"
      },
      year_of_manufacture: {
        type: "integer",
        minimum: 1886,
        label: "Год выпуска",
        placeholder: "Год выпуска"
      },
      engine_power: {
        type: "number",
        label: "Мощность двигателя",
        placeholder: "В лошадиных силах"
      },
      unit: {
        type: "string",
        label: "Единица измерения",
        placeholder: "Например: л.с."
      },
      is_electric: {
        type: "boolean",
        label: "Электромобиль"
      }
    }
  },

  "мотоцикл": {
    type: "object",
    required: ["brand_model", "vin", "registration_number"],
    properties: {
      brand_model: {
        type: "string",
        label: "Марка и модель",
        placeholder: "Например: Honda CBR600"
      },
      vin: {
        type: "string",
        label: "VIN номер",
        placeholder: "Введите VIN номер"
      },
      registration_number: {
        type: "string",
        label: "Регистрационный номер",
        placeholder: "Например: M123BC777"
      },
      year_of_manufacture: {
        type: "integer",
        label: "Год выпуска",
        placeholder: "Год выпуска"
      },
      engine_power: {
        type: "number",
        label: "Мощность двигателя",
        placeholder: "В лошадиных силах"
      },
      unit: {
        type: "string",
        label: "Единица измерения",
        placeholder: "Например: л.с."
      }
    }
  },

  "самолёт": {
    type: "object",
    required: ["brand_model", "registration_number"],
    properties: {
      brand_model: {
        type: "string",
        label: "Марка и модель",
        placeholder: "Например: Cessna 172"
      },
      registration_number: {
        type: "string",
        label: "Регистрационный номер",
        placeholder: "Введите регистрационный номер"
      },
      year_of_manufacture: {
        type: "integer",
        label: "Год выпуска",
        placeholder: "Год выпуска"
      },
      engine_power: {
        type: "number",
        label: "Мощность двигателя",
        placeholder: "В лошадиных силах"
      },
      unit: {
        type: "string",
        label: "Единица измерения",
        placeholder: "Например: л.с."
      }
    }
  },

  "яхта": {
    type: "object",
    required: ["brand_model", "imo_number", "registration_port", "country"],
    properties: {
      brand_model: {
        type: "string",
        label: "Марка и модель",
        placeholder: "Например: Princess V50"
      },
      imo_number: {
        type: "string",
        label: "IMO номер",
        placeholder: "Введите IMO номер"
      },
      registration_port: {
        type: "string",
        label: "Порт регистрации",
        placeholder: "Например: Сочи"
      },
      country: {
        type: "string",
        label: "Страна регистрации",
        placeholder: "Например: Россия"
      },
      year_of_manufacture: {
        type: "integer",
        label: "Год выпуска",
        placeholder: "Год выпуска"
      },
      length: {
        type: "number",
        label: "Длина",
        placeholder: "Длина в метрах"
      },
      unit: {
        type: "string",
        enum: ["м"],
        label: "Единица измерения",
        default: "м"
      },
      flag: {
        type: "string",
        label: "Флаг",
        placeholder: "Флаг судна"
      },
      purchase_price: {
        type: "number",
        label: "Цена покупки",
        placeholder: "Стоимость покупки"
      },
      currency: {
        type: "string",
        pattern: "^[A-Z]{3}$",
        label: "Валюта",
        placeholder: "Например: RUB, USD, EUR"
      },
      owner_trustee: {
        type: "string",
        label: "Доверительный управляющий",
        placeholder: "ФИО доверительного управляющего"
      },
      registration_expiry: {
        type: "string",
        format: "date",
        label: "Срок действия регистрации",
        placeholder: "Дата окончания регистрации"
      }
    }
  },

  "охотничье ружьё": {
    type: "object",
    required: ["model", "serial_number", "license_number"],
    properties: {
      model: {
        type: "string",
        label: "Модель",
        placeholder: "Например: ИЖ-27"
      },
      caliber: {
        type: "string",
        label: "Калибр",
        placeholder: "Например: 12 калибр"
      },
      serial_number: {
        type: "string",
        label: "Серийный номер",
        placeholder: "Введите серийный номер"
      },
      license_number: {
        type: "string",
        label: "Номер лицензии",
        placeholder: "Введите номер лицензии"
      },
      license_issue_date: {
        type: "string",
        format: "date",
        label: "Дата выдачи лицензии",
        placeholder: "Дата выдачи лицензии"
      },
      license_expiry_date: {
        type: "string",
        format: "date",
        label: "Дата окончания лицензии",
        placeholder: "Дата окончания действия лицензии"
      },
      issued_by: {
        type: "string",
        label: "Кем выдана лицензия",
        placeholder: "Орган, выдавший лицензию"
      },
      storage_location: {
        type: "string",
        label: "Место хранения",
        placeholder: "Адрес места хранения"
      }
    }
  },

  "огнестрельное оружие": {
    type: "object",
    required: ["model", "serial_number", "license_number"],
    properties: {
      model: {
        type: "string",
        label: "Модель",
        placeholder: "Например: Glock 17"
      },
      caliber: {
        type: "string",
        label: "Калибр",
        placeholder: "Например: 9mm"
      },
      serial_number: {
        type: "string",
        label: "Серийный номер",
        placeholder: "Введите серийный номер"
      },
      license_number: {
        type: "string",
        label: "Номер лицензии",
        placeholder: "Введите номер лицензии"
      },
      license_issue_date: {
        type: "string",
        format: "date",
        label: "Дата выдачи лицензии",
        placeholder: "Дата выдачи лицензии"
      },
      license_expiry_date: {
        type: "string",
        format: "date",
        label: "Дата окончания лицензии",
        placeholder: "Дата окончания действия лицензии"
      },
      issued_by: {
        type: "string",
        label: "Кем выдана лицензия",
        placeholder: "Орган, выдавший лицензию"
      },
      storage_location: {
        type: "string",
        label: "Место хранения",
        placeholder: "Адрес места хранения"
      }
    }
  },

  "сельхозтехника": {
    type: "object",
    required: ["brand_model", "vin", "registration_number"],
    properties: {
      brand_model: {
        type: "string",
        label: "Марка и модель",
        placeholder: "Например: John Deere 7810"
      },
      vin: {
        type: "string",
        label: "VIN номер",
        placeholder: "Введите VIN номер"
      },
      registration_number: {
        type: "string",
        label: "Регистрационный номер",
        placeholder: "Введите регистрационный номер"
      },
      year_of_manufacture: {
        type: "integer",
        label: "Год выпуска",
        placeholder: "Год выпуска"
      },
      engine_power: {
        type: "number",
        label: "Мощность двигателя",
        placeholder: "В лошадиных силах"
      },
      unit: {
        type: "string",
        label: "Единица измерения",
        placeholder: "Например: л.с."
      },
      purchase_price: {
        type: "number",
        label: "Стоимость покупки",
        placeholder: "Стоимость покупки"
      },
      currency: {
        type: "string",
        pattern: "^[A-Z]{3}$",
        label: "Валюта",
        placeholder: "Например: RUB, USD, EUR"
      },
      registration_region: {
        type: "string",
        label: "Регион регистрации",
        placeholder: "Регион регистрации техники"
      },
      special_permit_required: {
        type: "boolean",
        label: "Требуется спец. разрешение"
      }
    }
  },

  "подарочная карта": {
    type: "object",
    required: ["issuer", "card_number", "nominal_value", "currency"],
    properties: {
      issuer: {
        type: "string",
        label: "Эмитент",
        placeholder: "Например: Магнит, Пятерочка"
      },
      card_number: {
        type: "string",
        label: "Номер карты",
        placeholder: "Введите номер карты"
      },
      nominal_value: {
        type: "number",
        minimum: 0,
        label: "Номинал",
        placeholder: "Номинал карты"
      },
      balance: {
        type: "number",
        minimum: 0,
        label: "Баланс",
        placeholder: "Текущий баланс"
      },
      currency: {
        type: "string",
        pattern: "^[A-Z]{3}$",
        label: "Валюта",
        placeholder: "Например: RUB, USD, EUR"
      },
      issue_date: {
        type: "string",
        format: "date",
        label: "Дата выпуска",
        placeholder: "Дата выпуска карты"
      },
      expiry_date: {
        type: "string",
        format: "date",
        label: "Срок действия",
        placeholder: "Дата окончания действия"
      },
      terms: {
        type: "string",
        label: "Условия использования",
        placeholder: "Условия использования карты"
      }
    }
  },

  "право краткосрочной аренды": {
    type: "object",
    required: [
      "property_type",
      "address",
      "lease_term_months",
      "monthly_rent",
      "start_date",
      "end_date"
    ],
    properties: {
      property_type: {
        type: "string",
        label: "Тип имущества",
        placeholder: "Например: квартира, офис"
      },
      address: {
        type: "string",
        label: "Адрес",
        placeholder: "Адрес арендуемого имущества"
      },
      lease_term_months: {
        type: "integer",
        minimum: 1,
        maximum: 12,
        label: "Срок аренды (мес.)",
        placeholder: "Срок в месяцах"
      },
      monthly_rent: {
        type: "number",
        label: "Ежемесячная плата",
        placeholder: "Сумма ежемесячной арендной платы"
      },
      currency: {
        type: "string",
        pattern: "^[A-Z]{3}$",
        label: "Валюта",
        placeholder: "Например: RUB, USD, EUR"
      },
      landlord: {
        type: "string",
        label: "Арендодатель",
        placeholder: "ФИО или наименование арендодателя"
      },
      contract_number: {
        type: "string",
        label: "Номер договора",
        placeholder: "Номер договора аренды"
      },
      start_date: {
        type: "string",
        format: "date",
        label: "Дата начала",
        placeholder: "Дата начала аренды"
      },
      end_date: {
        type: "string",
        format: "date",
        label: "Дата окончания",
        placeholder: "Дата окончания аренды"
      },
      deposit_paid: {
        type: "number",
        label: "Депозит",
        placeholder: "Сумма депозита"
      },
      deposit_returnable: {
        type: "boolean",
        label: "Депозит возвращаемый"
      }
    }
  },

  "платный сервитут": {
    type: "object",
    required: [
      "servitude_type",
      "granted_by",
      "property_cadastre",
      "duration_years",
      "annual_fee",
      "currency"
    ],
    properties: {
      servitude_type: {
        type: "string",
        enum: ["проезд", "подъезд", "прокладка коммуникаций"],
        label: "Тип сервитута",
        placeholder: "Выберите тип сервитута"
      },
      granted_by: {
        type: "string",
        label: "Предоставлен",
        placeholder: "Кем предоставлен сервитут"
      },
      property_cadastre: {
        type: "string",
        label: "Кадастровый номер",
        placeholder: "Кадастровый номер имущества"
      },
      duration_years: {
        type: "integer",
        minimum: 1,
        label: "Срок действия (лет)",
        placeholder: "Срок действия в годах"
      },
      annual_fee: {
        type: "number",
        label: "Годовая плата",
        placeholder: "Сумма годовой платы"
      },
      currency: {
        type: "string",
        pattern: "^[A-Z]{3}$",
        label: "Валюта",
        placeholder: "Например: RUB, USD, EUR"
      },
      payment_method: {
        type: "string",
        label: "Способ оплаты",
        placeholder: "Способ оплаты сервитута"
      },
      contract_number: {
        type: "string",
        label: "Номер договора",
        placeholder: "Номер договора сервитута"
      },
      purpose: {
        type: "string",
        label: "Цель",
        placeholder: "Цель установления сервитута"
      }
    }
  },

  // --- типы без конкретных полей ---
  "акции": {
    type: "object",
    properties: {},
    description: "Акции компаний"
  },
  "облигации": {
    type: "object",
    properties: {},
    description: "Облигации"
  },
  "банковский вклад": {
    type: "object",
    properties: {},
    description: "Банковский вклад"
  },
  "банковский счёт": {
    type: "object",
    properties: {},
    description: "Банковский счет"
  },
  "криптовалюта": {
    type: "object",
    properties: {},
    description: "Криптовалюта"
  },
  "доля в ООО": {
    type: "object",
    properties: {},
    description: "Доля в обществе с ограниченной ответственностью"
  },
  "доля в АО": {
    type: "object",
    properties: {},
    description: "Доля в акционерном обществе"
  },
  "доля в оффшорной компании": {
    type: "object",
    properties: {},
    description: "Доля в оффшорной компании"
  },
  "произведение искусства": {
    type: "object",
    properties: {},
    description: "Произведение искусства"
  },
  "коллекция": {
    type: "object",
    properties: {},
    description: "Коллекция"
  },
  "патент": {
    type: "object",
    properties: {},
    description: "Патент"
  },
  "авторское право": {
    type: "object",
    properties: {},
    description: "Авторское право"
  },
  "договор займа": {
    type: "object",
    properties: {},
    description: "Договор займа"
  },
  "доля в праве на имущество": {
    type: "object",
    properties: {},
    description: "Доля в праве на имущество"
  }
};

export { ThirdStageType };
export { ProcedureType };
export { DocumentNameTemplate };
export { LegalEntityType };
export { CommunicationMethodType };
export { AssetSchemas };
