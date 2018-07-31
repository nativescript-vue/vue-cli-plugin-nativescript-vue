const path = require('path')

module.exports = (api, projectOptions) => {
  process.env.VUE_CLI_TARGET = 'nativescript'

  api.chainWebpack(config => {
    config.output.filename(`app.js`)
      .chunkFilename('vendor.js')

    config.resolve.alias.delete('vue$');

    config.resolve.extensions.add('.android.js')
    config.resolve.extensions.add('.common.js')

    const tnsCorePath = api.resolve('node_modules/tns-core-modules')
    config.resolve.modules.add(tnsCorePath)
    config.resolveLoader.modules.add(tnsCorePath)

    const vueRule = config.module.rule('vue').test(/\.vue$/)

    vueRule.use('vue-loader').tap(options => {
      options.compilerOptions.compiler = require('nativescript-vue-template-compiler')
      options.compilerOptions = options.compilerOpitons
      delete options.compilerOpitons;
    })

    const addLoader = ({loader, options}) => {
      vueRule.use(loader).loader(loader).options(options)
    }

    addLoader({
      loader: 'nativescript-vue-loader',
      options: {}
    })

    config.plugins.delete('hmr')
    config.plugin('extract-css').tap(args => {
      if (!args.length) return args;

      args[0].filename = 'app.css'
      args[0].chunkFilename = 'vendor.css'

      return args;
    })

    const nodeModulesPath = api.resolve('node_modules')
    config.externals((context, request, callback) => {
      if (context.startsWith(nodeModulesPath)) {
        const module = context.replace(nodeModulesPath, '').split(path.sep).find(p => !!p)
        try {
          const pkg = require(path.resolve(nodeModulesPath, module, 'package.json'))
          if(pkg.nativescript) {
            return callback(null, 'commonjs ' + request)
          }
        } catch (e) {
        }
      }
      callback()
    })
  })

  api.registerCommand('tns', {
    description: 'run nativescript cli commands',
    usage: 'vue-cli-service tns [options]',
    options: {
      '--android': 'run in android emulator',
      '--ios': 'run in ios simulator',
      '--release': 'run in release mode',
    }
  }, require('./lib/commands/tns'))
}