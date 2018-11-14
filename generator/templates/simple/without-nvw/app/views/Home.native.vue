<%_ if (rootOptions.router) { _%>
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

<%_ if (rootOptions.router && !usingTS) { _%>
<script>
  //aliased to src/components
  import HelloWorld from '~/components/HelloWorld.native.vue';

  export default {
    name: 'home',
    components: {
      HelloWorld
    },
    data () {
      return {
        navbarTitle: 'Home.native.vue',
        msg: 'Mode=' + process.env.TNS_APP_MODE + ' and Platform=' + process.env.TNS_APP_PLATFORM
      };
    }
  };

</script>
<%_ } else if (rootOptions.router && usingTS){ _%>
<script lang="ts">

  import HelloWorld from '~/components/HelloWorld.native.vue';

  export default {
    name: 'home',
    components: {
      HelloWorld
    },
    data () {
      return {
        navbarTitle: 'Home.native.vue',
        msg: 'Mode=' + process.env.TNS_APP_MODE + ' and Platform=' + process.env.TNS_APP_PLATFORM
      };
    }
  };

</script>
<%_ } else { _%>
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
  Image {
    height: 50%;
    width: 50%;
  }
</style>
<%_ } else { _%>
<style scoped lang="stylus">
  Image
    height 50%
    width 50%
</style>
<%_ } _%>
