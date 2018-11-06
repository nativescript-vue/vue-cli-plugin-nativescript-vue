const path = require('path');
const fs = require('fs')
const globby = require('globby');
const rimraf = require('rimraf')
const replace = require('replace-in-file');

module.exports = (api, options, rootOptions) => {
  
  const commonRendorOptions = {
    applicationName: api.generator.pkg.name,
    applicationVersion: api.generator.pkg.version,
    applicationAndroidVersionCode: api.generator.pkg.version.split('.').join('0'),
    applicationDescription: api.generator.pkg.description || api.generator.pkg.name,
    applicationLicense: api.generator.pkg.license || 'MIT',
    applicationId: options.applicationId,
    historyMode: options.historyMode || false,
    doesCompile: api.hasPlugin('babel') || api.hasPlugin('typescript')
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
      "serve:web": "vue-cli-service serve --mode development.web",
      "serve:android": "vue-cli-service tns:dev --mode development.android",
      "serve:ios": "vue-cli-service tns:dev --mode development.ios",
      "build:web": "vue-cli-service build --mode production.web",
      "build:android": "vue-cli-service tns:prod --mode production.android",
      "build:ios": "vue-cli-service tns:prod --mode production.ios",
    },
    dependencies: {
      'nativescript-vue': '^2.0.2',
      'tns-core-modules': '^4.2.1',
    },
    devDependencies: {
      '@babel/core': '^7.1.2',
      '@babel/preset-env': '^7.1.0',
      '@babel/types': '^7.1.3',
      'babel-loader': '^8.0.4',
      'babel-traverse': '^6.26.0',
      'clean-webpack-plugin': '^0.1.19',
      'copy-webpack-plugin': '^4.5.4',
      'nativescript-dev-webpack': '^0.17.0',
      'nativescript-vue-template-compiler': '^2.0.2',
      'nativescript-worker-loader': '~0.9.1',
      'replace-in-file': '^3.4.2',
      "string-replace-loader": "^2.1.1",
    }
  })

  console.log('deleting from package.json');


  api.extendPackage(pkg => {
    // delete pkg.dependencies['vue']
    delete pkg.devDependencies[
      // 'vue-template-compiler',
      'babel-core'
    ]
    // delete pkg.browserslist
    delete pkg.scripts['serve'],
    delete pkg.scripts['build']

  })

  console.log('doing template rendering');

  // render the App_Resources files
  api.render('./templates/App_Resources', commonRendorOptions)

  // use the answer from the invoke prompt and if it's a new project use the new template
  // and if it is an existing project, use the existing template
  if(options.isNewProject) {
    api.render('./templates/simple/new', commonRendorOptions)
  } else {
    api.render('./templates/simple/existing', commonRendorOptions)
  }

  api.onCreateComplete(() => {

    const newline = process.platform === 'win32' ? '\r\n' : '\n';
    const webpackConfigFile = api.resolve('./webpack.config.js');
    const src = api.resolve('src');
    const gitignorePath = api.resolve('.gitignore');

    // // // // delete the 'public' directory
    // // // const publicPath = api.resolve('public')
    // // // if(fs.existsSync(publicPath)) {
    // // //   rimraf.sync(publicPath)
    // // // }

    // rename any webpack.config.js file that might already be there
    if(fs.existsSync(webpackConfigFile)) {
      fs.rename(webpackConfigFile, './webpack.config.old', (err) => {
        if (err) throw err;
      });
    }

    // rename main.js to main.web.js
    if(fs.existsSync(path.resolve(src, 'main.js'))) {
      fs.rename(path.resolve(src, 'main.js'), path.resolve(src, 'main.web.js'), (err) => {
        if (err) throw err;
      });
    }

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

    // write out environmental files
    const developmentAndroid = 'NODE_ENV=development' + newline + 'VUE_PLATFORM=android' + newline + 'VUE_APP_MODE=native';
    const developmentIOS = 'NODE_ENV=development' + newline + 'VUE_PLATFORM=ios' + newline + 'VUE_APP_MODE=native';
    const developmentWeb = 'NODE_ENV=development' + newline + 'VUE_PLATFORM=web' + newline + 'VUE_APP_MODE=web';
    const productionAndroid = 'NODE_ENV=production' + newline + 'VUE_PLATFORM=android' + newline + 'VUE_APP_MODE=native';
    const productionIOS = 'NODE_ENV=production' + newline + 'VUE_PLATFORM=ios' + newline + 'VUE_APP_MODE=native';
    const productionWeb = 'NODE_ENV=production' + newline + 'VUE_PLATFORM=web' + newline + 'VUE_APP_MODE=web';

    fs.writeFileSync('./.env.development.android', developmentAndroid, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    fs.writeFileSync('./.env.development.ios', developmentIOS, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    fs.writeFileSync('./.env.development.web', developmentWeb, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    fs.writeFileSync('./.env.production.android', productionAndroid, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    fs.writeFileSync('./.env.production.ios', productionIOS, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    fs.writeFileSync('./.env.production.web', productionWeb, { encoding: 'utf8' }, (err) => {if (err) throw err;});


    // write nsconfig.json
    const nsconfig = {
      'appPath': 'src',
      'appResourcesPath': 'src/App_Resources'
    }
    fs.writeFileSync('./nsconfig.json', JSON.stringify(nsconfig, null, 2), {encoding: 'utf8'}, (err) => {if (err) throw err;});

    // write .gitignore additions
    let gitignoreContent;

    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, { encoding: 'utf8' });
    } else {
      gitignoreContent = '';
    }

    const gitignoreAdditions = newline + '# NativeScript application' + newline + 'hooks' + newline + 'platforms'
    if (gitignoreContent.indexOf(gitignoreAdditions) === -1) {
      gitignoreContent += gitignoreAdditions

      fs.writeFileSync(gitignorePath, gitignoreContent, { encoding: 'utf8' }, (err) => {if (err) throw err;});
    }

  })



}
