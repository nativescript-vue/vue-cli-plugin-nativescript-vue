# nativescript-vue-cli-plugin

Nativescript-Vue Plugin for [vue-cli@3.0](https://github.com/vuejs/vue-cli)

This plugin will integrate [Nativescript-Vue](https://nativescript-vue.org/) into new and existing Vue projects.  Additionally, it will allow for the choice of developing for Native only environments or Native __and__ Web environments under a single project structure.  In addition, choosing to integrate [Nativescript-Vue-Web](https://github.com/Nativescript-Vue-Web/Nativescript-Vue-Web), will allow for the development of Web components with a NativeScript-Vue like syntax that has the benefit of allowing for the sharing of components between the Native and Web sides of the project.  This helps reduce the amount of code, maintenence needs, and the amount of time needed for development activities.

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
    * Accpeting the default is fine for testing
2.  Use HTML5 history mode? (Default: hash mode)
    * Required parameter for the cli core generator when vue-router is used
3.  Is this a brand new project? (Default: No)
    * By choosing `No`, which is the default, the plugin will try and be as non-destructive as possible to an existing project.  It will do this by adding a folder into root named `ns-example` and add files into there to provide examples of how a project would change.  
    * These changes will factor in answers to the other questions and adjust accordingly.  Regardless of the answer, the plugin will install packages and adjust `package.json` as necessary to prep the project.
4.  Dual Native AND Web development experience or a Native only? (Default: Dual)
    * By default, the plugin will assume you want to develop for the Web and Native environments within the same project.  As such, there will be two sides to the project where web environments will be actively developed within `/src` and Native environments will be developed within `/app`.
    * Warning: Choosing to develop for Native only will move the main entry point of the project and development folder to `/app`, copy necessary files and then delete `/src`.  
    * By choosing `Dual`, you will be able to bring your own component framework into the web portion of the project.  `NativeScript-Vue` [cannot use vue-router](https://nativescript-vue.org/en/docs/routing/vue-router/) currently, so you will have to provide your own manual routing.  The templated options deployed with the plugin will show how to do basic manual routing.
5.  Use [Nativescript-Vue-Web](https://github.com/Nativescript-Vue-Web/Nativescript-Vue-Web) to develop web components with `Nativescript-Vue` syntax? (Default: No)
    * This prompt should only appear if you have chosen to develop in the Dual Web and Native environments. 
    * By chosing `Use Nativescript-Vue-Web component framework`, it will effecively integrate a web component framework that will allow you to develop components that can be used in the Web and Native side of the project.  It uses `NativeScript-Vue` like syntax on components which will allow for the sharing of components between NativeScript and Web.
6.  What type of template do you want to start with? (Default: Simple)
    * Simple is just a simple setup with a header and basic routing.
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

#Webpack related information
The options passes in at `npm run` will dictate what webpack config is provided.  The first choice webpack will make is if this is a `web` or `native` environment.  Then, if it's a `native` environment, it will determine choices to be made between `ios` and `android`.

Each time the project is built or served, the plugin will copy the latest webpack config from the cli to the root of your project.  When you build a project, it will clean-up this file at the end, but just serving the project will not.  This is an issue with [nativescript-dev-webpack](https://github.com/NativeScript/nativescript-dev-webpack) and cannot be overcome at this time.

#### Inspecting the Webpack config
If you'd like to see what the webpack config is doing then you can run the following:
`vue inspect --mode development.web > output.js` and the `output.js` file in root will show you what's going on.  Subtitute `development.android` or `production.ios`, etc to see the different configs based on the environmental variables.

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
| root       | /               | /               |


## For TypeScript enabled projects
If your CLI 3 project has TypeScript enabled, then the plugin will attempt to give you a very basic TypeScript version of the template you choose.  When you invoke the plugin and the template generator makes changes, you will notice the `*.d.ts` files that are usually in `src` will be moved to root so that they can be referenced inside of `src` and `app`.  The plugin's webpack integration will ensure these files are referenced correctly at compile and runtimes.

## For Native environment development
It should be noted that the plugin will give you the ability to develop generic SFC's (\*.native.vue) to be used in Android and IOS, or if you need to differentiate between Android (\*.android.vue) and IOS (\*.ios.vue) then you can change the SFC's extension to map to the environment you choose.  

At `serve` or `build` in conjunction with the mode such as `android` or `ios`, it will filter which files are looked at.  For instance, if you do `npm run serve:android`, then it will look for `*.native.vue` and `*.android.vue` files and ignore `*.ios.vue` files entirely.  Conversely, it will do the same when your are doing the same for `ios` and will ignore `*.android.vue` files.  

This will allow you to develop generic native components under the `*.native.vue` file extension, but in special cases, it may require you to do platform specific components.  Use the corrosponding file extension to allow this to happen.

## Sharing components and assets between environments
If you want to use common components and assets between `web`, `android` and `ios`, you can do that.  Based on directory structures and webpack aliases setup by the plugin, it is __highly__ suggested you place these common items in the `src` folder directory structure.  For `assets`, place them in `src/assets` and for components, place them in `src/components`.  At compile time, assets will be copied to the output directory's `assets` folder and can be universally accessed across environments via something like `~/assets/logo.png`.  For components, they can be universally accessed via something similar to `components/HelloWorld`.



