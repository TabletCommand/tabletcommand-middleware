"use strict";

// cSpell:words apikey

module.exports = function(Department, Session, User) {
  const _ = require("lodash");

  const findDepartmentByApiKey = function findDepartmentByApiKey(apiKey, callback) {
    const query = {
      apikey: apiKey
    };

    Department.findOne(query, function findOneCallback(err, dbItem) {
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
      console.log("findUserByUserId err", err, dbItem, "query:", query);
      return callback(err, item);
    });
  };

  return {
    findDepartmentByApiKey: findDepartmentByApiKey,

    findSessionByToken: findSessionByToken,
    findUserByUserId: findUserByUserId
  };
};
