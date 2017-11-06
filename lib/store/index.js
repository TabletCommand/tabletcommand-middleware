"use strict";

module.exports = function(Department, Session, User, redisClient) {
  const _ = require("lodash");
  const database = require("./database")(Department);
  const redis = require("./redis")(redisClient);

  const findDepartmentByApiKey = function findDepartmentByApiKey(apiKey, callback) {
    let cached = false;
    return redis.findDepartmentByApiKey(apiKey, function(err, redisDepartment) {
      if (err) {
        return callback(err);
      }

      if (_.isObject(redisDepartment)) {
        cached = true;
        return callback(err, redisDepartment, cached);
      }

      return database.findDepartmentByApiKey(apiKey, function(err, dbDepartment) {
        if (err) {
          return callback(err);
        }

        return redis.storeDepartmentByApiKey(apiKey, dbDepartment, function(err) {
          return callback(err, dbDepartment, cached);
        });
      });
    });
  };

  const expireDepartmentByApiKey = function expireDepartmentByApiKey(apiKey, callback) {
    return redis.expireDepartmentByApiKey(apiKey, callback);
  };

  return {
    findDepartmentByApiKey: findDepartmentByApiKey,
    expireDepartmentByApiKey: expireDepartmentByApiKey
  };
};
