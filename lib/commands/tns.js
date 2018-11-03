const fs = require('fs');
const cmd = require('node-cmd');
const replace = require('replace-in-file');

module.exports = (args, api) => {
  //console.log('in tns setup');

  // setup string replacement options for webpack.config.js file
  const replaceOptions = {
    files: './webpack.config.js',
    from: './lib/Service',
    to: '@vue/cli-service/lib/Service',
  }

  const env = process.env.NODE_ENV
  // console.log('TNS.js --- env - ', env);
  const platform = process.env.VUE_PLATFORM;
  // console.log('TNS.js --- platform - ', platform)

  // copy the dynamic webpack config from the cli-service.
  fs.copyFile('./node_modules/@vue/cli-service/webpack.config.js', './webpack.config.js', (err) => {
    if (err) throw err;

    // edit the file to correct a hard-coded path to be relative
    replace(replaceOptions, (error, changes) => {
      if (error) {
        return console.error('Error occurred:', error);
      }

      const command = 'tns ' + (env === 'production' ? 'build' : 'run') + ' ' + platform + ' --bundle';

      // run the tns command
      const processRef = cmd.get(command);

      // delete the webpack.config.js
      process.on('SIGINT', function() {
        if (fs.existsSync('./webpack.config.js')) {
          fs.unlink('./webpack.config.js', (err) => {
            if (err) throw err;
          });
        }
      });

      processRef.stdout.on(
        'data',
        function(data) {
          console.log(data.toString());
        }
      );
  
      processRef.stderr.on('data', function (data) {
        console.log(data.toString());
      });
      
      processRef.on('exit', function (code) {
        console.log('child process exited with code ' + code.toString());
        if (fs.existsSync('./webpack.config.js')) {
          fs.unlink('./webpack.config.js', (err) => {
            if (err) throw err;
          });
        }
      });

    });

  });

}

