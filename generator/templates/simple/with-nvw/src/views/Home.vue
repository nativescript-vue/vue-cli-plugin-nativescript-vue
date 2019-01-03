<template>
  <Page>
    <!-- <ActionBar :title="navbarTitle"/> -->
    <GridLayout rows="auto, auto">
      <!-- copy-webpack-plugin copies asset from src/assets to project output/build directory /assets -->
      <Img src="~/assets/logo.png" row="0" class="m-20"/>
      <HelloWorld :msg="msg" row="1"/>
    </GridLayout>
  </Page>
</template>
<%_ if (!usingTS) { _%>
<%# -------------------- Is Not Using TypeScript  -------------------- -%>
<script>
  import { Page, GridLayout, Img } from 'nativescript-vue-web';
  import HelloWorld from 'components/HelloWorld';

  export default {
    name: 'home',
    components: {
      HelloWorld,
      Page,
      // ActionBar,
      GridLayout,
      Img,    
    },
    data() {
      return {
        //navbarTitle: 'Home.vue',
        msg: 'Mode=' + TNS_APP_MODE + ' and Platform=' + TNS_APP_PLATFORM
      };
    }
  };

</script>
<%_ } else { _%>
<%# -------------------- Is Using TypeScript  -------------------- -%>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import { Page, GridLayout, Img } from 'nativescript-vue-web';
  import HelloWorld from 'components/HelloWorld.vue';

  @Component({
    name: 'home',
    components: {
      HelloWorld,
      Page,
      // ActionBar,
      GridLayout,
      Img,
    },
  })
  export default class Home extends Vue {
    private navbarTitle: string = 'Home.vue';
    private msg: string = 'Mode=' + TNS_APP_MODE + ' and Platform=' + TNS_APP_PLATFORM;
  }

</script>
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
  @import 'styles/style-three';

  img {
    display: block;
    margin: auto;
    margin-top: 4em;
  }
</style>
<%_ } else { _%>
<%# -------------------- IS Using stylus -------------------- -%>
<style scoped lang="stylus">

  img
    display block
    margin auto
    margin-top 4em
</style>
<%_ } _%>

