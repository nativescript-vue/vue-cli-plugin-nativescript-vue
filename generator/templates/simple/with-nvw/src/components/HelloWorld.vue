<template>
  <GridLayout rows="auto, auto">
    <Label class="message" :text="msg" row="0" horizontalAlignment="center"/>
    <!-- copy-webpack-plugin copies asset from src/assets to project output/build directory /assets -->
    <Img src="~/components/icon.png" row="1" class="m-40"/>
  </GridLayout>
</template>
<%_ if (!usingTS) { _%>
<%# -------------------- Is Not Using TypeScript  -------------------- -%>
<script>
  import { GridLayout, Label, Img } from 'nativescript-vue-web';

  export default {
    name: 'HelloWorld',
    components: {
      GridLayout,
      Label,
      Img,
    },
    props: {
      msg: String
    }
  };
</script>
<%_ } else { _%>
<%# -------------------- Is Using TypeScript  -------------------- -%>
<script lang="ts">
  import { Component, Vue, Prop } from 'vue-property-decorator';
  import { GridLayout, Label, Img } from 'nativescript-vue-web';

  @Component({
    name: 'HelloWorld',
    components: {
      GridLayout,
      Label,
      Img,
    },
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