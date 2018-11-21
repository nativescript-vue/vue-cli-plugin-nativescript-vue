<%_ if (rootOptions.router) { _%>
<template>
    <Page>
        <ActionBar :title="navbarTitle"/>
        <GridLayout>
            <Label text="This is an about page" textWrap="true" horizontalAlignment="center" verticalAlignment="center" />
        </GridLayout>
    </Page>
</template>
<%_ } _%>

<%_ if (rootOptions.router && !usingTS) { _%>
<script>
  export default {

    data() {
      return {
        navbarTitle: 'About.native.vue',
      };
    },
  };

</script>
<%_ } else if (rootOptions.router && usingTS){ _%>
<script lang="ts">
  export default {

    data() {
      return {
        navbarTitle: 'About.native.vue',
      };
    },
  };

</script>
<%_ } else { _%>
<%_ } _%>

