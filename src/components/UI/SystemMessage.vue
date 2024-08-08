<template>
  <v-dialog v-model="dialog" width="400">
    <v-card height="50vh">
      <v-toolbar :color="state" dense>
        <v-toolbar-title
            v-html="state === 'error'? 'Ошибка при выполнении':'Операция успешно выполнена'"></v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text v-if="state === 'success'">
        <v-container>
          <v-row class="mt-3">
            <div class="dummy-positioning d-flex">
              <div class="success-icon">
                <div class="success-icon__tip"></div>
                <div class="success-icon__long"></div>
              </div>
            </div>
          </v-row>
          <v-container class="mt-6">
            <v-row justify="center">
              <h3>{{ systemMessage.subject }}</h3>
            </v-row>
            <v-row justify="center">
              <v-col cols="auto">
                {{ systemMessage.text }}
              </v-col>

            </v-row>
          </v-container>

        </v-container>
      </v-card-text>
      <v-card-text v-else-if="state === 'error'">
        <v-row class="mt-3">
          <div class="dummy-positioning d-flex">
            <div class="error-icon">
              <div class="error-icon__tip"></div>
              <div class="error-icon__long"></div>
            </div>
          </div>
        </v-row>
        <v-container class="mt-6">
          <v-row justify="center">
            <h3>{{ systemMessage.subject }}</h3>
          </v-row>
          <v-row justify="center">
            <v-col cols="auto">
              {{ systemMessage.text }}
            </v-col>
          </v-row>
          <template v-if="systemMessage.redirect">
             <v-btn text color="warning" link :to="{name: systemMessage.redirect, params: {pk: project}}" target="_blank">Перейти на страницу проекта</v-btn>
          </template>
        </v-container>
      </v-card-text>
    </v-card>

  </v-dialog>
</template>

<script>
export default {
  props: {
    state: {
      type: String,
      default: 'success',
    },
    message: {
      type: Object,
    },
    project: {
      type: Number
    }
  },
  name: "SystemMessage",
  data: () => ({
    dialog: false,
    systemMessage: {
      subject: '',
      text: '',
      redirect: null
    }
  }),
  computed: {},
  methods: {
    close() {
      this.dialog = false
      Object.assign(this.$data, this.$options.data())
    }
  },
  created() {
    this.$parent.$on('showSystemMessage', async ({response, state, send}) => {
      let data;
      if (state === 'error') {
        if (typeof response.response.data === "object") {
          data = await response.response.data.text()
        } else {
          data = response.response.data
        }
        let parser = new DOMParser()
        let htmlDoc = parser.parseFromString(data, 'text/html')
        let container = htmlDoc.getElementById('summary')
        let text = container.getElementsByTagName("pre")[0].innerHTML
        let subject = container.getElementsByTagName('h1')[0].innerHTML
        let redirect;
        console.log(text)
        console.log(subject)
        if (text === "Основной расчетный счет не выбран"){
          redirect = 'project-detail'
        }
        this.systemMessage = {
          subject: subject,
          text: text,
          redirect: redirect
        }
      } else {
        data = response.data.data.data
        if (send){
          data.text += ' и ожидает отправки'
        }
        this.systemMessage = {
          subject: data.subject,
          text: data.text
        }
      }
      this.dialog = true
    })
  }

}
</script>

<style scoped lang="scss">

.v-card {
  overflow-y: auto;
}

.v-card__text {
  height: 80%;
}

.dummy-positioning {
  width: 100%;
  align-items: center;
  justify-content: center;
}

// The icon specifics
// Variables
$green: #4caf50;
$red: #ff0000;
$borderSize: 10px;

// Structure
.success-icon {
  display: inline-block;
  width: 10em;
  height: 10em;
  font-size: $borderSize;
  border-radius: 50%;
  border: $borderSize solid lighten($green, 20%);
  background-color: #fff;
  position: relative;
  overflow: hidden;
  transform-origin: center;
  animation: showSuccess 180ms ease-in-out;
  transform: scale(1);
}

.error-icon {
  display: inline-block;
  width: 10em;
  height: 10em;
  font-size: $borderSize;
  border-radius: 50%;
  border: $borderSize solid lighten($red, 20%);
  background-color: #fff;
  position: relative;
  overflow: hidden;
  transform-origin: center;
  animation: showSuccess 180ms ease-in-out;
  transform: scale(1);
}

// Elements
.success-icon {

  &__tip,
  &__long {
    display: block;
    position: absolute;
    height: 1em;
    background-color: lighten($green, 20%);
    border-radius: 1em;
  }

  &__tip {
    width: 2.8em;
    top: 4.3em;
    left: 1.4em;
    transform: rotate(45deg);
    animation: tipInPlace 300ms ease-in-out;
    animation-fill-mode: forwards;
    animation-delay: 360ms;
    visibility: hidden;
  }

  &__long {
    width: 4.4em;
    transform: rotate(-45deg);
    top: 3.80em;
    left: 2.55em;
    animation: longInPlace 140ms ease-in-out;
    animation-fill-mode: forwards;
    visibility: hidden;
    animation-delay: 300ms + 140ms;
  }

}

.error-icon {
  &__tip,
  &__long {
    display: block;
    position: absolute;
    height: 1em;
    background-color: lighten($red, 20%);
    border-radius: 1em;
  }

  &__tip {
    width: 2.8em;
    top: 5.3em;
    left: 2.4em;
    transform: rotate(45deg);
    animation: tipInPlaceError 300ms ease-in-out;
    animation-fill-mode: forwards;
    animation-delay: 360ms;
    visibility: hidden;
  }

  &__long {
    width: 4.4em;
    transform: rotate(-45deg);
    top: 3.80em;
    left: 2.55em;
    animation: longInPlaceError 140ms ease-in-out;
    animation-fill-mode: forwards;
    visibility: hidden;
    animation-delay: 300ms + 140ms;
  }
}

@keyframes showSuccess {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@keyframes tipInPlace {
  from {
    width: 0em;
    top: 3.5em;
    left: 2em;
  }
  to {
    width: 2.8em;
    top: 4.3em;
    left: 1.4em;
    visibility: visible;
  }
}

@keyframes tipInPlaceError {
  from {
    width: 0em;
    top: 3.5em;

  }
  to {
    width: 5.5em;
    top: 3.6em;
    left: 1.3em;
    visibility: visible;
  }
}

@keyframes longInPlace {
  from {
    width: 0em;
    top: 5.1em;
    left: 3.2em;
  }
  to {
    width: 4.4em;
    top: 3.80em;
    left: 2.55em;
    visibility: visible;
  }
}

@keyframes longInPlaceError {
  from {
    width: 0em;
    top: 5.1em;
    left: 3.2em;
  }
  to {
    width: 5.5em;
    top: 33.5px;
    left: 1.3em;
    visibility: visible;
  }
}

.success-enter-from {
  opacity: 0
}

.success-enter-active,
.success-leave-active {
  transition: opacity 100s ease
}

.success-leave-to {
  opacity: 0
}
</style>