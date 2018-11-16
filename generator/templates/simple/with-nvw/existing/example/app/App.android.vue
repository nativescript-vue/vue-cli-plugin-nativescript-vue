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
<script>
  // ~ is an alias to /src
  import Home from '~/views/Home';
  import About from '~/views/About';

  export default {

    data() {
      return {
        navbarTitle: 'App.android.vue',
      }
    },    
    methods: {
      goToHomePage() {
        this.$navigateTo(Home);
      },
      goToAboutPage() {
        this.$navigateTo(About);
      }
    }
  }

</script>
<%_ } else { _%>
<%# This code is the same as not having a router. #%>
<%# See note above #%>
<template>
  <Page>
    <ActionBar :title="navbarTitle"/>
    <GridLayout rows="auto, auto">
        <Button text="Home" @tap="goToHomePage" row="0"/>
        <Button text="About" @tap="goToAboutPage" row="1"/>
    </GridLayout>
  </Page>
</template>
<script>
  // ~ is an alias to /src
  import Home from '~/views/Home';
  import About from '~/views/About';

  export default {

    data() {
      return {
        navbarTitle: 'App.android.vue',
      }
    },    
    methods: {
      goToHomePage() {
        this.$navigateTo(Home);
      },
      goToAboutPage() {
        this.$navigateTo(About);
      }
    }
  }

</script>
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
