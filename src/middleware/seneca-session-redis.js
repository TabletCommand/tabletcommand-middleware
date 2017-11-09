"use strict";

module.exports = function authBySenecaCookieRedis(Department, Session, User, redisClient) {
  const store = require("../lib/store")(Department, Session, User, redisClient);
  const session = require("../lib/session")(store);

  return function authBySenecaCookieRedisMiddleware(req, res, next) {
    return session.authBySenecaCookie(req, res, function authBySenecaCookieCallback(err) {
      return next(err);
    });
  };
};
