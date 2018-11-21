<template>
    <GridLayout rows="auto, auto">
        <Label class="message" :text="msg" row="0" horizontalAlignment="center" />
        <!-- copy-webpack-plugin copies asset from src/assets to project output/build directory /assets -->
        <Image src="~/assets/logo.png" row="1" class="m-40" />
    </GridLayout>
</template>

<%_ if (!usingTS) { _%>
<script>
  export default {
    name: 'HelloWorld',
    props: {
      msg: String,
    },
  };

</script>
<%_ } else { _%>
<script lang="ts">
  export default {
    name: 'HelloWorld',
    props: {
      msg: String,
    },
  };

</script>
<%_ } _%>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<%_ if (rootOptions.cssPreprocessor !== 'stylus') { _%>
<style scoped<%-
  rootOptions.cssPreprocessor
    ? ` lang="${
        rootOptions.cssPreprocessor === 'sass'
          ? 'scss'
          : rootOptions.cssPreprocessor
      }"`
    : ``
%>>
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
<style scoped lang="stylus">
  .message
    color #42b983

  Image 
    height 20%
    width 20%
    margin-top 20px
  
</style>
<%_ } _%>