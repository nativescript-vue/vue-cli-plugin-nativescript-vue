---
extend: '@vue/cli-service/generator/template/src/main.js'
replace:
  - !!js/regexp /import Vue from 'vue'/
  - !!js/regexp /import App from './App.vue'/
  - !!js/regexp /Vue.config.productionTip = false/
  - !!js/regexp /h => h\(App\),/
  - !!js/regexp /}\)\.\$mount\('#app'\)/
---

<%# REPLACE %>
import Vue from 'vue';
<%# END_REPLACE %>

<%# REPLACE %>
import App from '~/App.vue';
import { Page, ActionBar, GridLayout, Button, Img, Label } from 'nativescript-vue-web';

Vue.component('Page', Page);
Vue.component('ActionBar', ActionBar);
Vue.component('GridLayout', GridLayout);
Vue.component('Button', Button);
Vue.component('Img', Img);
Vue.component('Label', Label);

<%# END_REPLACE %>

<%# REPLACE %>
Vue.config.productionTip = false;
<%# END_REPLACE %>

<%# REPLACE %>
(h) => h(App),
<%# END_REPLACE %>

<%# REPLACE %>
}).$mount('#app');
<%# END_REPLACE %>