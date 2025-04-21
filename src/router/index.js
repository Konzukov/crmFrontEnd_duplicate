import Vue from 'vue'
import VueRouter from 'vue-router'
import Authorization from '../components/Authorization'
import Dashboard from "../components/Dashboard";
import ReferenceBook from "../components/ReferenceBook"
import PhysicalPerson from "../components/referenceBook/PhysicalPerson/PhysicalPerson";
import LegalEntity from "../components/referenceBook/LegalEntity";
import Participator from "../components/referenceBook/Participator";
import CRM from "../components/CRM";
import ParticipatorDetail from "../components/referenceBook/ParticipatorDetail";
import ParticipatorOrganization from "../components/referenceBook/ParticipatorOrganization";
import ParticipatorStaffList from "../components/referenceBook/ParticipatorStaffList";
import Contract from "../components/referenceBook/Contract";
import Directions from "../components/referenceBook/Directions";
import Events from "../components/CRM/Event/Events";
import Project from "../components/referenceBook/Project/Project";
import Task from "../components/CRM/Task/Task";
import PaperFlow from "../components/CRM/PaperFlow/PaperFlow";
// import ProcessedDocument from "../components/CRM/PaperFlow/ProcessedDocument";
// import UnProcessedDocument from "../components/CRM/PaperFlow/UnProcessedDocument";
import TrashDocument from "../components/CRM/PaperFlow/TrashDocument";
import Report from "../components/CRM/Reports/Report";
import UserReport from "../components/CRM/Reports/UserReport";
import SingleDocument from "../components/CRM/PaperFlow/SingleDocument";
import PeriodicalTask from "../components/CRM/PeriodicalTask/PeriodicalTask";
import Setting from "../components/Setting/Setting";
import Post from "@/components/CRM/PaperFlow/Post/Post";
import FileView from "@/components/FileManager/FileView";
import Money from "@/components/Money/Money";
import MoneyReceipts from "@/components/Money/MoneyReceipts";
import Forbidden from "@/components/Forbidden";
import OutgoingMail from "@/components/CRM/PaperFlow/Post/OutgoingMail";
import CreateOutgoingMail from "../components/CRM/PaperFlow/Post/CreateOutgoingMail";
import TrashPostList from "../components/CRM/PaperFlow/Post/TrashPostList";
import UserList from "../components/User/UserList";
import DashboardTask from "../components/Dashboard/DashboardTask";
import DashboardTaskDetail from "../components/Dashboard/DashboardTaskDetail";
import ProjectNew from "../components/referenceBook/ProjectNew/ProjectNew";
import ProjectDetail from "../components/referenceBook/ProjectNew/ProjectDetail";
import store from "@/store";

Vue.use(VueRouter)

const routes = [
    {
        path: '',
        redirect: '/dashboard',
        name: 'home',
        meta: {
            authRequire: true
        },
    },
    {
        path: '/login',
        name: 'authorization',
        component: Authorization
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: {
            authRequire: true
        },
        props: true,
        children: [
            {
                name: 'pdf-view',
                path: 'pdf-view',
                component: () => import('@/components/PDFViewer/PDFDocument'),
            },
            {
                path: 'xworks',
                name: 'xworks',
            },
            {
                path: 'tvairs',
                name: 'tvairs',
            },
            {
                path: 'reference-book',
                name: 'reference_book',
                component: ReferenceBook,
                props: true,
                children: [
                    {
                        path: 'physical-person-v2',
                        name: 'physicalPersonV2',
                         component: () => import('@/views/PhysicalPersonV2/PhysicalPerson.vue')
                    },
                    {
                        path: 'physical-person',
                        name: 'physical-person',
                        component: PhysicalPerson
                    }, {
                        path: 'legal-entity',
                        name: 'legal-entity',
                        component: LegalEntity
                    },
                    {
                        path: 'participator',
                        name: 'participator',
                        component: Participator
                    },
                    {
                        path: 'participator-detail/:pk',
                        name: 'participatorDetail',
                        component: ParticipatorDetail,
                        children: []
                    },
                    {
                        path: 'participator-detail/organization/:pk',
                        name: 'participatorOrganization',
                        component: ParticipatorOrganization,
                    },
                    {
                        path: 'participator-detail/staff-list/:pk',
                        name: 'participatorStaff',
                        component: ParticipatorStaffList,
                    },
                    {
                        path: 'directions-list',
                        name: 'direction-list',
                        component: Directions
                    },
                    {
                        path: 'contract-list',
                        name: 'contract',
                        component: Contract
                    },
                    {
                        path: 'project',
                        name: 'project-list',
                        component: Project,
                    },
                    {
                        path: 'project-detail/:pk',
                        name: 'project-detail',
                        component: () => import('../components/referenceBook/Project/ProjectDetail.vue'),
                        children: [
                            {
                                path: 'file-view',
                                name: 'file-view',
                                component: () => import('../components/referenceBook/Project/FileView/FileView')
                            },
                            {
                                path: 'procedure',
                                name: 'procedure',
                                component: () => import('../components/referenceBook/Project/Procedure')
                            },
                            {
                                path: 'report',
                                name: 'project-report',
                                component: () => import('../components/referenceBook/Project/ProjectReport.vue'),
                            },
                            {
                                path: 'questionnaire',
                                name: 'project-questionnaire',
                                component: () => import('../components/referenceBook/Project/ProjectQuestionnaire')
                            },
                            {
                                path: 'money',
                                name: 'project-money',
                                component: () => import('../components/referenceBook/Project/ProjectMoney')
                            },
                            {
                                path: 'dispute',
                                name: 'separate-dispute',
                                component: () => import('../components/referenceBook/Project/SeparateDispute')
                            },
                            {
                                path: 'curt-card',
                                name: 'curt',
                                component: () => import('../components/referenceBook/Project/CurtCard.vue')
                            }
                        ]
                    },
                    {
                        path: 'pre-project',
                        name: 'preProject',
                        component: () => import('../components/referenceBook/PreProject/PreProject'),
                        children: [
                            {
                                path: 'create',
                                name: 'createPreProject',
                                component: () => import('../components/referenceBook/PreProject/Create')
                            },
                            {
                                path: 'edit/:id',
                                name: 'editPreProject',
                                props: true,
                                component: () => import('../components/referenceBook/PreProject/Create')
                            }
                        ]
                    },
                    {
                        path: 'account-opening',
                        name: 'AccountOpening',
                        component: () => import('../components/referenceBook/AccountOpening/AccountOpening.vue')
                    },
                    {
                        path: 'new-project',
                        name: 'new-project-list',
                        component: ProjectNew,
                        children: [
                            {
                                path: ':pk',
                                name: 'new-project-detail',
                                component: ProjectDetail,
                                props: true
                            },

                        ],
                    },
                    {
                        path: 'project-wizard',
                        name: 'projectWizard',
                        component: () => import('../components/referenceBook/ProjectNew/ProjectSetupWizard')
                    }
                ]
            },
            {
                path: 'crm',
                name: 'crm',
                component: CRM,
                props: true,
                children: [
                    {
                        path: 'events',
                        name: 'event-list',
                        component: Events
                    },
                    {
                        path: 'task',
                        name: 'task-list',
                        component: Task
                    },
                    {
                        path: 'periodical-task',
                        name: 'periodical-task',
                        component: PeriodicalTask
                    },

                ],
            },
            {
                name: 'documents_storage',
                path: 'documents-storage',
                component: () => import('@/views/DocumentsStorage/DocumentsStorage'),
                children: [
                    {
                        name: 'processed-documents-list',
                        path: 'processed-documents-list',
                        component: () => import('@/views/DocumentsStorage/DocumentsStorageList'),
                    },
                    // {
                    //     name: 'documents-storage-create',
                    //     path: 'documents-storage-create',
                    //     component: () => import('@/views/DocumentsStorage/DocumentCreateView')
                    // }
                ]
            },
            {
                path: 'paper-flow',
                name: 'paper_flow',
                component: PaperFlow,
                meta: {
                    authRequire: true
                },
                children: [
                    {
                        name: 'post-order',
                        path: 'post-order',
                        navName: 'Отправка почты',
                        meta: {
                            authRequire: true
                        },
                        component: () => import('@/components/CRM/PaperFlow/PostOrder/PostSendQueue.vue'),
                    },
                    {
                        name: 'incoming-post',
                        path: 'incoming-post',
                        navName: 'Входящие',
                        component: Post,
                    },
                    {
                        name: 'outgoing-post',
                        path: 'outgoing-post',
                        navName: 'Исходящие',
                        component: OutgoingMail,
                    },
                    {
                        path: 'correspondence',
                        name: 'correspondence',
                        navName: 'Корреспонденция',
                        component: () => import('@/components/CRM/PaperFlow/Correspondence')
                    },
                    {
                        path: 'email',
                        name: 'email',
                        navName: 'Электронная почта',
                        component: () => import('@/components/CRM/PaperFlow/Email')
                    },
                    // {
                    //     path: 'processed-document-list',
                    //     name: 'processed-document-list',
                    //     navName: 'Обработанные',
                    //     component: ProcessedDocument
                    // },
                    // {
                    //     path: 'unprocessed-document-list',
                    //     name: 'unprocessed-document-list',
                    //     navName: 'Не обработанные',
                    //     component: UnProcessedDocument
                    // },
                    {
                        path: 'trash-document-list',
                        name: 'trash-document-list',
                        navName: 'Корзина',
                        component: TrashDocument
                    },
                    {
                        path: 'single-document/:pk',
                        name: 'single-document',
                        component: SingleDocument
                    },
                    {
                        path: 'file-view/:pk',
                        name: 'file-view-detail',
                        component: FileView
                    },
                    {
                        name: 'create-outgoing-post',
                        path: 'create-outgoing-post',
                        component: CreateOutgoingMail
                    },
                    {
                        name: 'create-outgoing-post-xlsx',
                        path: 'create-outgoing-post-xlsx',
                        component: () => import('../components/CRM/PaperFlow/Post/CreateOutgoingMailXlsx'),
                    },
                    {
                        name: 'trash-post-list',
                        path: 'trash-post-list',
                        component: TrashPostList
                    },
                    {
                        name: 'post-parsing',
                        path: 'post-parsing',
                        component: () => import('../components/CRM/PaperFlow/Post/PostParsing'),
                    },
                ]
            },
            {
                path: 'report',
                name: 'report',
                component: Report,
                children: [
                    {
                        path: 'project-report',
                        name: 'project-reports',
                        component: () => import('@/components/CRM/Reports/ProjectReport')
                    },
                    {
                        path: 'user-report',
                        name: 'user-report',
                        component: UserReport
                    },
                ]
            },
            {
                name: 'money',
                path: 'money',
                component: Money,
                meta: {
                    moneyPermission: true
                },
                children: [
                    {
                        name: 'money-receipts',
                        path: 'money-receipts',
                        component: MoneyReceipts
                    },
                    {
                        name: 'money-expenses',
                        path: 'money-expenses',
                        component: () => import('../components/Money/MoneyExpenses')
                    },
                    {
                        name: 'invoice',
                        path: 'invoice',
                        component: () => import('../components/Money/Invoice/Invoice'),
                        children: [
                            {
                                name: 'invoice-list',
                                path: 'invoice-list',
                                component: () => import('../components/Money/Invoice/InvoiceList')
                            },
                            {
                                name: 'invoice-create',
                                path: 'invoice-create',
                                component: () => import('../components/Money/Invoice/InvoiceCreate')
                            },
                            {
                                name: 'invoice-edit',
                                path: 'invoice-edit/:id',
                                component: () => import('../components/Money/Invoice/InvoiceCreate'),
                                props: true
                            },
                            {
                                name: 'act-list',
                                path: 'act-list',
                                component: () => import('../components/Money/Act/ActList'),
                                props: true
                            },
                            {
                                name: 'act-create',
                                path: 'act-create',
                                component: () => import('../components/Money/Act/ActCreate'),
                                props: true
                            },
                            {
                                name: 'act-edit',
                                path: 'act-create/:id',
                                component: () => import('../components/Money/Act/ActCreate'),
                                props: true
                            },
                            {
                                name: 'regular-invoice-list',
                                path: 'regular-invoice-list',
                                component: () => import('../components/Money/RegularInvoice/RegularInvoiceList'),
                            },
                            {
                                name: 'regular-invoice-create',
                                path: 'regular-invoice-create',
                                component: () => import('../components/Money/RegularInvoice/RegularInvoiceCreate'),
                                props: true
                            },
                            {
                                name: 'regular-invoice-edit',
                                path: 'regular-invoice-edit/:id',
                                component: () => import('../components/Money/RegularInvoice/RegularInvoiceCreate'),
                                props: true
                            },
                        ]
                    },
                ]
            },
            {
                name: 'permission',
                path: 'user-list',
                component: UserList,
            },
            {
                path: '/setting',
                name: 'account-setting',
                component: Setting,
                meta: {
                    authRequire: true
                },
            },
            {
                path: 'task-list',
                name: 'dashboard-task',
                component: DashboardTask,
                children: [
                    {
                        path: ':pk',
                        name: 'task-detail',
                        component: DashboardTaskDetail,
                        props: true
                    }

                ]
            },
            {
                name: 'document_generator',
                path: 'doc-generator',
                component: () => import('../components/ContractsGenerator/DocumentGeneratorOld'),
            },
            {
                name: 'documentGenerator',
                path: 'document-generator',
                component: () => import('../components/DocumentGeneration/DocumentList'),
            },
            {
                name: 'proj_wizard',
                path: 'proj-wizard',
                component: () => import('../components/Wizard/Wizard'),
            },
            {
                name: 'event-calendar',
                path: 'calendar',
                component: () => import('@/components/JudicialCalendar/EventCalendar')
            },
            {
                name: 'background-task',
                path: 'background-task',
                component: () => import('@/components/Dashboard/BackgroundTask')
            }
        ]
    },
    {
        name: 'permission-denied',
        path: '/forbidden',
        component: Forbidden
    }

]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})


router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.authRequire)) {
        if (store.getters.isLoggedIn) {
            next()
            return
        }
        setTimeout(() => {
            next('/login')
        }, 2000)

    } else {
        next()
    }
})

export default router
