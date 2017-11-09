"use strict";

// cSpell:words apikey

module.exports = function (Department, Session, User) {
  var _ = require("lodash");

  var fields = {
    department: ["_id", "id", "agency", "incidentTypes", "rtsEnabled", "pushEnabled", "heartbeatEnabled", "cadBidirectionalEnabled", "cadMonitorMinutes", "cadMonitorEnabled", "cadEmailUsername", "apikey", "active", "department"]
  };

  var findDepartmentByApiKey = function findDepartmentByApiKey(apiKey, callback) {
    var query = {
      apikey: apiKey
    };

    Department.findOne(query, fields.department, function findOneCallback(err, dbItem) {
      var item = null;
      if (_.isObject(dbItem)) {
        item = JSON.parse(JSON.stringify(dbItem.toJSON()));
      }
      return callback(err, item);
    });
  };

  var findSessionByToken = function findSessionByToken(token, callback) {
    var query = {
      token: token
    };
    Session.findOne(query, function findSessionByTokenCallback(err, dbItem) {
      var item = null;
      if (_.isObject(dbItem)) {
        item = JSON.parse(JSON.stringify(dbItem.toJSON()));
      }
      return callback(err, item);
    });
  };

  var findUserByUserId = function findUserByUserId(userId, callback) {
    var query = {
      _id: userId
    };
    User.findOne(query, function findUserByUserIdCallback(err, dbItem) {
      var item = null;
      if (_.isObject(dbItem)) {
        item = JSON.parse(JSON.stringify(dbItem.toJSON()));
      }
      return callback(err, item);
    });
  };

  var findDepartmentById = function findDepartmentById(departmentId, callback) {
    // super admins do not have a departmentId
    if (!_.isString(departmentId) || departmentId === "") {
      return callback(null, null);
    }

    var query = {
      _id: departmentId
    };
    Department.findOne(query, fields.department, function findDepartmentByIdCallback(err, dbItem) {
      var item = null;
      if (_.isObject(dbItem)) {
        item = JSON.parse(JSON.stringify(dbItem.toJSON()));
      }
      return callback(err, item);
    });
  };

  return {
    findDepartmentByApiKey: findDepartmentByApiKey,

    findSessionByToken: findSessionByToken,
    findUserByUserId: findUserByUserId,
    findDepartmentById: findDepartmentById
  };
};