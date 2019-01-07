<template>
  <Page>
    <GridLayout>
      <Label text="This is an about page" :textWrap="true" horizontalAlignment="center" verticalAlignment="center"/>
    </GridLayout>
  </Page>
</template>
<%_ if (!usingTS) { _%>
<%# -------------------- Is Not Using TypeScript  -------------------- -%>
<script>
  import { Page, GridLayout, Label } from 'nativescript-vue-web';

  export default {
    components: {
      Page,
      GridLayout,
      Label
    },
    data() {
      return {
        navbarTitle: 'About.vue'
      };
    }
  };
</script>
<%_ } else { _%>
<%# -------------------- Is Using TypeScript  -------------------- -%>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import { Page, GridLayout, Label } from 'nativescript-vue-web';

  @Component({
    name: 'about',
    components: {
        Page,
        GridLayout,
        Label
    },
  })
  export default class About extends Vue {
    private navbarTitle: string = 'About.vue';
  }

</script>
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
<%_   } else { _%>
<%#   -------------------- IS Using stylus -------------------- -%>
<style scoped lang="stylus">
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
<%_   } _%>
<%_ } else { _%>
<%# -------------------- IS Using standard CSS -------------------- -%>
<style scoped>
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





