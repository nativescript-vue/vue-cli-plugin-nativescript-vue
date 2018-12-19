# nativescript-vue-cli-plugin - Generator Readme

 It is __highly, highly, highly suggested__ that you copy/paste the `simple` template in its entirety and then rename the copied directory.  It will make it much easier for you to get started using the existing logic in the generator.  Modifications to the existing generator logic will be considered for PR, but will have to go through rigourous testing to ensure the changes do not break all pre-existing templates.

If you want to add additional templates to the plugin, then here's the information on how to do it:

1.  Create a new option to the prompt question #6 concerning which template you'd like to deploy.
    * The value for the template should be kept simple and easy.
2.  Create a new directory under `/generator/templates`. 
    * The directory name should __exactly match__ the value from #1.  For example if the value from #1 is `sidebar`, then the directory structure would be `/generator/templates/sidebar`
3.  The new template directory __must__ have a first-level subdirectory named `without-nvw`.  4.  Within the `without-nvw` directory, it should have the following:
    * `src` directory
    * `app` directory
    * `tsconfig.native.json` & `tsconfig.web.json` (so as to enable TypeScript support)
5.  Inside the `without-nvw\src` directory, you should add the following in an effort to give the template feature consistancy to the other templates:
    *  router.js
    *  main.js
    *  App.vue
    *  views/About.vue (optional)
    *  views/Home.vue (optional)
    *  components/HelloWorld.vue (optional)
    *  assets/logo.png (optional, but highly encouraged to prove images are loading)
5.  Inside the `without-nvw\app` directory, you should add the following in an effort to give the template feature consistancy to the other templates:
    *  package.json (as usual for Nativescript-Vue projects)
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

If you want to include support for `Nativescript-Vue-Web` within your template, then you can also follow the pattern included in the `simple` template.  You will need to:
1.  Add a first-level subdirectory named `with-nvw`.
2.  Within the `with-nvw` directory you will only need to add a `src` directory.  You will __not__ need an `app` directory.  Again, follow the `simple` template pattern.
3.  Within `src`, you will essentially merge everything that is in the `without-nvw` side of the template.  The one main difference is that the `main.js` file from the `app` directory will have to be named `main.native.js`.

Concerning the two `tsconfig` files in the base of the template directory.  These are necessary to ensure TypeScript enabled projects will work correctly.  If your directory structure within your template is different than what is in the `simple` template, then you will need to adjust the two `tsconfig` files to account for those differences.  Again, it is __highly encouraged__ that you don't deviate from the directory structure provided by the `simple` template.

If you add any of the optional files within the `app` directory structure, then you should make sure you have a \*.native.vue, \*.android.vue and \*.ios.vue example for each SFC.  It would also be beneficial within each of those to have a way to identify to the developer which file is being used at compile time.  Take a look at the `simple` template's `app\views\about.*.vue` examples to see a basic example of this.

Within the \*.vue files you will find [ejs](https://github.com/mde/ejs) syntax that will enable you to differentiate between TypeScript and non-TypeScript projects.  Any new templates added to the project __must__ demonstrate they work across these options or the PR to add the template will be rejected.  

### Word of warning concerning using EJS templates with Prettier 
Prettier does not support EJS templates and if you have Prettier automatically fix all issues in a `*.vue` file, then you will run the risk of it overwriting sections of the template from one `if` statement to the `else` side of the statement. Pay close attention to this specifically in your `script` tags as it relates to the TypeScript vs. non-TypeScript parts of the template.  Whichever one comes first in the `if` statement will overwrite the section after the `else` statement. 

