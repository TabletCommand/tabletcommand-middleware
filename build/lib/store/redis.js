"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const debug_1 = __importDefault(require("debug"));
const helpers_1 = require("../helpers");
function redis(client) {
    "use strict";
    // cSpell:words tabletcommand
    const debug = debug_1.default("tabletcommand-middleware:store:redis");
    async function findDepartmentByApiKey(apiKey) {
        const key = `api:${apiKey}`;
        debug(`GET ${key}`);
        const item = await helpers_1.convertToPromise(cb => client.get(key, cb));
        let object = null;
        try {
            object = JSON.parse(item);
        }
        catch (e) {
            // Parse failed, object is null which is fine.
        }
        return object;
    }
    function storeDepartmentByApiKey(apiKey, item) {
        const key = `api:${apiKey}`;
        const val = JSON.stringify(item);
        const ttl = 60 * 60 * 24; // 24h
        debug(`SET ${key} ${val} "EX" ${ttl}`);
        return helpers_1.convertToPromise(cb => client.set(key, val, "EX", ttl, cb));
    }
    function expireDepartmentByApiKey(apiKey) {
        const key = `api:${apiKey}`;
        return expireItemByKey(key);
    }
    function expireItemByKey(key) {
        const ttl = 0;
        debug(`EXPIRE ${key} ${ttl}`);
        return helpers_1.convertToPromise(cb => client.expire(key, ttl, cb));
    }
    async function findSessionByToken(token) {
        const key = `s:${token}`;
        debug(`GET ${key}`);
        const item = await helpers_1.convertToPromise(cb => client.get(key, cb));
        let session = null;
        let user = null;
        let department = null;
        try {
            const object = JSON.parse(item);
            if (lodash_1.default.isObject(object.s)) {
                session = object.s;
            }
            if (lodash_1.default.isObject(object.u)) {
                user = object.u;
            }
            if (lodash_1.default.isObject(object.d)) {
                department = object.d;
            }
        }
        catch (e) {
            // Parse failed, session, user, department are null, and that is ok.
        }
        return { session, user, department };
    }
    function storeSessionByToken(token, session, user, department) {
        const key = `s:${token}`;
        const item = {
            s: session,
            u: user,
            d: department,
        };
        const val = JSON.stringify(item);
        const ttl = 60 * 60 * 12; // 12h
        debug(`SET ${key} ${val} "EX" ${ttl}`);
        return helpers_1.convertToPromise(cb => client.set(key, val, "EX", ttl, cb));
    }
    function expireSessionByToken(token) {
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
exports.redis = redis;
exports.default = redis;
//# sourceMappingURL=redis.js.map