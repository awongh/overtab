# overtab

Chrome extension that manages your open tabs.

Find and manipulate your open tabs, no more searching through minimized open tabs for a particular tab.

### Find it on the chrome store: [here](https://chrome.google.com/webstore/detail/leceanmnoanolhdkonbapdkplgikipon)

## Prequisites

##### yeoman
  
  ```
    npm install -g yo
  ```
##### compass
  ```
    gem install compass

  ```
    npm install
    bower install

  For some reason the conditional @ wiredep/lib/detect-dependencies.js line 119 can't find the "main" key in the auto generated .bower.json file in the chrome-platform-analytics dependency. To get analytics working add this line to .bower.json in the app/bower_components/chrome-platform-analytics dir before doing grunt build: "main": "google-analytics-bundle.js",

  ```
    grunt build

## Installing

##### You don't need to install node or compass if you want to install the build from this repo go to /dist.

#### Goto:
  > chrome://extensions

#### Click:

  > check the "developer mode" checkbox

  > Load unpacked extension

  > Select overtab directory. /dist or, if building with Grunt (as above), /app

## Note
  On retina macs overtab may experience this [bug](https://code.google.com/p/chromium/issues/detail?id=367931). If you see excessive memory consumption on your machine consider making a comment on this issue to the chromium team. Overtab currently limits the number of screencaps done on these machines to avoid problems.

## License

MIT.
