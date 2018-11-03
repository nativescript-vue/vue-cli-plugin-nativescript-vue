module.exports = (api, options, rootOptions) => {
  const fs = require('fs')
  const rimraf = require('rimraf')
  const replace = require('replace-in-file');
  const path = require('path');

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

  api.render('./templates/simple', {
    applicationName: api.generator.pkg.name,
    applicationVersion: api.generator.pkg.version,
    applicationAndroidVersionCode: api.generator.pkg.version.split('.').join('0'),
    applicationDescription: api.generator.pkg.description || api.generator.pkg.name,
    applicationLicense: api.generator.pkg.license || 'MIT',
    applicationId: options.applicationId,
    historyMode: options.historyMode || false,
  })

  console.log('onCreateComplete');

  // delete the 'public' directory
  api.onCreateComplete(() => {
    const newline = process.platform === 'win32' ? '\r\n' : '\n';
    // // // const publicPath = api.resolve('public')
    const webpackConfigFile = api.resolve('./webpack.config.js')
    const main = api.resolve('src/main.js');
    const gitignorePath = api.resolve('.gitignore')

    // // // if(fs.existsSync(publicPath)) {
    // // //   rimraf.sync(publicPath)
    // // // }

    // remove any webpack.config.js file that might already be there
    if(fs.existsSync(webpackConfigFile)) {
      fs.unlink(webpackConfigFile, (err) => {
        if (err) throw err;
      });    }

    // delete main.js
     if(fs.existsSync(main)) {
      fs.unlink(main, (err) => {
        if (err) throw err;
      });
     }

    // setup string replacement options for babel.config.js file
    if(fs.existsSync('./babel.config.js')) {
      const replaceOptions = {
        files: './babel.config.js',
        from: '  \'@vue/app\'',
        to: '  process.env.VUE_PLATFORM === \'web\' ? \'@vue/app\' : {}, ' + newline + '    [\'@babel/env\', { targets: { esmodules: true } }]',
      }
      replace(replaceOptions, (error, changes) => {
        if (error) {
          return console.error('Error occurred:', error);
        }
      })
    }

    // write out environmental files
    const developmentAndroid = 'NODE_ENV=development' + newline + 'VUE_PLATFORM=android' + newline + 'VUE_APP_MODE=native';
    const developmentIOS = 'NODE_ENV=development' + newline + 'VUE_PLATFORM=ios' + newline + 'VUE_APP_MODE=native';
    const developmentWeb = 'NODE_ENV=development' + newline + 'VUE_PLATFORM=web' + newline + 'VUE_APP_MODE=web';
    const productionAndroid = 'NODE_ENV=production' + newline + 'VUE_PLATFORM=android' + newline + 'VUE_APP_MODE=native';
    const productionIOS = 'NODE_ENV=production' + newline + 'VUE_PLATFORM=ios' + newline + 'VUE_APP_MODE=native';
    const productionWeb = 'NODE_ENV=production' + newline + 'VUE_PLATFORM=web' + newline + 'VUE_APP_MODE=web';

    fs.writeFileSync('./.env.development.android', developmentAndroid, { encoding: 'utf8' })
    fs.writeFileSync('./.env.development.ios', developmentIOS, { encoding: 'utf8' })
    fs.writeFileSync('./.env.development.web', developmentWeb, { encoding: 'utf8' })
    fs.writeFileSync('./.env.production.android', productionAndroid, { encoding: 'utf8' })
    fs.writeFileSync('./.env.production.ios', productionIOS, { encoding: 'utf8' })
    fs.writeFileSync('./.env.production.web', productionWeb, { encoding: 'utf8' })


    // write nsconfig.json
    const nsconfig = {
      'appPath': 'src',
      'appResourcesPath': 'src/App_Resources'
    }
    fs.writeFileSync('./nsconfig.json', JSON.stringify(nsconfig, null, 2), {encoding: 'utf8'});

    // write .gitignore additions
    let gitignoreContent

    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, { encoding: 'utf8' })
    } else {
      gitignoreContent = ''
    }

    const gitignoreAdditions = newline + '# NativeScript application' + newline + 'hooks' + newline + 'platforms'
    if (gitignoreContent.indexOf(gitignoreAdditions) === -1) {
      gitignoreContent += gitignoreAdditions

      fs.writeFileSync(gitignorePath, gitignoreContent, { encoding: 'utf8' })
    }

  })
}