import Vue from 'vue'
import App from './App.vue'
import Axios from 'axios'
import VueCookies from 'vue-cookies'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import VueMask from 'v-mask'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import locale from 'element-ui/lib/locale/lang/ru-RU'
import excel from 'vue-excel-export'
import VueExcelXlsx from "vue-excel-xlsx";
import VCalendar from 'v-calendar';
import CKEditor from '@ckeditor/ckeditor5-vue2';
import { DocumentEditorContainerPlugin } from '@syncfusion/ej2-vue-documenteditor';
Vue.use(DocumentEditorContainerPlugin);
Vue.use( CKEditor );




Vue.prototype.$http = Axios
Vue.prototype.$http.defaults.baseURL = 'api/';
Vue.config.productionTip = false
Axios.defaults.baseURL = 'api/';


// Vue.prototype.$http.defaults.baseURL = 'http://127.0.0.1:8181/api/';
// Vue.config.productionTip = false
// Axios.defaults.baseURL = 'http://127.0.0.1:8181/api/';

const token = localStorage.getItem('token')
Vue.prototype.$http.defaults.headers.common['Content-Type'] = 'multipart/form-data'
if (token) {
    // Vue.$http
    Vue.prototype.$http.defaults.headers.common['Authorization'] = token
}

Vue.use(ElementUI,{locale});
Vue.use(VueMask)
Vue.use(VueCookies)
Vue.use(excel)
Vue.use(VueExcelXlsx)
Vue.use(ElementUI);
Vue.use(VCalendar, {
  componentPrefix: 'vc',  // Use <vc-calendar /> instead of <v-calendar />
});

new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
}).$mount('#app')
