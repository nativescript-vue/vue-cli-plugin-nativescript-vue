/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
const { relative, resolve, sep, join } = require('path');
const fs = require('fs-extra');

const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');

// // // const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');

const nativescriptTarget = require('nativescript-dev-webpack/nativescript-target');
const NsVueTemplateCompiler = require('nativescript-vue-template-compiler');
const nsWebpack = require('nativescript-dev-webpack');

// eslint-disable-next-line prefer-destructuring
const PlatformFSPlugin = nsWebpack.PlatformFSPlugin;
// eslint-disable-next-line prefer-destructuring
const WatchStateLoggerPlugin = nsWebpack.WatchStateLoggerPlugin;
const { NativeScriptWorkerPlugin } = require('nativescript-worker-loader/NativeScriptWorkerPlugin');

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
  //return `<${tag} ${mode}([\\s]+[\\S]+(="[\\S]+")?)*[\\s]*>[\\s\\S]*?<\/${tag}>`;
  return `^((<${tag})(.+\\b${mode}\\b))([\\s\\S]*?>)[\\s\\S]*?(<\\/${tag}>)`;
};

module.exports = (api, projectOptions) => {
  const jsOrTs = api.hasPlugin('typescript') ? '.ts' : '.js';
  let env = new Object();
  let flags = new Array();

  const addOption = (all, current) => {
    all[current] = true;
    return all;
  };

  // are we using the vue cli or not and if so are we passing in the correct options
  if (api && api.service.mode && api.service.mode !== 'development') {
    // will convert the --mode options into an array for later use
    flags = api.service.mode.split('.');
  } else {
    // get the --env command line options and put them in the env variable
    const [, , ...processArgs] = process.argv;
    flags = [...processArgs].filter((f) => f.startsWith('--env.')).map((f) => f.substring(6));

    // take advantage of the vue cli api to load the --env items into process.env.
    // we are filtering out the items, by catching the '=' sign, brought in from nsconfig.json as those don't need loaded into process.env
    // we are also filtering out 'sourceMap' which will appear with 'tns debug'
    api.service.loadEnv(flags.filter((o) => !o.includes('=') && !o.includes('sourceMap')).join('.'));
  }

  // setup the traditional {N} webpack 'env' variable
  env = flags.reduce(addOption, {});

  const platform = env && ((env.android && 'android') || (env.ios && 'ios') || (env.web && 'web'));

  // if (!platform) {
  //   throw new Error('You need to provide a target platform!');
  // }

  const projectRoot = api.service.context;
  const appMode = platform === 'android' ? 'native' : platform === 'ios' ? 'native' : 'web';

  // setup output directory depending on if we're building for web or native
  projectOptions.outputDir = join(projectRoot, appMode === 'web' ? 'dist' : nsWebpack.getAppPath(platform, projectRoot));

  return appMode === 'web' ? webConfig(api, projectOptions, env, jsOrTs, projectRoot) : nativeConfig(api, projectOptions, env, jsOrTs, projectRoot, platform);
};

const resolveExtensions = (config, ext) => {
  config.resolve.extensions.add(ext).end();
};

const nativeConfig = (api, projectOptions, env, jsOrTs, projectRoot, platform) => {
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
    hmr // --env.hmr
  } = env;

  // --env.externals
  const externals = (env.externals || []).map((e) => {
    return new RegExp(e + '.*');
  });

  const mode = production ? 'production' : 'development';

  const appFullPath = resolve(projectRoot, appPath);
  const appResourcesFullPath = resolve(projectRoot, appResourcesPath);
  const entryModule = nsWebpack.getEntryModule(appFullPath);
  const entryPath = `.${sep}${entryModule}`;

  console.log(`Bundling application for entryPath ${entryPath}...`);

  api.chainWebpack((config) => {
    config
      .mode(mode)
      .context(appFullPath)
      .devtool('none')
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
      .add(entryPath)
      .end();

    // clear out old config.output and install new
    config.output.clear().end();

    config.output
      .pathinfo(false)
      .path(dist)
      .libraryTarget('commonjs2')
      .filename(`[name].js`)
      .globalObject('global')
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
      .minimizer([
        new TerserPlugin({
          parallel: true,
          cache: true,
          terserOptions: {
            output: {
              comments: false
            },
            compress: {
              // The Android SBG has problems parsing the output
              // when these options are enabled
              collapse_vars: platform !== 'android',
              sequences: platform !== 'android'
            }
          }
        })
      ])
      .end();

    config.module
      .rule('native-loaders')
      .test(new RegExp(entryPath))
      .use('nativescript-dev-webpack/bundle-config-loader')
      .loader('nativescript-dev-webpack/bundle-config-loader')
      .options({
        registerPages: true, // applicable only for non-angular apps
        loadCss: false //!snapshot // load the application css if in debug mode
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

      config.module
        .rule('ts')
        .test(/\.ts$/)
        .use('ts-loader')
        .loader('ts-loader')
        .options(tsConfigOptions)
        .end();

      config.module.rules.get('tsx').uses.delete('cache-loader');
      config.module.rules.get('tsx').uses.delete('babel-loader');
      if (mode === 'production') config.module.rules.get('tsx').uses.delete('thread-loader');

      const tsxConfigOptions = config.module
        .rule('tsx')
        .uses.get('ts-loader')
        .get('options');

      tsxConfigOptions.configFile = resolve(projectRoot, tsconfigFileName);

      config.module
        .rule('tsx')
        .test(/\.tsx$/)
        .use('ts-loader')
        .loader('ts-loader')
        .options(tsxConfigOptions)
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
    config.module.rules
      .get('css')
      .oneOfs.get('normal')
      .uses.delete('postcss-loader');
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
            minimize: false,
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
    config.module.rules
      .get('scss')
      .oneOfs.get('normal')
      .uses.delete('postcss-loader');
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
            minimize: false,
            url: false,
            data: '$PLATFORM: ' + platform + ';'
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
            minimize: false,
            url: false,
            data: '$PLATFORM: ' + platform + ';'
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
    config.module.rules
      .get('sass')
      .oneOfs.get('normal')
      .uses.delete('postcss-loader');
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
            minimize: false,
            url: false,
            data: '$PLATFORM: ' + platform + ';'
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
            url: false,
            data: '$PLATFORM: ' + platform + ';'
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
    config.module.rules
      .get('stylus')
      .oneOfs.get('normal')
      .uses.delete('postcss-loader');
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
            minimize: false,
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
    config.module.rules
      .get('less')
      .oneOfs.get('normal')
      .uses.delete('postcss-loader');
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
            minimize: false,
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
            minimize: false,
            url: false
          }
        )
      )
      .end();

    // delete these rules that come standard with CLI 3
    // need to look at adding these back in after evaluating impact
    config.module.rules.delete('images');
    config.module.rules.delete('svg');
    config.module.rules.delete('media');
    config.module.rules.delete('fonts');
    config.module.rules.delete('pug');
    config.module.rules.delete('postcss');
    // // config.module.rules.delete('less');
    // // config.module.rules.delete('stylus');
    config.module.rules.delete('eslint').end();

    // delete these plugins that come standard with CLI 3
    config.plugins.delete('hmr');
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

    // Define useful constants like TNS_WEBPACK
    // Merge DefinePlugin options that come in native from CLI 3
    config
      .plugin('define')
      .use(DefinePlugin, [
        Object.assign(config.plugin('define').get('args')[0], {
          TNS_ENV: JSON.stringify(mode)
        })
      ])
      .end();

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

    // Copy native app resources to out dir.
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
      .use(nsWebpack.GenerateBundleStarterPlugin, [['./vendor', './bundle']])
      .end();

    // For instructions on how to set up workers with webpack
    // check out https://github.com/nativescript/worker-loader
    config
      .plugin('nativescript-worker')
      .use(NativeScriptWorkerPlugin, [])
      .end();

    config
      .plugin('platform-FS')
      .use(PlatformFSPlugin, [
        {
          platform,
          platforms
        }
      ])
      .end();

    // Does IPC communication with the {N} CLI to notify events when running in watch mode.
    config
      .plugin('watch-state-logger')
      .use(WatchStateLoggerPlugin, [])
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

    // // // the next several items are disabled as they are mirrored from the nativescript-dev-webpack
    // // // project.  Need to figure out how to integrate some of that projects cli ability into this one.
    // 	// config.when(report, (config) => {
    // 	// 	config
    // 	// 		.plugin('bundle-analyzer')
    // 	// 		.use(BundleAnalyzerPlugin, [
    // 	// 			{
    // 	// 				analyzerMode: 'static',
    // 	// 				openAnalyzer: false,
    // 	// 				generateStatsFile: true,
    // 	// 				reportFilename: resolve(projectRoot, 'report', `report.html`),
    // 	// 				statsFilename: resolve(projectRoot, 'report', `stats.json`)
    // 	// 			}
    // 	// 		])
    // 	// 		.end();
    // 	// });

    // 	// config.when(snapshot, (config) => {
    // 	// 	config
    // 	// 		.plugin('snapshot')
    // 	// 		.use(nsWebpack.NativeScriptSnapshotPlugin, [
    // 	// 			{
    // 	// 				chunk: 'vendor',
    // 	// 				requireModules: ['tns-core-modules/bundle-entry-points'],
    // 	// 				projectRoot,
    // 	// 				webpackConfig: config
    // 	// 			}
    // 	// 		])
    // 	// 		.end();
    // 	// });

    // 	// config.when(hmr, (config) => {
    // 	// 	config
    // 	// 		.plugin('hmr')
    // 	// 		.use(webpack.HotModuleReplacementPlugin(), [])
    // 	// 		.end();
    // 	// });
  });
};

const webConfig = (api, projectOptions, env, jsOrTs, projectRoot) => {
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
    config.entry('app').add(resolve(api.resolve('src'), 'main' + jsOrTs));

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
