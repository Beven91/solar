import Vuex from 'vuex'
import Vue from 'vue'
import webpackLogo from '../assets/webpack.svg'
import apiLogo from '../assets/lang.png'
import uiLogo from '../assets/ui.png'
import cliLogo from '../assets/cli.png'

Vue.use(Vuex)

if (typeof window == 'object') {
  window.STJKVENDORS = {};
}

export default new Vuex.Store({
  state() {
    return {
      library: [
        {
          name: 'solar-docs',
          logo: cliLogo,
          description: '文档调试cli工具',
          tags: ['node', 'shell']
        },
        {
          name: '@midway/ui',
          logo: uiLogo,
          description: '移动端UI组件库',
          tags: ['react', 'mobile']
        },
        {
          name: 'fluxy-cli',
          logo: cliLogo,
          description: 'fluxy系列的cli工具，快速生成。',
          tags: ['node', 'shell']
        },
        {
          name: 'fluxy-core',
          logo: apiLogo,
          description: 'Javascript项目开发常用api库。',
          tags: ['javascript', 'typescript']
        },
        {
          name: 'fluxy-pc',
          logo: uiLogo,
          description: '用于PC后台开发的React组件库。',
          tags: ['react', 'ant design']
        },
        {
          name: 'auto-config-plugin',
          logo: webpackLogo,
          description: '帮助你快速切换本地调试环境的webpack插件。',
          tags: ['webpack']
        },
      ]
    }
  },
  mutations: {

  }
});
