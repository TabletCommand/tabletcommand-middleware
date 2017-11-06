"use strict";

module.exports = function(Department, Session, User, redisClient) {
  const _ = require("lodash");
  const database = require("./database")(Department, Session, User);
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

  const findSessionByToken = function findSessionByToken(token, callback) {
    let cached = false;
    return redis.findSessionByToken(token, function(err, rSession, rUser, rDepartment) {
      if (err) {
        return callback(err);
      }

      let session = null;
      let user = null;
      let department = null;
      if (_.isObject(rSession) && _.isObject(rUser)) {
        session = rSession;
        user = rUser;
        cached = true;
      }

      if (_.isObject(rDepartment)) {
        department = rDepartment;
      }

      // console.log("redis.findSessionByToken err", err, rSession, rUser, rDepartment, cached);

      if (cached) {
        return callback(err, session, user, department, cached);
      }

      return database.findSessionByToken(token, function(err, dSession) {
        if (err) {
          return callback(err);
        }

        // Invalid session, store an empty record
        // object.user is the userId...
        const isValid = _.isObject(dSession) && _.isString(dSession.user);
        if (!isValid) {
          return redis.storeSessionByToken(token, null, null, null, function(err, result) {
            return callback(err, session, user, department, cached);
          });
        }

        session = dSession;

        return database.findUserByUserId(session.user, function(err, dUser) {
          if (err) {
            return callback(err);
          }

          if (!_.isObject(dUser)) {
            return redis.storeSessionByToken(token, session, null, null, function(err, result) {
              return callback(err, session, user, department, cached);
            });
          }

          user = dUser;

          return database.findDepartmentById(user.departmentId, function(err, dDepartment) {
            if (err) {
              return callback(err);
            }

            if (_.isObject(dDepartment)) {
              department = dDepartment;
            }

            return redis.storeSessionByToken(token, session, user, department, function(err, result) {
              return callback(err, session, user, department, cached);
            });
          });
        });
      });
    });
  };

  const expireSessionByToken = function expireSessionByToken(token, callback) {
    return redis.expireSessionByToken(token, callback);
  };

  return {
    findDepartmentByApiKey: findDepartmentByApiKey,
    expireDepartmentByApiKey: expireDepartmentByApiKey,

    findSessionByToken: findSessionByToken,
    expireSessionByToken: expireSessionByToken
  };
};
