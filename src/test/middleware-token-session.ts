import _ from "lodash";
import { assert } from "chai";
import { session } from "../index"
import express from "express";

var tokenSession = session.token;

describe("Token Session", function() {
  it("sets correct user", function(done) {
    var testToken = "abcd";
    var testUsername = "test-abcd";

    var req = {
      headers: {
        "x-tc-auth-token": testToken
      }
    } as unknown as express.Request;

    var session = tokenSession([{
      token: testToken,
      username: testUsername
    }]);

    return session(req, {} as express.Response, function() {
      assert.isObject(req.user);
      assert.equal(req.user.username, testUsername);
      assert.equal(req.user.token, testToken);
      return done();
    });
  });

  it("no user if no tokens were provided", function(done) {
    var req = {} as unknown as Express.Request;;
    var session = tokenSession([{
      "a": "b"
    } as any]);
    return session(req as express.Request, {} as express.Response, function() {
      assert.isTrue(!_.isObject(req.user));
      return done();
    });
  });
});
