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

  async function authByApiKey(req: express.Request, res: express.Response): Promise<Department | null> {
    const apiKey = detectApiKey(req.headers as Record<string, string>, req.query);
    debug(`found api key:${apiKey}.`);
    if (apiKey === "") {
      return null;
    }

    const { department } = await store.findDepartmentByApiKey(apiKey);
    if (_.isObject(department) && helpers.isActive(department)) {
      req.department = department;
      req.departmentLog = departmentForLogging(department);
    }
    return department;
  }

  async function authBySenecaCookie(req: express.Request, res: express.Response): Promise<{ session: Session | null, user: User | null, department: Department | null }> {
    const token = detectCookieSession(req.cookies);
    if (token === "") {
      return { session: null, user: null, department: null };
    }

    const { session, user, department } = await store.findSessionByToken(token);
    if (_.isObject(session) && helpers.isActive(session) && _.isObject(user) && helpers.isActive(user)) {
      req.login = session;
      req.session = session;
      req.user = user;

      if (_.isObject(department) && helpers.isActive(department)) {
        req.department = department;
        req.departmentLog = departmentForLogging(department);
      }
    }

    return { session, user, department };
  }

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
