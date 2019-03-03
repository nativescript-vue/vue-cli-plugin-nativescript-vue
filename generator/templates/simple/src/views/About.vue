<template web>
  <div class="w-page">
    <div class="w-container">
      <span>This is an about page</span>
    </div>
  </div>
</template>
<template native>
  <Page>
    <ActionBar :title="navbarTitle"/>
    <GridLayout>
      <Label text="This is an about page" textWrap="true" horizontalAlignment="center" verticalAlignment="center"/>
    </GridLayout>
  </Page>
</template>
<%_ if (!usingTS) { _%>
<script>

  export default {
    data() {
      return {
        navbarTitle: `About.vue`
      };
    }
  };
</script>
<%_ } else { _%>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  @Component({
    name: 'about',
  })
  export default class About extends Vue {
    private navbarTitle: string = `About.vue`;
  }

</script>
<%_ } _%>
<%_ if (!usingTS) { _%>
<%# -------------------- Is Not Using TypeScript  -------------------- -%>
<%# -------------------- Remove this line and Uncomment the next to use script tag - Prettier formatting bug removes all script tags if these are left in  -------------------- -%>
<%# -------------------- <script></script>  -------------------- -%>
<%_ } else { _%>
<%# -------------------- Is Using TypeScript  -------------------- -%>
<%# -------------------- Remove this line and Uncomment the next to use script tag - Prettier formatting bug removes all script tags if these are left in  -------------------- -%>
<%# -------------------- <script lang="ts"></script>  -------------------- -%>
<%_ } _%>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<%_ if (rootOptions.cssPreprocessor) { _%>
<%_   if (rootOptions.cssPreprocessor == 'sass' || rootOptions.cssPreprocessor == 'scss') { _%>
<%#   -------------------- IS Using scss OR sass -------------------- -%>
<%- rootOptions.cssPreprocessor
    ? `<style scoped lang="${
        rootOptions.cssPreprocessor === 'sass'
          ? 'scss'
          : rootOptions.cssPreprocessor
      }"` + `>`
    : ``
%>
  @import '~styles/style-two';
  @import '~styles/style-one';
</style>
<%_   } else if (rootOptions.cssPreprocessor == 'stylus') { _%>
<%#   -------------------- IS Using stylus -------------------- -%>
<style scoped lang="stylus">
  @import '~styles/style-two';
  @import '~styles/style-one';
</style>
<%_   } else if (rootOptions.cssPreprocessor == 'less') { _%>
<%#   -------------------- IS Using Less -------------------- -%>
<style scoped lang="less">
  @import '~styles/style-two';
  @import '~styles/style-one';
</style>
<%_   } _%>
<%_ } else { _%>
<%# -------------------- IS Using standard CSS -------------------- -%>
<style scoped lang="scss">
  @import '~styles/style-two';
  @import '~styles/style-one';
</style>
<%_ } _%>