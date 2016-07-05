/* jslint node: true */
"use strict";

var session = require('./middleware/custom-session');
var redis = require('./lib/redis');
var helpers = require('./lib/helpers');
var routesCommon = require('./routes/common');

module.exports = {
	session: session,
	redis: redis,
	helpers: helpers,
	routesCommon: routesCommon
};
