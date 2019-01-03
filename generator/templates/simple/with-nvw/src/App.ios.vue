<template>
  <Page>
    <ActionBar :title="navbarTitle"/>
    <GridLayout rows="auto, auto">
      <Button text="Home" @tap="goToHomePage" row="0"/>
      <Button text="About" @tap="goToAboutPage" row="1"/>
    </GridLayout>
  </Page>
</template>
<%_ if (!usingTS) { _%>
<%# -------------------- Is Not Using TypeScript  -------------------- -%>
<script>
  import Home from '~/views/Home';
  import About from '~/views/About';

  export default {
    data ()	{
      return {
        navbarTitle: 'App.ios.vue'
      };
    },
    methods: {
      goToHomePage ()	{
        this.$navigateTo( Home );
      },
      goToAboutPage () {
        this.$navigateTo( About );
      }
    }
  };
</script>
<%_ } else { _%>
<%# -------------------- Is Using TypeScript  -------------------- -%>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import Home from '~/views/Home.ios.vue';
  import About from '~/views/About.ios.vue';

  @Component
  export default class App extends Vue {
    private navbarTitle: string = 'App.ios.vue';

    private goToHomePage () {
      Vue.prototype.$navigateTo(Home);
    }

    private goToAboutPage () {
      Vue.prototype.$navigateTo(About);
    }
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
  @import 'styles/style-two';
  @import 'styles/style-three';
</style>
<%_ } else { _%>
<%# -------------------- IS Using stylus -------------------- -%>
<style lang="stylus">
  ActionBar
    color #42b983
</style>
<%_ } _%>
