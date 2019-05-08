"use strict";

import _ = require("lodash");
var assert = require("chai").assert;

var routesCommon = require("../index").routesCommon;

describe("routesCommon", function() {
  context("authDepartment", function() {
    it("isAllowed", function(done) {
      var reqObj = {
        department: {
          department: "Test Department",
          departmentId: "abc1234"
        }
      };
      return routesCommon.authDepartment(reqObj, {}, function next(err) {
        assert.isUndefined(err, "Err should not be set");
        return done();
      });
    });

    it("isDenied", function(done) {
      return routesCommon.authDepartment({}, {}, function next(err) {
        assert.instanceOf(err, Error);
        assert.equal(err.status, 401);
        return done();
      });
    });
  });

  context("authSuper", function() {
    it("isAllowed", function(done) {
      var reqObj = {
        user: {
          nick: "verygoodguy",
          superuser: true
        }
      };
      return routesCommon.authSuper(reqObj, {}, function next(err) {
        assert.isUndefined(err, "Err should not be set");
        return done();
      });
    });
    it("isDenied", function(done) {
      return routesCommon.authSuper({}, {}, function next(err) {
        assert.instanceOf(err, Error);
        assert.equal(err.status, 401);
        return done();
      });
    });
  });

  context("authUser", function() {
    var req = {
      user: {
        nick: "hello",
        active: true
      }
    };

    it("isAllowed", function(done) {
      return routesCommon.authUser(req, {}, function next(err) {
        assert.isUndefined(err, "Err should not be set");
        return done();
      });
    });

    it("isDenied", function(done) {
      var reqd = _.clone(req);
      reqd.user.active = false;
      return routesCommon.authUser(reqd, {}, function next(err) {
        assert.instanceOf(err, Error);
        assert.equal(err.status, 401);
        return done();
      });
    });
  });
});
