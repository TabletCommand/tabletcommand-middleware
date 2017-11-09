"use strict";

module.exports = function authByApiKeyRedis(Department, Session, User, redisClient) {
  var store = require("../lib/store")(Department, Session, User, redisClient);
  var session = require("../lib/session")(store);

  return function authByApiKeyRedisMiddleware(req, res, next) {
    return session.authByApiKey(req, res, function authByApiKeyCallback(err) {
      return next(err);
    });
  };
};