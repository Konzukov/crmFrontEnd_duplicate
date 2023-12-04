<template>
  <v-container fluid id="auth-form">
    <transition name="loginInput"
                appear
                enter-active-class="animated bounceInLeft"
                leave-active-class="animated bounceOutRight"
                :duration="{ enter: 1500, leave: 1500 }"
                mode="out-in">
      <v-row class="login-input" key="loginInput" align="center" justify="center" v-if="loginForm.showLogin">
        <v-col cols="12" md="3">
          <v-form @submit.prevent="getUser()">
            <v-text-field
                id="login"
                autocomplete="off"
                :style="{width: loginForm.inputWidth + 'px'}"
                v-model="login"
                v-mask="loginMask"
                autofocus
            ></v-text-field>
          </v-form>
        </v-col>
      </v-row>
      <v-row key="userLogin" v-else justify="end">
        <v-col cols="12" md="3" justify-self="end">
          <div class="float-right">
            {{ login }}
          </div>
        </v-col>
      </v-row>
    </transition>
    <transition name="organizationCheck"
                appear
                enter-active-class="animated bounceInLeft"
                leave-active-class="animated bounceOutRight"
                :duration="{ enter: 1500, leave: 1500 }"
                mode="out-in">
      <v-row class="login-input" key="availableOrganization" align="center" justify="center"
             v-if="loginForm.showOrganization">
        <v-col cols="12" md="3">
          <v-form>
            <v-select
                :items="availableOrganization"
                v-model="organization"
                @input="activeOrganization()"
                item-text="name"
                item-value="uuid"
                autofocus
            ></v-select>
          </v-form>
        </v-col>
      </v-row>
    </transition>
    <transition name="pwdInput"
                :duration="{ enter: 2000, leave: 1000 }"
                enter-active-class="animated bounceInLeft"
                leave-active-class="animated bounceOutRight"
    >
      <v-row class="login-input" align="center" justify="center" key="password"
             v-if="loginForm.showPasswordField">
        <v-col cols="12" md="3">
          <v-form @submit.prevent="passwordSubmit()">
            <v-text-field
                hint="Введите пароль"
                autofocus
                :disabled="error.passwordDisabled"
                :error="error.passwordError"
                :error-messages="error.errorMessage"
                :type="loginForm.showPassword ? 'text' : 'password'"
                @click:append="loginForm.showPassword = !loginForm.showPassword"
                :append-icon="loginForm.showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                v-model="password">
            </v-text-field>
            <v-radio-group v-model="sendingType">
              <v-radio
                  v-for="sendType in codeSending"
                  :key="sendType.key"
                  :label="`Отправить код на   ${sendType.val}`"
                  :value="sendType.key"
              ></v-radio>
            </v-radio-group>
          </v-form>
        </v-col>
      </v-row>
    </transition>
    <transition name="smsInput"
                :duration="{ enter: 2500, leave: 1500 }"
                enter-active-class="animated bounceInRight"
    >
      <v-form v-if="loginForm.showSMSPassword" @submit.prevent="smsVerification">
        <v-row class="login-input" align="center" justify="center" key="smsPassword">
          <v-col cols="6" md="2" class="sms-field">
            <v-otp-input
                class="sms-input"
                :length="otpLength"
                v-model="smsCode"
                autofocus
                @finish="smsVerification"
            ></v-otp-input>
          </v-col>
        </v-row>
      </v-form>
    </transition>
    <v-dialog v-model="error.accountError" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Такого пользователя не существует</v-card-title>
        <v-card-text>
          <p>Вы можете зарегистрироваться заполнив не большую форму. </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="error.accountError = false">Отмена</v-btn>
          <v-btn color="green darken-1" text @click="error.accountError = false">
            <router-link to="/registration">Регистрация</router-link>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="error.passwordError" max-width="390">
      <v-card>
        <v-card-title class="headline">Аккаунт {{ login }} заблокирован</v-card-title>
        <v-card-text>
          <p>Ваш акканут заблокирован. Свяжитесь с руководителем вашего отдела для разблокировки</p>
          <p>В случае если у Вас изменился контактный номер телефона, оставьте новый номер в форме ниже с Вами
            свяжутся в ближайшее время
          </p>
          <v-form @submit.prevent="newPhoneSubmit()">
            <v-text-field
                hint="Введите новый номер телефона"
                autofocus
                v-mask="error.phoneMask"
                v-model="error.newPhone"></v-text-field>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" type="submit">Отправить</v-btn>
              <v-btn color="red darken-1" text @click="error.passwordError = false">Отмена</v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>

      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import Axios from 'axios'
import customConst from "../const/customConst";

export default {
  name: "Authorization",
  data() {
    return {
      sendingType: 'telegram',
      codeSending: [
        {
          key: 'telegram',
          val: 'Телеграм'
        },
        {
          key: 'main',
          val: 'Почту'
        }
      ],
      otpLength: 6,
      availableOrganization: [],
      loginForm: {
        showLogin: true,
        showOrganization: false,
        showPasswordField: false,
        showPassword: false,
        showSMSPassword: false,
        inputWidth: 12,
      },
      error: {
        accountError: false,
        passwordError: false,
        passwordDisabled: false,
        errorMessage: '',
        errorCount: 3,
        newPhone: '',
        phoneMask: '+#(###)###-##-##'
      },
      login: '',
      loginType: '',
      loginMask: '',
      password: '',
      organization: '',
      smsCode: '',
    }
  },
  methods: {
    passwordSubmit() {
      let loginFormData = new FormData()
      loginFormData.append('username', this.userLogin)
      loginFormData.append('password', this.password)
      loginFormData.append('sendingType', this.sendingType)
      loginFormData.append('activeOrganization', this.organization)
      Axios({
        method: 'post',
        url: customConst.AUTH_API + 'check-password/',
        headers: {'Content-Type': 'application/vnd.api+json'},
        data: loginFormData
      })
          .then((data) => {
            this.otpLength = data.data.data.data
            this.loginForm.showPasswordField = !this.loginForm.showPasswordField
            this.loginForm.showSMSPassword = !this.loginForm.showSMSPassword
          })
          .catch((error) => {
            this.error.errorCount -= 1
            this.error.errorMessage = error.response.data.errors.message + 'Осталось ' + this.error.errorCount + ' попыток'
          })
    },
    getUser() {
      this.userLogin = this.login
      Axios({
        method: 'get',
        url: customConst.AUTH_API + 'user/',
        params: {
          username: this.userLogin,
          loginType: this.loginType
        }
      }).then((response) => {
        console.log(response.data.data.data)
        this.availableOrganization = response.data.data.data
        this.loginForm.showLogin = !this.loginForm.showLogin
        if (response.data.data.data.length === 1) {
          this.organization = response.data.data.data[0]['uuid']
          this.loginForm.showPasswordField = !this.loginForm.showPasswordField
        } else {
          this.loginForm.showOrganization = !this.loginForm.showOrganization
        }

      }).catch(() => {
            this.error.accountError = !this.error.accountError
          })

    },
    smsVerification() {
      let data = {
        login: this.userLogin,
        password: this.password,
        smsCode: this.smsCode
      }
      console.log(data)
      this.$store.dispatch("login", data)
          .then(() => this.$router.push('/dashboard'))
          .catch(err => console.log(err))
    },
    ogranizationSubmit() {
      return new Promise(resolve => {
        Axios({
          method: 'get',
          url: customConst.AUTH_API + 'user/',
          params: {
            username: this.userLogin,
            loginType: this.loginType
          }
        })
      })
    },
    newPhoneSubmit() {
      console.log(this.error.newPhone)
    },
    activeOrganization() {
      this.loginForm.showOrganization = !this.loginForm.showOrganization
      this.loginForm.showPasswordField = !this.loginForm.showPasswordField
    }
  },
  watch: {
    login(newValue, oldValue) {
      if (oldValue.length === 0 && newValue[0] === '+') {
        this.loginMask = '+#(###)###-##-##'
        this.loginType = 'phone'
      } else if (oldValue.length === 0 && newValue[0] !== '+') {
        this.loginMask = "XXXXXXXXXXXXXXXXXXXX"
        this.loginType = 'username'
      }
      this.loginForm.inputWidth = newValue.length * 14
      if (newValue.length === 0) {
        this.loginForm.inputWidth = 14.5
      }
    },
    error: {
      deep: true,
      handler(val) {
        if (val.errorCount == 0 && this.error.passwordDisabled == false) {
          this.error.passwordDisabled = true
          this.error.passwordError = true
        }
      }

    }
  }
}
</script>

<style scoped lang="scss">
@font-face {
  font-family: Trixie;
  src: url("../assets/fonts/Trixie-Plain.ttf") format("opentype");
}

* {
  font-family: Trixie;
}

#auth-form {
  height: 100%;
}

div {
  font-family: Trixie;
}

.v-input {
  font-family: Trixie;
  margin: 0px auto;

  input {
    border-bottom: 2px solid;
    font-size: 24px;
  }
}

span {
  font-family: Trixie;
  font-size: 20px;
}

.sms-field {
  width: calc(14px * 4) !important;
}

.login-input {
  height: 100%;
}

input::placeholder {
  width: 0.3em;
  height: 1em;
}

input::-webkit-input-placeholder {
  width: 0.3em;
  height: 1em;
}

span.typing {
  margin-left: 25px;
}

.typed-cursor {
  width: 0.3em;
  height: 1em;
  margin-left: 2px;
  vertical-align: middle;
  background-color: rgba(128, 128, 128, 0.8);
  display: inline-block;
}

</style>