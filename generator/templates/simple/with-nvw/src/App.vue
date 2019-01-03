<%_ if (rootOptions.router) { _%>
<%# -------------------- IS Using vue-router  -------------------- -%>
<template>
  <Page>
    <ActionBar :title="navbarTitle"/>
    <GridLayout rows="auto, auto">
      <Button text="Home" @tap="goToHomePage" row="0"/>
      <Button text="About" @tap="goToAboutPage" row="1"/>
    </GridLayout>
    <router-view/>
  </Page>
</template>
<%_ } else { _%>
<%# -------------------- IS NOT Using vue-router  -------------------- -%>
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
<%_ } _%>
<%_ if (!usingTS && rootOptions.router) { _%>
<%# -------------------- IS NOT Using TypeScript AND IS Using vue-router  -------------------- -%>
<script>
  import { Page, ActionBar, GridLayout, Button } from 'nativescript-vue-web';
  export default {
    components: {
      Page,
      ActionBar,
      GridLayout,
      Button,
    },
    data() {
      return {
        navbarTitle: 'App.vue',
      };
    },
    methods: {
      goToHomePage() {
        this.$router.push('/');
      },
      goToAboutPage() {
        this.$router.push('about');
      },
    },
  };
</script>
<%_ } else if (!usingTS && !rootOptions.router) { _%>
<%# -------------------- IS NOT Using TypeScript AND IS NOT Using vue-router  -------------------- -%>
<script>
  import { Page, ActionBar, GridLayout } from 'nativescript-vue-web';
  export default {
    components: {
      Page,
      ActionBar,
      GridLayout
    },
    data() {
      return {
        navbarTitle: 'App.vue',
        msg: 'Mode=' + TNS_APP_MODE + ' and Platform=' + TNS_APP_PLATFORM;
      };
    },
  };
</script>
<%_ } else if (usingTS && rootOptions.router) { _%>
<%# -------------------- IS Using TypeScript AND IS Using vue-router  -------------------- -%>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import { Page, ActionBar, GridLayout, Button } from 'nativescript-vue-web';

  @Component({
    components: {
      Page,
      ActionBar,
      GridLayout,
      Button
    },
  })
  export default class App extends Vue {
    private navbarTitle: string = 'App.vue';

    private goToHomePage () {
      this.$router.push('/');
    };

    private goToAboutPage () {
      this.$router.push('about');
    };
  }

  </script>
<%_ } else if (usingTS && !rootOptions.router) { _%>
<%# -------------------- IS Using TypeScript AND IS NOT Using vue-router  -------------------- -%>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import { Page, ActionBar, GridLayout } from 'nativescript-vue-web';
  import HelloWorld from 'components/HelloWorld.vue';

  @Component({
    components: {
      Page,
      ActionBar,
      GridLayout
      HelloWorld,
    },
  })
  export default class App extends Vue {
    private navbarTitle: string = 'App.vue';
    private msg: string = 'Mode=' + TNS_APP_MODE + ' and Platform=' + TNS_APP_PLATFORM;
  }

</script>
<%_ } else { _%>
<%# -------------------- don't do anything -------------------- -%>
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
  @import 'styles/style-one';
</style>
<%_ } else { _%>
<%# -------------------- IS Using stylus -------------------- -%>
<style scoped lang="stylus">
  .nvw-action-bar
    color #42b983
</style>
<%_ } _%>