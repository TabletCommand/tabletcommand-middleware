"use strict";

const parse = require("url").parse;
const _ = require("lodash");
const os = require("os");
const expressStatsd = require("express-statsd");
const monitorRequest = expressStatsd();

// Add an express-statsd key that looks like http.post.api.hello.world for a HTTP POST to /api/hello/world URL
// See https://github.com/uber/express-statsd

module.exports = function statsdModule(filterFunction) {
  var defaultFilter = function defaultFilter(path, callback) {
    const uuidRegexp = /[-a-f\d]{36}/i;
    if (path.match(uuidRegexp)) {
      let parts = path.split(".");
      const cleanParts = parts.filter(function(part) {
        return !part.match(uuidRegexp);
      });
      path = cleanParts.join(".");
    }

    return callback(path);
  };

  var statsd = function statsd() {
    return function statsdFunc(req, res, next) {
      const hostname = process.env.NODE_STATSD_PREFIX || os.hostname();
      const env = process.env.NODE_ENV || "production";
      let method = req.method || "unknown_method";
      method = method.toLowerCase();
      let urlName = req.url || "unknown_url";
      let path = parse(urlName).pathname.toLowerCase();
      path = path.replace(/\//g, " ").trim().replace(/\s/g, ".");

      let filterFunc = defaultFilter;
      if (_.isFunction(filterFunction)) {
        filterFunc = filterFunction;
      }

      return filterFunc(path, function(filteredPath) {
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
