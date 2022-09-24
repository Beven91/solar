<template>
  <div class="main-theme-container solar-docs solar-scoped">
    <Navbar @toggle-sidebar="toggleSidebar" />
    <div class="home-banner">
    </div>
    <div class="content">
      <div class="slogan">一，惟初太始，道立于一，造分天地，化成万物。</div>
      <Content />
    </div>
  </div>
</template>

<style lang="scss">
.main-theme-container {
  .home-banner {
    background: url(./images/banner.jpg) no-repeat;
    background-size: 100%;
    height: 448px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .content {
    padding:24px 44px;
  }
  .slogan {
    text-align: center;
    font-size:24px;
    padding-bottom: 40px;
    color: rgb(175, 175, 175);
  }
  .solar-docs-default-navbar {
    background-color: transparent;
    border: none;
    box-shadow: none;
    .links {
      display: none;
    }
  }
}
</style>

<script>
import Navbar from "./theme-default/components/Navbar.vue";

export default {
  name: "MainLayout",
  components: {
    Navbar,
  },
  data: () => {
    return {
      isSidebarOpen: true,
    };
  },
  mounted(){
    // console.log(this.$site);
  },
  methods: {
    toggleSidebar(to) {
      this.isSidebarOpen = typeof to === "boolean" ? to : !this.isSidebarOpen;
      this.$emit("toggle-sidebar", this.isSidebarOpen);
    },
  },
};
</script>