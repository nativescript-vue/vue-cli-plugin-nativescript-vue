/* eslint-disable no-console */
const path = require('path');
const fs = require('fs-extra');
const replace = require('replace-in-file');

const newline = process.platform === 'win32' ? '\r\n' : '\n';

module.exports = async (api, options, rootOptions) => {
  // console.log('options.isNativeOrDual - ', options.isNativeOrDual);
  // console.log('options.isNVW - ', options.isNVW);
  // console.log('options.isNewProject - ', options.isNewProject);
  // console.log('options.templateType - ', options.templateType);

  // console.log('usingTS - ', api.hasPlugin('typescript'));
  // console.log('usingBabel - ', api.hasPlugin('babel'));
  // console.log('rootOptions.cssPreprocessor - ', rootOptions.cssPreprocessor);

  if (options.isNVW === undefined) options.isNVW = false;

  const genConfig = {
    // if it is a new project changes will be written as they normally would with any plugin
    // if it is an existing project, changes will be added to the ./ns-example directory
    dirPathPrefix: options.isNewProject === true ? './' : './ns-example/',

    // simple typescript detection and then variable is passed to multiple templating functions
    // to simply change the file's extension
    jsOrTs: api.hasPlugin('typescript') ? '.ts' : '.js',

    // A template type of 'simple' project will have a base template path that equals: ./templates/simple
    // then we determine if the project is using Nativescript-Vue-Web and we append a subdirectory to the base path
    templateTypePathModifer: options.isNVW === false ? options.templateType + '/' + 'without-nvw' : options.templateType + '/' + 'with-nvw',

    // Get the location to the native app directory
    nativeAppPathModifier: options.isNVW ? 'src/' : 'app/',

    // Determine the path to App_Resources
    get appResourcesPathModifier() {
      return this.nativeAppPathModifier + 'App_Resources';
    },

    // setup directories to exclude in the tsconfig.json file(s)
    get tsExclusionArray() {
      return ['node_modules', 'dist', 'platforms', 'hooks', this.appResourcesPathModifier];
    }
  };

  // New Project & Native Only -- should never be able to use Nativescript-Vue-Web
  if (options.isNativeOrDual === 'native' && options.isNVW) {
    throw Error('Invalid options chosen.  You cannot have a Native only project and use Nativescript-Vue-Web');
  }

  // if Native only, then we make absolutely sure you will not be able to
  // add NativeScript-Vue-Web into the project as it's not needed
  if (options.isNativeOrDual === 'native') options.isNVW = false;

  // common render options to be passed to render functions
  const commonRenderOptions = {
    applicationName: api.generator.pkg.name,
    applicationVersion: api.generator.pkg.version,
    applicationAndroidVersionCode: api.generator.pkg.version.split('.').join('0'),
    applicationDescription: api.generator.pkg.description || api.generator.pkg.name,
    applicationLicense: api.generator.pkg.license || 'MIT',
    applicationId: options.applicationId,
    historyMode: options.historyMode,
    // doesCompile: api.hasPlugin('babel') || api.hasPlugin('typescript'),
    // usingBabel: api.hasPlugin('babel'),
    // usingTS: api.hasPlugin('typescript'),
    // usingNVW: options.isNVW
    doesCompile: api.hasPlugin('babel') || api.hasPlugin('typescript') ? true : false,
    usingBabel: api.hasPlugin('babel') ? true : false,
    usingTS: api.hasPlugin('typescript') ? true : false,
    usingNVW: options.isNVW ? true : false
  };

  console.log('adding to package.json');

  api.extendPackage({
    nativescript: {
      id: 'org.nativescript.application',
      'tns-ios': {
        version: '4.2.0'
      },
      'tns-android': {
        version: '4.2.0'
      }
    },
    scripts: {
      'build:android':
        // eslint-disable-next-line max-len
        'npm run setup-webpack-config && cross-env-shell VUE_CLI_MODE=production.android tns build android --bundle --env.production && npm run remove-webpack-config',
      'build:ios':
        'npm run setup-webpack-config && cross-env-shell VUE_CLI_MODE=production.ios tns build ios --bundle --env.production && npm run remove-webpack-config',
      'remove-webpack-config': 'node ./node_modules/vue-cli-plugin-nativescript-vue/lib/scripts/webpack-maintenance post',
      'serve:android': 'npm run setup-webpack-config && cross-env-shell VUE_CLI_MODE=development.android tns run android --bundle --env.development',
      'serve:ios': 'npm run setup-webpack-config && cross-env-shell VUE_CLI_MODE=development.ios tns run ios --bundle --env.development',
      'inspect:android': 'npm run setup-webpack-config && vue inspect -- --env.android > out-android.js',
      'inspect:ios': 'npm run setup-webpack-config && vue inspect -- --env.ios > out-ios.js',
      'setup-webpack-config': 'node ./node_modules/vue-cli-plugin-nativescript-vue/lib/scripts/webpack-maintenance pre'
    },
    dependencies: {
      'nativescript-vue': '^2.0.2',
      'tns-core-modules': '^4.2.1'
    },
    devDependencies: {
      'cross-env': '^5.2.0',
      'nativescript-dev-webpack': '^0.17.0',
      'nativescript-vue-template-compiler': '^2.0.2',
      'nativescript-worker-loader': '~0.9.1'
    }
  });

  // add scripts when we are also developing for the web
  if (options.isNativeOrDual === 'dual') {
    api.extendPackage({
      scripts: {
        'serve:web': 'vue-cli-service serve --mode development.web --env.development --env.web',
        'build:web': 'vue-cli-service build --mode production.web --env.production --env.web',
        'inspect:web': 'npm run setup-webpack-config && vue inspect -- --env.web > out-web.js'
      }
    });

    // if we are using NativeScript-Vue-Web then add the package
    if (options.isNVW) {
      api.extendPackage({
        dependencies: {
          'nativescript-vue-web': '^0.9.0'
        }
      });
    }
  } else {
    //
  }

  if (api.hasPlugin('typescript')) {
    api.extendPackage({
      dependencies: {},
      devDependencies: {
        'fork-ts-checker-webpack-plugin': '^0.4.15',
        'uglifyjs-webpack-plugin': '^2.0.1'
        //'tns-platform-declarations': '^4.2.1'
      }
    });

    // this means it's a typescript project and using babel
    if (api.hasPlugin('babel')) {
      api.extendPackage({
        dependencies: {},
        devDependencies: {
          '@babel/types': '^7.1.3'
        }
      });
    }

    // render tsconfig files
    api.render(async () => {
      // render tsconfig.web.json for all Dual Web/NS projects
      if (options.isNativeOrDual === 'dual') {
        await renderFilesIndividually(
          api,
          options,
          genConfig.jsOrTs,
          ['tsconfig.web.json'],
          commonRenderOptions,
          './templates/' + options.templateType,
          genConfig.dirPathPrefix
        );
      }
      // render tsconfig.native.json for:
      // 1.  Dual Web/NS projects that don't use NativeScript-Vue-Web
      // 2.  Native Only
      if (!options.isNVW) {
        await renderFilesIndividually(
          api,
          options,
          genConfig.jsOrTs,
          ['tsconfig.native.json'],
          commonRenderOptions,
          './templates/' + options.templateType,
          genConfig.dirPathPrefix
        );
      }
    });
  }

  // if the project is using babel, then load appropriate packages
  if (api.hasPlugin('babel')) {
    api.extendPackage({
      devDependencies: {
        '@babel/core': '^7.1.2',
        '@babel/preset-env': '^7.1.0',
        'babel-loader': '^8.0.4',
        'babel-traverse': '^6.26.0'
      }
    });

    api.render(async () => {
      fs.ensureFileSync(genConfig.dirPathPrefix + 'babel.config.js');
      await applyBabelConfig(api, genConfig.dirPathPrefix + 'babel.config.js');
    });
  }

  console.log('deleting from package.json');
  api.extendPackage((pkg) => {
    // if the project is using babel, then delete babel-core
    if (api.hasPlugin('babel')) {
      delete pkg.devDependencies['babel-core'];
    }
    // we will be replacing these
    delete pkg.scripts['serve'], delete pkg.scripts['build'];

    if (options.isNativeOrDual === 'native') {
      // delete pkg.dependencies['vue']
      delete pkg.browserslist;
    }

    if (!options.isNVW) {
      delete pkg.dependencies['nativescript-vue-web'];
    }
  });

  console.log('doing template rendering');

  // render App_Resources folder
  api.render(async () => {
    // eslint-disable-next-line prettier/prettier
    await renderDirectory(
      api,
      options,
      '.js',
      commonRenderOptions,
      './templates/App_Resources',
			genConfig.dirPathPrefix + genConfig.appResourcesPathModifier
		)
  });

  // If Native only or Dual Native and Web Project.
  if (options.isNativeOrDual === 'dual') {
    api.render(async () => {
      // render src directory
      await renderDirectory(
        api,
        options,
        genConfig.jsOrTs,
        commonRenderOptions,
        path.join('templates', genConfig.templateTypePathModifer, 'src'),
        genConfig.dirPathPrefix + 'src'
      );

      if (!options.isNVW) {
        // render app directory seperately
        await renderDirectory(
          api,
          options,
          genConfig.jsOrTs,
          commonRenderOptions,
          path.join('templates', genConfig.templateTypePathModifer, 'app'),
          genConfig.dirPathPrefix + 'app'
        );
      }

      // add router statements to src/main.*s
      await vueRouterSetup(api, genConfig.dirPathPrefix, genConfig.jsOrTs);

      // add vuex statements to src/main.*s
      await vuexSetup(api, options, genConfig.dirPathPrefix, genConfig.jsOrTs, genConfig.nativeAppPathModifier);
    });
  } else {
    // Is Native Only
    api.render(async () => {
      // render app directory
      await renderDirectory(
        api,
        options,
        genConfig.jsOrTs,
        commonRenderOptions,
        path.join('templates', genConfig.templateTypePathModifer, 'app'),
        genConfig.dirPathPrefix + genConfig.nativeAppPathModifier.slice(0, -1)
      );

      // render styles directory
      await renderDirectory(
        api,
        options,
        genConfig.jsOrTs,
        commonRenderOptions,
        path.join('templates', genConfig.templateTypePathModifer, 'src', 'styles'),
        path.join(genConfig.dirPathPrefix + genConfig.nativeAppPathModifier.slice(0, -1), 'styles')
      );
      // add vuex statements to app/main.*s
      await vuexSetup(api, options, genConfig.dirPathPrefix, genConfig.jsOrTs);
    });
  }

  api.onCreateComplete(() => {
    // make changes to .gitignore
    gitignoreAdditions(api);

    // create files in ./ or ./ns-example
    writeRootFiles(api, options, genConfig.dirPathPrefix);

    // create nsconfig.json in ./ or ./ns-example
    nsconfigSetup(genConfig.dirPathPrefix, api.resolve('nsconfig.json'), genConfig.nativeAppPathModifier, genConfig.appResourcesPathModifier);

    if (api.hasPlugin('typescript')) {
      tslintSetup(genConfig.dirPathPrefix, api.resolve('tslint.json'), genConfig.tsExclusionArray);

      // we need to edit the tsconfig.json file in /app
      // for a Native only project to remove references to /src
      //////if (options.isNativeOrDual === 'native') {
      tsconfigSetup(options, genConfig.dirPathPrefix, genConfig.nativeAppPathModifier);
      //////}
    }

    // the main difference between New and Existing for this section is
    // that for New projects we are moving files around, but for
    // existing projects we are copying files into ./ns-example
    if (options.isNewProject) {
      // move type files out of src to ./ or ./ns-example
      if (api.hasPlugin('typescript')) {
        // Do these synchronously so in the event we delete the ./src directory in a native only
        // situation below we don't try and move a file that no longer exists
        try {
          fs.moveSync('./src/shims-tsx.d.ts', genConfig.dirPathPrefix + 'types/shims-tsx.d.ts', { overwrite: true });
          fs.moveSync('./src/shims-vue.d.ts', genConfig.dirPathPrefix + 'types/shims-vue.d.ts', { overwrite: true });
        } catch (err) {
          throw err;
        }
      }

      // for new projects that are native only, move files/dirs and delete others
      if (options.isNativeOrDual === 'native') {
        // Do these synchronously so that when we delete the ./src directory below
        // we don't try and move a file that no longer exists
        try {
          // move store.js file from ./src to ./app
          if (api.hasPlugin('vuex')) {
            fs.moveSync('./src/store' + genConfig.jsOrTs, genConfig.dirPathPrefix + genConfig.nativeAppPathModifier + 'store' + genConfig.jsOrTs, {
              overwrite: true
            });
          }
          // move assets directory from ./src/assets to ./app/assets
          fs.moveSync('./src/assets', genConfig.dirPathPrefix + genConfig.nativeAppPathModifier + 'assets', { overwrite: true });
        } catch (err) {
          throw err;
        }
        // remove src directory as we don't need it any longer
        fs.remove('./src', (err) => {
          if (err) throw err;
        });
        // remove public directory as we don't need it any longer
        fs.remove('./public', (err) => {
          if (err) throw err;
        });
      }
      //} else if (options.isNewProject && options.isNVW) {
      // don't do anything yet
    } else if (!options.isNewProject) {
      // copy type files from ./src to ./ns-example
      if (api.hasPlugin('typescript')) {
        fs.copy('./src/shims-tsx.d.ts', path.join(genConfig.dirPathPrefix, 'types/shims-tsx.d.ts'), (err) => {
          if (err) throw err;
        });

        fs.copy('./src/shims-vue.d.ts', path.join(genConfig.dirPathPrefix, 'types/shims-vue.d.ts'), (err) => {
          if (err) throw err;
        });
      }

      if (options.isNativeOrDual === 'native') {
        // move store.js file from ./src to ./ns-example/app
        if (api.hasPlugin('vuex')) {
          fs.copy('./src/store' + genConfig.jsOrTs, genConfig.dirPathPrefix + genConfig.nativeAppPathModifier + 'store' + genConfig.jsOrTs, (err) => {
            if (err) throw err;
          });
        }

        // copy assets directory from ./src/assets to ./ns-example/app/assets
        fs.copy('./src/assets', genConfig.dirPathPrefix + genConfig.nativeAppPathModifier + 'assets', (err) => {
          if (err) throw err;
        });
      }
    } else {
      // nothing to do here
    }
  });
};

// setup vue-router options
// will not setup any vue-router options for native app
// for new projects it will write to changes as normal
// and for existing projects it will write  changes to the ./ns-example directory
const vueRouterSetup = (module.exports.vueRouterSetup = async (api, filePathPrefix, jsOrTs) => {
  try {
    if (api.hasPlugin('vue-router')) {
      api.injectImports(filePathPrefix.replace(/.\//, '') + 'src/main' + jsOrTs, `import router from './router';`);
      api.injectRootOptions(filePathPrefix.replace(/.\//, '') + 'src/main' + jsOrTs, `router`);
    }
  } catch (err) {
    throw err;
  }
});

// setup Vuex options
// for new projects it will write to changes as normal
// and for existing projects it will write  changes to the ./ns-example directory
const vuexSetup = (module.exports.vuexSetup = async (api, options, filePathPrefix, jsOrTs, nativeAppPathModifier) => {
  try {
    if (api.hasPlugin('vuex')) {
      if (options.isNativeOrDual === 'dual') {
        api.injectImports(filePathPrefix.replace(/.\//, '') + 'src/main' + jsOrTs, `import store from './store';`);
        api.injectRootOptions(filePathPrefix.replace(/.\//, '') + 'src/main' + jsOrTs, `store`);

        // if we're using Nativescript-Vue-Web, then we have to modify the main.native file
        if (options.isNVW) {
          api.injectImports(filePathPrefix.replace(/.\//, '') + 'src/main.native' + jsOrTs, `import store from './store';`);
          api.injectRootOptions(filePathPrefix.replace(/.\//, '') + 'src/main.native' + jsOrTs, `store`);
        } else {
          api.injectImports(filePathPrefix.replace(/.\//, '') + nativeAppPathModifier + 'main' + jsOrTs, `import store from 'src/store';`);
          api.injectRootOptions(filePathPrefix.replace(/.\//, '') + nativeAppPathModifier + 'main' + jsOrTs, `store`);
        }
      } else {
        // if it's native only, it will not do anything in /src directory
        api.injectImports(filePathPrefix.replace(/.\//, '') + nativeAppPathModifier + 'main' + jsOrTs, `import store from './store';`);
        api.injectRootOptions(filePathPrefix.replace(/.\//, '') + nativeAppPathModifier + 'main' + jsOrTs, `store`);
      }
    }
  } catch (err) {
    throw err;
  }
});

// write out babel.config.js options by adding options and replacing the base @vue/app
// for new projects it will write to the root of the project
// and for existing projects it will write it to the ./ns-example directory
const applyBabelConfig = (module.exports.applyBabelConfig = async (api, filePath) => {
  const babelReplaceOptions = {
    files: '',
    from: "  '@vue/app'",
    to: "  process.env.VUE_PLATFORM === 'web' ? '@vue/app' : {}, " + newline + "    ['@babel/env', { targets: { esmodules: true } }]"
  };

  try {
    babelReplaceOptions.files = filePath;

    api.render((files) => {
      files[filePath] = api.genJSConfig({
        plugins: ['@babel/plugin-syntax-dynamic-import'],
        presets: ['@vue/app']
      });
      // eslint-disable-next-line no-unused-vars
      replace(babelReplaceOptions, (err, changes) => {
        if (err) throw err;
      });
    });
  } catch (err) {
    throw err;
  }
});

// write out files in the root of the project
// this includes the environment files as well as a global types file for
// Typescript projects.  for new projects it will write files to the root of the project
// and for existing projects it will write it to the ./ns-example directory
const writeRootFiles = (module.exports.writeRootFiles = async (api, options, filePathPrefix) => {
  try {
    const envDevelopmentAndroid = 'NODE_ENV=development' + newline + 'VUE_APP_PLATFORM=android' + newline + 'VUE_APP_MODE=native';
    const envDevelopmentIOS = 'NODE_ENV=development' + newline + 'VUE_APP_PLATFORM=ios' + newline + 'VUE_APP_MODE=native';
    const envProductionAndroid = 'NODE_ENV=production' + newline + 'VUE_APP_PLATFORM=android' + newline + 'VUE_APP_MODE=native';
    const envProductionIOS = 'NODE_ENV=production' + newline + 'VUE_APP_PLATFORM=ios' + newline + 'VUE_APP_MODE=native';

    fs.writeFileSync(
      filePathPrefix + '.env.development.android',
      envDevelopmentAndroid,
      {
        encoding: 'utf8'
      },
      (err) => {
        if (err) throw err;
      }
    );
    fs.writeFileSync(
      filePathPrefix + '.env.development.ios',
      envDevelopmentIOS,
      {
        encoding: 'utf8'
      },
      (err) => {
        if (err) throw err;
      }
    );
    fs.writeFileSync(
      filePathPrefix + '.env.production.android',
      envProductionAndroid,
      {
        encoding: 'utf8'
      },
      (err) => {
        if (err) throw err;
      }
    );
    fs.writeFileSync(
      filePathPrefix + '.env.production.ios',
      envProductionIOS,
      {
        encoding: 'utf8'
      },
      (err) => {
        if (err) throw err;
      }
    );

    // only write these out if we are also developing for the web
    if (options.isNativeOrDual === 'dual') {
      console.log('dual components env files');
      const envDevelopmentWeb = 'NODE_ENV=development' + newline + 'VUE_APP_PLATFORM=web' + newline + 'VUE_APP_MODE=web';
      const envProductionWeb = 'NODE_ENV=production' + newline + 'VUE_APP_PLATFORM=web' + newline + 'VUE_APP_MODE=web';

      fs.writeFileSync(
        filePathPrefix + '.env.development.web',
        envDevelopmentWeb,
        {
          encoding: 'utf8'
        },
        (err) => {
          if (err) throw err;
        }
      );
      fs.writeFileSync(
        filePathPrefix + '.env.production.web',
        envProductionWeb,
        {
          encoding: 'utf8'
        },
        (err) => {
          if (err) throw err;
        }
      );
    }

    // only write this out if we are using typescript
    if (api.hasPlugin('typescript')) {
      // this file is ultimately optional if you don't use any process.env.VARIABLE_NAME references in your code
      const globalTypes =
        'declare const TNS_ENV: string;' + newline + 'declare const TNS_APP_PLATFORM: string;' + newline + 'declare const TNS_APP_MODE: string;';
      fs.outputFileSync(
        filePathPrefix + 'types/globals.d.ts',
        globalTypes,
        {
          encoding: 'utf8'
        },
        (err) => {
          if (err) throw err;
        }
      );
    }
  } catch (err) {
    throw err;
  }
});

// write .gitignore additions for native app exemptions
// will make changes to the root .gitignore file regardless of new or exisiting project
const gitignoreAdditions = (module.exports.gitignoreAdditions = async (api) => {
  try {
    let gitignoreContent;
    const gitignorePath = api.resolve('.gitignore');
    const gitignoreAdditions = newline + '# NativeScript application' + newline + 'hooks' + newline + 'platforms' + newline + './webpack.config.js';

    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, {
        encoding: 'utf8'
      });
    } else {
      gitignoreContent = '';
    }

    if (gitignoreContent.indexOf(gitignoreAdditions) === -1) {
      gitignoreContent += gitignoreAdditions;

      fs.writeFileSync(
        gitignorePath,
        gitignoreContent,
        {
          encoding: 'utf8'
        },
        (err) => {
          if (err) throw err;
        }
      );
    }
  } catch (err) {
    throw err;
  }
});

// setup nsconfig.json file.  for new projects it will write to the root of the project
// and for existing projects it will write it to the ./ns-example directory
const nsconfigSetup = (module.exports.nsconfigSetup = async (dirPathPrefix, nsconfigPath, nativeAppPathModifier, appResourcesPathModifier) => {
  let nsconfigContent = '';

  try {
    if (fs.existsSync(nsconfigPath)) {
      nsconfigContent = JSON.parse(
        fs.readFileSync(nsconfigPath, {
          encoding: 'utf8'
        })
      );
    } else {
      nsconfigContent = {};
    }

    nsconfigContent.appPath = nativeAppPathModifier.slice(0, -1);
    nsconfigContent.appResourcesPath = appResourcesPathModifier;

    fs.writeFileSync(
      dirPathPrefix + 'nsconfig.json',
      JSON.stringify(nsconfigContent, null, 2),
      {
        encoding: 'utf8'
      },
      (err) => {
        if (err) console.error(err);
      }
    );
  } catch (err) {
    throw err;
  }
});

// setup tslintSetup
const tslintSetup = (module.exports.tslintSetup = async (dirPathPrefix, tslintPath, tsExclusionArray) => {
  let tslintContent = '';

  try {
    if (fs.existsSync(tslintPath)) {
      tslintContent = JSON.parse(
        fs.readFileSync(tslintPath, {
          encoding: 'utf8'
        })
      );
    } else {
      return;
    }

    // create arrays if they aren't already in tslint.json
    if (tslintContent.linterOptions.exclude === undefined) tslintContent.linterOptions.exclude = new Array();

    if (tslintContent.exclude === undefined) tslintContent.exclude = new Array();

    // add items into exclude arrays, but only if they don't already exist
    for (let item of tsExclusionArray) {
      if (!tslintContent.linterOptions.exclude.includes(item + '/**')) tslintContent.linterOptions.exclude.push(item + '/**');

      if (!tslintContent.exclude.includes(item)) tslintContent.exclude.push(item);
    }

    fs.writeFileSync(
      dirPathPrefix + 'tslint.json',
      JSON.stringify(tslintContent, null, 2),
      {
        encoding: 'utf8'
      },
      (err) => {
        if (err) console.error(err);
      }
    );
  } catch (err) {
    throw err;
  }
});

// setup tsconfig for native only projects
const tsconfigSetup = (module.exports.tsconfigSetup = async (options, dirPathPrefix, nativeAppPathModifier) => {
  try {
    if (options.isNativeOrDual === 'native') {
      // setup the abilty to edit the tsconfig.native.json file in the root of the project
      let appTsConfigContent = '';
      let appTsConfigPath = path.join(dirPathPrefix, 'tsconfig.native.json');

      if (fs.existsSync(appTsConfigPath)) {
        appTsConfigContent = fs.readJsonSync(appTsConfigPath, {
          encoding: 'utf8'
        });
      } else {
        return;
      }

      // edit some of the options in tsconfig.native.json
      delete appTsConfigContent.compilerOptions.paths['src/*'];
      appTsConfigContent.compilerOptions.paths['assets/*'] = [nativeAppPathModifier + 'assets/*'];
      appTsConfigContent.compilerOptions.paths['fonts/*'] = [nativeAppPathModifier + 'fonts/*'];
      appTsConfigContent.compilerOptions.paths['components/*'] = [nativeAppPathModifier + 'components/*'];

      // remove some items from the include array
      appTsConfigContent.include = await removeFromArray(appTsConfigContent.include, 'src/components/**/*.ts');
      appTsConfigContent.include = await removeFromArray(appTsConfigContent.include, 'src/components/**/*.tsx');
      appTsConfigContent.include = await removeFromArray(appTsConfigContent.include, 'src/components/**/*.vue');

      // add unit test directories into include array
      if (fs.existsSync(path.join(dirPathPrefix, 'tests'))) {
        if (!appTsConfigContent.include.includes('tests/**/*.ts')) appTsConfigContent.include.push('tests/**/*.ts');
        if (!appTsConfigContent.include.includes('tests/**/*.tsx')) appTsConfigContent.include.push('tests/**/*.tsx');
      }

      fs.writeJsonSync(appTsConfigPath, appTsConfigContent, {
        spaces: 2,
        encoding: 'utf8'
      });
    } else {
      // setup the abilty to edit the tsconfig.web.json file in the root of the project
      let srcTsConfigContent = '';
      let srcTsConfigPath = path.join(dirPathPrefix, 'src', 'tsconfig.web.json');
      if (fs.existsSync(srcTsConfigPath)) {
        srcTsConfigContent = fs.readJsonSync(srcTsConfigPath, {
          encoding: 'utf8'
        });
      } else {
        return;
      }

      // exclude the app directory
      if (!srcTsConfigContent.exclude.includes('app')) srcTsConfigContent.exclude.push('app');

      // add unit test directories into include array
      if (fs.existsSync(path.join(dirPathPrefix, 'tests'))) {
        if (!srcTsConfigContent.include.includes('tests/**/*.ts')) srcTsConfigContent.include.push('tests/**/*.ts');
        if (!srcTsConfigContent.include.includes('tests/**/*.tsx')) srcTsConfigContent.include.push('tests/**/*.tsx');
      }

      fs.writeJsonSync(srcTsConfigPath, srcTsConfigContent, {
        spaces: 2,
        encoding: 'utf8'
      });
    }
  } catch (err) {
    throw err;
  }
});

// extract callsite file location using error stack
const extractCallDir = (module.exports.extractCallDir = () => {
  try {
    const obj = {};
    Error.captureStackTrace(obj);
    return path.dirname(obj.stack.split('\n')[3].match(/\s\((.*):\d+:\d+\)$/)[1]);
  } catch (err) {
    throw err;
  }
});

// Use the generator's render function to render individual files passed in from an array.
// Will iterate through the array and then construct and object that is passed to render()
const renderFilesIndividually = (module.exports.renderFilesIndividually = async (
  api,
  options,
  jsOrTs,
  files,
  commonRenderOptions,
  srcPathPrefix,
  destPathPrefix
) => {
  try {
    const obj = {};

    for (let file of files) {
      let newFile = file;

      if (file.slice(-3) === '.js' || file.slice(-3) === '.ts') newFile = file.substring(0, file.length - 3) + jsOrTs;

      if ((!api.hasPlugin('typescript') && file !== 'tsconfig.json') || api.hasPlugin('typescript'))
        obj[path.join(destPathPrefix, newFile)] = path.join(srcPathPrefix, file);
    }

    api.render(obj, commonRenderOptions);
  } catch (err) {
    throw err;
  }
});

// Good chunk of the following code comes from vue-cli/packages/@vue/cli/lib/GeneratorAPI.js
// Specifically the render function.  We want to render the entire directory, but passing just
// the directory to render doesn't give us the ability to tell where to put it as the cli's render
// function lacks a simple directory in and directory out option.  So, we have to get the contents
// of the passed in directory and then render each file individually to where we want it via
// the render function's isObject(source) option that we use in our renderFilesIndividually function.
const renderDirectory = (module.exports.renderDirectory = async (api, options, jsOrTs, commonRenderOptions, srcPathPrefix, destPathPrefix) => {
  try {
    const baseDir = await extractCallDir();
    const source = path.resolve(baseDir, srcPathPrefix);
    const files = new Array();

    const globby = require('globby');
    const _files = await globby(['**/*'], {
      cwd: source
    });

    for (const rawPath of _files) {
      // let filename = path.basename(rawPath);
      // // dotfiles are ignored when published to npm, therefore in templates
      // // we need to use underscore instead (e.g. "_gitignore")
      // if (filename.charAt(0) === '_' && filename.charAt(1) !== '_') {
      // 	filename = `.${filename.slice(1)}`;
      // }
      // if (filename.charAt(0) === '_' && filename.charAt(1) === '_') {
      // 	filename = `${filename.slice(1)}`;
      // }

      files.push(rawPath);
    }

    renderFilesIndividually(api, options, jsOrTs, files, commonRenderOptions, srcPathPrefix, destPathPrefix);
  } catch (err) {
    throw err;
  }
});

// utility function used to remove items from an array that match 'item'
const removeFromArray = (module.exports.removeFromArray = async (array, item) => {
  const index = array.indexOf(item);
  if (index !== -1) array.splice(index, 1);
  return array;
});
