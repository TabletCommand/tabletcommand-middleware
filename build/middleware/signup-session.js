"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
function customSession(Department) {
    const departmentForLogging = function departmentForLogging(department) {
        if (!lodash_1.default.isObject(department)) {
            return {};
        }
        const item = lodash_1.default.pick(lodash_1.default.clone(department), [
            "_id", "id", "department", "cadBidirectionalEnabled",
        ]);
        return JSON.parse(JSON.stringify(item)); // Force convert the item to JSON
    };
    const getDepartmentBySignupKey = function getDepartmentBySignupKey(req, res, callback) {
        // Bail if req.department was already set
        // by a different middleware
        if (lodash_1.default.isObject(req.department) && lodash_1.default.size(req.department) > 0) {
            return callback(null, req.department);
        }
        let signupKey = "";
        if (lodash_1.default.isObject(req.query)) {
            const query = req.query;
            if (lodash_1.default.has(query, "signupKey")) {
                signupKey = query.signupKey;
            }
            else if (lodash_1.default.has(req.query, "signupkey")) {
                signupKey = query.signupkey;
            }
        }
        if (signupKey === "") {
            return callback(null, null);
        }
        const query = {
            active: true,
            signupKey,
        };
        return Department.findOne(query, function findDepartmentCallback(err, dbObject) {
            if (lodash_1.default.isObject(dbObject) && lodash_1.default.size(dbObject) > 0) {
                req.department = dbObject.toObject();
                req.departmentLog = departmentForLogging(dbObject.toJSON());
            }
            return callback(err, dbObject);
        });
    };
    return function customSessionCallback(req, res, next) {
        return getDepartmentBySignupKey(req, res, function getDepartmentBySignupKeyCallback(err, department) {
            return next(err);
        });
    };
}
exports.customSession = customSession;
exports.default = customSession;
//# sourceMappingURL=signup-session.js.map