import _ from "lodash";
import { DepartmentModel, SessionModel, UserModel, Department, Session, User } from "tabletcommand-backend-models";
import express = require("express");
import { SimpleCallback } from "../types";
import { isSuper } from "../lib/helpers";
export function customSession(Department: DepartmentModel, Session: SessionModel, User: UserModel) {
  

  var departmentForLogging = function departmentForLogging(department: Department) {
    if (!_.isObject(department)) {
      return {};
    }

    var item = _.pick(_.clone(department), [
      "_id", "id", "department", "cadBidirectionalEnabled"
    ]);
    return JSON.parse(JSON.stringify(item)); // Force convert the item to JSON
  };

  var getSession = function getSession(req: express.Request, res: express.Response, callback: SimpleCallback<Session>) {
    const cookies: unknown = req.cookies;
    function hasLogin(c: unknown) : c is { "seneca-login": string } {
      return _.isObject(c) && _.isString((c as { "seneca-login": string })["seneca-login"]);
    }
    if (!hasLogin(cookies)) {
      return callback(null, null);
    }

    var query = {
      token: cookies["seneca-login"],
      active: true
    };

    return Session.findOne(query, function findSessionCallback(err, dbObject) {
      if (_.isObject(dbObject) && _.size(dbObject) > 0) {
        req.login = dbObject.toObject();
        req.session = dbObject.toObject();
      }

      return callback(err, dbObject);
    });
  };

  var getUser = function getUser(req: express.Request, res: express.Response, callback: SimpleCallback<User>) {
    if (!_.isObject(req.login)) {
      return callback(null, null);
    }

    var session = req.login;
    if (!_.isString(session.user)) {
      return callback(null, null);
    }

    var query = {
      _id: session.user,
      active: true
    };

    return User.findOne(query, function findUserCallback(err, dbObject) {
      if (_.isObject(dbObject) && _.size(dbObject) > 0) {
        req.user = dbObject.toObject();
      }

      return callback(err, dbObject);
    });
  };

  var getDepartmentByUser = function getDepartmentByUser(req: express.Request, res: express.Response, callback: SimpleCallback<Department>) {
    if (!_.isObject(req.user)) {
      return callback(null, null);
    }

    var user = req.user;
    var departmentId = user.departmentId;
    var noUserDepartmentId = (!_.isString(departmentId) || departmentId === "");
    var isSuperUser = isSuper(user);

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

  var getDepartmentByApiKey = function getDepartmentByApiKey(req: express.Request, res: express.Response, callback: SimpleCallback<Department>) {
    var apiKey = "";
    if (_.isObject(req.headers) && _.has(req.headers, "apikey")) {
      apiKey = req.headers.apiKey as string;
    } else if (_.isObject(req.headers) && _.has(req.headers, "apikey")) {
      apiKey = req.headers.apikey as string;
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

  return function(req: express.Request, res: express.Response, next: express.NextFunction) {
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
export default customSession;
