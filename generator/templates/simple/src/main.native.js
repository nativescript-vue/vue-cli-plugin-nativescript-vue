import Vue from 'nativescript-vue';
<%_ if (rootOptions.router) { _%>
import Navigator from 'nativescript-vue-navigator'
<%_ } _%>

import App from './App.vue';
<%_ if (rootOptions.router) { _%>
import { options } from './router';

// adapt vue-router routes to nativescript-vue-navigator
const routes = options.routes.reduce((data, route) => {
  data[route.name] = {
    component: route.component
  }
  return data
}, {});

Vue.use(Navigator, { routes });
<%_ } _%>

// Set the following to `true` to hide the logs created by nativescript-vue
Vue.config.silent = false;
// Set the following to `false` to not colorize the logs created by nativescript-vue
// disabled in template due to typing issue for Typescript projects....NEEDS TO BE FIXED
// Vue.config.debug = true;

new Vue({
  render: h => h('frame', [h(App)]),
}).$start();
