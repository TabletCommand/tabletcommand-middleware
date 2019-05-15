"use strict";

import { DepartmentModel, SessionModel, UserModel } from "tabletcommand-backend-models";
import { RedisClient } from "redis";
import express = require("express");
import storeModule from '../lib/store';
import sessionModule from '../lib/session';

export function authByApiKeyRedis(Department: DepartmentModel, Session: SessionModel, User: UserModel, redisClient: RedisClient) {
  const store = storeModule(Department, Session, User, redisClient);
  const session = sessionModule(store);

  return function authByApiKeyRedisMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    return session.authByApiKey(req, res, function authByApiKeyCallback(err) {
      return next(err);
    });
  };
}

export default authByApiKeyRedis;
