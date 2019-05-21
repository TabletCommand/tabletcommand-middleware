import { DepartmentModel, SessionModel, UserModel } from "tabletcommand-backend-models";
import { RedisClient } from "redis";
import express = require("express");
export declare function authBySenecaCookieRedis(Department: DepartmentModel, Session: SessionModel, User: UserModel, redisClient: RedisClient): (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>;
export default authBySenecaCookieRedis;
//# sourceMappingURL=seneca-session-redis.d.ts.map