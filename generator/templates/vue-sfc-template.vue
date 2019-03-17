<%_ if (rootOptions.router) { _%>
<%# -------------------- IS Using vue-router  -------------------- -%>
<%_   if (!options.isNativeOnly) { _%>
<template web></template>
<template native>
<%_   } else { _%>
<template>
<%_   } _%>
<%_ } else { _%>
<%# -------------------- IS NOT Using vue-router  -------------------- -%>
<%_   if (!options.isNativeOnly) { _%>
<template web></template>
<template native>
<%_   } else { _%>
<template>
<%_   } _%>
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
<%_   if (rootOptions.cssPreprocessor == 'sass' || rootOptions.cssPreprocessor == 'scss'  || rootOptions.cssPreprocessor == 'dart-sass') { _%>
<%#   -------------------- IS Using sass, scss OR dart-sass -------------------- -%>
<style web lang="scss">
</style>
<style native lang="scss">
</style>
<%_   } else if (rootOptions.cssPreprocessor == 'stylus') { _%>
<%#   -------------------- IS Using stylus -------------------- -%>
<style web lang="stylus">
</style>
<style native lang="stylus">
</style>
<%_   } else if (rootOptions.cssPreprocessor == 'less') { _%>
<%#   -------------------- IS Using Less -------------------- -%>
<style web lang="less">
</style>
<style native lang="less">
</style>
<%_   } _%>
<%_ } else { _%>
<%# -------------------- IS Using standard CSS -------------------- -%>
<style web>
</style>
<style native>
</style>
<%_ } _%>
