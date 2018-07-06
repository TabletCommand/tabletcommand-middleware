"use strict";

var _ = require("lodash");
var moment = require("moment-timezone");

var helpers = require("./helpers");
var redis = require("redis");

var client = function client(config) {
  return redis.createClient(config.redis);
};

var keyForDepartment = function keyForDepartment(department, prefix, callback) {
  var key = prefix + ":";

  if (_.isString(department.id)) {
    key = key + department.id;
  } else if (_.isString(department._id)) {
    key = key + department._id;
  } else {
    key = key + "unknown";
  }

  return callback(null, key);
};

var retrieveItems = function retrieveItems(client, keys, callback) {
  if (!_.isArray(keys) || _.size(keys) === 0) {
    return callback(null, []);
  }

  var validKeys = _.filter(keys, function(k) {
    return _.isString(k) && k.length > 0;
  });

  var processKeysList = function processKeysList(client, items, index, resolved, callback) {
    if (index >= _.size(items)) {
      return callback(null, resolved);
    }

    var key = items[index];
    return client.get(key, function(err, object) {
      if (err) {
        return callback(err, []);
      }
      var resolvedX = _.clone(resolved);
      if (!_.isNull(object) && !_.isUndefined(object)) {
        resolvedX.push(object);
      }
      return processKeysList(client, items, index + 1, resolvedX, callback);
    });
  };

  return processKeysList(client, validKeys, 0, [], callback);
};

var prepareLocationItem = function prepareLocationItem(item, callback) {
  if (!_.isString(item.departmentId) || item.departmentId.length === 0) {
    return callback(new Error("Invalid departmentId", item));
  }

  if (!_.isString(item.userId) || item.userId.length === 0) {
    return callback(new Error("Invalid userId", item));
  }

  var ttl = 60 * 60 * 24; // 24h
  var departmentId = item.departmentId;
  var userId = item.userId;

  var key = "l:" + departmentId + ":" + userId;
  var object = {
    lat: item.location.latitude,
    lon: item.location.longitude,
    type: item.device_type,
    username: item.username,
    active: helpers.itemIsTrue(item, "active"),
    uuid: item.uuid,
    id: item._id,
    userId: item.userId,
    t: item.modified_unix_date
  };
  var val = JSON.stringify(object);

  return callback(null, key, val, ttl);
};

var expandLocation = function expandLocation(item) {
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

var listLocation = function listLocation(client, department, callback) {
  var departmentId = "";
  if (_.isString(department._id)) {
    departmentId = department._id;
  } else if (_.isObject(department._id)) {
    departmentId = department._id.toString();
  } else if (_.isString(department.id)) {
    departmentId = department.id;
  } else if (_.isObject(department.id)) {
    departmentId = department.id.toString();
  }

  if (!_.isString(departmentId) || departmentId.length === 0) {
    return callback(new Error("Invalid departmentId", department));
  }

  var cursor = "0";
  var match = "l:" + departmentId + ":*";
  var count = "1000";

  return client.scan(cursor, "MATCH", match, "COUNT", count, function(err, result) {
    if (err) {
      return callback(err);
    }
    return retrieveItems(client, result[1], function(err, items) {
      var unpackResults = _.map(items, function(i) {
        var out = "";
        try {
          out = expandLocation(JSON.parse(i));
          out.departmentId = departmentId;
        } catch (err) {}
        return out;
      });
      var validResults = _.filter(unpackResults, function(i) {
        return _.isObject(i) && _.size(i) > 0;
      });
      return callback(err, validResults);
    });
  });
};

var storeLocation = function storeLocation(client, item, callback) {
  return prepareLocationItem(item, function(err, key, val, ttl) {
    if (err) {
      return callback(err);
    }

    return client.set(key, val, "EX", ttl, function(err, result) {
      if (err) {
        console.log("Set key Err", err, "key", key, "value", val);
      }
      process.stdout.write(".");
      return callback(err, result);
    });
  });
};

var prepareDebugInfoItem = function prepareDebugInfoItem(item, callback) {
  if (!_.isString(item.departmentId) || item.departmentId.length === 0) {
    return callback(new Error("Invalid departmentId", item));
  }

  if (!_.isString(item.userId) || item.userId.length === 0) {
    return callback(new Error("Invalid userId", item));
  }

  if (!_.isString(item.session) || item.session.length === 0) {
    return callback(new Error("Invalid session", item));
  }

  var ttl = 60 * 60 * 24 * 14; // 14d
  var departmentId = item.departmentId;
  var userId = item.userId;
  var session = item.session;

  var key = "info:" + departmentId + ":" + userId + ":" + session;

  var props = ["nick", "appVer", "osVer", "ua", "t", "userId", "departmentId"];
  var object = _.pick(item, props);
  var val = JSON.stringify(object);

  return callback(null, key, val, ttl);
};

var storeDebugInfo = function storeDebugInfo(client, item, callback) {
  return prepareDebugInfoItem(item, function(err, key, val, ttl) {
    if (err) {
      return callback(err);
    }

    return client.set(key, val, "EX", ttl, function(err, result) {
      if (err) {
        console.log("Set key Err", err, "key", key, "value", val);
      }
      return callback(err, result);
    });
  });
};

var checkOnline = function checkOnline(client, department, callback) {
  return keyForDepartment(department, "info", function(err, key) {
    if (err) {
      return callback(err);
    }
    return client.keys(key + ":*", function(err, keys) {
      if (_.size(keys) === 0) {
        return callback(err, []);
      }

      return client.mget(keys, function(err, items) {
        var unpacked = _.map(items, function(item) {
          try {
            var o = JSON.parse(item);
            o.department = department.department;
            return o;
          } catch (e) {
            return null;
          }
        });
        var valid = _.filter(unpacked, function(item) {
          return _.isObject(item);
        });
        return callback(err, valid);
      });
    });
  });
};

var expireItemsMatchingKey = function expireItemsMatchingKey(client, keyPattern, seconds, callback) {
  return client.keys(keyPattern, function(err, keys) {
    if (_.size(keys) === 0) {
      return callback(err, []);
    }

    var processExpire = function processExpire(items, index, callback) {
      if (index >= _.size(items)) {
        return callback();
      }

      var key = items[index];
      return client.expire(key, seconds, function(err, result) {
        if (err) {
          return callback(err);
        }
        return processExpire(items, index + 1, callback);
      });
    };

    return processExpire(keys, 0, callback);
  });
};

var storeAPNInfo = function storeAPNInfo(client, item, callback) {
  return prepareStoreAPNInfoItem(item, function(err, key, val, ttl) {
    if (err) {
      return callback(err, null);
    }
    return client.incr(key, function(err, result) {
      if (err) {
        return callback(err);
      }
      return client.expire(key, ttl, function(err, result) {
        return callback(err, result);
      });
    });
  });
};

var prepareStoreAPNInfoItem = function prepareStoreAPNInfoItem(item, callback) {
  // INCR apn:deptId:unixTime

  if (!_.isFinite(item.time)) {
    return callback(new Error("Invalid time", item));
  }

  if (!_.isString(item.departmentId)) {
    return callback(new Error("Invalid departmentId", item));
  }

  var ttl = 60 * 61; // 61 minutes
  var departmentId = item.departmentId;
  var unixTime = moment.unix(item.time).unix();
  var key = "apn:" + departmentId + ":" + unixTime;
  var value = 1;
  return callback(null, key, value, ttl);
};

var apnInfoMixin = function apnInfoMixin(keys, values, callback) {
  var grouped = {};
  _.each(_.zipObject(keys, values), function(value, key) {
    var v = parseInt(value);
    if (!_.isFinite(v)) {
      return;
    }

    if (!_.isString(key)) {
      return;
    }

    var parts = key.split(":");
    if (!_.isString(parts[1]) || !_.isFinite(parseInt(parts[2]))) {
      return;
    }

    var t = parseInt(parts[2]);

    if (!_.has(grouped, t)) {
      grouped[t] = 0;
    }
    grouped[t] = grouped[t] + v;
  });

  var simplified = _.map(grouped, function(value, time) {
    return {
      time: parseInt(time),
      value: value
    };
  });

  var sorted = _.sortBy(simplified, "time");
  return callback(null, sorted);
};

var getAPNInfo = function getAPNInfo(client, department, callback) {
  return client.keys("apn:*", function(err, keys) {
    var validKeys = _.filter(keys, function(key) {
      if (department) {
        var departmentId = "xoxo";
        if (_.isString(department._id)) {
          departmentId = department._id;
        } else if (_.isObject(department._id)) {
          departmentId = department._id.toString();
        } else if (_.isString(department.id)) {
          departmentId = department.id;
        } else if (_.isObject(department.id)) {
          departmentId = department.id.toString();
        }

        return key.indexOf(departmentId) !== -1;
      }

      return true;
    });

    if (_.size(validKeys) === 0) {
      return callback(err, []);
    }

    return client.mget(validKeys, function(err, validValues) {
      if (err) {
        return callback(err, []);
      }
      return apnInfoMixin(validKeys, validValues, function(err, items) {
        return callback(err, items);
      });
    });
  });
};

module.exports = {
  client: client,
  storeLocation: storeLocation,
  listLocation: listLocation,
  storeDebugInfo: storeDebugInfo,
  checkOnline: checkOnline,
  expireItemsMatchingKey: expireItemsMatchingKey,
  storeAPNInfo: storeAPNInfo,
  getAPNInfo: getAPNInfo
};
