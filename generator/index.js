const path = require('path');
const fs = require('fs-extra');
const replace = require('replace-in-file');

const newline = process.platform === 'win32' ? '\r\n' : '\n';

module.exports = async (api, options, rootOptions) => {

  console.log('options.isNativeOnly - ', options.isNativeOnly)
  console.log('options.isNVW - ', options.isNVW)
  console.log('options.isNewProject - ', options.isNewProject)
  console.log('usingTS - ', api.hasPlugin('typescript'))
  console.log('usingBabel - ', api.hasPlugin('babel'))

  const existingDirPath = './ns-example/';
  const jsOrTs = api.hasPlugin('typescript') ? '.ts' : '.js';

  const srcfiles = [
    'router.js',
    'main.js',
    api.hasPlugin('typescript') ? 'tsconfig.json' : '',
    'App.vue',
    'views/About.vue',
    'views/Home.vue',
    'components/HelloWorld.vue',
    'assets/logo.png'
  ]

  const appfiles = [
    'package.json',
    'main.js',
    api.hasPlugin('typescript') ? 'tsconfig.json' : '',
    'App.native.vue',
    'App.ios.vue',
    'App.android.vue',
    'views/About.native.vue',
    'views/About.ios.vue',
    'views/About.android.vue',
    'views/Home.native.vue',
    'views/Home.ios.vue',
    'views/Home.android.vue',
    'components/HelloWorld.native.vue',
    'components/HelloWorld.ios.vue',
    'components/HelloWorld.android.vue',
  ]


  // New Project & Native Only -- should never be able to use Nativescript-Vue-Web
  if(options.isNativeOnly && options.isNVW) {
    throw Error('Invalid options chosen.  You cannot have a Native only project and use Nativescript-Vue-Web')
  }

  if(options.isNativeOnly)
    options.isNVW = false;
  
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
    usingTS: api.hasPlugin('typescript')
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
      "serve:web": "vue-cli-service serve --mode development.web",
      "serve:android": "npm run setup-webpack-config && cross-env-shell VUE_CLI_MODE=development.android tns run android --bundle",
      "serve:ios": "npm run setup-webpack-config && cross-env-shell VUE_CLI_MODE=development.ios tns run ios --bundle",
      "build:web": "vue-cli-service build --mode production.web",
      "build:android": "npm run setup-webpack-config && cross-env-shell VUE_CLI_MODE=production.android tns run android --bundle && npm run remove-webpack-config",
      "build:ios": "npm run setup-webpack-config && cross-env-shell VUE_CLI_MODE=production.ios tns run ios --bundle && npm run remove-webpack-config",
      },
    dependencies: {
      'nativescript-vue': '^2.0.2',
      'tns-core-modules': '^4.2.1',
    },
    devDependencies: {
      //'clean-webpack-plugin': '^0.1.19',
      //'copy-webpack-plugin': '^4.6.0',
      'cross-env': '^5.2.0',
      'nativescript-dev-webpack': '^0.17.0',
      'nativescript-vue-template-compiler': '^2.0.2',
      'nativescript-worker-loader': '~0.9.1',
      //'replace-in-file': '^3.4.2',
      //'vue-property-decorator': '^7.2.0',
      //'vue-template-compiler': '^2.5.17',
      //'vue-class-component': '^6.3.2',
    }
  })

  // if(api.hasPlugin('typescript')) {
  //   api.extendPackage({
  //     dependencies: {
  //     },
  //     devDependencies: {
  //       //'fork-ts-checker-webpack-plugin': '^0.4.15'//,
  //       //'tns-platform-declarations': '^4.2.1'
  //     }
  //   })
  // }

  // if the project is using babel, then load appropriate packages
  if(api.hasPlugin('babel')) {
    api.extendPackage({
      devDependencies: {
        '@babel/core': '^7.1.2',
        '@babel/preset-env': '^7.1.0',
        '@babel/types': '^7.1.3',
        'babel-loader': '^8.0.4',
        'babel-traverse': '^6.26.0',
      }
    })
  }

  console.log('deleting from package.json');
  api.extendPackage(pkg => {
    // if the project is using babel, then delete babel-core
    if(api.hasPlugin('babel')) {
      delete pkg.devDependencies[
        'babel-core'
      ]
    }
    // we will be replacing these
    delete pkg.scripts['serve'],
    delete pkg.scripts['build']

    if(options.isNativeOnly) {
      // delete pkg.dependencies['vue']
      // delete pkg.devDependencies['vue-template-compiler']
      // delete pkg.browserslist
    }

  })



  console.log('doing template rendering');

  // use the answer from the invoke prompt and if it's a new project use the new template
  // and if it is an existing project, use the existing template
  if(options.isNewProject) {

    // render App_Resources to the ./app folder
    api.render(async () => {
      await renderDirectory(api, '.js', commonRenderOptions, './templates/App_Resources', './app/App_Resources');

      // create the babel.config.js file
      if(api.hasPlugin('babel')) {
        fs.ensureFileSync('./babel.config.js')
        await applyBabelConfig(api, './babel.config.js');
      }
    })

    // New Project and not using Nativescript-Vue-Web
    if(!options.isNVW && !options.isNativeOnly) {

      api.render(async () => {
        // render ./src directory
        await renderFilesIndividually(api, jsOrTs, srcfiles, commonRenderOptions, './templates/simple/without-nvw/src', './src');

        // render ./app directory
        await renderFilesIndividually(api, jsOrTs, appfiles, commonRenderOptions, './templates/simple/without-nvw/app', './app');

        // add router statements to src/main.*s
        await vueRouterSetup(api, '', jsOrTs);

        // add vuex statements to src/main.*s
        await vuexSetup(api, options, '', jsOrTs);
      })     
      
    } 

    // New Project and is using Nativescript-Vue-Web
    if(options.isNVW && !options.isNativeOnly) {
      
    } 

    // New Project & Native Only -- should never be able to use Nativescript-Vue-Web
    if(!options.isNVW && options.isNativeOnly) {
      // render app directory
      api.render(async () => {
        // render ./app directory
        await renderFilesIndividually(api, jsOrTs, appfiles, commonRenderOptions, './templates/simple/without-nvw/app', './app');

        // add vuex statements to app/main.*s
        await vuexSetup(api, options, '', jsOrTs);
      })
    } 

    if(options.isNativeOnly && options.isNVW) {
      // should never reach this block of code
    }
  
  } else { // Exising Project

    // render App_Resources to the ./ns-example/app folder
    api.render(async () => {
      await renderDirectory(api, '.js', commonRenderOptions, './templates/App_Resources', existingDirPath + 'app/App_Resources');

      if(api.hasPlugin('babel')) {
        fs.ensureFileSync(existingDirPath + 'babel.config.js')
        applyBabelConfig(api, existingDirPath + 'babel.config.js');
      }
    })
    
    // Existing Project and not using Nativescript-Vue-Web
    if(!options.isNVW && !options.isNativeOnly) {

      api.render(async () => {
        // render ./ns-example/src directory
        await renderFilesIndividually(api, jsOrTs, srcfiles, commonRenderOptions, './templates/simple/without-nvw/src', existingDirPath + 'src');

        // render ./ns-example/app directory
        await renderFilesIndividually(api, jsOrTs, appfiles, commonRenderOptions, './templates/simple/without-nvw/app', existingDirPath + 'app');

        // add router statements to ./ns-example/src/main.*s
        await vueRouterSetup(api, existingDirPath, jsOrTs);

        // add vuex statements to ./ns-example/app/main.*s
        await vuexSetup(api, options, existingDirPath, jsOrTs);

      })
     
    } 

    // Existing Project and is using Nativescript-Vue-Web
    if(options.isNVW && !options.isNativeOnly) {
      
    } 

    // Existing Project & Native Only -- should never be able to use Nativescript-Vue-Web
    if(!options.isNVW && options.isNativeOnly) {

      api.render(async () => {
        // render ./ns-example/app directory
        await renderFilesIndividually(api, jsOrTs, appfiles, commonRenderOptions, './templates/simple/without-nvw/app', existingDirPath + 'app');

        // add vuex statements to ./ns-example/app/main.*s
        await vuexSetup(api, options, existingDirPath, jsOrTs);
      })
      
    }

    if(options.isNVW && options.isNativeOnly) {
      // should never reach this block of code
    }

  }


  api.onCreateComplete(() => {

    gitignoreAdditions(api);

    if(options.isNewProject) {
      writeRootFiles('./')
      nsconfigSetup('./', api.resolve('nsconfig.json'));

      if(api.hasPlugin('typescript')) {
        tslintSetup('./', api.resolve('tslint.json'));

        fs.move('./src/shims-tsx.d.ts', './shims-tsx.d.ts', err => {
          if (err) throw err;
        });
        
        fs.move('./src/shims-vue.d.ts', './shims-vue.d.ts', err => {
          if (err) throw err;
        });
      }

      // for new projects that are native only, move files/dirs and delete others
      if (options.isNativeOnly) {
        // move store.js file from ./src to ./app
        if(api.hasPlugin('vuex')) {
          fs.move('./src/store.js', './app/store.js', (err) => {
            //if(err) throw err;
            console.error(err);
          })
        }

        // move assets directory from ./src/assets to ./app/assets
        fs.move('./src/assets', './app/assets', err => {
          //if(err) throw err;
          console.error(err);
        })

        // remove src directory as we don't need it
        fs.remove('./src', err => {
            //if(err) throw err;
            console.error(err);
        })

        // remove public directory as we don't need it
        fs.remove('./public', err => {
            //if(err) throw err;
            console.error(err);
        })
      }

    } else {
      writeRootFiles(existingDirPath)
      nsconfigSetup(existingDirPath, api.resolve('nsconfig.json'));

      if(api.hasPlugin('typescript')) {
        tslintSetup(existingDirPath, api.resolve('tslint.json'));

        fs.copy('./src/shims-tsx.d.ts', path.join(existingDirPath, 'shims-tsx.d.ts'), err => {
          if (err) throw err;
        });
        
        fs.copy('./src/shims-vue.d.ts', path.join(existingDirPath, 'shims-vue.d.ts'), err => {
          if (err) throw err;
        });

      }


      // for existing projects that are native only, try and copy items from src
      // but do not delete anythign in src.
      if (options.isNativeOnly) {
        // move store.js file from ./src to ./app
        if(api.hasPlugin('vuex')) {
          fs.copy('./src/store.js', existingDirPath + 'app/store.js', err => {
            //if(err) throw err;
            console.error(err);
          })
        }

        // copy assets directory from ./src/assets to ./app/assets
        fs.copy('./src/assets', existingDirPath + 'app/assets', err => {
          //if (err) throw err;
          console.error(err)
        })
      }

    }

  })

}

// setup vue-router options
// will not setup any vue-router options for native app
const vueRouterSetup = module.exports.vueRouterSetup = async (api, filePathPrefix, jsOrTs) => {
  try {

    if (api.hasPlugin('vue-router')) {
      api.injectImports(filePathPrefix + 'src/main' + jsOrTs, `import router from 'src/router';`)
      api.injectRootOptions(filePathPrefix + 'src/main' + jsOrTs, `router`)
    }

  } catch(err) {
    throw err
  }

}

// setup Vuex options
// if it's native only, it will not do anything in /src directory
const vuexSetup = module.exports.vuexSetup = async (api, options, filePathPrefix, jsOrTs) => {
  console.log('configing vuex');
  try {

    if (api.hasPlugin('vuex')) {

      if (!options.isNativeOnly) {
        api.injectImports(filePathPrefix + 'src/main' + jsOrTs, `import store from 'src/store';`)
        api.injectRootOptions(filePathPrefix + 'src/main' + jsOrTs, `store`)
      }
      
      api.injectImports(filePathPrefix + 'app/main' + jsOrTs, `import store from 'src/store';`)
      api.injectRootOptions(filePathPrefix + 'app/main' + jsOrTs, `store`)
    }

  } catch(err) {
    throw err
  }

}

// write out babel.config.js options
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
        plugins: ["@babel/plugin-syntax-dynamic-import"],
        presets: [
          '@vue/app'
        ]
      })
    })
   
    replace(babelReplaceOptions, (err, changes) => {
      if (err) throw err;
    });
   

  } catch(err) {
    throw err
  }
}

// write out files in the root of the project
const writeRootFiles = module.exports.writeRootFiles = async (filePathPrefix) => {

  try {
    const envDevelopmentAndroid = 'NODE_ENV=development' + newline + 'VUE_APP_PLATFORM=android' + newline + 'VUE_APP_MODE=native';
    const envDevelopmentIOS = 'NODE_ENV=development' + newline + 'VUE_APP_PLATFORM=ios' + newline + 'VUE_APP_MODE=native';
    const envDevelopmentWeb = 'NODE_ENV=development' + newline + 'VUE_APP_PLATFORM=web' + newline + 'VUE_APP_MODE=web';
    const envProductionAndroid = 'NODE_ENV=production' + newline + 'VUE_APP_PLATFORM=android' + newline + 'VUE_APP_MODE=native';
    const envProductionIOS = 'NODE_ENV=production' + newline + 'VUE_APP_PLATFORM=ios' + newline + 'VUE_APP_MODE=native';
    const envProductionWeb = 'NODE_ENV=production' + newline + 'VUE_APP_PLATFORM=web' + newline + 'VUE_APP_MODE=web';
    const globalTypes = 'declare const TNS_ENV: string;' + newline + 'declare const TNS_APP_PLATFORM: string;' + newline + 'declare const TNS_APP_MODE: string;';

     
    fs.writeFileSync(filePathPrefix + '.env.development.android', envDevelopmentAndroid, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    fs.writeFileSync(filePathPrefix + '.env.development.ios', envDevelopmentIOS, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    fs.writeFileSync(filePathPrefix + '.env.development.web', envDevelopmentWeb, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    fs.writeFileSync(filePathPrefix + '.env.production.android', envProductionAndroid, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    fs.writeFileSync(filePathPrefix + '.env.production.ios', envProductionIOS, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    fs.writeFileSync(filePathPrefix + '.env.production.web', envProductionWeb, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    fs.writeFileSync(filePathPrefix + 'globals.d.ts', globalTypes, { encoding: 'utf8' }, (err) => {if (err) throw err;});


  } catch(err) {
    throw err
  }
}

// write .gitignore additions for native app exemptions
const gitignoreAdditions = module.exports.gitignoreAdditions = async (api) => {
  try {
    let gitignoreContent;
    const gitignorePath = api.resolve('.gitignore');
    const gitignoreAdditions = 
      newline + '# NativeScript application' 
    + newline + 'hooks' 
    + newline + 'platforms' 
    + newline + './webpack.config.js'

    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, { encoding: 'utf8' });
    } else {
      gitignoreContent = '';
    }

    if (gitignoreContent.indexOf(gitignoreAdditions) === -1) {
      gitignoreContent += gitignoreAdditions

      fs.writeFileSync(gitignorePath, gitignoreContent, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    }
  } catch(err) {
    throw err
  }

}

// setup nsconfig.json file
const nsconfigSetup = module.exports.nsconfigSetup = async (existingDirPath, nsconfigPath) => {
  let nsconfigContent = '';

  try {
    if (fs.existsSync(nsconfigPath)) {
      nsconfigContent = JSON.parse(fs.readFileSync(nsconfigPath, { encoding: 'utf8' }));
    } else {
      nsconfigContent = {};
    }

    nsconfigContent.appPath = 'app';
    nsconfigContent.appResourcesPath = 'app/App_Resources'

    fs.writeFileSync(existingDirPath + 'nsconfig.json', JSON.stringify(nsconfigContent, null, 2), {encoding: 'utf8'}, (err) => {
      if (err) console.error(err)
    });

    
  } catch(err) {
    throw err
  }

}

// setup tslintSetup
const tslintSetup = module.exports.tslintSetup = async (existingDirPath, tslintPath) => {
  let tslintContent = '';

  try {
    if (fs.existsSync(tslintPath)) {
      tslintContent = JSON.parse(fs.readFileSync(tslintPath, { encoding: 'utf8' }));
    } else {
      return;
    }

    tslintContent.linterOptions.exclude = tslintContent.linterOptions.exclude.concat(['platforms/**', 'hooks/**'])
    tslintContent.exclude = tslintContent.exclude.concat(['platforms', 'hooks'])

    fs.writeFileSync(existingDirPath + 'tslint.json', JSON.stringify(tslintContent, null, 2), {encoding: 'utf8'}, (err) => {
      if (err) console.error(err)
    });

    
  } catch(err) {
    throw err
  }

}

// extract callsite file location using error stack
const extractCallDir = module.exports.extractCallDir = () => {
  try {
    const obj = {}
    Error.captureStackTrace(obj)
    return path.dirname(obj.stack.split('\n')[3].match(/\s\((.*):\d+:\d+\)$/)[1])
  } catch(err) {
    throw err
  }

}

// Use the generator's render function to render individual files passed in from an array.
// Will iterate through the array and then construct and object that is passed to render()
const renderFilesIndividually = module.exports.renderFilesIndividually = async (api, jsOrTs, files, opts, srcPathPrefix, destPathPrefix) => {

  try {
    const obj = {};

    for(let file of files) {
      let newFile = file;

      // replace .js files with .ts files when jsOrTs = '.ts'
      if(file.slice(-3) === '.js' || file.slice(-3) === '.ts')
        newFile = file.substring(0, file.length - 3) + jsOrTs;

      obj[path.join(destPathPrefix, newFile)] = path.join(srcPathPrefix, file);
    }

    api.render(obj, opts);
    
  } catch(err) {
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
    
    const baseDir =  await extractCallDir();
    const source = path.resolve(baseDir, srcPathPrefix);
    const files = new Array();


    const globby = require('globby');
    const _files = await globby(['**/*'], { cwd: source });

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
    
  } catch(err) {
    throw err
  }

}
