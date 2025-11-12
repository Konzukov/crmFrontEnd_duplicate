<template>
  <v-snackbar
      v-model="snackbar.show"
      :timeout="snackbar.timeout"
      :color="snackbar.color"
      :multi-line="snackbar.multiline"
      :vertical="snackbar.vertical"
      :position="position"
      class="global-snackbar"
      @input="onSnackbarClose"
  >
    <div class="snackbar-content">
      <v-icon
        v-if="icon"
        left
        :color="getIconColor"
        class="snackbar-icon"
      >
        {{ icon }}
      </v-icon>
      <span class="snackbar-text" v-html="snackbar.text"></span>
    </div>

    <template v-slot:action="{ attrs }">
      <v-btn
          text
          v-bind="attrs"
          @click="hideSnackbar"
          class="snackbar-close-btn"
          :color="getCloseButtonColor"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'GlobalSnackbar',

  computed: {
    ...mapState('snackbar', ['snackbar']),

    position() {
      const positions = {
        'top': 'top center',
        'bottom': 'bottom center',
        'left': 'left bottom',
        'right': 'right bottom',
        'top-left': 'left top',
        'top-right': 'right top',
        'bottom-left': 'left bottom',
        'bottom-right': 'bottom right'
      }
      return positions[this.snackbar.position] || 'bottom right'
    },

    icon() {
      const icons = {
        'success': 'mdi-check-circle',
        'error': 'mdi-alert-circle',
        'warning': 'mdi-alert',
        'info': 'mdi-information'
      }
      return icons[this.snackbar.color] || icons.info
    },

    getIconColor() {
      if (this.snackbar.color === 'success') return 'white'
      if (this.snackbar.color === 'error') return 'white'
      if (this.snackbar.color === 'warning') return 'darken-3'
      return 'white'
    },

    getCloseButtonColor() {
      return this.snackbar.color === 'warning' ? 'grey darken-3' : 'white'
    }
  },

  methods: {
    ...mapActions('snackbar', ['hideSnackbar']),

    onSnackbarClose(value) {
      if (!value) {
        this.hideSnackbar()
      }
    }
  }
}
</script>

<style scoped>
.global-snackbar {
  z-index: 1000;
}

.snackbar-content {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.snackbar-icon {
  flex-shrink: 0;
}

.snackbar-text {
  flex-grow: 1;
  line-height: 1.4;
}

.snackbar-close-btn {
  flex-shrink: 0;
  margin-left: 8px;
}

/* Анимации для появления/исчезновения */
.v-snack__content {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Для top позиции */
:deep(.v-snack--top .v-snack__content) {
  animation: slideInFromTop 0.3s ease-out;
}

@keyframes slideInFromTop {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>