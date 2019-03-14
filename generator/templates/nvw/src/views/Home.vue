<template web>
  <Page>
    <GridLayout rows="auto, auto">
      <!-- copy-webpack-plugin copies asset from src/assets to project output/build directory /assets -->
      <Img src="~/assets/logo.png" row="0" class="m-20"/>
      <HelloWorld :msg="msg" row="1"/>
    </GridLayout>
  </Page>
</template>
<template native>
  <Page>
    <ActionBar :title="navbarTitle"/>
    <GridLayout rows="auto, auto">
      <!-- copy-webpack-plugin copies asset from src/assets to project output/build directory /assets -->
      <Image src="~/assets/logo.png" row="0" class="m-20"/>
      <HelloWorld :msg="msg" row="1"/>
    </GridLayout>
  </Page>
</template>
<%_ if (!usingTS) { _%>
<%# -------------------- Is Not Using TypeScript  -------------------- -%>
<script>
  import HelloWorld from 'components/HelloWorld';

  const { VUE_APP_MODE, VUE_APP_PLATFORM } = process.env;

  export default {
    name: 'home',
    components: {
      HelloWorld,
    },
    data() {
      return {
        navbarTitle: `Home.vue`,
        msg: `Mode=${VUE_APP_MODE} and Platform=${VUE_APP_PLATFORM}`
      };
    }
  };

</script>
<%_ } else { _%>
<%# -------------------- Is Using TypeScript  -------------------- -%>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import HelloWorld from 'components/HelloWorld.vue';

  const { VUE_APP_MODE, VUE_APP_PLATFORM } = process.env;

  @Component({
    name: 'home',
    components: {
      HelloWorld,
    },
  })
  export default class Home extends Vue {
    private navbarTitle: string = 'Home.vue';
    private msg: string = `Mode=${VUE_APP_MODE} and Platform=${VUE_APP_PLATFORM}`;
  }

</script>
<%_ } _%>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<%_ if (rootOptions.cssPreprocessor) { _%>
<%_   if (rootOptions.cssPreprocessor == 'sass' || rootOptions.cssPreprocessor == 'scss') { _%>
<%#   -------------------- IS Using scss OR sass -------------------- -%>
<%- rootOptions.cssPreprocessor
    ? `<style scoped lang="${
        rootOptions.cssPreprocessor === 'sass'
          ? 'scss'
          : rootOptions.cssPreprocessor
      }"` + `>`
    : ``
%>
  @import '~styles/style-one';
  @import '~styles/style-two';

  img, Image {
    display: block;
    margin: auto;
    margin-top: 4em;
  }

  Image {
    height: 20%;
    width: 20%;
  }
</style>
<%_   } else if (rootOptions.cssPreprocessor == 'stylus') { _%>
<%#   -------------------- IS Using stylus -------------------- -%>
<style scoped lang="stylus">
  @import '~styles/style-one';
  @import '~styles/style-two';

  img, Image
    height 20%
    width 20%
    display block
    margin auto
    margin-top 4em
  
  Image
    height 20%
    width 20%
</style>
<%_   } else if (rootOptions.cssPreprocessor == 'less') { _%>
<%#   -------------------- IS Using Less -------------------- -%>
<style scoped lang="less">
  @import '~styles/style-one';
  @import '~styles/style-two';

  img, Image {
    display: block;
    margin: auto;
    margin-top: 4em;
  }

  Image {
    height: 20%;
    width: 20%;
  }
</style>
<%_   } _%>
<%_ } else { _%>
<%# -------------------- IS Using standard CSS -------------------- -%>
<style scoped>
  @import '~styles/style-one';
  @import '~styles/style-two';

  img, Image {
    display: block;
    margin: auto;
    margin-top: 4em;
  }

  Image {
    height: 20%;
    width: 20%;
  }
</style>
<%_ } _%>
