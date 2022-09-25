import Vuex from 'vuex'
import Vue from 'vue'
import webpackLogo from '../assets/webpack.svg'
import apiLogo from '../assets/lang.png'
import uiLogo from '../assets/ui.png'
import cliLogo from '../assets/cli.png'

Vue.use(Vuex)

if (typeof window == 'object') {
  window.SOLARVENDORS = {};
}

export default new Vuex.Store({
  state() {
    return {
      library: [
        {
          name: 'docs',
          logo: cliLogo,
          description: '文档系统',
          tags: ['node', 'shell']
        },
      ]
    }
  },
  mutations: {

  }
});
