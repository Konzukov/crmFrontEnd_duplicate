// store/modules/snackbar.js
const state = {
  snackbar: {
    show: false,
    text: '',
    color: 'info', // 'success', 'error', 'warning', 'info'
    timeout: 6000,
    multiline: false,
    vertical: false,
    position: 'bottom-right' // 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  }
}

const mutations = {
  SHOW_SNACKBAR(state, payload) {
    state.snackbar = {
      ...state.snackbar,
      ...payload,
      show: true
    }
  },
  HIDE_SNACKBAR(state) {
    state.snackbar.show = false
  },
  SET_SNACKBAR(state, payload) {
    state.snackbar = { ...state.snackbar, ...payload }
  }
}

const actions = {
  showSnackbar({ commit }, payload) {
    // Если payload - строка, преобразуем в объект
    if (typeof payload === 'string') {
      payload = { text: payload }
    }

    commit('SHOW_SNACKBAR', {
      timeout: 6000,
      color: 'info',
      ...payload
    })
  },

  showSuccess({ dispatch }, text) {
    dispatch('showSnackbar', {
      text,
      color: 'success',
      timeout: 4000
    })
  },

  showError({ dispatch }, text) {
    dispatch('showSnackbar', {
      text,
      color: 'error',
      timeout: 8000
    })
  },

  showWarning({ dispatch }, text) {
    dispatch('showSnackbar', {
      text,
      color: 'warning',
      timeout: 6000
    })
  },

  showInfo({ dispatch }, text) {
    dispatch('showSnackbar', {
      text,
      color: 'info',
      timeout: 5000
    })
  },

  hideSnackbar({ commit }) {
    commit('HIDE_SNACKBAR')
  }
}

const getters = {
  snackbar: state => state.snackbar
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}