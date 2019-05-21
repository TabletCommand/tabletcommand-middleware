"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const lodash_1 = __importDefault(require("lodash"));
const os_1 = __importDefault(require("os"));
const express_statsd_1 = __importDefault(require("express-statsd"));
const monitorRequest = express_statsd_1.default();
// Add an express-statsd key that looks like http.post.api.hello.world for a HTTP POST to /api/hello/world URL
// See https://github.com/uber/express-statsd
function metricsModule(filterFunction) {
    const defaultFilter = function defaultFilter(path, callback) {
        const uuidRegex = /[-a-f\d]{36}/i;
        const mongoIdRegex = /[a-f\d]{24}/i;
        if (path.match(uuidRegex) || path.match(mongoIdRegex)) {
            const parts = path.split(".");
            const cleanParts = parts.filter(function (part) {
                const isUUID = part.match(uuidRegex);
                const isMongoId = part.match(mongoIdRegex);
                return !(isUUID || isMongoId);
            });
            path = cleanParts.join(".");
        }
        return callback(path);
    };
    const statsd = function statsd() {
        return function statsdFunc(req, res, next) {
            const hostname = process.env.NODE_STATSD_PREFIX || os_1.default.hostname();
            const env = process.env.NODE_ENV || "production";
            let method = req.method || "unknown_method";
            method = method.toLowerCase();
            const urlName = req.url || "unknown_url";
            let path = url_1.parse(urlName).pathname.toLowerCase();
            path = path.replace(/\//g, " ").trim().replace(/\s/g, ".");
            let filterFunc = defaultFilter;
            if (lodash_1.default.isFunction(filterFunction)) {
                filterFunc = filterFunction;
            }
            return filterFunc(path, function (filteredPath) {
                req.statsdKey = [hostname, env, "http", method, filteredPath].join(".");
                monitorRequest(req, res);
                return next();
            });
        };
    };
    return {
        defaultFilter,
        statsd,
    };
}
exports.metricsModule = metricsModule;
exports.default = metricsModule;
//# sourceMappingURL=metrics.js.map