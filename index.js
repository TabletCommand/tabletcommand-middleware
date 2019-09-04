"use strict";

// cSpell:words signup apikey

var customSession = require("./dist/middleware/custom-session");
var signupSession = require("./dist/middleware/signup-session");
var tokenSession = require("./dist/middleware/token-session");

var senecaSession = require("./dist/middleware/seneca-session-redis");
var apiKeySession = require("./dist/middleware/apikey-session-redis");
var personnelApiKeySession = require("./dist/middleware/personnelapikey-session-redis");

var metrics = require("./dist/middleware/metrics");
var redis = require("./dist/lib/redis");
var helpers = require("./dist/lib/helpers");
var routesCommon = require("./dist/routes/common");
var start = require("./dist/lib/start");
var logger = require("./dist/lib/bunyan-logger");
var configResolver = require("./dist/lib/config-resolver");

module.exports = {
  session: {
    legacy: customSession,
    signup: signupSession,
    token: tokenSession,
    seneca: senecaSession,
    apiKey: apiKeySession,
    personnelApiKey: personnelApiKeySession
  },
  metrics: metrics,
  redis: redis,
  helpers: helpers,
  routesCommon: routesCommon,
  start: start,
  logger: logger,
  configResolver: configResolver
};
