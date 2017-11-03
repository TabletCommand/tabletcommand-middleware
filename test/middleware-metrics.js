"use strict";

var assert = require("chai").assert;

var metrics = require("../index").metrics();

describe("Metrics Middleware", function() {
  it("removes uuid from end of paths", function(done) {
    const path = "api.user.daafe605-feac-add0-ad0e-89023d48deab";
    return metrics.defaultFilter(path, function(cleanPath) {
      assert.equal(cleanPath, "api.user");
      return done();
    });
  });

  it("removes uuid from middle of paths", function(done) {
    const path = "api.user.daafe605-feac-add0-ad0e-89023d48deab.info";
    return metrics.defaultFilter(path, function(cleanPath) {
      assert.equal(cleanPath, "api.user.info");
      return done();
    });
  });

  it("removes mongo id from middle of paths", function(done) {
    const path = "api.online.515a41a3e0387575cc939002.status";
    return metrics.defaultFilter(path, function(cleanPath) {
      assert.equal(cleanPath, "api.online.status");
      return done();
    });
  });

  it("skips paths without uuid", function(done) {
    const path = "api.user.profile";
    return metrics.defaultFilter(path, function(cleanPath) {
      assert.equal(cleanPath, "api.user.profile");
      return done();
    });
  });
});
