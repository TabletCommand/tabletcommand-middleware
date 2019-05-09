import { DepartmentModel, SessionModel, UserModel, Department, Session, User } from "tabletcommand-backend-models";
import { SimpleCallback } from "../../types/types";
import { RedisClient } from "redis";
import _ from "lodash";
import databaseModule from "./database";
import redisModule from "./redis";

export function store(Department: DepartmentModel, Session: SessionModel, User: UserModel, redisClient: RedisClient) {
  const redis = redisModule(redisClient);
  const database = databaseModule(Department, Session, User);
  const findDepartmentByApiKey = function findDepartmentByApiKey(apiKey: string, callback: (err: Error, department?: Department, cached?: boolean) => void) {
    let cached = false;
    return redis.findDepartmentByApiKey(apiKey, function(err, redisDepartment) {
      if (err) {
        return callback(err);
      }

      if (_.isObject(redisDepartment)) {
        cached = true;
        return callback(err, redisDepartment, cached);
      }

      return database.findDepartmentByApiKey(apiKey, function(err, dbDepartment) {
        if (err) {
          return callback(err);
        }

        return redis.storeDepartmentByApiKey(apiKey, dbDepartment, function(err) {
          return callback(err, dbDepartment, cached);
        });
      });
    });
  };

  function expireDepartmentByApiKey(apiKey: string, callback: SimpleCallback<number>) {
    return redis.expireDepartmentByApiKey(apiKey, callback);
  };

  const findSessionByToken = function findSessionByToken(token: string, callback: (err: Error, session?: Session, user?: User, department?: Department, cached?: boolean) => void) {
    let cached = false;
    return redis.findSessionByToken(token, function(err, rSession, rUser, rDepartment) {
      if (err) {
        return callback(err);
      }

      let session: Session = null;
      let user: User = null;
      let department: Department = null;
      if (_.isObject(rSession) && _.isObject(rUser)) {
        session = rSession;
        user = rUser;
        cached = true;
      }

      if (_.isObject(rDepartment)) {
        department = rDepartment;
      }

      // console.log("redis.findSessionByToken err", err, rSession, rUser, rDepartment, cached);

      if (cached) {
        return callback(err, session, user, department, cached);
      }

      return database.findSessionByToken(token, function(err, dSession: Session) {
        if (err) {
          return callback(err);
        }

        // Invalid session, store an empty record
        // object.user is the userId...
        const isValid = _.isObject(dSession) && _.isString(dSession.user);
        if (!isValid) {
          return redis.storeSessionByToken(token, null, null, null, function(err, result) {
            return callback(err, session, user, department, cached);
          });
        }

        session = dSession;

        return database.findUserByUserId(session.user, function(err, dUser) {
          if (err) {
            return callback(err);
          }

          if (!_.isObject(dUser)) {
            return redis.storeSessionByToken(token, session, null, null, function(err, result) {
              return callback(err, session, user, department, cached);
            });
          }

          user = dUser as User;

          return database.findDepartmentById(user.departmentId, function(err, dDepartment) {
            if (err) {
              return callback(err);
            }

            if (_.isObject(dDepartment)) {
              department = dDepartment as Department;
            }

            return redis.storeSessionByToken(token, session, user, department, function(err, result) {
              return callback(err, session, user, department, cached);
            });
          });
        });
      });
    });
  };

  const expireSessionByToken = function expireSessionByToken(token: string, callback: SimpleCallback<number>) {
    return redis.expireSessionByToken(token, callback);
  };

  return {
    findDepartmentByApiKey: findDepartmentByApiKey,
    expireDepartmentByApiKey: expireDepartmentByApiKey,

    findSessionByToken: findSessionByToken,
    expireSessionByToken: expireSessionByToken
  };
};
export default store;
export type StoreModule = ReturnType<typeof store>