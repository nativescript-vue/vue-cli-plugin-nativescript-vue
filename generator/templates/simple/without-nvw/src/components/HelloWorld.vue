<%_ if (!usingNVW) { _%>
<template>
    <div>
      <div class="message">{{msg}}</div>
      <img src="~/assets/logo.png" alt="logo">
    </div>
</template>
<%_ } else if (usingNVW){ _%>
<template>
    <GridLayout rows="auto, auto">
        <Label class="message" :text="msg" row="0" horizontalAlignment="center" />
        <!-- copy-webpack-plugin copies asset from src/assets to project output/build directory /assets -->
        <Img src="~/assets/logo.png" row="1" class="m-40" />
    </GridLayout>
</template>
<%_ } else { _%>
<%_ } _%>
<%_ if (!usingTS) { _%>
  <%_ if (!usingNVW) { _%>
<script>
  export default {
    name: 'HelloWorld',
    props: {
      msg: String,
    },
  };

</script>
  <%_ } else { _%>
  <%# Is using NVW %>
<script>
  import { GridLayout, Label, Img } from 'nativescript-vue-web';

  export default {
    name: 'HelloWorld',
    components: {
      GridLayout,
      // eslint-disable-next-line
      Label,
      // eslint-disable-next-line
      Img,
    },
    props: {
      msg: String,
    },
  };
</script>
  <%_ } _%>
<%_ } else { _%><%# Is Using TS %>
  <%_ if (!usingNVW) { _%>
<script lang="ts">
  export default {
    name: 'HelloWorld',
    props: {
      msg: String,
    },
  };
</script>
  <%_ } else { _%><%# Is using NVW %>
<script lang="ts">
  import { GridLayout, Label, Img } from 'nativescript-vue-web';

  export default {
    name: 'HelloWorld',
    components: {
      GridLayout,
      // eslint-disable-next-line
      Label,
      // eslint-disable-next-line
      Img,
    },
    props: {
      msg: String,
    },
  };
</script>
  <%_ } _%>  
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

  <%_ if (!usingNVW) { _%>
  img {
    height: 20%;
    width: 20%;
    display: block;
    margin: auto;
    margin-top: 4em;
  }
  <%_ } else { _%>
  <%# Is using NVW %>
  img {
    display: block;
    margin: auto;
    margin-top: 4em;
  }
  <%_ } _%>
</style>
<%_ } else { _%>
<style scoped lang="stylus">
  .message
    color #42b983
    display block
    margin auto 
    margin-top 4em
    text-align center
<%_ if (!usingNVW) { _%>
  .img
    height 20%
    width 20%
    display block
    margin auto
    margin-top 4em
  <%_ } else { _%>
  <%# Is using NVW %>
  .img
    display block
    margin auto
    margin-top 4em
  <%_ } _%></style>
<%_ } _%>