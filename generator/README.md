# nativescript-vue-cli-plugin - Generator Readme

 It is __highly suggested__ that you copy/paste the `simple` template in its entirety and then rename the copied directory.  It will make it much easier for you to get starting using the existing logic in the generator.  Modifications to the existing generator logic will be considered for PR, but __rarely approved__ as the changes could break all pre-existing templates.

If you want to add additional templates to the plugin, then here's the information on how to do it:

1.  Create a new option to the prompt question #6 concerning which template you'd like to deploy.
    * The value for the template should be kept simple and easy.
2.  Create a new directory under `/generator/templates`. 
    * The directory name should __exactly match__ the value from #1.  For example if the value from #1 is `sidebar`, then the directory structure would be `/generator/templates/sidebar`
    * Add a `globals.d.ts` file.  This can be copied from the `simple` template directory
3.  The new template directory must have a `src` and an `app` directory within it.    
4.  Inside the `src` directory, you should add the following in an effort to give the template feature consistancy to the other templates:
    *  tsconfig.json
    *  router.js
    *  main.js
    *  App.vue
    *  views/About.vue (optional)
    *  views/Home.vue (optional)
    *  components/HelloWorld.vue (optional)
    *  assets/logo.png (optional, but highly encouraged to prove images are loading)
5.  Inside the `app` directory, you should add the following in an effort to give the template feature consistancy to the other templates:
    *  tsconfig.json
    *  package.json
    *  main.js
    *  App.native.vue
    *  App.ios.vue
    *  App.android.vue
    *  views/About.native.vue (optional)
    *  views/About.ios.vue (optional)
    *  views/About.android.vue (optional)
    *  views/Home.native.vue (optional)
    *  views/Home.ios.vue (optional)
    *  views/Home.android.vue (optional)
    *  components/HelloWorld.native.vue (optional)
    *  components/HelloWorld.ios.vue (optional)
    *  components/HelloWorld.android.vue (optional)
    *  assets/logo.png (optional, but highly encouraged to prove images are loading)

Concerning the `tsconfig.json` files.  These are necessary to ensure TypeScript enabled projects will work correctly.  If your directory structure within your template is different than what is in the `simple` template, then you will need to adjust your `tsconfig.json` files to account for those differences.  Again, it is __highly suggested__ that you don't deviate from the directory structure provided by the `simple` template.

Within the \*.vue files you will find [ejs](https://github.com/mde/ejs) syntax that will enable you to differentiate between TypeScript and non-TypeScript projects as well as projects that use Nativesript-Vue-Web and those that don't.  Any new templates added to the project __must__ demonstrate they work across these options or the PR to add the template will be rejected.  For the Native side of the template in the `app` directory, you won't have to wory about the Nativescript-Vue-Web option as that is only for the web side of the template in `src`.  However, you will have to account for TypeScript/non-Typescript in `app` and `src` template files.

If you add any of the optional files within the `app` directory structure, then you should make sure you have a \*.native.vue, \*.android.vue and \*.ios.vue example for each SFC.  It would also be beneficial within each of those to have a way to identify to the developer which file is being used at compile time.  Take a look at the `simple` template's `app\views\about.*.vue` examples to see a basic example of this.