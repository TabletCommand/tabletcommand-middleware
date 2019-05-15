import _ from "lodash";
import * as helpers from "../lib/helpers";
import * as express from 'express';

// A request is authorized if req.department is defined
// That is populated by the session middleware
// based on API token or user session token
export function authDepartment(req: express.Request, res: express.Response, next: express.NextFunction) {
  const deptNotDefined = _.isUndefined(req.department) || _.isNull(req.department);
  if (deptNotDefined) {
    const err = new Error("Not Authorized");
    err.status = 401;
    return next(err);
  }

  return next();
}
export const auth = authDepartment;

export function authSuper(req: express.Request, res: express.Response, next: express.NextFunction) {
  const shouldAllow = _.isObject(req.user) && helpers.isSuper(req.user);
  if (!shouldAllow) {
    const err = new Error("Not Authorized");
    err.status = 401;
    return next(err);
  }

  return next();
}

export function authUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const shouldAllow = _.isObject(req.user) && helpers.isActive(req.user);
  if (!shouldAllow) {
    const err = new Error("Not Authorized");
    err.status = 401;
    return next(err);
  }

  return next();
}

export function notFoundHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
  const err = new Error("Not Found");
  err.status = 404;
  return next(err);
}

export function notImplementedHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
  const err = new Error("Not Implemented");
  err.status = 444;
  return next(err);
}

// development error handler
// will print stacktrace
export function developmentErrorHandler(err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: err,
  });
}

// production error handler
// no stacktraces leaked to user
export function productionErrorHandler(err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {},
  });
}
