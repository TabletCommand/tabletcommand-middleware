import { RedisClient } from "redis";
import _ from "lodash";
import debugModule from "debug";
import { SimpleCallback } from "../../types/types";
import { Session, Department, User } from "tabletcommand-backend-models";

export function redis(client: RedisClient) {
  "use strict";
  // cSpell:words tabletcommand

  const debug = debugModule("tabletcommand-middleware:store:redis");

  const findDepartmentByApiKey = function findDepartmentByApiKey(apiKey: string, callback: SimpleCallback<Department>) {
    const key = `api:${apiKey}`;
    debug(`GET ${key}`);
    return client.get(key, function(err, item) {
      if (err) {
        return callback(err, null);
      }

      let object = null;
      try {
        object = JSON.parse(item);
      } catch (e) {
        // Parse failed, object is null which is fine.
      }

      return callback(null, object);
    });
  };

  const storeDepartmentByApiKey = function storeDepartmentByApiKey(apiKey: string, item: Department, callback: SimpleCallback<"OK">) {
    const key = `api:${apiKey}`;
    const val = JSON.stringify(item);
    const ttl = 60 * 60 * 24; // 24h
    debug(`SET ${key} ${val} "EX" ${ttl}`);
    return client.set(key, val, "EX", ttl, function(err, result) {
      return callback(err, result);
    });
  };

  const expireDepartmentByApiKey = function expireDepartmentByApiKey(apiKey: string, callback: SimpleCallback<number>) {
    const key = `api:${apiKey}`;
    return expireItemByKey(key, callback);
  };

  const expireItemByKey = function expireItemByKey(key: string, callback: SimpleCallback<number>) {
    const ttl = 0;
    debug(`EXPIRE ${key} ${ttl}`);
    return client.expire(key, ttl, function(err, result) {
      return callback(err, result);
    });
  };

  const findSessionByToken = function findSessionByToken(token: string, callback: (err: Error, s: Session, user: User, department: Department) => void) {
    const key = `s:${token}`;

    debug(`GET ${key}`);
    return client.get(key, function(err, item) {
      if (err) {
        return callback(err, null, null, null);
      }

      let session = null;
      let user = null;
      let department = null;
      try {
        const object = JSON.parse(item);
        if (_.isObject(object.s)) {
          session = object.s;
        }
        if (_.isObject(object.u)) {
          user = object.u;
        }
        if (_.isObject(object.d)) {
          department = object.d;
        }
      } catch (e) {
        // Parse failed, session, user, department are null, and that is ok.
      }

      return callback(null, session, user, department);
    });
  };

  const storeSessionByToken = function storeSessionByToken(token: string, session: Session, user: User, department: Department, callback: SimpleCallback<"OK">) {
    const key = `s:${token}`;
    const item = {
      s: session,
      u: user,
      d: department,
    };
    const val = JSON.stringify(item);
    const ttl = 60 * 60 * 12; // 12h
    debug(`SET ${key} ${val} "EX" ${ttl}`);
    return client.set(key, val, "EX", ttl, function(err, result) {
      return callback(err, result);
    });
  };

  function expireSessionByToken(token: string, callback: SimpleCallback<number>) {
    const key = `s:${token}`;
    return expireItemByKey(key, callback);
  }

  return {
    findDepartmentByApiKey,
    storeDepartmentByApiKey,
    expireDepartmentByApiKey,

    findSessionByToken,
    storeSessionByToken,
    expireSessionByToken,
  };
}
export default redis;
