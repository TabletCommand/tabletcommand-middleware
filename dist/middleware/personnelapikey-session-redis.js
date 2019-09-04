"use strict";

module.exports = function authByPersonnelApiKeyRedis(Department, Session, User, redisClient) {
  var store = require("../lib/store")(Department, Session, User, redisClient);
  var session = require("../lib/session")(store);

  return function authByPersonnelApiKeyRedisMiddleware(req, res, next) {
    return session.authByPersonnelApiKey(req, res, function authByPersonnelApiKeyCallback(err) {
      return next(err);
    });
  };
};