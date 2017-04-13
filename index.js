var events = require('events');
var eventEmitter = new events.EventEmitter();
var api = require('./Utils/api');

function emitData(data, deviceId, deviceKey) {
  eventEmitter.emit('mcs:command', data.toString());
  var command = data.toString();

  if (deviceId && deviceKey) {
    // for tcp
    command = data.toString().replace(deviceId + ',' + deviceKey + ',', '');
  }

  var commandTime = command.split(',')[0];
  var commandDataChannel = command.split(',')[1];
  var commandDataValue = command.split(commandTime+','+commandDataChannel+',')[1];

  if (commandDataChannel && commandDataValue) {
    return eventEmitter.emit(commandDataChannel, commandDataValue, commandTime)
  }

}

function emitJSONData(data) {
  var data = JSON.parse(data);
  if (data.datachannelId) {
    return eventEmitter.emit(data.datachannelId, data.values.value);
  }
}

function initTcpMethod(deviceId, deviceKey, host) {
  var net = require('net');

  return api.fetchTCPIP(deviceId, deviceKey, host)
  .then(function(data) {
    var TCP_IP = data.text.split(',')[0];
    var TCP_PORT = data.text.split(',')[1];
    var client = new net.Socket();

    client.connect(TCP_PORT, TCP_IP, function() {
      eventEmitter.emit('mcs:connected', true);
      client.write(deviceId + ',' + deviceKey + ',0');
      function hearbeating() {
        setTimeout(function () {
          client.write(deviceId + ',' + deviceKey + ',0');
          hearbeating();
        }, 50000);
      }
      hearbeating();
    });

    client.on('data', function(data) {
      emitData(data, deviceId, deviceKey);
      eventEmitter.on('end', function(){
        return client.destroy();
      });

    });

    client.on('close', function() {
      eventEmitter.emit('mcs:connected', false);
    });
  })
  .catch(function(err) {
    console.log(err)
    return eventEmitter.emit('mcs:error', err);
  });
}

function initMQTTMethod(deviceId, deviceKey, host, port, qos) {
  var mqtt = require('mqtt');

  var settings = {
    clientId: 'client-' + new Date().getTime(),
    port: port,
    host: host,
  };

  var qos = qos || 0;

  var topic = 'mcs/' + deviceId + '/' + deviceKey + '/+';
  client = mqtt.connect(settings);

  client.subscribe(topic, { qos: qos }, function() {
    console.log('Connect to MCS.');
  });

  client.on('message', function(topic, data) {
    emitData(data);
  });

  client.on('close', function() {
    eventEmitter.emit('mcs:connected', false);
  });

}

function initMCS(deviceId, deviceKey, method, host, port, qos, mqttHost, source) {

  switch (method) {
    case 'tcp':
      initTcpMethod(deviceId, deviceKey, host);
      break;
    case 'mqtt':
      initMQTTMethod(deviceId, deviceKey, mqttHost, port, qos);
      break;
  }

  return {
    on: function(dataChannel, callback) {
      return eventEmitter.on(dataChannel, function() {
        if(callback) callback.apply(null,[].slice.call(arguments))
      });
    },

    emit: function(dataChannel, timestamp, value) {
      switch (method) {
        case 'tcp':
          return api.uploadDataPoint(deviceId, deviceKey, dataChannel, timestamp, value, host);
          break;
        case 'mqtt':
          return eventEmitter.emit('mcs:sendmsg', ',' + timestamp + ',' + value, dataChannel);
          break;
      }
    },

    end: function() {
      return eventEmitter.emit('end');
    },

    catch: function (callback){
      return eventEmitter.on('mcs:error', function(err) {
        console.log(err);
        return callback(err);
      });
    },

  };
};


// client.on('connectFailed', function(error) {
//     console.log('Connect Error: ' + error.toString());
// });

// client.on('connect', function(connection) {
//     console.log('WebSocket client connected');
//     connection.on('error', function(error) {
//         console.log("Connection Error: " + error.toString());
//     });
//     connection.on('close', function() {
//         console.log('echo-protocol Connection Closed');
//     });
//     connection.on('message', function(message) {
//         if (message.type === 'utf8') {
//             console.log("Received: '" + message.utf8Data + "'");
//         }
//     });

//     function sendNumber() {
//         if (connection.connected) {
//             var number = Math.round(Math.random() * 0xFFFFFF);
//             // 1 to 10
//             var lucky = Math.round(Math.random() * 40 + 1);
//             //var obj = {ax: number.toString(), ay: 0, az: 0};
//             var obj = {
//                 datachannelId: datachannelId,
//                 values: {
//                     value: value,
//                 }
//             };

//             console.log('Pushing: ' + JSON.stringify(obj));

//             connection.sendUTF(JSON.stringify(obj));
//             setTimeout(sendNumber, 500);
//         }
//     }
//     sendNumber();
// });

function initMCSLite(deviceId, deviceKey, host, port) {
  var WebSocketClient = require('websocket').client;
  var client = new WebSocketClient();
  var clientSender = new WebSocketClient();

  client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
  });

  client.on('connect', function(connection) {
    connection.on('error', function(error) {
      console.log("Connection Error: " + error.toString());
    });

    connection.on('close', function() {
      console.log('echo-protocol Connection Closed');
    });

    connection.on('message', function(message) {
      emitJSONData(message.utf8Data);
    });
  });

  client.connect('ws://' + host + ':' + port + '/deviceId/' + deviceId + '/deviceKey/' + deviceKey + '/viewer', '');

  clientSender.on('connect', function(connection) {
    eventEmitter.on('mcs:sendmsg', function(datachannelId, timestamp, value) {
      var obj = {
        datachannelId: datachannelId,
        values: {
          value: value,
        }
      };
      connection.sendUTF(JSON.stringify(obj));
    });
  });

  clientSender.connect('ws://' + host + ':' + port + '/deviceId/' + deviceId + '/deviceKey/' + deviceKey, '');

  return {
    on: function(dataChannel, callback) {
      return eventEmitter.on(dataChannel, function() {
        if(callback) callback.apply(null,[].slice.call(arguments))
      });
    },

    emit: function(dataChannel, timestamp, value) {
      return eventEmitter.emit('mcs:sendmsg', dataChannel, timestamp, value);
    },

    end: function() {
      return eventEmitter.emit('end');
    },

    catch: function (callback){
      return eventEmitter.on('mcs:error', function(err) {
        console.log(err);
        return callback(err);
      });
    },

  };
};

function mcs () {
  this.deviceId =  '';
  this.deviceKey =  '';
  this.api = api;

  this.register = function(config) {
    this.deviceId = config.deviceId;
    this.deviceKey = config.deviceKey;
    this.method = config.method || 'tcp';
    this.host = config.host;
    this.port = config.port;
    this.qos = config.qos;
    this.mqttHost = config.mqttHost;

    if (config.source === 'mcs-lite') {
      return initMCSLite(
        this.deviceId,
        this.deviceKey,
        this.host,
        this.port
      );
    } else {
      return initMCS(
        this.deviceId,
        this.deviceKey,
        this.method,
        this.host,
        this.port,
        this.qos,
        this.mqttHost
      );
    }
  };
}

mcs.prototype.construcot = mcs;

module.exports = new mcs();
