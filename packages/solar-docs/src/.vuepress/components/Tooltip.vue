<template>
  <span
    class="tooltip-wrapper"
    :class="{ code: type == 'code' }"
    @mouseleave="handleLeave"
    @mouseover="handleMove"
  >
    <div class="tooltip-popup" :class="{ open: visible }">
      <div class="tooltip-content">
        {{ title }}
        <slot name="popup"></slot>
      </div>
    </div>
    <slot></slot>
  </span>
</template>
<style text="text/css" lang="scss">
.tooltip-wrapper {
  &.code {
    .tooltip-content {
      width: 600px;
      padding: 15px;
      color:inherit;
      background-color: #fff;
      &::after {
        border-top-color: #fff;
      }
      code {
        overflow:auto;
        padding: 15px 10px;
        display: block;
        white-space: pre;
      }
    }
  }
}
</style>
<style lang="scss" type="text/css" scoped>
.tooltip-wrapper {
  position: relative;
  vertical-align: middle;
}
.tooltip-popup {
  position: absolute;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  color: #000000d9;
  font-size: 14px;
  font-variant: tabular-nums;
  list-style: none;
  font-feature-settings: "tnum";
  display: block;
  width: max-content;
  width: intrinsic;
  visibility: visible;
  transform: translate(-50%, -100%);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s;
  &.open {
    z-index: 1070;
    opacity: 1;
  }
}
.tooltip-content {
  min-width: 30px;
  padding: 6px 8px;
  color: #fff;
  text-align: left;
  text-decoration: none;
  word-wrap: break-word;
  background-color: rgba(0, 0, 0, 0.95);
  border-radius: 2px;
  box-shadow: 0 3px 6px -4px #0000001f, 0 6px 16px #00000014,
    0 9px 28px 8px #0000000d;
  transform: translate(5px, -10px);
  &::after {
    content: "";
    position: absolute;
    border: 6px solid rgba(0, 0, 0, 0.9);
    border-left-color: transparent;
    border-right-color: transparent;
    border-bottom-color: transparent;
    left: 50%;
    transform: translate(-50%, 100%);
    bottom: 0px;
  }
}
</style>


<script>
export default {
  name: "Tooltip",
  props: ["title", "type"],
  data() {
    return {
      timeoutId: 0,
      visible: false,
    };
  },
  methods: {
    handleMove() {
      clearTimeout(this.timeoutId);
      this.visible = true;
    },
    handleLeave() {
      this.timeoutId = setTimeout(() => {
        this.visible = false;
      }, 500);
    },
  },
};
</script>
