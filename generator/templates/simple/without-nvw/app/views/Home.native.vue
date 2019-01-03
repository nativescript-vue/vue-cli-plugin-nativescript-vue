<template>
  <Page>
    <ActionBar :title="navbarTitle"/>
    <GridLayout rows="auto, auto">
      <!-- copy-webpack-plugin copies asset from src/assets to project output/build directory /assets -->
      <Image src="~/assets/logo.png" row="0" class="m-20"/>
      <HelloWorld :msg="msg" row="1"/>
    </GridLayout>
  </Page>
</template>
<%_ if (!usingTS) { _%>
<%# -------------------- Is Not Using TypeScript  -------------------- -%>
<script>
  import HelloWorld from '~/components/HelloWorld.native';

  export default {
    name: 'home',
    components: {
      HelloWorld
    },
    data() {
      return {
        navbarTitle: 'Home.native.vue',
        msg: 'Mode=' + TNS_APP_MODE + ' and Platform=' + TNS_APP_PLATFORM
      };
    }
  };
</script>
<%_ } else { _%>
<%# -------------------- Is Using TypeScript  -------------------- -%>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import HelloWorld from '~/components/HelloWorld.native.vue';

  @Component({
    name: 'home',
    components: {
      HelloWorld,
    },
  })
  export default class Home extends Vue {
    private navbarTitle: string = 'Home.native.vue';
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

  Image {
    height: 50%;
    width: 50%;
  }
</style>
<%_ } else { _%>
<%# -------------------- IS Using stylus -------------------- -%>
<style scoped lang="stylus">
  Image
    height 50%
    width 50%
</style>
<%_ } _%>
