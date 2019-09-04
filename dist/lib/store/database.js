"use strict";

module.exports = function (Department, Session, User) {
  "use strict";
  // cSpell:words apikey tabletcommand

  var _ = require("lodash");
  var debug = require("debug")("tabletcommand-middleware:store:database");

  var fields = {
    department: ["_id", "id", "agency", "agencies", "incidentTypes", "rtsChannelPrefix", "rtsEnabled", "pushEnabled", "heartbeatEnabled", "cadBidirectionalEnabled", "cadMonitorMinutes", "cadMonitorEnabled", "cadEmailUsername", "apikey", "active", "department", "userContributionEnabled"]
  };

  var findDepartmentByApiKey = function findDepartmentByApiKey(apiKey, callback) {
    var query = {
      apikey: apiKey
    };

    debug("Department.findOne: " + JSON.stringify(query) + ".");
    Department.findOne(query, fields.department, function findOneCallback(err, dbItem) {
      var item = null;
      if (_.isObject(dbItem)) {
        item = JSON.parse(JSON.stringify(dbItem.toJSON()));
      }
      return callback(err, item);
    });
  };

  var findDepartmentByPersonnelApiKey = function findDepartmentByPersonnelApiKey(personnelApiKey, callback) {
    var query = {
      "agencies.personnelApiKey": personnelApiKey
    };

    debug("Department.findOne: " + JSON.stringify(query) + ".");
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
    debug("Session.findOne: " + JSON.stringify(query) + ".");
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
    debug("User.findOne: " + JSON.stringify(query) + ".");
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
    debug("Department.findOne: " + JSON.stringify(query) + ".");
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
    findDepartmentByPersonnelApiKey: findDepartmentByPersonnelApiKey,

    findSessionByToken: findSessionByToken,
    findUserByUserId: findUserByUserId,
    findDepartmentById: findDepartmentById
  };
};