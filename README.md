## MCSjs: A Javascript library for Mediatek cloud sandbox


## Installation

```
  $ npm install mcsjs --save
```

## Documentation

Complete documentation can be found in Here.

## Usage For TCP

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

## Usage for MQTT

```js
var mcs = require('mcsjs');

var myApp = mcs.register({
  deviceId: 'your deviceId',
  deviceKey: 'your deviceKey',
  host: 'mqtt.mcs.mediatek.com',
  method: 'mqtt',
  port: 1883,
  qos: 0,
});

myApp.on('switch', function(data) {
  console.log(data);
});

setTimeout(function() {
  myApp.emit('integer','', 456);
}, 5000)

```

## How to test
