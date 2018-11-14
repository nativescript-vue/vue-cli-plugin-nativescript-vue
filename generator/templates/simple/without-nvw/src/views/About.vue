<%_ if (rootOptions.router) { _%>
<template>
    <div class="w-page">
        <div class="w-container">
            <span>This is an about page</span>
        </div>
    </div>
</template>
<%_ } _%>
<%_ if (rootOptions.router && !usingTS) { _%>
<script>

</script>
<%_ } else if (rootOptions.router && usingTS){ _%>
<script lang="ts">

</script>
<%_ } else { _%>
<%_ } _%>
