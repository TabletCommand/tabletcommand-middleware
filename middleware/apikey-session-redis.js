"use strict";

module.exports = function authByApiKeyRedis(Department, redisClient) {
  const store = require("../lib/store")(Department, redisClient);
  const session = require("../lib/session")(store);

  return function authByApiKeyRedisMiddleware(req, res, next) {
    return session.authByApiKey(req, res, function authByApiKeyCallback(err) {
      return next(err);
    });
  };
};
