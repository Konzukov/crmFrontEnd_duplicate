import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import contract from "./modules/referenceBook/contract";
import bank from "./modules/referenceBook/bank";
import directions from "./modules/referenceBook/directions";
import event from "./modules/crm/event";
import project from "./modules/referenceBook/project";
import judge from "./modules/referenceBook/judge";
import judicialSessions from "./modules/crm/judicialSessions";
import preProject from "./modules/referenceBook/preProject";
import task from "./modules/crm/task";
import doc from "./modules/crm/document";
import reports from "./modules/crm/reports";
import periodicalTask from './modules/crm/periodicalTask'
import additionalEventData from "./modules/crm/additionalEventData";
import participant from './modules/referenceBook/participant'
import refBook from "./modules/referenceBook/refBook";
import comments from "./modules/crm/comments";
import tags from "./modules/crm/tags";
import post from "./modules/crm/post";
import filemanager from "@/store/modules/fileManager/filemanager";
import moneyReceipts from "@/store/modules/money/moneyReceipts";
import moneyExpenses from "./modules/money/moneyExpenses";
import wallet from "./modules/money/wallet";
import user from "./modules/user/user";
import procedure from "@/store/modules/referenceBook/procedure";
import accountOpening from "@/store/modules/referenceBook/acoountOpening";
import generator from "./modules/docGenerator/generator";
import invoice from "./modules/money/invoice";
import act from "./modules/money/act";
import regularInvoice from "./modules/money/regularInvoice";
import documentStorage from "@/store/modules/documentStorage/documentStorage.js";
import postOrder from "@/store/modules/crm/postOrder";
import notify from "@/store/modules/notify/notify";
import physicalPersonNew from "@/store/modules/referenceBook/physicalPerson/physicalPerson"
import wiki from '@/store/modules/Wiki/wiki'
import documentFlow from "@/store/modules/crm/documentFlow";
import downloads from "@/store/modules/download";
import creditorClaims from "@/store/modules/referenceBook/creditor/creditorClaims";
import snackbar from "@/store/snackbar";
import asset from "@/store/modules/referenceBook/asset";


Vue.use(Vuex)

export default new Vuex.Store({
    actions: {
        resetStoreData({ commit }) {
            commit('RESET_PROJECT')
            commit('RESET_REFBOOK')
            commit('RESET_PHYSICALPERSON')
            commit('RESET_JUDGE')
            commit('RESET_PARTICIPAT')

        }
    },
    modules: {
        physicalPersonNew,
        asset,
        auth,
        participant,
        contract,
        refBook,
        directions,
        event,
        project,
        judge,
        judicialSessions,
        preProject,
        task,
        doc,
        reports,
        periodicalTask,
        additionalEventData,
        comments,
        tags,
        post,
        filemanager,
        documentStorage,
        moneyReceipts,
        moneyExpenses,
        wallet,
        user,
        procedure,
        generator,
        bank,
        invoice,
        act,
        regularInvoice,
        postOrder,
        notify,
        accountOpening,
        wiki,
        documentFlow,
        downloads,
        creditorClaims,
        snackbar
    }
})
