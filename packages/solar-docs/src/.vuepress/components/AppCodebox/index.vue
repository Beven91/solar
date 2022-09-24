<template>
  <div class="app-code-box-wrapper" :class="mode">
    <component
      v-if="prepared"
      :demoUrl="demoUrl"
      :is="component"
      :title="title"
      :desc="desc"
      :src="realSrc"
      :slotKey="slotKey"
      :console="console"
    >
      <slot></slot>
    </component>
  </div>
</template>

<style lang="scss">
.app-code-box-wrapper {
  font-size: 14px;
  margin-top: 15px;
  &.pure {
    .pc-app-code-box {
      border: none;
      .app-code-box-meta,
      .app-code-box-actions {
        display: none;
      }
    }
  }
  div[class*="language-"] {
    border-radius: 0;
  }
  .source-code div[class*="language-"],
  .source-code pre {
    margin: 0px;
    border-radius: 0;
    background: rgba(0, 0, 0, 0);
  }
}
</style>
<script>
import resources from "../../helper/resources";
import PCAppCodebox from "./PCAppCodebox.vue";
import util from "../../helper/util";
import MobileAppCodebox from "./MobileAppCodebox.vue";

export default {
  name: "AppCodebox",

  components: {
    MobileAppCodebox,
    PCAppCodebox,
  },

  props: [
    "title",
    "desc",
    "src",
    "type",
    "slotKey",
    "mode",
    "demoUrl",
    "absolute",
    "console",
  ],

  data() {
    return {
      prepared: false,
    };
  },
  computed: {
    component() {
      switch (this.type) {
        case "mobile":
          return "MobileAppCodebox";
        case "pc":
        default:
          return "PCAppCodebox";
      }
    },
    realSrc() {
      const repository = util.getRepository(this.$site);
      if (repository && this.absolute != true) {
        return (repository.name + "/" + this.src).replace(/\/\//g, "/");
      }
      return this.src;
    },
  },
  async mounted() {
    this.run();
  },
  methods: {
    async run() {
      const resourceUrls = [];
      const port = process.env.repoport;
      const base = process.env.base;
      const repository = util.getRepository(this.$site);
      if (repository && !this.slotKey) {
        const usePort = port && repository.type != "demo";
        const prefix = usePort ? "http://localhost:" + port + "/" : base;
        const version = process.env.version;
        const repoName = repository.name;
        resourceUrls.push(
          prefix + "vendors/" + repoName + "/index.css?v=" + version
        );
        resourceUrls.push(
          prefix + "vendors/" + repoName + "/index.js?v=" + version
        );
      }
      await resources.loadResources(resourceUrls);
      this.prepared = true;
    },
  },
};
</script>