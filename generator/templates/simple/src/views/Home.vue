<%_ if (rootOptions.router) { _%>
<template>
    <GridLayout rows="auto, auto">
        <Image src="../assets/logo.png" row="0" />
        <HelloWorld msg="Welcome to Your Vue.js App" row="1" />
    </GridLayout>
</template>

<script>
  // @ is an alias to /src
  import HelloWorld from '@/components/HelloWorld.vue'

  export default {
    name: 'home',
    components: {
      HelloWorld
    }
  }
</script>
<%_ } _%>
