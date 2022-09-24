<template>
  <div class="library-container">
    <div
      class="library-item"
      @click="navigateTo(item)"
      v-for="(item, index) in items"
      v-bind:key="index"
    >
      <img class="logo" :src="item.logo" />
      <div class="body">
        <div class="title">{{ item.name }}</div>
        <div class="desc">{{ item.description }}</div>
        <div class="tags">
          <div
            class="tag"
            v-for="(item, index) in item.tags"
            v-bind:key="index"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" type="text/css">
.library-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  .tags {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 4px;
    color: #697b8c;
    transform: translateY(8px);
    .tag {
      font-size: 12px;
      margin-right: 4px;
      border: 1px solid #eee;
      padding: 4px 6px;
    }
  }
  .library-item {
    user-select: none;
    &:hover {
      box-shadow: 0 3px 6px -4px #0000001f, 0 6px 16px #00000014,
        0 9px 28px 8px #0000000d;
    }
    margin: 0px 40px 40px 0px;
    cursor: pointer;
    border: 1px solid rgba(0, 0, 0, 0.06);
    .logo {
      width: 339px;
      height: 166px;
      background-color: rgba(142, 214, 251, 0.3);
    }
    .body {
      padding: 16px 20px 20px 20px;
    }
    .title {
      color: #0d1a26;
      font-weight: 400;
      font-size: 20px;
      margin-bottom: 8px;
    }
    .desc {
      color: #697b8c;
      font-size: 14px;
    }
  }
}
</style>

<script>
export default {
  computed: {
    items() {
      return this.$store.state.library;
    },
  },
  data() {
    return {};
  },
  methods: {
    navigateTo(item) {
      location.href = item.name + "/";
    },
  },
};
</script>
