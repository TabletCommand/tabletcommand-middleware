"use strict";

module.exports = function(client) {
  // const _ = require("lodash");

  const findDepartmentByApiKey = function findDepartmentByApiKey(apiKey, callback) {
    const key = `api:${apiKey}`;
    return client.get(key, function(err, item) {
      if (err) {
        return callback(err, null);
      }

      let object = null;
      try {
        object = JSON.parse(item);
      } catch (e) {}

      return callback(null, object);
    });
  };

  const storeDepartmentByApiKey = function storeDepartmentByApiKey(apiKey, item, callback) {
    const key = `api:${apiKey}`;
    const val = JSON.stringify(item);
    const ttl = 60 * 60 * 24; // 24h

    return client.set(key, val, "EX", ttl, function(err, result) {
      return callback(err, result);
    });
  };

  const expireDepartmentByApiKey = function expireDepartmentByApiKey(apiKey, callback) {
    const key = `api:${apiKey}`;
    const ttl = 0;
    return client.expire(key, ttl, function(err, result) {
      return callback(err, result);
    });
  };

  return {
    findDepartmentByApiKey: findDepartmentByApiKey,
    storeDepartmentByApiKey: storeDepartmentByApiKey,
    expireDepartmentByApiKey: expireDepartmentByApiKey
  };
};
