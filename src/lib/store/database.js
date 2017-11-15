"use strict";

// cSpell:words apikey

module.exports = function(Department, Session, User) {
  const _ = require("lodash");

  const fields = {
    department: [
      "_id",
      "id",
      "agency",
      "incidentTypes",
      "rtsChannelPrefix",
      "rtsEnabled",
      "pushEnabled",
      "heartbeatEnabled",
      "cadBidirectionalEnabled",
      "cadMonitorMinutes",
      "cadMonitorEnabled",
      "cadEmailUsername",
      "apikey",
      "active",
      "department"
    ]
  };

  const findDepartmentByApiKey = function findDepartmentByApiKey(apiKey, callback) {
    const query = {
      apikey: apiKey
    };

    Department.findOne(query, fields.department, function findOneCallback(err, dbItem) {
      let item = null;
      if (_.isObject(dbItem)) {
        item = JSON.parse(JSON.stringify(dbItem.toJSON()));
      }
      return callback(err, item);
    });
  };

  const findSessionByToken = function findSessionByToken(token, callback) {
    const query = {
      token: token
    };
    Session.findOne(query, function findSessionByTokenCallback(err, dbItem) {
      let item = null;
      if (_.isObject(dbItem)) {
        item = JSON.parse(JSON.stringify(dbItem.toJSON()));
      }
      return callback(err, item);
    });
  };

  const findUserByUserId = function findUserByUserId(userId, callback) {
    const query = {
      _id: userId
    };
    User.findOne(query, function findUserByUserIdCallback(err, dbItem) {
      let item = null;
      if (_.isObject(dbItem)) {
        item = JSON.parse(JSON.stringify(dbItem.toJSON()));
      }
      return callback(err, item);
    });
  };

  const findDepartmentById = function findDepartmentById(departmentId, callback) {
    // super admins do not have a departmentId
    if (!_.isString(departmentId) || departmentId === "") {
      return callback(null, null);
    }

    const query = {
      _id: departmentId
    };
    Department.findOne(query, fields.department, function findDepartmentByIdCallback(err, dbItem) {
      let item = null;
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
