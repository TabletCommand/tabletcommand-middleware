"use strict";

// cSpell:words apikey tabletcommand

var _ = require("lodash");
var helpers = require("./helpers");
var debug = require("debug")("tabletcommand-middleware:session");

module.exports = function (store) {
  var sessionCookieName = "seneca-login";

  var detectApiKey = function detectApiKey(headers, query, callback) {
    function extractApiKey(obj) {
      var apiKey = "";
      if (_.has(obj, "apiKey")) {
        apiKey = obj["apiKey"];
      } else if (_.has(obj, "apikey")) {
        apiKey = obj["apikey"];
      }
      return apiKey;
    }

    var apiKey = "";
    if (_.isObject(headers)) {
      apiKey = extractApiKey(headers);
    }

    if (apiKey === "" && _.isObject(query)) {
      apiKey = extractApiKey(query);
    }

    return callback(apiKey);
  };

  var detectCookieSession = function detectCookieSession(cookies, callback) {
    var session = "";

    if (_.isObject(cookies) && _.isString(cookies[sessionCookieName])) {
      session = cookies[sessionCookieName];
    }

    return callback(session);
  };

  var departmentForLogging = function departmentForLogging(department) {
    if (!_.isObject(department)) {
      return {};
    }

    var item = _.pick(_.clone(department), ["_id", "id", "department", "cadBidirectionalEnabled"]);
    return item;
  };

  var authByApiKey = function authByApiKey(req, res, callback) {
    return detectApiKey(req.headers, req.query, function (apiKey) {
      debug("found api key:" + apiKey + ".");
      if (apiKey === "") {
        return callback(null, null);
      }

      return store.findDepartmentByApiKey(apiKey, function (err, department) {
        var hasDepartment = _.isObject(department) && helpers.isActive(department);
        if (hasDepartment) {
          req.department = department;
          req.departmentLog = departmentForLogging(department);
        }
        return callback(err, department);
      });
    });
  };

  var authBySenecaCookie = function authBySenecaCookie(req, res, callback) {
    return detectCookieSession(req.cookies, function (token) {
      if (token === "") {
        return callback(null, null, null, null);
      }

      return store.findSessionByToken(token, function (err, session, user, department) {
        var hasSession = _.isObject(session) && helpers.isActive(session);
        var hasUser = _.isObject(user) && helpers.isActive(user);
        if (hasSession && hasUser) {
          req.login = session;
          req.session = session;
          req.user = user;
        }

        var hasDepartment = _.isObject(department) && helpers.isActive(department);
        if (hasDepartment) {
          req.department = department;
          req.departmentLog = departmentForLogging(department);
        }

        return callback(err, session, user, department);
      });
    });
  };

  return {
    detectApiKey: detectApiKey,
    detectCookieSession: detectCookieSession,
    sessionCookieName: sessionCookieName,

    departmentForLogging: departmentForLogging,

    authByApiKey: authByApiKey,
    authBySenecaCookie: authBySenecaCookie
  };
};