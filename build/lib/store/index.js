"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const database_1 = __importDefault(require("./database"));
const redis_1 = __importDefault(require("./redis"));
function store(Department, Session, User, redisClient) {
    const redis = redis_1.default(redisClient);
    const database = database_1.default(Department, Session, User);
    async function findDepartmentByApiKey(apiKey) {
        let cached = false;
        const redisDepartment = await redis.findDepartmentByApiKey(apiKey);
        if (lodash_1.default.isObject(redisDepartment)) {
            cached = true;
            return { department: redisDepartment, cached };
        }
        const dbDepartment = await database.findDepartmentByApiKey(apiKey);
        await redis.storeDepartmentByApiKey(apiKey, dbDepartment);
        return { department: dbDepartment, cached };
    }
    function expireDepartmentByApiKey(apiKey) {
        return redis.expireDepartmentByApiKey(apiKey);
    }
    async function findSessionByToken(token) {
        let cached = false;
        const { session: rSession, user: rUser, department: rDepartment } = await redis.findSessionByToken(token);
        let session = null;
        let user = null;
        let department = null;
        if (lodash_1.default.isObject(rSession) && lodash_1.default.isObject(rUser)) {
            session = rSession;
            user = rUser;
            cached = true;
        }
        if (lodash_1.default.isObject(rDepartment)) {
            department = rDepartment;
        }
        if (cached) {
            return { session, user, department, cached };
        }
        const dSession = await database.findSessionByToken(token);
        // Invalid session, store an empty record
        // object.user is the userId...
        if (!lodash_1.default.isObject(dSession) && lodash_1.default.isString(dSession.user)) {
            await redis.storeSessionByToken(token, null, null, null);
            return { session, user, department, cached };
        }
        session = dSession;
        const dUser = await database.findUserByUserId(session.user);
        if (!lodash_1.default.isObject(dUser)) {
            await redis.storeSessionByToken(token, session, null, null);
            return { session, user, department, cached };
        }
        user = dUser;
        const dDepartment = await database.findDepartmentById(user.departmentId);
        if (lodash_1.default.isObject(dDepartment)) {
            department = dDepartment;
        }
        await redis.storeSessionByToken(token, session, user, department);
        return { session, user, department, cached };
    }
    function expireSessionByToken(token) {
        return redis.expireSessionByToken(token);
    }
    return {
        findDepartmentByApiKey,
        expireDepartmentByApiKey,
        findSessionByToken,
        expireSessionByToken,
    };
}
exports.store = store;
exports.default = store;
//# sourceMappingURL=index.js.map