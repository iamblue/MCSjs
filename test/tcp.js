var mcs = require('../index.js');
var config = require('../config.json');

var myApp = mcs.register({
  deviceId: config.deviceId,
  deviceKey: config.deviceKey,
  // host: 'api.mediatek.io',
});

myApp.on('switch', function(data) {
  console.log(data);
});

setTimeout(function() {
  console.log(123)
  myApp.emit('encodeByMD5','', '1232312');
}, 5000)