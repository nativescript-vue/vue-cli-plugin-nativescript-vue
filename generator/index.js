const path = require('path');
const fs = require('fs-extra');
const replace = require('replace-in-file');


module.exports = (api, options, rootOptions) => {

  console.log('options.isNativeOnly - ', options.isNativeOnly)
  console.log('options.isNVW - ', options.isNVW)
  console.log('options.isNewProject - ', options.isNewProject)

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
      "serve:android": "npm run setup-webpack-config && cross-env-shell VUE_CLI_MODE=development.android tns run android --bundle && npm run remove-webpack-config",
      "serve:ios": "npm run setup-webpack-config && cross-env-shell VUE_CLI_MODE=development.ios tns run ios --bundle && npm run remove-webpack-config",
      "build:web": "vue-cli-service build --mode production.web",
      "build:android": "npm run setup-webpack-config && cross-env-shell VUE_CLI_MODE=production.android tns run android --bundle && npm run remove-webpack-config",
      "build:ios": "npm run setup-webpack-config && cross-env-shell VUE_CLI_MODE=production.ios tns run ios --bundle && npm run remove-webpack-config",
      },
    dependencies: {
      'nativescript-vue': '^2.0.2',
      'tns-core-modules': '^4.2.1',
    },
    devDependencies: {
      'clean-webpack-plugin': '^0.1.19',
      'copy-webpack-plugin': '^4.6.0',
      'cross-env': '^5.2.0',
      'nativescript-dev-webpack': '^0.17.0',
      'nativescript-vue-template-compiler': '^2.0.2',
      'nativescript-worker-loader': '~0.9.1',
      'replace-in-file': '^3.4.2',
    }
  })

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

  })

  console.log('doing template rendering');

  // use the answer from the invoke prompt and if it's a new project use the new template
  // and if it is an existing project, use the existing template
  if(options.isNewProject) {

    // New Project and not using Nativescript-Vue-Web
    if(!options.isNVW && !options.isNativeOnly) {
      api.render('./templates/simple/without-nvw/new', commonRenderOptions)
  
      if(api.hasPlugin('vue-router')){
        api.injectImports('src/main.js', `import router from '~/router'`)
        api.injectRootOptions('src/main.js', `router`)
      }
  
      if(api.hasPlugin('vuex')){
        api.injectImports('src/main.js', `import store from '~/store'`)
        api.injectRootOptions('src/main.js', `store`)
        api.injectImports('app/main.js', `import store from 'src/store'`)
        api.injectRootOptions('app/main.js', `store`)
  
      }
    } 

    // New Project and is using Nativescript-Vue-Web
    if(options.isNVW && !options.isNativeOnly) {
      
    } 

    // New Project & Native Only -- should never be able to use Nativescript-Vue-Web
    if(!options.isNVW && options.isNativeOnly) {
      api.render('./templates/simple/native-only/new', commonRenderOptions);
    }

    if(options.isNativeOnly && options.isNVW) {
      // should never reach this block of code
    }
  

  } else { // Exising Project

    // Existing Project and not using Nativescript-Vue-Web
    if(!options.isNVW && !options.isNativeOnly) {
      api.render('./templates/simple/without-nvw/existing', commonRenderOptions)
    } 

    // Existing Project and is using Nativescript-Vue-Web
    if(options.isNVW && !options.isNativeOnly) {
      
    } 

    // Existing Project & Native Only -- should never be able to use Nativescript-Vue-Web
    if(!options.isNVW && options.isNativeOnly) {
      api.render('./templates/simple/native-only/existing', commonRenderOptions)
    }

    if(options.isNVW && options.isNativeOnly) {
      // should never reach this block of code
    }

  }

  
 

 
  api.onCreateComplete(() => {

    const newline = process.platform === 'win32' ? '\r\n' : '\n';
    const gitignorePath = api.resolve('.gitignore');
    const gitignoreWebpackConfig = api.resolve('.webpack.config.js');

    // setup string replacement options for babel.config.js file
    if(api.hasPlugin('babel') && fs.existsSync('./babel.config.js')) {
      const replaceOptions = {
        files: './babel.config.js',
        from: '  \'@vue/app\'',
        to: '  process.env.VUE_PLATFORM === \'web\' ? \'@vue/app\' : {}, ' + newline + '    [\'@babel/env\', { targets: { esmodules: true } }]',
      }
      replace(replaceOptions, (err, changes) => {
        if (err) throw err;
      });
    }


    // for new projects that are native only, move files/dirs and delete others
    if(options.isNewProject && options.isNativeOnly) {

      // move store.js file from ./src to ./app
      if(api.hasPlugin('vuex')) {
        fs.move('./src/store.js', './app/store.js', (err) => {
          if(err) throw err;
        })
      }

      // move assets directory from ./src/assets to ./app/assets
      fs.ensureDir('./src/assets', err => {
        if(err) throw err;
        fs.move('./src/assets', './app/assets', err => {
          if (err) throw err;
        })
      })

      fs.remove('./src', err => {
        if (err) throw err
      })

    }


    // write out environmental files
    const developmentAndroid = 'NODE_ENV=development' + newline + 'VUE_APP_PLATFORM=android' + newline + 'VUE_APP_MODE=native';
    const developmentIOS = 'NODE_ENV=development' + newline + 'VUE_APP_PLATFORM=ios' + newline + 'VUE_APP_MODE=native';
    const developmentWeb = 'NODE_ENV=development' + newline + 'VUE_APP_PLATFORM=web' + newline + 'VUE_APP_MODE=web';
    const productionAndroid = 'NODE_ENV=production' + newline + 'VUE_APP_PLATFORM=android' + newline + 'VUE_APP_MODE=native';
    const productionIOS = 'NODE_ENV=production' + newline + 'VUE_APP_PLATFORM=ios' + newline + 'VUE_APP_MODE=native';
    const productionWeb = 'NODE_ENV=production' + newline + 'VUE_APP_PLATFORM=web' + newline + 'VUE_APP_MODE=web';

    fs.writeFileSync('./.env.development.android', developmentAndroid, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    fs.writeFileSync('./.env.development.ios', developmentIOS, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    fs.writeFileSync('./.env.development.web', developmentWeb, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    fs.writeFileSync('./.env.production.android', productionAndroid, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    fs.writeFileSync('./.env.production.ios', productionIOS, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    fs.writeFileSync('./.env.production.web', productionWeb, { encoding: 'utf8' }, (err) => {if (err) throw err;});


    // write nsconfig.json
    const nsconfig = {
      'appPath': 'app',
      'appResourcesPath': 'app/App_Resources'
    }
    fs.writeFileSync('./nsconfig.json', JSON.stringify(nsconfig, null, 2), {encoding: 'utf8'}, (err) => {if (err) throw err;});

    // write .gitignore additions
    let gitignoreContent;

    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, { encoding: 'utf8' });
    } else {
      gitignoreContent = '';
    }

    const gitignoreAdditions = newline + '# NativeScript application' + newline + 'hooks' + newline + 'platforms' + newline + './webpack.config.js'
    if (gitignoreContent.indexOf(gitignoreAdditions) === -1) {
      gitignoreContent += gitignoreAdditions

      fs.writeFileSync(gitignorePath, gitignoreContent, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    }

  })

  

}
