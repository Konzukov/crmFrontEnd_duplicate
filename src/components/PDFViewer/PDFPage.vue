<script>
export default {
  props: ['page', 'scale'],
  created() {
    this.viewport = this.page.getViewport(this.scale);
  },
  watch:{
    scale(){
      this.drawPage()
    }
  },
  methods: {
    drawPage() {
      let viewport = this.page.getViewport({scale: this.scale})
      let outputScale = window.devicePixelRatio || 0.5;
      let canvas = this.$el;
      let context = canvas.getContext('2d');
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = Math.floor(viewport.width) + "px";
      canvas.style.height = Math.floor(viewport.height) + "px";
      // const textContent = await this.page.getTextContent();
      // const svg = this.buildSVG(viewport, textContent);
      // document.getElementById("pageContainer").appendChild(svg);
      const transform = outputScale !== 1
          ? [outputScale, 0, 0, outputScale, 0, 0]
          : null;
      let renderContext = {
        canvasContext: context,
        viewport: viewport,
        transform: transform
      };
      this.page.render(renderContext)
    },
  },
  mounted() {
    this.drawPage();
  },
  render(h) {
    const {canvasAttrs: attrs} = this;
    return h('canvas', {attrs});
  },
}
</script>
