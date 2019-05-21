"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
const helpers = __importStar(require("./helpers"));
const debug_1 = __importDefault(require("debug"));
function session(store) {
    const sessionCookieName = "seneca-login";
    const debug = debug_1.default("tabletcommand-middleware:session");
    function detectApiKey(headers, query) {
        function extractApiKey(obj) {
            let apiKey = "";
            if (_.has(obj, "apiKey")) {
                apiKey = obj.apiKey;
            }
            else if (_.has(obj, "apikey")) {
                apiKey = obj.apikey;
            }
            return apiKey;
        }
        let apiKey = "";
        if (_.isObject(headers)) {
            apiKey = extractApiKey(headers);
        }
        if (apiKey === "" && _.isObject(query)) {
            apiKey = extractApiKey(query);
        }
        return apiKey;
    }
    function detectCookieSession(cookies) {
        let session = "";
        if (_.isObject(cookies) && _.isString(cookies[sessionCookieName])) {
            session = cookies[sessionCookieName];
        }
        return session;
    }
    const departmentForLogging = function departmentForLogging(department) {
        if (!_.isObject(department)) {
            return {};
        }
        const item = _.pick(_.clone(department), [
            "_id", "id", "department", "cadBidirectionalEnabled",
        ]);
        return item;
    };
    async function authByApiKey(req, res) {
        const apiKey = detectApiKey(req.headers, req.query);
        debug(`found api key:${apiKey}.`);
        if (apiKey === "") {
            return null;
        }
        const { department } = await store.findDepartmentByApiKey(apiKey);
        if (_.isObject(department) && helpers.isActive(department)) {
            req.department = department;
            req.departmentLog = departmentForLogging(department);
        }
        return department;
    }
    async function authBySenecaCookie(req, res) {
        const token = detectCookieSession(req.cookies);
        if (token === "") {
            return { session: null, user: null, department: null };
        }
        const { session, user, department } = await store.findSessionByToken(token);
        if (_.isObject(session) && helpers.isActive(session) && _.isObject(user) && helpers.isActive(user)) {
            req.login = session;
            req.session = session;
            req.user = user;
            if (_.isObject(department) && helpers.isActive(department)) {
                req.department = department;
                req.departmentLog = departmentForLogging(department);
            }
        }
        return { session, user, department };
    }
    return {
        detectApiKey,
        detectCookieSession,
        sessionCookieName,
        departmentForLogging,
        authByApiKey,
        authBySenecaCookie,
    };
}
exports.session = session;
exports.default = session;
//# sourceMappingURL=session.js.map