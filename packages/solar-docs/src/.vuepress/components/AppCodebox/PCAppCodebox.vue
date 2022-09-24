<template>
  <div class="pc-app-code-box">
    <div class="stage-view">
      <div class="app-code-demo" ref="demo">
        <slot></slot>
      </div>
      <div v-if="console" class="console">
        <Console ref="console"></Console>
      </div>
    </div>
    <div class="app-code-box-meta">
      <div class="code-box-title">{{ title }}</div>
      <div class="code-box-desc">
        {{ desc }}
        <slot name="desc"></slot>
      </div>
    </div>
    <div class="app-code-box-actions" :class="{ expand: expand }">
      <Tooltip :title="copyed ? '复制成功' : '复制代码'">
        <img
          v-clipboard:copy="source"
          v-clipboard:success="onCopy"
          v-clipboard:error="onError"
          class="box-action"
          :src="copyIcon"
        />
      </Tooltip>
      <Tooltip :title="expand ? '收起代码' : '展开代码'">
        <div
          class="box-action source-action"
          :class="{ expanded: expand }"
          @click="toggleSource"
        />
      </Tooltip>
    </div>
    <div ref="source" class="source-code extra-class" :class="{ open: expand }">
      <Content v-if="slotKey" :slot-key="slotKey" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pc-app-code-box {
  position: relative;
  display: inline-block;
  width: 100%;
  margin: 0 0 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 2px;
  transition: all 0.2s;
  &.pure {
    border: none;
    .app-code-box-meta,
    .app-code-box-actions {
      display: none;
    }
  }

  .stage-view {
    display: flex;
    flex-direction: row;
    overflow: hidden;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    .app-code-demo {
      flex: 1;
    }
    .console {
      width: 400px;
      flex-shrink: 0;
      border-left: 1px dashed rgba(0, 0, 0, 0.06);
    }
  }

  .app-code-demo {
    padding: 42px 24px 50px;
    background-color: #fff;
    color: #000000d9;
  }
  .app-code-box-meta {
    border-bottom: 1px dashed rgba(0, 0, 0, 0.06);
    border-radius: 0;
    position: relative;
    width: 100%;
    font-size: 14px;
    border-radius: 0 0 2px 2px;
    transition: background-color 0.4s;
  }
  .app-code-box-actions {
    display: flex;
    justify-content: center;
    padding: 12px 0;
    border-top: 1px dashed rgba(0, 0, 0, 0.06);
    opacity: 0.7;
    transition: opacity 0.3s;
    &.expand {
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }
  }
  .code-box-desc {
    padding: 18px 24px 12px;
  }
  .code-box-title {
    position: absolute;
    top: -14px;
    margin-left: 16px;
    padding: 1px 8px;
    color: #777;
    background: #fff;
    border-radius: 2px 2px 0 0;
    transition: background-color 0.4s;
    color: #000000d9;
    background: #fff;
    font-size: 14px;
    font-weight: 500;
  }
  .app-code-box-actions {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
  }
  .box-action {
    cursor: pointer;
    width: 16px;
    height: 16px;
    margin-right: 15px;
    vertical-align: top;
  }
  .source-action {
    &.expanded {
      background-image: url("../../assets/unexpand.svg");
    }
    background-image: url("../../assets/expand.svg");
    background-size: 100%;
    background-position: center;
  }
  .source-code {
    display: none;
    &.open {
      display: block;
    }
  }
}
</style>
<script>
import copyIcon from "../../assets/copy.png";
import copyOk from "../../assets/ok.svg";
import Console from "../Console.vue";

export default {
  name: "PCAppCodebox",
  props: ["title", "desc", "src", "slotKey", "console"],
  components: {
    Console,
  },
  data() {
    return {
      source: "",
      expand: false,
      copyed: false,
      copyIcon: copyIcon,
      highlight: false,
    };
  },
  mounted() {
    const container = this.$refs.demo;
    const demo = self.STJKVENDORS[this.src];
    if (demo) {
      demo.run(container, (type, args) => this.toConsole(type, args));
      this.$refs.source.innerHTML = demo.source.replace(/\t{2}/g, "\n").trim();
      this.$nextTick(() => {
        this.source = this.$refs.source.textContent;
      });
    }
  },
  methods: {
    toConsole(type, args) {
      if (this.$refs.console) {
        this.$refs.console.write(type, args);
      }
    },
    toggleSource() {
      this.expand = !this.expand;
    },
    onCopy() {
      this.copyed = true;
      this.copyIcon = copyOk;
      setTimeout(() => {
        this.copyed = false;
        this.copyIcon = copyIcon;
      }, 1000);
    },
    onError() {},
  },
};
</script>