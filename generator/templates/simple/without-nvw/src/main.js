---
extend: '@vue/cli-service/generator/template/src/main.js'
replace:
  - !!js/regexp /import App from './App.vue'/
---

<%# REPLACE %>
import App from '~/App'
<%# END_REPLACE %>