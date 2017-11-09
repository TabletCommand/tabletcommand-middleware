"use strict";

module.exports = function authBySenecaCookieRedis(Department, Session, User, redisClient) {
  var store = require("../lib/store")(Department, Session, User, redisClient);
  var session = require("../lib/session")(store);

  return function authBySenecaCookieRedisMiddleware(req, res, next) {
    return session.authBySenecaCookie(req, res, function authBySenecaCookieCallback(err) {
      return next(err);
    });
  };
};