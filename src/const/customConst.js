const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'http://crm.planer-studio.ru:9090'
  : 'http://127.0.0.1:8181'

const REFERENCE_BOOK_API = `${BASE_URL}/api/reference_book/`
const AUTH_API = `${BASE_URL}/api/auth/`
const CRM_API = `${BASE_URL}/api/crm/`
const PAPERFLOW_API = `${BASE_URL}/api/paper-flow/`
const DOCUMENTS_STORAGE_API = `${BASE_URL}/api/documents-storage/`
const REPORT_API = `${BASE_URL}/api/report/`
const FILE_MANAGER = `${BASE_URL}/api/filemanager/`
const MONEY = `${BASE_URL}/api/money/`
const PROCEDURE = `${BASE_URL}/api/procedure/`
const GENERATOR = `${BASE_URL}/api/document-generator/`
const NOTIFY = `${BASE_URL}/api/notify/`
const DOCUMENT_FLOW = `${BASE_URL}/api/document-flow/`

export default {
    BASE_URL,
    REFERENCE_BOOK_API,
    AUTH_API,
    CRM_API,
    PAPERFLOW_API,  
    DOCUMENTS_STORAGE_API,
    REPORT_API,
    FILE_MANAGER,
    MONEY,
    PROCEDURE,
    GENERATOR,
    NOTIFY,
    DOCUMENT_FLOW,
}


