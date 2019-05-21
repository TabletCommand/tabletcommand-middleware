import { DepartmentModel, SessionModel, UserModel } from "tabletcommand-backend-models";
import { RedisClient } from "redis";
import express = require("express");
export declare function authByApiKeyRedis(Department: DepartmentModel, Session: SessionModel, User: UserModel, redisClient: RedisClient): (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>;
export default authByApiKeyRedis;
//# sourceMappingURL=apikey-session-redis.d.ts.map