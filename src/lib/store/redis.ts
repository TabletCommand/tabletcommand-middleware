import { RedisClient } from "redis";
import _ from "lodash";
import debugModule from "debug";
import { SimpleCallback } from "../../types/types";
import { Session, Department, User } from "tabletcommand-backend-models";
import { convertToPromise } from "../helpers";

export function redis(client: RedisClient) {
  "use strict";
  // cSpell:words tabletcommand

  const debug = debugModule("tabletcommand-middleware:store:redis");

  async function findDepartmentByApiKey(apiKey: string): Promise<Department | null> {
    const key = `api:${apiKey}`;
    debug(`GET ${key}`);
    const item = await convertToPromise<string>(cb => client.get(key, cb));
    let object: Department | null = null;
    try {
      object = JSON.parse(item) as Department;
    } catch (e) {
      // Parse failed, object is null which is fine.
    }

    return object;
  }

  function storeDepartmentByApiKey(apiKey: string, item: Department | null): Promise<"OK"> {
    const key = `api:${apiKey}`;
    const val = JSON.stringify(item);
    const ttl = 60 * 60 * 24; // 24h
    debug(`SET ${key} ${val} "EX" ${ttl}`);
    return convertToPromise<"OK">(cb => client.set(key, val, "EX", ttl, cb));
  }

  function expireDepartmentByApiKey(apiKey: string) {
    const key = `api:${apiKey}`;
    return expireItemByKey(key);
  }

  function expireItemByKey(key: string): Promise<number> {
    const ttl = 0;
    debug(`EXPIRE ${key} ${ttl}`);
    return convertToPromise<number>(cb => client.expire(key, ttl, cb));
  }

  async function findSessionByToken(token: string): Promise<{ session: Session | null, user: User | null, department: Department | null }> {
    const key = `s:${token}`;

    debug(`GET ${key}`);
    const item = await convertToPromise<string>(cb => client.get(key, cb));
    let session = null;
    let user = null;
    let department = null;
    try {
      const object = JSON.parse(item) as  {
        s?: Session;
        u?: User;
        d?: Department;
      };
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

    return { session, user, department };
  }

  function storeSessionByToken(token: string, session: Session | null, user: User | null, department: Department | null): Promise<"OK"> {
    const key = `s:${token}`;
    const item = {
      s: session,
      u: user,
      d: department,
    };
    const val = JSON.stringify(item);
    const ttl = 60 * 60 * 12; // 12h
    debug(`SET ${key} ${val} "EX" ${ttl}`);
    return convertToPromise<"OK">(cb => client.set(key, val, "EX", ttl, cb));
  }

  function expireSessionByToken(token: string): Promise<number> {
    const key = `s:${token}`;
    return expireItemByKey(key);
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
