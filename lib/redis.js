/*jslint node: true */
"use strict";
// seneca=false

var _ = require("lodash");
var moment = require('moment-timezone');

var helpers = require("./helpers");
var redis = require("redis");

var maxListSize = 30;

var client = function(config){
  return redis.createClient(config.redis);
};

var logHeartbeat = function(client, department, message, callback){
  if(_.isUndefined(department)){
    console.log("Undefined department", department);
    return callback(null);
  }

  if(!helpers.itemIsTrue(department, 'heartbeatEnabled')){
    return callback(null);
  }

  // Log Heartbeat cannot expire keys, because we'd lose the last message
  // we're limiting the list to maxListSize items instead
  return keyForDepartment(department, function(err, key){
    return cleanupMessage(message, function(err, msg){
      return client.lpush(key, JSON.stringify(msg), function(err, result){
        return client.ltrim(key, 0, maxListSize - 1, function(err, result){
          return callback(null);
        });
      });
    });
  });
};

var cleanupMessage = function(message, callback) {
  if (!_.isString(message.Time)) {
    if (_.isArray(message.Unit)) {
      var unitTime = null;
      _.each(message.Unit, function(unit) {
        if (_.isString(unit.TimeArrived)) {
          unitTime = unit.TimeArrived;
        } else if (_.isString(unit.TimeEnroute)) {
          unitTime = unit.TimeEnroute;
        } else if (_.isString(unit.TimeDispatched)) {
          unitTime = unit.TimeDispatched;
        }
      });

      if (!_.isNull(unitTime) && !_.isUndefined(unitTime)) {
        message.Time = unitTime;
      }
    } else if (_.isString(message.EntryDateTime)) {
      message.Time = message.EntryDateTime;
    }
  }

  var msg = _.pick(message, ['Time', 'Status', 'Message']);
  msg.RcvTime = new Date().getTime()/1000.0;
  return callback(null, msg);
};

var keyForDepartment = function(department, callback){
  var key = "hb:";

  if (department.id) {
    key = key + department.id;
  } else if (department._id) {
    key = key + department._id;
  } else {
    key = key + "unknown";
  }

  return callback(null, key);
};

var checkHeartbeat = function(client, department, callback){

  return keyForDepartment(department, function(err, key){
    return client.lrange(key, 0, maxListSize, function(err, result){
      var enhancedResults = _.map(result, function(i){
        var item = JSON.parse(i);
        item.RcvTimeSFO = moment.unix(item.RcvTime).tz("America/Los_Angeles").toString();
        item.RcvTimeMEL = moment.unix(item.RcvTime).tz("Australia/Melbourne").toString();
        return item;
      });
      return callback(null, enhancedResults);
    });
  });
};

var retrieveItems = function retrieveItems(client, keys, callback){
  if (!_.isArray(keys) || _.size(keys) == 0) {
    return callback(null, []);
  }

  var validKeys = _.filter(keys, function(k){
    return _.isString(k) && k.length > 0;
  });

  var processKeysList = function processKeysList(client, items, index, resolved, callback){
    if(index >= _.size(items)){
      return callback(null, resolved);
    }

    var key = items[index];
    return client.get(key, function(err, object){
      var resolvedX = _.clone(resolved);
      if (!_.isNull(object) && !_.isUndefined(object)) {
        resolvedX.push(object);
      }
      return processKeysList(client, items, index+1, resolvedX, callback);
    });
  };

  return processKeysList(client, validKeys, 0, [], callback);
};

var prepareLocationItem = function prepareLocationItem(item, callback){
  if (!_.isString(item.departmentId) || item.departmentId.length == 0) {
    return callback(new Error("Invalid departmentId", item));
  }

  if (!_.isString(item.userId) || item.userId.length == 0) {
    return callback(new Error("Invalid userId", item));
  }

  var ttl = 60*60*24; // 24h
  var departmentId = item.departmentId;
  var userId = item.userId;

  var key = "l:" + departmentId + ":" + userId;
  var object = {
    lat: item.location.latitude,
    lon: item.location.longitude,
    type: item.device_type,
    username: item.username,
    active: helpers.itemIsTrue(item, 'active'),
    uuid: item.uuid,
    id: item._id,
    userId: item.userId,
    t: item.modified_unix_date
  };
  var val = JSON.stringify(object);

  return callback(null, key, val, ttl);
};

var listLocation = function listLocation(client, department, callback){
  var departmentId = '';
  if (_.isString(department._id)) {
    departmentId = department._id;
  } else if (_.isObject(department._id)) {
    departmentId = department._id.toString();
  } else if (_.isString(department.id)) {
    departmentId = department.id;
  } else if (_.isObject(department.id)) {
    departmentId = department.id.toString();
  }

  if (!_.isString(departmentId) || departmentId.length == 0) {
    return callback(new Error("Invalid departmentId", department));
  }

  var cursor = "0";
  var match = "l:" + departmentId + ":*";
  var count = "1000";

  return client.scan(cursor, "MATCH", match, "COUNT", 1000, function(err, result){
    return retrieveItems(client, result[1], function(err, items){
      var unpackResults = _.map(items, function(i){
        var out = "";
        try {
          out = JSON.parse(i);
          out.departmentId = departmentId;
        } catch (err) {
        }
        return out;
      });
      var validResults = _.filter(unpackResults, function(i){
        return _.isObject(i) && _.size(i) > 0;
      })
      return callback(err, validResults);
    });
  });
};

var storeLocation = function storeLocation(client, item, callback){
  return prepareLocationItem(item, function(err, key, val, ttl){
    if (err) {
      return callback(err);
    }

    return client.set(key, val, "EX", ttl, function(err, result){
      if (err) {
        console.log("Set key Err", err, "key", key, "value", val);
      }
      process.stdout.write(".");
      return callback(err, result);
    });
  });
};

module.exports = {
  client: client,
  logHeartbeat: logHeartbeat,
  checkHeartbeat: checkHeartbeat,
  storeLocation: storeLocation,
  listLocation: listLocation
};
