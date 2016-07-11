/*jslint node: true */
"use strict";

var _ = require('lodash');

// A request is authorized if req.department is defined
// That is populated by the session middleware
// based on API token or user session token
var auth = function(req, res, next){
  var deptNotDefined = _.isUndefined(req.department) || _.isNull(req.department);
  if(deptNotDefined){
    var err = new Error('Not Authorized');
    err.status = 401;
    return next(err);
  }

  return next();
};

var authSuper = function(req, res, next){
  var shouldAllow = _.isObject(req.user) && (req.user.superuser === true);
  if (!shouldAllow) {
    var err = new Error('Not Authorized');
    err.status = 401;
    return next(err);
  }

  return next();
};

var notFoundHandler = function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  return next(err);
};

var notImplementedHandler = function(req, res, next){
    var err = new Error('Not Implemented');
    err.status = 444;
    return next(err);
};

// development error handler
// will print stacktrace
var developmentErrorHandler = function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
};

// production error handler
// no stacktraces leaked to user
var productionErrorHandler = function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
};

module.exports = {
  auth: auth,
  authSuper: authSuper,
  notFoundHandler: notFoundHandler,
  notImplementedHandler: notImplementedHandler,
  developmentErrorHandler: developmentErrorHandler,
  productionErrorHandler: productionErrorHandler,
};
