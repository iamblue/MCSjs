## MCSjs: A Javascript library for Mediatek cloud sandbox


## Installation

```
  $ npm install mcsjs --save
```

## Documentation

Complete documentation can be found in Here.

## Usage

```js

var mcs = require('mcsjs');

var myApp = mcs.register({
  deviceId: 'Input your deviceId',
  deviceKey: 'Input your deviceKey',
});

// Listening the command from MCS.
myApp.on('control_channel_name', function(data, timestamp) {
  console.log('blink');
});

// Uploading data to MCS.
myApp.on('display_channel_name', '', 'your data');

// myApp.catch(function(err) {
//   console.log(err);
// })
// myApp.end();

```

## How to test
