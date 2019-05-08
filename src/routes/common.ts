var _ = require("lodash");
var helpers = require("../lib/helpers");

// A request is authorized if req.department is defined
// That is populated by the session middleware
// based on API token or user session token
export function authDepartment(req, res, next) {
  var deptNotDefined = _.isUndefined(req.department) || _.isNull(req.department);
  if (deptNotDefined) {
    var err = new Error("Not Authorized");
    err.status = 401;
    return next(err);
  }

  return next();
};
export const auth = authDepartment;

export function authSuper(req, res, next) {
  var shouldAllow = _.isObject(req.user) && helpers.isSuper(req.user);
  if (!shouldAllow) {
    var err = new Error("Not Authorized");
    err.status = 401;
    return next(err);
  }

  return next();
};

export function authUser(req, res, next) {
  var shouldAllow = _.isObject(req.user) && helpers.isActive(req.user);
  if (!shouldAllow) {
    var err = new Error("Not Authorized");
    err.status = 401;
    return next(err);
  }

  return next();
};

export function notFoundHandler(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  return next(err);
};

export function notImplementedHandler(req, res, next) {
  var err = new Error("Not Implemented");
  err.status = 444;
  return next(err);
};

// development error handler
// will print stacktrace
export function developmentErrorHandler(err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: err
  });
};

// production error handler
// no stacktraces leaked to user
export function productionErrorHandler(err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {}
  });
};
