<%_ if (rootOptions.router) { _%>
<template native>
  <Page>
    <ActionBar title="NativeScript-Vue - Home.vue"/>
    <GridLayout rows="auto, auto">
        <Image src="~/assets/logo.png" row="0" class="m-20"/>
        <HelloWorld msg="Welcome to Your Vue.js App" row="1" />
    </GridLayout>
    </Page>
</template>
<template web>
  <div class="w-page">
    <div class="w-container">
      <img src="@/assets/logo.png" alt="logo" height="20%" width="20%">
      <HelloWorld msg="Welcome to Your Vue.js App" />
    </div>
  </div>
</template>
<script>
  // ~ is an alias to /src
  import HelloWorld from '~/components/HelloWorld.vue'

  export default {
    name: 'home',
    components: {
      HelloWorld
    }
  }
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
