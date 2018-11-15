<template>
    <div>
      <div class="message">{{msg}}</div>
      <img src="~/assets/logo.png" alt="logo">
    </div>
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
    display: block;
    margin: auto;
    margin-top: 4em;
    text-align: center;
  }

  img {
    height: 20%;
    width: 20%;
    display: block;
    margin: auto;
    margin-top: 4em;
  }
</style>
<%_ } else { _%>
<style scoped lang="stylus">
  .message
    color #42b983
    display block
    margin auto 
    margin-top 4em
    text-align center

  .img
    height 20%
    width 20%
    display block
    margin auto
    margin-top 4em
</style>
<%_ } _%>