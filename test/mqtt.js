var mcs = require('../index.js');
var config = require('../config.json');

var myApp = mcs.register({
  deviceId: config.deviceId,
  deviceKey: config.deviceKey,
  host: 'mqtt.mcs.mediatek.io',
  method: 'mqtt',
  port: 1883,
  qos: 0,
});

myApp.on('switch', function(data) {
  console.log(data);
});

setTimeout(function() {
  myApp.emit('integer','', 12312313);
}, 5000)