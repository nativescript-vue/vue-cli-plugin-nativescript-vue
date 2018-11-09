---
extend: '@vue/cli-service/generator/router/template/src/router.js'
replace:
  - !!js/regexp /import Home from './views/Home.vue'/
  - !!js/regexp /'./views/About.vue'/
---

<%# REPLACE %>
import Home from '~/views/Home'
<%# END_REPLACE %>

<%# REPLACE %>
'~/views/About'
<%# END_REPLACE %>