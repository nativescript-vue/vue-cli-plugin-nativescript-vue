/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
const { relative, resolve, sep, join } = require('path');
const fs = require('fs-extra');

const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const NsVueTemplateCompiler = require('nativescript-vue-template-compiler');

const nsWebpack = require('nativescript-dev-webpack');
const nativescriptTarget = require('nativescript-dev-webpack/nativescript-target');
const { NativeScriptWorkerPlugin } = require('nativescript-worker-loader/NativeScriptWorkerPlugin');

const hashSalt = Date.now().toString();

const DefinePlugin = require('webpack/lib/DefinePlugin');

// // // TO BE REMOVED SOON
// // // // eslint-disable-next-line prefer-destructuring
// // // const PlatformFSPlugin = nsWebpack.PlatformFSPlugin;
// // // // eslint-disable-next-line prefer-destructuring
// // // const WatchStateLoggerPlugin = nsWebpack.WatchStateLoggerPlugin;

const resolveExtensionsOptions = {
  web: ['*', '.ts', '.tsx', '.js', '.jsx', '.vue', '.json', '.scss', '.styl', '.less', '.css'],
  android: [
    '*',
    '.native.ts',
    '.android.ts',
    '.ts',
    '.native.js',
    '.android.js',
    '.js',
    '.native.vue',
    '.android.vue',
    '.vue',
    '.json',
    '.native.scss',
    '.android.scss',
    '.scss',
    '.native.styl',
    '.android.styl',
    '.styl',
    '.native.less',
    '.android.less',
    '.less',
    '.native.css',
    '.android.css',
    '.css'
  ],
  ios: [
    '*',
    '.native.ts',
    '.ios.ts',
    '.ts',
    '.native.js',
    '.ios.js',
    '.js',
    '.native.vue',
    '.ios.vue',
    '.vue',
    '.json',
    '.native.scss',
    '.ios.scss',
    '.scss',
    '.native.styl',
    '.ios.styl',
    '.styl',
    '.native.less',
    '.ios.less',
    '.less',
    '.native.css',
    '.ios.css',
    '.css'
  ]
};

const getBlockRegex = (tag, mode) => {
  return `^((<${tag})(.+\\b${mode}\\b))([\\s\\S]*?>)[\\s\\S]*?(<\\/${tag}>)`;
  // Rejected code from PR #26 as the issue could not be reproduced. Leaving it in commented out in case we need to look at this again in the future.
  // return `^((<${tag})(.+\\b${mode}\\b))([\\s\\S]*?>)((?=[\\s\\S]*?<${tag}.+\\b${mode === 'web' ? 'native' : 'web'}\\b[\\s\\S]*?>)([\\s\\S]+(?=[\\s\\S]*?<${tag}.+\\b${mode === 'web' ? 'native' : 'web'}\\b[\\s\\S]*?>))|([\\s\\S]+<\\/${tag}>))`;
};

module.exports = (api, projectOptions) => {
  let env = new Object();
  let flags = new Array();

  const addOption = (all, current) => {
    all[current] = true;
    return all;
  };

  // console.log('api.service.mode - ', api.service.mode);

  // are we using the vue cli or not and if so are we passing in the correct options
  if (api && api.service.mode && api.service.mode.indexOf('.') !== -1) {
    // will convert the --mode options into an array for later use
    flags = api.service.mode.split('.');
    // console.log('vue cli - flags - ', flags);
  } else {
    // get the --env command line options and put them in the env variable
    const [, , ...processArgs] = process.argv;
    flags = [...processArgs].filter((f) => f.startsWith('--env.')).map((f) => f.substring(6));

    // in the rare event that tns and vue-cli get things mixed up and try and load the production
    // environment and development environment at the same time, we will default to loading 
    // the development environment.  you will generally see this when using something like
    // fastlane and having it do a 'tns prepare' as you are prepping to package and upload
    //  your app to the app store.  For internal testing you may want to package a development 
    // version of the app, but `tns prepare` will try and load the production environmental variables
    if(flags.includes('development') && flags.includes('production')) {
      const index = flags.findIndex((obj) => obj === 'production')
      if(index > -1) {
        flags.splice(index, 1);
      }
    }

    // console.log('tns cli - flags - ', flags);

    // take advantage of the vue cli api to load the --env items into process.env.
    // we are filtering out the items, by catching the '=' sign, brought in from nsconfig.json as those don't need loaded into process.env
    // we are also filtering out 'sourceMap' which will appear with 'tns debug' as well as 'hmr' and 'uglify'
    // the goal here is to figure out exactly what environmental variables to load
    const mode = flags.filter((o) => !o.includes('=') && !o.includes('sourceMap') && !o.includes('hmr') && !o.includes('uglify')).join('.');
    // console.log('loadEnv - ', mode);
    api.service.loadEnv(mode);

  }

  // setup the traditional {N} webpack 'env' variable
  env = flags.reduce(addOption, {});
  // console.log('env - ', env);

  let platform = env && ((env.android && 'android') || (env.ios && 'ios') || (env.web && 'web'));
  // console.log('platform - ', platform);

  if (!platform) {
    // TNS (iOS/Android) always sets platform, so assume platform = 'web' & Vue-CLI glitch of loosing .env options in the UI
    platform = 'web';
    //    --> TO BE DELETED SOON
    // throw new Error('You need to provide a target platform!');
  }

  const projectRoot = api.service.context;
  const appMode = platform === 'android' ? 'native' : platform === 'ios' ? 'native' : 'web';

  // setup output directory depending on if we're building for web or native
  projectOptions.outputDir = join(projectRoot, appMode === 'web' ? projectOptions.outputDir : nsWebpack.getAppPath(platform, projectRoot));

  return appMode === 'web' ? webConfig(api, projectOptions, env, projectRoot) : nativeConfig(api, projectOptions, env, projectRoot, platform);
};

const resolveExtensions = (config, ext) => {
  config.resolve.extensions.add(ext).end();
};

const nativeConfig = (api, projectOptions, env, projectRoot, platform) => {
  console.log('starting nativeConfig');
  process.env.VUE_CLI_TARGET = 'nativescript';
  const isNativeOnly = !fs.pathExistsSync(resolve(projectRoot, 'src'));
  const tsconfigFileName = 'tsconfig.json';

  const appComponents = ['tns-core-modules/ui/frame', 'tns-core-modules/ui/frame/activity'];

  const platforms = ['ios', 'android'];

  // Default destination inside platforms/<platform>/...
  const dist = projectOptions.outputDir;
  const appResourcesPlatformDir = platform === 'android' ? 'Android' : 'iOS';

  const {
    // The 'appPath' and 'appResourcesPath' values are fetched from
    // the nsconfig.json configuration file
    // when bundling with `tns run android|ios --bundle`.
    appPath = isNativeOnly === true ? 'app' : 'src',
    appResourcesPath = join(appPath, 'App_Resources'),

    // You can provide the following flags when running 'tns run android|ios'
    snapshot, // --env.snapshot
    production, // --env.production
    report, // --env.report
    hmr, // --env.hmr
    sourceMap, // -env.sourceMap
    hiddenSourceMap, // -env.HiddenSourceMap
    unitTesting, // -env.unittesting
    verbose // --env.verbose
  } = env;

  const isAnySourceMapEnabled = !!sourceMap || !!hiddenSourceMap;
  const externals = nsWebpack.getConvertedExternals(env.externals);

  // // // // --env.externals
  // // // const externals = (env.externals || []).map((e) => {
  // // //   return new RegExp(e + '.*');
  // // // });

  const mode = production ? 'production' : 'development';

  const appFullPath = resolve(projectRoot, appPath);
  const appResourcesFullPath = resolve(projectRoot, appResourcesPath);

  // const entryModule = nsWebpack.getEntryModule(appFullPath);
  const entryModule = nsWebpack.getEntryModule(appFullPath, platform);
  const entryPath = `.${sep}${entryModule}`;
  const entries = { bundle: entryPath };
  const areCoreModulesExternal = Array.isArray(env.externals) && env.externals.some((e) => e.indexOf('tns-core-modules') > -1);
  // // if (platform === 'ios' ) {
  // //   entries['tns_modules/tns-core-modules/inspector_modules'] = 'inspector_modules.js';
  // // }
  if (platform === 'ios' && !areCoreModulesExternal) {
    entries['tns_modules/tns-core-modules/inspector_modules'] = 'inspector_modules';
  }

  console.log(`Bundling application for entryPath ${entryPath}...`);

  let sourceMapFilename = nsWebpack.getSourceMapFilename(hiddenSourceMap, __dirname, dist);

  const itemsToClean = [`${dist}/**/*`];
  if (platform === 'android') {
    itemsToClean.push(`${join(projectRoot, 'platforms', 'android', 'app', 'src', 'main', 'assets', 'snapshots')}`);
    itemsToClean.push(`${join(projectRoot, 'platforms', 'android', 'app', 'build', 'configurations', 'nativescript-android-snapshot')}`);
  }

  nsWebpack.processAppComponents(appComponents, platform);

  api.chainWebpack((config) => {
    config
      .mode(mode)
      .context(appFullPath)
      .devtool(hiddenSourceMap ? 'hidden-source-map' : sourceMap ? 'inline-source-map' : 'none')
      .end();

    config.externals(externals).end();

    config
      .watchOptions({
        ignored: [
          appResourcesFullPath,
          // Don't watch hidden files
          '**/.*'
        ]
      })
      .target(nativescriptTarget)
      .end();

    config.entryPoints // clear out old config.entryPoints and install new
      .clear()
      .end()
      .entry('bundle')
      // .entry(entries)
      .add(entryPath)
      .end();

    // clear out old config.output and install new
    config.output.clear().end();

    config.output
      .pathinfo(false)
      .path(dist)
      .sourceMapFilename(sourceMapFilename)
      .libraryTarget('commonjs2')
      .filename(`[name].js`)
      .globalObject('global')
      .hashSalt(hashSalt)
      .end();

    // next several use the resolveExtension function to easily
    // add in resolve.extensions from an object array const
    // or directly from a string
    config.resolve.extensions.clear();

    if (platform === 'android') {
      for (let ext of resolveExtensionsOptions.android) {
        resolveExtensions(config, ext);
      }
    } else {
      for (let ext of resolveExtensionsOptions.ios) {
        resolveExtensions(config, ext);
      }
    }

    // delete these out.  we'll add them back in, but we do it
    // this way to ensure that we get the exact path we need.
    config.resolve.modules.delete('node_modules');
    config.resolve.modules.delete(resolve(projectRoot, 'node_modules'));

    config.resolve.modules // Resolve {N} system modules from tns-core-modules
      .add(resolve(projectRoot, 'node_modules/tns-core-modules'))
      .add(resolve(projectRoot, 'node_modules'))
      .add('node_modules/tns-core-modules')
      .add('node_modules')
      .end()
      .alias.delete('vue$')
      .delete('@')
      .set('~', appFullPath)
      .set('@', appFullPath)
      .set('src', api.resolve('src'))
      .set('app', isNativeOnly ? api.resolve('app') : api.resolve('src'))
      .set('assets', resolve(isNativeOnly ? api.resolve('app') : api.resolve('src'), 'assets'))
      .set('components', resolve(isNativeOnly ? api.resolve('app') : api.resolve('src'), 'components'))
      .set('fonts', resolve(isNativeOnly ? api.resolve('app') : api.resolve('src'), 'fonts'))
      .set('styles', resolve(isNativeOnly ? api.resolve('app') : api.resolve('src'), 'styles'))
      .set('root', projectRoot)
      .set('vue$', 'nativescript-vue')
      .set('vue', 'nativescript-vue')
      .end()
      .symlinks(true) // don't resolve symlinks to symlinked modules
      .end();

    config.resolveLoader
      .symlinks(false) //  don't resolve symlinks to symlinked modules
      .end();

    config.node
      .set('http', false)
      .set('timers', false)
      .set('setImmediate', false)
      .set('fs', 'empty')
      .set('__dirname', false)
      .end();

    config.optimization.runtimeChunk('single'), // --> NOT WORKING YET
      config.optimization
        .splitChunks({
          cacheGroups: {
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: (module) => {
                const moduleName = module.nameForCondition ? module.nameForCondition() : '';
                return /[\\/]node_modules[\\/]/.test(moduleName) || appComponents.some((comp) => comp === moduleName);
              },
              enforce: true
            }
          }
        })
        .end();

    config.optimization.minimize(Boolean(production));
    config.optimization
      .minimizer('terser')
      .use(TerserPlugin, [{
        parallel: true,
        cache: true,
        sourceMap: isAnySourceMapEnabled,
        terserOptions: {
          output: {
            comments: false,
            semicolons: !isAnySourceMapEnabled
          },
          compress: {
            // The Android SBG has problems parsing the output
            // when these options are enabled
            collapse_vars: platform !== 'android',
            sequences: platform !== 'android'
          },
          keep_fnames: true
        }
      }])
      .end();

    config.module
      .rule('native-loaders')
      // .test(new RegExp(entryPath)) --> OLD ENTRY - TO BE REMOVED
      .test(new RegExp(nsWebpack.getEntryPathRegExp(appFullPath, entryPath + '.(js|ts)')))
      .use('nativescript-dev-webpack/bundle-config-loader')
      .loader('nativescript-dev-webpack/bundle-config-loader')
      .options({
        registerPages: true, // applicable only for non-angular apps
        loadCss: !snapshot, // load the application css if in debug mode
        unitTesting,
        appFullPath,
        projectRoot,
        ignoredFiles: nsWebpack.getUserDefinedEntries(entries, platform)
      })
      .end();

    config.when(platform === 'android', (config) => {
      config.module
        .rule('native-loaders')
        .use('nativescript-dev-webpack/android-app-components-loader')
        .loader('nativescript-dev-webpack/android-app-components-loader')
        .options({
          modules: appComponents
        })
        .before('nativescript-dev-webpack/bundle-config-loader')
        .end();
    });

    // delete the vue loader rule and rebuild it
    config.module.rules.delete('vue');
    config.module
      .rule('vue')
      .test(/\.vue$/)
      .use('vue-loader')
      .loader('vue-loader')
      .options(
        Object.assign(
          {
            compiler: NsVueTemplateCompiler
          },
          {}
        )
      )
      .before('string-replace-loader')
      .end()
      .use('string-replace-loader')
      .loader('string-replace-loader')
      .options(
        Object.assign(
          {
            multiple: [
              {
                search: getBlockRegex('template', 'web'),
                replace: '',
                flags: 'gim',
                strict: false
              },
              {
                search: getBlockRegex('script', 'web'),
                replace: '',
                flags: 'gim',
                strict: false
              },
              {
                search: getBlockRegex('style', 'web'),
                replace: '',
                flags: 'gim',
                strict: false
              }
            ]
          },
          {}
        )
      )
      .end();

    // delete the js loader rule and rebuil it
    config.module.rules.delete('js');
    config.module
      .rule('js')
      .test(/\.js$/)
      .use('babel-loader')
      .loader('babel-loader')
      .end();

    config.module
      .rule('jsx')
      .test(/\.jsx$/)
      .use('babel-loader')
      .loader('babel-loader')
      .end();

    // only adjust ts-loaders when we're using typescript in the project
    if (api.hasPlugin('typescript')) {
      config.module.rules.get('ts').uses.delete('cache-loader');
      config.module.rules.get('ts').uses.delete('babel-loader');
      if (mode === 'production') config.module.rules.get('ts').uses.delete('thread-loader');

      const tsConfigOptions = config.module
        .rule('ts')
        .uses.get('ts-loader')
        .get('options');

      tsConfigOptions.configFile = resolve(projectRoot, tsconfigFileName);

      (tsConfigOptions.appendTsSuffixTo = [/\.vue$/]),
        (tsConfigOptions.allowTsInNodeModules = true),
        (tsConfigOptions.compilerOptions = {
          declaration: false
        });

      config.module
        .rule('ts')
        .test(/\.ts$/)
        .use('ts-loader')
        .loader('ts-loader')
        .options(Object.assign({}, tsConfigOptions))
        .end();

      config.module.rules.get('tsx').uses.delete('cache-loader');
      config.module.rules.get('tsx').uses.delete('babel-loader');
      if (mode === 'production') config.module.rules.get('tsx').uses.delete('thread-loader');

      const tsxConfigOptions = config.module
        .rule('tsx')
        .uses.get('ts-loader')
        .get('options');

      tsxConfigOptions.configFile = resolve(projectRoot, tsconfigFileName);
      (tsxConfigOptions.appendTsSuffixTo = [/\.vue$/]),
        (tsxConfigOptions.allowTsInNodeModules = true),
        (tsxConfigOptions.compilerOptions = {
          declaration: false
        });

      config.module
        .rule('tsx')
        .test(/\.tsx$/)
        .use('ts-loader')
        .loader('ts-loader')
        .options(Object.assign({}, tsxConfigOptions))
        .end();
    }

    // remove most of the css rules and rebuild it for nativescript-vue
    config.module.rules.get('css').oneOfs.delete('vue-modules');
    config.module.rules.get('css').oneOfs.delete('normal-modules');
    config.module.rules.get('css').oneOfs.delete('vue');
    config.module.rules
      .get('css')
      .oneOfs.get('normal')
      .uses.delete('extract-css-loader');
    config.module.rules
      .get('css')
      .oneOfs.get('normal')
      .uses.delete('vue-style-loader');
    // config.module.rules
    //   .get('css')
    //   .oneOfs.get('normal')
    //   .uses.delete('postcss-loader');
    config.module
      .rule('css')
      .oneOf('normal')
      .use('nativescript-dev-webpack/apply-css-loader')
      .loader('nativescript-dev-webpack/apply-css-loader')
      .before('css-loader')
      .end()
      .use('nativescript-dev-webpack/style-hot-loader')
      .loader('nativescript-dev-webpack/style-hot-loader')
      .before('nativescript-dev-webpack/apply-css-loader')
      .end()
      .use('css-loader')
      .loader('css-loader')
      .options(
        Object.assign(
          config.module
            .rule('css')
            .oneOf('normal')
            .uses.get('css-loader')
            .get('options'),
          {
            // minimize: false,
            url: false,
            importLoaders: 1
          }
        )
      )
      .end();

    // remove most of the scss rules and rebuild it for nativescript-vue
    config.module.rules.get('scss').oneOfs.delete('vue-modules');
    config.module.rules.get('scss').oneOfs.delete('normal-modules');
    config.module.rules.get('scss').oneOfs.delete('vue');
    config.module.rules
      .get('scss')
      .oneOfs.get('normal')
      .uses.delete('extract-css-loader');
    config.module.rules
      .get('scss')
      .oneOfs.get('normal')
      .uses.delete('vue-style-loader');
    // config.module.rules
    //   .get('scss')
    //   .oneOfs.get('normal')
    //   .uses.delete('postcss-loader');
    config.module
      .rule('scss')
      .oneOf('normal')
      .use('nativescript-dev-webpack/apply-css-loader')
      .loader('nativescript-dev-webpack/apply-css-loader')
      .before('css-loader')
      .end()
      .use('nativescript-dev-webpack/style-hot-loader')
      .loader('nativescript-dev-webpack/style-hot-loader')
      .before('nativescript-dev-webpack/apply-css-loader')
      .end()
      .use('css-loader')
      .loader('css-loader')
      .options(
        Object.assign(
          config.module
            .rule('scss')
            .oneOf('normal')
            .uses.get('css-loader')
            .get('options'),
          {
            // minimize: false,
            url: false,
            // data: '$PLATFORM: ' + platform + ';'
          }
        )
      )
      .end()
      .use('sass-loader')
      .loader('sass-loader')
      .options(
        Object.assign(
          config.module
            .rule('scss')
            .oneOf('normal')
            .uses.get('sass-loader')
            .get('options'),
          {
            // minimize: false,
            // url: false,
            prependData: '$PLATFORM: ' + platform + ';'
          }
        )
      )
      .end();

    // remove most of the sass rules and rebuild it for nativescript-vue
    config.module.rules.get('sass').oneOfs.delete('vue-modules');
    config.module.rules.get('sass').oneOfs.delete('normal-modules');
    config.module.rules.get('sass').oneOfs.delete('vue');
    config.module.rules
      .get('sass')
      .oneOfs.get('normal')
      .uses.delete('extract-css-loader');
    config.module.rules
      .get('sass')
      .oneOfs.get('normal')
      .uses.delete('vue-style-loader');
    // config.module.rules
    //   .get('sass')
    //   .oneOfs.get('normal')
    //   .uses.delete('postcss-loader');
    config.module
      .rule('sass')
      .oneOf('normal')
      .use('nativescript-dev-webpack/apply-css-loader')
      .loader('nativescript-dev-webpack/apply-css-loader')
      .before('css-loader')
      .end()
      .use('nativescript-dev-webpack/style-hot-loader')
      .loader('nativescript-dev-webpack/style-hot-loader')
      .before('nativescript-dev-webpack/apply-css-loader')
      .end()
      .use('css-loader')
      .loader('css-loader')
      .options(
        Object.assign(
          config.module
            .rule('sass')
            .oneOf('normal')
            .uses.get('css-loader')
            .get('options'),
          {
            // minimize: false,
            url: false,
            //  data: '$PLATFORM: ' + platform
          }
        )
      )
      .end()
      .use('sass-loader')
      .loader('sass-loader')
      .options(
        Object.assign(
          config.module
            .rule('sass')
            .oneOf('normal')
            .uses.get('sass-loader')
            .get('options'),
          {
            minimize: false,
            // url: false,
            prependData: '$PLATFORM: ' + platform
          }
        )
      )
      .end();

    // remove most of the stylus rules and rebuild it for nativescript-vue
    config.module.rules.get('stylus').oneOfs.delete('vue-modules');
    config.module.rules.get('stylus').oneOfs.delete('normal-modules');
    config.module.rules.get('stylus').oneOfs.delete('vue');
    config.module.rules
      .get('stylus')
      .oneOfs.get('normal')
      .uses.delete('vue-style-loader');
    // config.module.rules
    //   .get('stylus')
    //   .oneOfs.get('normal')
    //   .uses.delete('postcss-loader');
    config.module
      .rule('stylus')
      .oneOf('normal')
      .use('nativescript-dev-webpack/apply-css-loader')
      .loader('nativescript-dev-webpack/apply-css-loader')
      .before('css-loader')
      .end()
      .use('nativescript-dev-webpack/style-hot-loader')
      .loader('nativescript-dev-webpack/style-hot-loader')
      .before('nativescript-dev-webpack/apply-css-loader')
      .end()
      .use('css-loader')
      .loader('css-loader')
      .options(
        Object.assign(
          config.module
            .rule('stylus')
            .oneOf('normal')
            .uses.get('css-loader')
            .get('options'),
          {
            // minimize: false,
            url: false
          }
        )
      )
      .end()
      .use('stylus-loader')
      .loader('stylus-loader')
      .options(
        Object.assign(
          config.module
            .rule('stylus')
            .oneOf('normal')
            .uses.get('stylus-loader')
            .get('options'),
          {
            minimize: false,
            url: false
          }
        )
      )
      .end();

    // remove most of the less rules and rebuild it for nativescript-vue
    config.module.rules.get('less').oneOfs.delete('vue-modules');
    config.module.rules.get('less').oneOfs.delete('normal-modules');
    config.module.rules.get('less').oneOfs.delete('vue');
    config.module.rules
      .get('less')
      .oneOfs.get('normal')
      .uses.delete('vue-style-loader');
    // config.module.rules
    //   .get('less')
    //   .oneOfs.get('normal')
    //   .uses.delete('postcss-loader');
    config.module
      .rule('less')
      .oneOf('normal')
      .use('nativescript-dev-webpack/apply-css-loader')
      .loader('nativescript-dev-webpack/apply-css-loader')
      .before('css-loader')
      .end()
      .use('nativescript-dev-webpack/style-hot-loader')
      .loader('nativescript-dev-webpack/style-hot-loader')
      .before('nativescript-dev-webpack/apply-css-loader')
      .end()
      .use('css-loader')
      .loader('css-loader')
      .options(
        Object.assign(
          config.module
            .rule('less')
            .oneOf('normal')
            .uses.get('css-loader')
            .get('options'),
          {
            // minimize: false,
            url: false
          }
        )
      )
      .end()
      .use('less-loader')
      .loader('less-loader')
      .options(
        Object.assign(
          config.module
            .rule('less')
            .oneOf('normal')
            .uses.get('less-loader')
            .get('options'),
          {
            // minimize: false,
            url: false
          }
        )
      )
      .end();

    // // TO DO
    // // Needs to be added and converted to webpack Chain
    // if (unitTesting) {
    //   config.module.rules.push(
    //       {
    //           test: /-page\.js$/,
    //           use: "nativescript-dev-webpack/script-hot-loader"
    //       },
    //       {
    //           test: /\.(html|xml)$/,
    //           use: "nativescript-dev-webpack/markup-hot-loader"
    //       },

    //       { test: /\.(html|xml)$/, use: "nativescript-dev-webpack/xml-namespace-loader" }
    //   );
    // }

    // delete these rules that come standard with CLI 3
    // need to look at adding these back in after evaluating impact
    config.module.rules.delete('images').end();

    // only delete the plugin if we aren't calling for HMR
    if (!env.hmr) {
      config.plugins.delete('hmr');
    }

    // delete these plugins that come standard with CLI 3
    config.plugins.delete('html');
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
    config.plugins.delete('pwa');
    config.plugins.delete('progress');
    config.plugins.delete('case-sensitive-paths');
    config.plugins.delete('friendly-errors');
    config.plugins.delete('no-emit-on-errors');
    config.plugins.delete('copy').end();

    if (mode === 'production') {
      config.plugins.delete('extract-css');
      config.plugins.delete('optimize-css');
      config.plugins.delete('hash-module-ids');
      config.plugins.delete('named-chunks');
    }

    // create new plugins
    config
      .plugin('vue-loader')
      .use(VueLoaderPlugin, [])
      .end();

    // Define useful constants like TNS_WEBPACK
    // Merge DefinePlugin options that come in native from CLI 3
    config
      .plugin('define')
      .use(DefinePlugin, [
        Object.assign(config.plugin('define').get('args')[0], {
          'global.TNS_WEBPACK': 'true',
          TNS_ENV: JSON.stringify(mode),
          process: 'global.process'
        })
      ])
      .end();

    // Remove all files from the out dir.
    config
      .plugin('clean')
      .use(CleanWebpackPlugin, [
        itemsToClean,
        { verbose: !!verbose }
        // join(dist, '/**/*'),
        // {
        //   root: dist
        // }
      ])
      .end();

    // Copy native app resources to out dir.
    // only if doing a full build (tns run/build) and not previewing (tns preview)
    if (!externals || externals.length === 0) {
      config
        .plugin('copy-native-resources')
        .use(CopyWebpackPlugin, [
          [
            {
              from: `${appResourcesFullPath}/${appResourcesPlatformDir}`,
              to: `${dist}/App_Resources/${appResourcesPlatformDir}`,
              context: projectRoot
            }
          ]
        ])
        .end();
    }

    // Copy assets to the out dir.
    config
      .plugin('copy-assets')
      .use(CopyWebpackPlugin, [
        [
          {
            from: {
              glob: 'fonts/**'
            }
          },
          {
            from: {
              glob: '**/*.+(jpg|png)'
            }
          },
          {
            from: {
              glob: 'assets/**/*'
            }
          }
        ],
        {
          context: resolve(isNativeOnly === true ? appFullPath : api.resolve('src')),
          ignore: [`${relative(appPath, appResourcesFullPath)}/**`]
        }
      ])
      .end();

    // Generate a bundle starter script and activate it in package.json
    config
      .plugin('generate-bundle-starter')
      .use(nsWebpack.GenerateBundleStarterPlugin, [
        // // // ['./vendor', './bundle'] --> TO BE DELETED SOON

        // Don't include `runtime.js` when creating a snapshot. The plugin
        // configures the WebPack runtime to be generated inside the snapshot
        // module and no `runtime.js` module exist.
        (snapshot ? [] : ['./runtime']).concat(['./vendor', './bundle'])
      ])
      .end();

    // For instructions on how to set up workers with webpack
    // check out https://github.com/nativescript/worker-loader
    config
      .plugin('nativescript-worker')
      .use(NativeScriptWorkerPlugin, [])
      .end();

    config
      .plugin('platform-FS')
      .use(nsWebpack.PlatformFSPlugin, [
        {
          platform,
          platforms
        }
      ])
      .end();

    // Does IPC communication with the {N} CLI to notify events when running in watch mode.
    config
      .plugin('watch-state-logger')
      .use(nsWebpack.WatchStateLoggerPlugin, [])
      .end();

    // Another only do this if we're using typescript.  this code could have been put
    // with the ts-loader section but left it here near the rest of the plugin config
    if (api.hasPlugin('typescript')) {
      // Next section is weird as we have to copy the plugin's config, edit the copy
      // delete the plugin and then add the plugin back in with the saved config.
      // This is all because webpack-chain cannot access the 'tslint' option of the plugin
      // directly to edit it.
      const forTSPluginConfig = config.plugin('fork-ts-checker').get('args')[0];

      forTSPluginConfig.tsconfig = resolve(projectRoot, tsconfigFileName);
      forTSPluginConfig.tslint = fs.pathExistsSync(resolve(projectRoot, 'tslint.json')) ? resolve(projectRoot, 'tslint.json') : false;
      forTSPluginConfig.checkSyntacticErrors = false;

      config.plugins.delete('fork-ts-checker').end();

      config
        .plugin('fork-ts-checker')
        .use(require('fork-ts-checker-webpack-plugin'), [forTSPluginConfig])
        .end();
    }

    // the next several items are disabled as they are mirrored from the nativescript-dev-webpack
    // project.  Need to figure out how to integrate some of that projects cli ability into this one.
    config.when(report, (config) => {
      config
        .plugin('bundle-analyzer')
        .use(BundleAnalyzerPlugin, [
          {
            analyzerMode: 'static',
            openAnalyzer: false,
            generateStatsFile: true,
            reportFilename: resolve(projectRoot, 'report', `report.html`),
            statsFilename: resolve(projectRoot, 'report', `stats.json`)
          }
        ])
        .end();
    });

    config.when(snapshot, (config) => {
      config
        .plugin('snapshot')
        .use(nsWebpack.NativeScriptSnapshotPlugin, [
          {
            chunk: 'vendor',
            requireModules: ['tns-core-modules/bundle-entry-points'],
            projectRoot,
            webpackConfig: config
          }
        ])
        .end();
    });
  });
};

const webConfig = (api, projectOptions, env, projectRoot) => {
  console.log('starting webConfig');
  const dist = projectOptions.outputDir;

  const {
    // The 'appPath' and 'appResourcesPath' values are fetched from
    // the nsconfig.json configuration file
    // when bundling with `tns run android|ios --bundle`.
    appPath = 'src',
    appResourcesPath = join(appPath, 'App_Resources'),

    // You can provide the following flags when running 'tns run android|ios'
    // snapshot, // --env.snapshot
    production // --env.production
    // report, // --env.report
    // hmr // --env.hmr
  } = env;

  const mode = production ? 'production' : 'development';
  const appResourcesFullPath = resolve(projectRoot, appResourcesPath);

  api.chainWebpack((config) => {
    config.entry('app').clear();
    config.entry('app').add(resolve(api.resolve('src'), 'main'));

    config.output.path(dist).end();

    config.resolve.alias
      .delete('@')
      .set('@', api.resolve('src'))
      .set('~', api.resolve('src'))
      .set('src', api.resolve('src'))
      .set('assets', resolve(api.resolve('src'), 'assets'))
      .set('components', resolve(api.resolve('src'), 'components'))
      .set('fonts', resolve(api.resolve('src'), 'fonts'))
      .set('styles', resolve(api.resolve('src'), 'styles'))
      .set('root', projectRoot)
      .end();

    config.resolve.extensions.clear();

    for (let ext of resolveExtensionsOptions.web) {
      resolveExtensions(config, ext);
    }

    config.module
      .rule('vue')
      .use('cache-loader')
      .loader('cache-loader')
      .tap((options) => {
        options.cacheDirectory = config.module
          .rule('vue')
          .uses.get('cache-loader')
          .get('options').cacheDirectory;
        return options;
      })
      .end()
      .use('vue-loader')
      .loader('vue-loader')
      .options(
        Object.assign(
          {},
          config.module
            .rule('vue')
            .uses.get('vue-loader')
            .get('options')
        )
      )
      .end()
      .use('string-replace-loader')
      .loader('string-replace-loader')
      .options(
        Object.assign(
          {
            multiple: [
              {
                search: getBlockRegex('template', 'native'),
                replace: '',
                flags: 'gim',
                strict: false
              },
              {
                search: getBlockRegex('script', 'native'),
                replace: '',
                flags: 'gim',
                strict: false
              },
              {
                search: getBlockRegex('style', 'native'),
                replace: '',
                flags: 'gim',
                strict: false
              }
            ]
          },
          {}
        )
      )
      .end();

    const imageLoaderOptions = config.module
      .rule('images')
      .uses.get('url-loader')
      .get('options');
    imageLoaderOptions.fallback.options.name = 'assets/[name][hash:8].[ext]';
    config.module.rules.delete('images');

    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
      .use('url-loader')
      .loader('url-loader')
      .options(imageLoaderOptions)
      .end();

    // // // // Define useful constants like TNS_WEBPACK
    // // // // Merge DefinePlugin options that come in native from CLI 3
    // // // config
    // // //   .plugin('define')
    // // //   .use(DefinePlugin, [
    // // //     Object.assign(config.plugin('define').get('args')[0], {
    // // //       TNS_ENV: JSON.stringify(mode),
    // // //       TNS_APP_PLATFORM: JSON.stringify(process.env.VUE_APP_PLATFORM),
    // // //       TNS_APP_MODE: JSON.stringify(process.env.VUE_APP_MODE)
    // // //     })
    // // //   ])
    // // //   .end();

    // Remove all files from the out dir.
    config
      .plugin('clean')
      .use(CleanWebpackPlugin, [
        join(dist, '/**/*'),
        {
          root: dist
        }
      ])
      .end();

    // Copy assets to out dir. Add your own globs as needed.
    // if the project is native-only then we want to copy files
    // from the app directory and not the src directory as at
    // that point, the src directory should have been removed
    // when the plugin was originally invoked.
    config
      .plugin('copy-assets')
      .use(CopyWebpackPlugin, [
        [
          {
            from: {
              glob: 'fonts/**'
            }
          },
          {
            from: {
              glob: '**/*.+(jpg|png)'
            }
          },
          {
            from: {
              glob: 'assets/**/*',
              ignore: ['**/*.+(jpg|png)']
            }
          }
        ],
        {
          context: resolve(api.resolve('src')),
          ignore: [`${relative(appPath, appResourcesFullPath)}/**`]
        }
      ])
      .end();

    // only adjust ts-loaders when we're using typescript in the project
    if (api.hasPlugin('typescript')) {
      const tsConfigOptions = config.module
        .rule('ts')
        .uses.get('ts-loader')
        .get('options');

      tsConfigOptions.configFile = resolve(projectRoot, 'tsconfig.json');

      config.module
        .rule('ts')
        .test(/\.ts$/)
        .use('ts-loader')
        .loader('ts-loader')
        .options(tsConfigOptions)
        .end();

      const tsxConfigOptions = config.module
        .rule('ts')
        .uses.get('ts-loader')
        .get('options');

      tsxConfigOptions.configFile = resolve(projectRoot, 'tsconfig.json');

      config.module
        .rule('tsx')
        .test(/\.tsx$/)
        .use('ts-loader')
        .loader('ts-loader')
        .options(tsxConfigOptions)
        .end();

      // Next section is weird as we have to copy the plugin's config, edit the copy
      // delete the plugin and then add the plugin back in with the saved config.
      // This is all because webpack chain cannot access the 'tslint' option of the plugin
      // directly to edit it.
      const forTSPluginConfig = config.plugin('fork-ts-checker').get('args')[0];

      forTSPluginConfig.tsconfig = resolve(projectRoot, 'tsconfig.json');
      forTSPluginConfig.tslint = fs.pathExistsSync(resolve(projectRoot, 'tslint.json')) ? resolve(projectRoot, 'tslint.json') : false;

      config.plugins.delete('fork-ts-checker').end();

      config
        .plugin('fork-ts-checker')
        .use(require('fork-ts-checker-webpack-plugin'), [forTSPluginConfig])
        .end();
    }
  });
};
