---
extend: '@vue/cli-service/generator/router/template/src/router.js'
replace:
  - !!js/regexp /import Vue from 'vue'/
  - !!js/regexp /import Router from 'vue-router'/
  - !!js/regexp /Vue.use\(Router\)/   
  - !!js/regexp /import Home from './views/Home.vue'/
  - !!js/regexp /'./views/About.vue'\)/
---

<%# REPLACE %>
import Vue from 'vue';
<%# END_REPLACE %>

<%# REPLACE %>
import Router from 'vue-router';
<%# END_REPLACE %>

<%# REPLACE %>
Vue.use(Router);
<%# END_REPLACE %>

<%# REPLACE %>
import Home from '~/views/Home.vue';
<%# END_REPLACE %>

<%# REPLACE %>
'~/views/About.vue'),
<%# END_REPLACE %>