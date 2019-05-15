import * as _ from "lodash";
import * as helpers from "./helpers";
import express = require("express");
import { Session, User, Department } from "tabletcommand-backend-models";
import { StoreModule } from "./store";
import debugModule from 'debug';
import { SimpleCallback } from "../types/types";

export function session(store: StoreModule) {
  const sessionCookieName = "seneca-login";
  const debug = debugModule("tabletcommand-middleware:session");

  function detectApiKey(headers: Record<string, string> | null, query: Record<string, string> | null) {
    function extractApiKey(obj: Record<string, string>) {
      let apiKey = "";
      if (_.has(obj, "apiKey")) {
        apiKey = obj.apiKey;
      } else if (_.has(obj, "apikey")) {
        apiKey = obj.apikey;
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

    return apiKey;
  }

  function detectCookieSession(cookies: Record<string, string>) {
    let session = "";

    if (_.isObject(cookies) && _.isString(cookies[sessionCookieName])) {
      session = cookies[sessionCookieName];
    }

    return session;
  }

  const departmentForLogging = function departmentForLogging(department: Department) {
    if (!_.isObject(department)) {
      return {};
    }

    const item = _.pick(_.clone(department), [
      "_id", "id", "department", "cadBidirectionalEnabled",
    ]);
    return item;
  };

  function authByApiKey(req: express.Request, res: express.Response, callback: SimpleCallback<Department>) {
    const apiKey = detectApiKey(req.headers as Record<string, string>, req.query);
    debug(`found api key:${apiKey}.`);
    if (apiKey === "") {
      return callback(null, null);
    }

    return store.findDepartmentByApiKey(apiKey, function(err, department) {
      if (_.isObject(department) && helpers.isActive(department)) {
        req.department = department;
        req.departmentLog = departmentForLogging(department);
      }
      return callback(err, department);
    });
  }

  const authBySenecaCookie = function authBySenecaCookie(req: express.Request, res: express.Response, callback: (err: Error, session: Session, user: User, department: Department) => void) {
    const token = detectCookieSession(req.cookies);
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
  };

  return {
    detectApiKey,
    detectCookieSession,
    sessionCookieName,

    departmentForLogging,

    authByApiKey,
    authBySenecaCookie,
  };
}

export default session;
