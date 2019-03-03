# nativescript-vue-cli-plugin - Generator Readme

Want to submit a PR for a new template?  Read below.

It is __highly, highly, highly suggested__ that you copy/paste the `simple` template in its entirety and then rename the copied directory.  It will make it much easier for you to get started using the existing logic in the generator.  Modifications to the existing generator logic will be considered for PR, but will have to go through rigourous testing to ensure the changes do not break all pre-existing templates.

If you want to add additional templates to the plugin, then here's the information on how to do it:

1.  Create a new option to the prompt question #5 concerning which template you'd like to deploy.
    * The value for the template should be kept simple and easy.
2.  Create a new directory under `/generator/templates`. 
    * The directory name should __exactly match__ the value from #1.  For example if the value from #1 is `simple`, then the directory structure would be `/generator/templates/simple`
3.  The new template directory __must__ have a single first-level subdirectory named `src`.  
4.  Inside the `src` directory, you should add the following in an effort to give the template feature consistancy to the other templates:
    *  router.js
    *  main.js 
    *  main.native.js (the NS-Vue project entry point)
    *  package.json (this is the standard NativeScript-Vue package.json file.  Just copy/paste from the simple template)
    *  App.vue
    *  views/About.vue (optional)
    *  views/Home.vue (optional)
    *  components/HelloWorld.vue (optional)
    *  components/HelloWorld.native.vue (optional)
    *  components/HelloWorld.ios.vue (optional)
    *  components/HelloWorld.android.vue (optional)
    *  assets/logo.png (optional, but highly encouraged to prove images are loading)

Within the \*.vue files you will find [ejs](https://github.com/mde/ejs) syntax that will enable you to differentiate between TypeScript and non-TypeScript projects.  Any new templates added to the project __must__ demonstrate they work across these options or the PR to add the template will be rejected.  

### Word of warning concerning using EJS templates with Prettier 
Prettier does not support EJS templates and if you have Prettier automatically fix all issues in a `*.vue` template file, then you will run the risk of it overwriting sections of the template from one `if` statement to the `else` side of the statement. Pay close attention to this specifically in your `script` tags as it relates to the TypeScript vs. non-TypeScript parts of the template.  Whichever one comes first in the `if` statement will overwrite the section after the `else` statement. 

