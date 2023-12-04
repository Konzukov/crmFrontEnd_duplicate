<template>
    <v-snackbar
            v-model="errorSnackbar"
            multi-line
            absolute
            bottom
    >
        <p>
            Ошибка при загрузке {{fileName}}
        </p>
        <p>
            Код ошибки - {{errorCode}}
        </p>
        <div>
            Описание ошибки <br>
            <div v-if="errorMessage">
                {{errorMessage}}
            </div>
            <div v-else v-html="errorHtml">
                {{errorHtml}}
            </div>
        </div>
        <v-btn color="red"
               text
               @click="sendError()">
            Отправить уведомление
        </v-btn>

    </v-snackbar>
</template>

<script>
    import axios from 'axios'
    import Vue from 'vue'
    import VueCookies from 'vue-cookies'
    import customConst from "../../const/customConst";

    Vue.use(VueCookies)


    export default {
        name: "ErrorHandling",
        props: ['hasError'],
        data() {
            return {
                errorSnackbar: false,
                errorMessage: '',
                errorCode: '',
                fileName: '',
                errorHtml: ''
            }
        },
        methods: {
            open(message) {
                console.log(message)
                this.errorMessage = message
                this.errorSnackbar = true
            },
            close(){
                Object.assign(this.$data, this.$options.data())
            },
            sendError() {
                const formData = new FormData()
                formData.set('errorCode', this.errorCode)
                if (this.errorMessage) {
                    formData.set('errMessage', this.errorMessage)
                } else {
                    formData.set('errMessage', this.errorHtml)
                }
                return new Promise((resolve, reject) => {
                    axios({
                        method: "POST",
                        url: customConst.CRM_API + 'send-error-message/',
                        data: formData
                    }).then((res) => {
                        this.errorMessage = 'Уведомление отправлено'
                        setTimeout(function () {
                            this.errorSnackbar = false
                            resolve(res)
                        }, 3000)
                    }).catch((err) => {
                        reject(err)
                    })
                }).then(() => {
                    this.close()
                })
            }
        },
        created() {

            this.$parent.$on('hasError', (({err, fileName}) => {
                console.log('must be created')
                if (err) {
                    this.errorCode = err.response.status
                    if (err.response.data.message) {
                        this.errorMessage = err.response.data.message
                    } else if (err.response.data.errors){
                         this.errorMessage = err.response.data.errors
                    }else {
                        const parser = new DOMParser();
                        const document = parser.parseFromString(err.response.data, 'text/html');
                        this.errorHtml = document.getElementById('summary').outerHTML
                    }
                }
                this.errorSnackbar = true
                this.fileName = fileName.name
            }))
        }
    }
</script>

<style scoped>
    >>> .v-snack {
        z-index: 9999;
    }
</style>