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
    async function getDepartmentBySignupKey(req, res) {
        // Bail if req.department was already set
        // by a different middleware
        if (lodash_1.default.isObject(req.department) && lodash_1.default.size(req.department) > 0) {
            return req.department;
        }
        let signupKey = "";
        if (lodash_1.default.isObject(req.query)) {
            const query = (req.query || {});
            if ("signupKey" in query) {
                signupKey = query.signupKey;
            }
            else if ("signupkey" in query) {
                signupKey = query.signupkey;
            }
        }
        if (signupKey === "") {
            return null;
        }
        const query = {
            active: true,
            signupKey,
        };
        const dbObject = await Department.findOne(query);
        if (lodash_1.default.isObject(dbObject) && lodash_1.default.size(dbObject) > 0) {
            req.department = dbObject.toObject();
            req.departmentLog = departmentForLogging(dbObject.toJSON());
        }
        return dbObject;
    }
    return async function customSessionCallback(req, res, next) {
        try {
            await getDepartmentBySignupKey(req, res);
            next();
        }
        catch (err) {
            next(err);
        }
    };
}
exports.customSession = customSession;
exports.default = customSession;
//# sourceMappingURL=signup-session.js.map