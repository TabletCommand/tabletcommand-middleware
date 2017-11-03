"use strict";

var assert = require("chai").assert;

var statsd = require("../index").statsd();

describe("StatsD middleware", function() {
  it("removes uuid from end of paths", function(done) {
    const path = "api.user.daafe605-feac-add0-ad0e-89023d48deab";
    return statsd.defaultFilter(path, function(cleanPath) {
      assert.equal(cleanPath, "api.user");
      return done();
    });
  });

  it("removes uuid from middle of paths", function(done) {
    const path = "api.user.daafe605-feac-add0-ad0e-89023d48deab.info";
    return statsd.defaultFilter(path, function(cleanPath) {
      assert.equal(cleanPath, "api.user.info");
      return done();
    });
  });

  it("skips paths without uuid", function(done) {
    const path = "api.user.profile";
    return statsd.defaultFilter(path, function(cleanPath) {
      assert.equal(cleanPath, "api.user.profile");
      return done();
    });
  });
});
