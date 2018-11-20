
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
            <span>This is an about page</span>
        </div>
    </div>
</template>
  <%_ } else { _%>
<template>
    <Page>
        <!-- <ActionBar :title="navbarTitle"/> -->
        <GridLayout>
            <Label text="This is an about page" textWrap="true" horizontalAlignment="center" verticalAlignment="center" />
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
    <%# Is using NVW %>
<script>
  import { Page, GridLayout, Label } from 'nativescript-vue-web';

  export default {

    components: {
      Page,
      // ActionBar,
      GridLayout,
      // eslint-disable-next-line
      Label
    },
    data() {
      return {
        navbarTitle: 'About.vue',
      };
    },
  };
</script>
    <%_ } _%>
  <%_ } else { _%>
  <%# Is using TS %>
    <%_ if (!usingNVW) { _%>
<script lang="ts">
</script>
    <%_ } else { _%>
    <%# Is using NVW %>
<script lang="ts">
  import { Page, GridLayout, Label } from 'nativescript-vue-web';

  export default {

    components: {
      Page,
      // ActionBar,
      GridLayout,
      // eslint-disable-next-line
      Label
    },
    data() {
      return {
        navbarTitle: 'About.vue',
      };
    },
  };
</script>
    <%_ } _%>  
  <%_ } _%>
<%_ } else { _%>
  <%_ if (!usingTS) { _%>
    <%_ if (!usingNVW) { _%>
<script>
</script>
    <%_ } else { _%>
    <%# Is using NVW %>
<script>
  import { Page, GridLayout, Label } from 'nativescript-vue-web';

  export default {

    components: {
      Page,
      // ActionBar,
      GridLayout,
      // eslint-disable-next-line
      Label
    },
    data() {
      return {
        navbarTitle: 'About.vue',
      };
    },
  };
</script>
    <%_ } _%>
  <%_ } else { _%>
  <%# Is using TS %>
    <%_ if (!usingNVW) { _%>
<script lang="ts">
</script>
    <%_ } else { _%>
    <%# Is using NVW %>
<script lang="ts">
  import { Page, GridLayout, Label } from 'nativescript-vue-web';

  export default {

    components: {
      Page,
      // ActionBar,
      GridLayout,
      // eslint-disable-next-line
      Label
    },
    data() {
      return {
        navbarTitle: 'About.vue',
      };
    },
  };
</script>
    <%_ } _%>
  <%_ } _%>
<%_ } _%>

