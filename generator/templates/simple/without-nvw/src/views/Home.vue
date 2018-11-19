
<%_ if (!rootOptions.router) { _%>
  <%_ if (!usingNVW) { _%>
<template>
</template>
  <%_ } else { _%>
<template>
</template>
  <%_ } _%>
<%_ } else { _%>
  <%_ if (!usingNVW) { _%>
<template>
  <div class="w-page">
    <div class="w-container">
      <img src="~/assets/logo.png" alt="logo">
      <HelloWorld :msg="msg" />
    </div>
  </div>
</template>
  <%_ } else { _%>
<template>
  <Page>
    <!-- <ActionBar :title="navbarTitle"/> -->
    <GridLayout rows="auto, auto">
        <!-- copy-webpack-plugin copies asset from src/assets to project output/build directory /assets -->
        <Img src="~/assets/logo.png" row="0" class="m-20"/> 
        <HelloWorld :msg="msg" row="1" />
    </GridLayout>
    </Page>
</template>
  <%_ } _%>
<%_ } _%>

<%_ if (!rootOptions.router) { _%>
  <%_ if (!usingTS) { _%>
    <%_ if (!usingNVW) { _%>
<script>
</script>
    <%_ } else { _%>
<script>
</script>
    <%_ } _%>
  <%_ } else { _%>
    <%# Using TS %>
    <%_ if (!usingNVW) { _%>
<script lang="ts">
</script>
    <%_ } else { _%>
    <%# Is using NVW %>
<script lang="ts">
</script>
    <%_ } _%>  
  <%_ } _%>
<%_ } else { _%>
  <%_ if (!usingTS) { _%>
    <%_ if (!usingNVW) { _%>
<script>
  import HelloWorld from 'components/HelloWorld'

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
    <%_ } else { _%>
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
      HelloWorld,
    },
    data() {
      return {
        msg: 'Mode=' + process.env.TNS_APP_MODE + ' and Platform=' + process.env.TNS_APP_PLATFORM,
      };
    },
  };

</script>
    <%_ } else { _%>
    <%# Is using NVW %>
<script lang="ts">
  import { Page, GridLayout, Img } from 'nativescript-vue-web';
  import HelloWorld from 'components/HelloWorld.vue';

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
  img {
    height: 20%;
    width: 20%;
  }
</style>
<%_ } else { _%>
<style scoped lang="stylus">
  img
    height 20%
    width 20%
</style>
<%_ } _%>
