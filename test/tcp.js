var mcs = require('../index.js');
// var config = require('../config.json');

var myApp = mcs.register({
  deviceId: 'DSf5ed5S',
  deviceKey: '2FQteEYJ64rAP4ky',
});

myApp.on('control', function(data) {
  console.log(data);
});

// setTimeout(function() {
//   console.log(123)
//   myApp.emit('encodeByMD5','', '1232312');
// }, 5000)