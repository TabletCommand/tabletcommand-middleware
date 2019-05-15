import _ from "lodash";
import { assert } from "chai";

import { routesCommon } from "../index";
import express from "express";

describe("routesCommon", function() {
  context("authDepartment", function() {
    it("isAllowed", function(done) {
      const reqObj = {
        department: {
          department: "Test Department",
          departmentId: "abc1234",
        },
      } as unknown as express.Request;
      return routesCommon.authDepartment(reqObj, {} as express.Response, function next(err) {
        assert.isUndefined(err, "Err should not be set");
        return done();
      });
    });

    it("isDenied", function(done) {
      return routesCommon.authDepartment({} as express.Request, {} as express.Response, function next(err) {
        assert.instanceOf(err, Error);
        assert.equal(err.status, 401);
        return done();
      });
    });
  });

  context("authSuper", function() {
    it("isAllowed", function(done) {
      const reqObj = {
        user: {
          nick: "verygoodguy",
          superuser: true,
        },
      } as unknown as express.Request;
      return routesCommon.authSuper(reqObj, {} as express.Response, function next(err) {
        assert.isUndefined(err, "Err should not be set");
        return done();
      });
    });
    it("isDenied", function(done) {
      return routesCommon.authSuper({}  as express.Request, {} as express.Response, function next(err) {
        assert.instanceOf(err, Error);
        assert.equal(err.status, 401);
        return done();
      });
    });
  });

  context("authUser", function() {
    const req = {
      user: {
        nick: "hello",
        active: true,
      },
    } as express.Request;

    it("isAllowed", function(done) {
      return routesCommon.authUser(req, {} as express.Response, function next(err) {
        assert.isUndefined(err, "Err should not be set");
        return done();
      });
    });

    it("isDenied", function(done) {
      const reqd = _.clone(req);
      reqd.user.active = false;
      return routesCommon.authUser(reqd, {} as express.Response, function next(err) {
        assert.instanceOf(err, Error);
        assert.equal(err.status, 401);
        return done();
      });
    });
  });
});
