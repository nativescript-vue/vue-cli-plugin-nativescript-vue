<template>
  <div class="w-page">
    <div class="w-container">
      <img src="~/assets/logo.png" alt="logo">
      <HelloWorld :msg="msg"/>
    </div>
  </div>
</template>
<%_ if (!usingTS) { _%>
<%# -------------------- Is Not Using TypeScript  -------------------- -%>
<script>
  import HelloWorld from 'components/HelloWorld';

  export default {
    name: 'home',
    components: {
      HelloWorld
    },
    data() {
      return {
        msg: 'Mode=' + TNS_APP_MODE + ' and Platform=' + TNS_APP_PLATFORM
      };
    }
  };

</script>
<%_ } else { _%>
<%# -------------------- Is Using TypeScript  -------------------- -%>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import HelloWorld from 'components/HelloWorld.vue';

  @Component({
    name: 'home',
    components: {
      HelloWorld,
    },
  })
  export default class Home extends Vue {
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
  img {
    height: 20%;
    width: 20%;
    display: block;
    margin: auto;
    margin-top: 4em;
  }
</style>
<%_ } else { _%>
<%# -------------------- IS Using stylus -------------------- -%>
<style scoped lang="stylus">

  img
    height 20%
    width 20%
    display block
    margin auto
    margin-top 4em
</style>
<%_ } _%>