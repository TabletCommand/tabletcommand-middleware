"use strict";

module.exports = function (client) {
  var _ = require("lodash");

  var findDepartmentByApiKey = function findDepartmentByApiKey(apiKey, callback) {
    var key = "api:" + apiKey;
    return client.get(key, function (err, item) {
      if (err) {
        return callback(err, null);
      }

      var object = null;
      try {
        object = JSON.parse(item);
      } catch (e) {}

      return callback(null, object);
    });
  };

  var storeDepartmentByApiKey = function storeDepartmentByApiKey(apiKey, item, callback) {
    var key = "api:" + apiKey;
    var val = JSON.stringify(item);
    var ttl = 60 * 60 * 24; // 24h

    return client.set(key, val, "EX", ttl, function (err, result) {
      return callback(err, result);
    });
  };

  var expireDepartmentByApiKey = function expireDepartmentByApiKey(apiKey, callback) {
    var key = "api:" + apiKey;
    return expireItemByKey(key, callback);
  };

  var expireItemByKey = function expireItemByKey(key, callback) {
    var ttl = 0;
    return client.expire(key, ttl, function (err, result) {
      return callback(err, result);
    });
  };

  var findSessionByToken = function findSessionByToken(token, callback) {
    var key = "s:" + token;

    return client.get(key, function (err, item) {
      if (err) {
        return callback(err, null, null, null);
      }

      var session = null;
      var user = null;
      var department = null;
      try {
        var object = JSON.parse(item);
        if (_.isObject(object.s)) {
          session = object.s;
        }
        if (_.isObject(object.u)) {
          user = object.u;
        }
        if (_.isObject(object.d)) {
          department = object.d;
        }
      } catch (e) {}

      return callback(null, session, user, department);
    });
  };

  var storeSessionByToken = function storeSessionByToken(token, session, user, department, callback) {
    var key = "s:" + token;
    var item = {
      s: session,
      u: user,
      d: department
    };
    var val = JSON.stringify(item);
    var ttl = 60 * 60 * 12; // 12h
    return client.set(key, val, "EX", ttl, function (err, result) {
      return callback(err, result);
    });
  };

  var expireSessionByToken = function expireSessionByToken(token, callback) {
    var key = "s:" + token;
    return expireItemByKey(key, callback);
  };

  return {
    findDepartmentByApiKey: findDepartmentByApiKey,
    storeDepartmentByApiKey: storeDepartmentByApiKey,
    expireDepartmentByApiKey: expireDepartmentByApiKey,

    findSessionByToken: findSessionByToken,
    storeSessionByToken: storeSessionByToken,
    expireSessionByToken: expireSessionByToken
  };
};