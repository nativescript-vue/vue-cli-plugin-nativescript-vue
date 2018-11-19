<%_ if (!rootOptions.router) { _%>
  <%_ if (!usingNVW) { _%>
<template>  
  <div class="w-page">
    <div class="w-container">
      <img src="~/assets/logo.png" alt="logo" height="20%" width="20%">
      <HelloWorld :msg="msg" />
    </div>
  </div>
</template>
  <%_ } else { _%>
  <%# Using NVW %>
<template>
  <Page>
    <ActionBar :title="navbarTitle"/>
    <GridLayout rows="auto, auto">
        <!-- copy-webpack-plugin copies asset from src/assets to project output/build directory /assets -->
        <Image src="~/assets/logo.png" row="0" class="m-20"/> 
        <HelloWorld :msg="msg" row="1" />
    </GridLayout>
    </Page>
</template>
  <%_ } _%>
<%_ } else { _%>
  <%# Using vue-router %>
  <%_ if (!usingNVW) { _%>
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
  <%# Using NVW %>
<template>
  <Page>
    <ActionBar :title="navbarTitle"/>
    <GridLayout rows="auto, auto">
        <Button text="Home" @tap="goToHomePage" row="0"/>
        <Button text="About" @tap="goToAboutPage" row="1"/>
    </GridLayout>
    <router-view />
  </Page>
</template>
  <%_ } _%>
<%_ } _%>
<%_ if (!rootOptions.router) { _%>
  <%_ if (!usingTS) { _%>
    <%_ if (!usingNVW) { _%>
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
    <%_ } else { _%>
    <%# Using NVW %>
<script>
  import { Page, GridLayout, Img } from 'nativescript-vue-web';
  import HelloWorld from '~/components/HelloWorld.vue';

  export default {
    name: 'home',
    components: {
      HelloWorld,
      Page,
      // ActionBar,
      GridLayout,
      // eslint-disable-next-line
      Img,
    },
    data() {
      return {
        navbarTitle: 'Home.vue',
        msg: 'Mode=' + process.env.TNS_APP_MODE + ' and Platform=' + process.env.TNS_APP_PLATFORM,
      };
    },
  };

</script>
    <%_ } _%>
  <%_ } else { _%>
  <%# Using TS %>
    <%_ if (!usingNVW) { _%>
<script lang="ts">
  import HelloWorld from 'components/HelloWorld.vue';

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
    <%_ } else { _%>
    <%# Is using NVW %>
<script lang="ts">
  import HelloWorld from 'components/HelloWorld.vue';

  export default {
    name: 'home',
    components: {
      HelloWorld,
    },
    data() {
      return {
        msg: 'Mode=' + process.env.TNS_APP_MODE + ' and Platform=' + process.env.TNS_APP_PLATFORM,
      };
    },
  };

</script>
    <%_ } _%>  
  <%_ } _%>
<%_ } else { _%>
  <%_ if (!usingTS) { _%>
    <%_ if (!usingNVW) { _%>
<script>

  export default {

    data() {
      return {
        navbarTitle: 'App.vue not typescript',
      };
    },
  };

</script>
    <%_ } else { _%>
<script>
  import { Page, ActionBar, GridLayout, Button } from 'nativescript-vue-web';
  
  export default {

    components: {
      Page,
      ActionBar,
      GridLayout,
      // eslint-disable-next-line
      Button,
    },
    data() {
      return {
        navbarTitle: 'App.vue',
      };
    },
    methods: {
      goToHomePage() {
        this.$router.push('home');
      },
      goToAboutPage() {
        this.$router.push('about');
      },
    },
  };
</script>
    <%_ } _%>
  <%_ } else { _%>
    <%# Using TS %>
    <%_ if (!usingNVW) { _%>
<script lang="ts">

  export default {

    data() {
      return {
        navbarTitle: 'App.vue with TS',
      };
    },
  };

</script>
    <%_ } else { _%>
    <%# Is using NVW %>
<script lang="ts">
  import { Page, ActionBar, GridLayout, Button } from 'nativescript-vue-web';
  
  export default {

    components: {
      Page,
      ActionBar,
      GridLayout,
      // eslint-disable-next-line
      Button,
    },
    data() {
      return {
        navbarTitle: 'App.vue',
      };
    },
    methods: {
      goToHomePage() {
        (this as any).$router.push('home');
      },
      goToAboutPage() {
        (this as any).$router.push('about');
      },
    },
  };
</script>
    <%_ } _%>
  <%_ } _%>
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
  .w-navbar {
    color: #42b983;
  }

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
<style lang="stylus">
  .w-navbar
    color: #42b983
  .w-page
    height: 100%
    width: 100%
  .w-navbar
    position: fixed
    z-index: 10000
    height: 3em
    width: 100%
    top: 0px
    left: 0px
    margin: auto
    list-style: none
    display: flex
    align-items: center
    padding: 0 10px
    -webkit-box-shadow: -8px 8px 6px -7px #999
    -moz-box-shadow: -8px 8px 6px -7px #999
    box-shadow: -8px 8px 6px -7px #999
    .w-title
      margin-left: auto
      margin-right: auto
  .w-container
    height: 100%
    width: 100%
    padding-top: 3em
    position: relative
    overflow: hidden
    display: flex
    flex-direction: column
    justify-content: top
    align-items: center
    .w-button
      width: 50%
      height: 2em
      margin: .25em
      display: flex
      justify-content: center
      align-items: center
      background-color: #d7d7d7
      border-width: 0px
      font-weight: 600
      border-radius: 3px
</style>
<%_ } _%>
