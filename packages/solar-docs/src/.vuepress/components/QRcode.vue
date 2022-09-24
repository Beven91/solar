<template>
  <div class="qrcode-view" ref="container">
    <img :style="style" :src="url" />
  </div>
</template>

<style type="text/css" lang="scss" scoped>
  .qrcode-view {
    img {
      width:150px;
      height:150px;
    }
  }
</style>

<script>
import Qrcode from "qrcode";

export default {
  name: "QRcode",
  props: ["value","size"],
  data() {
    return {
      url: "",
    };
  },
  watch: {
    value(value) {
      this.renderQrcode(value);
    },
  },
  computed:{
    style(){
      if(this.size > 0){
        return `width:${this.size}px;height:${this.size}px;`
      }
      return '';
    }
  },
  mounted() {
    this.renderQrcode(this.value);
  },
  methods: {
    renderQrcode(value) {
      Qrcode.toDataURL(value, (err, url) => {
        this.url = url;
      });
    },
  },
};
</script>
