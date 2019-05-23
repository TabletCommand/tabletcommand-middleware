"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const helpers_1 = require("../lib/helpers");
function customSession(Department, Session, User) {
    const departmentForLogging = function departmentForLogging(department) {
        if (!lodash_1.default.isObject(department)) {
            return {};
        }
        const item = lodash_1.default.pick(lodash_1.default.clone(department), [
            "_id", "id", "department", "cadBidirectionalEnabled",
        ]);
        return JSON.parse(JSON.stringify(item)); // Force convert the item to JSON
    };
    async function getSession(req, res) {
        const cookies = req.cookies;
        function hasLogin(c) {
            return lodash_1.default.isObject(c) && lodash_1.default.isString(c["seneca-login"]);
        }
        if (!hasLogin(cookies)) {
            return null;
        }
        const query = {
            token: cookies["seneca-login"],
            active: true,
        };
        const dbObject = await Session.findOne(query);
        if (lodash_1.default.isObject(dbObject) && lodash_1.default.size(dbObject) > 0) {
            req.login = dbObject.toObject();
            req.session = dbObject.toObject();
        }
        return dbObject;
    }
    async function getUser(req, res) {
        if (!lodash_1.default.isObject(req.login)) {
            return null;
        }
        const session = req.login;
        if (!lodash_1.default.isString(session.user)) {
            return null;
        }
        const query = {
            _id: session.user,
            active: true,
        };
        const dbObject = await User.findOne(query);
        if (lodash_1.default.isObject(dbObject) && lodash_1.default.size(dbObject) > 0) {
            req.user = dbObject.toObject();
        }
        return dbObject;
    }
    async function getDepartmentByUser(req, res) {
        if (!lodash_1.default.isObject(req.user)) {
            return null;
        }
        const user = req.user;
        let departmentId = user.departmentId;
        const noUserDepartmentId = (!lodash_1.default.isString(departmentId) || departmentId === "");
        const isSuperUser = helpers_1.isSuper(user);
        let noQueryDepartmentId = true;
        const query = req.query;
        if (noUserDepartmentId && lodash_1.default.isString(query.departmentId)) {
            noQueryDepartmentId = false;
            departmentId = query.departmentId;
        }
        if (isSuperUser && noUserDepartmentId && noQueryDepartmentId) {
            return null;
        }
        const dbObject = await Department.findById(departmentId);
        if (lodash_1.default.isObject(dbObject) && lodash_1.default.size(dbObject) > 0) {
            req.department = dbObject.toObject();
            req.departmentLog = departmentForLogging(dbObject.toJSON());
        }
        return dbObject;
    }
    async function getDepartmentByApiKey(req, res) {
        let apiKey = "";
        if (lodash_1.default.isObject(req.headers) && lodash_1.default.has(req.headers, "apikey")) {
            apiKey = req.headers.apiKey;
        }
        else if (lodash_1.default.isObject(req.headers) && lodash_1.default.has(req.headers, "apikey")) {
            apiKey = req.headers.apikey;
        }
        else if (lodash_1.default.isObject(req.query) && lodash_1.default.has(req.query, "apikey")) {
            apiKey = req.query.apiKey;
        }
        else if (lodash_1.default.isObject(req.query) && lodash_1.default.has(req.query, "apikey")) {
            apiKey = req.query.apikey;
        }
        if (apiKey === "") {
            return null;
        }
        const query = {
            apikey: apiKey,
            active: true,
        };
        const dbObject = await Department.findOne(query);
        if (lodash_1.default.isObject(dbObject) && lodash_1.default.size(dbObject) > 0) {
            req.department = dbObject.toObject();
            req.departmentLog = departmentForLogging(dbObject.toJSON());
        }
        return dbObject;
    }
    return async function (req, res, next) {
        try {
            const department = await getDepartmentByApiKey(req, res);
            if (!lodash_1.default.isNull(department) && lodash_1.default.size(department) > 0) {
                return next(null);
            }
            // Trying to resolve using a session cookie
            await getSession(req, res);
            await getUser(req, res);
            await getDepartmentByUser(req, res);
            return next(null);
        }
        catch (e) {
            next(e);
        }
    };
}
exports.customSession = customSession;
exports.default = customSession;
//# sourceMappingURL=custom-session.js.map