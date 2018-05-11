<%_ if (!rootOptions.router) { _%>
<template>
  <Page>
    <ActionBar title="NativeScript-Vue"/>
    <GridLayout rows="auto, auto">
        <Image src="./assets/logo.png" row="0" />
        <HelloWorld msg="Welcome to Your Vue.js App" row="1" />
    </GridLayout>
  </Page>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'app',
  components: {
    HelloWorld
  }
}
</script>
<%_ } else { _%>
<template>
  <Page>
    <ActionBar title="NativeScript-Vue"/>
    <GridLayout rows="auto, auto, *">
        <Button text="Home" @tap="$router.replace('/')" />
        <Button text="About" @tap="$router.replace('/about')" />

        <router-view row="2" />
    </GridLayout>
  </Page>
</template>
<%_ } _%>

<%_ if (rootOptions.cssPreprocessor !== 'stylus') { _%>
<style<%-
  rootOptions.cssPreprocessor
    ? ` lang="${
        rootOptions.cssPreprocessor === 'sass'
          ? 'scss'
          : rootOptions.cssPreprocessor
      }"`
    : ``
%>>
ActionBar {
  color: #42b983;
}
</style>
<%_ } else { _%>
<style lang="stylus">
ActionBar
  color #42b983
</style>
<%_ } _%>
