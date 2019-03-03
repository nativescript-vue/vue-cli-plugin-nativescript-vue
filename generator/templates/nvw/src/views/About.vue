<template web>
  <Page>
    <GridLayout>
      <Label text="This is an about page" :textWrap="true" horizontalAlignment="center" verticalAlignment="center"/>
    </GridLayout>
  </Page>
</template>
<template native>
  <Page>
    <ActionBar :title="navbarTitle"/>
    <GridLayout>
      <Label text="This is an about page" :textWrap="true" horizontalAlignment="center" verticalAlignment="center"/>
    </GridLayout>
  </Page>
</template>
<%_ if (!usingTS) { _%>
<%# -------------------- Is Not Using TypeScript  -------------------- -%>
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
<%# -------------------- Is Using TypeScript  -------------------- -%>
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

  .nvw-label {
    height: 100%;
    width: 100%;
    padding-top: 3em;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: top;
    align-items: center;
  }
</style>
<%_   } else if (rootOptions.cssPreprocessor == 'stylus') { _%>
<%#   -------------------- IS Using stylus -------------------- -%>
<style scoped lang="stylus">
  @import '~styles/style-two';
  @import '~styles/style-one';

  .nvw-label
    height 100%
    width 100%
    padding-top 3em
    position relative
    overflow: hidden
    display flex
    flex-direction column
    justify-content top
    align-items center

</style>
<%_   } else if (rootOptions.cssPreprocessor == 'less') { _%>
<%#   -------------------- IS Using Less -------------------- -%>
<style scoped lang="less">
  @import '~styles/style-two';
  @import '~styles/style-one';

  .nvw-label {
    height: 100%;
    width: 100%;
    padding-top: 3em;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: top;
    align-items: center;
  }
</style>
<%_   } _%>
<%_ } else { _%>
<%# -------------------- IS Using standard CSS -------------------- -%>
<style scoped lang="scss">
  @import '~styles/style-two';
  @import '~styles/style-one';

  .nvw-label {
    height: 100%;
    width: 100%;
    padding-top: 3em;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: top;
    align-items: center;
  }
</style>
<%_ } _%>



