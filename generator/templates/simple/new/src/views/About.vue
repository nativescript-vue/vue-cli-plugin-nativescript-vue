<%_ if (rootOptions.router) { _%>
<template native>
    <Page>
        <ActionBar title="NativeScript-Vue - About.vue"/>
        <GridLayout>
            <Label text="This is an about page" textWrap="true" horizontalAlignment="center" verticalAlignment="center" />
        </GridLayout>
    </Page>
</template>
<template web>
  <div class="w-page">
    <div class="w-container">
        <span>This is an about page</span>
    </div>
  </div>
</template>
<%_ } _%>
