"use strict";

var _ = require("lodash");
var helpers = require("../lib/helpers");

// A request is authorized if req.department is defined
// That is populated by the session middleware
// based on API token or user session token
var authDepartment = function authDepartment(req, res, next) {
  var deptNotDefined = _.isUndefined(req.department) || _.isNull(req.department);
  if (deptNotDefined) {
    var err = new Error("Not Authorized");
    err.status = 401;
    return next(err);
  }

  return next();
};

var authSuper = function authSuper(req, res, next) {
  var shouldAllow = _.isObject(req.user) && helpers.isSuper(req.user);
  if (!shouldAllow) {
    var err = new Error("Not Authorized");
    err.status = 401;
    return next(err);
  }

  return next();
};

var authUser = function authUser(req, res, next) {
  var shouldAllow = _.isObject(req.user) && helpers.isActive(req.user);
  if (!shouldAllow) {
    var err = new Error("Not Authorized");
    err.status = 401;
    return next(err);
  }

  return next();
};

var notFoundHandler = function notFoundHandler(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  return next(err);
};

var notImplementedHandler = function notImplementedHandler(req, res, next) {
  var err = new Error("Not Implemented");
  err.status = 444;
  return next(err);
};

// development error handler
// will print stacktrace
var developmentErrorHandler = function developmentErrorHandler(err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: err
  });
};

// production error handler
// no stacktraces leaked to user
var productionErrorHandler = function productionErrorHandler(err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {}
  });
};

module.exports = {
  auth: authDepartment,
  authDepartment: authDepartment,
  authSuper: authSuper,
  authUser: authUser,
  notFoundHandler: notFoundHandler,
  notImplementedHandler: notImplementedHandler,
  developmentErrorHandler: developmentErrorHandler,
  productionErrorHandler: productionErrorHandler
};
