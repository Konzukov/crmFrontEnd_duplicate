import axios from 'axios'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import customConst from "../../../const/customConst";


Vue.use(VueCookies)


export default {
    actions: {
        savePersonalInfo(commit, formData) {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'POST',
                    url: customConst.PROCEDURE + 'questionnaire/',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: formData
                })
            })
        }
    }

}