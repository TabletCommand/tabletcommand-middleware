"use strict";

var parse = require("url").parse;
var _ = require("lodash");
var os = require("os");
var expressStatsd = require("express-statsd");
var monitorRequest = expressStatsd();

// Add an express-statsd key that looks like http.post.api.hello.world for a HTTP POST to /api/hello/world URL
// See https://github.com/uber/express-statsd

module.exports = function metricsModule(filterFunction) {
  var defaultFilter = function defaultFilter(path, callback) {
    var uuidRegex = /[-a-f\d]{36}/i;
    var mongoIdRegex = /[a-f\d]{24}/i;
    if (path.match(uuidRegex) || path.match(mongoIdRegex)) {
      var parts = path.split(".");
      var cleanParts = parts.filter(function (part) {
        var isUUID = part.match(uuidRegex);
        var isMongoId = part.match(mongoIdRegex);
        return !(isUUID || isMongoId);
      });
      path = cleanParts.join(".");
    }

    return callback(path);
  };

  var statsd = function statsd() {
    return function statsdFunc(req, res, next) {
      var hostname = process.env.NODE_STATSD_PREFIX || os.hostname();
      var env = process.env.NODE_ENV || "production";
      var method = req.method || "unknown_method";
      method = method.toLowerCase();
      var urlName = req.url || "unknown_url";
      var path = parse(urlName).pathname.toLowerCase();
      path = path.replace(/\//g, " ").trim().replace(/\s/g, ".");

      var filterFunc = defaultFilter;
      if (_.isFunction(filterFunction)) {
        filterFunc = filterFunction;
      }

      return filterFunc(path, function (filteredPath) {
        req.statsdKey = [hostname, env, "http", method, filteredPath].join(".");

        monitorRequest(req, res);
        return next();
      });
    };
  };

  return {
    defaultFilter: defaultFilter,
    statsd: statsd
  };
};