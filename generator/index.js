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
    }
  })

  api.extendPackage(pkg => {
    delete pkg.dependencies['vue']
    delete pkg.devDependencies['vue-template-compiler']
    delete pkg.browserslist
  })

  api.render('./templates/simple')

  // delete the "public" directory
  api.onCreateComplete(() => {
    const publicPath = api.resolve('public')
    if(fs.existsSync(publicPath)) {
      rimraf.sync(publicPath)
    }
  })
}