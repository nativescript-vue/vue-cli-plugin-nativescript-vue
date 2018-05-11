module.exports = (api, projectOptions) => {
  api.chainWebpack(config => {
    config.resolve.alias.delete('vue$');
    const vueRule = config.module.rule('vue').test(/\.vue$/)

    vueRule.use('vue-loader').tap(options => {
      // todo fix typo when pr merged
      options.compilerOpitons.compiler = require('nativescript-vue-template-compiler')
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