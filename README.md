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

myApp.on('GPIO_00', function(data) {
  console.log('blink');
});

myApp.on('mcs:command', function(data) {
  console.log(data);
});

// myApp.catch(function(err) {
//   console.log(err);
// })

// myApp.end();
// myApp.emit('GPIO_00','1');

```

## How to test