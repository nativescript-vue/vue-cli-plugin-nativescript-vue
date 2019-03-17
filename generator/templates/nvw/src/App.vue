<%_ if (rootOptions.router) { _%>
<%# -------------------- IS Using vue-router  -------------------- -%>
<template web>
  <Page>
    <ActionBar :title="navbarTitle"/>
    <GridLayout rows="auto, auto">
      <Button text="Home" @tap="goToHomePage" row="0"/>
      <Button text="About" @tap="goToAboutPage" row="1"/>
    </GridLayout>
    <router-view/>
  </Page>
</template>
<template native>
  <Page>
    <ActionBar :title="navbarTitle"/>
    <GridLayout rows="auto, auto">
      <Button text="Home" @tap="goToHomePage" row="0"/>
      <Button text="About" @tap="goToAboutPage" row="1"/>
    </GridLayout>
  </Page>
</template>
<%_ } else { _%>
<%# -------------------- IS NOT Using vue-router  -------------------- -%>
<template web>
  <Page>
    <ActionBar :title="navbarTitle"/>
    <GridLayout rows="auto, auto">
      <!-- copy-webpack-plugin copies asset from src/assets to project output/build directory /assets -->
      <Img src="~/assets/logo.png" row="0" class="m-20"/>
      <HelloWorld :msg="msg" row="1"/>
    </GridLayout>
  </Page>
</template>
<template native>
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
  import Home from '~/views/Home';
  import About from '~/views/About';

  const { VUE_APP_MODE } = process.env;

  export default {
    data() {
      return {
        navbarTitle: `App.vue`,
      };
    },
    methods: {
      goToHomePage() {
        VUE_APP_MODE == 'web' ? this.$router.push('/') : this.$navigateTo(Home);
      },
      goToAboutPage() {
        VUE_APP_MODE == 'web' ? this.$router.push('about') : this.$navigateTo(About);
      },
    },
  };

</script>
<%_ } else if (!usingTS && !rootOptions.router) { _%>
<%# -------------------- IS NOT Using TypeScript AND IS NOT Using vue-router  -------------------- -%>
<script>
  const { VUE_APP_MODE, VUE_APP_PLATFORM } = process.env;

  export default {
    data() {
      return {
        navbarTitle: `App.vue`,
        msg: `Mode=${VUE_APP_MODE} and Platform=${VUE_APP_PLATFORM}`,
      };
    },
  };
</script>
<%_ } else if (usingTS && rootOptions.router) { _%>
<%# -------------------- IS Using TypeScript AND IS Using vue-router  -------------------- -%>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import Home from '~/views/Home';
  import About from '~/views/About';

  const { VUE_APP_MODE } = process.env;

  @Component()
  export default class App extends Vue {
    private navbarTitle: string = `App.vue`;

    private goToHomePage () {
      VUE_APP_MODE == 'web' ? this.$router.push('/') : this.$navigateTo(Home);
    };

    private goToAboutPage () {
      VUE_APP_MODE == 'web' ? this.$router.push('about') : this.$navigateTo(About);
    };
  }

  </script>
<%_ } else if (usingTS && !rootOptions.router) { _%>
<%# -------------------- IS Using TypeScript AND IS NOT Using vue-router  -------------------- -%>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import HelloWorld from 'components/HelloWorld.vue';

  const { VUE_APP_MODE, VUE_APP_PLATFORM } = process.env;

  @Component({
    components: {
      HelloWorld,
    },
  })
  export default class App extends Vue {
    private navbarTitle: string = `App.vue`;
    private msg: string = `Mode=${VUE_APP_MODE} and Platform=${VUE_APP_PLATFORM}`;
  }

</script>
<%_ } else { _%>
<%# -------------------- don't do anything -------------------- -%>
<%_ } _%>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<%_ if (rootOptions.cssPreprocessor) { _%>
<%_   if (rootOptions.cssPreprocessor == 'sass' || rootOptions.cssPreprocessor == 'scss'  || rootOptions.cssPreprocessor == 'dart-sass' ) { _%>
<%#   -------------------- IS Using sass, scss OR dart-sass -------------------- -%>
<style web lang="scss">
  @import '~styles/style-one';

  .w-page {
    height: 100%;
    width: 100%;
  }

  .nvw-action-bar {
    color: #42b983;
  }

</style>
<style native lang="scss">
  @import '~styles/style-one';
</style>
<%_   } else if (rootOptions.cssPreprocessor == 'stylus') { _%>
<%#   -------------------- IS Using stylus -------------------- -%>
<style web lang="stylus">
  @import '~styles/style-one';

  .w-page
    height 100%
    width 100%

  .nvw-action-bar 
    color #42b983
  
</style>
<style native lang="stylus">
  @import '~styles/style-one';
</style>
<%_   } else if (rootOptions.cssPreprocessor == 'less') { _%>
<%#   -------------------- IS Using Less -------------------- -%>
<style web lang="less">
  @import '~styles/style-one';

  .w-page {
    height: 100%;
    width: 100%;
  }

  .nvw-action-bar {
    color: #42b983;
  }

</style>
<style native lang="less">
  @import '~styles/style-one';
</style>
<%_   } _%>
<%_ } else { _%>
<%# -------------------- IS Using standard CSS -------------------- -%>
<style web>
  @import '~styles/style-one';

  .w-page {
    height: 100%;
    width: 100%;
  }

  .nvw-action-bar {
    color: #42b983;
  }
</style>
<style native>
  @import '~styles/style-one';
</style>
<%_ } _%>