<template>
  <div>
    <div class="message">{{msg}}</div>
    <img src="~/components/icon.png" alt="logo">
  </div>
</template>
<%_ if (!usingTS) { _%>
<%# -------------------- Is Not Using TypeScript  -------------------- -%>
<script>
  export default {
    name: 'HelloWorld',
    props: {
      msg: String
    }
  };
</script>
<%_ } else { _%>
<%# -------------------- Is Using TypeScript  -------------------- -%>
<script lang="ts">
  import { Component, Vue, Prop } from 'vue-property-decorator';

  @Component({
    name: 'HelloWorld'
  })
  export default class HelloWorld extends Vue {
    @Prop(String) private msg!: string;
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
  .message {
    color: #42b983;
    display: block;
    margin: auto;
    margin-top: 4em;
    text-align: center;
  }
  img {
    height: 75px;
    display: block;
    margin: auto;
    margin-top: 4em;
  }
</style>
<%_ } else { _%>
<%# -------------------- IS Using stylus -------------------- -%>
<style scoped lang="stylus">
  .message
    color #42b983
    display block
    margin auto
    margin-top 4em
    text-align center

  img
    height 75px
    display block
    margin auto
    margin-top 4em
</style>
<%_ } _%>