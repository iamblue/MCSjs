var events = require('events');
var eventEmitter = new events.EventEmitter();
var net = require('net');
var api = require('./Utils/api');

function init(deviceId, deviceKey) {
  api.fetchTCPIP(deviceId, deviceKey)
  .then(function(data) {
    var TCP_IP = data.text.split(',')[0];
    var TCP_PORT = data.text.split(',')[1];
    var client = new net.Socket();

    client.connect(TCP_PORT, TCP_IP, function() {
      eventEmitter.emit('mcs:connected', true);
      client.write(deviceId + ',' + deviceKey + ',0');
    });

    client.on('data', function(data) {
      eventEmitter.emit('mcs:command', data.toString());

      var command = data.toString().replace(deviceId + ',' + deviceKey + ',', '');
      var commandTime = command.split(',')[0];
      var commandDataChannel = command.split(',')[1];
      var commandDataValue = command.split(commandTime+','+commandDataChannel+',')[1];

      if (commandDataChannel && commandDataValue) {
        return eventEmitter.emit(commandDataChannel, commandTime, commandDataValue)
      }

      eventEmitter.on('end', function(){
        return client.destroy();
      });

    });

    client.on('close', function() {
      eventEmitter.emit('mcs:connected', false);
    });
  })
  .catch(function(err) {
    return eventEmitter.emit('mcs:error', err);
  })

  return {
    on: function(dataChannel, callback) {
      return eventEmitter.on(dataChannel, function(data) {
        return callback(data);
      });
    },
    emit: function(dataChannel, timestamp, value) {
      return api.uploadDataPoint(deviceId, deviceKey, dataChannel, timestamp, value);
    },
    end: function() {
      return eventEmitter.emit('end');
    },
    catch: function (callback){
      return eventEmitter.on('mcs:error', function(err) {
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
    return init(this.deviceId, this.deviceKey);
  };
}

mcs.prototype.construcot = mcs;

module.exports = new mcs();
