"use strict";

module.exports = function customSession(Department, Session, User) {
  var _ = require("lodash");

  var departmentForLogging = function departmentForLogging(department) {
    if (!_.isObject(department)) {
      return {};
    }

    var item = _.pick(_.clone(department), [
      "_id", "id", "department", "cadBidirectionalEnabled"
    ]);
    return JSON.parse(JSON.stringify(item)); // Force convert the item to JSON
  };

  var getSession = function getSession(req, res, callback) {
    if (!_.isObject(req.cookies) || !_.isString(req.cookies["seneca-login"])) {
      return callback(null, null);
    }

    var query = {};
    query.token = req.cookies["seneca-login"];
    query.active = true;

    return Session.findOne(query, function findSessionCallback(err, dbObject) {
      if (_.isObject(dbObject) && _.size(dbObject) > 0) {
        req.login = dbObject.toObject();
        req.session = dbObject.toObject();
      }

      return callback(err, dbObject);
    });
  };

  var getUser = function getUser(req, res, callback) {
    if (!_.isObject(req.login)) {
      return callback(null, null);
    }

    var session = req.login;
    if (!_.isString(session.user)) {
      return callback(null, null);
    }

    var query = {};
    query._id = session.user;
    query.active = true;

    return User.findOne(query, function findUserCallback(err, dbObject) {
      if (_.isObject(dbObject) && _.size(dbObject) > 0) {
        req.user = dbObject.toObject();
      }

      return callback(err, dbObject);
    });
  };

  var getDepartmentByUser = function getDepartmentByUser(req, res, callback) {
    if (!_.isObject(req.user)) {
      return callback(null, null);
    }

    var user = req.user;
    var departmentId = user.departmentId;
    var noUserDepartmentId = (!_.isString(departmentId) || departmentId === "");
    var isSuperUser = (user.superuser === true ||
      user.superuser === "true" ||
      user.superuser === 1 ||
      user.superuser === "1"
    );

    var noQueryDepartmentId = true;
    if (noUserDepartmentId && _.isString(req.query.departmentId)) {
      noQueryDepartmentId = false;
      departmentId = req.query.departmentId;
    }

    if (isSuperUser && noUserDepartmentId && noQueryDepartmentId) {
      return callback(null, null);
    }

    return Department.findById(departmentId, function findDepartmentCallback(err, dbObject) {
      if (_.isObject(dbObject) && _.size(dbObject) > 0) {
        req.department = dbObject.toObject();
        req.departmentLog = departmentForLogging(dbObject.toJSON());
      }

      return callback(err, dbObject);
    });
  };

  var getDepartmentByApiKey = function getDepartmentByApiKey(req, res, callback) {
    var apiKey = "";
    if (_.isObject(req.headers) && _.has(req.headers, "apikey")) {
      apiKey = req.headers.apiKey;
    } else if (_.isObject(req.headers) && _.has(req.headers, "apikey")) {
      apiKey = req.headers.apikey;
    } else if (_.isObject(req.query) && _.has(req.query, "apikey")) {
      apiKey = req.query.apiKey;
    } else if (_.isObject(req.query) && _.has(req.query, "apikey")) {
      apiKey = req.query.apikey;
    }

    if (apiKey === "") {
      return callback(null, null);
    }

    var query = {
      apikey: apiKey,
      active: true
    };

    return Department.findOne(query, function findDepartmentByApiKeyCallback(err, dbObject) {
      if (_.isObject(dbObject) && _.size(dbObject) > 0) {
        req.department = dbObject.toObject();
        req.departmentLog = departmentForLogging(dbObject.toJSON());
      }

      return callback(err, dbObject);
    });
  };

  return function(req, res, next) {
    return getDepartmentByApiKey(req, res, function getDepartmentByApiKeyCallback(err, department) {
      if (!_.isNull(department) && _.size(department) > 0) {
        return next(err);
      }

      // Trying to resolve using a session cookie
      return getSession(req, res, function getSessionCallback(err, session) {
        if (err) {
          return next(err);
        }
        return getUser(req, res, function getUserCallback(err, user) {
          if (err) {
            return next(err);
          }
          return getDepartmentByUser(req, res, function getDepartmentByUserCallback(err, department) {
            return next(err);
          });
        });
      });
    });
  };
};
