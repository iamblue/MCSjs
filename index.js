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

function initTcpMethod(deviceId, deviceKey, host) {
  var net = require('net');
  return api.fetchTCPIP(deviceId, deviceKey, host)
  .then(function(data) {
    var TCP_IP = data.text.split(',')[0];
    var TCP_PORT = data.text.split(',')[1];
    console.log(data.text);
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

  eventEmitter.on('mcs:sendmsg', function(data, dataChannel) {
    client.publish(topic.replace('/+', '/' + dataChannel) , data.toString(), { qos: qos });
  });

  client.on('close', function() {
    eventEmitter.emit('mcs:connected', false);
  });

}

function init(deviceId, deviceKey, method, host, port, qos, mqttHost) {

  if (method === 'tcp') {
    initTcpMethod(deviceId, deviceKey, host);
    console.log(123123)
  } else if (method === 'mqtt') {
    initMQTTMethod(deviceId, deviceKey, mqttHost, port, qos)
  }

  return {
    on: function(dataChannel, callback) {
      return eventEmitter.on(dataChannel, function() {
        if(callback) callback.apply(null,[].slice.call(arguments))
      });
    },
    emit: function(dataChannel, timestamp, value) {
      if ( method === 'tcp' ) {
        return api.uploadDataPoint(deviceId, deviceKey, dataChannel, timestamp, value, host);
      } else if ( method === 'mqtt' ) {
        return eventEmitter.emit('mcs:sendmsg', value, dataChannel);
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
    }
  };
};

function mcs () {
  this.deviceId =  '';
  this.deviceKey =  '';
  this.api = api;
  this.register = function(config) {
    this.deviceId = config.deviceId;
    this.deviceKey = config.deviceKey;
    this.method = config.method || 'tcp',
    this.host = config.host;
    this.port = config.port;
    this.qos = config.qos;
    this.mqttHost = config.mqttHost;
    return init(this.deviceId, this.deviceKey, this.method, this.host, this.port, this.qos, this.mqttHost);
  };
}

mcs.prototype.construcot = mcs;

module.exports = new mcs();
