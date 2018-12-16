<template></template>
<%_ if (!usingTS) { _%>
<%# -------------------- Is Not Using TypeScript  -------------------- -%>
<%# Remove this line and Uncomment the next to use script tag - Prettier formatting bug removes all script tags if these are left in -%>
<%# <script></script> -%>
<%_ } else { _%>
<%# -------------------- Is Using TypeScript  -------------------- -%>
<%# Remove this line and Uncomment the next to use script tag - Prettier formatting bug removes all script tags if these are left in -%>
<%# <script lang="ts"></script> -%>
<%_ } _%>
<!-- Add "scoped" attribute to limit CSS to this component only -->	
<%_ if (rootOptions.cssPreprocessor !== 'stylus') { _%>
<%# -------------------- IS Using scss OR sass -------------------- -%>
<%- rootOptions.cssPreprocessor
    ? `<style scoped lang="${
        rootOptions.cssPreprocessor === 'sass'
          ? 'scss'
          : rootOptions.cssPreprocessor
      }"` + `>`
    : ``
%>
</style>
<%_ } else { _%>
<%# -------------------- IS Using stylus -------------------- -%>
<style scoped lang="stylus">
</style>
<%_ } _%>
