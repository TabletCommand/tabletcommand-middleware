"use strict";

module.exports = function authByPersonnelApiKeyRedis(Department, Session, User, redisClient) {
  const store = require("../lib/store")(Department, Session, User, redisClient);
  const session = require("../lib/session")(store);

  return function authByPersonnelApiKeyRedisMiddleware(req, res, next) {
    return session.authByPersonnelApiKey(req, res, function authByPersonnelApiKeyCallback(err) {
      return next(err);
    });
  };
};
