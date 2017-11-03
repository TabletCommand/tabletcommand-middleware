"use strict";

// cSpell:words apikey

const _ = require("lodash");

module.exports = function(store) {
  const detectApiKey = function detectApiKey(headers, query, callback) {
    function extractApiKey(obj) {
      let apiKey = "";
      if (_.has(obj, "apiKey")) {
        apiKey = obj["apiKey"];
      } else if (_.has(obj, "apikey")) {
        apiKey = obj["apikey"];
      }
      return apiKey;
    }

    let apiKey = "";
    if (_.isObject(headers)) {
      apiKey = extractApiKey(headers);
    } else if (_.isObject(query)) {
      apiKey = extractApiKey(query);
    }

    return callback(apiKey);
  };

  const departmentForLogging = function departmentForLogging(department) {
    if (!_.isObject(department)) {
      return {};
    }

    const item = _.pick(_.clone(department), [
      "_id", "id", "department", "cadBidirectionalEnabled"
    ]);
    return item; // Force convert the item to JSON
  };

  const authByApiKey = function authByApiKey(req, res, callback) {
    return detectApiKey(req.headers, req.query, function(apiKey) {
      if (apiKey === "") {
        return callback(null, null);
      }

      return store.findDepartmentByApiKey(apiKey, function(err, department) {
        if (_.isObject(department)) {
          req.department = department;
          req.departmentLog = departmentForLogging(department);
        }
        return callback(err, department);
      });
    });
  };

  return {
    departmentForLogging: departmentForLogging,
    detectApiKey: detectApiKey,
    authByApiKey: authByApiKey
  };
};
