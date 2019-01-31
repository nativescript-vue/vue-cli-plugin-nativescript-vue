<%_ if (rootOptions.router) { _%>
<%# -------------------- IS Using vue-router  -------------------- -%>
<template></template>
<%_ } else { _%>
<%# -------------------- IS NOT Using vue-router  -------------------- -%>
<template></template>
<%_ } _%>
<%_ if (!usingTS && rootOptions.router) { _%>
<%# -------------------- IS NOT Using TypeScript AND IS Using vue-router  -------------------- -%>
<%# Remove this line and Uncomment the next to use script tag - Prettier formatting bug removes all script tags if these are left in -%>
<%# <script></script> -%>
<%_ } else if (!usingTS && !rootOptions.router) { _%>
<%# -------------------- IS NOT Using TypeScript AND IS NOT Using vue-router  -------------------- -%>
<%# Remove this line and Uncomment the next to use script tag - Prettier formatting bug removes all script tags if these are left in -%>
<%# <script></script> -%>
<%_ } else if (usingTS && rootOptions.router) { _%>
<%# -------------------- IS Using TypeScript AND IS Using vue-router  -------------------- -%>
<%# <script lang="ts"></script> -%>
<%_ } else if (usingTS && !rootOptions.router) { _%>
<%# -------------------- IS Using TypeScript AND IS NOT Using vue-router  -------------------- -%>
<%# <script lang="ts"></script> -%>
<%_ } else { _%>
<%# -------------------- don't do anything -------------------- -%>
<%_ } _%>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<%_ if (rootOptions.cssPreprocessor) { _%>
<%_   if (rootOptions.cssPreprocessor !== 'stylus') { _%>
<%#   -------------------- IS Using scss OR sass -------------------- -%>
<%- rootOptions.cssPreprocessor
    ? `<style scoped lang="${
        rootOptions.cssPreprocessor === 'sass'
          ? 'scss'
          : rootOptions.cssPreprocessor
      }"` + `>`
    : ``
%>
</style>
<%_   } else { _%>
<%#   -------------------- IS Using stylus -------------------- -%>
<style scoped lang="stylus">
</style>
<%_   } _%>
<%_ } else { _%>
<%# -------------------- IS Using standard CSS -------------------- -%>
<style scoped>
</style>
<%_ } _%>
