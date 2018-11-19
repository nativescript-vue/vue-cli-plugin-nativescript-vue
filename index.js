const path = require('path')
const fs = require('fs-extra');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const nativescriptTarget = require("nativescript-dev-webpack/nativescript-target");
const NsVueTemplateCompiler = require("nativescript-vue-template-compiler");
const nsWebpack = require("nativescript-dev-webpack");
const PlatformFSPlugin = nsWebpack.PlatformFSPlugin;
const WatchStateLoggerPlugin = nsWebpack.WatchStateLoggerPlugin;
const {
  NativeScriptWorkerPlugin
} = require("nativescript-worker-loader/NativeScriptWorkerPlugin");

const resolveExtensionsOptions = {
  web: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.json', '.scss'],
  android: ['.native.js', '.android.js', '.js', '.native.ts', '.android.ts', '.ts', '.native.vue', '.android.vue', '.vue', '.json', 'native.scss'],
  ios: ['.native.js', '.ios.js', '.js', '.native.ts', '.ios.ts', '.ts', '.native.vue', '.ios.vue', '.vue', '.json', 'native.scss'],
}


module.exports = (api, projectOptions) => {

  const jsOrTs = api.hasPlugin('typescript') ? '.ts' : '.js'
  const env = process.env.NODE_ENV;
  const platform = process.env.VUE_APP_PLATFORM
  const appMode = platform === 'android' ? 'native' : platform === 'ios' ? 'native' : 'web';
  process.env.VUE_APP_MODE = appMode;

  projectOptions.outputDir = path.join(api.service.context, appMode === 'web' ? 'platforms/web' : nsWebpack.getAppPath(platform, api.service.context));

  return appMode === 'web' ? webConfig(api, projectOptions, env, appMode, jsOrTs) : nativeConfig(api, projectOptions, env, platform, jsOrTs);

}

const resolveExtensions = (config, ext) => {
  config
    .resolve
    .extensions
    .add(ext)
    .end()
}

const nativeConfig = (api, projectOptions, env, platform, jsOrTs) => {
  console.log('starting nativeConfig')
  process.env.VUE_CLI_TARGET = 'nativescript'

  const appComponents = [
    "tns-core-modules/ui/frame",
    "tns-core-modules/ui/frame/activity",
  ];

  const platforms = ["ios", "android"];
  const projectRoot = api.service.context;
  const appResourcesPlatformDir = platform === "android" ? "Android" : "iOS";
  const tnsCorePath = api.resolve('node_modules/tns-core-modules')

  const {
    // The 'appPath' and 'appResourcesPath' values are fetched from
    // the nsconfig.json configuration file
    // when bundling with `tns run android|ios --bundle`.
    appPath = api.resolve('app'),
      appResourcesPath = path.join(appPath, 'App_Resources'),

      // You can provide the following flags when running 'tns run android|ios'
      snapshot,
      production,
      report,
      hmr,
  } = env;

  const nativeOnly = fs.pathExistsSync(path.resolve(projectRoot, 'src'));

  const appFullPath = appPath
  const appResourcesFullPath = appResourcesPath;

  const entryModule = nsWebpack.getEntryModule(appFullPath);
  const entryPath = `.${path.sep}${entryModule}${jsOrTs}`;

  api.chainWebpack(config => {

    config
      .mode(env)
      .devtool('none')
      .context(appFullPath)
      .end();

    config
      .watchOptions({
        ignored: [
          appResourcesFullPath,
          // Don't watch hidden files
          "**/.*",
        ],
      })
      .target(nativescriptTarget)
      .end();

    config
      // clear out old config.entryPoints and install new
      .entryPoints
      .clear()
      .end()
      .entry('bundle')
      .add(entryPath)
      .end();

    // clear out old config.output and install new
    config
      .output.clear()
      .end()
      .output
      .path(projectOptions.outputDir)
      .pathinfo(false)
      .libraryTarget('commonjs2')
      .globalObject('global')
      .filename(`[name].js`)
      .end();


    // next several use the resolveExtension function to easily
    // and in resolve.extensions from an object array const 
    // or directly from a string  
    config.resolve.extensions.clear();
    resolveExtensions(config, '.scss');
    resolveExtensions(config, '.css');

    if (platform === 'android') {
      for (let ext of resolveExtensionsOptions.android) {
        resolveExtensions(config, ext);
      }
    } else {
      for (let ext of resolveExtensionsOptions.ios) {
        resolveExtensions(config, ext);
      }
    }

    config
      .resolve
      // Resolve {N} system modules from tns-core-modules
      .modules
      .add(path.resolve(api.service.context, tnsCorePath))
      .add(tnsCorePath)
      .add('node_modules/tns-core-modules')
      .add('node_modules')
      .end()
      .alias
      .delete('vue$')
      .delete('@')
      .set('@', appFullPath)
      .set('~', appFullPath)
      .set('src', api.resolve('src'))
      .set('assets', path.resolve(api.resolve('src'), 'assets'))
      .set('components', path.resolve(api.resolve('src'), 'components'))
      .set('fonts', path.resolve(api.resolve('src'), 'fonts'))
      .set('root', projectRoot)
      .set('vue$', 'nativescript-vue')
      .end()
      .symlinks(false) // don't resolve symlinks to symlinked modules
      .end();

    config
      .resolveLoader
      .symlinks(false) //  don't resolve symlinks to symlinked modules
      .modules
      .add(tnsCorePath)
      .end()
      .end();

    config
      .node
      .set('setImmediate', false)
      .set('http', false)
      .set('timers', false)
      .set('fs', 'empty')
      .set('__dirname', false)
      .end();


    config.optimization
      .minimize(Boolean(production))
      .end()

    config.optimization
      .splitChunks({
        cacheGroups: {
          vendor: {
            name: "vendor",
            chunks: "all",
            test: (module) => {
              const moduleName = module.nameForCondition ? module.nameForCondition() : '';
              return /[\\/]node_modules[\\/]/.test(moduleName) ||
                appComponents.some(comp => comp === moduleName);

            },
            enforce: true,
          },
        },
      })
      .end()

    config.optimization
      .minimizer([
        new TerserPlugin({
          parallel: true,
          cache: true,
          terserOptions: {
            output: {
              comments: false,
            },
            compress: {
              // The Android SBG has problems parsing the output
              // when these options are enabled
              'collapse_vars': platform !== "android",
              sequences: platform !== "android",
            },
            safari10: platform === "ios",
            keep_fnames: true,
          },
        }),
      ])
      .end()

    config.module
      .rule('native-loaders')
      .test(new RegExp(entryPath))
      .use('nativescript-dev-webpack/bundle-config-loader')
      .loader('nativescript-dev-webpack/bundle-config-loader')
      .options({
        registerPages: true, // applicable only for non-angular apps
        loadCss: !snapshot, // load the application css if in debug mode
      })
      .end()

    config.when(platform === 'android', config => {
      config.module
        .rule('native-loaders')
        .use('nativescript-dev-webpack/android-app-components-loader')
        .loader('nativescript-dev-webpack/android-app-components-loader')
        .options({
          modules: appComponents
        })
        .before('nativescript-dev-webpack/bundle-config-loader')
        .end()
    })

    // delete the vue loader rule and rebuild it
    config.module.rules.delete('vue')
    config.module
      .rule('vue')
      .test(/\.vue$/)
      .use('vue-loader')
      .loader('vue-loader')
      .options(Object.assign({
        compiler: NsVueTemplateCompiler,
      }, {}))
      .before('string-replace-loader')
      .end()

    // delete the js loader rule and rebuil it
    config.module.rules.delete('js')
    config.module
      .rule('js')
      .test(/\.jsx?$/)
      .use('babel-loader')
      .loader('babel-loader')
      .end()


    // only adjust ts-loaders when we're using typescript in the project
    if (api.hasPlugin('typescript')) {
      const tsConfigOptions = config.module.rule('ts').uses.get('ts-loader').get('options');
      tsConfigOptions.configFile = path.resolve(api.resolve('app'), 'tsconfig.json');

      config.module
        .rule('ts')
        .test(/\.ts$/)
        .use('ts-loader')
        .loader('ts-loader')
        .options(tsConfigOptions)
        .end()

      const tsxConfigOptions = config.module.rule('ts').uses.get('ts-loader').get('options');
      tsxConfigOptions.configFile = path.resolve(api.resolve('app'), 'tsconfig.json');

      config.module
        .rule('tsx')
        .test(/\.tsx$/)
        .use('ts-loader')
        .loader('ts-loader')
        .options(tsxConfigOptions)
        .end()

    }

    // delete the css loader rule and rebuild it
    config.module.rules.delete('css')
    config.module
      .rule('css')
      .test(/\.css$/)
      .use('nativescript-dev-webpack/style-hot-loader')
      .loader('nativescript-dev-webpack/style-hot-loader')
      .before('nativescript-dev-webpack/apply-css-loader')
      .end()
      .use('nativescript-dev-webpack/apply-css-loader')
      .loader('nativescript-dev-webpack/apply-css-loader')
      .before('css-loader')
      .end()
      .use('css-loader')
      .loader('css-loader')
      .options(Object.assign({
        minimize: false,
        url: false,
      }, {}))
      .end()


    // delete the scss rule and rebuild it
    config.module.rules.delete('scss')
    config.module
      .rule('scss')
      .test(/\.scss$/)
      .use('nativescript-dev-webpack/style-hot-loader')
      .loader('nativescript-dev-webpack/style-hot-loader')
      .before('nativescript-dev-webpack/apply-css-loader')
      .end()
      .use('nativescript-dev-webpack/apply-css-loader')
      .loader('nativescript-dev-webpack/apply-css-loader')
      .before('css-loader')
      .end()
      .use('css-loader')
      .loader('css-loader')
      .options(Object.assign({
        minimize: false,
        url: false,
      }, {}))
      .before()
      .end()
      .use('sass-loader')
      .loader('sass-loader')


    // delete these rules that come standard with CLI 3
    // need to look at adding these back in after evaluating impact
    config.module.rules.delete('images')
    config.module.rules.delete('svg')
    config.module.rules.delete('media')
    config.module.rules.delete('fonts')
    config.module.rules.delete('pug')
    config.module.rules.delete('postcss')
    config.module.rules.delete('sass')
    config.module.rules.delete('less')
    config.module.rules.delete('stylus')
    config.module.rules.delete('eslint')
      .end();


    // delete these plugins that come standard with CLI 3
    config.plugins.delete('hmr')
    config.plugins.delete('html')
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
    config.plugins.delete('pwa')
    config.plugins.delete('progress')
    config.plugins.delete('copy')
      .end();

    // create new plugins

    // Define useful constants like TNS_WEBPACK
    config.plugin('define')
      .use(DefinePlugin, [{
        "global.TNS_WEBPACK": "true",
        'process.env': {
          "TNS_ENV": JSON.stringify(env),
          'TNS_APP_PLATFORM': JSON.stringify(platform),
          'TNS_APP_MODE': JSON.stringify(process.env.VUE_APP_MODE)
        }
      }])
      .end()

    // Remove all files from the out dir.
    config.plugin('clean')
      .use(CleanWebpackPlugin, [path.join(projectOptions.outputDir, '/**/*'), {
        root: projectOptions.outputDir
      }])
      .end();

    // Copy native app resources to out dir.
    config.plugin('copy-native-resources')
      .use(CopyWebpackPlugin, [
        [{
          from: path.join(appResourcesFullPath, appResourcesPlatformDir),
          to: path.join(projectOptions.outputDir, 'App_Resources', appResourcesPlatformDir),
          context: projectRoot,
        }]
      ])
      .end();

    // Copy assets to out dir. Add your own globs as needed.
    // if the project is native-only then we want to copy files 
    // from the app directory and not the src directory as at
    // that point, the src directory should have been removed 
    // when the plugin was originally invoked.
    config.plugin('copy-assets')
      .use(CopyWebpackPlugin, [
        [{
            from: {
              glob: path.resolve(nativeOnly === false ? api.resolve('app') : api.resolve('src'), 'fonts/**')
            },
            to: path.join(projectOptions.outputDir, 'fonts/'),
            flatten: true
          },
          {
            from: {
              glob: path.resolve(nativeOnly === false ? api.resolve('app') : api.resolve('src'), '**/*.jpg')
            },
            to: path.join(projectOptions.outputDir, 'assets'),
            flatten: true
          },
          {
            from: {
              glob: path.resolve(nativeOnly === false ? api.resolve('app') : api.resolve('src'), '**/*.png')
            },
            to: path.join(projectOptions.outputDir, 'assets/'),
            flatten: true
          },
          {
            from: {
              glob: path.resolve(nativeOnly === false ? api.resolve('app') : api.resolve('src'), 'assets/**/*')
            },
            to: path.join(projectOptions.outputDir, 'assets/'),
            flatten: true
          },
        ], {
          ignore: [`${path.relative(appPath, appResourcesFullPath)}/**`]
        }
      ])
      .end();

    // Generate a bundle starter script and activate it in package.json
    config.plugin('generate-bundle-starter')
      .use(nsWebpack.GenerateBundleStarterPlugin, [
        [
          './vendor',
          './bundle'
        ]
      ])
      .end();

    // For instructions on how to set up workers with webpack
    // check out https://github.com/nativescript/worker-loader
    config.plugin('nativescript-worker')
      .use(NativeScriptWorkerPlugin, [])
      .end();

    config.plugin('platform-FS')
      .use(PlatformFSPlugin, [{
        platform,
        platforms,
      }])
      .end();

    // Does IPC communication with the {N} CLI to notify events when running in watch mode.
    config.plugin('watch-state-logger')
      .use(WatchStateLoggerPlugin, [])
      .end();

    // Another only do this if we're using typescript.  this code could have been put
    // with the ts-loader section but left it here near the rest of the plugin config
    if (api.hasPlugin('typescript')) {
      // Next section is weird as we have to copy the plugin's config, edit the copy
      // delete the plugin and then add the plugin back in with the saved config.
      // This is all because webpack chain cannot access the 'tslint' option of the plugin
      // directly to edit it.
      const forTSPluginConfig = config.plugin('fork-ts-checker').get('args')[0];

      forTSPluginConfig.tsconfig = path.resolve(api.resolve('app'), 'tsconfig.json');
      forTSPluginConfig.tslint = path.resolve(projectRoot, 'tslint.json');

      config.plugins.delete('fork-ts-checker')
        .end();

      config.plugin('fork-ts-checker')
        .use(ForkTsCheckerWebpackPlugin, [forTSPluginConfig])
        .end();
    }

    // // // // causes error on compile at the moment
    // // // config.plugin('extract-css').tap(args => {
    // // //   if (!args.length) return args;

    // // //   args[0].filename = 'app.css'
    // // //   args[0].chunkFilename = 'vendor.css'

    // // //   return args;
    // // // })

    // // // // causes error on compile at the moment
    // // // const nodeModulesPath = api.resolve('node_modules')
    // // // config.externals((context, request, callback) => {
    // // //   if (context.startsWith(nodeModulesPath)) {
    // // //     const module = context.replace(nodeModulesPath, '').split(path.sep).find(p => !!p)
    // // //     try {
    // // //       const pkg = require(path.resolve(nodeModulesPath, module, 'package.json'))
    // // //       if(pkg.nativescript) {
    // // //         return callback(null, 'commonjs ' + request)
    // // //       }
    // // //     } catch (e) {
    // // //     }
    // // //   }
    // // //   callback()
    // // // })
  })


}

const webConfig = (api, projectOptions, env, appMode, jsOrTs) => {

  const projectRoot = api.service.context;

  api.chainWebpack(config => {

    config.entry('app').clear()
    config.entry('app').add(path.resolve(api.resolve('src'), 'main' + jsOrTs));

    config
      .output
      .path(projectOptions.outputDir)
      .end();

    config.resolve.alias
      .delete('@')
      .set('@', api.resolve('src'))
      .set('~', api.resolve('src'))
      .set('src', api.resolve('src'))
      .set('assets', path.resolve(api.resolve('src'), 'assets'))
      .set('components', path.resolve(api.resolve('src'), 'components'))
      .set('fonts', path.resolve(api.resolve('src'), 'fonts'))
      .set('root', projectRoot)
      .end()

    config.resolve.extensions.clear();

    for (let ext of resolveExtensionsOptions.web) {
      resolveExtensions(config, ext);
    }

    config.module
      .rule('vue')
      .use('cache-loader')
      .loader('cache-loader')
      .tap(options => {
        options.cacheDirectory = config.module.rule('vue').uses.get('cache-loader').get('options').cacheDirectory + '\\' + appMode;
        return options;
      })
      .end()
      .use('vue-loader')
      .loader('vue-loader')
      .options(Object.assign({
        //compiler: NsVueTemplateCompiler,
      }, config.module.rule('vue').uses.get('vue-loader').get('options')))
      .end()



    // Define useful constants like TNS_WEBPACK
    config.plugin('define')
      .use(DefinePlugin, [{
        'process.env': {
          'TNS_ENV': JSON.stringify(env),
          'TNS_APP_PLATFORM': JSON.stringify(process.env.VUE_APP_PLATFORM),
          'TNS_APP_MODE': JSON.stringify(process.env.VUE_APP_MODE)
        }
      }])
      .end()

    // Remove all files from the out dir.
    config.plugin('clean')
      .use(CleanWebpackPlugin, [path.join(projectOptions.outputDir, '/**/*'), {
        root: projectOptions.outputDir
      }])
      .end();

    // only adjust ts-loaders when we're using typescript in the project
    if (api.hasPlugin('typescript')) {
      const tsConfigOptions = config.module.rule('ts').uses.get('ts-loader').get('options');
      tsConfigOptions.configFile = path.resolve(api.resolve('src'), 'tsconfig.json');

      config.module
        .rule('ts')
        .test(/\.ts$/)
        .use('ts-loader')
        .loader('ts-loader')
        .options(tsConfigOptions)
        .end()

      const tsxConfigOptions = config.module.rule('ts').uses.get('ts-loader').get('options');
      tsxConfigOptions.configFile = path.resolve(api.resolve('src'), 'tsconfig.json');

      config.module
        .rule('tsx')
        .test(/\.tsx$/)
        .use('ts-loader')
        .loader('ts-loader')
        .options(tsxConfigOptions)
        .end()

      // Next section is weird as we have to copy the plugin's config, edit the copy
      // delete the plugin and then add the plugin back in with the saved config.
      // This is all because webpack chain cannot access the 'tslint' option of the plugin
      // directly to edit it.
      const forTSPluginConfig = config.plugin('fork-ts-checker').get('args')[0];

      forTSPluginConfig.tsconfig = path.resolve(api.resolve('src'), 'tsconfig.json');
      forTSPluginConfig.tslint = path.resolve(projectRoot, 'tslint.json');

      config.plugins.delete('fork-ts-checker')
        .end();

      config.plugin('fork-ts-checker')
        .use(ForkTsCheckerWebpackPlugin, [forTSPluginConfig])
        .end();

    }

  })
}