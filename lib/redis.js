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
  return keyForDepartment(department, 'hb', function(err, key){
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

var keyForDepartment = function(department, prefix, callback){
  var key = prefix + ":";

  if (department.id) {
    key = key + department.id;
  } else if (department._id) {
    key = key + department._id;
  } else {
    key = key + "unknown";
  }

  return callback(null, key);
};

var checkHeartbeat = function checkHeartbeat(client, department, callback){
  return keyForDepartment(department, 'hb', function(err, key){
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

var expandLocation = function expandLocation(item){
  return {
    location: {
      latitude: item.lat,
      longitude: item.lon
    },
    device_type: item.type,
    username: item.username,
    active: item.active,
    uuid: item.uuid,
    userId: item.userId,
    modified_unix_date: item.t
  };
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
          out = expandLocation(JSON.parse(i));
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

var prepareDebugInfoItem = function prepareDebugInfoItem(item, callback){
  if (!_.isString(item.departmentId) || item.departmentId.length == 0) {
    return callback(new Error("Invalid departmentId", item));
  }

  if (!_.isString(item.userId) || item.userId.length == 0) {
    return callback(new Error("Invalid userId", item));
  }

  if (!_.isString(item.session) || item.session.length == 0) {
    return callback(new Error("Invalid session", item));
  }

  var ttl = 60*60*24*90; // 90d
  var departmentId = item.departmentId;
  var userId = item.userId;
  var session = item.session;

  var key = "info:" + departmentId + ":" + userId + ":" + session;

  var props = ["nick", "appVer", "osVer", "ua", "t", "userId", "departmentId"];
  var object = _.pick(item, props);
  var val = JSON.stringify(object);

  return callback(null, key, val, ttl);
};

var storeDebugInfo = function storeDebugInfo(client, item, callback){
  return prepareDebugInfoItem(item, function(err, key, val, ttl){
    if (err) {
      return callback(err);
    }

    return client.set(key, val, "EX", ttl, function(err, result){
      if (err) {
        console.log("Set key Err", err, "key", key, "value", val);
      }
      return callback(err, result);
    });
  });
};

var checkOnline = function checkOnline(client, department, callback){
  return keyForDepartment(department, 'info', function(err, key){
    return client.keys(key + ":*", function(err, keys){
      if (_.size(keys) === 0) {
        return callback(err, []);
      }

      return client.mget(keys, function(err, items){
        var unpacked = _.map(items, function(item){
          try {
            var o = JSON.parse(item);
            o.department = department.department;
            return o;
          } catch (e) {
            return null;
          }
        });
        var valid = _.filter(unpacked, function(item){
          return _.isObject(item);
        });
        return callback(err, valid);
      });
    });
  });
};

var expireItemsMatchingKey = function expireItemsMatchingKey(client, keyPattern, seconds, callback){
  return client.keys(keyPattern, function(err, keys){
    if (_.size(keys) === 0) {
      return callback(err, []);
    }

    var processExpire = function processExpire(items, index, callback){
      if (index >= _.size(items)) {
        return callback();
      }

      var key = items[index];
      return client.expire(key, seconds, function(err, result){
        return processExpire(items, index + 1, callback);
      });
    };

    return processExpire(keys, 0, callback);
  });
}

var storeAPNInfo = function storeAPNInfo(client, item, callback){
  return prepareStoreAPNInfoItem(item, function(err, key, val, ttl){
    if (err) {
      return callback(err, null);
    }
    return client.incr(key, function(err, result){
      return client.expire(key, ttl, function(err, result){
        return callback(err, result);
      });
    });
  });
};

var prepareStoreAPNInfoItem = function prepareLocationItem(item, callback){
  // INCR apn:deptId:unixTime

  if (!_.isFinite(item.time)) {
    return callback(new Error("Invalid time", item));
  }

  if (!_.isString(item.departmentId)) {
    return callback(new Error("Invalid departmentId", item));
  }

  var ttl = 60*61; // 61 minutes
  var departmentId = item.departmentId;
  var unixTime = moment.unix(item.time).unix();
  var key = "apn:" + departmentId + ":" + unixTime;
  var value = 1;
  return callback(null, key, value, ttl);
};

var apnInfoMixin = function apnInfoMixin(keys, values, callback){
  var items = [];
  _.each(_.zipObject(keys, values), function(value, key){
    var v = parseInt(value);
    if (!_.isFinite(v)){
      return;
    }

    if (!_.isString(key)) {
      return;
    }

    var parts = key.split(":");
    if (!_.isString(parts[1]) || !_.isFinite(parseInt(parts[2]))){
      return;
    }

    var o = {
      time: parseInt(parts[2]),
      departmentId: parts[1],
      value: v
    };

    items.push(o);
  });

  var sorted = _.sortBy(items, 'time');
  return callback(null, sorted);
};

var getAPNInfo = function getAPNInfo(client, department, callback){
  return client.keys("apn:*", function(err, keys){
    var validKeys = _.filter(keys, function(key){
      if (department) {
        var departmentId = 'xoxo';
        if (_.isString(department._id)) {
          departmentId = department._id;
        } else if (_.isObject(department._id)) {
          departmentId = department._id.toString();
        } else if (_.isString(department.id)) {
          departmentId = department.id;
        } else if (_.isObject(department.id)) {
          departmentId = department.id.toString();
        }

        return key.indexOf(departmentId) != -1;
      }

      return true;
    });

    if (_.size(validKeys) === 0) {
      return callback(err, []);
    }

    return client.mget(validKeys, function(err, validValues){
      return apnInfoMixin(validKeys, validValues, function(err, items){
        return callback(err, items);
      });
    });
  });
};

module.exports = {
  client: client,
  logHeartbeat: logHeartbeat,
  checkHeartbeat: checkHeartbeat,
  storeLocation: storeLocation,
  listLocation: listLocation,
  storeDebugInfo: storeDebugInfo,
  checkOnline: checkOnline,
  expireItemsMatchingKey: expireItemsMatchingKey,
  storeAPNInfo: storeAPNInfo,
  getAPNInfo: getAPNInfo,
};
