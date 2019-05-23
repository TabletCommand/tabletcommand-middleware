import _ from "lodash";
import { DepartmentModel, SessionModel, UserModel, Department, Session, User } from "tabletcommand-backend-models";
import express = require("express");
import { SimpleCallback } from "../types/types";
import { isSuper } from "../lib/helpers";
export function customSession(Department: DepartmentModel, Session: SessionModel, User: UserModel) {

  const departmentForLogging = function departmentForLogging(department: Department) {
    if (!_.isObject(department)) {
      return {};
    }

    const item = _.pick(_.clone(department), [
      "_id", "id", "department", "cadBidirectionalEnabled",
    ]);
    return JSON.parse(JSON.stringify(item)); // Force convert the item to JSON
  };

  async function getSession(req: express.Request, res: express.Response): Promise<Session | null> {
    const cookies: unknown = req.cookies;
    function hasLogin(c: unknown): c is { "seneca-login": string } {
      return _.isObject(c) && _.isString((c as { "seneca-login": string })["seneca-login"]);
    }
    if (!hasLogin(cookies)) {
      return null;
    }

    const query = {
      token: cookies["seneca-login"],
      active: true,
    };

    const dbObject = await Session.findOne(query);
    if (_.isObject(dbObject) && _.size(dbObject) > 0) {
      req.login = dbObject.toObject() as Session;
      req.session = dbObject.toObject() as Session;
    }
    return dbObject;
  }

  async function getUser(req: express.Request, res: express.Response): Promise<User | null> {
    if (!_.isObject(req.login)) {
      return null;
    }

    const session = req.login;
    if (!_.isString(session.user)) {
      return null;
    }

    const query = {
      _id: session.user,
      active: true,
    };

    const dbObject = await User.findOne(query);
    if (_.isObject(dbObject) && _.size(dbObject) > 0) {
      req.user = dbObject.toObject() as User;
    }

    return dbObject;
  }

  async function getDepartmentByUser(req: express.Request, res: express.Response): Promise<Department | null> {
    if (!_.isObject(req.user)) {
      return null;
    }

    const user = req.user;
    let departmentId = user.departmentId;
    const noUserDepartmentId = (!_.isString(departmentId) || departmentId === "");
    const isSuperUser = isSuper(user);

    let noQueryDepartmentId = true;
    const query = req.query as { departmentId?: string };
    if (noUserDepartmentId && _.isString(query.departmentId)) {
      noQueryDepartmentId = false;
      departmentId = query.departmentId;
    }

    if (isSuperUser && noUserDepartmentId && noQueryDepartmentId) {
      return null;
    }

    const dbObject = await Department.findById(departmentId);
    if (_.isObject(dbObject) && _.size(dbObject) > 0) {
      req.department = dbObject.toObject() as Department;
      req.departmentLog = departmentForLogging(dbObject.toJSON() as Department);
    }

    return dbObject;
  }

  async function getDepartmentByApiKey(req: express.Request, res: express.Response): Promise<Department | null> {
    let apiKey = "";
    if (_.isObject(req.headers) && _.has(req.headers, "apikey")) {
      apiKey = req.headers.apiKey as string;
    } else if (_.isObject(req.headers) && _.has(req.headers, "apikey")) {
      apiKey = req.headers.apikey as string;
    } else if (_.isObject(req.query) && _.has(req.query, "apikey")) {
      apiKey = (req.query as { apiKey: string }).apiKey;
    } else if (_.isObject(req.query) && _.has(req.query, "apikey")) {
      apiKey = (req.query as { apikey: string }).apikey;
    }

    if (apiKey === "") {
      return null;
    }

    const query = {
      apikey: apiKey,
      active: true,
    };

    const dbObject = await Department.findOne(query);
    if (_.isObject(dbObject) && _.size(dbObject) > 0) {
      req.department = dbObject.toObject() as Department;
      req.departmentLog = departmentForLogging(dbObject.toJSON() as Department);
    }
    return dbObject;
  }

  return async function(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const department = await getDepartmentByApiKey(req, res);
      if (!_.isNull(department) && _.size(department) > 0) {
        return next(null);
      }

      // Trying to resolve using a session cookie
      await getSession(req, res);
      await getUser(req, res);
      await getDepartmentByUser(req, res);
      return next(null);
    } catch (e) {
      next(e);
    }
  };
}
export default customSession;
