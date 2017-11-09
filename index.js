"use strict";

// cSpell:words signup apikey

var customSession = require("./middleware/custom-session");
var signupSession = require("./middleware/signup-session");
var tokenSession = require("./middleware/token-session");

var distSenecaSession = require("./dist/middleware/seneca-session-redis");
var distApiKeySession = require("./dist/middleware/apikey-session-redis");

var distMetrics = require("./dist/middleware/metrics");
var redis = require("./lib/redis");
var helpers = require("./lib/helpers");
var routesCommon = require("./routes/common");

module.exports = {
  session: {
    legacy: customSession,
    signup: signupSession,
    token: tokenSession,
    seneca: distSenecaSession,
    apiKey: distApiKeySession
  },
  metrics: distMetrics,
  redis: redis,
  helpers: helpers,
  routesCommon: routesCommon
};
