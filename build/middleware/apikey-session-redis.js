"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = __importDefault(require("../lib/store"));
const session_1 = __importDefault(require("../lib/session"));
function authByApiKeyRedis(Department, Session, User, redisClient) {
    const store = store_1.default(Department, Session, User, redisClient);
    const session = session_1.default(store);
    return async function authByApiKeyRedisMiddleware(req, res, next) {
        session.authByApiKey(req, res).catch(next);
    };
}
exports.authByApiKeyRedis = authByApiKeyRedis;
exports.default = authByApiKeyRedis;
//# sourceMappingURL=apikey-session-redis.js.map