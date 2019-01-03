<%_ if (rootOptions.router) { _%>
<%# -------------------- IS Using vue-router  -------------------- -%>
<template>
  <div class="w-page">
    <nav>
      <ul class="w-navbar">
        <li class="w-title" :text="navbarTitle">{{navbarTitle}}</li>
      </ul>
    </nav>
    <div class="w-container">
      <router-link tag="button" class="w-button" id="homeButton" to="/">Home</router-link>
      <router-link tag="button" class="w-button" id="aboutButton" to="/about">About</router-link>
      <router-view/>
    </div>
  </div>
</template>
<%_ } else { _%>
<%# -------------------- IS NOT Using vue-router  -------------------- -%>
<template>
  <div class="w-page">
    <div class="w-container">
      <img src="~/assets/logo.png" alt="logo" height="20%" width="20%">
      <HelloWorld :msg="msg"/>
    </div>
  </div>
</template>
<%_ } _%>
<%_ if (!usingTS && rootOptions.router) { _%>
<%# -------------------- IS NOT Using TypeScript AND IS Using vue-router  -------------------- -%>
<script>
  export default {
    data() {
      return {
        navbarTitle: 'App.vue'
      };
    }
  };
</script>
<%_ } else if (!usingTS && !rootOptions.router) { _%>
<%# -------------------- IS NOT Using TypeScript AND IS NOT Using vue-router  -------------------- -%>
<script>
  import HelloWorld from 'components/HelloWorld';
  export default {
    name: 'home',
    components: {
      HelloWorld
    },
    data() {
      return {
        msg: 'Mode=' + TNS_APP_MODE + ' and Platform=' + TNS_APP_PLATFORM,
      };
    },
  };
</script>
<%_ } else if (usingTS && rootOptions.router) { _%>
<%# -------------------- IS Using TypeScript AND IS Using vue-router  -------------------- -%>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  @Component
  export default class App extends Vue {
    private navbarTitle: string = 'App.vue';
  }

</script>
<%_ } else if (usingTS && !rootOptions.router) { _%>
<%# -------------------- IS Using TypeScript AND IS NOT Using vue-router  -------------------- -%>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import HelloWorld from 'components/HelloWorld.vue';

  @Component({
    name: 'home',
    components: {
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
    ? `<style lang="${
        rootOptions.cssPreprocessor === 'sass'
          ? 'scss'
          : rootOptions.cssPreprocessor
      }"` + `>`
    : ``
%>
  @import 'styles/style-one';

  .w-page {
    height: 100%;
    width: 100%;
  }

  .w-navbar {
    position: fixed;
    z-index: 10000;
    height: 3em;
    width: 100%;
    top: 0px;
    left: 0px;
    margin: auto;
    list-style: none;

    display: flex;
    align-items: center;
    padding: 0 10px;

    -webkit-box-shadow: -8px 8px 6px -7px #999;
    -moz-box-shadow: -8px 8px 6px -7px #999;
    box-shadow: -8px 8px 6px -7px #999;

    .w-title {
        margin-left: auto;
        margin-right: auto;
    }
  }

  .w-container {
    height: 100%;
    width: 100%;
    padding-top: 3em;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: top;
    align-items: center;


    .w-button {
      width: 50%;
      height: 2em;
      margin: .25em;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #d7d7d7;
      border-width: 0px;
      font-weight: 600;
      border-radius: 3px;
    }

  }
</style>
<%_ } else { _%>
<%# -------------------- IS Using stylus -------------------- -%>
<style lang="stylus">

  .w-navbar
    color #42b983

  .w-page
    height 100%
    width 100%

  .w-navbar
    position fixed
    z-index 10000
    height 3em
    width 100%
    top 0px
    left 0px
    margin auto
    list-style none
    display flex
    align-items center
    padding 0 10px
    -webkit-box-shadow -8px 8px 6px -7px #999
    -moz-box-shadow -8px 8px 6px -7px #999
    box-shadow -8px 8px 6px -7px #999

    .w-title
      margin-left auto
      margin-right auto

  .w-container
    height 100%
    width 100%
    padding-top 3em
    position relative
    overflow hidden
    display flex
    flex-direction column
    justify-content top
    align-items center

    .w-button
      width 50%
      height 2em
      margin 0.25em
      display flex
      justify-content center
      align-items center
      background-color #d7d7d7
      border-width 0px
      font-weight 600
      border-radius 3px
</style>
<%_ } _%>