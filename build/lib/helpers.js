"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("massive-tyrion:helpers");
const request_1 = __importDefault(require("request"));
function calculateOffsetFromTime(time) {
    const serverUnix = new Date().valueOf() / 1000;
    const offset = serverUnix - time;
    return {
        offset,
        server: serverUnix,
        received: time,
    };
}
exports.calculateOffsetFromTime = calculateOffsetFromTime;
function fixObjectBooleanKey(obj, key, defaultValue) {
    if (!lodash_1.default.has(obj, key)) {
        obj[key] = defaultValue;
    }
    const value = obj[key];
    const trueIsh = (value === "true" || value === "1" || value === 1);
    const falseIsh = (value === "false" || value === "0" || value === 0);
    if (trueIsh) {
        obj[key] = true;
    }
    else if (falseIsh) {
        obj[key] = false;
    }
}
exports.fixObjectBooleanKey = fixObjectBooleanKey;
function fixObjectNumberKey(obj, key, defaultValue) {
    if (!lodash_1.default.has(obj, key)) {
        obj[key] = defaultValue;
        return;
    }
    const value = obj[key];
    if (!lodash_1.default.isNumber(value) && lodash_1.default.isNumber(parseInt(value))) {
        obj[key] = parseInt(value);
    }
}
function fixObjectStringKey(obj, key, defaultValue) {
    if (!lodash_1.default.has(obj, key)) {
        obj[key] = defaultValue;
    }
}
function sortWebListsForCollection(list, collectionName) {
    if (!lodash_1.default.isArray(list)) {
        return list;
    }
    if (collectionName === "battalion") {
        const listWithFields = lodash_1.default.map(list, function (item) {
            fixObjectBooleanKey(item, "isMandatory", false);
            fixObjectBooleanKey(item, "active", true);
            fixObjectNumberKey(item, "position", 0);
            return item;
        });
        return lodash_1.default.orderBy(listWithFields, ["isMandatory", "active", "position"], ["desc", "desc", "asc"]);
    }
    //    cmd.sort = [['isMandatory', -1], ['position', 1], ['friendly_id', 1]];
    if (collectionName === "unit") {
        const unitsListWithFields = lodash_1.default.map(list, function (item) {
            fixObjectBooleanKey(item, "isMandatory", false);
            fixObjectNumberKey(item, "position", 0);
            fixObjectStringKey(item, "friendly_id", "");
            return item;
        });
        return lodash_1.default.orderBy(unitsListWithFields, ["isMandatory", "position", "friendly_id"], ["desc", "asc", "asc"]);
    }
    // Default, return the same list
    return list;
}
exports.sortWebListsForCollection = sortWebListsForCollection;
function joinParentChildCollections(parents, children, parentApiId, parentLocalId, parentName, parentUuid, parentDest) {
    const mapLocalIdItems = lodash_1.default.map(lodash_1.default.filter(children, function (item) {
        return lodash_1.default.has(item, parentLocalId) && !lodash_1.default.has(item, parentApiId);
    }), function (item) {
        return {
            id: item[parentLocalId],
            item,
        };
    });
    const mapApiIdItems = lodash_1.default.map(lodash_1.default.filter(children, function (item) {
        return lodash_1.default.has(item, parentApiId);
    }), function (item) {
        return {
            id: item[parentApiId],
            item,
        };
    });
    const unmergedItems = lodash_1.default.flatten([mapApiIdItems, mapLocalIdItems]);
    const reducedIds = lodash_1.default.reduce(unmergedItems, function (memo, i) {
        if (!lodash_1.default.has(memo, i.id)) {
            memo[i.id] = [];
        }
        memo[i.id].push(i.item);
        return memo;
    }, {});
    lodash_1.default.each(parents, function (parent) {
        let itemsByParentId = [];
        let itemsByApiParentId = [];
        if (lodash_1.default.has(parent, "local_id") && lodash_1.default.has(reducedIds, parent.local_id)) {
            itemsByParentId = reducedIds[parent.local_id];
        }
        if (lodash_1.default.has(parent, "id") && lodash_1.default.has(reducedIds, parent.id)) {
            itemsByApiParentId = reducedIds[parent.id];
        }
        const mergedItems = lodash_1.default.flatten([itemsByParentId, itemsByApiParentId]);
        const enhancedItems = lodash_1.default.map(mergedItems, function (item) {
            item[parentApiId] = parent.id;
            if (lodash_1.default.has(parent, "name")) {
                item[parentName] = parent.name;
            }
            if (lodash_1.default.has(parent, "uuid")) {
                item[parentUuid] = parent.uuid;
            }
            return item;
        });
        parent[parentDest] = enhancedItems;
    });
    return parents;
}
exports.joinParentChildCollections = joinParentChildCollections;
function itemIsTrue(item, key) {
    if (lodash_1.default.isUndefined(item) || lodash_1.default.isNull(item)) {
        return false;
    }
    if (lodash_1.default.isUndefined(item[key]) || lodash_1.default.isNull(item[key])) {
        return false;
    }
    const itemTrue = item[key] === true || item[key] === "true";
    const itemOne = item[key] === 1 || item[key] === "1";
    return itemTrue || itemOne;
}
exports.itemIsTrue = itemIsTrue;
function isAdmin(item) {
    return itemIsTrue(item, "admin");
}
exports.isAdmin = isAdmin;
function isSuper(item) {
    return itemIsTrue(item, "superuser");
}
exports.isSuper = isSuper;
function isActive(item) {
    return itemIsTrue(item, "active");
}
exports.isActive = isActive;
function verifyJson(req, res, buf) {
    try {
        JSON.parse(buf);
    }
    catch (err) {
        const message = "Invalid JSON:" + buf;
        console.log(message);
    }
}
exports.verifyJson = verifyJson;
function makeId(length) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
exports.makeId = makeId;
function hasFeature(dept, feature) {
    let value = 0;
    const hasKey = !lodash_1.default.isUndefined(dept[feature]) && !lodash_1.default.isNull(dept[feature]);
    const keyIsTrue = dept[feature] === true || dept[feature] === "true";
    const keyIsOne = dept[feature] === 1 || dept[feature] === "1";
    if (hasKey && (keyIsTrue || keyIsOne)) {
        value = 1;
    }
    return value;
}
exports.hasFeature = hasFeature;
function isItemValidOnMap(item) {
    const invalidDegreeLimit = 5.0;
    const parsedLat = parseInt(item.latitude);
    const parsedLon = parseInt(item.longitude);
    if (lodash_1.default.isNaN(parsedLat) || lodash_1.default.isNaN(parsedLon)) {
        return false;
    }
    if (Math.abs(parsedLat) < invalidDegreeLimit && Math.abs(parsedLon) < invalidDegreeLimit) {
        return false;
    }
    return true;
}
exports.isItemValidOnMap = isItemValidOnMap;
function stripSessionFields(value, key) {
    const fields = ["pass", "salt", "when"];
    const skipFields = lodash_1.default.isString(key) && lodash_1.default.includes(fields, key.toLowerCase());
    const filterSeneca = lodash_1.default.isString(key) && lodash_1.default.trimEnd(key, "$") !== key;
    return filterSeneca || skipFields;
}
function cleanupUser(user) {
    // Usage assertions, the definitions don't seem to know about this overload.
    // tslint:disable-next-line: no-any
    return lodash_1.default.omit(user, stripSessionFields);
}
exports.cleanupUser = cleanupUser;
function resolveUser(args) {
    const hasSeneca = lodash_1.default.isObject(args) &&
        lodash_1.default.isObject(args.req$) &&
        lodash_1.default.isObject(args.req$.seneca);
    const hasSenecaUser = hasSeneca && lodash_1.default.isObject(args.req$.seneca.user);
    const hasReqUser = lodash_1.default.isObject(args.req$.user);
    const hasArgsUser = lodash_1.default.isObject(args) && lodash_1.default.isObject(args.user);
    const hasHeaders = lodash_1.default.isObject(args.req$) && lodash_1.default.isObject(args.req$.headers);
    if (!hasSenecaUser && !hasArgsUser && !hasReqUser) {
        if (hasHeaders) {
            debug("No user. Headers were:", args.req$.headers);
        }
        debug("No hasSenecaUser and no hasArgsUser");
        return null;
    }
    let resolvedUser = null;
    if (hasSenecaUser) {
        resolvedUser = args.req$.seneca.user;
    }
    else if (hasArgsUser) {
        resolvedUser = args.user;
    }
    else if (hasReqUser) {
        resolvedUser = args.req$.user;
    }
    let session = null;
    if (hasSeneca && lodash_1.default.isObject(args.req$.seneca.login)) {
        session = args.req$.seneca.login;
    }
    else if (lodash_1.default.isObject(args.req$.session)) {
        session = args.req$.session;
    }
    const userInactive = !itemIsTrue(resolvedUser, "active");
    const sessionInactive = !itemIsTrue(session, "active");
    // sessionInactive = false; // TODO: remove this once all the users are active
    if (lodash_1.default.isNull(resolvedUser) || userInactive || sessionInactive) {
        debug("User or session not active for:", resolvedUser && resolvedUser.nick, session && session.id);
        return null;
    }
    const user = cleanupUser(resolvedUser);
    return { user, session };
}
exports.resolveUser = resolveUser;
function resolveLogin(args) {
    if (!lodash_1.default.isObject(args) ||
        !lodash_1.default.isObject(args.req$) ||
        !lodash_1.default.isObject(args.req$.seneca) ||
        !lodash_1.default.isObject(args.req$.seneca.login) ||
        !itemIsTrue(args.req$.seneca.login, "active")) {
        return null;
    }
    const login = cleanupUser(args.req$.seneca.login);
    return login;
}
exports.resolveLogin = resolveLogin;
function getClosedOrDate() {
    const nowForClosedDateUnixDate = moment_timezone_1.default().valueOf() / 1000.0;
    const closedOr = [{
            closed_unix_date: 0,
        }, {
            closed_unix_date: {
                $gt: nowForClosedDateUnixDate,
            },
        }];
    return closedOr;
}
function extractInfoFromDevice(device) {
    const maxDaysSinceEvent = 120;
    const info = {
        appVer: "Unknown",
        osVer: "Unknown",
        env: "beta",
        daysSinceEvent: maxDaysSinceEvent,
    };
    const unixDate = moment_timezone_1.default().valueOf() / 1000.0;
    const dayAsSeconds = 60 * 60 * 24;
    if (!lodash_1.default.isUndefined(device.env) && !lodash_1.default.isNull(device.env)) {
        info.env = device.env;
    }
    if (!lodash_1.default.isUndefined(device.ver) && !lodash_1.default.isNull(device.ver)) {
        info.appVer = device.ver;
    }
    if (!lodash_1.default.isUndefined(device.ua) && !lodash_1.default.isNull(device.ua)) {
        let partsAppVer = "";
        let partsOsVer = "";
        const userAgentParts = device.ua.match(/(.*)\((.*)\)/i);
        if (userAgentParts && userAgentParts[1]) {
            partsAppVer = userAgentParts[1];
        }
        if (userAgentParts && userAgentParts[2]) {
            partsOsVer = userAgentParts[2];
        }
        if (partsAppVer.length > 0) {
            info.appVer = partsAppVer.trim();
        }
        if (partsOsVer.length > 0) {
            const osSplitParts = partsOsVer.match(/(.*);(.*);(.*)/i);
            let foundOsVer = "";
            if (osSplitParts && osSplitParts[2]) {
                foundOsVer = osSplitParts[2];
            }
            if (foundOsVer.length > 0) {
                info.osVer = foundOsVer.trim();
            }
        }
    }
    if (!lodash_1.default.isUndefined(device.time) && !lodash_1.default.isNull(device.time)) {
        const secondsAgo = unixDate - parseFloat(device.time + "");
        info.daysSinceEvent = Math.floor(secondsAgo / dayAsSeconds);
    }
    return info;
}
exports.extractInfoFromDevice = extractInfoFromDevice;
function headersToDevice(token, headers) {
    let env = "production";
    if (lodash_1.default.has(headers, "x-tc-apn-environment") &&
        headers["x-tc-apn-environment"] === "beta") {
        env = "beta";
    }
    let appVersion = "";
    if (lodash_1.default.has(headers, "x-tc-app-version")) {
        appVersion = headers["x-tc-app-version"];
    }
    let userAgent = "";
    if (lodash_1.default.has(headers, "user-agent")) {
        userAgent = headers["user-agent"];
    }
    let bundleIdentifier = "com.simple-track.Tablet-CMD";
    if (lodash_1.default.has(headers, "x-tc-bundle-identifier") &&
        lodash_1.default.isString(headers["x-tc-bundle-identifier"]) &&
        lodash_1.default.size(headers["x-tc-bundle-identifier"]) > 0) {
        bundleIdentifier = headers["x-tc-bundle-identifier"];
    }
    else if (appVersion.match(/Tablet CMD Beta/i)) {
        bundleIdentifier = "com.simple-track.beta.Tablet-CMD";
    }
    const silentEnabled = itemIsTrue(headers, "x-tc-silent-enabled");
    const richEnabled = itemIsTrue(headers, "x-tc-rich-enabled");
    const unixtime = moment_timezone_1.default().valueOf() / 1000.0;
    const deviceInfo = {
        token,
        env,
        ver: appVersion,
        ua: userAgent,
        time: unixtime,
        bundleIdentifier,
        silentEnabled,
        richEnabled,
    };
    return deviceInfo;
}
exports.headersToDevice = headersToDevice;
function logUserDevice(postUrl, authToken, user, session, headers) {
    const device = headersToDevice("", headers);
    const info = extractInfoFromDevice(device);
    const item = {
        userId: user.id,
        departmentId: user.departmentId,
        nick: user.nick,
        appVer: info.appVer,
        osVer: info.osVer,
        ua: device.ua,
        t: device.time,
        session: session.id,
    };
    const filter = [];
    const shouldFilter = false;
    // contains does not appear to be in the current definitions
    // tslint:disable-next-line: no-any no-unsafe-any
    if (shouldFilter && lodash_1.default.contains(filter, item.appVer)) {
        return;
    }
    return requestPost(postUrl, authToken, item);
}
exports.logUserDevice = logUserDevice;
function requestPost(postUrl, authToken, item, callback) {
    if (!lodash_1.default.isFunction(callback)) {
        callback = function defaultCallback() {
            // Empty
        };
    }
    const reqOpts = {
        url: postUrl,
        method: "POST",
        json: item,
        headers: {
            "x-tc-auth-token": authToken,
        },
    };
    return request_1.default(reqOpts, callback);
}
exports.requestPost = requestPost;
const configureMomentOpts = function configureMomentOpts() {
    moment_timezone_1.default.updateLocale("en", {
        relativeTime: {
            future: "in %s",
            past: "%s ago",
            s: "%ds",
            ss: "%ds",
            m: "%dmin",
            mm: "%dmin",
            h: "%dh",
            hh: "%dh",
            d: "%dd",
            dd: "%dd",
            M: "%dmon",
            MM: "%dmon",
            y: "%dy",
            yy: "%dy",
        },
    });
};
function convertToPromise(fn) {
    return new Promise((resolve, reject) => fn((err, result) => {
        if (err) {
            reject(err);
        }
        else {
            resolve(result);
        }
    }));
}
exports.convertToPromise = convertToPromise;
//# sourceMappingURL=helpers.js.map