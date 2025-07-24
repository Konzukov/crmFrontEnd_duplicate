<template>
  <v-card height="100%">
    <v-card-title>
      <v-row justify="center">
        Список физ. лиц
      </v-row>
    </v-card-title>
    <v-card-title class="pb-0">
      <v-row justify="center" class="pb-1">
        <v-col cols="12">
          <v-text-field
              dense
              outlined
              label="Поиск"
              append-icon="mdi-magnify"
              hide-details
              v-model="searchQuery"
              clearable
              @click:clear="searchQuery = ''"
          ></v-text-field>
        </v-col>
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
      <div class="person-list" ref="listContainer">
        <template v-if="filteredPhysicalPersonList.length">
          <v-list-item-group v-model="selectedPerson">
            <v-list-item
                v-for="item in filteredPhysicalPersonList"
                :data-initial="item['initialLetter']"
                :key="item.pk"
                @click="viewPersonDetail(item)"
                class="pl-0 pr-0"
            >
              <v-list-item-content class="person-item">
                {{ item['fullName'] }}
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </template>
        <div v-else class="text-center pa-5">
          Ничего не найдено
        </div>
      </div>
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
    searchQuery: '',
  }),
  computed: {
    ...mapGetters({
      physicalPersonList: 'physicalPersonListDataV2'
    }),

    // Добавлено вычисляемое свойство для фильтрации
    filteredPhysicalPersonList() {
      if (!this.searchQuery) return this.physicalPersonList;

      const query = this.searchQuery.toLowerCase();
      return this.physicalPersonList.filter(person =>
        person.fullName.toLowerCase().includes(query))
    }
  },
  filters: {},
  methods: {
    viewPersonDetail(item) {
      this.$emit('select', item)
    },
    scrollToLetter(letter) {
      this.currentLetter = letter;
      const container = this.$refs.listContainer?.$el;
      if (!container) return;

      // Поиск первого элемента с указанной буквой
      const targetElement = container.querySelector(`[data-initial="${letter}"]`);
      if (targetElement) {
        // Плавная прокрутка к элементу
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    },
    async loadData() {
      this.loading = true
      this.$store.dispatch('fetchPhysicalPersons').then(() => {
        this.$store.dispatch('fetchArbitrationManagerRegister')
      }).catch(error => {
        console.error('Ошибка при загрузке данных:', error)
      }).finally(() => {
        this.loading = false
      })

    }
  },
  async created() {
    await this.loadData()
  }
}
</script>


<style scoped>

.person-list {
  letter-spacing: normal !important;
  font-family: "Roboto", sans-serif !important;
  overflow-y: scroll;
  height: 100%;
  flex: 1; /* Добавлено для правильного растягивания */
}
>>> .v-card__text {
  display: flex;
  height: 84vh;
}


.alphabet-scroller {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.alphabet-nav {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  opacity: 0.5;
  width: 30px;
}

.alphabet-nav:hover {
  opacity: 1;
}

.letter-btn {
  width: 20px;
  height: 18px;
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
  padding: 13px;
  border-bottom: 1px solid #dee2e6;
  cursor: pointer;
  transition: background-color 0.2s;
}

.person-item:hover {
  background: #dee2e6;
}

.v-list-item--active {
  background: #dee2e6;
}

</style>