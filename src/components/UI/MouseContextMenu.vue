<template>
  <ul id="right-click-menu" class="context-menu" v-show="show" :style="style" ref="context" tabindex="0"
      @blur="close">
    <slot></slot>
  </ul>
</template>
<script>
import Vue from 'vue';

export default {
  name: 'CmpContextMenu',
  props: {
    display: Boolean, // prop detect if we should show context menu
  },
  data() {
    return {
      left: 100, // left position
      top: 10, // top position
      show: false, // affect display of context menu
    };
  },
  computed: {
    // get position of context menu
    style() {
      return {
        top: this.top + 'px',
        left: this.left + 'px',
      };
    },
  },
  methods: {
    close() {
      this.show = false;
      this.left = 0;
      this.top = 0;
    },
    open(evt) {
      // updates position of context menu
      this.left = evt.pageX || evt.clientX;
      this.top = evt.pageY || evt.clientY;
      // make element focused
      // @ts-ignore
      Vue.nextTick(() => {

        this.$el.focus()
      });
      this.show = true;
    },
  },
};
</script>
<style>
#right-click-menu {
  background: #FAFAFA;
  border-radius: 10px;
  border: 1px solid #BDBDBD;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .2), 0 1px 5px 0 rgba(0, 0, 0, .12);
  display: block;
  list-style: none;
  margin: 0;
  padding: 0;
  position: fixed;
  width: 250px;
  z-index: 999999;
}

#right-click-menu li {
  border-radius: 10px;
  border-bottom: 1px solid #E0E0E0;
  margin: 0;
  padding: 5px 25px;
}

#right-click-menu li:last-child {
  border-bottom: none;
}

#right-click-menu li:hover {
  border-radius: 10px;
  background: #1E88E5;
  color: #FAFAFA;
}
</style>