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
const helpers = __importStar(require("../lib/helpers"));
// A request is authorized if req.department is defined
// That is populated by the session middleware
// based on API token or user session token
function authDepartment(req, res, next) {
    const deptNotDefined = lodash_1.default.isUndefined(req.department) || lodash_1.default.isNull(req.department);
    if (deptNotDefined) {
        const err = new Error("Not Authorized");
        err.status = 401;
        return next(err);
    }
    return next();
}
exports.authDepartment = authDepartment;
exports.auth = authDepartment;
function authSuper(req, res, next) {
    const shouldAllow = lodash_1.default.isObject(req.user) && helpers.isSuper(req.user);
    if (!shouldAllow) {
        const err = new Error("Not Authorized");
        err.status = 401;
        return next(err);
    }
    return next();
}
exports.authSuper = authSuper;
function authUser(req, res, next) {
    const shouldAllow = lodash_1.default.isObject(req.user) && helpers.isActive(req.user);
    if (!shouldAllow) {
        const err = new Error("Not Authorized");
        err.status = 401;
        return next(err);
    }
    return next();
}
exports.authUser = authUser;
function notFoundHandler(req, res, next) {
    const err = new Error("Not Found");
    err.status = 404;
    return next(err);
}
exports.notFoundHandler = notFoundHandler;
function notImplementedHandler(req, res, next) {
    const err = new Error("Not Implemented");
    err.status = 444;
    return next(err);
}
exports.notImplementedHandler = notImplementedHandler;
// development error handler
// will print stacktrace
function developmentErrorHandler(err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
        message: err.message,
        error: err,
    });
}
exports.developmentErrorHandler = developmentErrorHandler;
// production error handler
// no stacktraces leaked to user
function productionErrorHandler(err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
        message: err.message,
        error: {},
    });
}
exports.productionErrorHandler = productionErrorHandler;
//# sourceMappingURL=common.js.map