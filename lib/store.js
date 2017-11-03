"use strict";

module.exports = function(Department, redisClient) {
  const _ = require("lodash");
  const storeDatabase = require("../lib/store-database")(Department);
  const storeRedis = require("../lib/store-redis")(redisClient);

  const findDepartmentByApiKey = function findDepartmentByApiKey(apiKey, callback) {
    return storeRedis.findDepartmentByApiKey(apiKey, function(err, redisDepartment) {
      if (err) {
        return callback(err);
      }

      if (_.isObject(redisDepartment)) {
        return callback(err, redisDepartment);
      }

      return storeDatabase.findDepartmentByApiKey(apiKey, function(err, dbDepartment) {
        if (err) {
          return callback(err);
        }

        return storeRedis.storeDepartmentByApiKey(apiKey, dbDepartment, function(err) {
          return callback(err, dbDepartment);
        });
      });
    });
  };

  return {
    findDepartmentByApiKey: findDepartmentByApiKey
  };
};
