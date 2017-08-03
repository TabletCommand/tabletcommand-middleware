"use strict";

var config = {};

config.db = process.env.NODE_MONGO_URL || "mongodb://test:test@127.0.0.1/test";
config.redis = process.env.NODE_MASSIVE_REDIS_URL || "redis://x:password@localhost:6379";

module.exports = config;
