<template>
  <v-card height="100%">
    <v-card-title>
      <v-row justify="center">
        Список физ. лиц
      </v-row>
    </v-card-title>
    <v-card-text>
      <div class="alphabet-nav">
        <button
            v-for="letter in alphabet"
            :key="letter"
            :class="['letter-btn', { active: currentLetter === letter }]"
            @click="scrollToLetter(letter)"
        >
          {{ letter }}
        </button>
      </div>
      <v-list-item-group v-model="selectedPerson" class="person-list">
        <v-list-item v-for="item in physicalPersonList" :key="item.pk" @click="viewPersonDetail(item)">
          <v-list-item-content class="person-item">
            {{ item['full_name'] }}
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-card-text>
  </v-card>
</template>


<script>
import {mapGetters} from 'vuex'

export default {
  name: "PhysicalPersonListV2",
  data: () => ({
    alphabet: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split(''),
    currentLetter: null,
    loading: false,
    selectedPerson: null,
  }),
  computed: {
    ...mapGetters({
      physicalPersonList: 'physicalPersonListDataV2'
    })
  },
  filters: {},
  methods: {
    viewPersonDetail(item) {

    },
    scrollToLetter(letter) {

    },
    loadData() {
      this.loading = true
      this.$store.dispatch('getPhysicalPersonV2')
          .then(response => {
            console.log(response)
          })
          .catch(error => {
            console.error('Ошибка при загрузке данных:', error)
          })
          .finally(() => {
            this.loading = false
          })
    }
  },
  created() {
    this.loadData()
  }
}
</script>


<style scoped>
>>>.v-card__text {
  display: flex;
  height: 80vh;
}

.person-list {
  letter-spacing: normal !important;
  font-family: "Roboto", sans-serif !important;
  overflow-y: scroll;
  height: 100%;
}

.alphabet-scroller {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.alphabet-nav {
  display: flex;
  flex-direction: column;
  opacity: 0.3;
  width: 30px;
}

.alphabet-nav:hover {
  opacity: 1;
}

.letter-btn {
  width: 20px;
  height: 20px;
  margin: 2px 0;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.letter-btn:hover {
  background: #e9ecef;
}

.letter-btn.active {
  background: #007bff;
  color: white;
  border-color: #0056b3;
}

.person-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.letter-section {
  margin-bottom: 20px;
}

.letter-header {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
  padding: 5px;
  background: #f8f9fa;
  border-radius: 4px;
}

.person-item {
  padding: 8px;
  border-bottom: 1px solid #dee2e6;
  cursor: pointer;
  transition: background-color 0.2s;
}

.person-item:hover {
  background: #f8f9fa;
}
</style>