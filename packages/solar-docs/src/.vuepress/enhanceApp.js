/**
 * Client app enhancement file.
 *
 * https://v1.vuepress.vuejs.org/guide/basic-config.html#app-level-enhancements
 */
import store from './store'
import isolate from './helper/isolate';
import AppCodebox from './components/AppCodebox'

export default ({
  Vue, // the version of Vue being used in the VuePress app
  options, // the options for the root Vue instance
  router, // the router instance for the app
  siteData // site metadata
}) => {
  options.store = store;

  Vue.use(isolate)

  Vue.component('AppCodebox', AppCodebox)

  if (typeof window == 'object') {
    const VueClipboard = require('vue-clipboard-plus');
    Vue.use(VueClipboard)
  }
}
