<template>
  <pre><code :class="lang" v-html="html"></code></pre>
</template>

<script>
import Prism from "prismjs";

export default {
  name: "Highlight",
  props: {
    lang: {
      type: String,
      value: "",
    },
    code: {
      type: String,
      value: "",
    },
  },
  computed: {
    html() {
      const type = this.lang.split('-').pop();
      return Prism.highlight(this.code, Prism.languages[type], type);
    },
  },
};
</script>