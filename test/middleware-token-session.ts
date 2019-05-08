"use strict";

var _ = require("lodash");
var assert = require("chai").assert;

var tokenSession = require("../index").session.token;

describe("Token Session", function() {
  it("sets correct user", function(done) {
    var testToken = "abcd";
    var testUsername = "test-abcd";

    var req = {
      headers: {
        "x-tc-auth-token": testToken
      }
    };

    var session = tokenSession([{
      token: testToken,
      username: testUsername
    }]);

    return session(req, {}, function() {
      assert.isObject(req.user);
      assert.equal(req.user.username, testUsername);
      assert.equal(req.user.token, testToken);
      return done();
    });
  });

  it("no user if no tokens were provided", function(done) {
    var req = {};
    var session = tokenSession([{
      "a": "b"
    }]);
    return session(req, {}, function() {
      assert.isTrue(!_.isObject(req.user));
      return done();
    });
  });
});
