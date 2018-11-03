<%_ if (!rootOptions.router) { _%>
<template native>
  <Page>
    <ActionBar :title="navbarTitle"/>
    <GridLayout rows="auto, auto">
        <Image src="~/assets/logo.png" row="0" />
        <HelloWorld msg="Welcome to Your Vue.js App" row="1" />
    </GridLayout>
  </Page>
</template>
<template web>
  <div class="w-page">
    <nav>
      <ul class="w-navbar">
          <li class="w-title" :text="navbarTitle">{{navbarTitle}}</li>
      </ul>
    </nav>
    <div class="w-container">
      <img src="@/assets/logo.png" alt="logo" height="20%" width="20%">
      <HelloWorld msg="Welcome to Your Vue.js App" />
    </div>
  </div>
</template>
<script>
  // ~ is an alias to /src
  import HelloWorld from '~/components/HelloWorld.vue'

  export default {
    name: 'app',
    components: {
      HelloWorld
    },
    data() {
      return {
        navbarTitle: process.env.TNS_APP_MODE === 'native' ? 'NativeScript-Vue' : 'Web Vue',
      }
    },   
  }
  </script>
<%_ } else { _%>
<template native>
  <Page>
    <ActionBar title="NativeScript-Vue - App.vue"/>
    <GridLayout rows="auto, auto">
        <Button text="Home" @tap="goToHomePage" row="0"/>
        <Button text="About" @tap="goToAboutPage" row="1"/>
    </GridLayout>
  </Page>
</template>
<template web>
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
<script>
  // ~ is an alias to /src
  import Home from '~/views/Home.vue';
  import About from '~/views/About.vue';

  export default {

    data() {
      return {
        navbarTitle: process.env.TNS_APP_MODE === 'native' ? 'NativeScript-Vue' : 'Web Vue',
      }
    },    
    methods: {
      goToHomePage() {
        process.env.TNS_APP_MODE === 'native' ? this.$navigateTo(Home) : null;
      },
      goToAboutPage() {
        process.env.TNS_APP_MODE === 'native' ? this.$navigateTo(About): null;
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
  ActionBar, .w-navbar {
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
  ActionBar, .w-navbar
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
