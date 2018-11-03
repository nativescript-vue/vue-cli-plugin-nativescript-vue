import Vue from 'nativescript-vue'
import App from '~/App.vue'

// Set the following to `true` to hide the logs created by nativescript-vue
Vue.config.silent = false
// Set the following to `false` to not colorize the logs created by nativescript-vue
Vue.config.debug = true

new Vue({
  render: h => h('frame', [h(App)])
}).$start()
