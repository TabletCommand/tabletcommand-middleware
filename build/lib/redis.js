"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const helpers = __importStar(require("./helpers"));
const redis_1 = __importDefault(require("redis"));
const helpers_1 = require("./helpers");
function client(config) {
    return redis_1.default.createClient(config.redis);
}
exports.client = client;
function keyForDepartment(department, prefix) {
    let key = prefix + ":";
    if (lodash_1.default.isString(department.id)) {
        key = key + department.id;
    }
    else if (lodash_1.default.isString(department._id)) {
        key = key + department._id;
    }
    else {
        key = key + "unknown";
    }
    return key;
}
async function retrieveItems(client, keys) {
    if (!lodash_1.default.isArray(keys) || lodash_1.default.size(keys) === 0) {
        return [];
    }
    const validKeys = lodash_1.default.filter(keys, function (k) {
        return lodash_1.default.isString(k) && k.length > 0;
    });
    const resolved = [];
    for (const key of validKeys) {
        const object = await helpers_1.convertToPromise(cb => client.get(key, cb));
        if (!lodash_1.default.isNull(object) && !lodash_1.default.isUndefined(object)) {
            resolved.push(object);
        }
    }
    return resolved;
}
function prepareLocationItem(item) {
    if (!lodash_1.default.isString(item.departmentId) || item.departmentId.length === 0) {
        throw new Error(`Invalid departmentId ${item}`);
    }
    if (!lodash_1.default.isString(item.userId) || item.userId.length === 0) {
        throw new Error(`Invalid userId ${item}`);
    }
    const ttl = 60 * 60 * 24; // 24h
    const departmentId = item.departmentId;
    const userId = item.userId;
    const key = "l:" + departmentId + ":" + userId;
    const object = {
        lat: item.location.latitude,
        lon: item.location.longitude,
        type: item.device_type,
        username: item.username,
        active: helpers.itemIsTrue(item, "active"),
        uuid: item.uuid,
        id: item._id,
        userId: item.userId,
        t: item.modified_unix_date,
    };
    const val = JSON.stringify(object);
    return { key, val, ttl };
}
function expandLocation(item) {
    return {
        location: {
            latitude: item.lat,
            longitude: item.lon,
        },
        device_type: item.type,
        username: item.username,
        active: item.active,
        uuid: item.uuid,
        userId: item.userId,
        modified_unix_date: item.t,
    };
}
async function listLocation(client, department) {
    let departmentId = "";
    if (lodash_1.default.isString(department._id)) {
        departmentId = department._id;
    }
    else if (lodash_1.default.isObject(department._id)) {
        departmentId = department._id.toString();
    }
    else if (lodash_1.default.isString(department.id)) {
        departmentId = department.id;
    }
    else if (lodash_1.default.isObject(department.id)) {
        departmentId = department.id.toString();
    }
    if (!lodash_1.default.isString(departmentId) || departmentId.length === 0) {
        throw new Error(`Invalid departmentId ${departmentId}`);
    }
    const cursor = "0";
    const match = "l:" + departmentId + ":*";
    const count = "1000";
    const result = await helpers_1.convertToPromise(cb => client.scan(cursor, "MATCH", match, "COUNT", count, cb));
    const items = await retrieveItems(client, result[1]);
    const unpackResults = lodash_1.default.map(items, function (i) {
        try {
            const out = expandLocation(JSON.parse(i));
            out.departmentId = departmentId;
            return out;
        }
        catch (err) {
            return null;
        }
    });
    const validResults = lodash_1.default.filter(unpackResults, function (i) {
        return lodash_1.default.isObject(i) && lodash_1.default.size(i) > 0;
    });
    return validResults;
}
exports.listLocation = listLocation;
async function storeLocation(client, item) {
    const { key, val, ttl } = prepareLocationItem(item);
    try {
        const result = await helpers_1.convertToPromise(cb => client.set(key, val, "EX", ttl, cb));
        process.stdout.write(".");
        return result;
    }
    catch (err) {
        console.log("Set key Err", err, "key", key, "value", val);
        return null;
    }
}
exports.storeLocation = storeLocation;
function prepareDebugInfoItem(item) {
    if (!lodash_1.default.isString(item.departmentId) || item.departmentId.length === 0) {
        throw new Error(`Invalid departmentId: ${item}`);
    }
    if (!lodash_1.default.isString(item.userId) || item.userId.length === 0) {
        throw new Error(`Invalid userId: ${item}`);
    }
    if (!lodash_1.default.isString(item.session) || item.session.length === 0) {
        throw new Error(`Invalid session ${item}`);
    }
    const ttl = 60 * 60 * 24 * 14; // 14d
    const departmentId = item.departmentId;
    const userId = item.userId;
    const session = item.session;
    const key = "info:" + departmentId + ":" + userId + ":" + session;
    const props = ["nick", "appVer", "osVer", "ua", "t", "userId", "departmentId"];
    const object = lodash_1.default.pick(item, props);
    const val = JSON.stringify(object);
    return { key, val, ttl };
}
function storeDebugInfo(client, item) {
    const { key, val, ttl } = prepareDebugInfoItem(item);
    try {
        return helpers_1.convertToPromise(cb => client.set(key, val, "EX", ttl, cb));
    }
    catch (err) {
        console.log("Set key Err", err, "key", key, "value", val);
        throw err;
    }
}
exports.storeDebugInfo = storeDebugInfo;
async function checkOnline(client, department) {
    const key = keyForDepartment(department, "info");
    const keys = await helpers_1.convertToPromise(cb => client.keys(key + ":*", cb));
    if (!keys || lodash_1.default.size(keys) === 0) {
        return [];
    }
    const items = await helpers_1.convertToPromise(cb => client.mget(keys, cb));
    const unpacked = lodash_1.default.map(items, item => {
        try {
            const o = JSON.parse(item);
            o.department = department.department;
            return o;
        }
        catch (e) {
            return null;
        }
    });
    const valid = lodash_1.default.filter(unpacked, lodash_1.default.isObject);
    return valid;
}
exports.checkOnline = checkOnline;
async function expireItemsMatchingKey(client, keyPattern, seconds) {
    const keys = await helpers_1.convertToPromise(cb => client.keys(keyPattern, cb));
    if (!keys || lodash_1.default.size(keys) === 0) {
        return [];
    }
    for (const key of keys) {
        await helpers_1.convertToPromise(cb => client.expire(key, seconds, cb));
    }
    return keys;
}
exports.expireItemsMatchingKey = expireItemsMatchingKey;
async function storeAPNInfo(client, item) {
    const { key, value, ttl } = prepareStoreAPNInfoItem(item);
    await helpers_1.convertToPromise(cb => client.incr(key, cb));
    return await helpers_1.convertToPromise(cb => client.expire(key, ttl, cb));
}
exports.storeAPNInfo = storeAPNInfo;
function prepareStoreAPNInfoItem(item) {
    // INCR apn:deptId:unixTime
    if (!lodash_1.default.isFinite(item.time)) {
        throw new Error(`Invalid time: ${item}`);
    }
    if (!lodash_1.default.isString(item.departmentId)) {
        throw new Error(`Invalid departmentId: ${item}`);
    }
    const ttl = 60 * 61; // 61 minutes
    const departmentId = item.departmentId;
    const unixTime = moment_timezone_1.default.unix(item.time).unix();
    const key = "apn:" + departmentId + ":" + unixTime;
    const value = 1;
    return { key, value, ttl };
}
function apnInfoMixin(keys, values) {
    const grouped = {};
    lodash_1.default.each(lodash_1.default.zipObject(keys, values), function (value, key) {
        const v = parseInt(value);
        if (!lodash_1.default.isFinite(v)) {
            return;
        }
        if (!lodash_1.default.isString(key)) {
            return;
        }
        const parts = key.split(":");
        if (!lodash_1.default.isString(parts[1]) || !lodash_1.default.isFinite(parseInt(parts[2]))) {
            return;
        }
        const t = parseInt(parts[2]);
        if (!lodash_1.default.has(grouped, t)) {
            grouped[t] = 0;
        }
        grouped[t] = grouped[t] + v;
    });
    const simplified = lodash_1.default.map(grouped, function (value, time) {
        return {
            time: parseInt(time),
            value,
        };
    });
    const sorted = lodash_1.default.sortBy(simplified, "time");
    return sorted;
}
async function getAPNInfo(client, department) {
    const keys = await helpers_1.convertToPromise(cb => client.keys("apn:*", cb));
    const validKeys = lodash_1.default.filter(keys, function (key) {
        if (department) {
            let departmentId = "xoxo";
            if (lodash_1.default.isString(department._id)) {
                departmentId = department._id;
            }
            else if (lodash_1.default.isObject(department._id)) {
                departmentId = department._id.toString();
            }
            else if (lodash_1.default.isString(department.id)) {
                departmentId = department.id;
            }
            else if (lodash_1.default.isObject(department.id)) {
                departmentId = department.id.toString();
            }
            return key.indexOf(departmentId) !== -1;
        }
        return true;
    });
    if (lodash_1.default.size(validKeys) === 0) {
        return [];
    }
    const validValues = await helpers_1.convertToPromise(cb => client.mget(validKeys, cb));
    return apnInfoMixin(validKeys, validValues);
}
exports.getAPNInfo = getAPNInfo;
//# sourceMappingURL=redis.js.map