<template>
  <div class="app-code-console" ref="container" :style="containerStyle">
    <div class="toolbox">
      <div class="console-logo">Console</div>
      <img @click="clear" class="action clear" src="../assets/clear.svg" />
    </div>
    <div class="console-body" ref="body">
      <div
        class="output"
        :class="log.type"
        v-for="(log, index) in logs"
        v-bind:key="index"
      >
        <pre v-for="(item, index) in log.args" v-bind:key="index">{{
            typeof item == "object" || item instanceof Array
              ? JSON.stringify(item, null, 2)
              : item
          }}</pre>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.app-code-console {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 180px;
  .console-body {
    flex: 1;
    overflow-y: auto;
  }
  .output {
    padding: 6px 15px 6px 15px;
    font-size: 12px;
    white-space: pre-line;
    pre {
      padding:0px;
      margin:0px;
      display: inline;
      background-color: transparent;
    }
    &::before {
      content: "<<";
      color: #a6a6a6;
      margin-right: 10px;
    }
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  .toolbox {
    padding: 8px 15px;
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
    justify-content: flex-end;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    user-select: none;
    .console-logo {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #a6a6a6;
    }
    .clear {
      opacity: 0.6;
      &:hover {
        opacity: 1;
      }
    }
    .action {
      width: 16px;
      height: 16px;
      cursor: pointer;
      margin-left: 10px;
      display: block;
    }
  }
}
</style>

<script>
export default {
  data() {
    return {
      height: "100%",
      maxHeight: "",
      logs: [],
    };
  },
  computed: {
    containerStyle() {
      if (this.maxHeight) {
        return `height:${this.maxHeight}px`;
      }
      return "";
    },
  },

  mounted() {},
  methods: {
    write(type, args) {
      this.refreshHeight();
      this.$nextTick(() => {
        this.logs.push({ type, args: args || [] });
        this.$nextTick(()=>{
          this.$refs.body.scrollTop = this.$refs.body.scrollHeight;
        })
      });
    },
    clear() {
      this.logs = [];
    },
    refreshHeight() {
      if (this.$refs.container) {
        const parent = this.$refs.container.parentElement;
        this.maxHeight = parent.getBoundingClientRect().height;
      }
    },
  },
};
</script>
