# nativescript-vue-cli-plugin

Nativescript-Vue Plugin for [vue-cli@3.0](https://github.com/vuejs/vue-cli)

This plugin will integrate [Nativescript-Vue](https://nativescript-vue.org/) into new and existing Vue projects.  Additionally, it will allow for the choice of developing for Native only environments or Native __and__ Web environments under a single project structure.  In addition, choosing to integrate [Nativescript-Vue-Web](https://github.com/Nativescript-Vue-Web/Nativescript-Vue-Web), will allow for the development of Web components with a NativeScript-Vue like syntax that has the benefit of allowing for the sharing of components between the Native and Web sides of the project.  This helps reduce the amount of code, maintenence needs, and the amount of time needed for development activities.

## Sharing logic in a single Web and Native capable component
The key feature of this plugin is that it will allow you to compose SFC's that contain both Web and Native structures in them. If your component has exactly the same logic (`<script>` block) but you want different templates for web and native, you can use the special `<template web>` and `<template native>`. Also, if you need define different styles you can use `<style web>` and `<style native>`.

An example of this would be the following Vue component:

```
<template web>
  <div class="w-page">
    <div class="w-container">
      <img src="~/assets/logo.png" alt="logo" height="20%" width="20%">
      <HelloWorld :msg="msg"/>
    </div>
  </div>
</template>
<template native>
  <Page>
    <ActionBar :title="navbarTitle"/>
    <GridLayout rows="auto, auto">
      <HelloWorld :msg="msg"/>
    </GridLayout>
  </Page>
</template>
<script>
  import HelloWorld from '~/components/HelloWorld';
  export default {
    components: {
      HelloWorld,
    },
    data() {
      return {
        navbarTitle: `App.${appMode}.vue`,
        msg: `Mode=${appMode} and Platform=${process.env.VUE_APP_PLATFORM}`,
      };
    },
  }
</script>
<style web>
 w-page {
   padding: 1rem;
 }
</style>
<style native>
 ActionBar {
   color: red;
 }
</style>
```

### Optional Separation of concerns for Web and Native SFC's
If you want complete seperation of concerns between Web and Native for components, core logic and styling, you can also provide an alternate file naming scheme in your project. The name will dictate which mode (Web or Native) and platform (Android or IOS) the file will be used with. The same overall schema will work for `.vue`, `.js`, `.ts`, `.scss` and `.css` files.

| File Type  | Android __and__ IOS | Android only    | IOS only        | Web only        |
| ---------- | ------------------- | --------------- | --------------- | --------------- |
| vue        | *.native.vue        | *.android.vue   | *.ios.vue       | *.vue           |
| js         | *.native.js         | *.android.js    | *.ios.js        | *.js            |
| ts         | *.native.ts         | *.android.ts    | *.ios.ts        | *.ts            |
| scss       | *.native.scss       | *.android.scss  | *.ios.scss      | *.scss          |
| css        | *.native.css        | *.android.css   | *.ios.css       | *.css           |

Webpack will handle figuring out which files to include based on the `npm run` command syntax you pass in.  You can also mix and match this file naming schema with the `web` or `native` tag options mentioned above.

At `serve` or `build` in conjunction with the mode such as `android` or `ios`, Webpack will filter which files are looked at.  For instance, if you do `npm run serve:android`, then it will look for `*.native.vue` and `*.android.vue` files and ignore `*.ios.vue` files entirely.  Conversely, it will do the same when you are working with `ios` and will ignore `*.android.vue` files.

This will allow you to develop generic native components under the `*.native.vue` file extension, but in special cases, it may require you to do platform specific components, core logic and styling.  Use the corrosponding file extension to allow this to happen.

If you are building for web, then just `*.vue` will work and if you are building for a Native __only__ project, then `*.vue` will work as well as the previous options mentioned.

## Sharing components and assets between Native and Web SFC's
If you want to use common components and assets between `web`, `android` and `ios`, you can do that.    For `assets`, place them in `src/assets` and for components, place them in `src/components`.  At compile time, assets will be copied to the output directory's `assets` folder and can be universally accessed across environments via something like `~/assets/logo.png`.  For components, they can be universally accessed via something similar to `components/HelloWorld`.

## Install

If vue-cli 3 is not yet installed, first follow the instructions here: https://github.com/vuejs/vue-cli

**Tip**: If you don't want to overwrite your current vue-cli 2 setup because you still need `vue init`, [then try this](https://cli.vuejs.org/guide/creating-a-project.html#pulling-2-x-templates-legacy).

Generate a project using vue-cli 3.0
```
vue create my-app
```

Before installing the Nativescript-Vue CLI 3 Plugin, make sure to commit or stash changes in case you need to revert.

To install the Nativescript-Vue CLI 3 Plugin...
```
cd my-app
npm install --save-dev vue-cli-plugin-nativescript-vue
vue invoke vue-cli-plugin-nativescript-vue
```

## Invocation Prompts
1.  Enter a unique application identifier
    * Accepting the default is fine for testing
2.  Use HTML5 history mode? (Default: hash mode)
    * Required parameter for the cli core generator when vue-router is used
3.  Is this a brand new project? (Default: Yes)
    * By choosing `No`, the plugin will try and be as non-destructive as possible to an existing project.  It will do this by adding a folder into root named `ns-example` and add files into there to provide examples of how a project would change.
    * These changes will factor in answers to the other questions and adjust accordingly.  Regardless of the answer, the plugin will install packages and adjust `package.json` as necessary to prep the project.
4.  Dual Native AND Web development experience or a Native only? (Default: Dual)
    * By default, the plugin will assume you want to develop for the Web and Native environments within the same project.  As such, there will be two sides to the project where web environments will be actively developed within `/src` and Native environments will be developed within `/app` unless you choose to integrate `Nativescript-Vue-Web` and all files will be placed in `/src`.
    * Warning: Choosing to develop for Native only will move the main entry point of the project and development folder to `/app`, it will copy the necessary files and then delete `/src`.
    * By choosing `Dual`, you will be able to bring your own component framework into the web portion of the project.  `NativeScript-Vue` [cannot use vue-router](https://nativescript-vue.org/en/docs/routing/vue-router/) currently, so you will have to provide your own manual routing.  The templated options deployed with the plugin will show how to do basic manual routing.
5.  What type of template do you want to start with? (Default: Simple)
    * Simple is just a simple setup with a header and basic routing.
    * [Nativescript-Vue-Web](https://github.com/Nativescript-Vue-Web/Nativescript-Vue-Web) - The Simple template, but with NS-Vue like syntax for web components.  This option should only appear if you have chosen to develop in the Dual Web and Native environments. This option will effecively integrate a web component framework that will allow you to develop components that can be used in the Web and Native side of the project.  It uses `NativeScript-Vue` like syntax on components which will allow for the sharing of components between NativeScript and Web.
    * Sidebar (currently disabled), will allow you to start with a project that includes a fixed header and pop-out sidebar menu.
    * We expect to add more templates in the future as use cases come up.

## Running the project
You will have several options in serving and building the project:
1.  `npm run serve:web`
2.  `npm run serve:android`
3.  `npm run serve:ios`
4.  `npm run build:web`
5.  `npm run build:android`
6.  `npm run build:ios`


The basic `serve` and `build` options should be similar to what is in a CLI 3 project except the added options to dictate which kind of environment you are using: `web`, `android` or `ios`.  Please note that when building web projects, they will output to `dist` and when building native projects, they will output to `platforms\android` or `platforms\ios` depending on which you are building at the time.

### Debugging your project
You will have the standard options for debugging available to you as you would with just `tns`.  You can do the following to debug Native versions of your app.
1.  `npm run debug:android`
2.  `npm run debug:ios`

You should then be able to attach the Chrome debugger as you normally would via the [NativeScript docs](https://docs.nativescript.org/angular/tooling/debugging/chrome-devtools).

You should also be able to debug directly in VSCode.  The [NativeScript VSCode Extension docs](https://docs.nativescript.org/angular/tooling/visual-studio-code-extension) are a good place to start with understanding how to do this.  However, you will need to modify your `launch.json` file to force `tns` to work properly with VUE CLI 3.

Your `launch.json` file should look something like below. Notice the different in the `tnsArgs` line that is different than what is in the documentation link above.
```
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch on iOS",
      "type": "nativescript",
      "request": "launch",
      "platform": "ios",
      "appRoot": "${workspaceRoot}",
      "sourceMaps": true,
      "watch": true,
      "tnsArgs":[" --bundle --env.development cross-env-shell VUE_CLI_MODE=development.ios"]
    },
    {
      "name": "Attach on iOS",
      "type": "nativescript",
      "request": "attach",
      "platform": "ios",
      "appRoot": "${workspaceRoot}",
      "sourceMaps": true,
      "watch": false
    },
    {
      "name": "Launch on Android",
      "type": "nativescript",
      "request": "launch",
      "platform": "android",
      "appRoot": "${workspaceRoot}",
      "sourceMaps": true,
      "watch": true,
      "tnsArgs":[" --bundle --env.development cross-env-shell VUE_CLI_MODE=development.android"]
    },
    {
      "name": "Attach on Android",
      "type": "nativescript",
      "request": "attach",
      "platform": "android",
      "appRoot": "${workspaceRoot}",
      "sourceMaps": true,
      "watch": false
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "web: chrome",
      "url": "http://localhost:8080",
      "webRoot": "${workspaceFolder}/src",
      "breakOnLoad": true,
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    },
  ]
}
```
You will also need to modify your `vue.config.js` file to include a `webpack-chain` statement that will setup your source map.  It should look something like this:
```
module.exports = {
  chainWebpack: config => {
    config
      .devtool('inline-source-map')
  }
}
```

### Previewing your Project
You should be able to use the NativeScript Playground and Preview Apps via the following npm statements:
1.  `npm run preview:android`
2.  `npm run preview:ios`

#### --env command line recognition
Basic support for passing the `env` command line option is in place, but has a slightly different syntax since we're working with the CLI 3 webpack infrastructure.  To inject items into `env` at run-time, you will need to add `-- --env.option` Where option is one of the recognized options that Nativescript-Vue and this project supports.
An example of this would be something like this: `npm run serve:android -- --env.production`.  This would allow you to serve up a Production build of your Android app versus just running `npm run serve:android` which would serve a Development version of the same.

#### Webpack related information
The options passed in at `npm run` will dictate what webpack config is provided.  The first choice webpack will make is if this is a `web` or `native` environment.  Then, if it's a `native` environment, it will determine choices to be made between `ios` and `android`.

Each time the project is built or served, the plugin will copy the latest webpack config from the cli to the root of your project.  When you build a project, it will clean-up this file at the end, but just serving the project will not.  This is an issue with [nativescript-dev-webpack](https://github.com/NativeScript/nativescript-dev-webpack) and cannot be overcome at this time.

#### Inspecting the Webpack config
If you'd like to see what the webpack config is doing then you can run one of the following:

1. `vue inspect -- --env.android > out-android.js`
2. `vue inspect -- --env.ios > out-ios.js`
3. `vue inspect -- --env.web > out-web.js`

These will default to showing you the Development version of the webpack config. You can pass in the `-- --env.production` option to see the Production version of the config.  Subtitute `development.android` or `production.ios`, etc to see the different configs based on the environmental variables.

#### Aliases
Prebuilt in the webpack config are several aliases that you can use.  Here is a table listing out the various alias and the folder they use based on the environment chosen:

| Alias      | Native          | Web             |
| ---------- | --------------- | --------------- |
| ~          | /app            | /src            |
| @          | /app            | /src            |
| src        | /src            | /src            |
| assets     | /src/assets     | /src/assets     |
| components | /src/components | /src/components |
| fonts      | /src/fonts      | /src/fonts      |
| styles     | /src/styles     | /src/styles     |
| root       | /               | /               |


## For TypeScript enabled projects
If your CLI 3 project has TypeScript enabled, then the plugin will attempt to give you a very basic TypeScript version of the template you choose.  When you invoke the plugin and the template generator makes changes, you will notice the `*.d.ts` files that are usually in `src` will be moved to `/types`.  The plugin's webpack integration will ensure these files are referenced correctly at compile and runtimes.
