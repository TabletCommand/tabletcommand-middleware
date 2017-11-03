"use strict";

var session = require("./middleware/custom-session");
var signupSession = require("./middleware/signup-session");
var statsd = require("./middleware/statsd");
var tokenSession = require("./middleware/token-session");

var redis = require("./lib/redis");
var helpers = require("./lib/helpers");
var routesCommon = require("./routes/common");

module.exports = {
  session: session,
  signupSession: signupSession,
  statsd: statsd,
  tokenSession: tokenSession,

  redis: redis,
  helpers: helpers,
  routesCommon: routesCommon
};
