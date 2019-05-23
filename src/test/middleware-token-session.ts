import _ from "lodash";
import { assert } from "chai";
import { session } from "../index";
import express from "express";

const tokenSession = session.token;

describe("Token Session", function() {
  it("sets correct user", function(done) {
    const testToken = "abcd";
    const testUsername = "test-abcd";

    const req = {
      headers: {
        "x-tc-auth-token": testToken,
      },
    } as unknown as express.Request;

    const session = tokenSession([{
      token: testToken,
      username: testUsername,
    }]);

    return session(req, {} as express.Response, function() {
      assert.isObject(req.user);
      assert.equal(req.user.username, testUsername);
      assert.equal(req.user.token, testToken);
      return done();
    });
  });

  it("no user if no tokens were provided", function(done) {
    const req = {} as unknown as Express.Request;
    const session = tokenSession([{
      a: "b",
    }] as unknown as Parameters<typeof tokenSession>[0]);
    return session(req as express.Request, {} as express.Response, function() {
      assert.isTrue(!_.isObject(req.user));
      return done();
    });
  });
});
