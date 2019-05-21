import { DepartmentModel, SessionModel, UserModel, Department, Session, User } from "tabletcommand-backend-models";
import { SimpleCallback } from "../../types/types";
import { RedisClient } from "redis";
import _ from "lodash";
import databaseModule from "./database";
import redisModule from "./redis";

export function store(Department: DepartmentModel, Session: SessionModel, User: UserModel, redisClient: RedisClient) {
  const redis = redisModule(redisClient);
  const database = databaseModule(Department, Session, User);
  async function findDepartmentByApiKey(apiKey: string): Promise<{ department: Department | null, cached: boolean }> {
    let cached = false;
    const redisDepartment = await redis.findDepartmentByApiKey(apiKey);

    if (_.isObject(redisDepartment)) {
      cached = true;
      return { department: redisDepartment, cached };
    }

    const dbDepartment = await database.findDepartmentByApiKey(apiKey);
    await redis.storeDepartmentByApiKey(apiKey, dbDepartment);
    return { department: dbDepartment, cached };
  }

  function expireDepartmentByApiKey(apiKey: string) {
    return redis.expireDepartmentByApiKey(apiKey);
  }

  async function findSessionByToken(token: string): Promise<{ session: Session | null, user: User | null, department: Department | null, cached: boolean }> {
    let cached = false;
    const { session: rSession, user: rUser, department: rDepartment } = await redis.findSessionByToken(token);

    let session: Session | null = null;
    let user: User | null = null;
    let department: Department | null = null;
    if (_.isObject(rSession) && _.isObject(rUser)) {
      session = rSession;
      user = rUser;
      cached = true;
    }

    if (_.isObject(rDepartment)) {
      department = rDepartment;
    }

    if (cached) {
      return { session, user, department, cached };
    }

    const dSession = await database.findSessionByToken(token);

    // Invalid session, store an empty record
    // object.user is the userId...
    if (!_.isObject(dSession) && _.isString(dSession!.user)) {
      await redis.storeSessionByToken(token, null, null, null);
      return { session, user, department, cached };
    }

    session = dSession;

    const dUser = await database.findUserByUserId(session!.user);

    if (!_.isObject(dUser)) {
      await redis.storeSessionByToken(token, session, null, null);
      return { session, user, department, cached };
    }

    user = dUser;

    const dDepartment = await database.findDepartmentById(user.departmentId);

    if (_.isObject(dDepartment)) {
      department = dDepartment as Department;
    }

    await redis.storeSessionByToken(token, session, user, department);
    return { session, user, department, cached };
  }

  function expireSessionByToken(token: string) {
    return redis.expireSessionByToken(token);
  }

  return {
    findDepartmentByApiKey,
    expireDepartmentByApiKey,

    findSessionByToken,
    expireSessionByToken,
  };
}
export default store;
export type StoreModule = ReturnType<typeof store>;
