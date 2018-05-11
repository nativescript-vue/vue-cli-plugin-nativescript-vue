---
extend: '@vue/cli-service/generator/template/src/router.js'
replace:
  - !!js/regexp /import Vue from 'vue'/
---

<%# REPLACE %>
import Vue from 'nativescript-vue'
<%# END_REPLACE %>
