/* jslint node: true */
import { DepartmentModel, Department, ModelItemType, SchemaItemType, FieldsOfDocument } from 'tabletcommand-backend-models';
import express from 'express';
import _ from "lodash";
import { SimpleCallback } from '../types/types';

export function customSession(Department: DepartmentModel) {

  const departmentForLogging = function departmentForLogging(department: FieldsOfDocument<Department>) {
    if (!_.isObject(department)) {
      return {};
    }

    const item = _.pick(_.clone(department), [
      "_id", "id", "department", "cadBidirectionalEnabled",
    ]);
    return JSON.parse(JSON.stringify(item)); // Force convert the item to JSON
  };

  async function getDepartmentBySignupKey(req: express.Request, res: express.Response): Promise<Department | null> {
    // Bail if req.department was already set
    // by a different middleware
    if (_.isObject(req.department) && _.size(req.department) > 0) {
      return req.department;
    }

    let signupKey = "";
    if (_.isObject(req.query)) {
      const query = (req.query || {}) as { signupKey: string } | { signupkey: string } | {};
      if ("signupKey" in query) {
        signupKey = query.signupKey;
      } else if ("signupkey" in query) {
        signupKey = query.signupkey;
      }
    }

    if (signupKey === "") {
      return null;
    }

    const query = {
      active: true,
      signupKey,
    };

    const dbObject = await Department.findOne(query);
    if (_.isObject(dbObject) && _.size(dbObject) > 0) {
      req.department = dbObject.toObject() as Department;
      req.departmentLog = departmentForLogging(dbObject.toJSON() as Department);
    }

    return dbObject;
  }

  return async function customSessionCallback(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      await getDepartmentBySignupKey(req, res);
      next();
    } catch (err) {
      next(err);
    }
  };
}

export default customSession;
