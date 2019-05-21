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
    const getSession = function getSession(req, res, callback) {
        const cookies = req.cookies;
        function hasLogin(c) {
            return lodash_1.default.isObject(c) && lodash_1.default.isString(c["seneca-login"]);
        }
        if (!hasLogin(cookies)) {
            return callback(null, null);
        }
        const query = {
            token: cookies["seneca-login"],
            active: true,
        };
        return Session.findOne(query, function findSessionCallback(err, dbObject) {
            if (lodash_1.default.isObject(dbObject) && lodash_1.default.size(dbObject) > 0) {
                req.login = dbObject.toObject();
                req.session = dbObject.toObject();
            }
            return callback(err, dbObject);
        });
    };
    const getUser = function getUser(req, res, callback) {
        if (!lodash_1.default.isObject(req.login)) {
            return callback(null, null);
        }
        const session = req.login;
        if (!lodash_1.default.isString(session.user)) {
            return callback(null, null);
        }
        const query = {
            _id: session.user,
            active: true,
        };
        return User.findOne(query, function findUserCallback(err, dbObject) {
            if (lodash_1.default.isObject(dbObject) && lodash_1.default.size(dbObject) > 0) {
                req.user = dbObject.toObject();
            }
            return callback(err, dbObject);
        });
    };
    const getDepartmentByUser = function getDepartmentByUser(req, res, callback) {
        if (!lodash_1.default.isObject(req.user)) {
            return callback(null, null);
        }
        const user = req.user;
        let departmentId = user.departmentId;
        const noUserDepartmentId = (!lodash_1.default.isString(departmentId) || departmentId === "");
        const isSuperUser = helpers_1.isSuper(user);
        let noQueryDepartmentId = true;
        if (noUserDepartmentId && lodash_1.default.isString(req.query.departmentId)) {
            noQueryDepartmentId = false;
            departmentId = req.query.departmentId;
        }
        if (isSuperUser && noUserDepartmentId && noQueryDepartmentId) {
            return callback(null, null);
        }
        return Department.findById(departmentId, function findDepartmentCallback(err, dbObject) {
            if (lodash_1.default.isObject(dbObject) && lodash_1.default.size(dbObject) > 0) {
                req.department = dbObject.toObject();
                req.departmentLog = departmentForLogging(dbObject.toJSON());
            }
            return callback(err, dbObject);
        });
    };
    const getDepartmentByApiKey = function getDepartmentByApiKey(req, res, callback) {
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
            return callback(null, null);
        }
        const query = {
            apikey: apiKey,
            active: true,
        };
        return Department.findOne(query, function findDepartmentByApiKeyCallback(err, dbObject) {
            if (lodash_1.default.isObject(dbObject) && lodash_1.default.size(dbObject) > 0) {
                req.department = dbObject.toObject();
                req.departmentLog = departmentForLogging(dbObject.toJSON());
            }
            return callback(err, dbObject);
        });
    };
    return function (req, res, next) {
        return getDepartmentByApiKey(req, res, function getDepartmentByApiKeyCallback(err, department) {
            if (!lodash_1.default.isNull(department) && lodash_1.default.size(department) > 0) {
                return next(err);
            }
            // Trying to resolve using a session cookie
            return getSession(req, res, function getSessionCallback(err, session) {
                if (err) {
                    return next(err);
                }
                return getUser(req, res, function getUserCallback(err, user) {
                    if (err) {
                        return next(err);
                    }
                    return getDepartmentByUser(req, res, function getDepartmentByUserCallback(err, department) {
                        return next(err);
                    });
                });
            });
        });
    };
}
exports.customSession = customSession;
exports.default = customSession;
//# sourceMappingURL=custom-session.js.map