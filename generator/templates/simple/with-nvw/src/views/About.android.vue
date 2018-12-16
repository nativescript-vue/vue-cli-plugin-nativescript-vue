<template>
  <Page>
    <ActionBar :title="navbarTitle"/>
    <GridLayout>
      <Label text="This is an about page" textWrap="true" horizontalAlignment="center" verticalAlignment="center"/>
    </GridLayout>
  </Page>
</template>
<%_ if (!usingTS) { _%>
<script>
  export default {
    data() {
      return {
        navbarTitle: 'About.android.vue'
      };
    }
  };
</script>
<%_ } else { _%>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  @Component({
    name: 'about',
  })
  export default class About extends Vue {
    private navbarTitle: string = 'About.android.vue';
  }

</script>
<%_ } _%>

