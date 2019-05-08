/* jslint node: true */
import { DepartmentModel, Department, ModelItemType, SchemaItemType, FieldsOfDocument } from 'tabletcommand-backend-models';
import express from 'express';
import _  from "lodash";
import { SimpleCallback } from '../types';

export function customSession(Department: DepartmentModel) {
  

  var departmentForLogging = function departmentForLogging(department: FieldsOfDocument<Department>) {
    if (!_.isObject(department)) {
      return {};
    }

    var item = _.pick(_.clone(department), [
      "_id", "id", "department", "cadBidirectionalEnabled"
    ]);
    return JSON.parse(JSON.stringify(item)); // Force convert the item to JSON
  };

  var getDepartmentBySignupKey = function getDepartmentBySignupKey(req: express.Request, res: express.Response, callback: SimpleCallback<Department>) {
    // Bail if req.department was already set
    // by a different middleware
    if (_.isObject(req.department) && _.size(req.department) > 0) {
      return callback(null, req.department);
    }

    var signupKey = "";
    if (_.isObject(req.query)) {
      if (_.has(req.query, "signupKey")) {
        signupKey = req.query.signupKey;
      } else if (_.has(req.query, "signupkey")) {
        signupKey = req.query.signupkey;
      }
    }

    if (signupKey === "") {
      return callback(null, null);
    }

    var query = {
      active: true,
      signupKey: signupKey
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
};

export default customSession;
