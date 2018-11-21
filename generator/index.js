const path = require('path');
const fs = require('fs-extra');
const replace = require('replace-in-file');

const newline = process.platform === 'win32' ? '\r\n' : '\n';

module.exports = async (api, options, rootOptions) => {

  console.log('options.isNativeOnly - ', options.isNativeOnly)
  console.log('options.isNVW - ', options.isNVW)
  console.log('options.isNewProject - ', options.isNewProject)
  console.log('options.templateType - ', options.templateType);

  console.log('usingTS - ', api.hasPlugin('typescript'))
  console.log('usingBabel - ', api.hasPlugin('babel'))


  // if it is a new project changes will be written as they normally would with any plugin
  // if it is an existing project, changes will be added to the ./ns-example directory
  const dirPathPrefix = options.isNewProject === true ? './' : './ns-example/';

  // simple typescript detection and then variable is passed to multiple templating functions
  // to simply change the file's extension
  const jsOrTs = api.hasPlugin('typescript') ? '.ts' : '.js';

  // These next two variables make it possible to match the template directory structure
  // with the answers to their corrosponding prompts and have the plugin automatically
  // know which paths to take to get the correct template.  If we add template Types in the
  // future, hopefully no other work will need done to modify the plugin to accomdate 
  // the pathing to the template directories.
  //
  // For example.  A template type of 'simple' and a non NativeScript-Vue-Web project will
  // have a template path that equals: ./templates/simple/without-nvw
  // If it's a template type of 'simple' but is a NativeScript-Vue-Web project then it will
  // have a template path that equals: ./templates/simple/with-nvw
  const templateNVWPathModifier = options.isNVW === true ? 'without-nvw' : 'without-nvw'
  const templateTypePathModifer = options.templateType;


  // New Project & Native Only -- should never be able to use Nativescript-Vue-Web
  if (options.isNativeOnly === 'native' && options.isNVW) {
    throw Error('Invalid options chosen.  You cannot have a Native only project and use Nativescript-Vue-Web')
  }

  // if Native only, then we make absolutely sure you will not be able to 
  // add NativeScript-Vue-Web into the project as it's not needed
  if (options.isNativeOnly === 'native')
    options.isNVW = false;

  // common render options to be passed to render functions
  const commonRenderOptions = {
    applicationName: api.generator.pkg.name,
    applicationVersion: api.generator.pkg.version,
    applicationAndroidVersionCode: api.generator.pkg.version.split('.').join('0'),
    applicationDescription: api.generator.pkg.description || api.generator.pkg.name,
    applicationLicense: api.generator.pkg.license || 'MIT',
    applicationId: options.applicationId,
    historyMode: options.historyMode || false,
    doesCompile: api.hasPlugin('babel') || api.hasPlugin('typescript'),
    usingBabel: api.hasPlugin('babel'),
    usingTS: api.hasPlugin('typescript'),
    usingNVW: options.isNVW
  }

  console.log('adding to package.json');

  api.extendPackage({
    nativescript: {
      'id': 'org.nativescript.application',
      'tns-ios': {
        'version': '4.2.0'
      },
      'tns-android': {
        'version': '4.2.0'
      }
    },
    scripts: {
      "setup-webpack-config": "node ./node_modules/vue-cli-plugin-nativescript-vue/lib/scripts/webpack-maintenance pre",
      "remove-webpack-config": "node ./node_modules/vue-cli-plugin-nativescript-vue/lib/scripts/webpack-maintenance post",
      "serve:android": "npm run setup-webpack-config && cross-env-shell VUE_CLI_MODE=development.android tns run android --bundle",
      "serve:ios": "npm run setup-webpack-config && cross-env-shell VUE_CLI_MODE=development.ios tns run ios --bundle",
      "build:android": "npm run setup-webpack-config && cross-env-shell VUE_CLI_MODE=production.android tns run android --bundle && npm run remove-webpack-config",
      "build:ios": "npm run setup-webpack-config && cross-env-shell VUE_CLI_MODE=production.ios tns run ios --bundle && npm run remove-webpack-config",
    },
    dependencies: {
      'nativescript-vue': '^2.0.2',
      'tns-core-modules': '^4.2.1',
    },
    devDependencies: {
      'cross-env': '^5.2.0',
      'nativescript-dev-webpack': '^0.17.0',
      'nativescript-vue-template-compiler': '^2.0.2',
      'nativescript-worker-loader': '~0.9.1',
      //'vue-property-decorator': '^7.2.0',
      //'vue-template-compiler': '^2.5.17',
      //'vue-class-component': '^6.3.2',
    }
  })

  // add scripts when we are also developing for the web
  if (options.isNativeOnly === 'dual') {
    api.extendPackage({
      scripts: {
        "serve:web": "vue-cli-service serve --mode development.web",
        "build:web": "vue-cli-service build --mode production.web",
      }
    });

    // if we are using NativeScript-Vue-Web then add the package
    if (options.isNVW) {
      api.extendPackage({
        dependencies: {
          'nativescript-vue-web': '^0.8.0',
        },
      });
    }

  } else {

  }

  if (api.hasPlugin('typescript')) {
    api.extendPackage({
      dependencies: {},
      devDependencies: {
        //'tns-platform-declarations': '^4.2.1'
      }
    });

    // this means it's a typescript project and using babel
    if (api.hasPlugin('babel')) {
      api.extendPackage({
        dependencies: {},
        devDependencies: {
          '@babel/types': '^7.1.3',
        }
      });
    }
  }

  // if the project is using babel, then load appropriate packages
  if (api.hasPlugin('babel')) {
    api.extendPackage({
      devDependencies: {
        '@babel/core': '^7.1.2',
        '@babel/preset-env': '^7.1.0',
        'babel-loader': '^8.0.4',
        'babel-traverse': '^6.26.0',
      }
    })

    api.render(async () => {
      fs.ensureFileSync(dirPathPrefix + 'babel.config.js')
      await applyBabelConfig(api, dirPathPrefix + 'babel.config.js');
    })
  }

  console.log('deleting from package.json');
  api.extendPackage(pkg => {
    // if the project is using babel, then delete babel-core
    if (api.hasPlugin('babel')) {
      delete pkg.devDependencies[
        'babel-core'
      ]
    }
    // we will be replacing these
    delete pkg.scripts['serve'],
      delete pkg.scripts['build']

    if (options.isNativeOnly === 'native') {
      // delete pkg.dependencies['vue']
      delete pkg.browserslist,

      // since we're native only, we will never use NativeScript-Vue-Web
      delete pkg.dependencies['nativescript-vue-web']
    }

  })

  console.log('doing template rendering');

  api.render(async () => {
    // render App_Resources folder
    await renderDirectory(api, '.js', commonRenderOptions, './templates/App_Resources', dirPathPrefix + 'app/App_Resources');
  })

  // If not a NativeScript-Vue-Web project 
  //if (!options.isNVW) {

    // If not Native Only.
    if (options.isNativeOnly === 'dual') {
      api.render(async () => {
        // render src directory
        await renderDirectory(api, jsOrTs, commonRenderOptions, path.join('templates', templateTypePathModifer, templateNVWPathModifier, 'src'), dirPathPrefix + 'src');

        // render app directory
        await renderDirectory(api, jsOrTs, commonRenderOptions, path.join('templates', templateTypePathModifer, templateNVWPathModifier, 'app'), dirPathPrefix + 'app');

        // add router statements to src/main.*s
        await vueRouterSetup(api, dirPathPrefix, jsOrTs);

        // add vuex statements to app/main.*s
        await vuexSetup(api, options, dirPathPrefix, jsOrTs);

      })
    } else { // Is Native Only
      api.render(async () => {
        // render app directory
        //await renderFilesIndividually(api, jsOrTs, appfiles, commonRenderOptions, './templates/simple/without-nvw/app', dirPathPrefix + 'app');
        await renderDirectory(api, jsOrTs, commonRenderOptions, path.join('templates', templateTypePathModifer, templateNVWPathModifier, 'app'), dirPathPrefix + 'app');

        // add vuex statements to app/main.*s
        await vuexSetup(api, options, dirPathPrefix, jsOrTs);

      })
    }

  // } else { // once we integrate NativeScript-Vue-Web, we'll put options here

  //   // render src directory
  //   await renderDirectory(api, jsOrTs, commonRenderOptions, path.join('templates', templateTypePathModifer, templateNVWPathModifier, 'src'), dirPathPrefix + 'src');

  //   // render app directory
  //   await renderDirectory(api, jsOrTs, commonRenderOptions, path.join('templates', templateTypePathModifer, templateNVWPathModifier, 'app'), dirPathPrefix + 'app');

  //   // add router statements to src/main.*s
  //   await vueRouterSetup(api, dirPathPrefix, jsOrTs);

  //   // add vuex statements to app/main.*s
  //   await vuexSetup(api, options, dirPathPrefix, jsOrTs);
  

  // }



  api.onCreateComplete(() => {

    // make changes to .gitignore
    gitignoreAdditions(api);

    // create files in ./ or ./ns-example
    writeRootFiles(api, options, dirPathPrefix);

    // create nsconfig.json in ./ or ./ns-example
    nsconfigSetup(dirPathPrefix, api.resolve('nsconfig.json'));
    tslintSetup(dirPathPrefix, api.resolve('tslint.json'));

    // we need to edit the tsconfig.json file in /app 
    // for a Native only project to remove references to /src
    if (options.isNativeOnly === 'native') {
      tsconfigNativeOnlySetup(options, dirPathPrefix + 'app/tsconfig.json');
    }

    // the main difference between New and Existing for this section is
    // that for New projects we are moving files around, but for
    // existing projects we are copying files into ./ns-example
    if (options.isNewProject) {

      // move type files out of src to ./ or ./ns-example
      if (api.hasPlugin('typescript')) {

        fs.move('./src/shims-tsx.d.ts', dirPathPrefix + 'shims-tsx.d.ts', err => {
          if (err) throw err;
        });

        fs.move('./src/shims-vue.d.ts', dirPathPrefix + 'shims-vue.d.ts', err => {
          if (err) throw err;
        });

        // remove tsconfig.json file as we now have it in ./src and ./app
        fs.remove('./tsconfig.json', err => {
          if (err) throw err;
        })
      }

      // for new projects that are native only, move files/dirs and delete others
      if (options.isNativeOnly === 'native') {

        // move store.js file from ./src to ./app
        if (api.hasPlugin('vuex')) {
          fs.move('./src/store' + jsOrTs, dirPathPrefix + 'app/store' + jsOrTs, (err) => {
            if (err) throw err;
          })
        }

        // move assets directory from ./src/assets to ./app/assets
        fs.move('./src/assets', dirPathPrefix + 'app/assets', err => {
          if (err) throw err;
        })

        // remove src directory as we don't need it
        fs.remove('./src', err => {
          if (err) throw err;
        })

        // remove public directory as we don't need it
        fs.remove('./public', err => {
          if (err) throw err;
        })

      }

    } else {

      // copy type files from ./src to ./ns-example
      if (api.hasPlugin('typescript')) {

        fs.copy('./src/shims-tsx.d.ts', path.join(dirPathPrefix, 'shims-tsx.d.ts'), err => {
          if (err) throw err;
        });

        fs.copy('./src/shims-vue.d.ts', path.join(dirPathPrefix, 'shims-vue.d.ts'), err => {
          if (err) throw err;
        });

      }

      if (options.isNativeOnly === 'native') {

        // move store.js file from ./src to ./ns-example/app
        if (api.hasPlugin('vuex')) {
          fs.copy('./src/store' + jsOrTs, dirPathPrefix + 'app/store' + jsOrTs, err => {
            if (err) throw err;
          })
        }

        // copy assets directory from ./src/assets to ./ns-example/app/assets
        fs.copy('./src/assets', dirPathPrefix + 'app/assets', err => {
          if (err) throw err;
        })

      }

    }

  })

}

// setup vue-router options
// will not setup any vue-router options for native app
// for new projects it will write to changes as normal
// and for existing projects it will write  changes to the ./ns-example directory
const vueRouterSetup = module.exports.vueRouterSetup = async (api, filePathPrefix, jsOrTs) => {

  try {
    if (api.hasPlugin('vue-router')) {
      api.injectImports(filePathPrefix.replace(/.\//, '') + 'src/main' + jsOrTs, `import router from 'src/router';`)
      api.injectRootOptions(filePathPrefix.replace(/.\//, '') + 'src/main' + jsOrTs, `router`)
    }

  } catch (err) {
    throw err
  }

}

// setup Vuex options
// for new projects it will write to changes as normal
// and for existing projects it will write  changes to the ./ns-example directory
const vuexSetup = module.exports.vuexSetup = async (api, options, filePathPrefix, jsOrTs) => {

  try {

    if (api.hasPlugin('vuex')) {
      if (options.isNativeOnly !== 'native') {
        api.injectImports(filePathPrefix.replace(/.\//, '') + 'src/main' + jsOrTs, `import store from 'src/store';`)
        api.injectRootOptions(filePathPrefix.replace(/.\//, '') + 'src/main' + jsOrTs, `store`)

        api.injectImports(filePathPrefix.replace(/.\//, '') + 'app/main' + jsOrTs, `import store from 'src/store';`)
        api.injectRootOptions(filePathPrefix.replace(/.\//, '') + 'app/main' + jsOrTs, `store`)

      } else { // if it's native only, it will not do anything in /src directory
        api.injectImports(filePathPrefix.replace(/.\//, '') + 'app/main' + jsOrTs, `import store from '@/store';`)
        api.injectRootOptions(filePathPrefix.replace(/.\//, '') + 'app/main' + jsOrTs, `store`)
      }
    }

  } catch (err) {
    throw err
  }

}

// write out babel.config.js options by adding options and replacing the base @vue/app
// for new projects it will write to the root of the project
// and for existing projects it will write it to the ./ns-example directory
const applyBabelConfig = module.exports.applyBabelConfig = async (api, filePath) => {

  const babelReplaceOptions = {
    files: '',
    from: '  \'@vue/app\'',
    to: '  process.env.VUE_PLATFORM === \'web\' ? \'@vue/app\' : {}, ' + newline + '    [\'@babel/env\', { targets: { esmodules: true } }]',
  }

  try {

    babelReplaceOptions.files = filePath;

    api.render(files => {
      files[filePath] = api.genJSConfig({
        plugins: ['@babel/plugin-syntax-dynamic-import'],
        presets: [
          '@vue/app'
        ]
      });
      replace(babelReplaceOptions, (err, changes) => {
        if (err) throw err;
      });
    })

  } catch (err) {
    throw err
  }
}

// write out files in the root of the project
// this includes the environment files as well as a global types file for 
// Typescript projects.  for new projects it will write files to the root of the project
// and for existing projects it will write it to the ./ns-example directory
const writeRootFiles = module.exports.writeRootFiles = async (api, options, filePathPrefix) => {

  try {
    const envDevelopmentAndroid = 'NODE_ENV=development' + newline + 'VUE_APP_PLATFORM=android' + newline + 'VUE_APP_MODE=native';
    const envDevelopmentIOS = 'NODE_ENV=development' + newline + 'VUE_APP_PLATFORM=ios' + newline + 'VUE_APP_MODE=native';
    const envProductionAndroid = 'NODE_ENV=production' + newline + 'VUE_APP_PLATFORM=android' + newline + 'VUE_APP_MODE=native';
    const envProductionIOS = 'NODE_ENV=production' + newline + 'VUE_APP_PLATFORM=ios' + newline + 'VUE_APP_MODE=native';

    fs.writeFileSync(filePathPrefix + '.env.development.android', envDevelopmentAndroid, {
      encoding: 'utf8'
    }, (err) => {
      if (err) throw err;
    });
    fs.writeFileSync(filePathPrefix + '.env.development.ios', envDevelopmentIOS, {
      encoding: 'utf8'
    }, (err) => {
      if (err) throw err;
    });
    fs.writeFileSync(filePathPrefix + '.env.production.android', envProductionAndroid, {
      encoding: 'utf8'
    }, (err) => {
      if (err) throw err;
    });
    fs.writeFileSync(filePathPrefix + '.env.production.ios', envProductionIOS, {
      encoding: 'utf8'
    }, (err) => {
      if (err) throw err;
    });

    // only write these out if we are also developing for the web
    if (options.isNativeOnly === 'dual') {
      console.log('dual components env files')
      const envDevelopmentWeb = 'NODE_ENV=development' + newline + 'VUE_APP_PLATFORM=web' + newline + 'VUE_APP_MODE=web';
      const envProductionWeb = 'NODE_ENV=production' + newline + 'VUE_APP_PLATFORM=web' + newline + 'VUE_APP_MODE=web';

      fs.writeFileSync(filePathPrefix + '.env.development.web', envDevelopmentWeb, {
        encoding: 'utf8'
      }, (err) => {
        if (err) throw err;
      });
      fs.writeFileSync(filePathPrefix + '.env.production.web', envProductionWeb, {
        encoding: 'utf8'
      }, (err) => {
        if (err) throw err;
      });
    }

    // only write this out if we are using typescript
    if (api.hasPlugin('typescript')) {
      // this file is ultimately optional if you don't use any process.env.VARIABLE_NAME references in your code
      const globalTypes = 'declare const TNS_ENV: string;' + newline + 'declare const TNS_APP_PLATFORM: string;' + newline + 'declare const TNS_APP_MODE: string;';
      fs.writeFileSync(filePathPrefix + 'globals.d.ts', globalTypes, {
        encoding: 'utf8'
      }, (err) => {
        if (err) throw err;
      });
    }

  } catch (err) {
    throw err
  }
}

// write .gitignore additions for native app exemptions
// will make changes to the root .gitignore file regardless of new or exisiting project
const gitignoreAdditions = module.exports.gitignoreAdditions = async (api) => {
  try {
    let gitignoreContent;
    const gitignorePath = api.resolve('.gitignore');
    const gitignoreAdditions =
      newline + '# NativeScript application' +
      newline + 'hooks' +
      newline + 'platforms' +
      newline + './webpack.config.js'

    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, {
        encoding: 'utf8'
      });
    } else {
      gitignoreContent = '';
    }

    if (gitignoreContent.indexOf(gitignoreAdditions) === -1) {
      gitignoreContent += gitignoreAdditions

      fs.writeFileSync(gitignorePath, gitignoreContent, {
        encoding: 'utf8'
      }, (err) => {
        if (err) throw err;
      });
    }
  } catch (err) {
    throw err
  }

}

// setup nsconfig.json file.  for new projects it will write to the root of the project
// and for existing projects it will write it to the ./ns-example directory
const nsconfigSetup = module.exports.nsconfigSetup = async (dirPathPrefix, nsconfigPath) => {
  let nsconfigContent = '';

  try {
    if (fs.existsSync(nsconfigPath)) {
      nsconfigContent = JSON.parse(fs.readFileSync(nsconfigPath, {
        encoding: 'utf8'
      }));
    } else {
      nsconfigContent = {};
    }

    nsconfigContent.appPath = 'app';
    nsconfigContent.appResourcesPath = 'app/App_Resources'

    fs.writeFileSync(dirPathPrefix + 'nsconfig.json', JSON.stringify(nsconfigContent, null, 2), {
      encoding: 'utf8'
    }, (err) => {
      if (err) console.error(err)
    });


  } catch (err) {
    throw err
  }

}

// setup tslintSetup
// for new projects it will write to the root of the project
// and for existing projects it will write it to the ./ns-example directory
const tslintSetup = module.exports.tslintSetup = async (dirPathPrefix, tslintPath) => {
  let tslintContent = '';

  try {
    if (fs.existsSync(tslintPath)) {
      tslintContent = JSON.parse(fs.readFileSync(tslintPath, {
        encoding: 'utf8'
      }));
    } else {
      return;
    }

    if (tslintContent.linterOptions.exclude === undefined)
      tslintContent.linterOptions.exclude = ['node_modules/**'];

    if (tslintContent.exclude === undefined)
      tslintContent.exclude = ['node_modules'];

    tslintContent.linterOptions.exclude = tslintContent.linterOptions.exclude.concat(['platforms/**', 'hooks/**'])
    tslintContent.exclude = tslintContent.exclude.concat(['platforms', 'hooks'])

    fs.writeFileSync(dirPathPrefix + 'tslint.json', JSON.stringify(tslintContent, null, 2), {
      encoding: 'utf8'
    }, (err) => {
      if (err) console.error(err)
    });


  } catch (err) {
    throw err
  }

}

// setup tsconfig for native only projects
// for new projects it will write to ./app
// and for existing projects it will write it to the ./ns-example/app directory
const tsconfigNativeOnlySetup = module.exports.tsconfigNativeOnlySetup = async (options, tsconfigPath) => {
  let tsconfigContent = '';
  try {
    if (fs.existsSync(tsconfigPath)) {
      tsconfigContent = JSON.parse(fs.readFileSync(tsconfigPath, {
        encoding: 'utf8'
      }));
    } else {
      return;
    }

    if (options.isNativeOnly === 'native') {

      delete tsconfigContent.compilerOptions.paths['src/*'];
      delete tsconfigContent.compilerOptions.paths['assets/*'];
      delete tsconfigContent.compilerOptions.paths['fonts/*'];
      delete tsconfigContent.compilerOptions.paths['components/*'];

      tsconfigContent.include = await removeFromArray(tsconfigContent.include, '../src/components/**/*.ts');
      tsconfigContent.include = await removeFromArray(tsconfigContent.include, '../src/components/**/*.tsx');
      tsconfigContent.include = await removeFromArray(tsconfigContent.include, '../src/components/**/*.vue');
    }

    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfigContent, null, 2), {
      encoding: 'utf8'
    }, (err) => {
      if (err) console.error(err)
    });


  } catch (err) {
    throw err
  }

}

// extract callsite file location using error stack
const extractCallDir = module.exports.extractCallDir = () => {
  try {
    const obj = {}
    Error.captureStackTrace(obj)
    return path.dirname(obj.stack.split('\n')[3].match(/\s\((.*):\d+:\d+\)$/)[1])
  } catch (err) {
    throw err
  }

}

// Use the generator's render function to render individual files passed in from an array.
// Will iterate through the array and then construct and object that is passed to render()
const renderFilesIndividually = module.exports.renderFilesIndividually = async (api, jsOrTs, files, opts, srcPathPrefix, destPathPrefix) => {

  try {
    const obj = {};

    for (let file of files) {
      let newFile = file;

      // replace .js files with .ts files when jsOrTs = '.ts'
      if (file.slice(-3) === '.js' || file.slice(-3) === '.ts')
        newFile = file.substring(0, file.length - 3) + jsOrTs;

      if ((!api.hasPlugin('typescript') && file !== 'tsconfig.json') || api.hasPlugin('typescript'))
        obj[path.join(destPathPrefix, newFile)] = path.join(srcPathPrefix, file);
    }

    api.render(obj, opts);

  } catch (err) {
    throw err
  }

}

// Good chunk of the following code comes from vue-cli/packages/@vue/cli/lib/GeneratorAPI.js
// Specifically the render function.  We want to render the entire directory, but passing just
// the directory to render doesn't give us the ability to tell where to put it as the cli's render
// function lacks a simple directory in and directory out option.  So, we have to get the contents 
// of the passed in directory and then render each file individually to where we want it via
// the render function's isObject(source) option that we use in our renderFilesIndividually function.
const renderDirectory = module.exports.renderDirectory = async (api, jsOrTs, opts, srcPathPrefix, destPathPrefix) => {

  try {

    const baseDir = await extractCallDir();
    const source = path.resolve(baseDir, srcPathPrefix);
    const files = new Array();


    const globby = require('globby');
    const _files = await globby(['**/*'], {
      cwd: source
    });

    for (const rawPath of _files) {
      let filename = path.basename(rawPath)
      // dotfiles are ignored when published to npm, therefore in templates
      // we need to use underscore instead (e.g. "_gitignore")
      if (filename.charAt(0) === '_' && filename.charAt(1) !== '_') {
        filename = `.${filename.slice(1)}`
      }
      if (filename.charAt(0) === '_' && filename.charAt(1) === '_') {
        filename = `${filename.slice(1)}`
      }

      files.push(rawPath);
      renderFilesIndividually(api, jsOrTs, files, opts, srcPathPrefix, destPathPrefix)

    }

  } catch (err) {
    throw err
  }

}

// utility function used to remove items from an array that match 'item'
const removeFromArray = module.exports.removeFromArray = async (array, item) => {
  const index = array.indexOf(item);
  if (index !== -1)
    array.splice(index, 1);
  return array;
}