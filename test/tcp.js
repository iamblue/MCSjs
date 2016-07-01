var mcs = require('../index.js');
var config = require('../config.json');

var myApp = mcs.register({
  deviceId: 'DU8xrUWV',
  deviceKey: 'nE1EFLIlm3TrZg79',
});

myApp.on('switch', function(data) {
  console.log(data);
});

// setTimeout(function() {
//   console.log(123)
//   myApp.emit('encodeByMD5','', '1232312');
// }, 5000)