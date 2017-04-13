var mcs = require('../index.js');

var myApp = mcs.register({
  deviceId: 'BJ081ihTx',
  deviceKey: '4bdf8f5ee3768b23b00cc2164613964acade01c05cf2fd3a15e9ded96b5513bb',
  source: 'mcs-lite',
  host: '172.23.6.56',
  port: 8000,
});

myApp.on('switch', function(data) {
  console.log(data);
});


setInterval(
  function(){
    myApp.emit('time', '', new Date().getTime());
  }
, 1000);