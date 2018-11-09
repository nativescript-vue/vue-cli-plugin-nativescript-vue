<%_ if (rootOptions.router) { _%>
<template>
    <Page>
        <ActionBar :title="navbarTitle"/>
        <GridLayout>
            <Label text="This is an about page" textWrap="true" horizontalAlignment="center" verticalAlignment="center" />
        </GridLayout>
    </Page>
</template>
<script>
export default {

    data() {
      return {
        navbarTitle: 'About.native.vue',
      }
    },    
  }
</script>
<%_ } _%>
