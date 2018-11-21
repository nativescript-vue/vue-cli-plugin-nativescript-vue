<%_ if (!rootOptions.router) { _%>
<%# This code is the same as having a router. #%>
<%# Setting this space aside for future possible use in the template  #%>
<template>
  <Page>
    <ActionBar :title="navbarTitle"/>
    <GridLayout rows="auto, auto">
        <Button text="Home" @tap="goToHomePage" row="0"/>
        <Button text="About" @tap="goToAboutPage" row="1"/>
    </GridLayout>
  </Page>
</template>
<%_ } else { _%>
<template>
  <Page>
    <ActionBar :title="navbarTitle"/>
    <GridLayout rows="auto, auto">
        <Button text="Home" @tap="goToHomePage" row="0"/>
        <Button text="About" @tap="goToAboutPage" row="1"/>
    </GridLayout>
  </Page>
</template>
<%_ } _%>

<%_ if (!rootOptions.router && !usingTS) { _%>
<script></script>
  import Home from '~/views/Home';
  import About from '~/views/About';

  export default {

    data() {
      return {
        navbarTitle: 'App.ios.vue',
      };
    },
    methods: {
      goToHomePage() {
        this.$navigateTo(Home);
      },
      goToAboutPage() {
        this.$navigateTo(About);
      },
    },
  };

</script>
<%_ } else if (!rootOptions.router && usingTS) { _%>
<script lang="ts">
  import Home from '~/views/Home.ios.vue';
  import About from '~/views/About.ios.vue';

  export default {

    data() {
      return {
        navbarTitle: 'App.ios.vue',
      };
    },
    methods: {
      goToHomePage() {
        (this as any).$navigateTo(Home);
      },
      goToAboutPage() {
        (this as any).$navigateTo(About);
      },
    },
  };

</script>
<%_ } else if (rootOptions.router && !usingTS){ _%>
<script>

  import Home from '~/views/Home';
  import About from '~/views/About';

  export default {

    data() {
      return {
        navbarTitle: 'App.ios.vue',
      };
    },
    methods: {
      goToHomePage() {
        this.$navigateTo(Home);
      },
      goToAboutPage() {
        this.$navigateTo(About);
      },
    },
  };

</script>
<%_ } else if (rootOptions.router && usingTS){ _%>
<script lang="ts">

  import Home from '~/views/Home.ios.vue';
  import About from '~/views/About.ios.vue';

  export default {

    data() {
      return {
        navbarTitle: 'App.ios.vue',
      };
    },
    methods: {
      goToHomePage() {
        (this as any).$navigateTo(Home);
      },
      goToAboutPage() {
        (this as any).$navigateTo(About);
      },
    },
  };

</script>
<%_ } else { _%>
<%_ } _%>


<%_ if (rootOptions.cssPreprocessor !== 'stylus') { _%>
<style<%-
  rootOptions.cssPreprocessor
    ? ` lang="${
        rootOptions.cssPreprocessor === 'sass'
          ? 'scss'
          : rootOptions.cssPreprocessor
      }"`
    : ``
%>>
  ActionBar {
    color: #42b983;
  }
</style>
<%_ } else { _%>
<style lang="stylus">
  ActionBar
    color: #42b983
</style>
<%_ } _%>
