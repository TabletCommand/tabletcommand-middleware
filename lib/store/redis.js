"use strict";

// cSpell:words apikey

module.exports = function(redisClient) {
  // const _ = require("lodash");

  const findDepartmentByApiKey = function findDepartmentByApiKey(apiKey, callback) {
    return callback(null, null);
  };

  const storeDepartmentByApiKey = function storeDepartmentByApiKey(apiKey, item, callback) {
    return callback(null, item);
  };

  return {
    findDepartmentByApiKey: findDepartmentByApiKey,
    storeDepartmentByApiKey: storeDepartmentByApiKey
  };
};
