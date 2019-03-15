/* eslint-disable no-unused-vars */
module.exports = (api) => {
  api.describeConfig({
    // Unique ID for the config
    id: 'org.nativescript-vue.plugin.cli',
    // Displayed name
    name: 'Nativescript-Vue CLI 3 Plugin',
    // Shown below the name
    description: 'A vue cli 3.x plugin for NativeScript-Vue',
    // "More info" link
    link: 'https://github.com/nativescript-vue/vue-cli-plugin-nativescript-vue#readme',
    onRead: ({ data, cwd }) => ({
      //
    }),
    onWrite: ({ prompts, answers, data, files, cwd, api }) => {
      //
    }
  });
};
