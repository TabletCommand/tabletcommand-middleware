"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const debug_1 = __importDefault(require("debug"));
function database(Department, Session, User) {
    const debug = debug_1.default("tabletcommand-middleware:store:database");
    const fields = {
        department: [
            "_id",
            "id",
            "agency",
            "incidentTypes",
            "rtsChannelPrefix",
            "rtsEnabled",
            "pushEnabled",
            "heartbeatEnabled",
            "cadBidirectionalEnabled",
            "cadMonitorMinutes",
            "cadMonitorEnabled",
            "cadEmailUsername",
            "apikey",
            "active",
            "department",
            "userContributionEnabled",
        ],
    };
    async function findDepartmentByApiKey(apiKey) {
        const query = {
            apikey: apiKey,
        };
        debug(`Department.findOne: ${JSON.stringify(query)}.`);
        const dbItem = await Department.findOne(query, fields.department);
        let item = null;
        if (lodash_1.default.isObject(dbItem)) {
            item = JSON.parse(JSON.stringify(dbItem.toJSON()));
        }
        return item;
    }
    async function findSessionByToken(token) {
        const query = {
            token,
        };
        debug(`Session.findOne: ${JSON.stringify(query)}.`);
        const dbItem = await Session.findOne(query);
        let item = null;
        if (lodash_1.default.isObject(dbItem)) {
            item = JSON.parse(JSON.stringify(dbItem.toJSON()));
        }
        return item;
    }
    async function findUserByUserId(userId) {
        const query = {
            _id: userId,
        };
        debug(`User.findOne: ${JSON.stringify(query)}.`);
        const dbItem = await User.findOne(query);
        let item = null;
        if (lodash_1.default.isObject(dbItem)) {
            item = JSON.parse(JSON.stringify(dbItem.toJSON()));
        }
        return item;
    }
    async function findDepartmentById(departmentId) {
        // super admins do not have a departmentId
        if (!lodash_1.default.isString(departmentId) || departmentId === "") {
            return null;
        }
        const query = {
            _id: departmentId,
        };
        debug(`Department.findOne: ${JSON.stringify(query)}.`);
        const dbItem = await Department.findOne(query, fields.department);
        let item = null;
        if (lodash_1.default.isObject(dbItem)) {
            item = JSON.parse(JSON.stringify(dbItem.toJSON()));
        }
        return item;
    }
    return {
        findDepartmentByApiKey,
        findSessionByToken,
        findUserByUserId,
        findDepartmentById,
    };
}
exports.database = database;
exports.default = database;
//# sourceMappingURL=database.js.map