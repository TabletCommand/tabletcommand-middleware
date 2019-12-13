"use strict";

// cSpell:words apikey tabletcommand

var _ = require("lodash");
var helpers = require("./helpers");
var debug = require("debug")("tabletcommand-middleware:session");

module.exports = function libSession(store) {
  var sessionCookieName = "seneca-login";

  function detectApiKey(headers, query, callback) {
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
  }

  function detectPersonnelApiKey(headers, query, callback) {
    function extractPersonnelApiKey(obj) {
      var personnelApiKey = "";
      if (_.has(obj, "personnelApiKey")) {
        personnelApiKey = obj["personnelApiKey"];
      } else if (_.has(obj, "personnelapikey")) {
        personnelApiKey = obj["personnelapikey"];
      }
      return personnelApiKey;
    }

    var personnelApiKey = "";
    if (_.isObject(headers)) {
      personnelApiKey = extractPersonnelApiKey(headers);
    }

    if (personnelApiKey === "" && _.isObject(query)) {
      personnelApiKey = extractPersonnelApiKey(query);
    }

    return callback(personnelApiKey);
  }

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

  function authByApiKey(req, res, callback) {
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
  }

  function authByPersonnelApiKey(req, res, callback) {
    return detectPersonnelApiKey(req.headers, req.query, function (personnelApiKey) {
      debug("found personnel api key:" + personnelApiKey + ".");
      if (personnelApiKey === "") {
        return callback(null, null);
      }

      return store.findDepartmentByPersonnelApiKey(personnelApiKey, function (err, department) {
        var hasDepartment = _.isObject(department) && helpers.isActive(department);
        if (hasDepartment) {
          req.department = department;
          req.departmentLog = departmentForLogging(department);
        }
        return callback(err, department);
      });
    });
  }

  function authBySenecaCookie(req, res, callback) {
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

          var hasDepartment = _.isObject(department) && helpers.isActive(department);
          if (hasDepartment) {
            req.department = department;
            req.departmentLog = departmentForLogging(department);
          }
        }

        return callback(err, session, user, department);
      });
    });
  }

  return {
    detectApiKey: detectApiKey,
    detectPersonnelApiKey: detectPersonnelApiKey,
    detectCookieSession: detectCookieSession,
    sessionCookieName: sessionCookieName,

    departmentForLogging: departmentForLogging,

    authByApiKey: authByApiKey,
    authByPersonnelApiKey: authByPersonnelApiKey,
    authBySenecaCookie: authBySenecaCookie
  };
};