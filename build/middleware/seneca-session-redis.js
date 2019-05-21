"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = __importDefault(require("../lib/store"));
const session_1 = __importDefault(require("../lib/session"));
function authBySenecaCookieRedis(Department, Session, User, redisClient) {
    const store = store_1.default(Department, Session, User, redisClient);
    const session = session_1.default(store);
    return async function authBySenecaCookieRedisMiddleware(req, res, next) {
        try {
            await session.authBySenecaCookie(req, res);
            next(null);
        }
        catch (err) {
            next(err);
        }
    };
}
exports.authBySenecaCookieRedis = authBySenecaCookieRedis;
exports.default = authBySenecaCookieRedis;
//# sourceMappingURL=seneca-session-redis.js.map