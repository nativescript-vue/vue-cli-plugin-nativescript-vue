<template>
    <GridLayout>
        <Label class="message" :text="msg" row="0" />
    </GridLayout>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

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
.message {
  color: #42b983;
}
</style>
<%_ } else { _%>
<style scoped lang="stylus">
.message
  color #42b983
</style>
<%_ } _%>