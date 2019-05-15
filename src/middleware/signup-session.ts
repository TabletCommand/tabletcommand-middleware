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

  const getDepartmentBySignupKey = function getDepartmentBySignupKey(req: express.Request, res: express.Response, callback: SimpleCallback<Department>) {
    // Bail if req.department was already set
    // by a different middleware
    if (_.isObject(req.department) && _.size(req.department) > 0) {
      return callback(null, req.department);
    }

    let signupKey = "";
    if (_.isObject(req.query)) {
      const query: any = req.query;
      if (_.has(query, "signupKey")) {
        signupKey = query.signupKey;
      } else if (_.has(req.query, "signupkey")) {
        signupKey = query.signupkey;
      }
    }

    if (signupKey === "") {
      return callback(null, null);
    }

    const query = {
      active: true,
      signupKey,
    };

    return Department.findOne(query, function findDepartmentCallback(err: Error, dbObject: Department) {
      if (_.isObject(dbObject) && _.size(dbObject) > 0) {
        req.department = dbObject.toObject();
        req.departmentLog = departmentForLogging(dbObject.toJSON());
      }

      return callback(err, dbObject);
    });
  };

  return function customSessionCallback(req: express.Request, res: express.Response, next: express.NextFunction) {
    return getDepartmentBySignupKey(req, res, function getDepartmentBySignupKeyCallback(err, department) {
      return next(err);
    });
  };
}

export default customSession;
