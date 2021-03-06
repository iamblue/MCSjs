var request = require('superagent');
var globalHost = 'https://api.mediatek.com';
var Promise = require('bluebird');

var APIs = {
  fetchTCPIP: function(deviceId, deviceKey, host) {
    var host = host || globalHost;
    return new Promise(function(resolve, reject) {
      request
      .get(host + '/mcs/v2/devices/' + deviceId + '/connections.csv')
      .set('deviceKey', deviceKey)
      .set('Content-Type', 'text/csv')
      .end(function(err, res) {
        return res.ok ? resolve(res) : reject(err);
      });
    })
  },

  uploadDataPoint: function(deviceId, deviceKey, dataChannel, timestamp, value, host) {
    var host = host || globalHost;
    var data = dataChannel + ',' + timestamp + ',' + value;
    return new Promise(function(resolve, reject) {
      request
      .post(host + '/mcs/v2/devices/' + deviceId + '/datapoints.csv')
      .send(data)
      .set('deviceKey', deviceKey)
      .set('Content-Type', 'text/csv')
      .end(function(err, res) {
        return res.ok ? resolve(res) : reject(err);
      });
    })
  }
};

module.exports = APIs
