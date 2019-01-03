<template>
  <GridLayout rows="auto, auto">
    <Label class="message" :text="msg" row="0" horizontalAlignment="center"/>
    <!-- copy-webpack-plugin copies asset from src/assets to project output/build directory /assets -->
    <Image src="~/components/icon.png" row="1" class="m-40"/>
  </GridLayout>
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
  }

  Image {
    height: 20%;
    width: 20%;
    margin-top: 20px;
  }
</style>
<%_ } else { _%>
<%# -------------------- IS Using stylus -------------------- -%>
<style scoped lang="stylus">
  .message
    color #42b983

  Image
    height 20%
    width 20%
    margin-top 20px
</style>
<%_ } _%>