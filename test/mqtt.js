var mcs = require('../index.js');

var myApp = mcs.register({
  deviceId: 'DESllkuv',
  deviceKey: 'yiMzYOD3tB2FZwdO',
  mqttHost: 'mqtt.mcs.mediatek.com',
  method: 'mqtt',
  port: 1883,
  qos: 0,
});

myApp.on('switch', function(data) {
  console.log(data);
});

setTimeout(function() {
  myApp.emit('string','', new Date().getTime());
}, 1000)