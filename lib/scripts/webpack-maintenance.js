const fs = require('fs');
const replace = require('replace-in-file');

const mode = process.argv[2];

if (mode === 'pre') Pre();

if (mode === 'post') Post();

function Pre() {
  console.log('copying CLI 3 version of webpack.config.js to project');
  // setup string replacement options for webpack.config.js file
  const replaceOptions = {
    files: './webpack.config.js',
    from: './lib/Service',
    to: '@vue/cli-service/lib/Service'
  };

  // copy the dynamic webpack config from the cli-service.
  fs.copyFile('./node_modules/@vue/cli-service/webpack.config.js', './webpack.config.js', (err) => {
    //console.error('copyFile Error occurred:', err);
    if (err) {
      console.error('copyFile Error occurred:', err);
      if (err) throw err;
    }

    // edit the file to correct a hard-coded path to be relative
    replace(replaceOptions, (err, changes) => {
      if (err) {
        console.error('replace Error occurred:', err);
        if (err) throw err;
      }
    });
  });
}

function Post() {
  console.log('starting Post');
  if (fs.existsSync('./webpack.config.js')) {
    fs.unlink('./webpack.config.js', (err) => {
      if (err) throw err;
    });
  }
}
