<template>
  <DefaultTheme />
</template>

<script>
import DefaultTheme from "./theme-default/layouts/Layout.vue";

export default {
  name: "Layout",

  components: {
    DefaultTheme,
  },

  data() {
    return {};
  },
  mounted(){
    console.log(this.$site);
  }
};
</script>
