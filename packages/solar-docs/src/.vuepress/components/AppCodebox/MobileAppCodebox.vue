<template>
  <div class="mobile-app-code-box" :class="{ slot: !!slotKey }">
    <div class="mobile-app-code-box-content">
      <div class="app-code-box-meta">
        <div class="app-code-box-meta-left">
          <div class="code-box-title">{{ title }}</div>
          <div class="code-box-desc">
            {{ desc }}
            <slot name="desc"></slot>
          </div>
        </div>
        <div class="app-code-box-actions">
          <Tooltip :title="copyed ? '复制成功' : '复制代码'">
            <img
              v-clipboard:copy="source"
              v-clipboard:success="onCopy"
              v-clipboard:error="onError"
              class="box-action"
              :src="copyIcon"
            />
          </Tooltip>
        </div>
      </div>
      <div class="source-code extra-class" ref="source">
        <Content v-if="slotKey" :slot-key="slotKey" />
      </div>
    </div>
    <div
      class="mobile-app-code-box-device"
      ref="demo"
    >
      <slot></slot>
      <iframe v-if="url" frameBorder="no" :src="url" class="device"></iframe>
      <div v-if="url" class="device-footer-actions">
        <img
          @click="refreshApp"
          class="box-action"
          src="../../assets/refresh.svg"
        />
        <Tooltip>
          <img
            @click="makeQrcode"
            class="box-action"
            src="../../assets/qrcode.svg"
          />
          <QRcode slot="popup" :value="url" />
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mobile-app-code-box {
  position: relative;
  display: inline-block;
  width: 100%;
  margin: 0 0 16px;
  border: 1px solid #ebedf1;
  border-radius: 2px;
  transition: all 0.2s;
  display: flex;
  overflow: hidden;
  flex-direction: row;
  flex-wrap: nowrap;
  height:600px;
  &.slot {
    height:auto;
    max-height: 600px;
  }

  .qrcode-view {
    width: 150px;
    height: 150px;
  }

  .mobile-app-code-box-content {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-right: 1px solid #ebedf1;
    .source-code {
      flex: 1;
      overflow: auto;
    }
  }

  .mobile-app-code-box-device {
    width: 375px;
    height: 100%;
    flex-shrink: 0;
    flex-grow: 0;
    display: flex;
    flex-direction: column;
    .device {
      width: 100%;
      height: 557px;
      overflow: auto;
    }
    .device-footer-actions {
      height: 41px;
      display: flex;
      padding: 0px 22px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-around;
      box-sizing: border-box;
      position: relative;
      border-top: 1px solid #ebedf1;
    }
  }

  .app-code-box-meta {
    min-height: 45px;
    border-bottom: 1px dashed rgba(0, 0, 0, 0.06);
    border-radius: 0;
    position: relative;
    width: 100%;
    font-size: 14px;
    border-radius: 0 0 2px 2px;
    transition: background-color 0.4s;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    box-sizing: border-box;
    .app-code-box-meta-left {
      flex: 1;
    }
  }
  .app-code-box-actions {
    display: flex;
    justify-content: center;
    padding: 12px 0;
    border-top: 1px dashed rgba(0, 0, 0, 0.06);
    opacity: 0.7;
    transition: opacity 0.3s;
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
    border-radius: 0px;
  }
}
</style>
<script>
import copyIcon from "../../assets/copy.png";
import copyOk from "../../assets/ok.svg";

export default {
  name: "MobileAppCodebox",
  props: ["title", "desc", "src", "demoUrl", "slotKey"],
  data() {
    return {
      url: "",
      source: "",
      expand: false,
      copyed: false,
      copyIcon: copyIcon,
      highlight: false,
    };
  },
  mounted() {
    const demo = self.STJKVENDORS[this.src];
    if (demo) {
      this.$refs.source.innerHTML = demo.source.replace(/\t{2}/g, "\n").trim();
      this.$nextTick(() => {
        this.source = this.$refs.source.textContent;
      });
      if (this.demoUrl) {
        this.url = this.demoUrl;
      } else {
        // demo.run(container);
      }
    }
  },
  methods: {
    refreshApp() {
      const joinChar = /\?/.test(this.demoUrl) ? "&" : "?";
      this.url = this.demoUrl + joinChar + "v=" + Date.now();
    },
    makeQrcode() {},
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