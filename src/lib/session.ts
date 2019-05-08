import * as _  from "lodash";
import * as helpers from "./helpers";
const debug = require("debug")("tabletcommand-middleware:session");

export function session(store) {
  const sessionCookieName = "seneca-login";

  const detectApiKey = function detectApiKey(headers, query, callback) {
    function extractApiKey(obj) {
      let apiKey = "";
      if (_.has(obj, "apiKey")) {
        apiKey = obj["apiKey"];
      } else if (_.has(obj, "apikey")) {
        apiKey = obj["apikey"];
      }
      return apiKey;
    }

    let apiKey = "";
    if (_.isObject(headers)) {
      apiKey = extractApiKey(headers);
    }

    if (apiKey === "" && _.isObject(query)) {
      apiKey = extractApiKey(query);
    }

    return callback(apiKey);
  };

  const detectCookieSession = function detectCookieSession(cookies, callback) {
    let session = "";

    if (_.isObject(cookies) && _.isString(cookies[sessionCookieName])) {
      session = cookies[sessionCookieName];
    }

    return callback(session);
  };

  const departmentForLogging = function departmentForLogging(department) {
    if (!_.isObject(department)) {
      return {};
    }

    const item = _.pick(_.clone(department), [
      "_id", "id", "department", "cadBidirectionalEnabled"
    ]);
    return item;
  };

  const authByApiKey = function authByApiKey(req, res, callback) {
    return detectApiKey(req.headers, req.query, function(apiKey) {
      debug(`found api key:${apiKey}.`);
      if (apiKey === "") {
        return callback(null, null);
      }

      return store.findDepartmentByApiKey(apiKey, function(err, department) {
        const hasDepartment = _.isObject(department) && helpers.isActive(department);
        if (hasDepartment) {
          req.department = department;
          req.departmentLog = departmentForLogging(department);
        }
        return callback(err, department);
      });
    });
  };

  const authBySenecaCookie = function authBySenecaCookie(req, res, callback) {
    return detectCookieSession(req.cookies, function(token) {
      if (token === "") {
        return callback(null, null, null, null);
      }

      return store.findSessionByToken(token, function(err, session, user, department) {
        const hasSession = _.isObject(session) && helpers.isActive(session);
        const hasUser = _.isObject(user) && helpers.isActive(user);
        if (hasSession && hasUser) {
          req.login = session;
          req.session = session;
          req.user = user;

          const hasDepartment = _.isObject(department) && helpers.isActive(department);
          if (hasDepartment) {
            req.department = department;
            req.departmentLog = departmentForLogging(department);
          }
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

export default session;