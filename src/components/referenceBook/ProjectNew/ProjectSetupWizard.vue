<template>
  <v-card id="setup" width="100%" height="80vh" class="mt-4">
    <v-row justify="start" id="wizard-container">
      <v-col id="steps" md="4" lg="4">
        <h2>Несколько простых шагов для создания проекта</h2>
        <template v-for="s in steps">
          <transition name="active-step" :key="s.number">
            <div class="step" :class="[s.number === step ? 'active-step': '']" @click="step= s.number">
              <span class="number">{{ s.number }}</span>
              <h3>{{ s.text }}</h3>
              <hr v-if="s.number != steps.length">
            </div>
          </transition>
        </template>
      </v-col>
      <v-col id="setup-form">
        <template v-if="step===1">
          <h3 class="mb-10">Персональные данные</h3>
          <form action="" autocomplete="off">
            <v-row justify="start" class="ml-5">
              <v-col md="6" lg="6" sm="6">
                <input type="text" class="text-input" autocomplete="off" v-model="personalInfo.lastName"
                       placeholder="Фамилия">
              </v-col>
              <v-col md="6" lg="6" sm="6">
                <input type="text" class="text-input" v-model="personalInfo.firstName" placeholder="Имя">
              </v-col>
              <v-col md="6" lg="6" sm="6">
                <input type="text" class="text-input" v-model="personalInfo.middleName" placeholder="Отчество">
              </v-col>
            </v-row>
            <v-row justify="start" class="ml-6">
              <v-col md="4" lg="4">
                <input type="file" id="passport-file" multiple class="file-input" @change="addFile('passport', $event)">
                <label for="passport-file">Фото паспорта:</label>
              </v-col>
              <v-col md="8" lg="8">
                <div class="file-preview">
                  <template v-for="(image, i) in personalInfo.passport">
                    <v-hover v-slot="{ hover }" :key="i">
                      <div>
                        <img :src="getImageSrc(image)">
                        <div class="action">
                          <v-btn absolute icon v-if="hover">
                            <v-icon>mdi-close</v-icon>
                          </v-btn>
                        </div>
                      </div>
                    </v-hover>
                  </template>
                </div>
              </v-col>
            </v-row>
            <v-row justify="start"></v-row>
            <v-row justify="start"></v-row>
            <v-row justify="center">
              <v-btn @click="step=2" color="#26356b" class="next-step" rounded>Продолжить</v-btn>
            </v-row>
          </form>
        </template>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>

export default {
  name: "ProjectSetupWizard",
  data: () => ({
    steps: [
      {number: 1, text: 'Персональные данные'},
      {number: 2, text: 'Доходы'},
      {number: 3, text: 'Обязательсва'},
      {number: 4, text: 'Имущество и сделки'},
    ],
    step: 1,
    personalInfo: {
      lastName: '', // Фамилия
      firstName: '', // Имя
      middleName: '', // Отчество
      passport: [], // Изображения паспорта
      inn: [], // Изображения ИНН
      snils: [], // Изображения СНИЛС
    }
  }),
  methods: {
    addFile(type, e) {
      let files = e.target.files
      this.personalInfo[type].unshift(...files)
    },
    getImageSrc(image) {
      return URL.createObjectURL(image)
    }
  }
}
</script>

<style src="../../../assets/css/project-setup.scss" lang="scss" scoped>
> > > .v-stepper__step__step {
  width: 40px;
  height: 40px;
  min-width: 40px;
  font-size: 18px;
}
</style>