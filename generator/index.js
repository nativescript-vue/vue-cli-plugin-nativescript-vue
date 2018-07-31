module.exports = (api, options, rootOptions) => {
  const fs = require('fs')
  const rimraf = require('rimraf')

  api.extendPackage({
    scripts: {
      'watch:android': 'vue-cli-service tns --android',
      'watch:ios': 'vue-cli-service tns --ios',
    },
    dependencies: {
      'nativescript-vue': '^1.3.1'
    },
    devDependencies: {
      'nativescript-vue-loader': '1.0.0',
      'nativescript-vue-template-compiler': '^1.3.1',
      'tns-core-modules': '^4.0.0'
    }
  })

  api.extendPackage(pkg => {
    delete pkg.dependencies['vue']
    delete pkg.devDependencies['vue-template-compiler']
    delete pkg.browserslist
    delete pkg.scripts['serve']
  })

  api.render('./templates/simple', {
    applicationName: api.generator.pkg.name,
    applicationVersion: api.generator.pkg.version,
    applicationAndroidVersionCode: api.generator.pkg.version.split('.').join('0'),
    applicationDescription: api.generator.pkg.description || api.generator.pkg.name,
    applicationLicense: api.generator.pkg.license || 'MIT',
    applicationId: options.applicationId,
    historyMode: options.historyMode || false,
  })

  // delete the "public" directory
  api.onCreateComplete(() => {
    const publicPath = api.resolve('public')
    if(fs.existsSync(publicPath)) {
      rimraf.sync(publicPath)
    }
  })
}