module.exports = function(Department, Session, User) {
  "use strict";
  // cSpell:words apikey tabletcommand

  const _ = require("lodash");
  const debug = require("debug")("tabletcommand-middleware:store:database");

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
      "department",
      "userContributionEnabled"
    ]
  };

  const findDepartmentByApiKey = function findDepartmentByApiKey(apiKey, callback) {
    const query = {
      apikey: apiKey
    };

    debug(`Department.findOne: ${JSON.stringify(query)}.`);
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
    debug(`Session.findOne: ${JSON.stringify(query)}.`);
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
    debug(`User.findOne: ${JSON.stringify(query)}.`);
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
    debug(`Department.findOne: ${JSON.stringify(query)}.`);
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
