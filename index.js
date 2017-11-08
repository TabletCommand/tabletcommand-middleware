"use strict";

// cSpell:words signup apikey

var customSession = require("./middleware/custom-session");
var signupSession = require("./middleware/signup-session");
var tokenSession = require("./middleware/token-session");
var senecaSession = require("./middleware/seneca-session-redis");
var apiKeySession = require("./middleware/apikey-session-redis");

var metrics = require("./middleware/metrics");
var redis = require("./lib/redis");
var helpers = require("./lib/helpers");
var routesCommon = require("./routes/common");

module.exports = {
  session: {
    legacy: customSession,
    signup: signupSession,
    token: tokenSession,
    seneca: senecaSession,
    apiKey: apiKeySession
  },
  metrics: metrics,
  redis: redis,
  helpers: helpers,
  routesCommon: routesCommon
};
