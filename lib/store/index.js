"use strict";

module.exports = function(Department, redisClient) {
  const _ = require("lodash");
  const database = require("./database")(Department);
  const redis = require("./redis")(redisClient);

  const findDepartmentByApiKey = function findDepartmentByApiKey(apiKey, callback) {
    return redis.findDepartmentByApiKey(apiKey, function(err, redisDepartment) {
      if (err) {
        return callback(err);
      }

      if (_.isObject(redisDepartment)) {
        return callback(err, redisDepartment);
      }

      return database.findDepartmentByApiKey(apiKey, function(err, dbDepartment) {
        if (err) {
          return callback(err);
        }

        return redis.storeDepartmentByApiKey(apiKey, dbDepartment, function(err) {
          return callback(err, dbDepartment);
        });
      });
    });
  };

  return {
    findDepartmentByApiKey: findDepartmentByApiKey
  };
};
