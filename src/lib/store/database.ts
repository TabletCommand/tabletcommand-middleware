import { Department, DepartmentModel, SessionModel, Session, UserModel, User } from "tabletcommand-backend-models";
import { SimpleCallback } from "../../types/types";
import _ from 'lodash';
import debugModule from 'debug';

export function database(Department: DepartmentModel, Session: SessionModel, User: UserModel) {
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
      "userContributionEnabled",
    ],
  } as const;

  async function findDepartmentByApiKey(apiKey: string): Promise<Department> {
    const query = {
      apikey: apiKey,
    };

    debug(`Department.findOne: ${JSON.stringify(query)}.`);
    const dbItem = await Department.findOne(query, fields.department);
    let item: Department | null = null;
    if (_.isObject(dbItem)) {
      item = JSON.parse(JSON.stringify(dbItem.toJSON())) as Department;
    }
    return item;
  }

  async function findSessionByToken(token: string): Promise<Session> {
    const query = {
      token,
    };
    debug(`Session.findOne: ${JSON.stringify(query)}.`);
    const dbItem = await Session.findOne(query);
    let item: Session | null = null;
    if (_.isObject(dbItem)) {
      item = JSON.parse(JSON.stringify(dbItem.toJSON()));
    }
    return item;
  }

  async function findUserByUserId(userId: string): Promise<User> {
    const query = {
      _id: userId,
    };
    debug(`User.findOne: ${JSON.stringify(query)}.`);
    const dbItem = await User.findOne(query);
    let item = null;
    if (_.isObject(dbItem)) {
      item = JSON.parse(JSON.stringify(dbItem.toJSON()));
    }
    return item;
  }

  async function findDepartmentById(departmentId: string): Promise<Department> {
    // super admins do not have a departmentId
    if (!_.isString(departmentId) || departmentId === "") {
      return null;
    }

    const query = {
      _id: departmentId,
    };
    debug(`Department.findOne: ${JSON.stringify(query)}.`);
    const dbItem = await Department.findOne(query, fields.department);
    let item: Department | null = null;
    if (_.isObject(dbItem)) {
      item = JSON.parse(JSON.stringify(dbItem.toJSON())) as Department;
    }
    return item;
  }

  return {
    findDepartmentByApiKey,

    findSessionByToken,
    findUserByUserId,
    findDepartmentById,
  };
}
export default database;
