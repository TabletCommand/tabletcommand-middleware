import storeModule from "../lib/store";
import sessionModule from "../lib/session";
import { DepartmentModel, SessionModel, UserModel } from "tabletcommand-backend-models";
import { RedisClient } from "redis";
import express = require("express");

export function authBySenecaCookieRedis(Department: DepartmentModel, Session: SessionModel, User: UserModel, redisClient: RedisClient) {

  const store = storeModule(Department, Session, User, redisClient);
  const session = sessionModule(store);
  return async function authBySenecaCookieRedisMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      await session.authBySenecaCookie(req, res);
      next(null);
    } catch (err) {
      next(err);
    }
  };
}
export default authBySenecaCookieRedis;
