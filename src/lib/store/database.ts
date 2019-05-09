import { Department, DepartmentModel, SessionModel, Session, UserModel, User } from "tabletcommand-backend-models";
import { SimpleCallback } from "../../types/types";
import _ from 'lodash'
import debugModule from 'debug'

export function database (Department: DepartmentModel, Session: SessionModel, User: UserModel) {
  const debug = debugModule("tabletcommand-middleware:store:database");

  const fields = {
    department: [
      "_id",
      "id",
      "agency",
      "incidentTypes",
      "rtsChannelPrefix",
      "rtsEnabled",
      "pushEnabled",
      "heartbeatEnabled",
      "cadBidirectionalEnabled",
      "cadMonitorMinutes",
      "cadMonitorEnabled",
      "cadEmailUsername",
      "apikey",
      "active",
      "department",
      "userContributionEnabled"
    ]
  } as const;

  const findDepartmentByApiKey = function findDepartmentByApiKey(apiKey: string, callback: SimpleCallback<Department>) {
    const query = {
      apikey: apiKey
    };

    debug(`Department.findOne: ${JSON.stringify(query)}.`);
    Department.findOne(query, fields.department, function findOneCallback(err, dbItem) {
      let item = null;
      if (_.isObject(dbItem)) {
        item = JSON.parse(JSON.stringify(dbItem.toJSON()));
      }
      return callback(err, item);
    });
  };

  const findSessionByToken = function findSessionByToken(token: string, callback: SimpleCallback<Session>) {
    const query = {
      token: token
    };
    debug(`Session.findOne: ${JSON.stringify(query)}.`);
    Session.findOne(query, function findSessionByTokenCallback(err, dbItem) {
      let item = null;
      if (_.isObject(dbItem)) {
        item = JSON.parse(JSON.stringify(dbItem.toJSON()));
      }
      return callback(err, item);
    });
  };

  const findUserByUserId = function findUserByUserId(userId: string, callback: SimpleCallback<User>) {
    const query = {
      _id: userId
    };
    debug(`User.findOne: ${JSON.stringify(query)}.`);
    User.findOne(query, function findUserByUserIdCallback(err, dbItem) {
      let item = null;
      if (_.isObject(dbItem)) {
        item = JSON.parse(JSON.stringify(dbItem.toJSON()));
      }
      return callback(err, item);
    });
  };

  const findDepartmentById = function findDepartmentById(departmentId: string, callback: SimpleCallback<Department>) {
    // super admins do not have a departmentId
    if (!_.isString(departmentId) || departmentId === "") {
      return callback(null, null);
    }

    const query = {
      _id: departmentId
    };
    debug(`Department.findOne: ${JSON.stringify(query)}.`);
    Department.findOne(query, fields.department, function findDepartmentByIdCallback(err, dbItem) {
      let item = null;
      if (_.isObject(dbItem)) {
        item = JSON.parse(JSON.stringify(dbItem.toJSON()));
      }
      return callback(err, item);
    });
  };

  return {
    findDepartmentByApiKey: findDepartmentByApiKey,

    findSessionByToken: findSessionByToken,
    findUserByUserId: findUserByUserId,
    findDepartmentById: findDepartmentById
  };
};
export default database;